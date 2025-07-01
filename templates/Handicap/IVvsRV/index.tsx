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
  { date: '2025-06-25', iv7: 39, rv7: 37, iv14: 36, rv14: 34, iv30: 34, rv30: 32 },
  { date: '2025-06-26', iv7: 38, rv7: 36, iv14: 35, rv14: 33, iv30: 33, rv30: 31 },
  { date: '2025-06-27', iv7: 37, rv7: 35, iv14: 34, rv14: 32, iv30: 32, rv30: 30 },
  { date: '2025-06-28', iv7: 36, rv7: 34, iv14: 33, rv14: 31, iv30: 31, rv30: 29 },
  { date: '2025-06-29', iv7: 36, rv7: 33, iv14: 33, rv14: 30, iv30: 31, rv30: 28 },
  { date: '2025-06-30', iv7: 37, rv7: 34, iv14: 34, rv14: 31, iv30: 32, rv30: 29 },
];

const lines = [
  { key: 'iv7', name: '7D ATM IV', color: '#fde047', dash: true },
  { key: 'rv7', name: '7D RV', color: '#fde047', dash: false },
  { key: 'iv14', name: '14D ATM IV', color: '#4ade80', dash: true },
  { key: 'rv14', name: '14D RV', color: '#4ade80', dash: false },
  { key: 'iv30', name: '30D ATM IV', color: '#f472b6', dash: true },
  { key: 'rv30', name: '30D RV', color: '#f472b6', dash: false },
];

const dateRanges = [
  { label: '1W', value: '1w' },
  { label: '2W', value: '2w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">日期: {label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ background: item.color }}></span>
                <span className="text-xs text-gray-500 dark:text-gray-300">{item.name}:</span>
              </div>
              <span className="text-xs text-gray-700 dark:text-white font-medium">{item.value}</span>
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

const IVvsRV = ({ className }: { className?: string }) => {
  const [dateRange, setDateRange] = useState('1w');
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  return (
    <Card title="IV vs RV" className={className}>
      <div className="mb-2 flex items-center space-x-2">
        {dateRanges.map(r => (
          <button
            key={r.value}
            className={`px-2 py-0.5 rounded text-xs border ${dateRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setDateRange(r.value)}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-4 text-xs text-theme-tertiary">2025-06-23 ~ 2025-06-30</span>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6F767E' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[28, 40]} unit="%" />
            <Tooltip content={<CustomTooltip />} />
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

export default IVvsRV; 