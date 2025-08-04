"use client";

import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
const Chat = dynamic(() => import("@/components/Chat/index").then(mod => ({ default: mod.default })), { ssr: false });

const ChatPage = () => {
    return (
        <Layout title="10px AI">
            <Chat />
        </Layout>
    );
};

export default ChatPage;
