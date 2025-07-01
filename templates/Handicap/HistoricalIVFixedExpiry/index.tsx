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
  { date: '2025-06-23', iv1: 40, iv2: 39, iv3: 38 },
  { date: '2025-06-24', iv1: 39, iv2: 38, iv3: 37 },
  { date: '2025-06-25', iv1: 38, iv2: 37, iv3: 36 },
  { date: '2025-06-26', iv1: 37, iv2: 36, iv3: 35 },
  { date: '2025-06-27', iv1: 36, iv2: 35, iv3: 34 },
  { date: '2025-06-28', iv1: 37, iv2: 36, iv3: 35 },
  { date: '2025-06-29', iv1: 38, iv2: 37, iv3: 36 },
  { date: '2025-06-30', iv1: 39, iv2: 38, iv3: 37 },
];

const lines = [
  { key: 'iv1', name: '11JUL25 20d', color: '#a78bfa' },
  { key: 'iv2', name: '18JUL25 27d', color: '#4ade80' },
  { key: 'iv3', name: '25JUL25 34d', color: '#f472b6' },
];

const types = [
  { label: 'ATM', value: 'atm' },
  { label: '25D', value: '25d' },
  { label: '10D', value: '10d' },
];
const dateRanges = [
  { label: '1W', value: '1w' },
  { label: '2W', value: '2w' },
  { label: '1M', value: '1m' },
];
const expiries = [
  '01JUL25 20h', '02JUL25 1d', '03JUL25 2d', '04JUL25 3d', '11JUL25 20d', '18JUL25 27d', '25JUL25 34d', '26SEP25 87d', '26DEC25 178d', '27MAR26 269d', '26JUN26 360d'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">到期日: {label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
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

const HistoricalIVFixedExpiry = ({ className }: { className?: string }) => {
  const [type, setType] = useState('atm');
  const [dateRange, setDateRange] = useState('1w');
  const [selectedExpiries, setSelectedExpiries] = useState(['11JUL25 20d', '18JUL25 27d', '25JUL25 34d']);
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  return (
    <Card title="历史IV-固定到期日" className={className}>
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
        <span className="ml-4 text-xs text-theme-tertiary">2025-06-23 ~ 2025-06-30</span>
      </div>
      <div className="h-80 flex">
        <div className="w-24 flex-shrink-0 flex flex-col justify-center">
          <div className="text-[11px]">
            <CustomLegend visible={visible} onClick={handleLegendClick} />
          </div>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[34, 41]} unit="" />
              <Tooltip content={<CustomTooltip />} />
              {lines.map(line => visible[line.key] && (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default HistoricalIVFixedExpiry; 