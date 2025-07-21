import { useEffect, useState } from "react";
import Card from "@/components/Card";
import useTrendData from "@/hooks/useQsIndex";

const TrendBoard = () => {
    const trendData = useTrendData();

    const renderTrendCircles = (data: number[]) => {
        return data.map((value, index) => (
            <div key={index} className="flex flex-col items-center mx-2">
                <div
                    className={`w-6 h-6 rounded-full ${value === 1 ? 'bg-[#32AE60]' : value === 0 ? 'bg-[#FBA94B]' : 'bg-[#F04D1A]'}`}
                ></div>
                <div className="text-xs text-gray-500 mt-1">
                    {['5m', '15m', '1h', '4h', '1d', '1w'][index]}
                </div>
            </div>
        ));
    };

    const renderLoadingCircles = () => {
        return Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col items-center mx-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="text-xs text-gray-500 mt-1">
                    {['5m', '15m', '1h', '4h', '1d', '1w'][index]}
                </div>
            </div>
        ));
    };

    return (
        <Card
            className="flex-1 h-full" // 确保卡片高度与Balance模块一致
            title="趋势看板"
            tooltip="周期共振红绿灯，红看跌绿看涨橙等待，趋势无时需蛰伏"
            seeAllUrl="/trend-board"
        >
            <div className="p-4 h-full flex flex-col justify-between"> {/* 确保内容垂直居中 */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold">BTC</div>
                        <div className="flex">
                            {trendData ? renderTrendCircles(trendData.BTC) : renderLoadingCircles()}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold">ETH</div>
                        <div className="flex">
                            {trendData ? renderTrendCircles(trendData.ETH) : renderLoadingCircles()}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold">SOL</div>
                        <div className="flex">
                            {trendData ? renderTrendCircles(trendData.SOL) : renderLoadingCircles()}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-lg font-bold">BNB</div>
                        <div className="flex">
                            {trendData ? renderTrendCircles(trendData.BNB) : renderLoadingCircles()}
                        </div>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-4">
                    更新时间: {trendData ? new Date().toLocaleString() : '策略运算中...'}
                </div>
            </div>
        </Card>
    );
};

export default TrendBoard;