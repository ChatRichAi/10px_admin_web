import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import { useOpenInterest } from "@/hooks/useOpenInterest";
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
import { 
  AILoadingAnimation, 
  MarketSentimentIndicator, 
  AIButton,
  AIAnalysisResult 
} from "@/components/AIAnimation";



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
  const [aiSummary, setAiSummary] = useState<any[]>([]);
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
  } = useOpenInterest({
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
        setAiSummary([{
          type: 'error',
          title: '暂无数据',
          icon: 'error',
          items: [{
            title: '错误信息',
            value: '暂无数据可供分析',
            valueColor: 'text-red-600',
            subTitle: '请稍后重试',
            subValue: ''
          }]
        }]);
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

      // 构建AI分析请求数据
      const analysisData = {
        symbol: coin.toUpperCase(),
        totalCalls: totalCalls,
        totalPuts: totalPuts,
        totalPCR: totalPCR,
        avgPCR: avgPCR,
        maxCalls: maxCalls,
        maxPuts: maxPuts,
        maxCallsExpiry: maxCallsExpiry,
        maxPutsExpiry: maxPutsExpiry,
        maxCallsPercent: maxCallsPercent,
        maxPutsPercent: maxPutsPercent,
        bullishExpiries: bullishExpiries,
        bearishExpiries: bearishExpiries,
        neutralExpiries: neutralExpiries,
        highPCRExpiries: highPCRExpiries,
        lowPCRExpiries: lowPCRExpiries,
        top3Volume: top3Volume.map(d => ({ expiry: d.expiry, totalVolume: d.calls + d.puts })),
        openInterestData: openInterestData.slice(0, 10) // 只发送前10个数据点避免token过多
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'option_open_interest',
          prompt: `请分析${coin.toUpperCase()}期权持仓量数据，提供专业的期权市场分析。数据包括：
          - 总Call持仓量: ${totalCalls.toLocaleString()}
          - 总Put持仓量: ${totalPuts.toLocaleString()}
          - 整体PCR: ${totalPCR.toFixed(2)} (${totalPCR > 1 ? '看跌主导' : totalPCR < 0.7 ? '看涨主导' : '多空平衡'})
          - 平均PCR: ${avgPCR.toFixed(2)}
          - 最大Call持仓: ${maxCalls.toLocaleString()} @ ${maxCallsExpiry} (占比${maxCallsPercent.toFixed(1)}%)
          - 最大Put持仓: ${maxPuts.toLocaleString()} @ ${maxPutsExpiry} (占比${maxPutsPercent.toFixed(1)}%)
          - 看涨到期日: ${bullishExpiries}个 (PCR < 0.7)
          - 看跌到期日: ${bearishExpiries}个 (PCR > 1.2)
          - 平衡到期日: ${neutralExpiries}个
          - 持仓量前三: ${top3Volume.map(d => `${d.expiry}(${(d.calls + d.puts).toLocaleString()})`).join(', ')}
          - 高PCR到期日: ${highPCRExpiries.length > 0 ? highPCRExpiries.map(d => `${d.expiry}(PCR:${d.pcr.toFixed(2)})`).join(', ') : '无'}
          - 低PCR到期日: ${lowPCRExpiries.length > 0 ? lowPCRExpiries.map(d => `${d.expiry}(PCR:${d.pcr.toFixed(2)})`).join(', ') : '无'}
          
          请提供结构化的分析报告，包括核心统计指标、持仓量集中度分析、市场情绪分布、到期日分析和风险预警。`
        })
      });

      console.log('[OptionOpenInterest] OpenAI API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[OptionOpenInterest] OpenAI API错误详情:', errorData);
        
        // 根据错误代码提供更友好的错误信息
        let errorMessage = 'AI分析请求失败';
        if (errorData.code === 'API_KEY_MISSING') {
          errorMessage = 'OpenAI API密钥未配置，请联系管理员';
        } else if (errorData.code === 'API_KEY_INVALID') {
          errorMessage = 'OpenAI API密钥无效，请联系管理员';
        } else if (errorData.code === 'AUTH_FAILED') {
          errorMessage = 'OpenAI API认证失败，请稍后重试';
        } else if (errorData.code === 'RATE_LIMIT') {
          errorMessage = 'API调用频率过高，请稍后重试';
        } else if (errorData.code === 'EMPTY_RESPONSE') {
          errorMessage = 'AI响应为空，请稍后重试';
        } else if (errorData.code === 'PARSE_ERROR') {
          errorMessage = 'AI响应格式错误，请稍后重试';
        } else {
          errorMessage = `AI分析请求失败: ${errorData.error || '未知错误'}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[OptionOpenInterest] OpenAI API响应成功:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // 使用OpenAI返回的结构化数据
      setAiSummary(result.summary);

    } catch (error: any) {
      console.error('AI分析错误:', error);
      
      // 显示错误信息给用户
      setAiSummary([{
        type: 'error',
        title: 'AI分析失败',
        icon: 'error',
        items: [{
          title: '错误信息',
          value: error?.message || '未知错误',
          valueColor: 'text-red-600',
          subTitle: '请稍后重试或联系管理员',
          subValue: ''
        }]
      }]);
      
      // 如果OpenAI失败，回退到本地分析
      try {
        // 重新计算分析数据
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

        const fallbackSummary = [
          {
            type: 'stats',
            title: '核心数据指标',
            icon: 'stats',
            items: [
              {
                title: '总Call持仓量',
                value: totalCalls.toLocaleString(),
                valueColor: 'text-green-600',
                subTitle: '看涨期权总持仓量',
                subValue: ''
              },
              {
                title: '总Put持仓量',
                value: totalPuts.toLocaleString(),
                valueColor: 'text-blue-600',
                subTitle: '看跌期权总持仓量',
                subValue: ''
              },
              {
                title: '整体PCR',
                value: totalPCR.toFixed(2),
                valueColor: totalPCR > 1 ? 'text-red-500' : totalPCR < 0.7 ? 'text-green-500' : 'text-yellow-500',
                subTitle: totalPCR > 1 ? '看跌主导' : totalPCR < 0.7 ? '看涨主导' : '多空平衡',
                subValue: ''
              },
              {
                title: '平均PCR',
                value: avgPCR.toFixed(2),
                valueColor: avgPCR > 1 ? 'text-red-500' : avgPCR < 0.7 ? 'text-green-500' : 'text-yellow-500',
                subTitle: '所有到期日平均',
                subValue: ''
              }
            ]
          },
          {
            type: 'structure',
            title: '持仓量集中度分析',
            icon: 'structure',
            items: [
              {
                title: '最大Call持仓',
                value: maxCallsExpiry || '-',
                valueColor: 'text-green-600',
                subTitle: `${maxCalls.toLocaleString()} (占比${maxCallsPercent.toFixed(1)}%)`,
                subValue: ''
              },
              {
                title: '最大Put持仓',
                value: maxPutsExpiry || '-',
                valueColor: 'text-blue-600',
                subTitle: `${maxPuts.toLocaleString()} (占比${maxPutsPercent.toFixed(1)}%)`,
                subValue: ''
              },
              {
                title: '持仓量前三',
                value: top3Volume.map(d => d.expiry).join(', '),
                valueColor: 'text-purple-600',
                subTitle: '重点关注到期日',
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
                title: '看涨到期日',
                value: bullishExpiries.toString(),
                valueColor: 'text-green-600',
                subTitle: 'PCR < 0.7',
                subValue: ''
              },
              {
                title: '看跌到期日',
                value: bearishExpiries.toString(),
                valueColor: 'text-red-600',
                subTitle: 'PCR > 1.2',
                subValue: ''
              },
              {
                title: '平衡到期日',
                value: neutralExpiries.toString(),
                valueColor: 'text-yellow-600',
                subTitle: '多空相对平衡',
                subValue: ''
              },
              {
                title: '整体情绪',
                value: totalPCR > 1 ? '偏向看跌' : totalPCR < 0.7 ? '偏向看涨' : '相对平衡',
                valueColor: totalPCR > 1 ? 'text-red-500' : totalPCR < 0.7 ? 'text-green-500' : 'text-yellow-500',
                subTitle: '市场整体倾向',
                subValue: ''
              }
            ]
          },
          {
            type: 'risk',
            title: '风险预警',
            icon: 'risk',
            items: [
              {
                title: '高PCR到期日',
                value: highPCRExpiries.length > 0 ? highPCRExpiries.map(d => `${d.expiry}(PCR:${d.pcr.toFixed(2)})`).join(', ') : '无',
                valueColor: 'text-red-600',
                subTitle: 'PCR > 1.2',
                subValue: ''
              },
              {
                title: '低PCR到期日',
                value: lowPCRExpiries.length > 0 ? lowPCRExpiries.map(d => `${d.expiry}(PCR:${d.pcr.toFixed(2)})`).join(', ') : '无',
                valueColor: 'text-green-600',
                subTitle: 'PCR < 0.5',
                subValue: ''
              },
              {
                title: '建议关注',
                value: top3Volume.map(d => d.expiry).join(', '),
                valueColor: 'text-blue-600',
                subTitle: '持仓量最高的到期日',
                subValue: ''
              }
            ]
          }
        ];

        setAiSummary(fallbackSummary);
      } catch (fallbackError) {
        console.error('回退分析也失败:', fallbackError);
        setAiSummary([{
          type: 'error',
          title: '分析失败',
          icon: 'error',
          items: [{
            title: '错误信息',
            value: '本地分析也失败，请检查数据',
            valueColor: 'text-red-600',
            subTitle: '请联系技术支持',
            subValue: ''
          }]
        }]);
      }
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
          <MarketSentimentIndicator pcr={totalPCR} isVisible={!isLoading} />
          
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
            <AIButton onClick={handleAISummary} isLoading={isAILoading}>
              AI
            </AIButton>
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
                <AILoadingAnimation message="AI正在分析数据..." />
              ) : (
                <AIAnalysisResult summary={aiSummary} isVisible={!isAILoading} />
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