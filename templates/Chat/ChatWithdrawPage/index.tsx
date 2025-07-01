"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Chat/Question";
import Answer from "@/components/Chat/Answer";
import Withdraw from "@/components/Chat/Withdraw";

const ChatPage = () => {
    return (
        <Layout title="10px AI">
            <Chat>
                <Question content="当ETH余额超过3枚时，自动提现到我的MetaMask钱包。" />
                <Answer content="好的，请确认你的MetaMask钱包地址：">
                    <Withdraw />
                </Answer>
            </Chat>
        </Layout>
    );
};

export default ChatPage;
