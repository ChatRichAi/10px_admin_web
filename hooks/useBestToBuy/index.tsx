import { useState, useEffect } from "react";
import { getSymbolType } from './symbolType';

interface HistoricalData {
    date: string;
    price: number;
    percentChange: number;
    tdSupport?: number;
    tdResistance?: number;
}

const useBestToBuyData = (symbol: string, interval: string, limit: number) => {
    const [price, setPrice] = useState(0);
    const [percentChange, setPercentChange] = useState(0);
    const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
    const [tdSupport, setTdSupport] = useState<number | undefined>(undefined);
    const [tdResistance, setTdResistance] = useState<number | undefined>(undefined);

    useEffect(() => {
        const symbolType = getSymbolType(symbol);
        const fetchData = async () => {
            try {
                if (symbolType === 'crypto') {
                const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
                const data = await response.json();
                setPrice(Math.round(parseFloat(data.lastPrice)));
                    setPercentChange(parseFloat(parseFloat(data.priceChangePercent).toFixed(2)));
                } else if (symbolType === 'us') {
                    const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
                    const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}`);
                    const data = await response.json();
                    if (data && data[0]) {
                        setPrice(Math.round(data[0].price));
                        setPercentChange(parseFloat(data[0].changesPercentage.toFixed(2)));
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
                const formattedData = data.map((item: any) => {
                    const open = parseFloat(item[1]);
                    const high = parseFloat(item[2]);
                    const low = parseFloat(item[3]);
                    const close = parseFloat(item[4]);
                    let X;
                    if (close < open) {
                        X = high + (2 * low) + close;
                    } else if (close > open) {
                        X = (2 * high) + low + close;
                    } else {
                        X = high + low + (2 * close);
                    }
                    const tdSupport = Math.round((X / 2) - high);
                    const tdResistance = Math.round((X / 2) - low);

                    return {
                        date: new Date(item[0]).toLocaleDateString(),
                            open, high, low, close,
                        price: Math.round(close),
                            percentChange: parseFloat(((close - open) / open * 100).toFixed(2)),
                        tdSupport,
                        tdResistance
                    };
                });
                setHistoricalData(formattedData);

                // 计算前一天的Demark支撑和阻力
                if (formattedData.length > 1) {
                    const prevDay = formattedData[formattedData.length - 2];
                    const open = parseFloat(data[data.length - 2][1]);
                    const high = parseFloat(data[data.length - 2][2]);
                    const low = parseFloat(data[data.length - 2][3]);
                    const close = parseFloat(data[data.length - 2][4]);
                    let X;
                    if (close < open) {
                        X = high + (2 * low) + close;
                    } else if (close > open) {
                        X = (2 * high) + low + close;
                    } else {
                        X = high + low + (2 * close);
                    }
                    setTdSupport(Math.round((X / 2) - high));
                    setTdResistance(Math.round((X / 2) - low));
                    }
                } else if (symbolType === 'us') {
                    // 用FMP历史收盘模拟K线
                    const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
                    const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?serietype=line&timeseries=${limit}&apikey=${FMP_API_KEY}`);
                    const data = await response.json();
                    if (data && data.historical) {
                        const arr = data.historical.slice(-limit).reverse();
                        const formattedData = arr.map((item: any, idx: number) => {
                            const prev = arr[idx - 1] || item;
                            // open/high/low/close都用close
                            const close = item.close;
                            return {
                                date: item.date,
                                open: close,
                                high: close,
                                low: close,
                                close: close,
                                price: Math.round(close),
                                percentChange: idx > 0 ? parseFloat(((close - prev.close) / prev.close * 100).toFixed(2)) : 0
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
        const intervalId = setInterval(fetchData, 86400000); // 每天更新一次数据

        return () => clearInterval(intervalId);
    }, [symbol, interval, limit]);

    return { price, percentChange, historicalData, tdSupport, tdResistance };
};

export default useBestToBuyData;