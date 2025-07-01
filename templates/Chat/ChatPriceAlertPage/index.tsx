"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Chat/Question";
import Answer from "@/components/Chat/Answer";
import PriceAlert from "@/components/Chat/PriceAlert";

const ChatPage = () => {
    return (
        <Layout title="10px AI">
            <Chat>
                <Question content="根据我的资产，批量设置价格预警" />
                <Answer content="好的，你目前共持有5项资产，价格预警已为你设置好。请在下方查看，如有需要可手动调整。">
                    <PriceAlert />
                </Answer>
            </Chat>
        </Layout>
    );
};

export default ChatPage;
