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

// lines配置
const lines = [
  { key: 'iv_7d', name: '7D ATM IV', color: '#eab308', dash: false },
  { key: 'rv_7d', name: '7D RV', color: '#eab308', dash: true },
  { key: 'iv_14d', name: '14D ATM IV', color: '#22c55e', dash: false },
  { key: 'rv_14d', name: '14D RV', color: '#22c55e', dash: true },
  { key: 'iv_30d', name: '30D ATM IV', color: '#0ea5e9', dash: false },
  { key: 'rv_30d', name: '30D RV', color: '#0ea5e9', dash: true },
  { key: 'iv_60d', name: '60D ATM IV', color: '#a21caf', dash: false },
  { key: 'rv_60d', name: '60D RV', color: '#a21caf', dash: true },
  { key: 'iv_90d', name: '90D ATM IV', color: '#84cc16', dash: false },
  { key: 'rv_90d', name: '90D RV', color: '#84cc16', dash: true },
  { key: 'iv_180d', name: '180D ATM IV', color: '#f472b6', dash: false },
  { key: 'rv_180d', name: '180D RV', color: '#f472b6', dash: true },
];

// mock数据（如有API可替换）
const mockData = [
  { date: '2025-06-25', iv_7d: 32, rv_7d: 28, iv_14d: 33, rv_14d: 29 },
  { date: '2025-06-26', iv_7d: 31, rv_7d: 27, iv_14d: 32, rv_14d: 28 },
  { date: '2025-06-27', iv_7d: 30, rv_7d: 26, iv_14d: 31, rv_14d: 27 },
  { date: '2025-06-28', iv_7d: 31, rv_7d: 27, iv_14d: 32, rv_14d: 28 },
  { date: '2025-06-29', iv_7d: 32, rv_7d: 28, iv_14d: 33, rv_14d: 29 },
  { date: '2025-06-30', iv_7d: 33, rv_7d: 29, iv_14d: 34, rv_14d: 30 },
  { date: '2025-07-01', iv_7d: 34, rv_7d: 30, iv_14d: 35, rv_14d: 31 },
  { date: '2025-07-02', iv_7d: 35, rv_7d: 31, iv_14d: 36, rv_14d: 32 },
  { date: '2025-07-03', iv_7d: 36, rv_7d: 32, iv_14d: 37, rv_14d: 33 },
];

// 可选：如有API可用，替换为useIVRVData()
const useIVRVData = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://103.106.191.243:8001/deribit/option/iv_rv_term')
      .then(res => {
        if (!res.ok) throw new Error('网络错误');
        return res.json();
      })
      .then(json => setData(json))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

function CustomLegend({ visible, onClick }: { visible: Record<string, boolean>, onClick: (key: string) => void }) {
  return (
    <div className="flex flex-row flex-wrap gap-2 mt-2 text-xs font-normal leading-tight">
      {lines.map(line => (
        <label key={line.key} className="flex items-center cursor-pointer select-none gap-1">
          <input
            type="checkbox"
            checked={visible[line.key]}
            onChange={() => onClick(line.key)}
            className="accent-blue-500"
          />
          <span
            className="inline-block"
            style={{
              width: 18,
              height: 2,
              background: visible[line.key] ? line.color : '#d1d5db',
              borderRadius: 2,
              transition: 'background 0.2s',
              marginRight: 4,
              borderBottom: line.dash ? '1px dashed ' + (visible[line.key] ? line.color : '#d1d5db') : undefined,
            }}
          />
          <span
            className={visible[line.key] ? '' : 'text-gray-400'}
            style={{ color: visible[line.key] ? line.color : '#d1d5db', fontWeight: 400 }}
          >
            {line.name}
          </span>
        </label>
      ))}
    </div>
  );
}

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
              <span className="text-xs text-gray-700 dark:text-white font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const IVvsRV = ({ className }: { className?: string }) => {
  const { data, loading, error } = useIVRVData();
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, l.key === 'iv_7d' || l.key === 'rv_7d' || l.key === 'iv_14d' || l.key === 'rv_14d'])));

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  if (loading) {
    return (
      <Card title="IV vs RV" className={className}>
        <div className="h-80 flex items-center justify-center">加载中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="IV vs RV" className={className}>
        <div className="h-80 flex items-center justify-center text-red-500">错误: {error}</div>
      </Card>
    );
  }

  return (
    <Card title="IV vs RV" className={className}>
      <div className="mb-2 flex flex-wrap gap-2">
        <CustomLegend visible={visible} onClick={handleLegendClick} />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6F767E' }} />
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
                dot={false}
                strokeDasharray={line.dash ? '6 3' : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default IVvsRV; 