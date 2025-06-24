import { useState } from "react";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Modal from "@/components/Modal";

// 删除 mock 数据
// import { history } from "@/mocks/chat";

type Session = {
    id: string;
    title: string;
    content: string;
    image?: string;
    lastUsed?: number;
};

type HistoryProps = {
    visible: boolean;
    onClose: () => void;
    sessions: Session[];
    activeId: string;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
};

const History = ({ visible, onClose, sessions, activeId, onSelect, onNew, onDelete, onRename }: HistoryProps) => {
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // 搜索支持用户问题和AI回复内容
    const filtered = sessions
        // 只显示有用户消息的会话
        .filter(item => Array.isArray((item as any).messages) && (item as any).messages.some((m: any) => m.role === 'user' && m.content && m.content.trim()))
        .filter(item =>
            (item.title || "新的对话").toLowerCase().includes(search.toLowerCase()) ||
            (item.content || "").toLowerCase().includes(search.toLowerCase())
        );

    const handleEdit = (id: string, title: string) => {
        setEditingId(id);
        setEditingValue(title);
    };
    const handleEditFinish = (id: string) => {
        if (editingValue.trim()) {
            onRename(id, editingValue.trim());
        }
        setEditingId(null);
    };

    return (
        <>
        <div
            className={`relative shrink-0 w-[21.25rem] ml-2 pt-16 pb-24 bg-theme-on-surface-1 rounded-2xl 2xl:w-80 xl:absolute xl:top-0 xl:right-0 xl:bottom-0 xl:w-[21rem] xl:border-l xl:border-theme-stroke xl:rounded-none xl:transition-all md:w-full md:border-l-0 h-[calc(100svh-8.5rem)]` + (visible ? " xl:translate-x-0 xl:shadow-depth-1" : " xl:translate-x-full")}
        >
            <div className="absolute top-0 left-0 right-0 shadow-[inset_0_-0.0625rem_0_0_#EFEFEF] dark:shadow-[inset_0_-0.0625rem_0_0_#272b30] xl:flex xl:pr-3">
                <div className="relative xl:grow">
                    <input
                        className="w-full h-16 pl-14 pr-4 bg-transparent text-base-1s text-theme-primary outline-none placeholder:text-theme-tertiary md:text-[1rem]"
                        type="text"
                        placeholder="Search for asset"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        required
                        data-autofocus
                    />
                    <div className="absolute top-1/2 left-4 flex justify-center items-center w-9 h-9 -translate-y-1/2">
                        <Icon className="fill-theme-tertiary" name="search" />
                    </div>
                </div>
                <button
                    className="hidden relative w-6 h-6 shrink-0 self-center text-0 before:absolute before:inset-0.5 before:border-2 before:border-theme-secondary before:opacity-40 before:rounded-md xl:inline-block"
                    onClick={onClose}
                >
                    <Icon
                        className="fill-theme-secondary"
                        name="arrow-right-fat"
                    />
                </button>
            </div>
            <div className="pt-3 px-3 overflow-auto scrollbar-none scroll-smooth" style={{height: '100%', maxHeight: '100%'}}>
                <div className="space-y-2 md:space-y-0">
                        {filtered.map((item) => (
                        <div
                                className={`group flex items-center p-3 border border-transparent rounded-xl transition-all cursor-pointer tap-highlight-color hover:bg-theme-n-8 ${
                                activeId === item.id
                                    ? "!border-2 !border-theme-stroke shadow-[0_0_0.875rem_-0.25rem_rgba(0,0,0,0.05),0_2rem_3rem_-0.5rem_rgba(0,0,0,0.05)] !bg-transparent"
                                    : ""
                            }`}
                            key={item.id}
                                onClick={() => onSelect(item.id)}
                        >
                            <div className="grow">
                                    <div
                                        className="text-base-2 line-clamp-1 cursor-pointer"
                                        onDoubleClick={e => {
                                            e.stopPropagation();
                                            handleEdit(item.id, item.title || "");
                                        }}
                                    >
                                        {editingId === item.id ? (
                                            <input
                                                className="w-full bg-transparent border-b border-theme-stroke outline-none text-base-2 text-theme-primary"
                                                value={editingValue}
                                                autoFocus
                                                maxLength={30}
                                                onChange={e => setEditingValue(e.target.value)}
                                                onBlur={() => handleEditFinish(item.id)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleEditFinish(item.id);
                                                }}
                                            />
                                        ) : (
                                            item.title || "新的对话"
                                        )}
                                </div>
                                <div className="mt-1 text-[0.75rem] leading-[1rem] font-medium text-theme-secondary line-clamp-2">
                                    {item.content}
                                    {item.lastUsed && (
                                        <div className="mt-1 text-xs text-theme-tertiary">
                                            最后使用：{new Date(item.lastUsed).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {item.image && (
                                <div className="shrink-0 ml-3">
                                    <Image
                                        className="w-16 h-16 rounded-xl object-cover"
                                        src={item.image}
                                        width={64}
                                        height={64}
                                        alt=""
                                    />
                                </div>
                            )}
                                <button
                                    className="ml-2 opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full group-hover:opacity-100"
                                    style={{ background: 'transparent' }}
                                    onClick={e => { e.stopPropagation(); setDeleteId(item.id); }}
                                    title="删除会话"
                                >
                                    <Icon name="close" className="w-5 h-5 fill-theme-secondary" />
                                </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute left-0 right-0 bottom-0 p-6">
                    <button className="btn-secondary w-full" onClick={onNew}>New chat</button>
                </div>
            </div>
            <Modal
                visible={!!deleteId}
                onClose={() => setDeleteId(null)}
                classWrap="max-w-[22rem] rounded-2xl"
            >
                <div className="text-h4 mb-4 text-center">确认删除该会话？</div>
                <div className="flex space-x-4 mt-6">
                    <button
                        className="btn-secondary flex-1"
                        onClick={() => {
                            if (deleteId) onDelete(deleteId);
                            setDeleteId(null);
                        }}
                    >确认</button>
                    <button
                        className="btn-gray flex-1"
                        onClick={() => setDeleteId(null)}
                    >取消</button>
        </div>
            </Modal>
        </>
    );
};

export default History;
