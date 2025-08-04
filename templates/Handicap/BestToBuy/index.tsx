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
import useBestToBuyData from "@/hooks/useBestToBuy";
import { getSymbolType } from '@/hooks/useBestToBuy/symbolType';
import AISummaryModal from "@/components/AISummaryModal";
import TimerSettingsModal from "@/components/TimerSettings";

type BestToBuyProps = {
    symbol?: string;
    className?: string;
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

const BestToBuy = ({ symbol, className }: BestToBuyProps) => {
    const [visibleModal, setVisibleModal] = useState(false);
    const [interval, setInterval] = useState("1d"); // 默认间隔为1天
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAISummary, setShowAISummary] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [timerSettings, setTimerSettings] = useState({
        enabled: false,
        interval: 30,
        nextRun: null,
        telegramChatId: "",
        telegramBotToken: ""
    });
    
    const { price, percentChange, historicalData } = useBestToBuyData(symbol || "BTCUSDT", interval, 30);
    const { tdSupport, tdResistance } = calculateDeMark(historicalData);
    const symbolType = getSymbolType(symbol || "BTCUSDT");
    
    // 动态名称
    let displayName = '';
    let displaySymbol = '';
    if (symbolType === 'crypto') {
        displaySymbol = (symbol || 'BTCUSDT').replace('USDT', '');
        const nameMap: Record<string, string> = { BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana' };
        displayName = nameMap[displaySymbol] || displaySymbol;
    } else {
        displaySymbol = symbol || '';
        displayName = displaySymbol;
    }

    // AI分析功能
    const handleAISummary = async () => {
        setIsAILoading(true);
        setShowAISummary(true);
        
        try {
            // 模拟AI分析过程
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const analysis = `基于${displayName}的DeMark技术分析：

📊 **当前市场状态**
• 当前价格: $${price?.toFixed(2)}
• 价格变化: ${percentChange?.toFixed(2)}%
• 支撑位: $${tdSupport?.toFixed(2)}
• 阻力位: $${tdResistance?.toFixed(2)}

🎯 **DeMark信号分析**
• 根据TD序列指标，当前市场处于${percentChange > 0 ? '上升趋势' : '下降趋势'}
• 支撑位${tdSupport ? `在$${tdSupport.toFixed(2)}` : '未形成'}，建议关注此位置
• 阻力位${tdResistance ? `在$${tdResistance.toFixed(2)}` : '未形成'}，突破此位置可能继续上涨

💡 **交易建议**
• 短期策略: ${percentChange > 0 ? '可考虑在支撑位附近买入' : '注意风险控制，等待明确信号'}
• 中期策略: 关注价格是否突破关键阻力位
• 风险管理: 设置止损位在支撑位下方

🔍 **技术指标解读**
• TD序列显示${percentChange > 0 ? '买入信号' : '卖出信号'}
• 建议结合其他技术指标确认信号
• 当前时间框架: ${interval}`;
            
            setAiSummary(analysis);
        } catch (error) {
            setAiSummary("AI分析过程中出现错误，请稍后重试。");
        } finally {
            setIsAILoading(false);
        }
    };

    // 保存定时器设置
    const handleSaveTimerSettings = async (settings: any) => {
        setTimerSettings(settings);
        setShowTimerModal(false);
    };

    // 图表内容
    const chartContent = (
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
    );

    // 全屏视图
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {displayName} DeMark 技术分析
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
                            title="AI总结"
                            onClick={handleAISummary}
                            disabled={isAILoading}
                        >
                            {isAILoading ? (
                                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'AI'
                            )}
                        </button>
                        <button 
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-hidden">
                    <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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
                            {chartContent}
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
                    </div>
                </div>

                {/* AI分析动画模态框 */}
                {showAISummary && (
                    <AISummaryModal
                        isLoading={isAILoading}
                        summary={aiSummary}
                        onClose={() => setShowAISummary(false)}
                        title="AI DeMark 技术分析总结"
                        symbol={displayName}
                    />
                )}
                {/* 定时推送设置模态框 */}
                {showTimerModal && (
                    <TimerSettingsModal
                        settings={timerSettings}
                        onSave={handleSaveTimerSettings}
                        onClose={() => setShowTimerModal(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <>
            <Card
                className={`card-sidebar ${className || ''}`}
                title="DeMark"
                rightContent={
                    <div className="flex items-center gap-2">
                        <button 
                            className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
                            title="AI总结"
                            onClick={handleAISummary}
                            disabled={isAILoading}
                        >
                            {isAILoading ? (
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'AI'
                            )}
                        </button>
                        <button 
                            className={`p-1 text-theme-secondary hover:text-theme-primary transition-colors ${timerSettings.enabled ? 'text-green-500' : ''}`}
                            onClick={() => setShowTimerModal(true)}
                            title={timerSettings.enabled ? '定时器已启用' : '设置定时AI分析'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <button 
                            className="p-1 text-theme-secondary hover:text-theme-primary"
                            onClick={() => setIsFullscreen(true)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
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
                    {chartContent}
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
            
            {/* AI分析动画模态框 */}
            {showAISummary && (
                <AISummaryModal
                    isLoading={isAILoading}
                    summary={aiSummary}
                    onClose={() => setShowAISummary(false)}
                    title="AI DeMark 技术分析总结"
                    symbol={displayName}
                />
            )}
            
            {/* 定时推送设置模态框 */}
            {showTimerModal && (
                <TimerSettingsModal
                    settings={timerSettings}
                    onSave={handleSaveTimerSettings}
                    onClose={() => setShowTimerModal(false)}
                />
            )}
            
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