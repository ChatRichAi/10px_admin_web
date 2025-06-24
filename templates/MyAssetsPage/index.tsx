"use client";

import Layout from "@/components/Layout";
import TotalBalance from "./TotalBalance";
import BestToBuy from "./BestToBuy";
import { TotalInvestment, TotalWithdrawal, TotalProfitLoss, ContractProfitLoss } from "./TotalTrade";
import OptionsControl from "./OptionsControl";
import AvailableBalance from "../TradePage/AvailableBalance";
import Statistics from "./Statistics";
import TradeHistory from "./TradeHistory";
import TradeStats from "./Statistics_Num"; // 引入TradeStats模块
import { FaChartPie, FaTrophy, FaClock, FaChartBar } from 'react-icons/fa'; // 从 react-icons 导入图标
import { Fab } from '@mui/material';
import PowerIcon from '@mui/icons-material/Power'; // 从 @mui/icons-material 导入 PowerIcon

const MyAssetsPage = () => {
    const handleClick = () => {
        console.log('插头按钮被点击');
    };

    return (
        <Layout title="My assets">
            <div className="space-y-2">
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex-1 min-w-[200px]">
                        <TotalInvestment />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <TotalWithdrawal />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <TotalProfitLoss />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <ContractProfitLoss />
                    </div>
                </div>

                <div className="mt-6 mb-6">
                    <OptionsControl />
                </div>

                <div className="mt-6 mb-6">
                    <TradeStats
                        totalTrades={52}
                        winRate={26.92}
                        wins={14}
                        losses={38}
                        avgTradeDuration="0小时 50分钟 35秒"
                        longPercentage={100}
                        longCount={52}
                        shortPercentage={0}
                        shortCount={0}
                    />
                </div>
                
                <div className="flex gap-4 mt-6 mb-6">
                    <div className="flex-1">
                        <TotalBalance />
                    </div>
                    <div className="flex-1">
                        <Statistics />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                    <div className="lg:col-span-2">
                        <TradeHistory />
                    </div>
                </div>

                <div className="flex gap-4 mt-6 mb-6">
                    <div className="flex-1">
                        <BestToBuy />
                    </div>
                    <div className="flex-1">
                        <BestToBuy />
                    </div>
                    <div className="flex-1">
                        <BestToBuy />
                    </div>
                </div>
            </div>
            <Fab
                color="primary"
                aria-label="power"
                onClick={handleClick}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000
                }}
            >
                <PowerIcon />
            </Fab>
        </Layout>
    );
};

export default MyAssetsPage;