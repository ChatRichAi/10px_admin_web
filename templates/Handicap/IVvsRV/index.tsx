import React, { useState } from "react";
import Card from "@/components/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import AISummaryModal from '@/components/AISummaryModal';
import TimerSettingsModal, { TimerSettings } from '@/components/TimerSettings';

// 期限配置
const termConfigs = [
  { key: '7d', name: '7D', color: '#eab308', shortName: '7D' },
  { key: '14d', name: '14D', color: '#22c55e', shortName: '14D' },
  { key: '30d', name: '30D', color: '#0ea5e9', shortName: '30D' },
  { key: '60d', name: '60D', color: '#8b5cf6', shortName: '60D' },
  { key: '90d', name: '90D', color: '#f59e0b', shortName: '90D' },
];

// 动态生成lines配置
const generateLines = (selectedTerms: string[]) => {
  const lines: any[] = [];
  selectedTerms.forEach(term => {
    const config = termConfigs.find(t => t.key === term);
    if (config) {
      lines.push(
        { key: `iv_${term}`, name: `${config.shortName} ATM IV`, color: config.color, dash: false, term: term },
        { key: `rv_${term}`, name: `${config.shortName} RV`, color: config.color, dash: true, term: term }
      );
    }
  });
  return lines;
};

// mock数据（如有API可替换）
// const mockData = [
//   { date: '2025-06-25', iv_7d: 32, rv_7d: 28, iv_14d: 33, rv_14d: 29, iv_30d: 35, rv_30d: 31, iv_60d: 37, rv_60d: 33, iv_90d: 39, rv_90d: 35 },
//   { date: '2025-06-26', iv_7d: 31, rv_7d: 27, iv_14d: 32, rv_14d: 28, iv_30d: 34, rv_30d: 30, iv_60d: 36, rv_60d: 32, iv_90d: 38, rv_90d: 34 },
//   { date: '2025-06-27', iv_7d: 30, rv_7d: 26, iv_14d: 31, rv_14d: 27, iv_30d: 33, rv_30d: 29, iv_60d: 35, rv_60d: 31, iv_90d: 37, rv_90d: 33 },
//   { date: '2025-06-28', iv_7d: 31, rv_7d: 27, iv_14d: 32, rv_14d: 28, iv_30d: 34, rv_30d: 30, iv_60d: 36, rv_60d: 32, iv_90d: 38, rv_90d: 34 },
//   { date: '2025-06-29', iv_7d: 32, rv_7d: 28, iv_14d: 33, rv_14d: 29, iv_30d: 35, rv_30d: 31, iv_60d: 37, rv_60d: 33, iv_90d: 39, rv_90d: 35 },
//   { date: '2025-06-30', iv_7d: 33, rv_7d: 29, iv_14d: 34, rv_14d: 30, iv_30d: 36, rv_30d: 32, iv_60d: 38, rv_60d: 34, iv_90d: 40, rv_90d: 36 },
//   { date: '2025-07-01', iv_7d: 34, rv_7d: 30, iv_14d: 35, rv_14d: 31, iv_30d: 37, rv_30d: 33, iv_60d: 39, rv_60d: 35, iv_90d: 41, rv_90d: 37 },
//   { date: '2025-07-02', iv_7d: 35, rv_7d: 31, iv_14d: 36, rv_14d: 32, iv_30d: 38, rv_30d: 34, iv_60d: 40, rv_60d: 36, iv_90d: 42, rv_90d: 38 },
//   { date: '2025-07-03', iv_7d: 36, rv_7d: 32, iv_14d: 37, rv_14d: 33, iv_30d: 39, rv_30d: 35, iv_60d: 41, rv_60d: 37, iv_90d: 43, rv_90d: 39 },
// ];

// 使用新的时间序列API接口
const useIVRVData = () => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://103.106.191.243:8001/deribit/option/iv_rv_timeseries?symbol=BTC&days=30&windows=7&windows=14&windows=30&windows=60&windows=90')
      .then(res => {
        if (!res.ok) throw new Error('网络错误');
        return res.json();
      })
      .then(json => {
        // 直接使用API返回的时间序列数据
        setData(json.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

// 期限选择器组件
const TermSelector = ({ selectedTerms, onTermChange }: { selectedTerms: string[], onTermChange: (terms: string[]) => void }) => {
  const handleTermToggle = (term: string) => {
    if (selectedTerms.includes(term)) {
      onTermChange(selectedTerms.filter(t => t !== term));
    } else {
      onTermChange([...selectedTerms, term]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {termConfigs.map(term => (
        <button
          key={term.key}
          onClick={() => handleTermToggle(term.key)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
            selectedTerms.includes(term.key)
              ? 'bg-blue-500 text-white border-blue-500 shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
          style={{
            borderColor: selectedTerms.includes(term.key) ? term.color : undefined,
            backgroundColor: selectedTerms.includes(term.key) ? term.color : undefined,
          }}
        >
          {term.name}
        </button>
      ))}
    </div>
  );
};

function CustomLegend({ visible, onClick, lines }: { visible: Record<string, boolean>, onClick: (key: string) => void, lines: any[] }) {
  return (
    <div className="flex flex-row flex-wrap gap-2 mt-2 text-xs font-normal leading-tight">
      {lines.map(line => (
        <label key={line.key} className="flex items-center cursor-pointer select-none gap-1">
          <input
            type="checkbox"
            checked={visible[line.key]}
            onChange={() => onClick(line.key)}
            className="accent-blue-500"
          />
          <span
            className="inline-block"
            style={{
              width: 18,
              height: 2,
              background: visible[line.key] ? line.color : '#d1d5db',
              borderRadius: 2,
              transition: 'background 0.2s',
              marginRight: 4,
              borderBottom: line.dash ? '1px dashed ' + (visible[line.key] ? line.color : '#d1d5db') : undefined,
            }}
          />
          <span
            className={visible[line.key] ? '' : 'text-gray-400'}
            style={{ color: visible[line.key] ? line.color : '#d1d5db', fontWeight: 400 }}
          >
            {line.name}
          </span>
        </label>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">日期: {label}</p>
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

// 本地降级分析函数
const generateLocalAnalysis = (data: any[], selectedTerms: string[]) => {
  const validData = data.filter((item: any) =>
    selectedTerms.every(term => item[`iv_${term}`] !== null && item[`rv_${term}`] !== null)
  );

  if (validData.length === 0) {
    return [{ type: 'error', title: '暂无有效数据可供分析。', items: [] }];
  }

  // 计算各期限的IV-RV差值
  const termAnalysis = selectedTerms.map(term => {
    const ivKey = `iv_${term}`;
    const rvKey = `rv_${term}`;
    
    const ivValues = validData.map((item: any) => item[ivKey]).filter((v: number) => v !== null && v !== undefined);
    const rvValues = validData.map((item: any) => item[rvKey]).filter((v: number) => v !== null && v !== undefined);
    
    const avgIV = ivValues.length > 0 ? ivValues.reduce((sum: number, v: number) => sum + v, 0) / ivValues.length : 0;
    const avgRV = rvValues.length > 0 ? rvValues.reduce((sum: number, v: number) => sum + v, 0) / rvValues.length : 0;
    
    return {
      term: term.toUpperCase(),
      iv: avgIV,
      rv: avgRV,
      premium: avgIV - avgRV,
      type: 'IV_RV_PAIR'
    };
  });

  const allIV = termAnalysis.map((t: any) => t.iv);
  const allRV = termAnalysis.map((t: any) => t.rv);
  const avgIV = allIV.length > 0 ? allIV.reduce((sum: number, v: number) => sum + v, 0) / allIV.length : 0;
  const avgRV = allRV.length > 0 ? allRV.reduce((sum: number, v: number) => sum + v, 0) / allRV.length : 0;
  const avgPremium = avgIV - avgRV;

  // 分析IV-RV差值趋势
  const recentData = validData.slice(-7); // 最近7天
  const premiumTrend = selectedTerms.map(term => {
    const ivKey = `iv_${term}`;
    const rvKey = `rv_${term}`;
    const premiums = recentData.map((item: any) => item[ivKey] - item[rvKey]);
    const avgPremium = premiums.reduce((sum: number, v: number) => sum + v, 0) / premiums.length;
    return { term, avgPremium };
  });

  const maxPremium = Math.max(...premiumTrend.map(p => p.avgPremium));
  const minPremium = Math.min(...premiumTrend.map(p => p.avgPremium));
  const maxPremiumTerm = premiumTrend.find(p => p.avgPremium === maxPremium)?.term;
  const minPremiumTerm = premiumTrend.find(p => p.avgPremium === minPremium)?.term;

  return [
    {
      type: "core",
      title: "核心统计指标",
      icon: "stats",
      items: [
        {
          title: "平均IV溢价",
          value: `${avgPremium.toFixed(2)}%`,
          valueColor: avgPremium > 0 ? "text-red-500" : "text-green-600",
          subTitle: "IV-RV差值",
          subValue: avgPremium > 0 ? "IV高估" : "IV低估"
        },
        {
          title: "最高溢价期限",
          value: `${maxPremium.toFixed(2)}%`,
          valueColor: "text-red-500",
          subTitle: "期限",
          subValue: maxPremiumTerm || ""
        },
        {
          title: "最低溢价期限",
          value: `${minPremium.toFixed(2)}%`,
          valueColor: "text-green-600",
          subTitle: "期限",
          subValue: minPremiumTerm || ""
        }
      ]
    },
    {
      type: "structure",
      title: "期限结构特征",
      icon: "structure",
      items: [
        {
          title: "IV-RV结构",
          value: avgPremium > 2 ? "IV显著高估" : avgPremium < -2 ? "IV显著低估" : "相对平衡",
          valueColor: avgPremium > 2 ? "text-red-500" : avgPremium < -2 ? "text-green-600" : "text-blue-600",
          subTitle: "市场预期",
          subValue: avgPremium > 0 ? "市场过度恐慌" : "市场相对乐观"
        },
        {
          title: "期限差异",
          value: `${(maxPremium - minPremium).toFixed(2)}%`,
          valueColor: "text-purple-500",
          subTitle: "最大差值",
          subValue: `${maxPremiumTerm} vs ${minPremiumTerm}`
        }
      ]
    },
    {
      type: "sentiment",
      title: "市场情绪洞察",
      icon: "sentiment",
      items: [
        {
          title: "情绪状态",
          value: avgPremium > 3 ? "恐慌情绪" : avgPremium > 1 ? "谨慎情绪" : "相对平静",
          valueColor: avgPremium > 3 ? "text-red-500" : avgPremium > 1 ? "text-yellow-600" : "text-green-600",
          subTitle: "基于IV溢价",
          subValue: ""
        },
        {
          title: "流动性预期",
          value: avgPremium > 2 ? "预期流动性紧张" : "流动性预期稳定",
          valueColor: avgPremium > 2 ? "text-red-500" : "text-green-600",
          subTitle: "市场判断",
          subValue: ""
        }
      ]
    },
    {
      type: "arbitrage",
      title: "套利机会分析",
      icon: "arbitrage",
      items: [
        {
          title: "套利方向",
          value: avgPremium > 2 ? "适合卖出期权" : avgPremium < -2 ? "适合买入期权" : "无明显套利",
          valueColor: avgPremium > 2 ? "text-red-500" : avgPremium < -2 ? "text-green-600" : "text-gray-500",
          subTitle: "基于IV-RV差值",
          subValue: ""
        },
        {
          title: "最佳套利期限",
          value: avgPremium > 2 ? maxPremiumTerm || "" : avgPremium < -2 ? minPremiumTerm || "" : "暂无",
          valueColor: avgPremium > 2 ? "text-red-500" : avgPremium < -2 ? "text-green-600" : "text-gray-500",
          subTitle: "推荐期限",
          subValue: ""
        }
      ]
    },
    {
      type: "risk",
      title: "风险预警",
      icon: "risk",
      items: [
        {
          title: "背离风险",
          value: Math.abs(avgPremium) > 3 ? "IV-RV持续背离，需警惕黑天鹅" : "背离程度可控",
          valueColor: Math.abs(avgPremium) > 3 ? "text-red-500" : "text-green-600",
          subTitle: "风险等级",
          subValue: Math.abs(avgPremium) > 3 ? "高风险" : "低风险"
        },
        {
          title: "调整建议",
          value: Math.abs(avgPremium) > 3 ? "建议动态调整对冲策略" : "维持当前策略",
          valueColor: Math.abs(avgPremium) > 3 ? "text-red-500" : "text-green-600",
          subTitle: "策略指导",
          subValue: ""
        }
      ]
    },
    {
      type: "advice",
      title: "AI操作建议",
      icon: "advice",
      items: [
        {
          title: "策略建议",
          value: avgPremium > 2 ? "考虑卖出期权策略" : avgPremium < -2 ? "考虑买入期权策略" : "中性策略",
          valueColor: avgPremium > 2 ? "text-red-500" : avgPremium < -2 ? "text-green-600" : "text-blue-600",
          subTitle: "基于IV-RV分析",
          subValue: ""
        },
        {
          title: "仓位管理",
          value: Math.abs(avgPremium) > 3 ? "建议降低仓位" : "可适度增加仓位",
          valueColor: Math.abs(avgPremium) > 3 ? "text-red-500" : "text-green-600",
          subTitle: "风险控制",
          subValue: ""
        },
        {
          title: "时间窗口",
          value: "关注短期IV-RV收敛",
          valueColor: "text-blue-600",
          subTitle: "最佳时机",
          subValue: "1-2周内"
        }
      ]
    }
  ];
};

const IVvsRV = ({ className }: { className?: string }) => {
  const { data, loading, error } = useIVRVData();
  const [selectedTerms, setSelectedTerms] = useState<string[]>(['7d', '14d', '30d']); // 默认选中7D, 14D, 30D
  const [visible, setVisible] = useState(() => Object.fromEntries(generateLines(['7d', '14d', '30d']).map(l => [l.key, true])));

  // 当选择的期限变化时，更新visible状态
  React.useEffect(() => {
    const newLines = generateLines(selectedTerms);
    const newVisible = Object.fromEntries(newLines.map(l => [l.key, true]));
    setVisible(newVisible);
  }, [selectedTerms]);
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
      // 预处理分析数据
      const validData = data.filter((item: any) =>
        selectedTerms.every(term => item[`iv_${term}`] !== null && item[`rv_${term}`] !== null)
      );
      if (validData.length === 0) {
        setAiSummary([{ type: 'error', title: '暂无有效数据可供分析。', items: [] }]);
        return;
      }
      // 组装分析数据
      const analysisData = {
        symbol: 'BTC',
        terms: selectedTerms,
        data: validData.slice(-30), // 只取近30天
      };
      
      // 构建强化的prompt，强制包含五大关键特征
      const enhancedPrompt = `请分析BTC IV vs RV数据，提供结构化的期权市场分析。\n\n数据信息：\n- 标的：${analysisData.symbol}\n- 期限：${analysisData.terms.join(', ')}\n- 数据点：${analysisData.data.length}个\n\n分析要求（必须包含以下五大关键特征）：\n\n1. 预期偏差分析：\n   - 分析IV是否高估或低估实际波动率（RV）\n   - 如IV持续高于RV可能反映市场过度恐慌\n   - 计算各期限的IV-RV差值及其趋势\n\n2. 期限结构分析：\n   - 对比不同期限的IV和RV曲线形态\n   - 短期陡升可能提示事件风险\n   - 长期平稳则体现均值回归特征\n\n3. 交易信号分析：\n   - 识别IV-RV差值极端情况\n   - 如IV显著高于RV时，可能适合卖出期权套利\n   - 提供具体的交易时机建议\n\n4. 情绪与流动性分析：\n   - 分析日内IV和RV的联动模式\n   - 如开盘冲高能反映散户情绪或做市商行为\n   - 评估市场流动性预期\n\n5. 风险预警分析：\n   - 识别持续背离可能预示的黑天鹅风险\n   - 提供动态调整对冲策略的建议\n   - 评估当前风险等级\n\n请严格按照以下JSON格式返回分析结果，确保所有字段都存在且格式正确，必须包含套利机会分析模块：\n\n{\n  "summary": [\n    {\n      "type": "core",\n      "title": "核心统计指标",\n      "icon": "stats",\n      "items": [\n        {\n          "title": "平均IV溢价",\n          "value": "数值%",\n          "valueColor": "颜色类名",\n          "subTitle": "说明",\n          "subValue": "补充信息"\n        }\n      ]\n    },\n    {\n      "type": "structure",\n      "title": "期限结构特征",\n      "icon": "structure",\n      "items": [\n        {\n          "title": "IV-RV结构",\n          "value": "分析结果",\n          "valueColor": "颜色类名",\n          "subTitle": "市场预期",\n          "subValue": "详细说明"\n        }\n      ]\n    },\n    {\n      "type": "sentiment",\n      "title": "市场情绪洞察",\n      "icon": "sentiment",\n      "items": [\n        {\n          "title": "情绪状态",\n          "value": "情绪分析",\n          "valueColor": "颜色类名",\n          "subTitle": "基于IV溢价",\n          "subValue": "详细说明"\n        }\n      ]\n    },\n    {\n      "type": "arbitrage",\n      "title": "套利机会分析",\n      "icon": "arbitrage",\n      "items": [\n        {\n          "title": "套利方向",\n          "value": "套利建议",\n          "valueColor": "颜色类名",\n          "subTitle": "基于IV-RV差值",\n          "subValue": "详细说明"\n        }\n      ]\n    },\n    {\n      "type": "risk",\n      "title": "风险预警",\n      "icon": "risk",\n      "items": [\n        {\n          "title": "背离风险",\n          "value": "风险分析",\n          "valueColor": "颜色类名",\n          "subTitle": "风险等级",\n          "subValue": "风险等级"\n        }\n      ]\n    },\n    {\n      "type": "advice",\n      "title": "AI操作建议",\n      "icon": "advice",\n      "items": [\n        {\n          "title": "策略建议",\n          "value": "具体建议",\n          "valueColor": "颜色类名",\n          "subTitle": "基于分析",\n          "subValue": "详细说明"\n        }\n      ]\n    }\n  ]\n}\n\n重要提示：\n1. 必须严格按照上述JSON格式返回，不要添加任何额外的文本或说明\n2. 确保每个item都有title、value、valueColor、subTitle、subValue这5个字段\n3. 如果某个字段没有值，请使用空字符串""而不是null或undefined\n4. 数值要包含适当的单位（如%）\n5. 不要使用中文引号，请使用英文引号\n6. 必须包含套利机会分析模块，这是强制要求`;

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'iv_vs_rv',
          prompt: enhancedPrompt
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || errorData.error || 'AI分析请求失败';
        console.error('[IVvsRV] OpenAI API错误:', errorData);
        
        // 如果是认证错误，使用本地分析作为fallback
        if (response.status === 401) {
          console.log('[IVvsRV] API认证失败，使用本地分析');
          try {
            const localAnalysis = generateLocalAnalysis(data, selectedTerms);
            setAiSummary(localAnalysis);
            return;
          } catch (localError) {
            console.error('[IVvsRV] 本地分析也失败:', localError);
          }
        }
        
        setAiSummary([{ type: 'error', title: errorMessage, items: [] }]);
        return;
      }
      
      const result = await response.json();
      if (result.summary && Array.isArray(result.summary) && result.summary.length > 0) {
        // 确保包含套利机会模块
        const hasArbitrage = result.summary.some((item: any) => item.type === 'arbitrage');
        if (!hasArbitrage) {
          setAiSummary([{ type: 'error', title: 'AI返回内容缺少套利机会模块', items: [] }]);
          return;
        }
        setAiSummary(result.summary);
      } else {
        setAiSummary([{ type: 'error', title: 'AI返回内容为空或格式错误', items: [] }]);
      }
    } catch (error: any) {
      console.error('[IVvsRV] AI分析错误:', error);
      // 使用本地分析作为fallback
      try {
        const localAnalysis = generateLocalAnalysis(data, selectedTerms);
        setAiSummary(localAnalysis);
      } catch (localError) {
        setAiSummary([{ type: 'error', title: 'AI分析失败，本地分析也失败', items: [] }]);
      }
    } finally {
      setIsAILoading(false);
    }
  };

  // 定时推送保存
  const handleSaveTimerSettings = async (settings: TimerSettings) => {
    setTimerSettings(settings);
    // 这里可加API保存逻辑
  };

  if (loading) {
    return (
      <Card title="IV vs RV" className={className}>
        <div className="h-80 flex items-center justify-center">加载中...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="IV vs RV" className={className}>
        <div className="h-80 flex items-center justify-center text-red-500">错误: {error}</div>
      </Card>
    );
  }

  // 计算统计指标
  const validData = data.filter((item: any) => 
    selectedTerms.every(term => item[`iv_${term}`] !== null && item[`rv_${term}`] !== null)
  );

  const termAnalysis = selectedTerms.map(term => {
    const ivKey = `iv_${term}`;
    const rvKey = `rv_${term}`;
    
    const ivValues = validData.map((item: any) => item[ivKey]).filter((v: number) => v !== null && v !== undefined);
    const rvValues = validData.map((item: any) => item[rvKey]).filter((v: number) => v !== null && v !== undefined);
    
    const avgIV = ivValues.length > 0 ? ivValues.reduce((sum: number, v: number) => sum + v, 0) / ivValues.length : 0;
    const avgRV = rvValues.length > 0 ? rvValues.reduce((sum: number, v: number) => sum + v, 0) / rvValues.length : 0;
    
    return {
      term: term.toUpperCase(),
      iv: avgIV,
      rv: avgRV,
      premium: avgIV - avgRV,
      type: 'IV_RV_PAIR'
    };
  });

  const allIV = termAnalysis.map((t: any) => t.iv);
  const allRV = termAnalysis.map((t: any) => t.rv);
  const avgIV = allIV.length > 0 ? allIV.reduce((sum: number, v: number) => sum + v, 0) / allIV.length : 0;
  const avgRV = allRV.length > 0 ? allRV.reduce((sum: number, v: number) => sum + v, 0) / allRV.length : 0;
  const avgPremium = avgIV - avgRV;

  const chartContent = (
    <>
      <TermSelector selectedTerms={selectedTerms} onTermChange={setSelectedTerms} />
      <div className="mb-2 flex flex-wrap gap-2">
        <CustomLegend visible={visible} onClick={handleLegendClick} lines={generateLines(selectedTerms)} />
      </div>
      <div className={isFullscreen ? "h-[calc(100vh-200px)]" : "h-80"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6F767E' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={['auto', 'auto']} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            {generateLines(selectedTerms).map(line => visible[line.key] && (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                strokeDasharray={line.dash ? '6 3' : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">IV vs RV - 全屏视图</h2>
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
            title="AI IV vs RV 分析总结"
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
    <Card title="IV vs RV" className={className}>
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
          title="AI IV vs RV 分析总结"
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

export default IVvsRV; 