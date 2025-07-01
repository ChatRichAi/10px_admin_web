import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 模拟数据 - 按到期日的期权持仓量
const openInterestData = [
  {
    expiry: '2025/07/01',
    calls: 1200,
    puts: 800,
    callsPercent: 0.67,
    putsPercent: 0.32,
    pcr: 0.67
  },
  {
    expiry: '2025/07/02', 
    calls: 2500,
    puts: 1100,
    callsPercent: 1.10,
    putsPercent: 0.32,
    pcr: 0.44
  },
  {
    expiry: '2025/07/03',
    calls: 800,
    puts: 400,
    callsPercent: 0.32,
    putsPercent: 0.32,
    pcr: 0.50
  },
  {
    expiry: '2025/07/04',
    calls: 13000,
    puts: 12500,
    callsPercent: 9.84,
    putsPercent: 9.84,
    pcr: 0.96
  },
  {
    expiry: '2025/07/11',
    calls: 12000,
    puts: 10000,
    callsPercent: 8.26,
    putsPercent: 8.26,
    pcr: 0.83
  },
  {
    expiry: '2025/07/18',
    calls: 4000,
    puts: 1500,
    callsPercent: 1.99,
    putsPercent: 1.99,
    pcr: 0.38
  },
  {
    expiry: '2025/07/25',
    calls: 40000,
    puts: 27000,
    callsPercent: 26.25,
    putsPercent: 26.25,
    pcr: 0.68
  },
  {
    expiry: '2025/08/29',
    calls: 17000,
    puts: 5000,
    callsPercent: 8.09,
    putsPercent: 8.09,
    pcr: 0.29
  },
  {
    expiry: '2025/09/26',
    calls: 47000,
    puts: 18000,
    callsPercent: 24.34,
    putsPercent: 24.34,
    pcr: 0.38
  },
  {
    expiry: '2025/12/26',
    calls: 25000,
    puts: 12000,
    callsPercent: 14.88,
    putsPercent: 14.88,
    pcr: 0.48
  },
  {
    expiry: '2026/03/27',
    calls: 7000,
    puts: 2000,
    callsPercent: 3.85,
    putsPercent: 3.85,
    pcr: 0.29
  },
  {
    expiry: '2026/06/26',
    calls: 1000,
    puts: 500,
    callsPercent: 0.45,
    putsPercent: 0.45,
    pcr: 0.50
  }
];

const coins = [
  { label: 'BTC', value: 'btc' },
  { label: 'ETH', value: 'eth' },
];

const viewModes = [
  { label: 'Expire', value: 'expire' },
  { label: 'Strike', value: 'strike' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span className="text-xs text-gray-500 dark:text-gray-300">Calls:</span>
            </div>
            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.calls.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span className="text-xs text-gray-500 dark:text-gray-300">Puts:</span>
            </div>
            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.puts.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-300 dark:border-gray-600">
            <span className="text-xs text-gray-500 dark:text-gray-300">PCR:</span>
            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.pcr.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const OptionOpenInterest = ({ className }: { className?: string }) => {
  const [coin, setCoin] = useState('btc');
  const [viewMode, setViewMode] = useState('expire');

  // 计算总PCR
  const totalCalls = openInterestData.reduce((sum, item) => sum + item.calls, 0);
  const totalPuts = openInterestData.reduce((sum, item) => sum + item.puts, 0);
  const totalPCR = totalPuts / totalCalls;

  useEffect(() => {
    // 动态添加CSS样式来控制悬停透明度
    const style = document.createElement('style');
    style.textContent = `
      .option-chart .recharts-bar-rectangle:hover {
        opacity: 0.5 !important;
      }
      .option-chart .recharts-active-bar .recharts-bar-rectangle {
        opacity: 0.5 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Card 
      title={`${coin.toUpperCase()} 期权持仓量 (截止: 2025/07/01)`}
      className={className}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {coins.map(c => (
            <button
              key={c.value}
              className={`px-3 py-1 rounded text-sm border ${coin === c.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
              onClick={() => setCoin(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-theme-secondary">PCR:</span>
            <span className="font-semibold text-theme-primary">{totalPCR.toFixed(2)}</span>
            <span className="text-xs text-theme-tertiary">ⓘ</span>
          </div>
          
          <div className="flex rounded border border-theme-stroke overflow-hidden">
            {viewModes.map(mode => (
              <button
                key={mode.value}
                className={`px-3 py-1 text-sm ${viewMode === mode.value ? 'bg-teal-500 text-white' : 'bg-theme-on-surface-1 text-theme-primary hover:bg-theme-on-surface-2'}`}
                onClick={() => setViewMode(mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          
          <button className="p-1 text-theme-secondary hover:text-theme-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="h-80 option-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={openInterestData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="expiry"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="rect"
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar 
              dataKey="calls" 
              name="Calls"
              stackId="a" 
              fill="#22c55e"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="puts" 
              name="Puts"
              stackId="a" 
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 数据标签显示 */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          <span className="text-theme-secondary">Calls</span>
          <span className="text-theme-primary font-medium">({totalCalls.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded"></span>
          <span className="text-theme-secondary">Puts</span>
          <span className="text-theme-primary font-medium">({totalPuts.toLocaleString()})</span>
        </div>
      </div>
    </Card>
  );
};

export default OptionOpenInterest; 