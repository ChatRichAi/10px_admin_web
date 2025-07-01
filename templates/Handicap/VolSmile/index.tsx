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
  { delta: '5P', d1: 32, d2: 28, d3: 35 },
  { delta: '10P', d1: 30, d2: 27, d3: 33 },
  { delta: '20P', d1: 29, d2: 26, d3: 32 },
  { delta: '30P', d1: 28, d2: 25, d3: 31 },
  { delta: '40P', d1: 29, d2: 26, d3: 32 },
  { delta: 'ATM', d1: 31, d2: 28, d3: 34 },
  { delta: '40C', d1: 33, d2: 30, d3: 36 },
  { delta: '30C', d1: 34, d2: 31, d3: 37 },
  { delta: '20C', d1: 36, d2: 33, d3: 39 },
  { delta: '10C', d1: 38, d2: 35, d3: 41 },
  { delta: '5C', d1: 40, d2: 37, d3: 43 },
];

const expiries = [
  { label: '01JUL25', value: 'd1', color: '#eab308' },
  { label: '26SEP25', value: 'd2', color: '#22d3ee' },
  { label: '26DEC25', value: 'd3', color: '#a78bfa' },
];

const lines = [
  { key: 'd1', name: '01JUL25', color: '#eab308' },
  { key: 'd2', name: '26SEP25', color: '#22d3ee' },
  { key: 'd3', name: '26DEC25', color: '#a78bfa' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#23262F] border border-[#6F767E] rounded-xl shadow-lg p-4 text-xs min-w-[160px]">
        <div className="text-white text-base font-bold mb-2">Delta: {label}</div>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded" style={{ background: item.color }}></span>
                <span className="font-semibold" style={{ color: item.color }}>{item.name}</span>
              </div>
              <span className="text-white font-bold">{item.value}%</span>
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

const VolSmile = ({ className }: { className?: string }) => {
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  return (
    <Card title="模型波动率微笑" className={className}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis dataKey="delta" tick={{ fontSize: 12, fill: '#6F767E' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[25, 45]} unit="%" />
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
                dot={{ r: 3, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default VolSmile; 