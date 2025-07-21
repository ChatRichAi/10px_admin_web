import { useState, useEffect } from "react";

export interface GammaMeta {
  stockPrice: number;
  callWall: number;
  putWall: number;
  zeroGamma: number | null;
}

export interface GammaData {
  strike: number;
  callGamma: number;
  putGamma: number;
}

export function useGamma(symbol: string) {
  const [data, setData] = useState<GammaData[]>([]);
  const [meta, setMeta] = useState<GammaMeta>({ stockPrice: 0, callWall: 0, putWall: 0, zeroGamma: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://103.106.191.243:8001/deribit/option/gamma_distribution?symbol=${symbol}`)
      .then(res => {
        if (!res.ok) throw new Error('网络错误');
        return res.json();
      })
      .then(res => {
        setData(res.data || []);
        setMeta(res.meta || { stockPrice: 0, callWall: 0, putWall: 0, zeroGamma: null });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, meta, loading, error };
}

export default useGamma; 