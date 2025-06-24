"use client";

import Layout from "@/components/Layout";
import TotalBalance from "./TotalBalance";
import BestToBuy from "./BestToBuy";
import TradeDataForm from "./TradeDataForm"; // 导入 TradeDataForm 组件
import { SymbolProvider, useSymbolContext } from '@/components/contexts/SymbolContext';

const HandicapPageContent = () => {
    const { symbol } = useSymbolContext();
    return (
        <Layout title="Handicap Page">
            <div className="space-y-2">
                <div className="flex lg:block">
                    <TotalBalance symbol={symbol} />
                    <BestToBuy symbol={symbol} />
                </div>
            </div>
        </Layout>
    );
};

const HandicapPage = () => (
    <SymbolProvider>
        <HandicapPageContent />
    </SymbolProvider>
);

export default HandicapPage;