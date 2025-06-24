import { useEffect, useState } from "react";
import Card from "@/components/Card";
import useTechnicalIndicators from "@/components/useTid";

interface IndicatorsData {
    indicators: { [key: string]: number | null }; // 允许 null 值
    signals: { [key: string]: string };
}

interface PivotPointsData {
    [key: string]: {
        [key: string]: number;
    };
}

const intervals = [
    { id: "15m", title: "15m" },
    { id: "1h", title: "1h" },
    { id: "4h", title: "4h" },
    { id: "1d", title: "1d" },
    { id: "1w", title: "1w" },
];

const symbols = [
    { id: "BTCUSDT", title: "BTC" },
    { id: "ETHUSDT", title: "ETH" },
    { id: "BNBUSDT", title: "BNB" },
    // 添加更多标的
];

const TechnicalIndicatorsBoard = () => {
    const [currentTime, setCurrentTime] = useState("");
    const [indicatorsData, setIndicatorsData] = useState<IndicatorsData>({ indicators: {}, signals: {} });
    const [isClient, setIsClient] = useState(false);
    const [interval, setInterval] = useState(intervals[3]); // 默认选择 "1天"
    const [symbol, setSymbol] = useState(symbols[0]); // 默认选择 "BTC"

    useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date().toLocaleString());

        // Fetch data from the API
        fetch(`https://10px.xyz/sr/Technical-indicators?symbol=${symbol.id}&interval=${interval.id}&lookback=30`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched data:", data); // 添加调试信息
                setIndicatorsData(data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, [interval, symbol]); // 添加 interval 和 symbol 作为 useEffect 的依赖

    const renderIndicators = () => {
        return (
            <div className="grid grid-cols-2 gap-8"> {/* 增加列间距 */}
                <div>
                    <ul className="space-y-4"> {/* 增加行间距 */}
                        {Object.entries(indicatorsData.indicators).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md"> {/* 增加背景颜色和内边距 */}
                                <div className="text-sm font-bold text-gray-700">{key}</div> {/* 调整字体颜色 */}
                                <div className="ml-4 text-sm text-gray-500">
                                    {value !== null
                                        ? ((/振幅|幅|percent|涨跌|change|幅度|amplitude|percentage/i.test(key) && typeof value === 'number')
                                            ? value.toFixed(2)
                                            : value)
                                        : 'N/A'}
                                </div> {/* 处理 null 值并增加左边距 */}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <ul className="space-y-4"> {/* 增加行间距 */}
                        {Object.entries(indicatorsData.signals).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md"> {/* 增加背景颜色和内边距 */}
                                <div className="text-sm font-bold text-gray-700">{key}</div> {/* 调整字体颜色 */}
                                <div className={`font-bold ml-4 text-sm ${value === '买入' ? 'text-green-500' : value === '卖出' ? 'text-red-500' : 'text-gray-500'}`}>{value}</div> {/* 买入为绿色，卖出为红色，并增加左边距 */}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <Card
            className="flex-1 h-full mt-8 p-6" // 增加卡片的内边距
            title="技术指标看板"
            tooltip="展示技术指标和信号"
            seeAllUrl="/technical-indicators-board"
        >
            <div className="p-4 h-full flex flex-col justify-between"> {/* 确保内容垂直居中 */}
                <div className="flex-1">
                    {isClient && renderIndicators()}
                </div>
                <div className="flex justify-between items-center mt-4"> {/* 确保更新时间和按钮水平对齐 */}
                    <div className="flex justify-start space-x-2"> {/* 增加时间选项按钮并移到左下角 */}
                        {intervals.map((int) => (
                            <button
                                key={int.id}
                                className={`px-2 py-1 rounded ${interval.id === int.id ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setInterval(int)}
                            >
                                {int.title}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-start space-x-2"> {/* 增加标的选项按钮 */}
                        {symbols.map((sym) => (
                            <button
                                key={sym.id}
                                className={`px-2 py-1 rounded ${symbol.id === sym.id ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setSymbol(sym)}
                            >
                                {sym.title}
                            </button>
                        ))}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        更新时间: {currentTime}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const PivotPointsBoard = () => {
    const [currentTime, setCurrentTime] = useState("");
    const [pivotPointsData, setPivotPointsData] = useState<PivotPointsData>({});
    const [isClient, setIsClient] = useState(false);
    const [interval, setInterval] = useState(intervals[3]); // 默认选择 "1天"
    const [symbol, setSymbol] = useState(symbols[0]); // 默认选择 "BTC"

    useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date().toLocaleString());

        // Fetch data from the API
        fetch(`https://10px.xyz/sr/pivot-points?symbol=${symbol.id}&interval=${interval.id}&lookback=30`)
            .then(response => response.json())
            .then(data => {
                console.log("Fetched data:", data); // 添加调试信息
                setPivotPointsData(data.pivot_points);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, [interval, symbol]); // 添加 interval 和 symbol 作为 useEffect 的依赖

    const getOrder = (type: string) => {
        const orderMap: { [key: string]: number } = {
            "经典": 1,
            "斐波纳契": 2,
            "卡玛利拉": 3,
            "DeMark": 4,
            "Woodie": 5
        };
        return orderMap[type] || 6;
    };

    const renderPivotPoints = () => {
        return (
            <div className="grid grid-cols-5 gap-8"> {/* 调整为5列 */}
                {Object.entries(pivotPointsData).map(([type, points]) => (
                    <div key={type} className={`col-span-1 order-${getOrder(type)}`}> {/* 根据类型设置顺序 */}
                        <h3 className="text-lg font-bold text-gray-700 mb-4">{type}</h3> {/* 增加标题 */}
                        <ul className="space-y-4"> {/* 增加行间距 */}
                            {Object.entries(points).map(([key, value]) => (
                                <li key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md"> {/* 增加背景颜色和内边距 */}
                                    <div className="text-sm font-bold text-gray-700">{key}</div> {/* 调整字体颜色 */}
                                    <div className={`ml-4 text-sm ${key === 'PP' ? 'text-blue-500' : key.startsWith('R') ? 'text-pink-500' : 'text-green-500'}`}>{value}</div> {/* 增加左边距，PP为蓝色，R为粉色，S为绿色 */}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card
            className="flex-1 h-full mt-8 p-6" // 增加卡片的内边距
            title="支撑阻力看板"
            tooltip="展示支撑和阻力点"
            seeAllUrl="/pivot-points-board"
        >
            <div className="p-4 h-full flex flex-col justify-between"> {/* 确保内容垂直居中 */}
                <div className="flex-1">
                    {isClient && renderPivotPoints()}
                </div>
                <div className="flex justify-between items-center mt-4"> {/* 确保更新时间和按钮水平对齐 */}
                    <div className="flex justify-start space-x-2"> {/* 增加时间选项按钮并移到左下角 */}
                        {intervals.map((int) => (
                            <button
                                key={int.id}
                                className={`px-2 py-1 rounded ${interval.id === int.id ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setInterval(int)}
                            >
                                {int.title}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-start space-x-2"> {/* 增加标的选项按钮 */}
                        {symbols.map((sym) => (
                            <button
                                key={sym.id}
                                className={`px-2 py-1 rounded ${symbol.id === sym.id ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setSymbol(sym)}
                            >
                                {sym.title}
                            </button>
                        ))}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        更新时间: {currentTime}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export { TechnicalIndicatorsBoard, PivotPointsBoard };