import { useState, useEffect } from "react";
import axios from "axios";

interface IndicatorsData {
    indicators: { [key: string]: number };
    signals: { [key: string]: string };
}

const useTechnicalIndicators = (symbol: string, interval: string, lookback: number) => {
    const [data, setData] = useState<IndicatorsData | null>(null); // 更新类型
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://10px.xyz/tid/Technical-indicators`, {
                    params: { symbol, interval, lookback }
                });
                setData(response.data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, interval, lookback]);

    return { data, loading, error };
};

export default useTechnicalIndicators;