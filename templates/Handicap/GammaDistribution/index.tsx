import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useGamma } from "@/hooks/useGamma";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const strike = label;
    const callGamma = payload.find((item: any) => item.name === 'Calls')?.value || 0;
    const putGamma = payload.find((item: any) => item.name === 'Puts')?.value || 0;
    const totalGamma = callGamma + Math.abs(putGamma);
    
    return (
      <div
        className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg backdrop-blur"
        style={{ minWidth: '200px', color: '#222' }}
      >
        <div className="mb-3">
          <p className="text-gray-700 dark:text-white text-sm font-bold mb-1">行权价: ${strike}</p>
          <p className="text-xs text-gray-500">距离当前价格: {Math.abs(strike - 117538).toLocaleString()}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#B5E4CA]"></span>
              <span className="text-xs text-gray-600 font-medium">Calls Gamma:</span>
            </div>
            <span className="text-xs text-gray-700 font-bold">
              {callGamma >= 1e6 ? (callGamma/1e6).toFixed(2) + 'M' : callGamma.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#0C68E9]"></span>
              <span className="text-xs text-gray-600 font-medium">Puts Gamma:</span>
            </div>
            <span className="text-xs text-gray-700 font-bold">
              {Math.abs(putGamma) >= 1e6 ? (Math.abs(putGamma)/1e6).toFixed(2) + 'M' : Math.abs(putGamma).toLocaleString()}
            </span>
              </div>
          
          <div className="border-t border-gray-200 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">总 Gamma:</span>
              <span className="text-xs text-gray-700 font-bold">
                {totalGamma >= 1e6 ? (totalGamma/1e6).toFixed(2) + 'M' : totalGamma.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* 市场情绪指示 */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">市场倾向:</span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              callGamma > Math.abs(putGamma) 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {callGamma > Math.abs(putGamma) ? '看涨' : '看跌'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const GammaDistribution = ({ className }: { className?: string }) => {
  // 替换为hook获取数据
  const { data, meta, loading, error } = useGamma('BTC');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [showAISummary, setShowAISummary] = useState(false);

  // 添加图例圆角样式
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .gamma-chart .recharts-legend-item .recharts-legend-icon {
        border-radius: 4px !important;
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
      // 分析数据
      const maxCallGamma = Math.max(...data.map(d => d.callGamma));
      const maxPutGamma = Math.min(...data.map(d => d.putGamma));
      const callWallStrike = meta.callWall;
      const putWallStrike = meta.putWall;
      const currentPrice = meta.stockPrice;
      const zeroGammaStrike = meta.zeroGamma;
      
      // 生成AI总结
      const summary = `基于UPST Gamma分布分析：

📊 **关键数据点**
• 当前股价: $${currentPrice}
• 最大Call Gamma: ${(maxCallGamma / 1000000).toFixed(1)}M (行权价: $${data.find(d => d.callGamma === maxCallGamma)?.strike})
• 最大Put Gamma: ${(Math.abs(maxPutGamma) / 1000000).toFixed(1)}M (行权价: $${data.find(d => d.putGamma === maxPutGamma)?.strike})

🎯 **重要支撑阻力位**
• Call Wall: $${callWallStrike} - 看涨期权集中区域
• Put Wall: $${putWallStrike} - 看跌期权集中区域  
• Zero Gamma: $${zeroGammaStrike} - 中性Gamma点

💡 **市场洞察**
• 股价接近Call Wall，可能面临上行阻力
• Put Wall提供下方支撑
• Gamma分布显示市场对${currentPrice > callWallStrike ? '上行' : '下行'}方向有较强预期

⚠️ **风险提示**
• 高Gamma区域价格波动可能加剧
• 建议关注${callWallStrike}和${putWallStrike}关键价位`;

      setAiSummary(summary);
    } catch (error) {
      setAiSummary('AI分析生成失败，请稍后重试。');
    } finally {
      setIsAILoading(false);
    }
  };

  // loading & error 处理
  if (loading) return <Card className={className}><div className="py-20 text-center text-gray-500">数据加载中...</div></Card>;
  if (error) return <Card className={className}><div className="py-20 text-center text-red-500">数据加载失败：{error}</div></Card>;

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            UPST Gamma Distribution
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
          <div className="h-full relative rounded-2xl gamma-chart" style={{ background: 'var(--on-surface-1)' }}>
            {/* 右上角信息 */}
            <div className="absolute top-4 right-6 text-right min-w-[120px] text-[14px] leading-[1.5] z-10">
              <div className="" style={{ color: '#facc15' }}>Stock Price: {meta.stockPrice}</div>
              <div className="" style={{ color: '#22c55e' }}>Call Wall: {meta.callWall}</div>
              <div className="" style={{ color: '#ef4444' }}>Put Wall: {meta.putWall}</div>
              <div className="text-theme-primary">
                Zero Gamma: {meta.zeroGamma !== null ? meta.zeroGamma : <span className="text-gray-400">暂无数据</span>}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
                <XAxis dataKey="strike" tick={{ fontSize: 13, fill: 'var(--primary)' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 13, fill: 'var(--primary)' }} tickFormatter={v => (Math.abs(v) >= 1e6 ? (v/1e6)+"M" : v)} domain={['dataMin', 'dataMax']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} iconType="rect" iconSize={12} />
                <ReferenceLine y={0} stroke="var(--primary)" strokeWidth={2} />
                <Bar dataKey="callGamma" name="Calls" fill="#B5E4CA" barSize={14} radius={[4, 4, 0, 0]} />
                <Bar dataKey="putGamma" name="Puts" fill="#0C68E9" barSize={14} radius={[4, 4, 0, 0]} />
                <ReferenceLine x={meta.callWall} stroke="#22c55e" strokeDasharray="12 6" strokeWidth={3} />
                <ReferenceLine x={meta.putWall} stroke="#ef4444" strokeDasharray="12 6" strokeWidth={3} />
                {meta.zeroGamma !== null && (
                  <ReferenceLine x={meta.zeroGamma} stroke="#fff" strokeDasharray="6 3" />
                )}
                <ReferenceLine x={meta.stockPrice} stroke="#facc15" strokeDasharray="6 3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-2xl text-center text-theme-primary">BTC Gamma</div>
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
            onClick={() => setIsFullscreen(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
      <div className="relative rounded-2xl gamma-chart" style={{ height: 400, background: 'var(--on-surface-1)' }}>
        {/* 右上角信息 */}
        <div className="absolute top-4 right-6 text-right min-w-[120px] text-[14px] leading-[1.5] z-10">
          <div className="" style={{ color: '#facc15' }}>Stock Price: {meta.stockPrice}</div>
          <div className="" style={{ color: '#22c55e' }}>Call Wall: {meta.callWall}</div>
          <div className="" style={{ color: '#ef4444' }}>Put Wall: {meta.putWall}</div>
          <div className="text-theme-primary">
            Zero Gamma: {meta.zeroGamma !== null ? meta.zeroGamma : <span className="text-gray-400">暂无数据</span>}
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--stroke)" />
            <XAxis dataKey="strike" tick={{ fontSize: 13, fill: 'var(--primary)' }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 13, fill: 'var(--primary)' }} tickFormatter={v => (Math.abs(v) >= 1e6 ? (v/1e6)+"M" : v)} domain={['dataMin', 'dataMax']} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 8 }} iconType="rect" iconSize={12} />
            <ReferenceLine y={0} stroke="var(--primary)" strokeWidth={2} />
            <Bar dataKey="callGamma" name="Calls" fill="#B5E4CA" barSize={14} radius={[4, 4, 0, 0]} />
            <Bar dataKey="putGamma" name="Puts" fill="#0C68E9" barSize={14} radius={[4, 4, 0, 0]} />
            <ReferenceLine x={meta.callWall} stroke="#22c55e" strokeDasharray="12 6" strokeWidth={3} />
            <ReferenceLine x={meta.putWall} stroke="#ef4444" strokeDasharray="12 6" strokeWidth={3} />
            {meta.zeroGamma !== null && (
              <ReferenceLine x={meta.zeroGamma} stroke="#fff" strokeDasharray="6 3" />
            )}
            <ReferenceLine x={meta.stockPrice} stroke="#facc15" strokeDasharray="6 3" />
          </BarChart>
        </ResponsiveContainer>
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
                    <h3 className="text-xl font-bold text-white">AI Gamma分析总结</h3>
                    <p className="text-white/80 text-sm">基于UPST期权数据智能分析</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">当前股价</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">${meta.stockPrice}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">最大Call Gamma</p>
                        <p className="text-lg font-bold text-green-600">{(Math.max(...data.map(d => d.callGamma)) / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">最大Put Gamma</p>
                        <p className="text-lg font-bold text-blue-600">{(Math.abs(Math.min(...data.map(d => d.putGamma))) / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  </div>

                  {/* 重要支撑阻力位 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">重要支撑阻力位</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Call Wall</p>
                        <p className="text-lg font-bold text-green-600">${meta.callWall}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">看涨期权集中区域</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Put Wall</p>
                        <p className="text-lg font-bold text-blue-600">${meta.putWall}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">看跌期权集中区域</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Zero Gamma</p>
                        <p className="text-lg font-bold text-gray-600">{meta.zeroGamma !== null ? meta.zeroGamma : <span className="text-gray-400">暂无</span>}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">中性Gamma点</p>
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
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300">股价接近Call Wall，可能面临上行阻力</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300">Put Wall提供下方支撑</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300">Gamma分布显示市场对{meta.stockPrice > meta.callWall ? '上行' : '下行'}方向有较强预期</p>
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
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">风险提示</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300">高Gamma区域价格波动可能加剧</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 dark:text-gray-300">建议关注${meta.callWall}和${meta.putWall}关键价位</p>
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

export default GammaDistribution; 