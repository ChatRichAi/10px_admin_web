import { useState, useEffect, useCallback } from 'react';

// 定义波动率微笑数据类型
export interface VolSmileDataPoint {
  delta: string;    // Delta值，如 '5P', '10P', 'ATM', '10C', '5C'
  [key: string]: string | number;  // 动态键值对，如 d1, d2, d3 等
}

export interface ExpiryConfig {
  label: string;    // 显示标签，如 '01JUL25'
  value: string;    // 数据键名，如 'd1'
  color: string;    // 颜色代码，如 '#eab308'
}

export interface LineConfig {
  key: string;      // 唯一标识符
  name: string;     // 显示名称
  color: string;    // 线条颜色
}

export interface VolSmileData {
  data: VolSmileDataPoint[];
  expiries: ExpiryConfig[];
  lines: LineConfig[];
  timestamp?: string;
  symbol?: string;
}

// 定义Hook的返回类型
export interface UseVolSmileDataReturn {
  data: VolSmileData | null;
  loading: boolean;
  error: string | null;
  fetchData: (symbol: string) => Promise<void>;
  refresh: () => void;
}

// 默认模拟数据
const defaultData: VolSmileData = {
  data: [
    { delta: '5P', d1: 32, d2: 28, d3: 35 },
    { delta: '10P', d1: 30, d2: 27, d3: 33 },
    { delta: '20P', d1: 29, d2: 26, d3: 32 },
    { delta: '30P', d1: 28, d2: 25, d3: 31 },
    { delta: '40P', d1: 29, d2: 26, d3: 32 },
    { delta: 'ATM', d1: 31, d2: 28, d3: 34 },
    { delta: '40C', d1: 33, d2: 30, d3: 36 },
    { delta: '30C', d1: 34, d2: 31, d3: 37 },
    { delta: '20C', d1: 36, d2: 33, d3: 39 },
    { delta: '10C', d1: 38, d2: 35, d3: 41 },
    { delta: '5C', d1: 40, d2: 37, d3: 43 },
  ],
  expiries: [
    { label: '01JUL25', value: 'd1', color: '#eab308' },
    { label: '26SEP25', value: 'd2', color: '#22d3ee' },
    { label: '26DEC25', value: 'd3', color: '#a78bfa' },
  ],
  lines: [
    { key: 'd1', name: '01JUL25', color: '#eab308' },
    { key: 'd2', name: '26SEP25', color: '#22d3ee' },
    { key: 'd3', name: '26DEC25', color: '#a78bfa' },
  ],
  timestamp: new Date().toISOString(),
  symbol: 'BTC'
};

// 颜色配置
const colorPalette = [
  '#eab308', '#22d3ee', '#a78bfa', '#f472b6', '#a3e635', 
  '#f59e42', '#f43f5e', '#6366f1', '#06b6d4', '#38bdf8'
];

// 生成足够多的不同颜色
function getColor(index: number) {
  if (index < colorPalette.length) return colorPalette[index];
  // 超出内置调色板后，自动用HSL色环生成
  const hue = (index * 360 / 12) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// 验证数据格式的函数
const validateVolSmileData = (data: any): data is VolSmileData => {
  return (
    data &&
    Array.isArray(data.data) &&
    Array.isArray(data.expiries) &&
    Array.isArray(data.lines) &&
    data.data.length > 0 &&
    data.expiries.length > 0 &&
    data.lines.length > 0
  );
};

// 转换API数据格式的函数
const transformApiData = (apiData: any, symbol: string): VolSmileData => {
  // 如果API返回的是标准格式，直接使用
  if (validateVolSmileData(apiData)) {
    return {
      ...apiData,
      timestamp: new Date().toISOString(),
      symbol
    };
  }

  // 如果API返回的是其他格式，需要转换
  // 这里假设API返回的是 { data: [...], expiries: [...] } 格式
  if (apiData.data && Array.isArray(apiData.data)) {
    const expiries = apiData.expiries || [];
    const lines = expiries.map((expiry: any, index: number) => ({
      key: expiry.value || `d${index + 1}`,
      name: expiry.label || expiry.name || `Expiry ${index + 1}`,
      color: expiry.color || getColor(index)
    }));

    return {
      data: apiData.data,
      expiries,
      lines,
      timestamp: new Date().toISOString(),
      symbol
    };
  }

  // 如果格式不匹配，返回默认数据
  return {
    ...defaultData,
    symbol
  };
};

// 主Hook函数
export const useVolSmileData = (
  symbol: string = 'BTC',
  autoRefresh: boolean = true,
  refreshInterval: number = 5 * 60 * 1000 // 5分钟
): UseVolSmileDataReturn => {
  const [data, setData] = useState<VolSmileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSymbol, setLastSymbol] = useState<string>(symbol);

  // 获取波动率微笑数据
  const fetchData = useCallback(async (targetSymbol: string) => {
    setLoading(true);
    setError(null);

    try {
      // 请求波动率微笑API
      const apiUrl = `http://103.106.191.243:8001/deribit/option/vol_smile?symbol=${targetSymbol.toUpperCase()}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('VolSmile API response:', result);

      // 转换API数据格式
      const transformedData = transformApiData(result, targetSymbol);

      // 验证转换后的数据
      if (validateVolSmileData(transformedData)) {
        setData(transformedData);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取波动率微笑数据失败';
      setError(errorMessage);
      console.error('VolSmile API error:', err);

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
        console.log('Retrying vol smile data fetch...');
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

// 导出验证函数
export { validateVolSmileData }; 