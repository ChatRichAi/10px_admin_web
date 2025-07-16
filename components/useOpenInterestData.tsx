import { useState, useEffect, useCallback } from 'react';

// 后端数据结构接口
export interface BackendOpenInterestData {
  symbol: string;
  pcr: number;
  total_calls: number;
  total_puts: number;
  expiries: string[];
  calls_data: number[];
  puts_data: number[];
}

// 前端数据结构接口
export interface OpenInterestDataItem {
  expiry: string;
  calls: number;
  puts: number;
  callsPercent: number;
  putsPercent: number;
  pcr: number;
}

// 数据转换函数
const transformBackendData = (backendData: BackendOpenInterestData): OpenInterestDataItem[] => {
  const { expiries, calls_data, puts_data, total_calls, total_puts } = backendData;
  
  return expiries.map((expiry, index) => {
    const calls = calls_data[index] || 0;
    const puts = puts_data[index] || 0;
    const callsPercent = total_calls > 0 ? (calls / total_calls) * 100 : 0;
    const putsPercent = total_puts > 0 ? (puts / total_puts) * 100 : 0;
    const pcr = calls > 0 ? puts / calls : 0;
    
    return {
      expiry: expiry.replace(/-/g, '/'), // 将 2025-07-15 转换为 2025/07/15
      calls,
      puts,
      callsPercent,
      putsPercent,
      pcr
    };
  });
};

interface UseOpenInterestDataProps {
  symbol?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  forceRefresh?: boolean;
}

export const useOpenInterestData = ({
  symbol = 'BTC',
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5分钟
  forceRefresh = false
}: UseOpenInterestDataProps = {}) => {
  const [data, setData] = useState<OpenInterestDataItem[]>([]);
  const [rawData, setRawData] = useState<BackendOpenInterestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('symbol', symbol);
      if (forceRefresh) {
        params.append('force_refresh', 'true');
      }
      
      const response = await fetch(`http://103.106.191.243:8001/deribit/option/open_interest_summary?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // 验证数据结构
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid data format: expected object');
      }
      
      // 验证必要字段
      if (!jsonData.symbol || !jsonData.expiries || !Array.isArray(jsonData.expiries) || 
          !jsonData.calls_data || !Array.isArray(jsonData.calls_data) || 
          !jsonData.puts_data || !Array.isArray(jsonData.puts_data)) {
        throw new Error('Invalid data structure: missing required fields');
      }
      
      // 处理数据
      const processedData = transformBackendData(jsonData);
      
      setData(processedData);
      setRawData(jsonData);
      setLastUpdate(Date.now());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching open interest data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, forceRefresh]);

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

  // 强制刷新
  const forceRefreshData = useCallback(() => {
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    params.append('force_refresh', 'true');
    
    fetch(`http://103.106.191.243:8001/deribit/option/open_interest_summary?${params.toString()}`)
      .then(response => response.json())
      .then(jsonData => {
        const processedData = transformBackendData(jsonData);
        setData(processedData);
        setRawData(jsonData);
        setLastUpdate(Date.now());
        setError(null);
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : 'Force refresh failed';
        setError(errorMessage);
        console.error('Error during force refresh:', err);
      });
  }, [symbol]);

  // 更新symbol
  const updateSymbol = useCallback((newSymbol: string) => {
    if (newSymbol && newSymbol !== symbol) {
      fetchData();
    }
  }, [symbol, fetchData]);

  return {
    data,
    rawData,
    loading,
    error,
    lastUpdate,
    refresh,
    forceRefresh: forceRefreshData,
    updateSymbol,
    fetchData
  };
}; 