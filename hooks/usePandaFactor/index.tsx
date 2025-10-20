import { useState, useEffect, useCallback } from 'react';
import { useCache, generateCacheKey } from '@/lib/cache';

// 定义因子数据类型
export interface FactorData {
  symbol: string;
  date: string;
  value: number;
  factor_name: string;
  factor_id: string;
}

// 定义技术指标类型
export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

// 定义因子计算参数
export interface FactorCalculationParams {
  symbol: string;
  start_date: string;
  end_date: string;
  factors: string[];
  timeframe?: '1d' | '1h' | '1m';
}

// 定义Hook的返回类型
export interface UsePandaFactorReturn {
  // 基础数据
  factorData: FactorData[] | null;
  technicalIndicators: TechnicalIndicator[] | null;
  loading: boolean;
  error: string | null;
  
  // 操作方法
  calculateFactors: (params: FactorCalculationParams) => Promise<void>;
  getTechnicalIndicators: (symbol: string, timeframe?: string) => Promise<void>;
  refresh: () => void;
  
  // 状态
  isServiceOnline: boolean;
}

// 默认技术指标列表
const DEFAULT_INDICATORS = [
  'RSI', 'MACD', 'BOLLINGER_BANDS', 'SMA', 'EMA', 'STOCH', 'WILLIAMS_R', 'CCI'
];

// 主Hook函数
export const usePandaFactor = (
  symbol: string = 'BTC',
  autoRefresh: boolean = true,
  refreshInterval: number = 5 * 60 * 1000 // 5分钟
): UsePandaFactorReturn => {
  const [factorData, setFactorData] = useState<FactorData[] | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceOnline, setIsServiceOnline] = useState(false);
  const [lastSymbol, setLastSymbol] = useState<string>(symbol);

  const { getCached, setCached, isCacheValid } = useCache();

  // 检查服务状态
  const checkServiceStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/panda-factor/status', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsServiceOnline(data.status === 'online');
        return data.status === 'online';
      } else {
        setIsServiceOnline(false);
        return false;
      }
    } catch (error) {
      console.error('检查PandaFactor服务状态失败:', error);
      setIsServiceOnline(false);
      return false;
    }
  }, []);

  // 计算因子
  const calculateFactors = useCallback(async (params: FactorCalculationParams) => {
    setLoading(true);
    setError(null);

    // 检查服务状态
    const serviceOnline = await checkServiceStatus();
    if (!serviceOnline) {
      setError('PandaFactor服务不可用，请先启动服务');
      setLoading(false);
      return;
    }

    // 生成缓存键
    const cacheKey = generateCacheKey('panda-factor', {
      symbol: params.symbol,
      start_date: params.start_date,
      end_date: params.end_date,
      factors: params.factors.join(',')
    });

    // 检查缓存
    const cachedData = getCached<FactorData[]>(cacheKey);
    if (cachedData && isCacheValid(cacheKey)) {
      console.log('使用缓存的因子数据:', params.symbol);
      setFactorData(cachedData);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/panda-factor/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(30000), // 30秒超时
      });

      if (!response.ok) {
        throw new Error(`因子计算失败: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setFactorData(result.data);
        // 缓存数据
        setCached(cacheKey, result.data, 5 * 60 * 1000); // 5分钟缓存
      } else {
        throw new Error(result.message || '因子计算失败');
      }
    } catch (err) {
      let errorMessage = '因子计算失败';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，请检查PandaFactor服务状态';
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('因子计算错误:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getCached, setCached, isCacheValid, checkServiceStatus]);

  // 获取技术指标
  const getTechnicalIndicators = useCallback(async (targetSymbol: string, timeframe: string = '1d') => {
    setLoading(true);
    setError(null);

    // 检查服务状态
    const serviceOnline = await checkServiceStatus();
    if (!serviceOnline) {
      setError('PandaFactor服务不可用，请先启动服务');
      setLoading(false);
      return;
    }

    // 生成缓存键
    const cacheKey = generateCacheKey('technical-indicators', {
      symbol: targetSymbol,
      timeframe
    });

    // 检查缓存
    const cachedData = getCached<TechnicalIndicator[]>(cacheKey);
    if (cachedData && isCacheValid(cacheKey)) {
      console.log('使用缓存的技术指标数据:', targetSymbol);
      setTechnicalIndicators(cachedData);
      setLoading(false);
      return;
    }

    try {
      // 计算基础技术指标
      const indicators: TechnicalIndicator[] = [];
      
      // 这里可以调用PandaFactor的API来计算技术指标
      // 目前使用模拟数据
      const mockIndicators: TechnicalIndicator[] = [
        {
          name: 'RSI',
          value: Math.random() * 100,
          signal: Math.random() > 0.5 ? 'bullish' : 'bearish',
          description: '相对强弱指数'
        },
        {
          name: 'MACD',
          value: (Math.random() - 0.5) * 10,
          signal: Math.random() > 0.5 ? 'bullish' : 'bearish',
          description: '移动平均收敛散度'
        },
        {
          name: 'BOLLINGER_BANDS',
          value: Math.random() * 50 + 25,
          signal: 'neutral',
          description: '布林带'
        },
        {
          name: 'SMA_20',
          value: Math.random() * 1000 + 50000,
          signal: 'neutral',
          description: '20日简单移动平均'
        }
      ];

      setTechnicalIndicators(mockIndicators);
      // 缓存数据
      setCached(cacheKey, mockIndicators, 3 * 60 * 1000); // 3分钟缓存
    } catch (err) {
      let errorMessage = '获取技术指标失败';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('技术指标获取错误:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getCached, setCached, isCacheValid, checkServiceStatus]);

  // 手动刷新函数
  const refresh = useCallback(() => {
    if (lastSymbol) {
      getTechnicalIndicators(lastSymbol);
    }
  }, [getTechnicalIndicators, lastSymbol]);

  // 组件挂载时检查服务状态
  useEffect(() => {
    checkServiceStatus();
  }, [checkServiceStatus]);

  // 自动刷新逻辑
  useEffect(() => {
    if (!autoRefresh || !lastSymbol) return;

    const interval = setInterval(() => {
      getTechnicalIndicators(lastSymbol);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, lastSymbol, getTechnicalIndicators]);

  // 错误重试逻辑
  useEffect(() => {
    if (error && !loading) {
      const retryTimeout = setTimeout(() => {
        console.log('重试获取技术指标...');
        getTechnicalIndicators(lastSymbol);
      }, 10000); // 10秒后重试

      return () => clearTimeout(retryTimeout);
    }
  }, [error, loading, getTechnicalIndicators, lastSymbol]);

  return {
    factorData,
    technicalIndicators,
    loading,
    error,
    calculateFactors,
    getTechnicalIndicators,
    refresh,
    isServiceOnline
  };
};

// 导出默认技术指标列表
export { DEFAULT_INDICATORS };

// 导出类型定义
export type {
  FactorData,
  TechnicalIndicator,
  FactorCalculationParams,
  UsePandaFactorReturn
};
