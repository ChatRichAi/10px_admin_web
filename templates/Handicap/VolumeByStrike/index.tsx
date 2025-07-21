import React, { useState, useRef, useEffect } from "react";
import Card from "@/components/Card";
import { useVolumeByStrikeData } from "@/hooks/useVolumeByStrikeData";
import AISummaryModal from "@/components/AISummaryModal";
import TimerSettingsModal from "@/components/TimerSettings";
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
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  
  // 定时器状态
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    enabled: false,
    interval: 30, // 分钟
    nextRun: null as Date | null,
    telegramChatId: '',
    telegramBotToken: ''
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // 定时器管理功能
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (timerSettings.enabled) {
      const intervalMs = timerSettings.interval * 60 * 1000;
      timerRef.current = setInterval(async () => {
        await handleAISummary();
      }, intervalMs);
      const nextRun = new Date(Date.now() + intervalMs);
      setTimerSettings(prev => ({ ...prev, nextRun }));
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerSettings(prev => ({ ...prev, enabled: false, nextRun: null }));
  };

  useEffect(() => {
    if (timerSettings.enabled) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerSettings.enabled, timerSettings.interval]);

  // AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    
    try {
      if (!filteredData || filteredData.length === 0) {
        setAiSummary({ error: '暂无数据可供分析。' });
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
      const summary = [
        {
          type: 'stats',
          title: '核心数据指标',
          icon: 'stats',
          items: [
            {
              title: '总Call成交量',
              value: totalCalls.toLocaleString(),
              valueColor: 'text-green-600',
              subTitle: '看涨期权总成交量',
              subValue: ''
            },
            {
              title: '总Put成交量',
              value: totalPuts.toLocaleString(),
              valueColor: 'text-blue-600',
              subTitle: '看跌期权总成交量',
              subValue: ''
            },
            {
              title: '整体PCR',
              value: pcr.toFixed(2),
              valueColor: pcr > 1 ? 'text-red-500' : pcr < 0.7 ? 'text-green-500' : 'text-yellow-500',
              subTitle: pcr > 1 ? '看跌主导' : pcr < 0.7 ? '看涨主导' : '多空平衡',
              subValue: ''
            },
            {
              title: '分析范围',
              value: `$${strikeMin.toLocaleString()} - $${strikeMax.toLocaleString()}`,
              valueColor: 'text-gray-600',
              subTitle: '行权价范围',
              subValue: ''
            }
          ]
        },
        {
          type: 'structure',
          title: '成交量集中度分析',
          icon: 'structure',
          items: [
            {
              title: '最大Call成交量',
              value: `$${maxCallsStrike?.toLocaleString() || '-'}`,
              valueColor: 'text-green-600',
              subTitle: `${maxCalls.toLocaleString()} (占比${maxCallsPercent.toFixed(1)}%)`,
              subValue: ''
            },
            {
              title: '最大Put成交量',
              value: `$${maxPutsStrike?.toLocaleString() || '-'}`,
              valueColor: 'text-blue-600',
              subTitle: `${maxPuts.toLocaleString()} (占比${maxPutsPercent.toFixed(1)}%)`,
              subValue: ''
            },
            {
              title: '成交量前五',
              value: top5Volume.map(d => `$${d.strike.toLocaleString()}`).join(', '),
              valueColor: 'text-purple-600',
              subTitle: '重点关注行权价',
              subValue: ''
            }
          ]
        },
        {
          type: 'sentiment',
          title: '市场情绪分布',
          icon: 'sentiment',
          items: [
            {
              title: 'Call主导行权价',
              value: callDominantStrikes.toString(),
              valueColor: 'text-green-600',
              subTitle: 'Call > Put × 1.5',
              subValue: ''
            },
            {
              title: 'Put主导行权价',
              value: putDominantStrikes.toString(),
              valueColor: 'text-red-600',
              subTitle: 'Put > Call × 1.5',
              subValue: ''
            },
            {
              title: '平衡行权价',
              value: balancedStrikes.toString(),
              valueColor: 'text-yellow-600',
              subTitle: '多空相对平衡',
              subValue: ''
            },
            {
              title: '整体情绪',
              value: pcr > 1 ? '偏向看跌' : pcr < 0.7 ? '偏向看涨' : '相对平衡',
              valueColor: pcr > 1 ? 'text-red-500' : pcr < 0.7 ? 'text-green-500' : 'text-yellow-500',
              subTitle: '市场整体倾向',
              subValue: ''
            }
          ]
        },
        {
          type: 'risk',
          title: '行权价分布特征',
          icon: 'risk',
          items: [
            {
              title: '平均行权价',
              value: `$${avgStrike.toLocaleString()}`,
              valueColor: 'text-gray-600',
              subTitle: '所有行权价平均值',
              subValue: ''
            },
            {
              title: '高行权价区域',
              value: highStrikeData.length.toString(),
              valueColor: 'text-blue-600',
              subTitle: `${((highStrikeData.length / filteredData.length) * 100).toFixed(1)}%`,
              subValue: ''
            },
            {
              title: '低行权价区域',
              value: lowStrikeData.length.toString(),
              valueColor: 'text-green-600',
              subTitle: `${((lowStrikeData.length / filteredData.length) * 100).toFixed(1)}%`,
              subValue: ''
            }
          ]
        },
        {
          type: 'advice',
          title: '关键观察点',
          icon: 'advice',
          items: [
            {
              title: '重点关注行权价',
              value: top5Volume.map(d => `$${d.strike.toLocaleString()}`).join(', '),
              valueColor: 'text-purple-600',
              subTitle: '成交量最高的行权价',
              subValue: ''
            },
            {
              title: '建议关注',
              value: maxCallsStrike && maxPutsStrike ? `$${maxCallsStrike.toLocaleString()} (Call热点) 和 $${maxPutsStrike.toLocaleString()} (Put热点)` : '无显著热点',
              valueColor: 'text-blue-600',
              subTitle: '成交量热点区域',
              subValue: ''
            },
            {
              title: '风险提示',
              value: '高成交量区域价格波动可能加剧',
              valueColor: 'text-red-500',
              subTitle: '需要特别关注',
              subValue: ''
            }
          ]
        }
      ];

      setAiSummary(summary);
    } catch (error) {
      setAiSummary({ error: 'AI分析生成失败，请稍后重试。' });
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

        {/* 全屏模式下的AI总结模态框 */}
        {showAISummary && (
          <AISummaryModal
            isLoading={isAILoading}
            summary={aiSummary}
            onClose={() => setShowAISummary(false)}
            title="AI 成交量分布分析总结"
            symbol="BTC 期权成交量分布"
          />
        )}
      </div>
    );
  }

  return (
    <Card title="成交量分布（行权价）" className={className}>
      <div className="mb-2 flex items-center justify-end gap-2">
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
          className={`p-1 text-theme-secondary hover:text-theme-primary transition-colors ${timerSettings.enabled ? 'text-green-500' : ''}`}
          onClick={() => setShowTimerModal(true)}
          title={timerSettings.enabled ? '定时器已启用' : '设置定时AI分析'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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

      {/* AI总结模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI 成交量分布分析总结"
          symbol="BTC 期权成交量分布"
        />
      )}

      {/* 定时器设置模态框 */}
      {showTimerModal && (
        <TimerSettingsModal
          settings={timerSettings}
          onSave={async (newSettings) => {
            try {
              // 验证设置
              if (newSettings.enabled) {
                if (!newSettings.telegramBotToken.trim()) {
                  throw new Error('请输入Telegram Bot Token');
                }
                if (!newSettings.telegramChatId.trim()) {
                  throw new Error('请输入Telegram Chat ID');
                }
                // 验证Chat ID格式
                const chatId = newSettings.telegramChatId.trim();
                if (!/^-?\d+$/.test(chatId)) {
                  throw new Error('Chat ID必须是数字格式');
                }
                // 验证Bot Token格式
                const botToken = newSettings.telegramBotToken.trim();
                if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)) {
                  throw new Error('Bot Token格式不正确');
                }
              }
              setTimerSettings(newSettings);
              if (newSettings.enabled) {
                startTimer();
              } else {
                stopTimer();
              }
              return Promise.resolve();
            } catch (error) {
              throw error;
            }
          }}
          onClose={() => setShowTimerModal(false)}
        />
      )}
    </Card>
  );
};

export default VolumeByStrike; 