import { useState, useEffect } from 'react';

export interface TermStructurePoint {
  expiry: string;
  atm_vol: number;
}

export const useTermStructureData = () => {
  const [data, setData] = useState<TermStructurePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://103.106.191.243:8001/deribit/option/term_structure')
      .then(res => {
        if (!res.ok) throw new Error('网络错误');
        return res.json();
      })
      .then(json => setData(json))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}; 