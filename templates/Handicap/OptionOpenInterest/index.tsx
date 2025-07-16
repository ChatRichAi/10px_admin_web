import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import { useOpenInterestData } from "@/components/useOpenInterestData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";



const coins = [
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' },
];

const viewModes = [
  { label: 'Expire', value: 'expire' },
  { label: 'Strike', value: 'strike' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ background: '#B5E4CA' }}></span>
              <span className="text-xs text-gray-500 dark:text-gray-300">Calls:</span>
            </div>
            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.calls.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ background: '#0C68E9' }}></span>
              <span className="text-xs text-gray-500 dark:text-gray-300">Puts:</span>
            </div>
            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.puts.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-300 dark:border-gray-600">
            <span className="text-xs text-gray-500 dark:text-gray-300">PCR:</span>
            <span className="text-xs text-gray-700 dark:text-white font-medium">{data.pcr.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const OptionOpenInterest = ({ className }: { className?: string }) => {
  const [coin, setCoin] = useState('BTC');
  const [viewMode, setViewMode] = useState('expire');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [showAISummary, setShowAISummary] = useState(false);

  // 使用新的钩子获取真实数据
  const {
    data: openInterestData,
    rawData,
    loading: isLoading,
    error,
    lastUpdate,
    refresh,
    forceRefresh,
    updateSymbol
  } = useOpenInterestData({
    symbol: coin,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5分钟
    forceRefresh: false
  });

  // 计算总PCR
  const totalCalls = rawData?.total_calls || 0;
  const totalPuts = rawData?.total_puts || 0;
  const totalPCR = rawData?.pcr || 0;

  // 更新symbol
  useEffect(() => {
    updateSymbol(coin);
  }, [coin, updateSymbol]);

  useEffect(() => {
    // 动态添加CSS样式来控制悬停透明度
    const style = document.createElement('style');
    style.textContent = `
      .option-chart .recharts-bar-rectangle:hover {
        opacity: 0.5 !important;
      }
      .option-chart .recharts-active-bar .recharts-bar-rectangle {
        opacity: 0.5 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    
    try {
      if (!openInterestData || openInterestData.length === 0) {
        setAiSummary('暂无数据可供分析。');
        return;
      }

      // 分析数据
      const maxCalls = Math.max(...openInterestData.map(d => d.calls));
      const maxPuts = Math.max(...openInterestData.map(d => d.puts));
      const maxCallsExpiry = openInterestData.find(d => d.calls === maxCalls)?.expiry;
      const maxPutsExpiry = openInterestData.find(d => d.puts === maxPuts)?.expiry;
      const avgPCR = openInterestData.reduce((sum, d) => sum + d.pcr, 0) / openInterestData.length;
      
      // 计算持仓量集中度
      const totalVolume = openInterestData.reduce((sum, d) => sum + d.calls + d.puts, 0);
      const maxCallsPercent = (maxCalls / totalVolume) * 100;
      const maxPutsPercent = (maxPuts / totalVolume) * 100;
      
      // 分析PCR分布
      const highPCRExpiries = openInterestData.filter(d => d.pcr > 1.2).map(d => ({ expiry: d.expiry, pcr: d.pcr }));
      const lowPCRExpiries = openInterestData.filter(d => d.pcr < 0.5).map(d => ({ expiry: d.expiry, pcr: d.pcr }));
      
      // 分析持仓量分布
      const sortedByVolume = [...openInterestData].sort((a, b) => (b.calls + b.puts) - (a.calls + a.puts));
      const top3Volume = sortedByVolume.slice(0, 3);
      
      // 计算市场情绪指标
      const bullishExpiries = openInterestData.filter(d => d.pcr < 0.7).length;
      const bearishExpiries = openInterestData.filter(d => d.pcr > 1.2).length;
      const neutralExpiries = openInterestData.length - bullishExpiries - bearishExpiries;
      
      // 生成AI总结
      const summary = `基于${coin.toUpperCase()}期权持仓量深度分析：

📊 **核心数据指标**
• 总Call持仓量: ${totalCalls.toLocaleString()}
• 总Put持仓量: ${totalPuts.toLocaleString()}
• 整体PCR: ${totalPCR.toFixed(2)} ${totalPCR > 1 ? '(看跌主导)' : totalPCR < 0.7 ? '(看涨主导)' : '(多空平衡)'}
• 平均PCR: ${avgPCR.toFixed(2)}

🎯 **市场情绪分布**
• 看涨到期日: ${bullishExpiries}个 (PCR < 0.7)
• 看跌到期日: ${bearishExpiries}个 (PCR > 1.2)
• 平衡到期日: ${neutralExpiries}个
• 市场整体情绪: ${totalPCR > 1 ? '偏向看跌' : totalPCR < 0.7 ? '偏向看涨' : '相对平衡'}

💡 **关键到期日分析**
• 最大Call持仓: ${maxCallsExpiry} (${maxCalls.toLocaleString()}, 占比${maxCallsPercent.toFixed(1)}%)
• 最大Put持仓: ${maxPutsExpiry} (${maxPuts.toLocaleString()}, 占比${maxPutsPercent.toFixed(1)}%)
• 持仓量前三: ${top3Volume.map(d => `${d.expiry}(${(d.calls + d.puts).toLocaleString()})`).join(', ')}

⚠️ **风险预警**
• 高PCR到期日: ${highPCRExpiries.length > 0 ? highPCRExpiries.map(d => `${d.expiry}(PCR:${d.pcr.toFixed(2)})`).join(', ') : '无'}
• 低PCR到期日: ${lowPCRExpiries.length > 0 ? lowPCRExpiries.map(d => `${d.expiry}(PCR:${d.pcr.toFixed(2)})`).join(', ') : '无'}
• 建议重点关注: ${top3Volume.map(d => d.expiry).join(', ')}`;

      setAiSummary(summary);
    } catch (error) {
      setAiSummary('AI分析生成失败，请稍后重试。');
    } finally {
      setIsAILoading(false);
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {coin.toUpperCase()} 期权持仓量 (截止: 2025/07/01)
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
          <div className="h-full option-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={openInterestData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="expiry"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="rect"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="calls" 
                  name="Calls"
                  stackId="a" 
                  fill="#B5E4CA"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="puts" 
                  name="Puts"
                  stackId="a" 
                  fill="#0C68E9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // 显示加载状态
  if (isLoading) {
    return (
      <Card 
        title={`${coin.toUpperCase()} 期权持仓量`}
        className={className}
      >
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">正在加载数据...</p>
          </div>
        </div>
      </Card>
    );
  }

  // 显示错误状态
  if (error) {
    return (
      <Card 
        title={`${coin.toUpperCase()} 期权持仓量`}
        className={className}
      >
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">数据加载失败</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => refresh()}
            >
              重试
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={`${coin.toUpperCase()} 期权持仓量${lastUpdate ? ` (截止: ${new Date(lastUpdate).toLocaleString()})` : ''}`}
      className={className}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {coins.map(c => (
            <button
              key={c.value}
              className={`px-3 py-1 rounded text-sm border ${coin === c.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
              onClick={() => setCoin(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
              <span className="text-theme-secondary relative group cursor-help">
                PCR:
                <span className="text-xs text-theme-tertiary ml-1">ⓘ</span>
                {/* PCR悬浮提示 */}
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                  <div className="font-medium mb-1">Put/Call Ratio (PCR)</div>
                  <div className="space-y-1">
                    <div>• <span className="text-green-400">PCR &lt; 0.7</span>: 看涨情绪强烈</div>
                    <div>• <span className="text-yellow-400">0.7 ≤ PCR ≤ 1.2</span>: 市场平衡</div>
                    <div>• <span className="text-red-400">PCR &gt; 1.2</span>: 看跌情绪强烈</div>
                  </div>
                  <div className="mt-2 text-gray-300">
                    当前PCR: {totalPCR.toFixed(2)} - {totalPCR < 0.7 ? '看涨主导' : totalPCR > 1.2 ? '看跌主导' : '多空平衡'}
                  </div>
                  {/* 小三角 */}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </span>
            <span className="font-semibold text-theme-primary">{totalPCR.toFixed(2)}</span>
          </div>
          
          <div className="flex rounded border border-theme-stroke overflow-hidden">
            {viewModes.map(mode => (
              <button
                key={mode.value}
                className={`px-3 py-1 text-sm ${viewMode === mode.value ? 'bg-blue-500 text-white' : 'bg-theme-on-surface-1 text-theme-primary hover:bg-theme-on-surface-2'}`}
                onClick={() => setViewMode(mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
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
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          </div>
        </div>
      </div>

      <div className="h-80 option-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={openInterestData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="expiry"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="rect"
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar 
              dataKey="calls" 
              name="Calls"
              stackId="a" 
              fill="#B5E4CA"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="puts" 
              name="Puts"
              stackId="a" 
              fill="#0C68E9"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 数据标签显示 */}
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: '#B5E4CA' }}></span>
          <span className="text-theme-secondary">Calls</span>
          <span className="text-theme-primary font-medium">({totalCalls.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: '#0C68E9' }}></span>
          <span className="text-theme-secondary">Puts</span>
          <span className="text-theme-primary font-medium">({totalPuts.toLocaleString()})</span>
        </div>
      </div>
      
      {/* AI总结模态框 */}
      {showAISummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
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
                    <h3 className="text-xl font-bold text-white">AI 期权持仓量分析总结</h3>
                    <p className="text-white/80 text-sm">基于{coin.toUpperCase()}期权数据智能分析</p>
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
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isAILoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-3 border-[#0C68E9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">AI正在分析数据...</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">请稍候，正在生成专业分析报告</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 关键数据点 */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">关键数据点</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">总Call持仓量</p>
                        <p className="text-lg font-bold text-green-600">{totalCalls.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">总Put持仓量</p>
                        <p className="text-lg font-bold text-blue-600">{totalPuts.toLocaleString()}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 relative group cursor-help">
                          整体PCR
                          <span className="text-xs text-gray-400 ml-1">ⓘ</span>
                          {/* PCR悬浮提示 */}
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                            <div className="font-medium mb-1">整体Put/Call Ratio</div>
                            <div className="space-y-1">
                              <div>• <span className="text-green-400">PCR &lt; 0.7</span>: 看涨情绪强烈</div>
                              <div>• <span className="text-yellow-400">0.7 ≤ PCR ≤ 1.2</span>: 市场平衡</div>
                              <div>• <span className="text-red-400">PCR &gt; 1.2</span>: 看跌情绪强烈</div>
                            </div>
                            <div className="mt-2 text-gray-300">
                              当前: {totalPCR.toFixed(2)} - {totalPCR < 0.7 ? '看涨主导' : totalPCR > 1.2 ? '看跌主导' : '多空平衡'}
                            </div>
                            {/* 小三角 */}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                          </div>
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{totalPCR.toFixed(2)}</p>
                      </div>
                                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 relative group cursor-help">
                            平均PCR
                            <span className="text-xs text-gray-400 ml-1">ⓘ</span>
                            {/* 平均PCR悬浮提示 */}
                            <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                              <div className="font-medium mb-1">平均Put/Call Ratio</div>
                              <div className="space-y-1">
                                <div>• 所有到期日PCR的平均值</div>
                                <div>• 反映整体市场情绪倾向</div>
                                <div>• 与整体PCR对比可判断情绪分布</div>
                              </div>
                              <div className="mt-2 text-gray-300">
                                当前: {(openInterestData.reduce((sum, d) => sum + d.pcr, 0) / openInterestData.length).toFixed(2)}
                              </div>
                              {/* 小三角 */}
                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                            </div>
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{(openInterestData.reduce((sum, d) => sum + d.pcr, 0) / openInterestData.length).toFixed(2)}</p>
                        </div>
                    </div>
                  </div>

                  {/* 市场情绪分析 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">市场情绪分析</h4>
                    </div>
                    <div className="space-y-3">
                      {/* 整体情绪 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">整体市场情绪</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${totalPCR > 1 ? 'bg-red-500' : totalPCR < 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {totalPCR > 1 ? '看跌主导 - 投资者对下行风险较为担忧' : totalPCR < 0.7 ? '看涨主导 - 投资者对上行机会较为乐观' : '多空平衡 - 市场情绪相对均衡'}
                          </p>
                        </div>
                      </div>
                      
                      {/* PCR分布 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">PCR分布统计</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                              <span className="text-white font-bold">{openInterestData.filter(d => d.pcr < 0.7).length}</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">看涨</p>
                          </div>
                          <div className="text-center">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-1">
                              <span className="text-white font-bold">{openInterestData.length - openInterestData.filter(d => d.pcr < 0.7).length - openInterestData.filter(d => d.pcr > 1.2).length}</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">平衡</p>
                          </div>
                          <div className="text-center">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-1">
                              <span className="text-white font-bold">{openInterestData.filter(d => d.pcr > 1.2).length}</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">看跌</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 情绪变化趋势 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">情绪强度分析</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">平均PCR</span>
                            <span className="font-medium">{(openInterestData.reduce((sum, d) => sum + d.pcr, 0) / openInterestData.length).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300 relative group cursor-help">
                              PCR标准差
                              <span className="text-xs text-gray-400 ml-1">ⓘ</span>
                              {/* PCR标准差悬浮提示 */}
                              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                                <div className="font-medium mb-1">PCR标准差</div>
                                <div className="space-y-1">
                                  <div>• 衡量各到期日PCR的离散程度</div>
                                  <div>• <span className="text-green-400">标准差小</span>: 情绪一致性强</div>
                                  <div>• <span className="text-red-400">标准差大</span>: 情绪分化明显</div>
                                </div>
                                {/* 小三角 */}
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                              </div>
                            </span>
                            <span className="font-medium">{(() => {
                              const avg = openInterestData.reduce((sum, d) => sum + d.pcr, 0) / openInterestData.length;
                              const variance = openInterestData.reduce((sum, d) => sum + Math.pow(d.pcr - avg, 2), 0) / openInterestData.length;
                              return Math.sqrt(variance).toFixed(2);
                            })()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300 relative group cursor-help">
                              情绪一致性
                              <span className="text-xs text-gray-400 ml-1">ⓘ</span>
                              {/* 情绪一致性悬浮提示 */}
                              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                                <div className="font-medium mb-1">情绪一致性</div>
                                <div className="space-y-1">
                                  <div>• <span className="text-green-400">高</span>: 标准差 &lt; 0.3，市场情绪统一</div>
                                  <div>• <span className="text-yellow-400">中</span>: 0.3 ≤ 标准差 ≤ 0.6</div>
                                  <div>• <span className="text-red-400">低</span>: 标准差 &gt; 0.6，情绪分化严重</div>
                                </div>
                                {/* 小三角 */}
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                              </div>
                            </span>
                            <span className="font-medium">{(() => {
                              const avg = openInterestData.reduce((sum, d) => sum + d.pcr, 0) / openInterestData.length;
                              const variance = openInterestData.reduce((sum, d) => sum + Math.pow(d.pcr - avg, 2), 0) / openInterestData.length;
                              const std = Math.sqrt(variance);
                              return std < 0.3 ? '高' : std < 0.6 ? '中' : '低';
                            })()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 市场洞察 */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">市场洞察</h4>
                    </div>
                    <div className="space-y-3">
                      {/* 持仓量集中度分析 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 relative group cursor-help">
                          持仓量集中度分析
                          <span className="text-xs text-gray-400 ml-1">ⓘ</span>
                          {/* 持仓量集中度悬浮提示 */}
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                            <div className="font-medium mb-1">持仓量集中度</div>
                            <div className="space-y-1">
                              <div>• 衡量持仓量在单个到期日的集中程度</div>
                              <div>• <span className="text-orange-400">占比高</span>: 该到期日可能成为关键价位</div>
                              <div>• <span className="text-blue-400">占比低</span>: 持仓量分布相对均匀</div>
                            </div>
                            {/* 小三角 */}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                          </div>
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">最大Call持仓占比</p>
                            <p className="font-bold text-green-600">{((Math.max(...openInterestData.map(d => d.calls)) / openInterestData.reduce((sum, d) => sum + d.calls + d.puts, 0)) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">最大Put持仓占比</p>
                            <p className="font-bold text-blue-600">{((Math.max(...openInterestData.map(d => d.puts)) / openInterestData.reduce((sum, d) => sum + d.calls + d.puts, 0)) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 市场情绪分布 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">市场情绪分布</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>看涨: {openInterestData.filter(d => d.pcr < 0.7).length}个</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>看跌: {openInterestData.filter(d => d.pcr > 1.2).length}个</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span>平衡: {openInterestData.length - openInterestData.filter(d => d.pcr < 0.7).length - openInterestData.filter(d => d.pcr > 1.2).length}个</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 关键到期日 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">关键到期日</p>
                        <div className="space-y-1 text-xs">
                          {[...openInterestData].sort((a, b) => (b.calls + b.puts) - (a.calls + a.puts)).slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">{item.expiry}</span>
                              <span className="font-medium">{(item.calls + item.puts).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 风险提示 */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">风险预警</h4>
                    </div>
                    <div className="space-y-3">
                      {/* 高PCR风险 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">高PCR风险到期日</p>
                        <div className="space-y-1 text-xs">
                          {openInterestData.filter(d => d.pcr > 1.2).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">{item.expiry}</span>
                              <span className="font-medium text-red-600">PCR: {item.pcr.toFixed(2)}</span>
                            </div>
                          ))}
                          {openInterestData.filter(d => d.pcr > 1.2).length === 0 && (
                            <span className="text-gray-500 dark:text-gray-400">无高风险到期日</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 低PCR风险 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">低PCR风险到期日</p>
                        <div className="space-y-1 text-xs">
                          {openInterestData.filter(d => d.pcr < 0.5).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">{item.expiry}</span>
                              <span className="font-medium text-green-600">PCR: {item.pcr.toFixed(2)}</span>
                            </div>
                          ))}
                          {openInterestData.filter(d => d.pcr < 0.5).length === 0 && (
                            <span className="text-gray-500 dark:text-gray-400">无低风险到期日</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 持仓量集中风险 */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">持仓量集中风险</p>
                        <div className="space-y-1 text-xs">
                          {[...openInterestData].sort((a, b) => (b.calls + b.puts) - (a.calls + a.puts)).slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">{item.expiry}</span>
                              <span className="font-medium text-orange-600">{(item.calls + item.puts).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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

export default OptionOpenInterest; 