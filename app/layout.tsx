// 全局布局
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "10px-自然语言就能量化",
    description: "基于AI的智能量化交易平台",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <head>
                {/* Description no longer than 155 characters */}
                <meta
                    name="description"
                    content="Trade smarter with 10px AI"
                />
                {/* Product Name */}
                <meta
                    name="product-name"
                    content="Trade smarter with 10px AI"
                />
                {/* Favicon */}
                <link rel="icon" href="/images/logo-1.svg?v=2" />
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    <Providers>
                        {children}
                    </Providers>
                </AuthProvider>
            </body>
        </html>
    );
}