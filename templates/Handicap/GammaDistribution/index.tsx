import React, { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import TimerSettingsModal from '@/components/TimerSettings';
import AISummaryModal from '@/components/AISummaryModal';
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

  // AI总结逻辑
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    try {
      if (!data || data.length === 0) {
        setAiSummary({ error: '暂无数据可供分析。' });
        return;
      }
      // 分析数据
      const maxCallGamma = Math.max(...data.map(d => d.callGamma));
      const maxPutGamma = Math.min(...data.map(d => d.putGamma));
      const callWallStrike = meta.callWall;
      const putWallStrike = meta.putWall;
      const currentPrice = meta.stockPrice;
      const zeroGammaStrike = meta.zeroGamma;
      
      // 计算更多分析指标
      const totalCallGamma = data.reduce((sum, d) => sum + d.callGamma, 0);
      const totalPutGamma = data.reduce((sum, d) => sum + Math.abs(d.putGamma), 0);
      const gammaRatio = totalCallGamma / totalPutGamma;
      const gammaSkew = gammaRatio > 1.2 ? '看涨偏斜' : gammaRatio < 0.8 ? '看跌偏斜' : '中性';
      
      // 组装分析数据
      const analysisData = {
        currentPrice,
        maxCallGamma,
        maxPutGamma,
        callWallStrike,
        putWallStrike,
        zeroGammaStrike,
        totalCallGamma,
        totalPutGamma,
        gammaRatio,
        gammaSkew,
        data: data.slice(0, 10) // 取前10个数据点
      };
      
      // 调用OpenAI API
      try {
        const forceLocalAnalysis = false; // 允许OpenAI分析
        if (forceLocalAnalysis) {
          throw new Error('强制使用本地分析');
        }
        const response = await fetch('/api/openai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: analysisData,
            analysisType: 'gamma_distribution',
            prompt: `请分析BTC Gamma分布数据，生成结构化的期权市场分析报告。请严格按照以下要求返回结构化JSON，所有模块都必须出现，不可省略：\n\n1. 核心统计指标\n2. Gamma分布特征\n3. 市场情绪洞察（必须包含"Gamma偏斜"字段，内容为对当前市场Gamma偏斜的简要评估）\n4. 支撑阻力分析（必须为单独模块，内容包括：Call Wall分析、Put Wall分析、Zero Gamma分析，每项都要有title、value、subTitle、subValue）\n5. 风险提示\n6. AI操作建议（必须包含"Gamma策略"字段，内容为针对当前市场的Gamma操作建议）\n\nJSON结构示例：\n{\n  "summary": [\n    { "type": "core", "title": "核心统计指标", "icon": "stats", "items": [ ... ] },\n    { "type": "structure", "title": "Gamma分布特征", "icon": "structure", "items": [ ... ] },\n    { "type": "sentiment", "title": "市场情绪洞察", "icon": "sentiment", "items": [ { "title": "Gamma偏斜", "value": "...", "subTitle": "...", "subValue": "..." } ] },\n    { "type": "support", "title": "支撑阻力分析", "icon": "support", "items": [ { "title": "Call Wall分析", "value": "...", "subTitle": "...", "subValue": "..." }, { "title": "Put Wall分析", "value": "...", "subTitle": "...", "subValue": "..." }, { "title": "Zero Gamma分析", "value": "...", "subTitle": "...", "subValue": "..." } ] },\n    { "type": "risk", "title": "风险提示", "icon": "risk", "items": [ ... ] },\n    { "type": "advice", "title": "AI操作建议", "icon": "advice", "items": [ { "title": "Gamma策略", "value": "...", "subTitle": "...", "subValue": "..." } ] }\n  ]\n}\n\n注意：所有模块都必须出现，哪怕内容为空也要有结构。"支撑阻力分析"必须为单独模块且有三项，"AI操作建议"必须有"Gamma策略"。不要输出任何多余的解释或说明，只返回JSON。`
          })
        });
        if (!response.ok) throw new Error('OpenAI分析请求失败');
        const result = await response.json();
        if (result.summary && Array.isArray(result.summary) && result.summary.length > 0) {
          // 检查是否包含支撑阻力分析模块，如果没有则使用本地分析
          const hasSupport = result.summary.some((block: any) => 
            block.type === 'support' || 
            (block.items && block.items.some((item: any) => item.title && item.title.includes('Wall')))
          );
          
          if (!hasSupport) {
            console.log('OpenAI返回数据中缺少支撑阻力分析模块，使用本地分析');
            throw new Error('OpenAI返回数据不完整，使用本地分析');
          }
          
          setAiSummary(result.summary);
          return;
        } else {
          throw new Error('AI返回内容为空或格式错误');
        }
      } catch (err) {
        // fallback: 本地降级分析
        const summary = [
          {
            type: 'core',
            title: '核心统计指标',
            icon: 'stats',
            items: [
              { title: '当前股价', value: `$${currentPrice}`, valueColor: 'text-yellow-600', subTitle: '实时价格', subValue: 'USD' },
              { title: '最大Call Gamma', value: `${(maxCallGamma / 1000000).toFixed(1)}M`, valueColor: 'text-green-600', subTitle: '行权价', subValue: `$${data.find(d => d.callGamma === maxCallGamma)?.strike}` },
              { title: '最大Put Gamma', value: `${(Math.abs(maxPutGamma) / 1000000).toFixed(1)}M`, valueColor: 'text-blue-600', subTitle: '行权价', subValue: `$${data.find(d => d.putGamma === maxPutGamma)?.strike}` },
              { title: 'Gamma比率', value: gammaRatio.toFixed(2), valueColor: 'text-purple-600', subTitle: 'Call/Put', subValue: gammaRatio > 1 ? 'Call主导' : 'Put主导' },
            ]
          },
          {
            type: 'structure',
            title: 'Gamma分布特征',
            icon: 'structure',
            items: [
              { title: '分布偏斜', value: gammaSkew, valueColor: 'text-green-600', subTitle: '市场倾向', subValue: gammaRatio > 1.2 ? '看涨情绪' : gammaRatio < 0.8 ? '看跌情绪' : '中性情绪' },
              { title: '总Call Gamma', value: `${(totalCallGamma / 1000000).toFixed(1)}M`, valueColor: 'text-green-600', subTitle: '看涨压力', subValue: totalCallGamma > totalPutGamma ? '较强' : '较弱' },
              { title: '总Put Gamma', value: `${(totalPutGamma / 1000000).toFixed(1)}M`, valueColor: 'text-blue-600', subTitle: '看跌压力', subValue: totalPutGamma > totalCallGamma ? '较强' : '较弱' },
            ]
          },
          {
            type: 'sentiment',
            title: '市场情绪洞察',
            icon: 'sentiment',
            items: [
              { title: '市场倾向', value: currentPrice > callWallStrike ? '看涨' : '看跌', valueColor: 'text-yellow-600', subTitle: '价格位置', subValue: currentPrice > callWallStrike ? '突破阻力' : '接近支撑' },
              { title: 'Gamma偏斜', value: gammaSkew, valueColor: gammaRatio > 1.2 ? 'text-green-600' : gammaRatio < 0.8 ? 'text-blue-600' : 'text-gray-600', subTitle: '偏斜程度', subValue: Math.abs(gammaRatio - 1).toFixed(2) },
            ]
          },
          {
            type: 'support',
            title: '支撑阻力分析',
            icon: 'support',
            items: [
              { title: 'Call Wall分析', value: `$${callWallStrike}`, valueColor: 'text-green-600', subTitle: '阻力位', subValue: currentPrice > callWallStrike ? '已突破' : '未突破' },
              { title: 'Put Wall分析', value: `$${putWallStrike}`, valueColor: 'text-blue-600', subTitle: '支撑位', subValue: currentPrice < putWallStrike ? '已跌破' : '未跌破' },
              { title: 'Zero Gamma分析', value: zeroGammaStrike !== null ? `$${zeroGammaStrike}` : '暂无', valueColor: 'text-gray-600', subTitle: '中性点', subValue: zeroGammaStrike !== null ? 'Gamma平衡点' : '数据不足' },
            ]
          },
          {
            type: 'risk',
            title: '风险提示',
            icon: 'risk',
            items: [
              { title: 'Gamma风险', value: '高Gamma区域波动加剧', valueColor: 'text-red-500', subTitle: '风险等级', subValue: Math.max(maxCallGamma, Math.abs(maxPutGamma)) > 1000000 ? '高风险' : '中风险' },
              { title: '价格风险', value: '接近关键价位', valueColor: 'text-red-500', subTitle: '关注价位', subValue: `$${callWallStrike} / $${putWallStrike}` },
            ]
          },
          {
            type: 'advice',
            title: 'AI操作建议',
            icon: 'advice',
            items: [
              { title: '策略建议', value: gammaRatio > 1.2 ? '考虑做多策略' : gammaRatio < 0.8 ? '考虑做空策略' : '保持中性策略', valueColor: 'text-emerald-600', subTitle: '基于Gamma', subValue: gammaRatio > 1.2 ? 'Call Gamma主导' : gammaRatio < 0.8 ? 'Put Gamma主导' : 'Gamma平衡' },
              { title: '仓位管理', value: '关注关键价位', valueColor: 'text-emerald-600', subTitle: '风险控制', subValue: '设置止损止盈' },
              { title: '时间窗口', value: '短期交易', valueColor: 'text-emerald-600', subTitle: '最佳时机', subValue: 'Gamma变化拐点' },
              { title: 'Gamma策略', value: gammaRatio > 1.2 ? '做多Gamma策略' : gammaRatio < 0.8 ? '做空Gamma策略' : '中性Gamma策略', valueColor: gammaRatio > 1.2 ? 'text-green-600' : gammaRatio < 0.8 ? 'text-blue-600' : 'text-gray-600', subTitle: '策略类型', subValue: gammaRatio > 1.2 ? '利用Call Gamma优势' : gammaRatio < 0.8 ? '利用Put Gamma优势' : '平衡Gamma风险' },
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
              className={`p-2 text-theme-secondary hover:text-theme-primary transition-colors ${timerSettings.enabled ? 'text-green-500' : ''}`}
              onClick={() => setShowTimerModal(true)}
              title={timerSettings.enabled ? '定时器已启用' : '设置定时AI分析'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI Gamma分布分析总结"
          symbol="BTC Gamma分布"
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

export default GammaDistribution; 