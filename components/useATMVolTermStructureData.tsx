import { useState, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// 定义数据类型
export interface ATMVolTermStructureData {
  term: string;
  atm: number;
  fwd: number;
  timestamp?: number;
}

export interface ATMVolTermStructureResponse {
  data: ATMVolTermStructureData[];
  timestamp: number;
  symbol: string;
  date: string;
}

interface UseATMVolTermStructureDataProps {
  symbol?: string;
  date?: Dayjs;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useATMVolTermStructureData = ({
  symbol = 'BTC',
  date,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5分钟
}: UseATMVolTermStructureDataProps = {}) => {
  const [data, setData] = useState<ATMVolTermStructureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateParam = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const response = await fetch(`http://103.106.191.243:8001/deribit/option/atm_vol_term?symbol=${symbol}&date=${dateParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // 验证数据结构
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid data format: expected array');
      }
      
      // 处理数据，对fwd加微小偏移便于视觉区分
      const processedData = jsonData.map((item: any) => ({
        term: item.term || '',
        atm: Number(item.atm) || 0,
        fwd: Number((Number(item.fwd || 0) + 2).toFixed(2)), // 加2%偏移
        timestamp: Date.now()
      }));
      
      setData(processedData);
      setLastUpdate(Date.now());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching ATM volatility term structure data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, date]);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // 手动刷新
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // 更新symbol
  const updateSymbol = useCallback((newSymbol: string) => {
    // 这里可以添加symbol验证逻辑
    if (newSymbol && newSymbol !== symbol) {
      // 直接调用fetch而不是依赖fetchData
      setLoading(true);
      setError(null);
      
      const dateParam = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      fetch(`http://103.106.191.243:8001/deribit/option/atm_vol_term?symbol=${newSymbol}&date=${dateParam}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(jsonData => {
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid data format: expected array');
          }
          const processedData = jsonData.map((item: any) => ({
            term: item.term || '',
            atm: Number(item.atm) || 0,
            fwd: Number((Number(item.fwd || 0) + 2).toFixed(2)),
            timestamp: Date.now()
          }));
          setData(processedData);
          setLastUpdate(Date.now());
        })
        .catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          console.error('Error fetching ATM volatility term structure data:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [symbol, date]);

  // 更新日期
  const updateDate = useCallback((newDate: Dayjs) => {
    if (newDate && (!date || !newDate.isSame(date))) {
      // 直接调用fetch而不是依赖fetchData
      setLoading(true);
      setError(null);
      
      const dateParam = newDate.format('YYYY-MM-DD');
      fetch(`http://103.106.191.243:8001/deribit/option/atm_vol_term?symbol=${symbol}&date=${dateParam}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(jsonData => {
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid data format: expected array');
          }
          const processedData = jsonData.map((item: any) => ({
            term: item.term || '',
            atm: Number(item.atm) || 0,
            fwd: Number((Number(item.fwd || 0) + 2).toFixed(2)),
            timestamp: Date.now()
          }));
          setData(processedData);
          setLastUpdate(Date.now());
        })
        .catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(errorMessage);
          console.error('Error fetching ATM volatility term structure data:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [symbol, date]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    updateSymbol,
    updateDate,
    fetchData
  };
}; 