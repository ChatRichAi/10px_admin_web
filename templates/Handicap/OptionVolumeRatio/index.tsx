import React, { useState, useRef, useEffect } from "react";
import Card from "@/components/Card";
import AISummaryModal from "@/components/AISummaryModal";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const categories = [
  { key: 'call_blocked', name: 'Call Blocked', color: '#34d399' },
  { key: 'call_buys', name: 'Call Buys', color: '#6ee7b7' },
  { key: 'call_sells', name: 'Call Sells', color: '#a7f3d0' },
  { key: 'put_blocked', name: 'Put Blocked', color: '#f87171' },
  { key: 'put_buys', name: 'Put Buys', color: '#fca5a5' },
  { key: 'put_sells', name: 'Put Sells', color: '#fecaca' },
];

const data = [
  { key: 'call_blocked', value: 9882.7, percent: 45.65, label: '₿9,882.7 ($1060.4M)' },
  { key: 'call_buys', value: 0, percent: 0, label: '' },
  { key: 'call_sells', value: 3489.0, percent: 16.12, label: '₿3,489.0 ($374.4M)' },
  { key: 'put_blocked', value: 0, percent: 0, label: '' },
  { key: 'put_buys', value: 2121.7, percent: 9.8, label: '₿2,121.7 ($227.7M)' },
  { key: 'put_sells', value: 0, percent: 0, label: '' },
];

const coins = [
  { label: 'BTC', value: 'btc' },
  { label: 'ETH', value: 'eth' },
];
const timeRanges = [
  { label: 'Past 24h', value: '24h' },
  { label: 'Past 7d', value: '7d' },
];

const OptionVolumeRatio = ({ className }: { className?: string }) => {
  const [coin, setCoin] = useState('btc');
  const [timeRange, setTimeRange] = useState('24h');
  
  // AI分析状态
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showAISummary, setShowAISummary] = useState(false);

  // refs for card and pie
  const containerRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const putRef = useRef<HTMLDivElement>(null);
  const sellRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [svgDims, setSvgDims] = useState({ width: 0, height: 0 });
  const [lines, setLines] = useState<Array<{ x1: number, y1: number, x2: number, y2: number, color: string }>>([]);

  useEffect(() => {
    function calculateLines() {
      if (!containerRef.current || !pieRef.current || !putRef.current || !sellRef.current || !blockRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const pieRect = pieRef.current.getBoundingClientRect();
      const putRect = putRef.current.getBoundingClientRect();
      const sellRect = sellRef.current.getBoundingClientRect();
      const blockRect = blockRef.current.getBoundingClientRect();
      
      setSvgDims({ width: containerRect.width, height: containerRect.height });
      
      // 饼图中心点（相对于容器）
      const pieCenterX = pieRect.left + pieRect.width / 2 - containerRect.left;
      const pieCenterY = pieRect.top + pieRect.height / 2 - containerRect.top;
      const pieRadius = 75; // 外半径
      
      // 计算各个扇形的角度位置（基于数据占比）
      // 从90度开始，逆时针
      let currentAngle = 90; // 起始角度
      const angleStep = 360 / 100; // 每1%对应的角度
      
      // Call Blocked: 45.65% (从90度开始)
      const callBlockedAngle = currentAngle + (45.65 / 2) * angleStep; // 中心角度
      currentAngle += 45.65 * angleStep;
      
      // Call Buys: 0% (跳过)
      
      // Call Sells: 16.12%
      const callSellsAngle = currentAngle + (16.12 / 2) * angleStep;
      currentAngle += 16.12 * angleStep;
      
      // Put Blocked: 0% (跳过)
      
      // Put Buys: 9.8%
      const putBuysAngle = currentAngle + (9.8 / 2) * angleStep;
      
      // 转换角度为弧度并计算连接点
      const toRadians = (deg: number) => (deg * Math.PI) / 180;
      
      const callBlockedRad = toRadians(callBlockedAngle);
      const callSellsRad = toRadians(callSellsAngle);
      const putBuysRad = toRadians(putBuysAngle);
      
      // 饼图边缘的连接点
      const callBlockedPieX = pieCenterX + Math.cos(callBlockedRad) * pieRadius;
      const callBlockedPieY = pieCenterY - Math.sin(callBlockedRad) * pieRadius;
      
      const callSellsPieX = pieCenterX + Math.cos(callSellsRad) * pieRadius;
      const callSellsPieY = pieCenterY - Math.sin(callSellsRad) * pieRadius;
      
      const putBuysPieX = pieCenterX + Math.cos(putBuysRad) * pieRadius;
      const putBuysPieY = pieCenterY - Math.sin(putBuysRad) * pieRadius;
      
      // 卡片连接点
      const putCardX = putRect.right - containerRect.left;
      const putCardY = putRect.top + putRect.height / 2 - containerRect.top;
      
      const sellCardX = sellRect.right - containerRect.left;
      const sellCardY = sellRect.top + sellRect.height / 2 - containerRect.top;
      
      const blockCardX = blockRect.left - containerRect.left;
      const blockCardY = blockRect.top + blockRect.height / 2 - containerRect.top;
      
      setLines([
        {
          x1: putCardX,
          y1: putCardY,
          x2: putBuysPieX,
          y2: putBuysPieY,
          color: '#fca5a5'
        },
        {
          x1: sellCardX,
          y1: sellCardY,
          x2: callSellsPieX,
          y2: callSellsPieY,
          color: '#a7f3d0'
        },
        {
          x1: blockCardX,
          y1: blockCardY,
          x2: callBlockedPieX,
          y2: callBlockedPieY,
          color: '#34d399'
        }
      ]);
    }
    
    calculateLines();
    window.addEventListener('resize', calculateLines);
    const timer = setTimeout(calculateLines, 100); // 延迟计算确保DOM渲染完成
    
    return () => {
      window.removeEventListener('resize', calculateLines);
      clearTimeout(timer);
    };
  }, []);

  // AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    
    try {
      // 分析数据
      const totalVolume = data.reduce((sum, item) => sum + item.value, 0);
      const callBlocked = data.find(d => d.key === 'call_blocked')?.value || 0;
      const callBuys = data.find(d => d.key === 'call_buys')?.value || 0;
      const callSells = data.find(d => d.key === 'call_sells')?.value || 0;
      const putBlocked = data.find(d => d.key === 'put_blocked')?.value || 0;
      const putBuys = data.find(d => d.key === 'put_buys')?.value || 0;
      const putSells = data.find(d => d.key === 'put_sells')?.value || 0;
      
      // 计算比例
      const callBlockedPercent = (callBlocked / totalVolume) * 100;
      const callBuysPercent = (callBuys / totalVolume) * 100;
      const callSellsPercent = (callSells / totalVolume) * 100;
      const putBlockedPercent = (putBlocked / totalVolume) * 100;
      const putBuysPercent = (putBuys / totalVolume) * 100;
      const putSellsPercent = (putSells / totalVolume) * 100;
      
      // 分析市场情绪
      const totalCallActivity = callBlocked + callBuys + callSells;
      const totalPutActivity = putBlocked + putBuys + putSells;
      const callPutRatio = totalCallActivity / totalPutActivity;
      
      // 分析交易行为
      const totalBuys = callBuys + putBuys;
      const totalSells = callSells + putSells;
      const totalBlocked = callBlocked + putBlocked;
      const buySellRatio = totalBuys / totalSells;
      
      // 构建AI分析请求数据
      const analysisData = {
        symbol: coin.toUpperCase(),
        timeRange: timeRange === '24h' ? '24小时' : '7天',
        totalVolume: totalVolume,
        callBlocked: callBlocked,
        callBuys: callBuys,
        callSells: callSells,
        putBlocked: putBlocked,
        putBuys: putBuys,
        putSells: putSells,
        callBlockedPercent: callBlockedPercent,
        callBuysPercent: callBuysPercent,
        callSellsPercent: callSellsPercent,
        putBlockedPercent: putBlockedPercent,
        putBuysPercent: putBuysPercent,
        putSellsPercent: putSellsPercent,
        totalCallActivity: totalCallActivity,
        totalPutActivity: totalPutActivity,
        callPutRatio: callPutRatio,
        totalBuys: totalBuys,
        totalSells: totalSells,
        totalBlocked: totalBlocked,
        buySellRatio: buySellRatio
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'option_volume_ratio',
          prompt: `请分析${coin.toUpperCase()}期权成交量比率数据，提供专业的期权市场分析。数据包括：
          - 时间范围: ${timeRange === '24h' ? '24小时' : '7天'}
          - 总成交量: ₿${totalVolume.toLocaleString()} ($${(totalVolume * 107300).toLocaleString()})
          - Call Blocked: ₿${callBlocked.toLocaleString()} (${callBlockedPercent.toFixed(2)}%)
          - Call Buys: ₿${callBuys.toLocaleString()} (${callBuysPercent.toFixed(2)}%)
          - Call Sells: ₿${callSells.toLocaleString()} (${callSellsPercent.toFixed(2)}%)
          - Put Blocked: ₿${putBlocked.toLocaleString()} (${putBlockedPercent.toFixed(2)}%)
          - Put Buys: ₿${putBuys.toLocaleString()} (${putBuysPercent.toFixed(2)}%)
          - Put Sells: ₿${putSells.toLocaleString()} (${putSellsPercent.toFixed(2)}%)
          - Call/Put比率: ${callPutRatio.toFixed(2)}
          - 买卖比率: ${buySellRatio.toFixed(2)}
          
          请提供结构化的分析报告，包括核心统计指标、成交量分布分析、市场情绪洞察、交易行为分析和风险提示。`
        })
      });

      console.log('[OptionVolumeRatio] OpenAI API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[OptionVolumeRatio] OpenAI API错误详情:', errorData);
        
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
      console.log('[OptionVolumeRatio] OpenAI API响应成功:', result);
      
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
        const totalVolume = data.reduce((sum, item) => sum + item.value, 0);
        const callBlocked = data.find(d => d.key === 'call_blocked')?.value || 0;
        const callSells = data.find(d => d.key === 'call_sells')?.value || 0;
        const putBuys = data.find(d => d.key === 'put_buys')?.value || 0;
        
        const fallbackSummary = [
          {
            type: 'stats',
            title: '核心统计指标',
            icon: 'stats',
            items: [
              {
                title: '总成交量',
                value: `₿${totalVolume.toLocaleString()}`,
                valueColor: 'text-blue-600',
                subTitle: `$${(totalVolume * 107300).toLocaleString()}`,
                subValue: ''
              },
              {
                title: 'Call Blocked',
                value: `₿${callBlocked.toLocaleString()}`,
                valueColor: 'text-green-600',
                subTitle: `${((callBlocked / totalVolume) * 100).toFixed(2)}%`,
                subValue: ''
              },
              {
                title: 'Call Sells',
                value: `₿${callSells.toLocaleString()}`,
                valueColor: 'text-yellow-600',
                subTitle: `${((callSells / totalVolume) * 100).toFixed(2)}%`,
                subValue: ''
              },
              {
                title: 'Put Buys',
                value: `₿${putBuys.toLocaleString()}`,
                valueColor: 'text-red-600',
                subTitle: `${((putBuys / totalVolume) * 100).toFixed(2)}%`,
                subValue: ''
              }
            ]
          },
          {
            type: 'structure',
            title: '成交量分布分析',
            icon: 'structure',
            items: [
              {
                title: '最大占比',
                value: 'Call Blocked',
                valueColor: 'text-green-600',
                subTitle: `${((callBlocked / totalVolume) * 100).toFixed(2)}%`,
                subValue: ''
              },
              {
                title: '第二大占比',
                value: 'Call Sells',
                valueColor: 'text-yellow-600',
                subTitle: `${((callSells / totalVolume) * 100).toFixed(2)}%`,
                subValue: ''
              },
              {
                title: '第三大占比',
                value: 'Put Buys',
                valueColor: 'text-red-600',
                subTitle: `${((putBuys / totalVolume) * 100).toFixed(2)}%`,
                subValue: ''
              }
            ]
          },
          {
            type: 'sentiment',
            title: '市场情绪洞察',
            icon: 'sentiment',
            items: [
              {
                title: '主导行为',
                value: 'Call Blocked',
                valueColor: 'text-green-600',
                subTitle: '看涨期权被阻止',
                subValue: ''
              },
              {
                title: '次要行为',
                value: 'Call Sells',
                valueColor: 'text-yellow-600',
                subTitle: '看涨期权卖出',
                subValue: ''
              },
              {
                title: '市场倾向',
                value: '中性偏空',
                valueColor: 'text-gray-600',
                subTitle: '基于成交量分布',
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

  return (
    <Card title={`期权成交占比 - 2025/07/01 (${timeRanges.find(t => t.value === timeRange)?.label})`} className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {/* AI分析按钮 */}
        <button
          onClick={handleAISummary}
          disabled={isAILoading}
          className="ml-auto px-3 py-1 bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAILoading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI分析中...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI分析
            </>
          )}
        </button>
        {coins.map(c => (
          <button
            key={c.value}
            className={`px-2 py-0.5 rounded text-xs border ${coin === c.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setCoin(c.value)}
          >
            {c.label}
          </button>
        ))}
        {timeRanges.map(r => (
          <button
            key={r.value}
            className={`px-2 py-0.5 rounded text-xs border ${timeRange === r.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-theme-on-surface-1 text-theme-primary border-theme-stroke'}`}
            onClick={() => setTimeRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="relative flex flex-row items-center justify-center gap-2 min-h-[260px]">
        {/* SVG 连线层 */}
        <svg width={svgDims.width} height={svgDims.height} className="absolute left-0 top-0 pointer-events-none z-10">
          {lines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.color}
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          ))}
        </svg>
        
        {/* 左侧：Put Buys/Call Sells */}
        <div className="flex flex-col gap-4 items-end justify-center flex-1 min-w-[180px] max-w-xs">
          <div ref={putRef} className="border border-blue-400 rounded-lg p-3 w-full max-w-xs">
            <div className="font-semibold text-sm mb-1">Put Buys</div>
            <div className="flex items-center justify-between">
              <span className="text-theme-primary text-xs">₿2,121.7 ($227.7M)</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-semibold">9.8%</span>
            </div>
          </div>
          <div ref={sellRef} className="border border-blue-400 rounded-lg p-3 w-full max-w-xs">
            <div className="font-semibold text-sm mb-1">Call Sells</div>
            <div className="flex items-center justify-between">
              <span className="text-theme-primary text-xs">₿3,489.0 ($374.4M)</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-semibold">16.12%</span>
            </div>
          </div>
        </div>
        
        {/* 中间：饼图和图例 */}
        <div ref={pieRef} className="flex flex-col items-center justify-center mx-2">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.key} fill={categories.find(c => c.key === entry.key)?.color || '#ccc'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {categories.map(c => (
              <div key={c.key} className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded mr-1" style={{ background: c.color }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* 右侧：Call Blocked */}
        <div className="flex flex-col items-start justify-center flex-1 min-w-[180px] max-w-xs">
          <div ref={blockRef} className="border border-blue-400 rounded-lg p-3 w-full max-w-xs">
            <div className="font-semibold text-sm mb-1">Call Blocked</div>
            <div className="flex items-center justify-between">
              <span className="text-theme-primary text-xs">₿9,882.7 ($1060.4M)</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-semibold">45.65%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs text-theme-tertiary text-center">总订单数量: ₿21,646.8 ($2,322,661,813)</div>
      
      {/* AI分析模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="期权成交量比率分析"
          symbol={coin.toUpperCase()}
        />
      )}
    </Card>
  );
};

export default OptionVolumeRatio; 