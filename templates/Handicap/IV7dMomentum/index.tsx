import React, { useState } from "react";
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
  ReferenceLine,
} from "recharts";
import AISummaryModal from '@/components/AISummaryModal';
import TimerSettingsModal, { TimerSettings } from '@/components/TimerSettings';

// 使用API数据
const useRVMomentumData = (dateRange: string) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    
    // 根据选择的时间范围确定days参数
    const daysMap: Record<string, number> = {
      '1w': 7,
      '2w': 14,
      '1m': 30
    };
    
    const days = daysMap[dateRange] || 7;
    
    fetch(`http://103.106.191.243:8001/deribit/option/rv_momentum?symbol=BTC&days=${days}&window=7`)
      .then(res => {
        if (!res.ok) throw new Error('网络错误');
        return res.json();
      })
      .then(json => {
        // 使用API返回的数据
        setData(json.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [dateRange]);

  return { data, loading, error };
};

const dateRanges = [
  { label: '1W', value: '1w' },
  { label: '2W', value: '2w' },
  { label: '1M', value: '1m' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">
          📅 {label}
        </p>
        <div className="space-y-2">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                  style={{ background: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{item.name}:</span>
              </div>
              <span className="text-sm text-gray-900 dark:text-white font-bold">
                {item.dataKey === 'rv_momentum' ? `${item.value > 0 ? '+' : ''}${item.value.toFixed(2)}%` : `${item.value.toFixed(2)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const lines = [
  { key: 'rv_momentum', name: 'RV Momentum', color: '#eab308', strokeWidth: 3 },
  { key: 'rv', name: '7D RV', color: '#38bdf8', strokeWidth: 3 },
];

// 自定义底部Legend，始终显示所有按钮，变灰/高亮
function CustomLegend({ visible, onClick }: any) {
  return (
    <div className="flex flex-row justify-center items-center gap-6 mt-4 text-sm font-medium leading-tight flex-wrap">
      {lines.map(line => (
        <div
          key={line.key}
          className="flex items-center cursor-pointer select-none group"
          onClick={() => onClick(line.key)}
        >
          <div
            className="inline-block mr-3 relative"
            style={{
              width: 24,
              height: 3,
              background: visible[line.key] ? line.color : '#d1d5db',
              borderRadius: 2,
              transition: 'all 0.3s ease',
            }}
          >
            {visible[line.key] && (
              <div 
                className="absolute inset-0 rounded-full animate-pulse opacity-30"
                style={{ background: line.color }}
          />
            )}
          </div>
          <span
            className={`transition-all duration-300 ${
              visible[line.key] 
                ? 'text-gray-900 dark:text-white font-semibold' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
            style={{ 
              color: visible[line.key] ? line.color : undefined,
            }}
          >
            {line.name}
          </span>
        </div>
      ))}
    </div>
  );
}

const IV7dMomentum = ({ className }: { className?: string }) => {
  const [dateRange, setDateRange] = useState('1w');
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

  const { data, loading, error } = useRVMomentumData(dateRange);

  const handleLegendClick = (key: string) => {
    setVisible((v: Record<string, boolean>) => ({ ...v, [key]: !v[key] }));
  };

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
        dateRange,
        data: data.slice(-14), // 只取近14天
      };
      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'rv_momentum',
          prompt: `请分析BTC 7天RV动量数据，提供结构化的期权市场分析，包括核心统计指标、趋势分析、市场情绪洞察、风险提示，并在报告中包含AI操作建议（如策略建议、仓位管理、时间窗口等）。`
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
          // ...核心统计、趋势、情绪、风险等块...
          // ...
          {
            type: 'advice',
            title: 'AI操作建议',
            icon: 'advice',
            items: [
              { title: '策略建议', value: avgMomentum > 1 ? '考虑做多波动率策略' : avgMomentum < -1 ? '考虑做空波动率策略' : '保持观望', valueColor: 'text-emerald-600', subTitle: '基于动量趋势', subValue: avgMomentum > 1 ? '动量持续上升' : avgMomentum < -1 ? '动量持续下降' : '动量平稳' },
              { title: '仓位管理', value: Math.abs(currentMomentum) > 3 ? '增加对冲仓位' : '正常仓位', valueColor: 'text-emerald-600', subTitle: '风险控制', subValue: Math.abs(currentMomentum) > 3 ? '动量波动较大' : '动量相对稳定' },
              { title: '时间窗口', value: '关注未来1-2周', valueColor: 'text-emerald-600', subTitle: '最佳时机', subValue: '动量变化拐点' },
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

  // 计算数据范围用于Y轴
  const rvMomentumValues = data.map((item: any) => item.rv_momentum).filter((v: number) => v !== null && v !== undefined);
  const rvValues = data.map((item: any) => item.rv).filter((v: number) => v !== null && v !== undefined);
  
  // 优化Y轴范围，增加视觉分离效果
  const rvMomentumMin = Math.min(-20, ...rvMomentumValues);
  const rvMomentumMax = Math.max(20, ...rvMomentumValues);
  
  // 为RV值添加偏移，避免与动量线重叠
  const rvMin = Math.max(0, Math.min(...rvValues) - 10);
  const rvMax = Math.min(60, Math.max(...rvValues) + 10);

  // 计算当前统计信息
  const currentRV = data.length > 0 ? data[data.length - 1].rv : 0;
  const currentMomentum = data.length > 0 ? data[data.length - 1].rv_momentum : 0;
  const avgRV = rvValues.length > 0 ? rvValues.reduce((sum: number, v: number) => sum + v, 0) / rvValues.length : 0;
  const avgMomentum = rvMomentumValues.length > 0 ? rvMomentumValues.reduce((sum: number, v: number) => sum + v, 0) / rvMomentumValues.length : 0;

  // 判断趋势
  const getTrendText = (momentum: number) => {
    if (momentum > 2) return '强势上升';
    if (momentum > 0.5) return '温和上升';
    if (momentum < -2) return '强势下降';
    if (momentum < -0.5) return '温和下降';
    return '相对稳定';
  };

  const getTrendColor = (momentum: number) => {
    if (momentum > 2) return 'text-green-600';
    if (momentum > 0.5) return 'text-blue-600';
    if (momentum < -2) return 'text-red-600';
    if (momentum < -0.5) return 'text-orange-600';
    return 'text-gray-600';
  };

  // 图表内容组件
  const chartContent = (
    <>
      <div className="mb-2 flex items-center space-x-2">
        {dateRanges.map(r => (
          <button
            key={r.value}
            className={`px-2 py-0.5 rounded text-xs border ${dateRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setDateRange(r.value)}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-4 text-xs text-theme-tertiary">
          {data.length > 0 ? `UTC+8 ${data[0].date} ~ ${data[data.length - 1].date}` : '暂无数据'}
        </span>
      </div>

      <div className={isFullscreen ? "h-[calc(100vh-300px)]" : "h-96"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.2)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#6F767E' }} 
              axisLine={{ stroke: '#6F767E', strokeWidth: 1 }}
              tickLine={{ stroke: '#6F767E', strokeWidth: 1 }}
            />
            <YAxis 
              yAxisId="left" 
              tick={{ fontSize: 11, fill: '#eab308' }} 
              domain={[rvMomentumMin, rvMomentumMax]} 
              label={{ value: '7day Change Speed (RV)', angle: -90, position: 'insideLeft', fill: '#eab308', fontSize: 11 }} 
              axisLine={{ stroke: '#eab308', strokeWidth: 1 }}
              tickLine={{ stroke: '#eab308', strokeWidth: 1 }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 11, fill: '#38bdf8' }} 
              domain={[rvMin, rvMax]} 
              label={{ value: 'RV', angle: 90, position: 'insideRight', fill: '#38bdf8', fontSize: 11 }} 
              axisLine={{ stroke: '#38bdf8', strokeWidth: 1 }}
              tickLine={{ stroke: '#38bdf8', strokeWidth: 1 }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 添加零线参考 */}
            <ReferenceLine y={0} yAxisId="left" stroke="#6F767E" strokeDasharray="3 3" strokeWidth={1} />
            
            <RechartsLegend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12 }}
              content={() => <CustomLegend visible={visible} onClick={handleLegendClick} />}
            />
            {visible['rv_momentum'] && (
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="rv_momentum" 
                name="RV Momentum" 
                stroke="#eab308" 
                strokeWidth={3} 
                dot={{ fill: '#eab308', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#eab308', strokeWidth: 2, fill: '#fff' }}
                strokeDasharray="0"
              />
            )}
            {visible['rv'] && (
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="rv" 
                name="7D RV" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                dot={{ fill: '#38bdf8', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 2, fill: '#fff' }}
                strokeDasharray="0"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  if (loading) {
    return (
      <Card title="7天RV态势" className={className}>
        <div className="h-80 flex items-center justify-center">加载中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="7天RV态势" className={className}>
        <div className="h-80 flex items-center justify-center text-red-500">错误: {error}</div>
      </Card>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7天RV态势 - 全屏视图</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAISummary}
              disabled={isAILoading}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded-lg transition-colors"
            >
              {isAILoading ? '分析中...' : 'AI总结'}
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              退出全屏
            </button>
          </div>
        </div>

        {/* 全屏内容 */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {chartContent}
          </div>
        </div>

        {/* AI分析动画模态框 */}
        {showAISummary && (
          <AISummaryModal
            isLoading={isAILoading}
            summary={aiSummary}
            onClose={() => setShowAISummary(false)}
            title="AI RV动量分析总结"
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
      </div>
    );
  }

  return (
    <Card title="7天RV态势" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        </div>
      </div>
      
      {chartContent}

      {/* AI分析动画模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI RV动量分析总结"
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

export default IV7dMomentum; 