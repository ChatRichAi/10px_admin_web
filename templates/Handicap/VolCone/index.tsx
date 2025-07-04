import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useVolConeData } from "@/components/useVolConeData";

// 定义线条配置
const lines = [
  { key: 'current', name: 'Current', color: '#eab308', dash: false },
  { key: 'min', name: 'Minimum', color: '#22c55e', dash: true },
  { key: 'p10', name: '10%', color: '#38bdf8', dash: true },
  { key: 'p50', name: 'Median', color: '#f472b6', dash: false },
  { key: 'p90', name: '90%', color: '#a3e635', dash: true },
  { key: 'max', name: 'Maximum', color: '#a78bfa', dash: false },
];

const types = [
  { label: 'RV', value: 'rv' },
  { label: 'IV', value: 'iv' },
];
const dateRanges = [
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
  { label: '3Y', value: '3y' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // 组装每条线的显示内容
    const items = [
      { name: '当前', value: data.current, color: '#eab308' },
      { name: '最小', value: data.min, color: '#22c55e' },
      { name: '10%', value: data.p10, color: '#38bdf8' },
      { name: '中位数', value: data.p50, color: '#f472b6' },
      { name: '90%', value: data.p90, color: '#a3e635' },
      { name: '最大', value: data.max, color: '#a78bfa' },
    ];
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">期限: {label}</p>
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ background: item.color }}></span>
                <span className="text-xs text-gray-500 dark:text-gray-300">{item.name}:</span>
              </div>
              <span className="text-xs text-gray-700 dark:text-white font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 自定义底部Legend，始终显示所有按钮，变灰/高亮
function CustomLegend({ visible, onClick }: any) {
  return (
    <div className="flex flex-row justify-center items-center gap-4 mt-2 text-xs font-normal leading-tight flex-wrap">
      {lines.map(line => (
        <div
          key={line.key}
          className="flex items-center cursor-pointer select-none"
          onClick={() => onClick(line.key)}
        >
          <span
            className="inline-block mr-2"
            style={{
              width: 18,
              height: 2,
              background: visible[line.key] ? line.color : '#d1d5db',
              borderRadius: 2,
              transition: 'background 0.2s',
            }}
          />
          <span
            className={visible[line.key] ? '' : 'text-gray-400'}
            style={{ color: visible[line.key] ? line.color : '#d1d5db', fontWeight: visible[line.key] ? 400 : 400 }}
          >
            {line.name}
          </span>
        </div>
      ))}
    </div>
  );
}

const VolCone = ({ className }: { className?: string }) => {
  const [type, setType] = useState('rv');
  const [dateRange, setDateRange] = useState('1y');
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));
  
  // 使用自定义Hook获取数据
  const { data, loading, error, refresh, updateDays } = useVolConeData({
    symbol: 'BTC',
    windows: [7, 14, 30, 60, 90],
    days: dateRange === '1y' ? 365 : dateRange === '2y' ? 730 : 1095,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000
  });

  // 当日期范围改变时更新数据
  useEffect(() => {
    const days = dateRange === '1y' ? 365 : dateRange === '2y' ? 730 : 1095;
    updateDays(days);
  }, [dateRange, updateDays]);

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  // 转换数据格式，将window转换为term显示
  const chartData = data.map(item => ({
    term: `${item.window}D`,
    current: item.current,
    min: item.min,
    p10: item.p10,
    p50: item.p50,
    p90: item.p90,
    max: item.max,
  }));

  return (
    <Card title="波动率锥" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {types.map(t => (
            <button
              key={t.value}
              className={`px-2 py-0.5 rounded text-xs border ${type === t.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
          {dateRanges.map(r => (
            <button
              key={r.value}
              className={`px-2 py-0.5 rounded text-xs border ${dateRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
              onClick={() => setDateRange(r.value)}
            >
              {r.label}
            </button>
          ))}
          {loading && (
            <div className="flex items-center gap-1 text-xs text-theme-secondary">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </div>
          )}
        </div>
        <button 
          onClick={refresh}
          className="p-1 text-theme-secondary hover:text-theme-primary disabled:opacity-50"
          disabled={loading}
          title="刷新数据"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
          错误: {error}
        </div>
      )}
      <div className="h-80">
        {loading && !chartData.length ? (
          <div className="flex items-center justify-center h-full text-theme-secondary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              加载中...
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
              <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[0, 'dataMax + 10']} unit="%" />
              <Tooltip content={CustomTooltip} />
              <RechartsLegend
                iconType="plainline"
                wrapperStyle={{ fontSize: 12 }}
                content={() => <CustomLegend visible={visible} onClick={handleLegendClick} />}
              />
              {lines.map(line => visible[line.key] && (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray={line.dash ? "6 3" : undefined}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default VolCone; 