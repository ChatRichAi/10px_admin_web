import { useState, useEffect } from "react";
import { getSymbolType } from '../useBestToBuy/symbolType';

interface HistoricalData {
    date: string;
    price: number;
    percentChange: number;
}

const useBinanceData = (symbol: string, interval: string, limit: number) => {
    const [price, setPrice] = useState(0);
    const [percentChange, setPercentChange] = useState(0);
    const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

    useEffect(() => {
        const symbolType = getSymbolType(symbol);
        const fetchData = async () => {
            try {
                if (symbolType === 'crypto') {
                const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
                const data = await response.json();
                setPrice(parseFloat(data.lastPrice));
                    setPercentChange(parseFloat(data.priceChangePercent));
                } else if (symbolType === 'us') {
                    const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
                    const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`);
                    const data = await response.json();
                    if (data && data[0]) {
                        setPrice(data[0].price);
                        setPercentChange(data[0].changesPercentage);
                    }
                }
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        const fetchHistoricalData = async () => {
            try {
                if (symbolType === 'crypto') {
                const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
                const data = await response.json();
                const formattedData = data.map((item: any) => ({
                    date: new Date(item[0]).toLocaleDateString(),
                    price: parseFloat(item[4]),
                    percentChange: parseFloat(((item[4] - item[1]) / item[1] * 100).toFixed(2))
                }));
                setHistoricalData(formattedData);
                } else if (symbolType === 'us') {
                    const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
                    // FMP免费API无历史K线，使用historical-price-full接口近30日收盘模拟
                    const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?serietype=line&timeseries=${limit}&apikey=${FMP_API_KEY}`);
                    const data = await response.json();
                    if (data && data.historical) {
                        const arr = data.historical.slice(-limit).reverse();
                        const formattedData = arr.map((item: any, idx: number) => {
                            const prev = arr[idx - 1] || item;
                            return {
                                date: item.date,
                                price: item.close,
                                percentChange: idx > 0 ? parseFloat(((item.close - prev.close) / prev.close * 100).toFixed(2)) : 0
                            };
                        });
                        setHistoricalData(formattedData);
                    } else {
                        setHistoricalData([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching historical data", error);
            }
        };

        fetchData();
        fetchHistoricalData();
        const intervalId = setInterval(fetchData, 1000); // 每1秒更新一次数据

        return () => clearInterval(intervalId);
    }, [symbol, interval, limit]);

    return { price, percentChange, historicalData };
};

export default useBinanceData;