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
import { useVolSmileData } from "@/components/useVolSmileData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-90 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-4 text-xs min-w-[160px]"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div className="text-gray-700 dark:text-white text-base font-bold mb-2">Delta: {label}</div>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded" style={{ background: item.color }}></span>
                <span className="font-semibold" style={{ color: item.color }}>{item.name}</span>
              </div>
              <span className="text-gray-700 dark:text-white font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 自定义底部Legend，始终显示所有按钮，变灰/高亮
function CustomLegend({ visible, onClick, lines }: any) {
  return (
    <div className="flex flex-row justify-center items-center gap-4 mt-2 text-xs font-normal leading-tight flex-wrap">
      {lines.map((line: any) => (
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
  const [symbol, setSymbol] = useState('BTC');
  // 使用自定义Hook获取数据
  const { data, loading, error, fetchData, refresh } = useVolSmileData(symbol, true, 5 * 60 * 1000);

  // 修复hooks顺序：visible的初始值设为{}，data变化时重置
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (data) {
      setVisible(Object.fromEntries(data.lines.map((l: any) => [l.key, true])));
    }
  }, [data]);

  if (!data) {
    return (
      <Card title="模型波动率微笑" className={className}>
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-theme-secondary">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            加载中...
          </div>
        </div>
      </Card>
    );
  }

  const handleLegendClick = (key: string) => {
    setVisible((v: Record<string, boolean>) => ({ ...v, [key]: !v[key] }));
  };

  return (
    <Card title="模型波动率微笑" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            className="px-2 py-1 rounded text-sm border bg-theme-on-surface-1 text-theme-primary border-theme-stroke"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
          </select>
          {loading && (
            <div className="flex items-center gap-1 text-xs text-theme-secondary">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </div>
          )}
          {data.timestamp && (
            <div className="text-xs text-theme-tertiary">
              更新: {new Date(data.timestamp).toLocaleTimeString()}
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis dataKey="delta" tick={{ fontSize: 12, fill: '#6F767E' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[25, 45]} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <RechartsLegend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12 }}
              content={() => <CustomLegend visible={visible} onClick={handleLegendClick} lines={data.lines} />}
            />
            {data.lines.map((line: any) => visible[line.key] && (
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