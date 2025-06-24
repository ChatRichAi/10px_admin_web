"use client";

import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
const Chat = dynamic(() => import("@/components/Chat"), { ssr: false });

const ChatPage = () => {
    return (
        <Layout title="10px AI">
            <Chat />
        </Layout>
    );
};

export default ChatPage;
