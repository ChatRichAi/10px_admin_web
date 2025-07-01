"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Chat/Question";
import Answer from "@/components/Chat/Answer";
import BestPrice from "@/components/Chat/BestPrice";

const ChatPage = () => {
    return (
        <Layout title="10px AI">
            <Chat>
                <Question content="根据历史趋势，预测我卖出以太坊的最佳时机" />
                <Answer content="根据多方最新预测，近期以太坊价格有望上涨。例如，福布斯预计2024年底以太坊有望达到5000美元；Coinpedia 预测2024年3月价格可能最高达到4900美元；还有分析认为以太坊次日有望上涨5%，或将达到3687.11美元。">
                    <BestPrice />
                </Answer>
            </Chat>
        </Layout>
    );
};

export default ChatPage;
