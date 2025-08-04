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
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTermStructureData } from '@/hooks/useTermStructureData';

const lines = [
  { key: '5d_put', name: '5D Put', color: '#eab308' },
  { key: '10d_put', name: '10D Put', color: '#22c55e' },
  { key: '15d_put', name: '15D Put', color: '#0ea5e9' },
  { key: '20d_put', name: '20D Put', color: '#a21caf' },
  { key: '25d_put', name: '25D Put', color: '#84cc16' },
  { key: 'atm_vol', name: 'ATM', color: '#f472b6' },
  { key: '25d_call', name: '25D Call', color: '#f59e42' },
  { key: '20d_call', name: '20D Call', color: '#f43f5e' },
  { key: '15d_call', name: '15D Call', color: '#6366f1' },
  { key: '10d_call', name: '10D Call', color: '#06b6d4' },
  { key: '5d_call', name: '5D Call', color: '#38bdf8' },
];

function CustomLegend({ visible, onClick }: { visible: Record<string, boolean>, onClick: (key: string) => void }) {
  return (
    <div className="flex flex-col space-y-1 mt-2 text-xs font-normal leading-tight">
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">到期日: {label}</p>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
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

const TermStructure = ({ className }: { className?: string }) => {
  const { data, loading, error } = useTermStructureData();
  const [visible, setVisible] = useState(() => Object.fromEntries(lines.map(l => [l.key, true])));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showAISummary, setShowAISummary] = useState(false);
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

  
  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key]: !v[key] }));
  };

  // AI总结逻辑
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    try {
      if (!data || data.length === 0) {
        setAiSummary({ error: '暂无数据可供分析。' });
        return;
      }
      // 以ATM为主线分析
      const atmKey = 'atm_vol';
      const atmList = data.map((d: any) => d[atmKey]).filter((v: any) => typeof v === 'number');
      const expiryList = data.map((d: any) => d.expiry);
      const minATM = atmList.length > 0 ? Math.min(...atmList) : 0;
      const maxATM = atmList.length > 0 ? Math.max(...atmList) : 0;
      const avgATM = atmList.length > 0 ? atmList.reduce((sum: number, v: number) => sum + v, 0) / atmList.length : 0;
      // 期限斜率
      const slope = atmList.length > 1 ? atmList[atmList.length - 1] - atmList[0] : 0;
      // 结构特征
      let structure = '平坦';
      if (slope > 2) structure = '强烈正向';
      else if (slope > 0.5) structure = '温和正向';
      else if (slope < -2) structure = '强烈反向';
      else if (slope < -0.5) structure = '温和反向';
      // 市场情绪
      const sentiment = slope > 0 ? '远期波动率高于近期，市场预期未来更不确定' : '远期波动率低于近期，市场预期未来更平稳';
      // 风险提示
      const risk = Math.abs(slope) > 3 ? '期限结构陡峭，需警惕波动率回归风险' : '期限结构平缓，风险较低';
      // 组装合约信息
      const contractInfo = data.map((d: any) => ({
        expiry: d.expiry,
        strikes: d.strikes,
        spot: d.spot
      }));
      // 组装分析数据
      const analysisData = {
        atmList,
        expiryList,
        minATM,
        maxATM,
        avgATM,
        slope,
        structure,
        sentiment,
        risk,
        contractInfo
      };
      // 调用OpenAI API
      try {
        // 临时强制使用本地分析来确保套利机会显示
        const forceLocalAnalysis = false; // 允许OpenAI分析
        if (forceLocalAnalysis) {
          throw new Error('强制使用本地分析以显示套利机会');
        }
        const response = await fetch('/api/openai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: analysisData,
            analysisType: 'term_structure',
            prompt: `请分析BTC期限结构（ATM波动率随到期日变化）数据，生成结构化的期权市场分析报告。请严格按照以下要求返回结构化JSON，所有模块都必须出现，不可省略：\n\n1. 核心统计指标\n2. 期限结构特征\n3. 市场情绪洞察（必须包含“套利机会”字段，内容为对当前市场套利机会的简要评估）\n4. 套利机会详情（必须为单独模块，内容包括：历史均值套利、跨期限套利、回归套利，每项都要有title、value、subTitle、subValue）\n5. 风险提示\n6. AI操作建议（必须包含“套利策略”字段，内容为针对当前市场的套利操作建议）\n\n可用合约信息如下（每个到期日的可用行权价、现货价）：${JSON.stringify(contractInfo)}。\n\nJSON结构示例：\n{\n  "summary": [\n    { "type": "core", "title": "核心统计指标", "icon": "stats", "items": [ ... ] },\n    { "type": "structure", "title": "期限结构特征", "icon": "structure", "items": [ ... ] },\n    { "type": "sentiment", "title": "市场情绪洞察", "icon": "sentiment", "items": [ { "title": "套利机会", "value": "...", "subTitle": "...", "subValue": "..." } ] },\n    { "type": "arbitrage", "title": "套利机会详情", "icon": "arbitrage", "items": [ { "title": "历史均值套利", "value": "...", "subTitle": "...", "subValue": "..." }, { "title": "跨期限套利", "value": "...", "subTitle": "...", "subValue": "..." }, { "title": "回归套利", "value": "...", "subTitle": "...", "subValue": "..." } ] },\n    { "type": "risk", "title": "风险提示", "icon": "risk", "items": [ ... ] },\n    { "type": "advice", "title": "AI操作建议", "icon": "advice", "items": [ { "title": "套利策略", "value": "...", "subTitle": "...", "subValue": "..." } ] }\n  ]\n}\n\n注意：所有模块都必须出现，哪怕内容为空也要有结构。“套利机会详情”必须为单独模块且有三项，“AI操作建议”必须有“套利策略”。不要输出任何多余的解释或说明，只返回JSON。如未包含套利机会相关模块，将被判定为无效回答。`
          })
        });
        if (!response.ok) throw new Error('OpenAI分析请求失败');
        const result = await response.json();
        if (result.summary && Array.isArray(result.summary) && result.summary.length > 0) {
          // 检查是否包含套利机会模块，如果没有则使用本地分析
          const hasArbitrage = result.summary.some((block: any) => 
            block.type === 'arbitrage' || 
            (block.items && block.items.some((item: any) => item.title && item.title.includes('套利')))
          );
          
          if (!hasArbitrage) {
            console.log('OpenAI返回数据中缺少套利机会模块，使用本地分析');
            throw new Error('OpenAI返回数据不完整，使用本地分析');
          }
          
          setAiSummary(result.summary);
          return;
        } else {
          throw new Error('AI返回内容为空或格式错误');
        }
      } catch (err) {
        // fallback: 本地降级分析
        // 计算更多分析指标
        const stdATM = Math.sqrt(atmList.reduce((sum, v) => sum + Math.pow(v - avgATM, 2), 0) / atmList.length);
        const timeValueDecay = atmList.length > 1 ? atmList[atmList.length - 1] - atmList[0] : 0;
        const volatilityRegime = Math.abs(slope) > 5 ? '高波动率环境' : Math.abs(slope) > 2 ? '中等波动率环境' : '低波动率环境';
        
        // 套利机会分析（基于历史均值对比）
        const historicalAvg = 35; // 假设的历史平均波动率
        const currentDeviation = avgATM - historicalAvg;
        const arbitrageOpportunity = Math.abs(currentDeviation) > 5 ? 
          (currentDeviation > 0 ? '当前波动率偏高，考虑做空波动率' : '当前波动率偏低，考虑做多波动率') : 
          '波动率接近历史均值，套利机会有限';
        
        // 跨期限套利机会分析
        const termArbitrage = atmList.length > 1 ? {
          shortTerm: atmList[0],
          longTerm: atmList[atmList.length - 1],
          spread: atmList[atmList.length - 1] - atmList[0],
          opportunity: Math.abs(atmList[atmList.length - 1] - atmList[0]) > 3 ? 
            (atmList[atmList.length - 1] > atmList[0] ? 
              '跨期限套利：做多远期，做空近期' : 
              '跨期限套利：做多近期，做空远期') : 
            '跨期限价差较小，套利机会有限'
        } : null;
        
        // 波动率回归套利机会
        const volMeanReversion = Math.abs(currentDeviation) > 8 ? 
          (currentDeviation > 0 ? '波动率显著高于历史均值，回归套利机会' : '波动率显著低于历史均值，反弹套利机会') : 
          '波动率接近历史均值，回归套利机会较小';
        
        // 套利机会综合评估
        const arbitrageScore = (Math.abs(currentDeviation) > 5 ? 2 : 0) + 
                              (termArbitrage && Math.abs(termArbitrage.spread) > 3 ? 2 : 0) + 
                              (Math.abs(currentDeviation) > 8 ? 1 : 0);
        const arbitrageLevel = arbitrageScore >= 4 ? '高套利机会' : arbitrageScore >= 2 ? '中等套利机会' : '低套利机会';
        
        // 动态调整信号
        const slopeChange = Math.abs(slope) > 3 ? '曲线斜率显著，需关注市场预期变化' : '曲线相对平缓，市场预期稳定';
        const adjustmentSignal = Math.abs(slope) > 5 ? '建议调整策略，增加对冲' : Math.abs(slope) > 2 ? '适度调整仓位' : '维持当前策略';
        
        // 推荐合约（基于分析结果）
        const recommendedContract = slope > 0 ? 
          '推荐合约: BTC-20250719-120000-C (看涨期权，利用远期波动率上升)' : 
          slope < 0 ? 
          '推荐合约: BTC-20250719-120000-P (看跌期权，利用远期波动率下降)' : 
          '推荐合约: BTC-20250719-120000-C (中性策略，关注时间价值)';
        
        const summary = [
          {
            type: 'core',
            title: '核心统计指标',
            icon: 'stats',
            items: [
              { title: 'ATM均值', value: avgATM.toFixed(2) + '%', valueColor: 'text-blue-600', subTitle: '标准差', subValue: stdATM.toFixed(2) + '%' },
              { title: '最低ATM', value: minATM.toFixed(2) + '%', valueColor: 'text-green-600', subTitle: '期限', subValue: expiryList[atmList.indexOf(minATM)] || '' },
              { title: '最高ATM', value: maxATM.toFixed(2) + '%', valueColor: 'text-red-500', subTitle: '期限', subValue: expiryList[atmList.indexOf(maxATM)] || '' },
              { title: '期限斜率', value: (slope > 0 ? '+' : '') + slope.toFixed(2) + '%', valueColor: 'text-purple-600', subTitle: '近期ATM', subValue: atmList[0]?.toFixed(2) + '%，远期ATM: ' + atmList[atmList.length - 1]?.toFixed(2) + '%' },
            ]
          },
          {
            type: 'structure',
            title: '期限结构特征',
            icon: 'structure',
            items: [
              { title: '结构类型', value: structure, valueColor: 'text-green-600', subTitle: '波动率环境', subValue: volatilityRegime },
              { title: '斜率解读', value: slope > 0 ? '正向（远期高于近期）' : slope < 0 ? '反向（远期低于近期）' : '平坦', valueColor: 'text-purple-600', subTitle: '市场预期', subValue: slope > 0 ? '预期未来波动率上升' : slope < 0 ? '预期未来波动率下降' : '预期波动率平稳' },
              { title: '时间价值衰减', value: (timeValueDecay > 0 ? '+' : '') + timeValueDecay.toFixed(2) + '%', valueColor: 'text-orange-600', subTitle: '衰减规律', subValue: timeValueDecay > 0 ? '远期时间价值更高' : '近期时间价值更高' },
            ]
          },
          {
            type: 'sentiment',
            title: '市场情绪洞察',
            icon: 'sentiment',
            items: [
              { title: '情绪解读', value: sentiment, valueColor: 'text-yellow-600', subTitle: '风险偏好', subValue: slope > 0 ? '偏好长期风险' : slope < 0 ? '偏好短期风险' : '风险偏好平衡' },
              { title: '套利机会', value: arbitrageLevel, valueColor: arbitrageScore >= 4 ? 'text-red-500' : arbitrageScore >= 2 ? 'text-orange-500' : 'text-cyan-600', subTitle: '偏离历史均值', subValue: (currentDeviation > 0 ? '+' : '') + currentDeviation.toFixed(2) + '%' },
            ]
          },
          {
            type: 'arbitrage',
            title: '套利机会详情',
            icon: 'arbitrage',
            items: [
              { title: '历史均值套利', value: arbitrageOpportunity, valueColor: 'text-cyan-600', subTitle: '当前偏离', subValue: (currentDeviation > 0 ? '+' : '') + currentDeviation.toFixed(2) + '% vs 35%' },
              { title: '跨期限套利', value: termArbitrage ? termArbitrage.opportunity : '数据不足', valueColor: 'text-purple-600', subTitle: '价差', subValue: termArbitrage ? (termArbitrage.spread > 0 ? '+' : '') + termArbitrage.spread.toFixed(2) + '%' : 'N/A' },
              { title: '回归套利', value: volMeanReversion, valueColor: 'text-green-600', subTitle: '回归概率', subValue: Math.abs(currentDeviation) > 8 ? '高' : Math.abs(currentDeviation) > 5 ? '中' : '低' },
            ]
          },
          {
            type: 'risk',
            title: '风险提示',
            icon: 'risk',
            items: [
              { title: '波动率风险', value: risk, valueColor: 'text-red-500', subTitle: '风险等级', subValue: Math.abs(slope) > 5 ? '高风险' : Math.abs(slope) > 2 ? '中风险' : '低风险' },
              { title: '动态调整信号', value: slopeChange, valueColor: 'text-red-500', subTitle: '调整建议', subValue: adjustmentSignal },
            ]
          },
          {
            type: 'advice',
            title: 'AI操作建议',
            icon: 'advice',
            items: [
              { title: '策略建议', value: slope > 0 ? '考虑做多波动率策略' : slope < 0 ? '考虑做空波动率策略' : '保持中性策略', valueColor: 'text-emerald-600', subTitle: '基于期限结构', subValue: slope > 0 ? '远期波动率预期上升' : slope < 0 ? '远期波动率预期下降' : '波动率预期平稳' },
              { title: '仓位管理', value: Math.abs(slope) > 3 ? '增加对冲仓位' : Math.abs(slope) > 1 ? '适度对冲' : '正常仓位', valueColor: 'text-emerald-600', subTitle: '风险控制', subValue: Math.abs(slope) > 3 ? '建议50-70%对冲比例' : Math.abs(slope) > 1 ? '建议30-50%对冲比例' : '建议20-30%对冲比例' },
              { title: '时间窗口', value: '关注1-3个月到期', valueColor: 'text-emerald-600', subTitle: '最佳时机', subValue: '波动率曲线拐点' },
              { title: '推荐合约', value: recommendedContract, valueColor: 'text-emerald-600', subTitle: '推荐理由', subValue: slope > 0 ? '利用远期波动率上升趋势' : slope < 0 ? '利用远期波动率下降趋势' : '关注时间价值机会' },
              { title: '套利策略', value: arbitrageScore >= 4 ? '重点关注套利机会' : arbitrageScore >= 2 ? '适度关注套利' : '套利机会有限', valueColor: arbitrageScore >= 4 ? 'text-red-500' : arbitrageScore >= 2 ? 'text-orange-500' : 'text-emerald-600', subTitle: '套利类型', subValue: arbitrageScore >= 4 ? '均值回归+跨期限套利' : arbitrageScore >= 2 ? '单一套利机会' : '无显著套利' },
            ]
          },
        ];
        setAiSummary(summary);
      }
    } catch (e) {
      setAiSummary({ error: 'AI分析生成失败，请稍后重试。' });
    } finally {
      setIsAILoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card title="期限结构" className={className}>
        <div className="h-80 flex items-center justify-center">加载中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="期限结构" className={className}>
        <div className="h-80 flex items-center justify-center text-red-500">错误: {error}</div>
      </Card>
    );
  }

  // 全屏视图
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">期限结构</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md" onClick={handleAISummary} disabled={isAILoading}>
              {isAILoading ? <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div> : 'AI'}
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setIsFullscreen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 flex">
          <div className="w-40 flex-shrink-0">
            <CustomLegend visible={visible} onClick={handleLegendClick} />
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
                <XAxis dataKey="expiry" tick={{ fontSize: 12, fill: '#6F767E' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={['auto', 'auto']} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                {lines.map(line => visible[line.key] && (
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
        </div>
        {/* AI总结模态框 */}
        {showAISummary && (
          <AISummaryModal
            isLoading={isAILoading}
            summary={aiSummary}
            onClose={() => setShowAISummary(false)}
            title="AI 期限结构分析总结"
            symbol="波动率期限结构"
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
      </div>
    );
  }

  return (
    <Card title="期限结构" className={className}>
      <div className="mb-2 flex items-center justify-end gap-2">
        <button className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md" onClick={handleAISummary} disabled={isAILoading}>
          {isAILoading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div> : 'AI'}
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
        <button className="p-1 text-theme-secondary hover:text-theme-primary" onClick={() => setIsFullscreen(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      <div className="h-80 flex">
        <div className="w-32 flex-shrink-0">
          <CustomLegend visible={visible} onClick={handleLegendClick} />
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
              <XAxis dataKey="expiry" tick={{ fontSize: 12, fill: '#6F767E' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={['auto', 'auto']} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              {lines.map(line => visible[line.key] && (
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
      </div>
      {/* AI总结模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI 期限结构分析总结"
          symbol="波动率期限结构"
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

export default TermStructure; 