import React, { useState } from "react";
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

// mock 数据
const data = [
  { term: '7D', current: 60, min: 35, p25: 40, median: 45, p75: 50, max: 110 },
  { term: '14D', current: 58, min: 36, p25: 41, median: 46, p75: 51, max: 100 },
  { term: '30D', current: 56, min: 37, p25: 42, median: 47, p75: 52, max: 90 },
  { term: '60D', current: 54, min: 38, p25: 43, median: 48, p75: 53, max: 80 },
  { term: '90D', current: 52, min: 39, p25: 44, median: 49, p75: 54, max: 70 },
  { term: '180D', current: 50, min: 40, p25: 45, median: 50, p75: 55, max: 60 },
];

const lines = [
  { key: 'current', name: 'Current', color: '#eab308', dash: false },
  { key: 'min', name: 'Minimum', color: '#22c55e', dash: true },
  { key: 'p25', name: '25%', color: '#38bdf8', dash: true },
  { key: 'median', name: 'Median', color: '#f472b6', dash: false },
  { key: 'p75', name: '75%', color: '#a3e635', dash: true },
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
      { name: '25%', value: data.p25, color: '#38bdf8' },
      { name: '中位数', value: data.median, color: '#f472b6' },
      { name: '75%', value: data.p75, color: '#a3e635' },
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

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  return (
    <Card title="波动率锥" className={className}>
      <div className="mb-2 flex items-center space-x-2">
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
        <span className="ml-4 text-xs text-theme-tertiary">2024-06-30 ~ 2025-06-30</span>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[20, 120]} unit="%" />
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
      </div>
    </Card>
  );
};

export default VolCone; 