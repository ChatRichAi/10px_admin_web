import { useState, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// 定义数据类型
export interface ATMVolTermData {
  term: string;
  atm: number;
  fwd: number;
  timestamp?: number;
}

export interface ATMVolTermResponse {
  data: ATMVolTermData[];
  timestamp: number;
  symbol: string;
  date: string;
}

interface UseATMVolTermProps {
  symbol?: string;
  date?: Dayjs;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useATMVolTerm = ({
  symbol = 'BTC',
  date,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5分钟
}: UseATMVolTermProps = {}) => {
  const [data, setData] = useState<ATMVolTermData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 使用term_structure API获取完整的期限结构数据
      const apiUrl = `http://103.106.191.243:8001/deribit/option/term_structure`;
      
      console.log('[useATMVolTerm] 请求API:', apiUrl);
      console.log('[useATMVolTerm] 请求参数:', { symbol });
      
      const response = await fetch(apiUrl);
      
      console.log('[useATMVolTerm] API响应状态:', response.status);
      console.log('[useATMVolTerm] API响应头:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      console.log('[useATMVolTerm] API原始响应:', jsonData);
      
      // 验证数据结构
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid data format: expected array');
      }
      
      // 处理数据，提取ATM波动率和计算FWD波动率
      const processedData = jsonData.map((item: any) => {
        const atm = Number(item.atm_vol);
        const expiry = item.expiry;
        
        // 验证数据有效性
        if (isNaN(atm)) {
          console.warn('[useATMVolTerm] 无效ATM数据项:', item);
        }
        
        // 计算FWD波动率（这里使用一个简单的偏移，实际应该根据具体需求计算）
        const fwd = isNaN(atm) ? 0 : Number((atm + 2).toFixed(2));
        
        return {
          term: expiry || '',
          atm: isNaN(atm) ? 0 : atm,
          fwd: fwd,
          timestamp: Date.now()
        };
      });
      
      console.log('[useATMVolTerm] 原始数据:', jsonData);
      console.log('[useATMVolTerm] 处理后数据:', processedData);
      
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
      
      fetch(`http://103.106.191.243:8001/deribit/option/term_structure`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(jsonData => {
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid data format: expected array');
          }
          const processedData = jsonData.map((item: any) => {
            const atm = Number(item.atm_vol);
            const expiry = item.expiry;
            
            return {
              term: expiry || '',
              atm: isNaN(atm) ? 0 : atm,
              fwd: isNaN(atm) ? 0 : Number((atm + 2).toFixed(2)),
              timestamp: Date.now()
            };
          });
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
      
      fetch(`http://103.106.191.243:8001/deribit/option/term_structure`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(jsonData => {
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid data format: expected array');
          }
          const processedData = jsonData.map((item: any) => {
            const atm = Number(item.atm_vol);
            const expiry = item.expiry;
            
            return {
              term: expiry || '',
              atm: isNaN(atm) ? 0 : atm,
              fwd: isNaN(atm) ? 0 : Number((atm + 2).toFixed(2)),
              timestamp: Date.now()
            };
          });
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

export default useATMVolTerm; 