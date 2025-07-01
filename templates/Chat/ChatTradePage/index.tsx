"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Chat/Question";
import Answer from "@/components/Chat/Answer";
import Trade from "@/components/Chat/Trade";

const ChatPage = () => {
    return (
        <Layout title="10px AI">
            <Chat>
                <Question content="智能交易。根据用户自定义条件，利用AI算法自动择时，实现最优买卖。" />
                <Answer content="Hi Tam，注意该功能仍处于测试阶段，请合理安排你的预算。每日交易限额为1000美元。请先检查并调整预算，然后选择你今天要交易的加密货币。">
                    <Trade />
                </Answer>
            </Chat>
        </Layout>
    );
};

export default ChatPage;
