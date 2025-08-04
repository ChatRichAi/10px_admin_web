import React, { useRef, useState } from "react";
import Modal from "@/components/Modal";
import Button from '@mui/material/Button';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { useColorMode } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CardShareModalProps {
  visible: boolean;
  onClose: () => void;
  content: string;
}

const CardShareModal: React.FC<CardShareModalProps> = ({ visible, onClose, content }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
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

  // 分享功能，默认复制图片到剪贴板
  const handleShare = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null, useCORS: true, scale: 2 });
    setSaving(false);
    canvas.toBlob(blob => {
      if (blob) {
        const item = new window.ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          setSnackbarOpen(true); // 复制成功后弹出提示
          setTimeout(() => setSnackbarOpen(false), 2000);
        });
      }
    });
  };

  // 聚合的LOGO组件
  const LogoComponent = () => (
    <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 卫星图标 */}
      <rect x="8" y="10" width="8" height="4" rx="2" fill="#0C68E9"/>
      <rect x="6" y="11" width="2" height="2" fill="#0C68E9"/>
      <rect x="16" y="11" width="2" height="2" fill="#0C68E9"/>
      <path d="M10 8l2-2M10 8l-2-2M14 8l2-2M14 8l-2-2" stroke="#0C68E9" strokeWidth="1.5"/>
      <path d="M10 16l2 2M10 16l-2 2M14 16l2 2M14 16l-2 2" stroke="#0C68E9" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="1" fill="white"/>
      {/* 10px AI文字 */}
      <text x="28" y="16" fill="#0C68E9" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">10px AI</text>
    </svg>
  );

  return (
    <Modal visible={visible} onClose={onClose} classWrap="max-w-[26rem] w-full p-0 bg-transparent border-none shadow-none">
      <div className="flex items-start gap-4">
        {/* 分享卡片 */}
        <div
          ref={cardRef}
          className="share-card w-full max-w-[375px] bg-white dark:bg-[#23272f] rounded-2xl shadow-lg p-0 relative flex flex-col"
          style={{ fontFamily: 'inherit', minHeight: 320, position: 'relative' }}
        >
          {/* 品牌标识区域 - 移到开头 */}
          <div className="px-6 py-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 relative overflow-hidden rounded-t-2xl">
            {/* 背景装饰 */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-indigo-400 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400 rounded-full blur-xl"></div>
            </div>
            <div className="text-center relative z-10">
              {/* LOGO区域 */}
              <div className="flex justify-center items-center mb-4">
                <div className="relative">
                  <LogoComponent />
                  {/* 装饰性元素 */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-80 animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60"></div>
                </div>
              </div>
              {/* 主标语 */}
              <div className="mb-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  自然语言挖掘交易机会
                </h2>
              </div>
              {/* 副标语 */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  AI驱动的智能投资分析平台
                </p>
              </div>
              {/* 时间戳 */}
              <div className="inline-flex items-center px-3 py-1 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full shadow-sm border border-white/20 dark:border-gray-600/20">
                <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {new Date().toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
          {/* AI回复内容（美化Markdown） */}
          <div className="text-body-1m text-theme-primary break-words px-6 py-6 leading-relaxed flex-1">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold my-4 text-gray-900 dark:text-gray-100" {...props} />, 
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold my-3 text-gray-900 dark:text-gray-100" {...props} />, 
                  h3: ({node, ...props}) => <h3 className="text-base font-bold my-2 text-gray-900 dark:text-gray-100" {...props} />, 
                  p: ({node, ...props}) => <p className="my-3 text-gray-700 dark:text-gray-300 leading-7" {...props} />, 
                  ul: ({node, ...props}) => <ul className="my-3 ml-6 space-y-2" {...props} />, 
                  ol: ({node, ...props}) => <ol className="my-3 ml-6 space-y-2" {...props} />, 
                  li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300 leading-6" {...props} />, 
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />, 
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />, 
                  blockquote: ({node, ...props}) => (
                    <blockquote className="my-4 pl-4 border-l-4 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r" {...props} />
                  ),
                  code: ({node, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className || !match;
                    return !isInline ? (
                      <div className="my-4">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-t px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          {match[1]}
                        </div>
                        <SyntaxHighlighter
                          style={isDark ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-b"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table: ({node, ...props}) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="ai-markdown-table min-w-full" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => <th className="ai-markdown-th px-3 py-2 text-left font-semibold" {...props} />, 
                  td: ({node, ...props}) => <td className="ai-markdown-td px-3 py-2" {...props} />, 
                  hr: ({node, ...props}) => <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />, 
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
          {/* 新增：海报、slogan、二维码、邀请码区域 */}
          <div className="px-6 pb-6">
            {/* 二维码和邀请码区域 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                {/* 二维码 */}
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-blue-200 dark:border-gray-600">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="6" height="6" fill="#0C68E9"/>
                        <rect x="15" y="3" width="6" height="6" fill="#0C68E9"/>
                        <rect x="3" y="15" width="6" height="6" fill="#0C68E9"/>
                        <rect x="15" y="15" width="6" height="6" fill="#0C68E9"/>
                        <rect x="9" y="9" width="6" height="6" fill="#0C68E9"/>
                        <rect x="3" y="9" width="2" height="2" fill="#0C68E9"/>
                        <rect x="19" y="9" width="2" height="2" fill="#0C68E9"/>
                        <rect x="9" y="3" width="2" height="2" fill="#0C68E9"/>
                        <rect x="9" y="19" width="2" height="2" fill="#0C68E9"/>
                      </svg>
                    </div>
                    {/* 装饰性圆点 */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">扫码体验</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">10px.xyz</div>
                  </div>
                </div>
                {/* 邀请码 */}
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">专属邀请码</div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-lg font-bold tracking-wider">AI2024</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">限时优惠</div>
                </div>
              </div>
            </div>
          </div>
          {snackbarOpen && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(34,34,34,0.92)',
                color: '#fff',
                padding: '16px 32px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                zIndex: 99,
                pointerEvents: 'none',
                minWidth: 200,
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
              }}
            >
              已复制到剪贴板
            </div>
          )}
        </div>
        {/* 分享、下载和关闭按钮 - 卡片外面 */}
        <div className="flex flex-col gap-3 pt-6">
          <Button
            variant="contained"
            onClick={handleShare}
            sx={{
              borderRadius: '12px',
              width: 44,
              height: 44,
              minWidth: 'unset',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(12, 104, 233, 0.3)',
              background: 'linear-gradient(135deg, #0C68E9 0%, #3B82F6 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #0B5FD9 0%, #2563EB 100%)',
                boxShadow: '0 6px 16px rgba(12, 104, 233, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            title="分享卡片"
          >
            <ShareIcon />
          </Button>
          <Button
            variant="outlined"
            onClick={handleSave}
            sx={{
              borderRadius: '12px',
              width: 44,
              height: 44,
              minWidth: 'unset',
              fontWeight: 600,
              border: '2px solid #E5E7EB',
              color: '#374151',
              background: '#fff',
              '&:hover': {
                border: '2px solid #0C68E9',
                color: '#0C68E9',
                background: '#F8FAFF',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            title="下载图片"
          >
            <DownloadIcon />
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '12px',
              width: 44,
              height: 44,
              minWidth: 'unset',
              fontWeight: 600,
              border: '2px solid #FECACA',
              color: '#DC2626',
              background: '#fff',
              '&:hover': {
                border: '2px solid #F87171',
                color: '#B91C1C',
                background: '#FEF2F2',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            title="关闭"
          >
            <CloseIcon />
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CardShareModal; 