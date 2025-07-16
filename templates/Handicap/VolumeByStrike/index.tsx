import React, { useState } from "react";
import Card from "@/components/Card";
import { useVolumeByStrikeData } from "@/components/useVolumeByStrikeData";
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

// 时间范围选项
const timeRanges = [
  { label: '最近24小时', value: '24h' },
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' },
];

// 交易所选项
const exchanges = [
  { label: 'Deribit', value: 'deribit' },
  { label: 'Bybit', value: 'bybit' },
  { label: 'OKX', value: 'okx' },
  { label: 'Binance', value: 'binance' },
];

// 优化的颜色配置 - 使用渐变色彩
const callColor = '#10B981'; // 更鲜艳的绿色
const putColor = '#3B82F6';  // 更鲜艳的蓝色
const callGradient = 'url(#callGradient)';
const putGradient = 'url(#putGradient)';

// 数值格式化函数
const formatVolume = (value: number) => {
  if (value < 1) return ''; // 小于1的不显示
  if (value < 10) return Math.round(value).toString(); // 小于10的显示整数
  if (value < 100) return Math.round(value).toString(); // 小于100的显示整数
  return Math.round(value).toString(); // 其他情况显示整数
};

// 自定义标签组件
const CustomLabel = (props: any) => {
  const { x, y, width, height, value, fill } = props;
  
  // 只显示大于阈值的数值
  if (value < 5) return null;
  
  const formattedValue = formatVolume(value);
  if (!formattedValue) return null;
  
  // 检测是否为暗色模式
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill={isDarkMode ? '#ffffff' : (fill === callColor ? '#059669' : '#2563EB')}
      textAnchor="start"
      dominantBaseline="middle"
      fontSize="11"
      fontWeight="500"
      className="drop-shadow-sm"
    >
      {formattedValue}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // 检测是否为暗色模式
    const isDarkMode = document.documentElement.classList.contains('dark');
    // 获取数据
    const calls = payload.find((item: any) => item.dataKey === 'calls')?.value ?? 0;
    const puts = payload.find((item: any) => item.dataKey === 'puts')?.value ?? 0;
    // 计算PCR
    let pcr = '-';
    if (calls > 0) {
      pcr = (puts / calls).toFixed(2);
    } else if (puts > 0) {
      pcr = '∞';
    }
    // PCR标签
    let pcrLabel = '平衡';
    let pcrColor = 'bg-yellow-400 text-yellow-900';
    if (pcr !== '-' && pcr !== '∞') {
      const pcrNum = parseFloat(pcr);
      if (pcrNum < 0.7) {
        pcrLabel = '看涨';
        pcrColor = 'bg-green-500 text-white';
      } else if (pcrNum > 1) {
        pcrLabel = '看跌';
        pcrColor = 'bg-red-500 text-white';
      }
    }
    return (
      <div
        className={`rounded-2xl shadow-xl p-4 min-w-[220px] max-w-xs border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="font-bold text-base text-blue-700 dark:text-blue-200">行权价</span>
          <span className="font-semibold text-lg text-gray-900 dark:text-white">${label}</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-400 inline-block"></span>
            <span className="text-xs text-gray-500">看涨</span>
            <span className="font-semibold text-green-700 dark:text-green-300 ml-1">{calls.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400 inline-block"></span>
            <span className="text-xs text-gray-500">看跌</span>
            <span className="font-semibold text-red-700 dark:text-red-300 ml-1">{puts.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pcrColor}`}>{pcrLabel}</span>
          <span className="text-xs text-gray-500">PCR</span>
          <span className="font-semibold text-gray-900 dark:text-white">{pcr}</span>
        </div>
      </div>
    );
  }
  return null;
};

// 优化的玻璃风格高亮Bar
const GlassActiveBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="rgba(255,255,255,0.2)"
        rx={6}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={6}
      />
    </g>
  );
};

const VolumeByStrike = ({ className }: { className?: string }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [strikeMin, setStrikeMin] = useState(96000);
  const [strikeMax, setStrikeMax] = useState(118000);
  const [selectedExchanges, setSelectedExchanges] = useState(['deribit']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [showAISummary, setShowAISummary] = useState(false);
  
  // 使用钩子获取数据，传入当前的状态参数
  const { data, volumeData, loading, error, refetch } = useVolumeByStrikeData({
    symbol: 'BTC',
    window: timeRange,
    strikeMin,
    strikeMax
  });

  // 过滤数据（现在API已经返回过滤后的数据，这里作为额外过滤）
  const filteredData = data.filter(item => 
    item.strike >= strikeMin && 
    item.strike <= strikeMax &&
    (item.calls > 0 || item.puts > 0)
  );

  // 计算PCR
  const pcr = volumeData ? volumeData.pcr : 0;
  const totalCalls = volumeData ? volumeData.total_calls_volume : 0;
  const totalPuts = volumeData ? volumeData.total_puts_volume : 0;

  // AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    
    try {
      if (!filteredData || filteredData.length === 0) {
        setAiSummary('暂无数据可供分析。');
        return;
      }

      // 分析数据
      const maxCalls = Math.max(...filteredData.map(d => d.calls));
      const maxPuts = Math.max(...filteredData.map(d => d.puts));
      const maxCallsStrike = filteredData.find(d => d.calls === maxCalls)?.strike;
      const maxPutsStrike = filteredData.find(d => d.puts === maxPuts)?.strike;
      
      // 计算成交量集中度
      const totalVolume = filteredData.reduce((sum, d) => sum + d.calls + d.puts, 0);
      const maxCallsPercent = (maxCalls / totalVolume) * 100;
      const maxPutsPercent = (maxPuts / totalVolume) * 100;
      
      // 分析成交量分布
      const sortedByVolume = [...filteredData].sort((a, b) => (b.calls + b.puts) - (a.calls + a.puts));
      const top5Volume = sortedByVolume.slice(0, 5);
      
      // 分析行权价分布
      const avgStrike = filteredData.reduce((sum, d) => sum + d.strike, 0) / filteredData.length;
      const highStrikeData = filteredData.filter(d => d.strike > avgStrike);
      const lowStrikeData = filteredData.filter(d => d.strike < avgStrike);
      
      // 计算市场情绪指标
      const callDominantStrikes = filteredData.filter(d => d.calls > d.puts * 1.5).length;
      const putDominantStrikes = filteredData.filter(d => d.puts > d.calls * 1.5).length;
      const balancedStrikes = filteredData.length - callDominantStrikes - putDominantStrikes;
      
      // 分析时间窗口特征
      const timeWindowText = timeRange === '24h' ? '24小时' : timeRange === '7d' ? '7天' : '30天';
      
      // 生成AI总结
      const summary = `基于BTC期权成交量分布深度分析（${timeWindowText}）：

📊 **核心数据指标**
• 总Call成交量: ${totalCalls.toLocaleString()}
• 总Put成交量: ${totalPuts.toLocaleString()}
• 整体PCR: ${pcr.toFixed(2)} ${pcr > 1 ? '(看跌主导)' : pcr < 0.7 ? '(看涨主导)' : '(多空平衡)'}
• 分析行权价范围: $${strikeMin.toLocaleString()} - $${strikeMax.toLocaleString()}

🎯 **成交量集中度分析**
• 最大Call成交量: $${maxCallsStrike?.toLocaleString()} (${maxCalls.toLocaleString()}, 占比${maxCallsPercent.toFixed(1)}%)
• 最大Put成交量: $${maxPutsStrike?.toLocaleString()} (${maxPuts.toLocaleString()}, 占比${maxPutsPercent.toFixed(1)}%)
• 成交量前五: ${top5Volume.map(d => `$${d.strike.toLocaleString()}(${(d.calls + d.puts).toLocaleString()})`).join(', ')}

💡 **市场情绪分布**
• Call主导行权价: ${callDominantStrikes}个 (Call > Put × 1.5)
• Put主导行权价: ${putDominantStrikes}个 (Put > Call × 1.5)
• 平衡行权价: ${balancedStrikes}个
• 市场整体情绪: ${pcr > 1 ? '偏向看跌' : pcr < 0.7 ? '偏向看涨' : '相对平衡'}

📈 **行权价分布特征**
• 平均行权价: $${avgStrike.toLocaleString()}
• 高行权价区域: ${highStrikeData.length}个 (${((highStrikeData.length / filteredData.length) * 100).toFixed(1)}%)
• 低行权价区域: ${lowStrikeData.length}个 (${((lowStrikeData.length / filteredData.length) * 100).toFixed(1)}%)

⚠️ **关键观察点**
• 重点关注行权价: ${top5Volume.map(d => `$${d.strike.toLocaleString()}`).join(', ')}
• 建议关注: ${maxCallsStrike && maxPutsStrike ? `$${maxCallsStrike.toLocaleString()} (Call热点) 和 $${maxPutsStrike.toLocaleString()} (Put热点)` : '无显著热点'}
• 风险提示: 高成交量区域价格波动可能加剧`;

      setAiSummary(summary);
    } catch (error) {
      setAiSummary('AI分析生成失败，请稍后重试。');
    } finally {
      setIsAILoading(false);
    }
  };

  // 渲染图表内容
  const renderChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={filteredData} 
          layout="vertical" 
          margin={{ top: 20, right: 60, left: 10, bottom: 10 }}
        >
          {/* 定义渐变 */}
          <defs>
            <linearGradient id="callGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#059669" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="putGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={false} 
            stroke="#E5E7EB" 
            opacity={0.6}
            className="dark:stroke-gray-600"
          />
          <XAxis 
            type="number" 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            className="dark:text-gray-300"
          />
          <YAxis 
            dataKey="strike" 
            type="category" 
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            className="dark:text-gray-300"
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar 
            dataKey="calls" 
            name="看涨" 
            fill={callGradient}
            barSize={14} 
            isAnimationActive={true}
            animationDuration={800}
            activeBar={GlassActiveBar}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="calls" 
              content={<CustomLabel />} 
            />
          </Bar>
          
          <Bar 
            dataKey="puts" 
            name="看跌" 
            fill={putGradient}
            barSize={14} 
            isAnimationActive={true}
            animationDuration={800}
            activeBar={GlassActiveBar}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="puts" 
              content={<CustomLabel />} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // 渲染控制区域
  const renderControls = () => (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {timeRanges.map(r => (
        <button
          key={r.value}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
            timeRange === r.value 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
          }`}
          onClick={() => setTimeRange(r.value)}
        >
          {r.label}
        </button>
      ))}
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">行权价范围</span>
        <input 
          type="number" 
          className="w-20 px-2 py-1 rounded border text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          value={strikeMin} 
          onChange={e => setStrikeMin(Number(e.target.value))} 
        />
        <span className="text-gray-500 dark:text-gray-400">→</span>
        <input 
          type="number" 
          className="w-20 px-2 py-1 rounded border text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          value={strikeMax} 
          onChange={e => setStrikeMax(Number(e.target.value))} 
        />
      </div>
      
      {exchanges.map(ex => (
        <label key={ex.value} className="text-sm cursor-pointer flex items-center gap-1 text-gray-700 dark:text-gray-300">
          <input 
            type="checkbox" 
            checked={selectedExchanges.includes(ex.value)} 
            onChange={() => setSelectedExchanges(selectedExchanges.includes(ex.value) ? selectedExchanges.filter(v => v !== ex.value) : [...selectedExchanges, ex.value])} 
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-800" 
          />
          {ex.label}
        </label>
      ))}
      
      {/* 统计信息 */}
      <div className="ml-auto flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
          <span className="text-gray-600 dark:text-gray-300">PCR:</span>
          <span className="font-semibold text-gray-800 dark:text-white">{pcr.toFixed(2)}</span>
          <span className="text-gray-400 dark:text-gray-500 cursor-help" title="看跌看涨比率 (Put-Call Ratio)">ⓘ</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
          <span className="text-gray-600 dark:text-gray-300">总成交量:</span>
          <span className="font-semibold text-gray-800 dark:text-white">
            {(totalCalls + totalPuts).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  // 全屏模式
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            BTC 期权成交量分布（行权价）
          </h2>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
              title="AI总结"
              onClick={handleAISummary}
              disabled={isAILoading}
            >
              {isAILoading ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'AI'
              )}
            </button>
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsFullscreen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 全屏图表 */}
        <div className="flex-1 p-4">
          {renderControls()}
          
          {loading && (
            <div className="h-full flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                加载中...
              </div>
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">加载失败</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
                <button 
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          )}

          {!loading && !error && renderChart()}
        </div>
      </div>
    );
  }

  return (
    <Card title="成交量分布（行权价）" className={className}>
      <div className="relative">
        {/* 右上角悬浮按钮 */}
        <div className="absolute right-4 top-4 flex items-center gap-2 z-10">
          <button 
            className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
            title="AI总结"
            onClick={handleAISummary}
            disabled={isAILoading}
          >
            {isAILoading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'AI'
            )}
          </button>
          <button 
            className="p-1 text-theme-secondary hover:text-theme-primary"
            onClick={() => setIsFullscreen(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        {/* 内容区 */}
        {renderControls()}

        {loading && (
          <div className="h-80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              加载中...
            </div>
          </div>
        )}

        {error && (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-2">加载失败</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</div>
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {!loading && !error && renderChart()}
      </div>

      {/* AI总结模态框 */}
      {showAISummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 flex flex-col">
            {/* 头部 */}
            <div className="relative bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI 成交量分布分析总结</h3>
                    <p className="text-white/80 text-sm">基于BTC期权成交量分布的智能分析</p>
                  </div>
                </div>
                <button 
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
                  onClick={() => setShowAISummary(false)}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-auto p-8 bg-white dark:bg-gray-900">
              {isAILoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">AI正在分析数据...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 市场情绪分析卡片 */}
                  <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/30 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </span>
                      <span className="font-bold text-base text-blue-700 dark:text-blue-200">市场情绪分析</span>
                    </div>
                    <div className="mb-4">
                      <div className="font-medium text-gray-800 dark:text-gray-100 mb-1">整体市场情绪</div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${pcr < 0.7 ? 'bg-green-500' : pcr > 1 ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {pcr < 0.7 ? '看涨主导 - 投资者对上行机会较为乐观' : pcr > 1 ? '看跌主导 - 投资者对下行风险更为警惕' : '多空平衡 - 市场情绪较为中性'}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="font-medium text-gray-800 dark:text-gray-100 mb-1">PCR分布统计</div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-700 flex items-center justify-center text-green-600 dark:text-green-200 font-bold text-lg mb-1">{filteredData.filter(d => d.calls > d.puts * 1.5).length}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">看涨</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-700 flex items-center justify-center text-yellow-600 dark:text-yellow-200 font-bold text-lg mb-1">{filteredData.length - filteredData.filter(d => d.calls > d.puts * 1.5).length - filteredData.filter(d => d.puts > d.calls * 1.5).length}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">平衡</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-700 flex items-center justify-center text-red-600 dark:text-red-200 font-bold text-lg mb-1">{filteredData.filter(d => d.puts > d.calls * 1.5).length}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">看跌</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100 mb-1">情绪强度分析</div>
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>平均PCR <span className="font-semibold text-gray-900 dark:text-white">{pcr.toFixed(2)}</span></div>
                        <div>PCR标准差 <span className="font-semibold text-gray-900 dark:text-white">{(() => { 
                          // 计算每个行权价的PCR，过滤掉异常值
                          const pcrValues = filteredData
                            .map(d => {
                              const callVolume = d.calls || 0;
                              const putVolume = d.puts || 0;
                              // 避免除零错误，如果Call为0则跳过
                              if (callVolume === 0) return null;
                              return putVolume / callVolume;
                            })
                            .filter((pcr): pcr is number => pcr !== null && pcr >= 0 && pcr <= 10); // 过滤异常值
                          
                          if (pcrValues.length === 0) return '0.00';
                          
                          const mean = pcrValues.reduce((sum, val) => sum + val, 0) / pcrValues.length;
                          const variance = pcrValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pcrValues.length;
                          const std = Math.sqrt(variance);
                          
                          return std.toFixed(2);
                        })()}</span> <span className="text-xs text-gray-400 cursor-help" title="反映市场情绪分布的离散程度">ⓘ</span></div>
                        <div>情绪一致性 <span className="font-semibold text-gray-900 dark:text-white">{(() => { 
                          const pcrValues = filteredData
                            .map(d => {
                              const callVolume = d.calls || 0;
                              const putVolume = d.puts || 0;
                              if (callVolume === 0) return null;
                              return putVolume / callVolume;
                            })
                            .filter((pcr): pcr is number => pcr !== null && pcr >= 0 && pcr <= 10);
                          
                          if (pcrValues.length === 0) return '未知';
                          
                          const mean = pcrValues.reduce((sum, val) => sum + val, 0) / pcrValues.length;
                          const variance = pcrValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pcrValues.length;
                          const std = Math.sqrt(variance);
                          
                          return std < 0.5 ? '高' : std < 1 ? '中' : '低';
                        })()}</span></div>
                      </div>
                    </div>
                  </div>
                  {/* 成交量集中度分析卡片 */}
                  <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/30 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white text-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                      </span>
                      <span className="font-bold text-base text-purple-700 dark:text-purple-200">成交量集中度分析</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div>最大Call成交量：<span className="font-semibold">${filteredData.find(d => d.calls === Math.max(...filteredData.map(d => d.calls)))?.strike?.toLocaleString() || '-'} ({Math.max(...filteredData.map(d => d.calls)).toLocaleString()}, 占比{((Math.max(...filteredData.map(d => d.calls)) / (filteredData.reduce((sum, d) => sum + d.calls + d.puts, 0) || 1)) * 100).toFixed(1)}%)</span></div>
                      <div>最大Put成交量：<span className="font-semibold">${filteredData.find(d => d.puts === Math.max(...filteredData.map(d => d.puts)))?.strike?.toLocaleString() || '-'} ({Math.max(...filteredData.map(d => d.puts)).toLocaleString()}, 占比{((Math.max(...filteredData.map(d => d.puts)) / (filteredData.reduce((sum, d) => sum + d.calls + d.puts, 0) || 1)) * 100).toFixed(1)}%)</span></div>
                      <div>成交量前五：<span className="font-semibold">{[...filteredData].sort((a, b) => (b.calls + b.puts) - (a.calls + a.puts)).slice(0, 5).map(d => `$${d.strike.toLocaleString()}(${(d.calls + d.puts).toLocaleString()})`).join(', ')}</span></div>
                    </div>
                  </div>
                  {/* 行权价分布特征卡片 */}
                  <div className="rounded-2xl bg-green-50 dark:bg-green-900/30 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                      </span>
                      <span className="font-bold text-base text-green-700 dark:text-green-200">行权价分布特征</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div>平均行权价：<span className="font-semibold">${(filteredData.reduce((sum, d) => sum + d.strike, 0) / (filteredData.length || 1)).toLocaleString()}</span></div>
                      <div>高行权价区域：<span className="font-semibold">{filteredData.filter(d => d.strike > (filteredData.reduce((sum, d) => sum + d.strike, 0) / (filteredData.length || 1))).length}</span> 个 ({((filteredData.filter(d => d.strike > (filteredData.reduce((sum, d) => sum + d.strike, 0) / (filteredData.length || 1))).length / (filteredData.length || 1)) * 100).toFixed(1)}%)</div>
                      <div>低行权价区域：<span className="font-semibold">{filteredData.filter(d => d.strike < (filteredData.reduce((sum, d) => sum + d.strike, 0) / (filteredData.length || 1))).length}</span> 个 ({((filteredData.filter(d => d.strike < (filteredData.reduce((sum, d) => sum + d.strike, 0) / (filteredData.length || 1))).length / (filteredData.length || 1)) * 100).toFixed(1)}%)</div>
                    </div>
                  </div>
                  {/* 关键观察点卡片 */}
                  <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                      </span>
                      <span className="font-bold text-base text-yellow-700 dark:text-yellow-200">关键观察点</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div>重点关注行权价：<span className="font-semibold">{[...filteredData].sort((a, b) => (b.calls + b.puts) - (a.calls + a.puts)).slice(0, 5).map(d => `$${d.strike.toLocaleString()}`).join(', ')}</span></div>
                      <div>建议关注：<span className="font-semibold">{(() => { const maxCallsStrike = filteredData.find(d => d.calls === Math.max(...filteredData.map(d => d.calls)))?.strike; const maxPutsStrike = filteredData.find(d => d.puts === Math.max(...filteredData.map(d => d.puts)))?.strike; return maxCallsStrike && maxPutsStrike ? `$${maxCallsStrike.toLocaleString()} (Call热点) 和 $${maxPutsStrike.toLocaleString()} (Put热点)` : '无显著热点'; })()}</span></div>
                      <div>风险提示：<span className="font-semibold text-red-500">高成交量区域价格波动可能加剧</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button 
                className="px-6 py-2 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-lg hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                onClick={() => setShowAISummary(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VolumeByStrike; 