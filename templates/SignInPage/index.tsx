"use client";

import { useState } from "react";
import { useColorMode } from "@chakra-ui/react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Login from "@/components/Login";
import Field from "@/components/Field";

const SignInPage = () => {
    const { colorMode } = useColorMode();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError("请填写所有必填字段");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("邮箱或密码错误，请重试");
            } else {
                // 登录成功，先跳转到测试页面
                router.push("/test-admin");
            }
        } catch (error) {
            setError("登录失败，请稍后重试");
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

    return (
        <Login title="登录您的账户" image="/images/login-pic-1.png" signIn>
            <div className="mb-5 text-base-2">使用第三方账户登录</div>
            <div className="flex mb-8 pb-8 border-b-2 border-theme-stroke space-x-2">
                <button 
                    className="btn-stroke flex-1 rounded-xl"
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
                    <span>Google</span>
                </button>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}
            
            <div className="mb-5 text-base-2">
                或使用邮箱地址登录
            </div>
            
            <form onSubmit={handleSubmit}>
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
                    placeholder="请输入您的密码"
                    icon="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                <div className="text-right mb-3">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        忘记密码？
                    </Link>
                </div>
                
                <button 
                    type="submit" 
                    className="btn-primary w-full mb-3"
                    disabled={isLoading}
                >
                    {isLoading ? "登录中..." : "开始交易"}
                </button>
            </form>
            
            <div className="text-center text-sm text-base-2">
                还没有账户？
                <Link href="/sign-up" className="text-primary ml-1 hover:underline">
                    立即注册
                </Link>
            </div>
        </Login>
    );
};

export default SignInPage;
