import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';

// 订单流数据类型
interface OrderFlowData {
  timestamp: number;
  price: number;
  volume: number;
  side: 'buy' | 'sell';
  delta: number;
  cumulativeDelta: number;
}

// K线数据类型
interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number;
}

// 价格级别数据
interface PriceLevel {
  price: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  totalVolume: number;
}

interface OrderFlowDeltaProps {
  symbol?: string;
  className?: string;
  height?: number;
  showCandles?: boolean;
  showOrderFlow?: boolean;
  showDelta?: boolean;
}

const OrderFlowDelta: React.FC<OrderFlowDeltaProps> = ({
  symbol = 'BTCUSDT',
  className = '',
  height = 600,
  showCandles = true,
  showOrderFlow = true,
  showDelta = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<{
    candles: CandleData[];
    orderFlow: OrderFlowData[];
    priceLevels: PriceLevel[];
  }>({
    candles: [],
    orderFlow: [],
    priceLevels: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1m');
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);

  // 生成模拟数据
  const generateMockData = useCallback(() => {
    const now = Date.now();
    const candles: CandleData[] = [];
    const orderFlow: OrderFlowData[] = [];
    const priceLevels: PriceLevel[] = [];
    
    let basePrice = 50000;
    let cumulativeDelta = 0;
    
    // 生成K线数据
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * 60000; // 1分钟间隔
      const open = basePrice + (Math.random() - 0.5) * 100;
      const close = open + (Math.random() - 0.5) * 200;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      const volume = Math.random() * 1000 + 100;
      
      // 计算Delta（买卖盘差值）
      const buyVolume = volume * (0.3 + Math.random() * 0.4);
      const sellVolume = volume - buyVolume;
      const delta = buyVolume - sellVolume;
      cumulativeDelta += delta;
      
      candles.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
        delta,
      });
      
      basePrice = close;
    }
    
    // 生成订单流数据
    for (let i = 0; i < 500; i++) {
      const candle = candles[Math.floor(i / 5)];
      const timestamp = candle.timestamp + (i % 5) * 12000; // 12秒间隔
      const price = candle.low + Math.random() * (candle.high - candle.low);
      const volume = Math.random() * 50 + 10;
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const delta = side === 'buy' ? volume : -volume;
      
      cumulativeDelta += delta;
      
      orderFlow.push({
        timestamp,
        price,
        volume,
        side,
        delta,
        cumulativeDelta,
      });
    }
    
    // 生成价格级别数据
    const priceRange = Math.max(...candles.map(c => c.high)) - Math.min(...candles.map(c => c.low));
    const minPrice = Math.min(...candles.map(c => c.low));
    
    for (let i = 0; i < 20; i++) {
      const price = minPrice + (priceRange / 20) * i;
      const buyVolume = Math.random() * 200;
      const sellVolume = Math.random() * 200;
      const delta = buyVolume - sellVolume;
      
      priceLevels.push({
        price,
        buyVolume,
        sellVolume,
        delta,
        totalVolume: buyVolume + sellVolume,
      });
    }
    
    setData({ candles, orderFlow, priceLevels });
    setLoading(false);
  }, []);

  // 初始化数据
  useEffect(() => {
    generateMockData();
  }, [generateMockData]);

  // 绘制图表
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.candles.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // 计算价格范围
    const prices = data.candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // 计算时间范围
    const timestamps = data.candles.map(c => c.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = maxTime - minTime;
    
    // 绘制网格
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // 水平网格线
    for (let i = 0; i <= 10; i++) {
      const y = (height * 0.1) + (height * 0.8 * i / 10);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // 垂直网格线
    for (let i = 0; i <= 10; i++) {
      const x = (width * 0.1) + (width * 0.8 * i / 10);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // 绘制K线
    if (showCandles) {
      const candleWidth = (width * 0.8) / data.candles.length * 0.8;
      
      data.candles.forEach((candle, index) => {
        const x = (width * 0.1) + (width * 0.8 * index / data.candles.length);
        const openY = height - (height * 0.1) - ((candle.open - minPrice) / priceRange) * (height * 0.8);
        const closeY = height - (height * 0.1) - ((candle.close - minPrice) / priceRange) * (height * 0.8);
        const highY = height - (height * 0.1) - ((candle.high - minPrice) / priceRange) * (height * 0.8);
        const lowY = height - (height * 0.1) - ((candle.low - minPrice) / priceRange) * (height * 0.8);
        
        // 绘制影线
        ctx.strokeStyle = candle.close >= candle.open ? '#10B981' : '#EF4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();
        
        // 绘制实体
        ctx.fillStyle = candle.close >= candle.open ? '#10B981' : '#EF4444';
        ctx.fillRect(x - candleWidth/2, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY));
      });
    }
    
    // 绘制订单流数据
    if (showOrderFlow) {
      data.orderFlow.forEach((order) => {
        const x = (width * 0.1) + ((order.timestamp - minTime) / timeRange) * (width * 0.8);
        const y = height - (height * 0.1) - ((order.price - minPrice) / priceRange) * (height * 0.8);
        
        // 根据买卖方向设置颜色
        ctx.fillStyle = order.side === 'buy' ? '#10B981' : '#EF4444';
        ctx.globalAlpha = Math.min(order.volume / 50, 1);
        
        // 绘制订单点
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, order.volume / 10), 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.globalAlpha = 1;
      });
    }
    
    // 绘制Delta柱状图
    if (showDelta) {
      const deltaHeight = height * 0.15;
      const deltaY = height - deltaHeight;
      
      data.candles.forEach((candle, index) => {
        const x = (width * 0.1) + (width * 0.8 * index / data.candles.length);
        const barWidth = (width * 0.8) / data.candles.length * 0.8;
        
        // 计算Delta柱高度
        const maxDelta = Math.max(...data.candles.map(c => Math.abs(c.delta)));
        const barHeight = (Math.abs(candle.delta) / maxDelta) * deltaHeight;
        
        // 设置颜色
        ctx.fillStyle = candle.delta >= 0 ? '#10B981' : '#EF4444';
        
        // 绘制Delta柱
        ctx.fillRect(x - barWidth/2, deltaY + (deltaHeight - barHeight), barWidth, barHeight);
      });
    }
    
    // 绘制价格标签
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i / 5);
      const y = height - (height * 0.1) - (height * 0.8 * i / 5);
      ctx.fillText(price.toFixed(0), width * 0.08, y + 4);
    }
    
    // 绘制时间标签
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const time = minTime + (timeRange * i / 5);
      const x = (width * 0.1) + (width * 0.8 * i / 5);
      const date = new Date(time);
      ctx.fillText(date.toLocaleTimeString(), x, height - 5);
    }
    
  }, [data, showCandles, showOrderFlow, showDelta]);

  // 绘制图表
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.candles.length) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算对应的价格和时间
    const minPrice = Math.min(...data.candles.flatMap(c => [c.high, c.low]));
    const maxPrice = Math.max(...data.candles.flatMap(c => [c.high, c.low]));
    const priceRange = maxPrice - minPrice;
    
    const price = maxPrice - ((y - rect.height * 0.1) / (rect.height * 0.8)) * priceRange;
    const timeIndex = Math.floor(((x - rect.width * 0.1) / (rect.width * 0.8)) * data.candles.length);
    
    if (timeIndex >= 0 && timeIndex < data.candles.length) {
      const candle = data.candles[timeIndex];
      setHoveredData({
        price: price.toFixed(2),
        time: new Date(candle.timestamp).toLocaleString(),
        open: candle.open.toFixed(2),
        high: candle.high.toFixed(2),
        low: candle.low.toFixed(2),
        close: candle.close.toFixed(2),
        volume: candle.volume.toFixed(0),
        delta: candle.delta.toFixed(0),
      });
    }
  };

  if (loading) {
    return (
      <Card title="订单流Delta" className={className}>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            加载中...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="订单流Delta" className={className}>
      <div className="space-y-4">
        {/* 控制面板 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">时间周期:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="1m">1分钟</option>
              <option value="5m">5分钟</option>
              <option value="15m">15分钟</option>
              <option value="1h">1小时</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCandles}
                onChange={(e) => setShowCandles(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">K线图</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOrderFlow}
                onChange={(e) => setShowOrderFlow(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">订单流</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDelta}
                onChange={(e) => setShowDelta(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Delta</span>
            </label>
          </div>
        </div>
        
        {/* 图表区域 */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full border border-gray-200 rounded"
            style={{ height }}
            onMouseMove={handleMouseMove}
          />
          
          {/* 悬停信息 */}
          {hoveredData && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded text-sm">
              <div>价格: {hoveredData.price}</div>
              <div>时间: {hoveredData.time}</div>
              <div>开: {hoveredData.open}</div>
              <div>高: {hoveredData.high}</div>
              <div>低: {hoveredData.low}</div>
              <div>收: {hoveredData.close}</div>
              <div>成交量: {hoveredData.volume}</div>
              <div>Delta: {hoveredData.delta}</div>
            </div>
          )}
        </div>
        
        {/* 统计信息 */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">总成交量</div>
            <div className="font-semibold">
              {data.candles.reduce((sum, c) => sum + c.volume, 0).toFixed(0)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">累计Delta</div>
            <div className={`font-semibold ${
              data.orderFlow[data.orderFlow.length - 1]?.cumulativeDelta >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {data.orderFlow[data.orderFlow.length - 1]?.cumulativeDelta.toFixed(0) || 0}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">买入量</div>
            <div className="font-semibold text-green-600">
              {data.orderFlow
                .filter(o => o.side === 'buy')
                .reduce((sum, o) => sum + o.volume, 0)
                .toFixed(0)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">卖出量</div>
            <div className="font-semibold text-red-600">
              {data.orderFlow
                .filter(o => o.side === 'sell')
                .reduce((sum, o) => sum + o.volume, 0)
                .toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrderFlowDelta;



















