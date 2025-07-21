import { useState, useEffect, useCallback } from 'react';

// 定义数据类型
export interface VolConeData {
  window: number;
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  max: number;
  min: number;
  current: number;
  timestamp?: number;
}

export interface VolConeResponse {
  data: VolConeData[];
  timestamp: number;
  symbol: string;
  days: number;
}

interface UseVolConeProps {
  symbol?: string;
  windows?: number[];
  days?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useVolCone = ({
  symbol = 'BTC',
  windows = [7, 14, 30, 60, 90],
  days = 365,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5分钟
}: UseVolConeProps = {}) => {
  const [data, setData] = useState<VolConeData[]>([]);
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
      params.append('days', days.toString());
      windows.forEach(window => {
        params.append('windows', window.toString());
      });
      
      const response = await fetch(`http://103.106.191.243:8001/deribit/option/vol_cone?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // 验证数据结构
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid data format: expected array');
      }
      
      // 处理数据，添加时间戳
      const processedData = jsonData.map((item: any) => ({
        window: Number(item.window) || 0,
        mean: Number(item.mean) || 0,
        p10: Number(item.p10) || 0,
        p50: Number(item.p50) || 0,
        p90: Number(item.p90) || 0,
        max: Number(item.max) || 0,
        min: Number(item.min) || 0,
        current: Number(item.current) || 0,
        timestamp: Date.now()
      }));
      
      setData(processedData);
      setLastUpdate(Date.now());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching volatility cone data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, days]); // 移除windows依赖，避免无限循环

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
    if (newSymbol && newSymbol !== symbol) {
      fetchData();
    }
  }, [symbol, fetchData]);

  // 更新windows
  const updateWindows = useCallback((newWindows: number[]) => {
    if (newWindows && JSON.stringify(newWindows) !== JSON.stringify(windows)) {
      fetchData();
    }
  }, [windows, fetchData]);

  // 更新days
  const updateDays = useCallback((newDays: number) => {
    if (newDays && newDays !== days) {
      fetchData();
    }
  }, [days, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    updateSymbol,
    updateWindows,
    updateDays,
    fetchData
  };
};

export default useVolCone; 