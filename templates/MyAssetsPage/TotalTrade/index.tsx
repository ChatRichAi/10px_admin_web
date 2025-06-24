import React from 'react';
import { DownloadIcon } from '@chakra-ui/icons'; // 从 @chakra-ui/icons 导入图标
import { FaDollarSign, FaChartLine, FaTrophy } from 'react-icons/fa'; // 从 react-icons 导入图标

const iconColor = "#B5E4CA"; // 定义图标颜色

const TotalInvestment = () => (
    <div className="p-4 bg-white rounded-lg shadow-md h-full flex items-center">
        <FaDollarSign size={24} className="mr-2" style={{ color: iconColor }} />
        <div>
            <div className="text-gray-500">总充值</div>
            <div className="text-2xl font-bold">$5000.00</div>
            <div className="text-gray-500">0.1 BTC</div>
        </div>
    </div>
);

const TotalWithdrawal = () => (
    <div className="p-4 bg-white rounded-lg shadow-md h-full flex items-center">
        <DownloadIcon boxSize={6} className="mr-2" style={{ color: iconColor }} />
        <div>
            <div className="text-gray-500">总提现</div>
            <div className="text-2xl font-bold">$2000.00</div>
            <div className="text-gray-500">0.05 BTC</div>
        </div>
    </div>
);

const TotalProfitLoss = () => (
    <div className="p-4 bg-white rounded-lg shadow-md h-full flex items-center">
        <FaChartLine size={24} className="mr-2" style={{ color: iconColor }} />
        <div>
            <div className="text-gray-500">总盈亏</div>
            <div className="text-2xl font-bold">$3000.00</div>
            <div className="text-gray-500">0.05 BTC</div>
        </div>
    </div>
);

const ContractProfitLoss = () => (
    <div className="p-4 bg-white rounded-lg shadow-md h-full flex items-center">
        <FaTrophy size={24} className="mr-2" style={{ color: iconColor }} />
        <div>
            <div className="text-gray-500">合约盈亏</div>
            <div className="text-2xl font-bold">$1000.00</div>
            <div className="text-gray-500">0.02 BTC</div>
        </div>
    </div>
);

export { TotalInvestment, TotalWithdrawal, TotalProfitLoss, ContractProfitLoss };