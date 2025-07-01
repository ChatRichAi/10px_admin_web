import { useState, useEffect, useRef } from "react";
import Select from "@/components/Select";
import Message from "@/components/Message";
import Icon from "@/components/Icon";
import NewChat from "./NewChat";
import History from "./History";
import { fetchDifyMessage } from "./dify";
import Answer from "./Answer";
import Question from "./Question";
import React from "react";
import ReactMarkdown from "react-markdown";
import { useColorMode } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import Mermaid from '@/components/Mermaid';
import { motion } from 'framer-motion';
import rehypeRaw from "rehype-raw";
import html2canvas from "html2canvas";
import Modal from "@/components/Modal";
import remarkGfm from "remark-gfm";

const modes = [
    {
        id: "0",
        title: "美股模型",
    },
    {
        id: "1",
        title: "加密模型",
    },
    {
        id: "2",
        title: "A股模型",
    },
];

type ChatProps = {
    children?: React.ReactNode;
};

const DIFy_API_KEY = "app-x3QH5Msqa48sfOUFgiGsAcFJ"; // TODO: 替换为你的 Dify API Key，建议用环境变量

type Message = { role: 'user' | 'assistant'; content: string; thinking?: boolean };
type Session = {
    id: string;
    title: string;
    content: string;
    image?: string;
    messages: Message[];
    lastUsed?: number;
};

function loadSessions(): Session[] {
    try {
        const data = localStorage.getItem("chat_sessions");
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}
function saveSessions(sessions: Session[]) {
    try {
        localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    } catch {}
}

const Chat = ({ children }: ChatProps) => {
    const [mode, setMode] = useState(modes[0]);
    const [message, setMessage] = useState("");
    const [visible, setVisible] = useState(false);
    const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
    const [currentSessionId, setCurrentSessionId] = useState("");
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const [streamingReply, setStreamingReply] = useState<string | null>(null);
    const [streamingThinking, setStreamingThinking] = useState<string | null>(null);
    const [thinkingDone, setThinkingDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const messageListRef = useRef<HTMLDivElement>(null);
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [historyVisible, setHistoryVisible] = useState(true);
    const [historyShouldRender, setHistoryShouldRender] = useState(false);
    const [mounted, setMounted] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [shareModalIdx, setShareModalIdx] = useState<number | null>(null);
    const MAX_RETRY = 2;
    const [retrying, setRetrying] = useState(false);

    // 当前会话
    const currentSession = sessions.find((s: Session) => s.id === currentSessionId);
    const messages = currentSession?.messages || [];

    // 持久化 sessions
    useEffect(() => {
        saveSessions(sessions);
    }, [sessions]);

    // 新建会话
    const handleNewSession = () => {
        setCurrentSessionId(''); // 清空当前会话ID，进入新建状态，但不立即加入sessions
    };

    // 切换会话
    const handleSelectSession = (id: string) => {
        // 置顶
        const idx = sessions.findIndex(s => s.id === id);
        let updatedSessions = sessions;
        if (idx > 0) {
            const selected = sessions[idx];
            const rest = sessions.filter((s, i) => i !== idx);
            updatedSessions = [selected, ...rest];
        }
        // 更新lastUsed
        updatedSessions = updatedSessions.map(s => s.id === id ? { ...s, lastUsed: Date.now() } : s);
        setSessions(updatedSessions);
        setCurrentSessionId(id);
    };

    // 删除会话
    const handleDeleteSession = (id: string) => {
        let newSessions = sessions.filter(s => s.id !== id);
        let newCurrentId = currentSessionId;
        if (id === currentSessionId) {
            if (newSessions.length > 0) {
                newCurrentId = newSessions[0].id;
            } else {
                const newSession: Session = {
                    id: uuidv4(),
                    title: "",
                    content: "",
                    image: undefined,
                    messages: [],
                };
                newSessions = [newSession];
                newCurrentId = newSession.id;
            }
        }
        setSessions(newSessions);
        setCurrentSessionId(newCurrentId);
    };

    // 重命名会话
    const handleRenameSession = (id: string, newTitle: string) => {
        setSessions(sessions.map(s =>
            s.id === id ? { ...s, title: newTitle } : s
        ));
    };

    // 发送消息
    const handleSend = async () => {
        if (!message.trim()) return;
        setSuggestions([]);
        setLoading(true);
        let retryCount = 0;
        let lastError: any = null;
        setRetrying(false);
        while (retryCount <= MAX_RETRY) {
            try {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                const controller = new AbortController();
                abortControllerRef.current = controller;
                let userMsg: Message = { role: 'user', content: message };
                let updatedSessions = sessions;
                let sessionId = currentSessionId;
                if (!currentSessionId) {
                    const newSession: Session = {
                        id: uuidv4(),
                        title: '',
                        content: '',
                        image: undefined,
                        messages: [userMsg],
                        lastUsed: Date.now(),
                    };
                    updatedSessions = [newSession, ...sessions];
                    sessionId = newSession.id;
                    setCurrentSessionId(sessionId);
                } else {
                    updatedSessions = sessions.map((s: Session) => {
            if (s.id !== currentSessionId) return s;
            return {
                ...s,
                messages: s.messages.filter(m =>
                    m.role === 'user' || (m.role === 'assistant' && m.content && m.content.trim()) || (m.thinking && m.content && m.content.trim())
                )
            };
        });
        updatedSessions = updatedSessions.map((s: Session) =>
            s.id === currentSessionId
                ? { ...s, messages: [...s.messages, userMsg], lastUsed: Date.now() }
                : s
        );
                }
                const idx = updatedSessions.findIndex(s => s.id === sessionId);
        if (idx > 0) {
            const selected = updatedSessions[idx];
            const rest = updatedSessions.filter((s, i) => i !== idx);
            updatedSessions = [selected, ...rest];
        }
        const thinkingMsg: Message = { role: 'assistant', content: '', thinking: true };
        const streamingFinalMsg: Message & { streaming?: boolean } = { role: 'assistant', content: '', streaming: true };
        updatedSessions = updatedSessions.map((s: Session) =>
                    s.id === sessionId
                ? { ...s, messages: [...s.messages, thinkingMsg, streamingFinalMsg] }
                : s
        );
        setSessions(updatedSessions);
        setMessage("");
            let lastThinkingRaw = '';
            let lastFinalRaw = '';
            let thinkingText = '';
            let finalText = '';
            const history = messages.slice(-10).map(m =>
                m.role === 'user'
                    ? `用户：${m.content}`
                    : `AI：${m.content}`
            ).join('\n');
            const promptWithHistory =
                (history ? history + '\n' : '') + `用户：${message}` +
                    '\n\n请在回答后额外给出3个用户可能会继续追问的相关问题，格式如下：\n【推荐问题】\n1. xxx\n2. xxx\n3. xxx' +
                    '\n\n请用风趣、易于理解但又不失专业性的方式回答用户。表达要轻松幽默、善用比喻和Emoji，但核心内容必须准确、专业，确保用户既能轻松看懂，也能获得权威解读。' +
                    '\n\n注意：请勿在任何回答或思考内容中提及你调用的工具、API、代码、数据源等实现细节，如确需提及统一表述为"<img src=\'/favicon.ico\' style=\'width:1em;height:1em;vertical-align:-0.15em;display:inline\'/>10px"。';
            const reply = await fetchDifyMessage(promptWithHistory, DIFy_API_KEY, (partial) => {
                const { thinking, final } = splitThinkingAndFinal(partial);
                if (thinking) {
                        // 每次都覆盖为最新的全部推理内容
                        setStreamingThinking(cleanThinkingText(removeHtmlTags(thinking)));
                    // 实时更新最后一条thinking消息内容
                    setSessions(prevSessions => prevSessions.map(s =>
                            s.id === sessionId
                            ? {
                                ...s,
                                messages: s.messages.map((m, i, arr) =>
                                    m.thinking && i === arr.length - 2 // 倒数第二条是thinking
                                            ? { ...m, content: cleanThinkingText(removeHtmlTags(thinking)) }
                                        : m
                                )
                            }
                            : s
                    ));
                }
                if (final) {
                    lastFinalRaw = final;
                        finalText = final;
                    setSessions(prevSessions => prevSessions.map(s =>
                            s.id === sessionId
                            ? {
                                ...s,
                                messages: s.messages.map((m, i, arr) =>
                                    (m as any).streaming && i === arr.length - 1 // 最后一条是流式正文
                                        ? { ...m, content: finalText }
                                        : m
                                )
                            }
                            : s
                    ));
                }
                }, controller.signal);
            setSessions(prevSessions => prevSessions.map(s => {
                    if (s.id !== sessionId) return s;
                let newTitle = s.title;
                let newContent = s.content;
                const firstUserMsg = s.messages.find(m => m.role === 'user');
                const userQuestion = firstUserMsg ? firstUserMsg.content : userMsg.content;
                if (!s.title && userQuestion) {
                    newTitle = userQuestion.split(/[。.!?\n]/)[0].slice(0, 20) || userQuestion.slice(0, 20) || '新的对话';
                }
                if (!s.content && finalText) {
                    newContent = finalText.slice(0, 40);
                }
                return {
                    ...s,
                    title: newTitle,
                    content: newContent,
                    messages: s.messages.map((m, i, arr) =>
                        (m as any).streaming && i === arr.length - 1
                            ? { role: 'assistant', content: finalText }
                            : m
                    )
                };
            }));
            // 新增：保存推荐问题
            setSuggestions(reply.suggestions || []);
                setLoading(false);
                setRetrying(false);
                abortControllerRef.current = null;
                return;
        } catch (e: any) {
                lastError = e;
                if (e && e.message && (e.message.includes('中断') || e.message.includes('Abort'))) {
                    // 主动中断不重试
                    setLoading(false);
                    setRetrying(false);
                    break;
                } else if (retryCount < MAX_RETRY) {
                    setRetrying(true);
                    retryCount++;
                    await new Promise(res => setTimeout(res, 800)); // 重试前稍作延迟
                    continue;
                } else {
                    setLoading(false);
                    setRetrying(false);
                    break;
                }
            }
        }
        // 最终失败时友好提示
        let errorMsg = '';
        if (lastError && lastError.message && (lastError.message.includes('中断') || lastError.message.includes('Abort'))) {
            errorMsg = '对话已终止';
        } else {
            errorMsg = 'AI 回复失败，请检查网络或稍后重试。';
            if (lastError && lastError.message) errorMsg += `\n${lastError.message}`;
        }
            setSessions(prevSessions => prevSessions.map(s =>
                s.id === currentSessionId
                    ? { ...s, messages: [...s.messages, { role: 'assistant', content: errorMsg }] }
                    : s
            ));
            setSuggestions([]);
    };

    // 过滤 HTML 标签
    function removeHtmlTags(str: string) {
        return str.replace(/<[^>]+>/g, '');
    }

    // 优化分离思考内容和正文，提取所有 <details>...</details> 和 [THINK]，并递归剥离所有推理/分析/思考/流程/步骤等内容
    function splitThinkingAndFinal(text: string) {
        // 匹配所有 <details>...</details>
        const detailsRegex = /<details[\s\S]*?<summary>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi;
        let thinkingArr: string[] = [];
        let match;
        let textWithoutDetails = text;
        while ((match = detailsRegex.exec(text)) !== null) {
            thinkingArr.push(match[1].trim());
        }
        // 移除所有 <details>...</details>
        textWithoutDetails = textWithoutDetails.replace(detailsRegex, '').trim();
        // 匹配所有 [THINK]...[/THINK]
        const thinkRegex = /\[THINK\]([\s\S]*?)\[\/THINK\]/gi;
        let thinkMatch;
        while ((thinkMatch = thinkRegex.exec(textWithoutDetails)) !== null) {
            thinkingArr.push(thinkMatch[1].trim());
        }
        // 移除所有 [THINK]...[/THINK]
        textWithoutDetails = textWithoutDetails.replace(thinkRegex, '').trim();

        // 递归剥离所有推理/分析/思考/流程/步骤等前缀段落
        // 支持多行、冒号、点号、换行等
        const flowPrefixRegex = /^(\s*(分析流程|推理过程|思考过程|分析步骤|推理步骤|分析思路|推理思路|分析|推理|思考|流程|步骤|首先|需要先|请先|优先|失败则|如需|如果.*?，|需先|务必|务必先|务必首先|务必需要|务必请先|务必优先|务必失败则|务必如需|务必如果.*?，)[：:.。\n\r\-\s]*[\s\S]*?)(?=\n{2,}|$)/i;
        let found = true;
        while (found) {
            const flowMatch = textWithoutDetails.match(flowPrefixRegex);
            if (flowMatch) {
                thinkingArr.push(flowMatch[1].trim());
                textWithoutDetails = textWithoutDetails.replace(flowPrefixRegex, '').trim();
            } else {
                found = false;
            }
        }
        return {
            thinking: thinkingArr.join('\n\n'),
            final: textWithoutDetails
        };
    }

    // 工具函数：过滤无意义的思考提示
    function cleanThinkingText(text: string) {
        return text.replace(/^Thinking\s*\.\.\.|^思考中\s*\.\.\./i, '').trim();
    }

    // 自动滚动到底部（使用requestAnimationFrame确保内容渲染后滚动）
    const scrollToBottom = () => {
        if (messageListRef.current) {
            requestAnimationFrame(() => {
                messageListRef.current!.scrollTop = messageListRef.current!.scrollHeight;
            });
        }
    };
    // 监听用户滚动，用户手动滚动时关闭自动滚动
    const handleScroll = () => {
        if (!messageListRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
        // 判断是否在底部（允许2px误差）
        if (scrollHeight - scrollTop - clientHeight < 2) {
            setIsAutoScroll(true);
        } else {
            setIsAutoScroll(false);
        }
    };
    // 每次内容变化都自动滚动到底部，只要isAutoScroll为true
    useEffect(() => {
        if (isAutoScroll) {
            scrollToBottom();
        }
    }, [messages, streamingThinking, loading, isAutoScroll]);
    // AI回复结束后恢复自动滚动
    useEffect(() => {
        if (!loading) setIsAutoScroll(true);
    }, [loading]);
    // 用户主动操作时恢复自动滚动
    const handleSendWithScroll = async () => {
        setIsAutoScroll(true);
        await handleSend();
    };
    const handleSelectSessionWithScroll = (id: string) => {
        setIsAutoScroll(true);
        handleSelectSession(id);
        // 切换推荐问题为新会话的推荐问题
        const session = sessions.find(s => s.id === id);
        if (session && Array.isArray(session.messages)) {
            // 查找最后一条assistant消息中的推荐问题
            const lastAssistant = [...session.messages].reverse().find(m => m.role === 'assistant' && m.content && m.content.includes('【推荐问题】'));
            if (lastAssistant) {
                // 提取推荐问题
                const match = lastAssistant.content.match(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/);
                if (match) {
                    const suggestBlock = match[1];
                    const newSuggestions = suggestBlock.split(/\n|\r/)
                        .map(line => line.replace(/^\d+\.\s*/, '').trim())
                        .filter(line => line && !/^【/.test(line));
                    setSuggestions(newSuggestions);
                } else {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    // AI回复正文后自动收起思考气泡
    useEffect(() => {
        if (thinkingDone) setStreamingThinking(null);
    }, [thinkingDone]);

    // 控制动画和彻底隐藏
    useEffect(() => {
        if (historyVisible) {
            setHistoryShouldRender(true);
        } else {
            // 动画时长与CSS一致
            const timer = setTimeout(() => setHistoryShouldRender(false), 350);
            return () => clearTimeout(timer);
        }
    }, [historyVisible]);

    useEffect(() => { setMounted(true); }, []);

    // 暂停/中断AI回复
    const handlePause = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setLoading(false);
    };

    // 新增卡片分享弹窗组件
    function CardShareModal({ visible, onClose, content }: { visible: boolean; onClose: () => void; content: string }) {
        const { colorMode } = useColorMode();
        const isDark = colorMode === "dark";
        const [saving, setSaving] = useState(false);
        const cardRef = useRef<HTMLDivElement>(null);

        const handleSave = async () => {
            if (!cardRef.current) return;
            setSaving(true);
            const canvas = await html2canvas(cardRef.current, { backgroundColor: null, useCORS: true, scale: 2 });
            setSaving(false);
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `10px-ai-card.png`;
            link.click();
        };

        return (
            <Modal visible={visible} onClose={onClose} classWrap="max-w-[26rem] w-full p-0 bg-transparent border-none shadow-none">
                <div className="flex flex-col items-center">
                    <div
                        ref={cardRef}
                        className="w-full max-w-[375px] bg-white dark:bg-[#23272f] rounded-2xl shadow-lg p-0 relative flex flex-col"
                        style={{ fontFamily: 'inherit', minHeight: 320 }}
                    >
                        {/* 海报头图 */}
                        <img src="/images/bg-upgrade.jpg" alt="海报头图" className="w-full h-28 object-cover rounded-t-2xl" style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                        {/* 品牌区 */}
                        <div className="flex items-center mb-4 px-6 mt-2">
                            <img
                                src="/favicon.ico"
                                alt="logo"
                                style={{
                                    width: 28,
                                    height: 28,
                                    marginRight: 8,
                                    display: 'block',
                                }}
                            />
                            <span className="text-lg font-bold text-[#0C68E9]">10px AI</span>
                            <span className="ml-auto text-xs text-theme-tertiary">{new Date().toLocaleString()}</span>
                        </div>
                        {/* AI回复内容（美化Markdown） */}
                        <div className="text-base text-theme-primary break-words px-6 pb-4 leading-relaxed flex-1">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-base font-bold my-2" {...props} />,
                                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1.5" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                    table: ({node, ...props}) => <table className="ai-markdown-table my-3" {...props} />,
                                    th: ({node, ...props}) => <th className="ai-markdown-th px-2 py-1" {...props} />,
                                    td: ({node, ...props}) => <td className="ai-markdown-td px-2 py-1" {...props} />,
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                        {/* 品牌标识放在卡片内容区底部 */}
                        <div className="flex justify-center items-center pb-4 pt-2 text-xs text-[#0C68E9] opacity-80 select-none pointer-events-none font-bold">
                            <img src="/favicon.ico" alt="logo" style={{ width: 18, height: 18, display: 'inline', verticalAlign: '-0.3em', marginRight: 4 }} />10px AI
                        </div>
                    </div>
                    <button
                        className={
                            "mt-6 px-6 py-2 rounded-full font-bold text-base shadow transition " +
                            (isDark
                                ? "bg-white text-[#0C68E9] hover:bg-theme-brand hover:text-white"
                                : "bg-theme-primary text-white hover:bg-theme-brand")
                        }
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '保存中...' : '保存图片'}
                    </button>
                </div>
            </Modal>
        );
    }

    // 更通用的移动端检测
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;

    return (
        <div className="relative flex h-[calc(100svh-8.5rem)] xl:overflow-hidden xl:rounded-2xl md:h-[calc(100svh-11rem)] md:-mb-2">
            {/* 隐藏/显示历史按钮，右上角，仅在历史区彻底隐藏后再显示 */}
            {!historyVisible && !historyShouldRender && (
                <button
                    className="absolute z-20 right-2 top-2 w-8 h-8 flex items-center justify-center rounded-full bg-theme-on-surface-1 border border-theme-stroke shadow hover:bg-theme-n-8 transition-colors text-2xl"
                    style={{ opacity: 0.85 }}
                    onClick={() => setHistoryVisible(v => !v)}
                    title="显示历史对话"
                >
                    {/* 菜单 SVG */}
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-white transition-colors">
                        <line x1="4" y1="7" x2="20" y2="7" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="17" x2="20" y2="17" />
                    </svg>
                </button>
            )}
            {/* 历史区显示时的按钮 */}
            {historyVisible && (
                <button
                    className="absolute z-20 right-2 top-2 w-8 h-8 flex items-center justify-center rounded-full bg-theme-on-surface-1 border border-theme-stroke shadow hover:bg-theme-n-8 transition-colors text-2xl"
                    style={{ opacity: 0.85 }}
                    onClick={() => setHistoryVisible(v => !v)}
                    title="隐藏历史对话"
                >
                    {/* 闭眼 SVG */}
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-white transition-colors">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06" />
                        <path d="M1 1l22 22" />
                        <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                    </svg>
                </button>
            )}
            {/* 主对话区，历史对话隐藏时占满全宽，Framer Motion 极致丝滑动画，首次加载也有动画 */}
            <motion.div
                className="card flex flex-col w-full"
                animate={{ maxWidth: historyShouldRender ? (historyVisible ? 'calc(100% - 21.75rem)' : '100%') : '100%', minWidth: historyShouldRender ? (historyVisible ? 'calc(100% - 21.75rem)' : '100%') : '100%' }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{ minWidth: 0 }}
            >
                <div className="flex mb-6 md:mb-4">
                    <Select
                        className="min-w-[8.5rem]"
                        value={mode}
                        onChange={setMode}
                        items={modes}
                    />
                </div>
                <div ref={messageListRef} className="flex grow flex-col overflow-auto -mx-6 px-12 py-4 space-y-6 3xl:px-6 3xl:py-0" onScroll={handleScroll}>
                    {messages.length === 0 && !loading && (children ? children : <NewChat />)}
                    {(() => {
                        // 找到最后一条用户消息的下标
                        const lastUserIdx = (() => {
                            let idx = -1;
                            messages.forEach((m, i) => { if (m.role === 'user') idx = i; });
                            return idx;
                        })();
                        // 判断是否需要在该位置插入骨架屏
                        let needSkeleton = false;
                        if (lastUserIdx !== -1 && loading) {
                            // 查找下一个AI相关消息
                            const nextMsg = messages[lastUserIdx + 1];
                            const nextNextMsg = messages[lastUserIdx + 2];
                            const isThinkingEmpty = nextMsg && nextMsg.thinking && (!nextMsg.content || !nextMsg.content.trim());
                            const isAssistantEmpty = nextNextMsg && nextNextMsg.role === 'assistant' && (!nextNextMsg.content || !nextNextMsg.content.trim());
                            // 只有在思考和AI回复都没有内容时才显示骨架屏
                            if (isThinkingEmpty && (!nextNextMsg || isAssistantEmpty)) {
                                needSkeleton = true;
                            } else {
                                needSkeleton = false;
                            }
                        }
                        // 渲染消息，用户消息后插入骨架屏
                        return messages.map((msg, idx) => {
                            const msgNode = (() => {
                                if (msg.role === 'user') {
                                    return (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                                            <div style={isDark ? {
                                                background: 'rgba(255,255,255,0.08)',
                                                color: '#fff',
                                                fontWeight: 700,
                                                borderRadius: 18,
                                                padding: '14px 20px',
                                                maxWidth: 480,
                                                textAlign: 'left',
                                                border: '1px solid #333',
                                                boxShadow: '0 1px 4px #111',
                                                marginRight: 8,
                                                fontSize: 16,
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-line',
                                            } : {
                                                background: '#f4f4f4',
                                                color: '#111',
                                                fontWeight: 700,
                                                borderRadius: 18,
                                                padding: '14px 20px',
                                                maxWidth: 480,
                                                textAlign: 'left',
                                                marginRight: 8,
                                                fontSize: 16,
                                                boxShadow: 'none',
                                                border: 'none',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-line',
                                            }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                } else if (msg.thinking) {
                                    if (!msg.content) return null;
                                    // 判断AI回复是否已完成（即后面有assistant消息且有内容）
                                    const hasFinalAfter = messages.slice(idx + 1).some(m => m.role === 'assistant' && m.content && m.content.trim());
                                    return <CollapsibleThinkingBubble key={idx} content={msg.content} openDefault={!hasFinalAfter} forceCollapseKey={hasFinalAfter ? idx : undefined} />;
                                } else if (msg.role === 'assistant') {
                                    if (!msg.content) return null;
                                    return (
                                        <div
                                            key={idx}
                                            style={{ position: 'relative' }}
                                            data-ai-reply-idx={idx}
                                            className={isMobile ? 'bg-white rounded-2xl shadow-md px-4 py-3 my-3' : ''}
                                        >
                                            <Answer content={filterThoughtPrefix(maskToolNames(msg.content.replace(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/, '').trim()))} />
                                            {/* 分享按钮 */}
                                            <button
                                                onClick={() => setShareModalIdx(idx)}
                                                className="absolute right-9 bottom-2 w-5 h-5 flex items-center justify-center p-0 m-0 border-none bg-transparent hover:text-theme-primary text-theme-secondary dark:text-theme-tertiary transition"
                                                title="分享"
                                                style={{ zIndex: 10 }}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                                                    <polyline points="16 6 12 2 8 6" />
                                                    <line x1="12" y1="2" x2="12" y2="15" />
                                                </svg>
                                            </button>
                                            {/* 复制icon按钮 */}
                                            <button
                                                onClick={() => navigator.clipboard.writeText(stripHtmlTags(msg.content))}
                                                className="absolute right-2 bottom-2 w-5 h-5 flex items-center justify-center p-0 m-0 border-none bg-transparent hover:text-theme-primary text-theme-secondary dark:text-theme-tertiary transition"
                                                title="复制回复"
                                                style={{ zIndex: 10 }}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                            </button>
                                            {/* 推荐问题文本和按钮，统一用 suggestions 渲染 */}
                                            {idx === messages.length - 1 && suggestions.length > 0 && (
                                                <div
                                                    className={isMobile ? 'w-full mt-4 bg-white rounded-xl shadow px-3 py-2' : 'w-full px-12'}
                                                    style={isMobile ? { marginTop: 16 } : { marginTop: 32 }}
                                                >
                                                    <div className="mb-2 font-semibold text-theme-secondary">【推荐问题】</div>
                                                    <div className={isMobile ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
                                                        {suggestions.map((s, i) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => setMessage(stripHtmlTags(s))}
                                                                className={
                                                                    isMobile
                                                                        ? 'w-full block rounded-full border border-theme-secondary text-theme-secondary bg-white dark:bg-[#23272f] hover:bg-theme-secondary hover:text-white transition-colors duration-150 text-base font-medium shadow-sm mb-2'
                                                                        : 'px-4 py-1 rounded-full border border-theme-secondary text-theme-secondary bg-white dark:bg-[#23272f] hover:bg-theme-secondary hover:text-white transition-colors duration-150 text-sm font-medium shadow-sm'
                                                                }
                                                                style={isMobile ? { whiteSpace: 'normal' } : { whiteSpace: 'nowrap' }}
                                                            >
                                                                {stripHtmlTags(s)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                } else {
                                    return null;
                                }
                            })();
                            if (idx === lastUserIdx && needSkeleton) {
                                return [msgNode, <ChatSkeleton key="skeleton" />];
                            }
                            return msgNode;
                        });
                    })()}
                </div>
                <Message
                    className="shrink-0 mt-6 md:mt-4"
                    value={message}
                    onChange={(e: any) => setMessage(e.target.value)}
                    autoFocus
                    logo
                    placeholder="提示：输入交易对和想分析的指标或因子"
                    onSend={handleSendWithScroll}
                    loading={loading}
                    onPause={handlePause}
                />
                <button
                    style={{ display: 'none' }}
                    onClick={handleSendWithScroll}
                    aria-label="发送"
                />
            </motion.div>
            {/* 历史对话区，平滑滑动动画，动画结束后彻底隐藏 */}
            {historyShouldRender && (
                <div
                    className={
                        `transition-all duration-350 xl:transition-transform xl:duration-350 xl:ease-in-out ` +
                        (historyVisible ? 'translate-x-0 opacity-100' : 'xl:translate-x-full opacity-0')
                    }
                    style={{ width: '21.75rem', minWidth: '21.75rem', maxWidth: '21.75rem' }}
                >
                    <History
                        visible={historyVisible}
                        onClose={() => setHistoryVisible(false)}
                        sessions={sessions}
                        activeId={currentSessionId}
                        onSelect={handleSelectSessionWithScroll}
                        onNew={handleNewSession}
                        onDelete={handleDeleteSession}
                        onRename={handleRenameSession}
                    />
                </div>
            )}
            {/* 渲染分享弹窗 */}
            {shareModalIdx !== null && (
                <CardShareModal
                    visible={shareModalIdx !== null}
                    onClose={() => setShareModalIdx(null)}
                    content={filterThoughtPrefix(maskToolNames(messages[shareModalIdx]?.content.replace(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/, '').trim() || ''))}
                />
            )}
            {/* 在UI中显示重试提示 */}
            {retrying && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-theme-primary text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-bold animate-pulse">
                    AI连接异常，正在重试...
                </div>
            )}
        </div>
    );
};

// CollapsibleThinkingBubble支持外部控制折叠状态
function CollapsibleThinkingBubble({ content, openDefault, forceCollapseKey }: { content: string; openDefault?: boolean; forceCollapseKey?: any }) {
    const [open, setOpen] = useState(openDefault || false);
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    // 当forceCollapseKey变化时自动折叠
    useEffect(() => {
        if (forceCollapseKey !== undefined) setOpen(false);
    }, [forceCollapseKey]);
    return (
        <div
            style={{
                background: isDark ? "#23272f" : "#f8f8f8",
                color: isDark ? "#bbb" : "#888",
                borderRadius: 8,
                padding: 12,
                marginBottom: 4,
                fontSize: 14,
                maxWidth: 480,
                border: isDark ? "1px solid #333" : "none",
            }}
        >
            <div
                style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}
                onClick={() => setOpen((o) => !o)}
            >
                <span
                    style={{
                        display: "inline-block",
                        transition: "transform 0.2s",
                        transform: open ? "rotate(90deg)" : "rotate(0deg)",
                        marginRight: 6,
                    }}
                >
                    ▶
                </span>
                <b>AI 思考（点击展开/收起）</b>
            </div>
            {open && (
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                    <ReactMarkdown
                        components={{
                            code(props: any) {
                                const {inline, className, children} = props;
                                const match = /language-(\w+)/.exec(className || '');
                                if (!inline && match && match[1] === 'mermaid') {
                                    return <Mermaid chart={String(children)} />;
                                }
                                return <code className={className} {...props}>{children}</code>;
                            }
                        }}
                    >{filterThoughtPrefix(maskToolNames(content))}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}

// 对话气泡风格骨架屏组件
function ChatSkeleton() {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
            {/* 头像骨架 */}
            <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse mr-4" />
            {/* 气泡骨架 */}
            <div className="flex flex-col space-y-2">
                <div className="w-40 h-4 rounded bg-gray-300 dark:bg-gray-700 animate-pulse" />
                <div className="w-64 h-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="w-32 h-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
        </div>
    );
}

function stripHtmlTags(str: string) {
    return str.replace(/<[^>]+>/g, '');
}

// 将所有"贾维斯工具箱🧰"文本和敏感方法名统一替换为"10px"并在前面加 favicon.ico 图标
function maskToolNames(text: string) {
    // 先替换"贾维斯工具箱🧰"
    let result = text.replace(/贾维斯工具箱🧰/g, "<img src='/favicon.ico' style='width:1em;height:1em;vertical-align:-0.15em;display:inline'/>10px");
    // 再替换敏感方法名
    result = result.replace(
        /(kline_get|get_kline|option_chain_get|get_option_chain|yahoo_finance_news|get_news_sentiment|quote_get|get_quote|financial_summary_get|get_financial_summary|news_sentiment|get_news_sentiment|symbol='[A-Z]+'|interval='[a-z0-9]+'|参数：.*?')/gi,
        "<img src='/favicon.ico' style='width:1em;height:1em;vertical-align:-0.15em;display:inline'/>10px"
    );
    return result;
}

// 过滤Thought/Thinking/思考中等前缀和相关内容
function filterThoughtPrefix(text: string) {
    return text
        .replace(/^(Thought:?|Thinking:?|Thinking\s*\.*|思考中:?|思考中\s*\.*)/i, '')
        .replace(/^\s*[:：.。]+/, '') // 去除多余的冒号、点号
        .replace(/^(\[.*?\])?\s*/i, '') // 去除如[THINK]等标签
        .replace(/^(\*|—|——|\-|\.)+/, '') // 去除开头的分隔符
        .trim();
}

export default Chat;
