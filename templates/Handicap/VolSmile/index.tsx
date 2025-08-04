import React, { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import TimerSettingsModal from '@/components/TimerSettings';
import AISummaryModal from '@/components/AISummaryModal';
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
import { useVolSmileData } from "@/hooks/useVolSmileData";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  
  // 使用自定义Hook获取数据
  const { data, loading, error, fetchData, refresh } = useVolSmileData(symbol, true, 5 * 60 * 1000);

  // 修复hooks顺序：visible的初始值设为{}，data变化时重置
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (data) {
      setVisible(Object.fromEntries(data.lines.map((l: any) => [l.key, true])));
    }
  }, [data]);

  // OpenAI驱动的AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    
    try {
      if (!data || !data.data || data.data.length === 0) {
        setAiSummary({ error: '暂无数据可供分析。' });
        return;
      }

      // 准备数据用于AI分析
      const chartData = data.data;
      const lines = data.lines;
      
      // 计算各期限的波动率统计
      const expiryStats = lines.map(line => {
        const values = chartData.map(d => d[line.key]).filter(v => v !== undefined && v !== null && typeof v === 'number');
        return {
          name: line.name,
          key: line.key,
          avg: values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0,
          min: values.length > 0 ? Math.min(...values) : 0,
          max: values.length > 0 ? Math.max(...values) : 0,
          range: values.length > 0 ? Math.max(...values) - Math.min(...values) : 0
        };
      });

      // 分析微笑曲线特征
      const atmIndex = chartData.findIndex(d => Math.abs(Number(d.delta) - 0.5) < 0.1);
      const atmData = atmIndex >= 0 ? chartData[atmIndex] : chartData[Math.floor(chartData.length / 2)];
      
      const itmValues = chartData.filter(d => Number(d.delta) > 0.7).map(d => d[lines[0]?.key]).filter(v => v !== undefined && typeof v === 'number');
      const otmValues = chartData.filter(d => Number(d.delta) < 0.3).map(d => d[lines[0]?.key]).filter(v => v !== undefined && typeof v === 'number');
      
      const avgITM = itmValues.length > 0 ? itmValues.reduce((sum, v) => sum + v, 0) / itmValues.length : 0;
      const avgOTM = otmValues.length > 0 ? otmValues.reduce((sum, v) => sum + v, 0) / otmValues.length : 0;
      const atmValue = atmData && typeof atmData[lines[0]?.key] === 'number' ? atmData[lines[0]?.key] : 0;
      
      const smileIntensity = Math.abs(avgITM - avgOTM);
      const smileDirection = avgITM > avgOTM ? '正向微笑' : '反向微笑';
      
      // 分析期限结构
      const shortTerm = expiryStats.find(s => s.name.includes('7D') || s.name.includes('14D'));
      const longTerm = expiryStats.find(s => s.name.includes('90D') || s.name.includes('180D'));
      const termSlope = longTerm && shortTerm ? longTerm.avg - shortTerm.avg : 0;

      // 构建AI分析请求数据
      const analysisData = {
        symbol: symbol.toUpperCase(),
        atmValue: atmValue,
        avgITM: avgITM,
        avgOTM: avgOTM,
        smileIntensity: smileIntensity,
        smileDirection: smileDirection,
        termSlope: termSlope,
        expiryStats: expiryStats,
        shortTerm: shortTerm,
        longTerm: longTerm,
        chartData: chartData.slice(0, 10), // 只发送前10个数据点避免token过多
        lines: lines
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'volatility_smile',
          prompt: `请分析${symbol.toUpperCase()}波动率微笑数据，提供专业的期权市场分析。数据包括：
          - ATM波动率: ${typeof atmValue === 'number' ? atmValue.toFixed(2) : atmValue}%
          - ITM平均波动率: ${typeof avgITM === 'number' ? avgITM.toFixed(2) : avgITM}%
          - OTM平均波动率: ${typeof avgOTM === 'number' ? avgOTM.toFixed(2) : avgOTM}%
          - 微笑强度: ${typeof smileIntensity === 'number' ? smileIntensity.toFixed(2) : smileIntensity}%
          - 微笑方向: ${smileDirection}
          - 期限斜率: ${typeof termSlope === 'number' ? termSlope.toFixed(2) : termSlope}%
          
          请提供结构化的分析报告，包括核心统计指标、期限结构分析、微笑曲线洞察和风险提示。`
        })
      });

      console.log('[VolSmile] OpenAI API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[VolSmile] OpenAI API错误详情:', errorData);
        
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
      console.log('[VolSmile] OpenAI API响应成功:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // 使用OpenAI返回的结构化数据
      setAiSummary(result.summary);

    } catch (error) {
      console.error('AI分析错误:', error);
      
      // 显示错误信息给用户
      setAiSummary([{
        type: 'error',
        title: 'AI分析失败',
        icon: 'error',
        items: [{
          title: '错误信息',
          value: error.message || '未知错误',
          valueColor: 'text-red-600',
          subTitle: '请稍后重试或联系管理员',
          subValue: ''
        }]
      }]);
      
      // 如果OpenAI失败，回退到本地分析
      try {
        const fallbackSummary = [
          {
            type: 'core',
            title: '核心统计指标',
            icon: 'stats',
            items: [
              {
                title: 'ATM波动率',
                value: data && data.data ? (() => {
                  const atmIndex = data.data.findIndex((d: any) => Math.abs(Number(d.delta) - 0.5) < 0.1);
                  const atmData = atmIndex >= 0 ? data.data[atmIndex] : data.data[Math.floor(data.data.length / 2)];
                  const value = atmData && typeof atmData[data.lines[0]?.key] === 'number' ? atmData[data.lines[0]?.key] : null;
                  return value !== null ? (typeof value === 'number' ? value.toFixed(2) : value) : 'N/A';
                })() : 'N/A',
                valueColor: 'text-blue-600',
                subTitle: 'Delta: 0.50',
                subValue: '',
              },
              {
                title: '微笑强度',
                value: data && data.data ? (() => {
                  const itmValues = data.data.filter((d: any) => Number(d.delta) > 0.7).map((d: any) => d[data.lines[0]?.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                  const otmValues = data.data.filter((d: any) => Number(d.delta) < 0.3).map((d: any) => d[data.lines[0]?.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                  const avgITM = itmValues.length > 0 ? itmValues.reduce((sum: number, v: number) => sum + v, 0) / itmValues.length : 0;
                  const avgOTM = otmValues.length > 0 ? otmValues.reduce((sum: number, v: number) => sum + v, 0) / otmValues.length : 0;
                  const intensity = Math.abs(avgITM - avgOTM);
                  return typeof intensity === 'number' ? intensity.toFixed(2) : 'N/A';
                })() : 'N/A',
                valueColor: 'text-purple-600',
                subTitle: 'ITM vs OTM差异',
                subValue: '',
              },
            ],
          },
          {
            type: 'structure',
            title: '期限结构分析',
            icon: 'structure',
            items: [
              {
                title: '期限斜率',
                value: data && data.lines ? (() => {
                  if (data.lines.length >= 2) {
                    const shortTerm = data.lines[0];
                    const longTerm = data.lines[data.lines.length - 1];
                    const shortValues = data.data.map((d: any) => d[shortTerm.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                    const longValues = data.data.map((d: any) => d[longTerm.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                    const shortAvg = shortValues.length > 0 ? shortValues.reduce((sum: number, v: number) => sum + v, 0) / shortValues.length : 0;
                    const longAvg = longValues.length > 0 ? longValues.reduce((sum: number, v: number) => sum + v, 0) / longValues.length : 0;
                    const slope = longAvg - shortAvg;
                    return (slope > 0 ? '+' : '') + (typeof slope === 'number' ? slope.toFixed(2) : 'N/A');
                  }
                  return 'N/A';
                })() : 'N/A',
                valueColor: 'text-green-600',
                subTitle: '远期 vs 近期',
                subValue: '',
              },
            ],
          },
          {
            type: 'sentiment',
            title: '市场情绪洞察',
            icon: 'sentiment',
            items: [
              {
                title: '微笑特征',
                value: data && data.data ? (() => {
                  const itmValues = data.data.filter((d: any) => Number(d.delta) > 0.7).map((d: any) => d[data.lines[0]?.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                  const otmValues = data.data.filter((d: any) => Number(d.delta) < 0.3).map((d: any) => d[data.lines[0]?.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                  const avgITM = itmValues.length > 0 ? itmValues.reduce((sum: number, v: number) => sum + v, 0) / itmValues.length : 0;
                  const avgOTM = otmValues.length > 0 ? otmValues.reduce((sum: number, v: number) => sum + v, 0) / otmValues.length : 0;
                  const intensity = Math.abs(avgITM - avgOTM);
                  const direction = avgITM > avgOTM ? '正向微笑' : '反向微笑';
                  return `${intensity > 5 ? '强烈' : intensity > 2 ? '中等' : '轻微'}${direction}`;
                })() : '数据不足',
                valueColor: 'text-yellow-600',
                subTitle: '',
                subValue: '',
              },
            ],
          },
          {
            type: 'risk',
            title: '风险提示',
            icon: 'risk',
            items: [
              {
                title: '建议关注',
                value: data && data.data ? (() => {
                  const itmValues = data.data.filter((d: any) => Number(d.delta) > 0.7).map((d: any) => d[data.lines[0]?.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                  const otmValues = data.data.filter((d: any) => Number(d.delta) < 0.3).map((d: any) => d[data.lines[0]?.key]).filter((v: any) => v !== undefined && typeof v === 'number');
                  const avgITM = itmValues.length > 0 ? itmValues.reduce((sum: number, v: number) => sum + v, 0) / itmValues.length : 0;
                  const avgOTM = otmValues.length > 0 ? otmValues.reduce((sum: number, v: number) => sum + v, 0) / otmValues.length : 0;
                  const intensity = Math.abs(avgITM - avgOTM);
                  return intensity > 5 ? '微笑曲线明显，需关注偏斜风险' : '微笑曲线平缓，相对稳定';
                })() : '数据不足',
                valueColor: 'text-red-500',
                subTitle: '',
                subValue: '',
              },
            ],
          },
        ];
        setAiSummary(fallbackSummary);
      } catch (fallbackError) {
        setAiSummary({ error: 'AI分析生成失败，请稍后重试。' });
      }
    } finally {
      setIsAILoading(false);
    }
  };

  // 状态补充
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    enabled: false,
    interval: 30, // 分钟
    nextRun: null as Date | null,
    telegramChatId: '',
    telegramBotToken: ''
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 全屏和普通模式下AI总结模态框统一为：
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

      {/* 全屏模式下的AI总结模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI 波动率微笑分析总结"
          symbol={symbol + " 波动率微笑"}
        />
      )}
      {/* 定时器设置模态框 */}
      {showTimerModal && (
        <TimerSettingsModal
          settings={timerSettings}
          onSave={async (newSettings) => {
            try {
              if (newSettings.enabled) {
                if (!newSettings.telegramBotToken.trim()) {
                  throw new Error('请输入Telegram Bot Token');
                }
                if (!newSettings.telegramChatId.trim()) {
                  throw new Error('请输入Telegram Chat ID');
                }
                const chatId = newSettings.telegramChatId.trim();
                if (!/^-?\d+$/.test(chatId)) {
                  throw new Error('Chat ID必须是数字格式');
                }
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

export default VolSmile; 