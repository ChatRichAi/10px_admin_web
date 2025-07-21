import { useEffect, useState } from "react";
import Card from "@/components/Card";
import useTechnicalIndicators from "@/hooks/useTid";
import axios from "axios";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface IndicatorsData {
    indicators: { [key: string]: number | null };
    signals: { [key: string]: string };
}

const TechnicalIndicatorsBoard = () => {
    const [currentTime, setCurrentTime] = useState("");
    const [indicatorsData, setIndicatorsData] = useState<IndicatorsData>({ indicators: {}, signals: {} });
    const [isClient, setIsClient] = useState(false);
    const [interval, setInterval] = useState("1d");
    const [symbol, setSymbol] = useState("BTCUSDT");
    const [symbols, setSymbols] = useState<string[]>([]);

    useEffect(() => {
        setIsClient(true);
        setCurrentTime(new Date().toLocaleString());

        axios.get('https://api.binance.com/api/v3/ticker/24hr')
            .then(response => {
                const sortedPairs = response.data
                    .sort((a: { quoteVolume: number }, b: { quoteVolume: number }) => b.quoteVolume - a.quoteVolume)
                    .slice(0, 50)
                    .map((item: { symbol: string }) => item.symbol);
                setSymbols(sortedPairs);
            })
            .catch(error => {
                console.error("Error fetching trading pairs:", error);
            });
    }, []);

    useEffect(() => {
        const url = `https://10px.xyz/tid/Technical-indicators?symbol=${symbol}&interval=${interval}&lookback=30`;
        console.log("Fetching data from URL:", url);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched data:", data);
                setIndicatorsData(data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, [symbol, interval]);

    const renderIndicators = () => {
        return (
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <ul className="space-y-4">
                        {Object.entries(indicatorsData.indicators).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                <div className="text-sm font-bold text-gray-700">{key}</div>
                                <div className="ml-4 text-sm text-gray-500">{value !== null ? value : 'N/A'}</div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <ul className="space-y-4">
                        {Object.entries(indicatorsData.signals).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                <div className="text-sm font-bold text-gray-700">{key}</div>
                                <div className={`font-bold ml-4 text-sm ${value === '买入' ? 'text-green-500' : value === '卖出' ? 'text-red-500' : 'text-gray-500'}`}>{value}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <Card
            className="flex-1 h-full mt-8 p-6"
            title="技术指标看板"
            tooltip="技术指标同频越多共振胜率越高"
            seeAllUrl="/technical-indicators-board"
        >
            <div className="p-4 h-full flex flex-col justify-between">
                <div className="flex justify-start space-x-2 mb-4">
                    <Autocomplete
                        options={symbols}
                        value={symbol}
                        onChange={(event, newValue) => setSymbol(newValue || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="选择交易对"
                                variant="outlined"
                                className="bg-white"
                                sx={{ width: '200px', height: '40px' }} // 调整尺寸
                            />
                        )}
                    />
                </div>
                <div className="flex-1">
                    {isClient && renderIndicators()}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex justify-start space-x-2">
                        {["15m", "1h", "4h", "1d"].map(opt => (
                            <button
                                key={opt}
                                className={`px-2 py-1 rounded ${interval === opt ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}
                                onClick={() => setInterval(opt)}
                            >
                                {opt}
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

export default TechnicalIndicatorsBoard;