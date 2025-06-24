"use client";

import { useState } from "react";
import { useColorMode } from "@chakra-ui/react";
import Link from "next/link";
import Login from "@/components/Login";
import Field from "@/components/Field";
import { signIn } from "next-auth/react";

const SignUpPage = () => {
    const { colorMode } = useColorMode();
    const [email, setEmail] = useState("");

    const handleGoogleSignIn = () => {
        signIn('google');
    };

    const handleMetaMaskSignIn = () => {
        // 这里添加 MetaMask 登录逻辑
        console.log("MetaMask sign in");
    };

    return (
        <Login
            title="Welcome to 10px"
            description="Gain an edge in crypto trading with AI-powered predictive analytics."
            image="/images/login-pic-1.png"
        >
            <div className="mb-5 text-base-2">Sign up with Open account</div>
            <div className="flex mb-8 pb-8 border-b-2 border-theme-stroke space-x-2">
                <button
                    className="btn-stroke flex-1 rounded-xl"
                    onClick={handleGoogleSignIn}
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
                <button 
                    className="btn-stroke flex-1 rounded-xl"
                    onClick={handleMetaMaskSignIn}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 318.6 318.6"
                        className="mr-2"
                    >
                        <path fill="#e2761b" stroke="#e2761b" strokeLinecap="round" strokeLinejoin="round" d="m274.1 35.5-99.5 73.9L193 65.8z"/>
                        <path d="m44.4 35.5 98.7 74.6-17.5-44.3zm193.9 171.3-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="m103.6 138.2-15.8 23.9 56.3 2.5-2-60.5zm111.3 0-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5 33.9 16.5-4.7-39.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round"/>
                        <path fill="#d7c1b3" stroke="#d7c1b3" strokeLinecap="round" strokeLinejoin="round" d="m211.8 247.4-33.9-16.5 2.7 22.1-.3 9.3zm-105 0 31.5 14.9-.2-9.3 2.5-22.1z"/>
                        <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="m138.8 193.5-28.2-8.3 19.9-9.1zm40.9 0 8.3-17.4 20 9.1z"/>
                        <path fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" d="m106.8 247.4 4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1 20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"/>
                        <path fill="#e4751f" stroke="#e4751f" strokeLinecap="round" strokeLinejoin="round" d="m87.8 162.1 23.6 46-.8-22.9zm120.3 23.1-1 22.9 23.7-46zm-64-20.6-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0-2.7 18 1.2 45 6.7-34.1z"/>
                        <path d="m179.8 193.5-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z" fill="#f6851b" stroke="#f6851b" strokeLinecap="round" strokeLinejoin="round"/>
                        <path fill="#c0ad9e" stroke="#c0ad9e" strokeLinecap="round" strokeLinejoin="round" d="m180.3 262.3.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z"/>
                        <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="m177.9 230.9-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z"/>
                        <path fill="#763d16" stroke="#763d16" strokeLinecap="round" strokeLinejoin="round" d="m278.3 114.2 8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z"/>
                        <path d="m267.2 153.5-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4 3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z" fill="#f6851b" stroke="#f6851b" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>METAMASK</span>
                </button>
            </div>
            <div className="mb-5 text-base-2">
                Or continue with email address
            </div>
            <Field
                className="mb-3"
                placeholder="Enter your email"
                icon="envelope"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <Link className="btn-primary w-full mb-3" href="/verify-code">
                Continue
            </Link>
            <div className="text-caption-1 text-theme-secondary">
                @Author: Boss SHI
            </div>
        </Login>
    );
};

export default SignUpPage;