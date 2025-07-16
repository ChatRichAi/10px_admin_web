import { useState, useEffect } from 'react';

// 数据接口定义
export interface VolumeData {
  symbol: string;
  pcr: number;
  total_calls_volume: number;
  total_puts_volume: number;
  strikes: number[];
  calls_data: number[];
  puts_data: number[];
}

export interface ChartDataItem {
  strike: number;
  calls: number;
  puts: number;
}

export interface UseVolumeByStrikeDataParams {
  symbol?: string;
  window?: string;
  strikeMin?: number;
  strikeMax?: number;
}

export interface UseVolumeByStrikeDataReturn {
  data: ChartDataItem[];
  volumeData: VolumeData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVolumeByStrikeData = (params: UseVolumeByStrikeDataParams = {}): UseVolumeByStrikeDataReturn => {
  const {
    symbol = 'BTC',
    window = '24h',
    strikeMin = 96000,
    strikeMax = 118000
  } = params;

  const [data, setData] = useState<ChartDataItem[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams({
        symbol,
        window,
        strike_min: strikeMin.toString(),
        strike_max: strikeMax.toString(),
        force_refresh: 'true'
      });

      const response = await fetch(
        `http://103.106.191.243:8001/deribit/option/strike_volume_summary?${queryParams}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData: VolumeData = await response.json();
      setVolumeData(rawData);
      
      // 转换数据格式
      const chartData: ChartDataItem[] = rawData.strikes.map((strike, index) => ({
        strike,
        calls: rawData.calls_data[index] || 0,
        puts: rawData.puts_data[index] || 0,
      }));
      
      setData(chartData);
    } catch (err) {
      console.error('获取成交量数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol, window, strikeMin, strikeMax]);

  return {
    data,
    volumeData,
    loading,
    error,
    refetch: fetchData,
  };
}; 