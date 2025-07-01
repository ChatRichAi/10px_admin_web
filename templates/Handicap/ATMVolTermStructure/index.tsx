import React from "react";
import Card from "@/components/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// mock 数据
const data = [
  { term: '1d', atm: 32.1, fwd: 34.2 },
  { term: '3d', atm: 33.8, fwd: 36.5 },
  { term: '11d', atm: 34.5, fwd: 35.0 },
  { term: '25d', atm: 36.2, fwd: 38.1 },
  { term: '88d', atm: 39.0, fwd: 41.5 },
  { term: '270d', atm: 41.3, fwd: 44.7 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">期限: {label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-300">ATM IV:</span>
            <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>{payload[0].payload.atm}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-300">FWD IV:</span>
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>{payload[0].payload.fwd}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ATMVolTermStructure = ({ className }: { className?: string }) => (
  <Card title="ATM波动率期限结构" className={className}>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
          <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[27, 47]} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="atm" name="ATM IV" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4, stroke: '#a78bfa', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="fwd" name="FWD IV" stroke="#34d399" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, stroke: '#34d399', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

export default ATMVolTermStructure; 