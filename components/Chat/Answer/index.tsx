import { useColorMode } from "@chakra-ui/react";
import Image from "@/components/Image";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import dynamic from 'next/dynamic';
import rehypeRaw from 'rehype-raw';

type AnswerProps = {
    content: any;
    image?: string;
    children?: React.ReactNode;
};

const Mermaid = dynamic(() => import('@/components/Mermaid'), { ssr: false });

const Answer = ({ content, image, children }: AnswerProps) => {
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";

    return (
        <div className="flex">
            <div className="shrink-0 mr-4">
                <Image
                    className="w-8 h-8 rounded-full opacity-100"
                    src={
                        isDarkMode
                            ? "/images/message-logo-light.svg"
                            : "/images/message-logo-dark.svg"
                    }
                    width={32}
                    height={32}
                    alt=""
                />
            </div>
            <div className="grow self-center">
                <div className="text-body-1m space-y-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (!inline && match && match[1] === 'mermaid') {
                          return <Mermaid chart={String(children)} />;
                        }
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={isDarkMode ? oneDark : oneLight}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      },
                      table({node, ...props}) {
                        return <table className="ai-markdown-table" {...props} />;
                      },
                      th({node, ...props}) {
                        return <th className="ai-markdown-th" {...props} />;
                      },
                      td({node, ...props}) {
                        return <td className="ai-markdown-td" {...props} />;
                      },
                    }}
                  >{content}</ReactMarkdown>
                </div>
                {image && (
                    <div className="mt-4">
                        <Image
                            className="w-full rounded-[1.25rem]"
                            src={image}
                            width={708}
                            height={320}
                            alt=""
                        />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export default Answer;
