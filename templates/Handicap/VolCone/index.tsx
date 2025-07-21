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
import { useVolCone } from "@/hooks/useVolCone";
import AISummaryModal from '@/components/AISummaryModal';
import TimerSettingsModal, { TimerSettings } from '@/components/TimerSettings';

// 定义线条配置
const lines = [
  { key: 'current', name: 'Current', color: '#eab308', dash: false },
  { key: 'min', name: 'Minimum', color: '#22c55e', dash: true },
  { key: 'p10', name: '10%', color: '#38bdf8', dash: true },
  { key: 'p50', name: 'Median', color: '#f472b6', dash: false },
  { key: 'p90', name: '90%', color: '#a3e635', dash: true },
  { key: 'max', name: 'Maximum', color: '#a78bfa', dash: false },
];

const types = [
  { label: 'RV', value: 'rv' },
  { label: 'IV', value: 'iv' },
];
const dateRanges = [
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
  { label: '3Y', value: '3y' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // 组装每条线的显示内容
    const items = [
      { name: '当前', value: data.current, color: '#eab308' },
      { name: '最小', value: data.min, color: '#22c55e' },
      { name: '10%', value: data.p10, color: '#38bdf8' },
      { name: '中位数', value: data.p50, color: '#f472b6' },
      { name: '90%', value: data.p90, color: '#a3e635' },
      { name: '最大', value: data.max, color: '#a78bfa' },
    ];
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">期限: {label}</p>
        <div className="space-y-1">
          {items.map((item, idx) => (
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

// 自定义底部Legend，始终显示所有按钮，变灰/高亮
function CustomLegend({ visible, onClick }: any) {
  return (
    <div className="flex flex-row justify-center items-center gap-4 mt-2 text-xs font-normal leading-tight flex-wrap">
      {lines.map(line => (
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

const VolCone = ({ className }: { className?: string }) => {
  const [type, setType] = useState('rv');
  const [dateRange, setDateRange] = useState('1y');
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));
  const [isFullscreen, setIsFullscreen] = useState(false);
  // AI分析相关
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null); // 结构化summary
  const [showAISummary, setShowAISummary] = useState(false);
  // 定时推送相关
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    enabled: false,
    interval: 60,
    nextRun: null,
    telegramChatId: '',
    telegramBotToken: '',
  });
  
  // 使用自定义Hook获取数据
  const { data, loading, error, refresh, updateDays } = useVolCone({
    symbol: 'BTC',
    windows: [7, 14, 30, 60, 90],
    days: dateRange === '1y' ? 365 : dateRange === '2y' ? 730 : 1095,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000
  });

  // 当日期范围改变时更新数据
  useEffect(() => {
    const days = dateRange === '1y' ? 365 : dateRange === '2y' ? 730 : 1095;
    updateDays(days);
  }, [dateRange, updateDays]);

  const handleLegendClick = (key: string) => {
    setVisible((v: Record<string, boolean>) => ({ ...v, [key]: !v[key] }));
  };

  // 转换数据格式，将window转换为term显示
  const chartData = data.map(item => ({
    term: `${item.window}D`,
    current: item.current,
    min: item.min,
    p10: item.p10,
    p50: item.p50,
    p90: item.p90,
    max: item.max,
  }));

  // 计算统计指标（移到组件级别）
  const currentValues = data.map(d => d.current);
  const minValues = data.map(d => d.min);
  const maxValues = data.map(d => d.max);
  const medianValues = data.map(d => d.p50);
  
  const avgCurrent = currentValues.length > 0 ? currentValues.reduce((sum, v) => sum + v, 0) / currentValues.length : 0;
  const avgMin = minValues.length > 0 ? minValues.reduce((sum, v) => sum + v, 0) / minValues.length : 0;
  const avgMax = maxValues.length > 0 ? maxValues.reduce((sum, v) => sum + v, 0) / maxValues.length : 0;
  const avgMedian = medianValues.length > 0 ? medianValues.reduce((sum, v) => sum + v, 0) / medianValues.length : 0;
  
  const currentRange = currentValues.length > 0 ? Math.max(...currentValues) - Math.min(...currentValues) : 0;
  const volatilityRange = avgMax - avgMin;
  
  // 分析期限结构
  const shortTermCurrent = data[0]?.current || 0;
  const longTermCurrent = data[data.length - 1]?.current || 0;
  const termSlope = longTermCurrent - shortTermCurrent;
  
  // 分析波动率锥形状
  const coneShape = volatilityRange > 20 ? '宽锥' : volatilityRange > 10 ? '中等锥' : '窄锥';
  const currentPosition = avgCurrent > avgMedian ? '高于中位数' : '低于中位数';

  // AI总结功能（调用openai结构化分析）
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    try {
      if (!data || data.length === 0) {
        setAiSummary([{ type: 'error', title: '暂无数据可供分析。', items: [] }]);
        return;
      }
      // 组装分析数据
      const analysisData = {
        symbol: 'BTC',
        type,
        dateRange,
        data: data.slice(-10), // 只取近10个期限
      };
      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'vol_cone',
          prompt: `请分析BTC波动率锥数据，提供结构化的期权市场分析，包括核心统计指标、期限结构、波动率锥洞察、风险提示，并在报告中包含AI操作建议（如策略建议、仓位管理、时间窗口等）。`
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        setAiSummary([{ type: 'error', title: errorData.error || 'AI分析请求失败', items: [] }]);
        return;
      }
      const result = await response.json();
      if (result.summary && Array.isArray(result.summary) && result.summary.length > 0) {
        setAiSummary(result.summary);
      } else {
        // fallback: 本地降级分析
        setAiSummary([
          // ...核心统计、结构、情绪、风险等块...
          // ...
          {
            type: 'advice',
            title: 'AI操作建议',
            icon: 'advice',
            items: [
              { title: '策略建议', value: coneShape === '宽锥' ? '考虑做多波动率策略' : coneShape === '窄锥' ? '保持观望' : '适度参与波动率策略', valueColor: 'text-emerald-600', subTitle: '基于锥形特征', subValue: coneShape },
              { title: '仓位管理', value: volatilityRange > 15 ? '增加对冲仓位' : '正常仓位', valueColor: 'text-emerald-600', subTitle: '风险控制', subValue: volatilityRange > 15 ? '波动率差异较大' : '波动率相对稳定' },
              { title: '时间窗口', value: '关注7-30天期限', valueColor: 'text-emerald-600', subTitle: '最佳时机', subValue: '波动率锥拐点' },
            ]
          }
        ]);
      }
    } catch (error: any) {
      setAiSummary([{ type: 'error', title: error?.message || 'AI分析生成失败，请稍后重试。', items: [] }]);
    } finally {
      setIsAILoading(false);
    }
  };

  // 定时推送保存
  const handleSaveTimerSettings = async (settings: TimerSettings) => {
    setTimerSettings(settings);
    // 这里可加API保存逻辑
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            BTC 波动率锥
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {types.map(t => (
                <button
                  key={t.value}
                  className={`px-3 py-1 rounded text-sm border ${type === t.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'}`}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
              {dateRanges.map(r => (
                <button
                  key={r.value}
                  className={`px-3 py-1 rounded text-sm border ${dateRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'}`}
                  onClick={() => setDateRange(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button 
              className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
              title="AI分析"
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
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111, 118, 126, 0.09)" />
                <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[0, 'dataMax + 10']} unit="%" />
                <Tooltip content={CustomTooltip} />
                <RechartsLegend
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12 }}
                  content={() => <CustomLegend visible={visible} onClick={handleLegendClick} />}
                />
                {lines.map(line => visible[line.key] && (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={2}
                    strokeDasharray={line.dash ? '5 5' : undefined}
                    dot={{ r: 3, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 全屏模式下的AI总结模态框 */}
        {showAISummary && (
          <AISummaryModal
            isLoading={isAILoading}
            summary={aiSummary}
            onClose={() => setShowAISummary(false)}
            title="AI 波动率锥分析总结"
            symbol="BTC"
          />
        )}
      </div>
    );
  }

  return (
    <Card title="波动率锥" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {types.map(t => (
            <button
              key={t.value}
              className={`px-2 py-0.5 rounded text-xs border ${type === t.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
          {dateRanges.map(r => (
            <button
              key={r.value}
              className={`px-2 py-0.5 rounded text-xs border ${dateRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
              onClick={() => setDateRange(r.value)}
            >
              {r.label}
            </button>
          ))}
          {loading && (
            <div className="flex items-center gap-1 text-xs text-theme-secondary">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
            title="AI分析"
            onClick={handleAISummary}
            disabled={isAILoading}
          >
            AI
          </button>
          <button
            className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-md hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
            title="定时推送"
            onClick={() => setShowTimerSettings(true)}
          >
            定时推送
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
        {loading && !chartData.length ? (
          <div className="flex items-center justify-center h-full text-theme-secondary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              加载中...
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111, 118, 126, 0.09)" />
              <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[0, 'dataMax + 10']} unit="%" />
              <Tooltip content={CustomTooltip} />
              <RechartsLegend
                iconType="plainline"
                wrapperStyle={{ fontSize: 12 }}
                content={() => <CustomLegend visible={visible} onClick={handleLegendClick} />}
              />
              {lines.map(line => visible[line.key] && (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  strokeDasharray={line.dash ? '5 5' : undefined}
                  dot={{ r: 3, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI分析动画模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI 波动率锥分析总结"
          symbol="BTC"
        />
      )}
      {/* 定时推送设置模态框 */}
      {showTimerSettings && (
        <TimerSettingsModal
          settings={timerSettings}
          onSave={handleSaveTimerSettings}
          onClose={() => setShowTimerSettings(false)}
        />
      )}
    </Card>
  );
};

export default VolCone; 