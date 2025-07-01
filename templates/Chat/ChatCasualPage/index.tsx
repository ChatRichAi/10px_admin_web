"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Chat/Question";
import Answer from "@/components/Chat/Answer";

const ChatPage = () => {
    return (
        <Layout title="10 AI">
            <Chat>
                <Question content="欢迎来到闲聊模式！你可以随时自由提问或交流，也可获取最新行情、资讯等信息。" />
                <Answer
                    content={`这里是你的专属AI助手，支持闲聊、行情查询、资讯解读等多种功能。\n\n无论是数字货币、股票，还是生活趣事，都可以畅所欲言！`}
                    image="/images/login-pic-1.png"
                ></Answer>
            </Chat>
        </Layout>
    );
};

export default ChatPage;
