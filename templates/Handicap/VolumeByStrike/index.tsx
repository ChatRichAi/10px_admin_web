import React, { useState } from "react";
import Card from "@/components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

// mock 数据
const expiries = [
  '30JUN25', '01JUL25', '03JUL25', '04JUL25', '11JUL25', '18JUL25', '29AUG25', '26SEP25', '26DEC25', '27MAR26', '26JUN26'
];
const data = [
  { expiry: '30JUN25', strike: 118000, buy: 10, sell: 5 },
  { expiry: '01JUL25', strike: 117000, buy: 30, sell: 20 },
  { expiry: '03JUL25', strike: 116000, buy: 0, sell: 0 },
  { expiry: '04JUL25', strike: 115000, buy: 200, sell: 300 },
  { expiry: '11JUL25', strike: 114000, buy: 100, sell: 150 },
  { expiry: '18JUL25', strike: 113000, buy: 400, sell: 350 },
  { expiry: '29AUG25', strike: 112000, buy: 1000, sell: 800 },
  { expiry: '26SEP25', strike: 111000, buy: 0, sell: 0 },
  { expiry: '26DEC25', strike: 110000, buy: 0, sell: 0 },
  { expiry: '27MAR26', strike: 109000, buy: 0, sell: 0 },
  { expiry: '26JUN26', strike: 108000, buy: 0, sell: 0 },
];

const timeRanges = [
  { label: '最近24小时', value: '24h' },
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' },
];
const exchanges = [
  { label: 'Deribit', value: 'deribit' },
  { label: 'Bybit', value: 'bybit' },
  { label: 'OKX', value: 'okx' },
  { label: 'Binance', value: 'binance' },
];

const expiryColors = [
  '#eab308', '#22c55e', '#38bdf8', '#f472b6', '#a3e635', '#a78bfa', '#f59e42', '#f43f5e', '#6366f1', '#06b6d4', '#38bdf8'
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{ background: 'rgba(255,255,255,0.15)' }}
        className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg backdrop-blur"
      >
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">行权价: {label}</p>
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

function CustomLegend({ expiries, visible, onClick }: any) {
  return (
    <div className="flex flex-col space-y-1 mt-2 text-[11px] font-normal leading-tight">
      {expiries.map((expiry: string, idx: number) => (
        <div
          key={expiry}
          className="flex items-center cursor-pointer select-none"
          onClick={() => onClick(expiry)}
        >
          <span
            className="inline-block mr-2"
            style={{
              width: 18,
              height: 2,
              background: visible[expiry] ? expiryColors[idx % expiryColors.length] : '#d1d5db',
              borderRadius: 2,
              transition: 'background 0.2s',
            }}
          />
          <span
            className={visible[expiry] ? '' : 'text-gray-400'}
            style={{ color: visible[expiry] ? expiryColors[idx % expiryColors.length] : '#d1d5db', fontWeight: visible[expiry] ? 400 : 400 }}
          >
            {expiry}
          </span>
        </div>
      ))}
    </div>
  );
}

// 玻璃风格高亮Bar
const GlassActiveBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(255,255,255,0.15)"
        rx={4}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4}
      />
    </g>
  );
};

const VolumeByStrike = ({ className }: { className?: string }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [strikeMin, setStrikeMin] = useState(96000);
  const [strikeMax, setStrikeMax] = useState(118000);
  const [selectedExchanges, setSelectedExchanges] = useState(['binance']);
  const [visible, setVisible] = useState(() => Object.fromEntries(expiries.map(e => [e, true])));

  const handleLegendClick = (expiry: string) => {
    setVisible(v => ({ ...v, [expiry]: !v[expiry] }));
  };

  return (
    <Card title="成交量分布（行权价）" className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {timeRanges.map(r => (
          <button
            key={r.value}
            className={`px-2 py-0.5 rounded text-xs border ${timeRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setTimeRange(r.value)}
          >
            {r.label}
          </button>
        ))}
        <span className="text-xs">行权价范围</span>
        <input type="number" className="w-16 px-1 py-0.5 rounded border text-xs bg-theme-on-surface-1 border-theme-stroke" value={strikeMin} onChange={e => setStrikeMin(Number(e.target.value))} />
        <span className="mx-1">→</span>
        <input type="number" className="w-16 px-1 py-0.5 rounded border text-xs bg-theme-on-surface-1 border-theme-stroke" value={strikeMax} onChange={e => setStrikeMax(Number(e.target.value))} />
        {exchanges.map(ex => (
          <label key={ex.value} className="text-xs cursor-pointer flex items-center">
            <input type="checkbox" checked={selectedExchanges.includes(ex.value)} onChange={() => setSelectedExchanges(selectedExchanges.includes(ex.value) ? selectedExchanges.filter(v => v !== ex.value) : [...selectedExchanges, ex.value])} className="mr-1 align-middle" />
            {ex.label}
          </label>
        ))}
      </div>
      <div className="h-80 flex">
        <div className="w-24 flex-shrink-0 flex flex-col justify-center">
          <CustomLegend expiries={expiries} visible={visible} onClick={handleLegendClick} />
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.filter(d => visible[d.expiry])} layout="vertical" margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EFEFEF" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis dataKey="strike" type="category" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="buy" name="BUY" fill="#4ade80" barSize={12} isAnimationActive={false} activeBar={GlassActiveBar}>
                <LabelList dataKey="buy" position="right" className="text-xs" />
              </Bar>
              <Bar dataKey="sell" name="SELL" fill="#f472b6" barSize={12} isAnimationActive={false} activeBar={GlassActiveBar}>
                <LabelList dataKey="sell" position="right" className="text-xs" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default VolumeByStrike; 