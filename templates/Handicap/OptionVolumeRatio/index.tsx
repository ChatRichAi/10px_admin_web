import React, { useState, useRef, useEffect } from "react";
import Card from "@/components/Card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const categories = [
  { key: 'call_blocked', name: 'Call Blocked', color: '#34d399' },
  { key: 'call_buys', name: 'Call Buys', color: '#6ee7b7' },
  { key: 'call_sells', name: 'Call Sells', color: '#a7f3d0' },
  { key: 'put_blocked', name: 'Put Blocked', color: '#f87171' },
  { key: 'put_buys', name: 'Put Buys', color: '#fca5a5' },
  { key: 'put_sells', name: 'Put Sells', color: '#fecaca' },
];

const data = [
  { key: 'call_blocked', value: 9882.7, percent: 45.65, label: '₿9,882.7 ($1060.4M)' },
  { key: 'call_buys', value: 0, percent: 0, label: '' },
  { key: 'call_sells', value: 3489.0, percent: 16.12, label: '₿3,489.0 ($374.4M)' },
  { key: 'put_blocked', value: 0, percent: 0, label: '' },
  { key: 'put_buys', value: 2121.7, percent: 9.8, label: '₿2,121.7 ($227.7M)' },
  { key: 'put_sells', value: 0, percent: 0, label: '' },
];

const coins = [
  { label: 'BTC', value: 'btc' },
  { label: 'ETH', value: 'eth' },
];
const timeRanges = [
  { label: 'Past 24h', value: '24h' },
  { label: 'Past 7d', value: '7d' },
];

const OptionVolumeRatio = ({ className }: { className?: string }) => {
  const [coin, setCoin] = useState('btc');
  const [timeRange, setTimeRange] = useState('24h');

  // refs for card and pie
  const containerRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const putRef = useRef<HTMLDivElement>(null);
  const sellRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });
  const [lines, setLines] = useState<Array<{ x1: number, y1: number, x2: number, y2: number, color: string }>>([]);

  useEffect(() => {
    function calculateLines() {
      if (!containerRef.current || !pieRef.current || !putRef.current || !sellRef.current || !blockRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const pieRect = pieRef.current.getBoundingClientRect();
      const putRect = putRef.current.getBoundingClientRect();
      const sellRect = sellRef.current.getBoundingClientRect();
      const blockRect = blockRef.current.getBoundingClientRect();
      
      setSvgDims({ width: containerRect.width, height: containerRect.height });
      
      // 饼图中心点（相对于容器）
      const pieCenterX = pieRect.left + pieRect.width / 2 - containerRect.left;
      const pieCenterY = pieRect.top + pieRect.height / 2 - containerRect.top;
      const pieRadius = 75; // 外半径
      
      // 计算各个扇形的角度位置（基于数据占比）
      // 从90度开始，逆时针
      let currentAngle = 90; // 起始角度
      const angleStep = 360 / 100; // 每1%对应的角度
      
      // Call Blocked: 45.65% (从90度开始)
      const callBlockedAngle = currentAngle + (45.65 / 2) * angleStep; // 中心角度
      currentAngle += 45.65 * angleStep;
      
      // Call Buys: 0% (跳过)
      
      // Call Sells: 16.12%
      const callSellsAngle = currentAngle + (16.12 / 2) * angleStep;
      currentAngle += 16.12 * angleStep;
      
      // Put Blocked: 0% (跳过)
      
      // Put Buys: 9.8%
      const putBuysAngle = currentAngle + (9.8 / 2) * angleStep;
      
      // 转换角度为弧度并计算连接点
      const toRadians = (deg: number) => (deg * Math.PI) / 180;
      
      const callBlockedRad = toRadians(callBlockedAngle);
      const callSellsRad = toRadians(callSellsAngle);
      const putBuysRad = toRadians(putBuysAngle);
      
      // 饼图边缘的连接点
      const callBlockedPieX = pieCenterX + Math.cos(callBlockedRad) * pieRadius;
      const callBlockedPieY = pieCenterY - Math.sin(callBlockedRad) * pieRadius;
      
      const callSellsPieX = pieCenterX + Math.cos(callSellsRad) * pieRadius;
      const callSellsPieY = pieCenterY - Math.sin(callSellsRad) * pieRadius;
      
      const putBuysPieX = pieCenterX + Math.cos(putBuysRad) * pieRadius;
      const putBuysPieY = pieCenterY - Math.sin(putBuysRad) * pieRadius;
      
      // 卡片连接点
      const putCardX = putRect.right - containerRect.left;
      const putCardY = putRect.top + putRect.height / 2 - containerRect.top;
      
      const sellCardX = sellRect.right - containerRect.left;
      const sellCardY = sellRect.top + sellRect.height / 2 - containerRect.top;
      
      const blockCardX = blockRect.left - containerRect.left;
      const blockCardY = blockRect.top + blockRect.height / 2 - containerRect.top;
      
      setLines([
        {
          x1: putCardX,
          y1: putCardY,
          x2: putBuysPieX,
          y2: putBuysPieY,
          color: '#fca5a5'
        },
        {
          x1: sellCardX,
          y1: sellCardY,
          x2: callSellsPieX,
          y2: callSellsPieY,
          color: '#a7f3d0'
        },
        {
          x1: blockCardX,
          y1: blockCardY,
          x2: callBlockedPieX,
          y2: callBlockedPieY,
          color: '#34d399'
        }
      ]);
    }
    
    calculateLines();
    window.addEventListener('resize', calculateLines);
    const timer = setTimeout(calculateLines, 100); // 延迟计算确保DOM渲染完成
    
    return () => {
      window.removeEventListener('resize', calculateLines);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Card title={`期权成交占比 - 2025/07/01 (${timeRanges.find(t => t.value === timeRange)?.label})`} className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {coins.map(c => (
          <button
            key={c.value}
            className={`px-2 py-0.5 rounded text-xs border ${coin === c.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setCoin(c.value)}
          >
            {c.label}
          </button>
        ))}
        {timeRanges.map(r => (
          <button
            key={r.value}
            className={`px-2 py-0.5 rounded text-xs border ${timeRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setTimeRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="relative flex flex-row items-center justify-center gap-2 min-h-[260px]">
        {/* SVG 连线层 */}
        <svg width={svgDims.width} height={svgDims.height} className="absolute left-0 top-0 pointer-events-none z-10">
          {lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.color}
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          ))}
        </svg>
        
        {/* 左侧：Put Buys/Call Sells */}
        <div className="flex flex-col gap-4 items-end justify-center flex-1 min-w-[180px] max-w-xs">
          <div ref={putRef} className="border border-blue-400 rounded-lg p-3 w-full max-w-xs">
            <div className="font-semibold text-sm mb-1">Put Buys</div>
            <div className="flex items-center justify-between">
              <span className="text-theme-primary text-xs">₿2,121.7 ($227.7M)</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-semibold">9.8%</span>
            </div>
          </div>
          <div ref={sellRef} className="border border-blue-400 rounded-lg p-3 w-full max-w-xs">
            <div className="font-semibold text-sm mb-1">Call Sells</div>
            <div className="flex items-center justify-between">
              <span className="text-theme-primary text-xs">₿3,489.0 ($374.4M)</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-semibold">16.12%</span>
            </div>
          </div>
        </div>
        
        {/* 中间：饼图和图例 */}
        <div ref={pieRef} className="flex flex-col items-center justify-center mx-2">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.key} fill={categories.find(c => c.key === entry.key)?.color || '#ccc'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {categories.map(c => (
              <div key={c.key} className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded mr-1" style={{ background: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* 右侧：Call Blocked */}
        <div className="flex flex-col items-start justify-center flex-1 min-w-[180px] max-w-xs">
          <div ref={blockRef} className="border border-blue-400 rounded-lg p-3 w-full max-w-xs">
            <div className="font-semibold text-sm mb-1">Call Blocked</div>
            <div className="flex items-center justify-between">
              <span className="text-theme-primary text-xs">₿9,882.7 ($1060.4M)</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-semibold">45.65%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-theme-tertiary text-center">总订单数量: ₿21,646.8 ($2,322,661,813)</div>
    </Card>
  );
};

export default OptionVolumeRatio; 