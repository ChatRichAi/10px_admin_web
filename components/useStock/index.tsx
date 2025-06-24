import { useState, useEffect } from 'react';

interface StockData {
  price: number | null;
  volatility: number | null;
}

interface StockResponse {
  [key: string]: StockData;
}

const useStockData = (tickers: string[]) => {
  const [data, setData] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://10px.xyz/stock/${tickers.join(',')}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: StockResponse = await response.json();
        setData(result);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tickers]);

  return { data, loading, error };
};

export default useStockData;