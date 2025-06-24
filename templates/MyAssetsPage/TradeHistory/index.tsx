import React from 'react';
import './TradeHistory.css'; // 引入CSS文件
import { useColorMode } from '@chakra-ui/react';

interface Trade {
  id: number;
  pair: string;
  amount: string;
  openPrice: number;
  openTime: string;
  duration: string;
  closePrice: number;
  closeTime: string;
  profit: number;
  fee: number;
  api: string;
}

const TradeHistory: React.FC = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  // 模拟数据
  const trades: Trade[] = [
    {
      id: 332105,
      pair: 'ETHUSDT',
      amount: '2.000 ≈ $7.20万',
      openPrice: 3600,
      openTime: '2024-04-19 10:30:00',
      duration: '2小时 15分钟 30秒',
      closePrice: 3550,
      closeTime: '2024-04-19 12:45:30',
      profit: -100,
      fee: 30,
      api: 'BG'
    },
    {
      id: 332104,
      pair: 'BTCUSDT',
      amount: '0.300 ≈ $1.80万',
      openPrice: 59837.5,
      openTime: '2024-04-18 00:06:11',
      duration: '0小时 1分钟 30秒',
      closePrice: 60068.3,
      closeTime: '2024-04-18 00:07:41',
      profit: 90.828,
      fee: 22,
      api: 'BG'
    },
    {
      id: 332103,
      pair: 'ICPUSDT',
      amount: '365.00 ≈ $4998.88',
      openPrice: 13.696,
      openTime: '2024-04-15 17:50:45',
      duration: '1小时 36分钟 54秒',
      closePrice: 13.489,
      closeTime: '2024-04-15 19:27:39',
      profit: 81.328,
      fee: 6,
      api: 'BG'
    },
    {
      id: 332102,
      pair: 'BTCUSDT',
      amount: '0.5 ≈ $3.23万',
      openPrice: 64522,
      openTime: '2024-04-14 16:07:39',
      duration: '1小时 18分钟 44秒',
      closePrice: 64168,
      closeTime: '2024-04-14 17:26:23',
      profit: 215.81,
      fee: 39,
      api: 'BG'
    },
    {
      id: 332101,
      pair: 'BTCUSDT',
      amount: '0.500 ≈ $3.23万',
      openPrice: 64630.5,
      openTime: '2024-04-14 15:06:05',
      duration: '0小时 43分钟 24秒',
      closePrice: 64333,
      closeTime: '2024-04-14 15:49:29',
      profit: 187.44,
      fee: 39,
      api: 'BG'
    },
    {
      id: 332100,
      pair: 'BTCUSDT',
      amount: '0.5 ≈ $3.56万',
      openPrice: 71200,
      openTime: '2024-04-11 16:49:12',
      duration: '0小时 16分钟 46秒',
      closePrice: 70858,
      closeTime: '2024-04-11 17:05:58',
      profit: 213.77,
      fee: 43,
      api: 'BG'
    }
  ];

  return (
    <div className={isDark ? 'bg-theme-on-surface-2 p-4 rounded-lg shadow' : 'bg-white p-4 rounded-lg shadow'}>
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : ''}`}>交易历史</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className={isDark ? 'bg-[#23272F] rounded-t-lg' : 'bg-gray-100 rounded-t-lg'}>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>ID</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>币种/仓位</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>开仓价</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>持仓时间</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>平仓价</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>已实现盈亏</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>手续费</th>
              <th className={`px-4 py-2 text-left ${isDark ? 'text-gray-400' : ''}`}>API名称</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className={isDark ? 'border-b border-[#2D3748]' : 'border-b'}>
                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : ''}`}>{trade.id}</td>
                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : ''}`}>
                  {trade.pair}<br/>
                  <span className="text-sm text-gray-500">{trade.amount}</span>
                </td>
                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : ''}`}>
                  ${trade.openPrice.toFixed(1)}<br/>
                  <span className="text-sm text-gray-500">{trade.openTime}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`border rounded-full px-3 py-1 text-sm ${
                    trade.profit >= 0 
                      ? (isDark ? 'border-green-400 text-green-300' : 'border-green-400 text-green-600')
                      : (isDark ? 'border-red-400 text-red-300' : 'border-red-400 text-red-600')
                  } duration`}>
                    {trade.duration}
                  </span>
                </td>
                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : ''}`}>
                  ${trade.closePrice.toFixed(1)}<br/>
                  <span className="text-sm text-gray-500">{trade.closeTime}</span>
                </td>
                <td className={`${trade.profit >= 0 ? (isDark ? 'text-green-300' : 'text-green-500') : (isDark ? 'text-red-300' : 'text-red-500')} px-4 py-2`}>
                  ${trade.profit.toFixed(3)}
                </td>
                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : ''}`}>${trade.fee}</td>
                <td className={`px-4 py-2 ${isDark ? 'text-gray-300' : ''}`}>{trade.api}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;