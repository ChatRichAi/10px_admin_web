import { ChangeEventHandler } from "react";
import { useColorMode } from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import CircularProgress from '@mui/material/CircularProgress';

type MessageProps = {
    className?: string;
    value: any;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    logo?: boolean;
    autoFocus?: boolean;
    onSend?: () => void;
    loading?: boolean;
    onPause?: () => void;
};

const Message = ({
    className,
    value,
    onChange,
    placeholder,
    logo,
    autoFocus,
    onSend,
    loading,
    onPause,
}: MessageProps) => {
    const { colorMode, setColorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend && onSend();
        }
    };

    return (
        <div
            className={`flex items-center p-1 pl-4 min-h-[3rem] bg-theme-n-8 rounded-3xl transition-all hover:shadow-[inset_0_0_0_0.0625rem_#EFEFEF] hover:bg-theme-on-surface-1 dark:hover:shadow-[inset_0_0_0_0.0625rem_#272B30] md:pl-3 ${
                value !== ""
                    ? "!shadow-[inset_0_0_0_0.0625rem_#0C68E9] !bg-theme-on-surface-1"
                    : ""
            } ${className || ""}`}
        >
            {logo && (
                <div className="shrink-0 mr-4 md:mr-3">
                    <Image
                        className="w-6 opacity-100"
                        src={
                            isDarkMode
                                ? "/images/message-logo-light.svg"
                                : "/images/message-logo-dark.svg"
                        }
                        width={24}
                        height={24}
                        alt=""
                    />
                </div>
            )}
            <TextareaAutosize
                className="w-full py-2 bg-transparent text-body-1m text-theme-primary outline-none resize-none placeholder:text-theme-tertiary md:text-[1rem]"
                maxRows={5}
                autoFocus={autoFocus}
                value={value}
                onChange={onChange}
                placeholder={placeholder || "提示：输入交易对和想分析的指标或因子"}
                onKeyDown={handleKeyDown}
            />
            {loading ? (
                <button
                    className="shrink-0 w-10 h-10 ml-6 rounded-full bg-theme-brand transition-colors hover:bg-primary-1/90 md:ml-3 flex items-center justify-center"
                    onClick={onPause}
                    title="暂停"
                >
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                </button>
            ) : (
            <button
                className="shrink-0 w-10 h-10 ml-6 rounded-full bg-theme-brand transition-colors hover:bg-primary-1/90 md:ml-3"
                onClick={onSend}
                    title="发送"
            >
                <Icon className="fill-theme-white-fixed" name="arrow-right" />
            </button>
            )}
        </div>
    );
};

export default Message;
