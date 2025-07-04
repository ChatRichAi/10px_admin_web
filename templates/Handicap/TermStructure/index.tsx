import React, { useState } from "react";
import Card from "@/components/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTermStructureData } from '@/components/useTermStructureData';

const lines = [
  { key: '5d_put', name: '5D Put', color: '#eab308' },
  { key: '10d_put', name: '10D Put', color: '#22c55e' },
  { key: '15d_put', name: '15D Put', color: '#0ea5e9' },
  { key: '20d_put', name: '20D Put', color: '#a21caf' },
  { key: '25d_put', name: '25D Put', color: '#84cc16' },
  { key: 'atm_vol', name: 'ATM', color: '#f472b6' },
  { key: '25d_call', name: '25D Call', color: '#f59e42' },
  { key: '20d_call', name: '20D Call', color: '#f43f5e' },
  { key: '15d_call', name: '15D Call', color: '#6366f1' },
  { key: '10d_call', name: '10D Call', color: '#06b6d4' },
  { key: '5d_call', name: '5D Call', color: '#38bdf8' },
];

function CustomLegend({ visible, onClick }: { visible: Record<string, boolean>, onClick: (key: string) => void }) {
  return (
    <div className="flex flex-col space-y-1 mt-2 text-xs font-normal leading-tight">
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

const TermStructure = ({ className }: { className?: string }) => {
  const { data, loading, error } = useTermStructureData();
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  if (loading) {
    return (
      <Card title="期限结构" className={className}>
        <div className="h-80 flex items-center justify-center">加载中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="期限结构" className={className}>
        <div className="h-80 flex items-center justify-center text-red-500">错误: {error}</div>
      </Card>
    );
  }

  return (
    <Card title="期限结构" className={className}>
      <div className="h-80 flex">
        <div className="w-32 flex-shrink-0">
          <CustomLegend visible={visible} onClick={handleLegendClick} />
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
              <XAxis dataKey="expiry" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={['auto', 'auto']} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              {lines.map(line => visible[line.key] && (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 3, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default TermStructure; 