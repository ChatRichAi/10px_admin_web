import { useState } from "react";
import {
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
} from "recharts";
import { useColorMode } from "@chakra-ui/react";
import Card from "@/components/Card";
import CurrencyFormat from "@/components/CurrencyFormat";
import Percent from "@/components/Percent";
import useBinanceData from "@/components/useTotal"; // 导入自定义钩子

const duration = [
    {
        id: "0",
        title: "最近7天",
        interval: "1d",
        limit: 7,
    },
    {
        id: "1",
        title: "最近30天",
        interval: "1d",
        limit: 30,
    },
    {
        id: "2",
        title: "最近1年",
        interval: "1M",
        limit: 12,
    },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-5 bg-theme-on-surface-1 border border-theme-stroke rounded-xl shadow-depth-1 md:p-3">
                <div className="flex mb-0.5 text-caption-2m text-theme-secondary opacity-75 dark:opacity-100">
                    {label}
                </div>
                <CurrencyFormat
                    className="text-h5 md:text-title-1s"
                    value={payload[0].payload.price} // 显示当时价格
                    currency="$"
                />
                <Percent
                    className="ml-1 text-title-1s"
                    value={parseFloat(payload[0].payload.percentChange.toFixed(2))} // 在这里格式化
                />
            </div>
        );
    }

    return null;
};

type TotalBalanceProps = {};

const TotalBalance = ({ }: TotalBalanceProps) => {
    const [time, setTime] = useState(duration[1]);
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";
    const { price, percentChange, historicalData } = useBinanceData("BTCUSDT", time.interval, time.limit); // 使用自定义钩子获取数据

    // 确定线条颜色
    const lineColor = historicalData.length > 1 && historicalData[historicalData.length - 1].price > historicalData[0].price ? "green" : "red";

    // 计算最大值并增加 500 点缓冲区
    const maxPrice = Math.max(...historicalData.map(data => data.price)) + 500;

    return (
        <Card
            className="grow shadow-md" // 增加阴影
            option={time}
            setOption={setTime}
            options={duration}
        >
            <div className="flex items-end mt-0.5 md:mt-2">
                <CurrencyFormat
                    className="text-h1 md:text-h3"
                    value={price}
                    currency="$"
                />
                <Percent className="ml-1 text-title-1s" value={parseFloat(percentChange.toFixed(2))} /> {/* 在这里格式化 */}
            </div>
            <div className="h-[20rem] mt-12 -mb-6 md:mt-4 md:-mb-2"> {/* 调整高度 */}
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        width={150}
                        height={40}
                        data={historicalData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            horizontal={false}
                            stroke={isDarkMode ? "#272B30" : "#EFEFEF"}
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            stroke={isDarkMode ? "#272B30" : "#EFEFEF"}
                            tick={{
                                fontSize: 12,
                                fontWeight: "500",
                                opacity: 0.75,
                                fill: "#6F767E",
                            }}
                            dy={4}
                        />
                        <YAxis
                            domain={['dataMin', maxPrice]} // 设置纵坐标范围
                            tickLine={false}
                            stroke={isDarkMode ? "#272B30" : "#EFEFEF"}
                            tick={{
                                fontSize: 12,
                                fontWeight: "500",
                                opacity: 0.75,
                                fill: "#6F767E",
                            }}
                            tickFormatter={(value) => `$${Math.floor(value)}`} // 格式化为整数价格
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                fill: isDarkMode ? "#222628" : "#F6F6F6",
                            }}
                            wrapperStyle={{ outline: "none" }}
                        />
                        <Line type="monotone" dataKey="price" stroke={lineColor} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default TotalBalance;