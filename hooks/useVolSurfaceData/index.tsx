import { useState, useEffect, useCallback } from 'react';

// 定义数据类型
export interface VolSurfaceData {
  xAxis: string[];
  yAxis: string[];
  zData: (number | null)[][];
  timestamp?: string;
  symbol?: string;
}

// 定义Hook的返回类型
export interface UseVolSurfaceDataReturn {
  data: VolSurfaceData | null;
  loading: boolean;
  error: string | null;
  fetchData: (symbol: string) => Promise<void>;
  refresh: () => void;
}

// 默认模拟数据
const defaultData: VolSurfaceData = {
  xAxis: ['30JUN25', '23OCT25', '16FEB26', '12JUN26', '05OCT26'],
  yAxis: ['10P', '20P', '30C', '40C'],
  zData: [
    [30, 32, 35, 38],
    [31, 33, 36, 39],
    [33, 35, 38, 41],
    [36, 38, 41, 44],
    [38, 41, 44, 48],
  ],
  timestamp: new Date().toISOString(),
  symbol: 'BTC'
};

// 验证数据格式的函数（兼容 zData 为 null）
const validateVolSurfaceData = (data: any): data is VolSurfaceData => {
  return (
    data &&
    Array.isArray(data.xAxis) &&
    Array.isArray(data.yAxis) &&
    Array.isArray(data.zData) &&
    data.zData.every((row: any) => Array.isArray(row) && row.every((val: any) => typeof val === 'number' || val === null))
  );
};

// 转换API数据格式的函数
const transformApiData = (apiData: any): VolSurfaceData => {
  // 如果 yAxis 已经是 ["10P", "20P", ...] 这种格式，直接用
  const isOptionTypeFormat = Array.isArray(apiData.yAxis) && apiData.yAxis.every((item: string) => /\d+(P|C)/.test(item));

  return {
    xAxis: apiData.xAxis || [],
    yAxis: isOptionTypeFormat ? apiData.yAxis : (apiData.yAxis || []),
    zData: apiData.zData || [],
    timestamp: new Date().toISOString(),
    symbol: apiData.symbol || 'BTC'
  };
};

// 主Hook函数
export const useVolSurfaceData = (
  symbol: string = 'BTC',
  autoRefresh: boolean = true,
  refreshInterval: number = 5 * 60 * 1000 // 5分钟
): UseVolSurfaceDataReturn => {
  const [data, setData] = useState<VolSurfaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSymbol, setLastSymbol] = useState<string>(symbol);

  // 获取波动率平面数据
  const fetchData = useCallback(async (targetSymbol: string) => {
    setLoading(true);
    setError(null);

    try {
      // 直接请求新的API
      const apiUrl = `http://103.106.191.243:8000/model_vol_surface_matrix`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // 直接适配返回格式
      const transformedData = {
        xAxis: result.xAxis || [],
        yAxis: result.yAxis || [],
        zData: result.zData || [],
        timestamp: new Date().toISOString(),
        symbol: targetSymbol
      };

      // 检查是否所有波动率数据都是null
      const allNull = transformedData.zData.every((row: (number | null)[]) => row.every((val: number | null) => val === null));
      if (allNull) {
        setError('API返回的波动率数据为空，请检查后端数据源');
      }

      // 验证数据格式
      if (validateVolSurfaceData(transformedData)) {
        setData(transformedData);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取数据失败';
      setError(errorMessage);

      // 如果API失败，使用默认数据
      if (!data) {
        setData({
          ...defaultData,
          symbol: targetSymbol
        });
      }
    } finally {
      setLoading(false);
    }
  }, [data]);

  // 手动刷新函数
  const refresh = useCallback(() => {
    if (lastSymbol) {
      fetchData(lastSymbol);
    }
  }, [fetchData, lastSymbol]);

  // 组件挂载时获取数据
  useEffect(() => {
    if (symbol !== lastSymbol) {
      setLastSymbol(symbol);
      fetchData(symbol);
    } else if (!data) {
      // 首次加载
      fetchData(symbol);
    }
  }, [symbol, lastSymbol, fetchData, data]);

  // 自动刷新逻辑
  useEffect(() => {
    if (!autoRefresh || !lastSymbol) return;

    const interval = setInterval(() => {
      fetchData(lastSymbol);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, lastSymbol, fetchData]);

  // 错误重试逻辑
  useEffect(() => {
    if (error && !loading) {
      const retryTimeout = setTimeout(() => {
        console.log('Retrying vol surface data fetch...');
        fetchData(lastSymbol);
      }, 10000); // 10秒后重试

      return () => clearTimeout(retryTimeout);
    }
  }, [error, loading, fetchData, lastSymbol]);

  return {
    data,
    loading,
    error,
    fetchData,
    refresh
  };
};

// 导出默认数据供其他组件使用
export { defaultData };

// 导出验证函数
export { validateVolSurfaceData };