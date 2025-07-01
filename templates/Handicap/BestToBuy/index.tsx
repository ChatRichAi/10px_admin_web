import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, Line, YAxis, CartesianGrid, Tooltip } from "recharts";
import Link from "next/link";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import CurrencyFormat from "@/components/CurrencyFormat";
import Image from "@/components/Image";
import Percent from "@/components/Percent";
import Modal from "@/components/Modal";
import SetAlert from "@/components/SetAlert";
import useBestToBuyData from "@/components/useBestToBuy";
import html2canvas from "html2canvas"; // 引入html2canvas库
import { getSymbolType } from '@/components/useBestToBuy/symbolType';

type BestToBuyProps = {
    symbol?: string;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
                <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">{data.date}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-300">价格:</span>
                        <span className="text-xs text-gray-700 dark:text-white font-medium">{data.price}</span>
                    </div>
                    {data.tdResistance && (
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-500 dark:text-gray-300">R1:</span>
                            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.tdResistance}</span>
                        </div>
                    )}
                    {data.tdSupport && (
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-500 dark:text-gray-300">S1:</span>
                            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.tdSupport}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const calculateDeMark = (data: any[]) => {
    if (data.length === 0) return { tdSupport: null, tdResistance: null };

    const lastData = data[data.length - 1];
    const { high, low, close, open } = lastData;

    let X;
    if (close < open) {
        X = high + (2 * low) + close;
    } else if (close > open) {
        X = (2 * high) + low + close;
    } else {
        X = high + low + (2 * close);
    }

    const tdResistance = (X / 2) - low;
    const tdSupport = (X / 2) - high;

    return { tdSupport, tdResistance };
};

const BestToBuy = ({ symbol }: BestToBuyProps) => {
    const [visibleModal, setVisibleModal] = useState(false);
    const [interval, setInterval] = useState("1d"); // 默认间隔为1天
    const { price, percentChange, historicalData } = useBestToBuyData(symbol || "BTCUSDT", interval, 30); // 使用用户选择的间隔，30天历史数据
    const { tdSupport, tdResistance } = calculateDeMark(historicalData);
    const symbolType = getSymbolType(symbol || "BTCUSDT");
    // 动态名称
    let displayName = '';
    let displaySymbol = '';
    if (symbolType === 'crypto') {
        // 例如BTCUSDT => Bitcoin BTC
        displaySymbol = (symbol || 'BTCUSDT').replace('USDT', '');
        // 可扩展币种名映射
        const nameMap: Record<string, string> = { BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana' };
        displayName = nameMap[displaySymbol] || displaySymbol;
    } else {
        displaySymbol = symbol || '';
        displayName = displaySymbol;
    }

    const handleShare = async () => {
        const element = document.querySelector(".card-sidebar") as HTMLElement;
        if (element) {
            const canvas = await html2canvas(element);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = "share.png";
            link.click();
        }
    };

    return (
        <>
            <Card
                className="card-sidebar"
                title="DeMark"
                rightContent={
                    <div className="flex space-x-2">
                        <button className="group w-9 h-9 border-2 border-theme-stroke rounded-xl text-0 transition-colors hover:bg-theme-stroke">
                            <Icon
                                className="!w-5 !h-5 fill-theme-secondary transition-colors group-hover:fill-theme-primary"
                                name="refresh"
                            />
                        </button>
                        <button
                            className="group w-9 h-9 border-2 border-theme-stroke rounded-xl text-0 transition-colors hover:bg-theme-stroke"
                            onClick={handleShare}
                        >
                            <Icon
                                className="!w-5 !h-5 fill-theme-secondary transition-colors group-hover:fill-theme-primary"
                                name="share"
                            />
                        </button>
                    </div>
                }
            >
                <div>
                    <CurrencyFormat
                        className="mb-2 text-h3"
                        value={price}
                        currency="$"
                    />
                    <div className="flex items-center">
                        <div className="mr-2"></div>
                        <div className="text-base-1s">
                            {displayName}{symbolType === 'crypto' ? <span className="text-theme-tertiary"> {displaySymbol}</span> : null}
                        </div>
                        <Percent className="ml-2 text-base-2" value={percentChange} />
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={historicalData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="color"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#32AE60"
                                            stopOpacity={0.15}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#32AE60"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#32AE60"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#color)"
                                />
                                {tdSupport && (
                                    <Line
                                        type="monotone"
                                        dataKey={() => tdSupport}
                                        stroke="#888888"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                )}
                                {tdResistance && (
                                    <Line
                                        type="monotone"
                                        dataKey={() => tdResistance}
                                        stroke="#888888"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-2 mt-2 mb-4">
                        <button
                            className={`btn ${interval === "1h" ? "bg-black text-white" : "bg-gray-300 text-black"} w-8 h-8 rounded-full text-xs flex items-center justify-center`}
                            onClick={() => setInterval("1h")}
                        >
                            1H
                        </button>
                        <button
                            className={`btn ${interval === "4h" ? "bg-black text-white" : "bg-gray-300 text-black"} w-8 h-8 rounded-full text-xs flex items-center justify-center`}
                            onClick={() => setInterval("4h")}
                        >
                            4H
                        </button>
                        <button
                            className={`btn ${interval === "1d" ? "bg-black text-white" : "bg-gray-300 text-black"} w-8 h-8 rounded-full text-xs flex items-center justify-center`}
                            onClick={() => setInterval("1d")}
                        >
                            1D
                        </button>
                        <button
                            className={`btn ${interval === "1w" ? "bg-black text-white" : "bg-gray-300 text-black"} w-8 h-8 rounded-full text-xs flex items-center justify-center`}
                            onClick={() => setInterval("1w")}
                        >
                            1W
                        </button>
                    </div>
                    <div className="flex items-center justify-center text-caption-1 text-theme-secondary mb-4">
                        <div className="mr-2">
                            <Image
                                className="w-4"
                                src="/images/logo-1.svg"
                                width={16}
                                height={16}
                                alt=""
                            />
                        </div>
                        Model: Sl_Demark, Accuracy: 87%
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            className="btn-secondary flex-1 px-2"
                            href="/trade"
                        >
                            Smart trade
                        </Link>
                        <button
                            className="btn-gray flex-1 px-2"
                            onClick={() => setVisibleModal(true)}
                        >
                            Set Alert
                        </button>
                    </div>
                </div>
            </Card>
            <Modal
                classWrap="max-w-[28.5rem] rounded-3xl"
                showButtonClose
                visible={visibleModal}
                onClose={() => setVisibleModal(false)}
            >
                <>
                    <SetAlert />
                </>
            </Modal>
        </>
    );
};

export default BestToBuy;