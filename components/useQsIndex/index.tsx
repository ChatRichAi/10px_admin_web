import { useEffect, useState } from "react";
import axios from "axios";

type TrendData = {
    BTC: number[];
    ETH: number[];
    SOL: number[];
    BNB: number[];
};

const useTrendData = () => {
    const [trendData, setTrendData] = useState<TrendData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentDate = new Date().toISOString().split('T')[0]; // 获取当前日期
                const response = await axios.post("https://10px.xyz/slTip/strategy", {
                    "symbols": ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"],
                    intervals: ["5m", "15m", "1h", "4h", "1d", "1w"],
                    atr_period: 10,
                    factor: 3,
                    pct_change: 3,
                    length: 20,
                    lookback: 30,
                    current_date: currentDate // 添加当前日期到请求参数中
                });

                const data = response.data;

                const formatData = (symbol: string) => [
                    data[symbol]["5m"].signal === "B" ? 1 : data[symbol]["5m"].signal === "S" ? -1 : 0,
                    data[symbol]["15m"].signal === "B" ? 1 : data[symbol]["15m"].signal === "S" ? -1 : 0,
                    data[symbol]["1h"].signal === "B" ? 1 : data[symbol]["1h"].signal === "S" ? -1 : 0,
                    data[symbol]["4h"].signal === "B" ? 1 : data[symbol]["4h"].signal === "S" ? -1 : 0,
                    data[symbol]["1d"].signal === "B" ? 1 : data[symbol]["1d"].signal === "S" ? -1 : 0,
                    data[symbol]["1w"].signal === "B" ? 1 : data[symbol]["1w"].signal === "S" ? -1 : 0
                ];

                setTrendData({
                    BTC: formatData("BTCUSDT"),
                    ETH: formatData("ETHUSDT"),
                    SOL: formatData("SOLUSDT"),
                    BNB: formatData("BNBUSDT"),
                });
            } catch (error) {
                console.error("Error fetching the trend data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 30000); // 每30秒更新一次

        return () => clearInterval(intervalId); // 清除定时器
    }, []);

    return trendData;
};

export default useTrendData;