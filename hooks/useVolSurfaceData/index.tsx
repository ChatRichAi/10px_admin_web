import { useState, useEffect, useCallback } from 'react';
import { useCache, generateCacheKey } from '@/lib/cache';

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

  const { getCached, setCached, isCacheValid } = useCache();

  // 获取波动率平面数据
  const fetchData = useCallback(async (targetSymbol: string) => {
    setLoading(true);
    setError(null);

    // 生成缓存键
    const cacheKey = generateCacheKey('vol-surface', { symbol: targetSymbol });

    // 检查缓存
    const cachedData = getCached<VolSurfaceData>(cacheKey);
    if (cachedData && isCacheValid(cacheKey)) {
      console.log('Using cached vol surface data for', targetSymbol);
      setData(cachedData);
      setLoading(false);
      return;
    }

    try {
      // 尝试直接请求API
      const apiUrl = `http://103.106.191.243:8001/deribit/option/vol_surface?symbol=${targetSymbol}&expiries_count=12`;
      let response: Response;
      
      try {
        // 添加超时控制和CORS处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 减少到8秒超时
        
        response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors', // 明确指定CORS模式
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        // 如果直接请求失败，尝试通过代理API
        console.log('Direct API failed, trying proxy...', fetchError);
        const proxyUrl = `/api/proxy-vol-surface?url=${encodeURIComponent(apiUrl)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 减少到12秒超时
        
        response = await fetch(proxyUrl, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
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
        // 缓存数据
        setCached(cacheKey, transformedData, 3 * 60 * 1000); // 3分钟缓存
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      let errorMessage = '获取数据失败';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，可能是CORS问题或服务器不可用';
        } else if (err.message.includes('HTTP error')) {
          errorMessage = `服务器错误: ${err.message}`;
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('VolSurfaceData fetch error:', err);
      setError(errorMessage);
      
      // 不使用模拟数据，只显示错误信息
      console.log('API failed, no fallback to default data');
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