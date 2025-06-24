"use client";

// 导入必要的 React 和 Next.js 库
import { useState } from "react";
import Link from "next/link";
import Login from "@/components/Login";
import Field from "@/components/Field";
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

// 安全 JSON 解析工具函数，防止 undefined 或非法 JSON 报错
function safeJsonParse(str: string | null | undefined, defaultValue: any = null) {
    try {
        if (!str || str === "undefined" || str === undefined) return defaultValue;
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

// 定义 SignUpPage 组件
const SignUpPage = () => {
    // 定义组件状态
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    // 验证邮箱格式
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // 验证密码强度
    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 表单验证
        if (!email || !name || !password || !confirmPassword) {
            setError("请填写所有必填字段");
            return;
        }

        if (!validateEmail(email)) {
            setError("请输入有效的邮箱地址");
            return;
        }

        if (!validatePassword(password)) {
            setError("密码至少需要6个字符");
            return;
        }

        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            // 调用注册API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("注册成功！正在为您跳转到登录页面...");
                // 2秒后跳转到登录页面
                setTimeout(() => {
                    router.push('/sign-in');
                }, 2000);
            } else {
                setError(data.error || "注册失败，请稍后重试");
            }
        } catch (error) {
            setError("网络错误，请检查网络连接后重试");
        } finally {
            setIsLoading(false);
        }
    };

    // 处理Google登录
    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            setError("Google登录失败，请重试");
        }
    };

    // 渲染组件
    return (
        <Login
            title=""
            description="使用AI驱动，自然语言就能量化交易。"
            image="/images/login-pic-1.png"
        >
            <div className="mb-5 text-base-2">使用第三方账户注册</div>
            <div className="flex mb-8 pb-8 border-b-2 border-theme-stroke">
                <button
                    className="btn-stroke w-full rounded-xl"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <g clipPath="url(#A)">
                            <path
                                d="M23.744 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                                fill="#4285f4"
                            />
                            <path
                                d="M12.253 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.513 21.3 7.563 24 12.253 24z"
                                fill="#34a853"
                            />
                            <path
                                d="M5.524 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
                                fill="#fbbc05"
                            />
                            <path
                                d="M12.253 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.203 1.19 15.493 0 12.253 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                                fill="#ea4335"
                            />
                        </g>
                        <defs>
                            <clipPath id="A">
                                <path fill="#fff" d="M0 0h24v24H0z" />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>使用 Google 注册</span>
                </button>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    {success}
                </div>
            )}
            
            <div className="mb-5 text-base-2">
                或使用邮箱地址注册
            </div>
            
            <form onSubmit={handleSubmit}>
                <Field
                    className="mb-3"
                    placeholder="请输入您的姓名"
                    icon="user"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Field
                    className="mb-3"
                    placeholder="请输入您的邮箱"
                    icon="envelope"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Field
                    className="mb-3"
                    placeholder="请输入密码（至少6个字符）"
                    icon="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Field
                    className="mb-6"
                    placeholder="请确认密码"
                    icon="password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                <button 
                    type="submit" 
                    className="btn-primary w-full mb-3"
                    disabled={isLoading}
                >
                    {isLoading ? "注册中..." : "立即注册"}
                </button>
            </form>
            
            <div className="text-center text-sm text-base-2">
                已有账户？
                <Link href="/sign-in" className="text-primary ml-1 hover:underline">
                    立即登录
                </Link>
            </div>
            
            <div className="text-center text-xs text-base-2 mt-4">
                注册即表示您同意我们的
                <Link href="/terms" className="text-primary hover:underline">服务条款</Link>
                和
                <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link>
            </div>
        </Login>
    );
};

export default SignUpPage;