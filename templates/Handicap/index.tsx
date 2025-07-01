"use client";

import Layout from "@/components/Layout";
import TotalBalance from "./TotalBalance";
import BestToBuy from "./BestToBuy";
import TradeDataForm from "./TradeDataForm"; // 导入 TradeDataForm 组件
import { SymbolProvider, useSymbolContext } from '@/components/contexts/SymbolContext';
import OrderBookDepth from "./OrderBookDepth";
import ATMVolTermStructure from "./ATMVolTermStructure";
import VolSurface from "./VolSurface";
import VolSmile from "./VolSmile";
import TermStructure from "./TermStructure";
import IVvsRV from "./IVvsRV";
import VolCone from "./VolCone";
import IV7dMomentum from "./IV7dMomentum";
import HistoricalIVFixedExpiry from "./HistoricalIVFixedExpiry";
import VolumeByStrike from "./VolumeByStrike";
import OptionVolumeRatio from "./OptionVolumeRatio";
import OptionOpenInterest from "./OptionOpenInterest";

const HandicapPageContent = () => {
    const { symbol } = useSymbolContext();
    return (
        <Layout title="数据实验室🧪">
            <div className="space-y-2">
                <div className="flex lg:block gap-1 rounded-2xl overflow-hidden mt-3">
                    <TotalBalance symbol={symbol} className="flex-1 min-w-0" />
                    <BestToBuy symbol={symbol} />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <ATMVolTermStructure className="flex-1 min-w-0" />
                    <ATMVolTermStructure className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <VolSurface className="flex-1 min-w-0" />
                    <VolSurface className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <VolSmile className="flex-1 min-w-0" />
                    <VolSmile className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <TermStructure className="flex-1 min-w-0" />
                    <TermStructure className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <IVvsRV className="flex-1 min-w-0" />
                    <IVvsRV className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <VolCone className="flex-1 min-w-0" />
                    <VolCone className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <IV7dMomentum className="flex-1 min-w-0" />
                    <IV7dMomentum className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <HistoricalIVFixedExpiry className="flex-1 min-w-0" />
                    <HistoricalIVFixedExpiry className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <VolumeByStrike className="flex-1 min-w-0" />
                    <VolumeByStrike className="flex-1 min-w-0" />
                </div>
                <div className="flex lg:block gap-1.5 mt-3">
                    <OptionOpenInterest className="flex-1 min-w-0" />
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