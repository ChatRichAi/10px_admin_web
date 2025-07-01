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

// mock 数据
const data = [
  { date: '01JUL25', p5: 42, p10: 40, p15: 39, p20: 38, p25: 37, atm: 36, c25: 37, c20: 38, c15: 39, c10: 40, c5: 42 },
  { date: '03JUL25', p5: 44, p10: 42, p15: 41, p20: 40, p25: 39, atm: 38, c25: 39, c20: 40, c15: 41, c10: 42, c5: 44 },
  { date: '11JUL25', p5: 46, p10: 44, p15: 43, p20: 42, p25: 41, atm: 40, c25: 41, c20: 42, c15: 43, c10: 44, c5: 46 },
  { date: '25JUL25', p5: 48, p10: 46, p15: 45, p20: 44, p25: 43, atm: 42, c25: 43, c20: 44, c15: 45, c10: 46, c5: 48 },
  { date: '26SEP25', p5: 50, p10: 48, p15: 47, p20: 46, p25: 45, atm: 44, c25: 45, c20: 46, c15: 47, c10: 48, c5: 50 },
  { date: '27MAR26', p5: 52, p10: 50, p15: 49, p20: 48, p25: 47, atm: 46, c25: 47, c20: 48, c15: 49, c10: 50, c5: 52 },
];

const lines = [
  { key: 'p5', name: '5D Put', color: '#eab308' },
  { key: 'p10', name: '10D Put', color: '#22c55e' },
  { key: 'p15', name: '15D Put', color: '#0ea5e9' },
  { key: 'p20', name: '20D Put', color: '#a21caf' },
  { key: 'p25', name: '25D Put', color: '#84cc16' },
  { key: 'atm', name: 'ATM', color: '#f472b6' },
  { key: 'c25', name: '25D Call', color: '#f59e42' },
  { key: 'c20', name: '20D Call', color: '#f43f5e' },
  { key: 'c15', name: '15D Call', color: '#6366f1' },
  { key: 'c10', name: '10D Call', color: '#06b6d4' },
  { key: 'c5', name: '5D Call', color: '#38bdf8' },
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
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

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
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[35, 55]} unit="%" />
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