import React, { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
import dynamic from "next/dynamic";
import { useVolSurfaceData } from "@/hooks/useVolSurfaceData";
import Plot from 'react-plotly.js';
import { useColorMode } from "@chakra-ui/react";
import TimerSettingsModal from '@/components/TimerSettings';
import AISummaryModal from '@/components/AISummaryModal';

// 自定义加载动画样式
const loadingStyles = `
  @keyframes ai-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes ai-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  @keyframes ai-bounce-delayed {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    40%, 43% { transform: translate3d(0,-8px,0); }
    70% { transform: translate3d(0,-4px,0); }
    90% { transform: translate3d(0,-2px,0); }
  }
  
  .ai-spin { animation: ai-spin 2s linear infinite; }
  .ai-pulse { animation: ai-pulse 2s ease-in-out infinite; }
  .ai-bounce-delayed { animation: ai-bounce-delayed 1.4s ease-in-out infinite; }
`;

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// 定义数据类型
interface VolSurfaceData {
  xAxis: string[];
  yAxis: string[];
  zData: number[][];
}

// 默认模拟数据
const defaultData: VolSurfaceData = {
  xAxis: ['30JUN25', '23OCT25', '16FEB26', '12JUN26', '05OCT26'],
  yAxis: ['10P', '20P', '30C', '40C'],
  zData: [
    [30, 32, 35, 38],
    [31, 33, 36, 39],
    [33, 35, 38, 41],
    [36, 38, 41, 44],
    [38, 41, 44, 48],
  ],
};

const VolSurface = ({ className }: { className?: string }) => {
  const [symbol, setSymbol] = useState('BTC');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    enabled: false,
    interval: 30, // 分钟
    nextRun: null as Date | null,
    telegramChatId: '',
    telegramBotToken: ''
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 添加自定义样式
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = loadingStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // 使用自定义Hook获取数据
  const { data, loading, error, fetchData, refresh } = useVolSurfaceData(symbol, true, 5 * 60 * 1000);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const axisColor = isDark ? "#fff" : "#222";
  const gridColor = isDark ? "#444" : "#e5e7eb";

  // 定时器管理功能
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (timerSettings.enabled) {
      const intervalMs = timerSettings.interval * 60 * 1000;
      timerRef.current = setInterval(async () => {
        console.log('[VolSurface] 定时AI分析开始');
        await handleScheduledAIAnalysis();
      }, intervalMs);
      
      // 设置下次运行时间
      const nextRun = new Date(Date.now() + intervalMs);
      setTimerSettings(prev => ({ ...prev, nextRun }));
      
      console.log('[VolSurface] 定时器已启动，间隔:', timerSettings.interval, '分钟');
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerSettings(prev => ({ ...prev, enabled: false, nextRun: null }));
    console.log('[VolSurface] 定时器已停止');
  };

  // 组件挂载时启动定时器
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

  // 定时AI分析（包含图片生成和Telegram推送）
  const handleScheduledAIAnalysis = async () => {
    try {
      console.log('[VolSurface] 开始定时AI分析');
      
      // 直接执行AI分析逻辑，不依赖UI状态
      const analysisResult = await performAIAnalysis();
      
      // 生成海报图片（传入分析结果）
      const imageData = await generatePosterImageWithData(analysisResult);
      
      // 推送到Telegram
      if (timerSettings.telegramChatId && timerSettings.telegramBotToken) {
        await sendToTelegram(imageData, timerSettings.telegramChatId, timerSettings.telegramBotToken);
      }
      
      console.log('[VolSurface] 定时AI分析完成');
    } catch (error) {
      console.error('[VolSurface] 定时AI分析失败:', error);
    }
  };

  // OpenAI驱动的AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    try {
      console.log('[VolSurface] 开始AI分析，原始数据:', data);
      
      if (!data) {
        console.log('[VolSurface] 数据为空，显示错误');
        setAiSummary({ error: '暂无数据可供分析。' });
        return;
      }

      // 验证数据质量
      const validData = data.zData.filter((row: any) => 
        row && Array.isArray(row) && row.length > 0
      );

      console.log('[VolSurface] 有效数据行数量:', validData.length);

      if (validData.length < 2) {
        console.log('[VolSurface] 有效数据点不足，显示错误');
        setAiSummary({ error: '数据点不足，至少需要2个有效数据点进行分析。' });
        return;
      }

      // 准备分析数据
      const analysisData = {
        symbol: symbol.toUpperCase(),
        xAxis: data.xAxis,
        yAxis: data.yAxis,
        zData: data.zData,
        max,
        min,
        avgVol,
        volRange,
        volStd,
        shortTermAvg,
        longTermAvg,
        termSlope,
        skew,
        maxPos: [data.xAxis[maxPos[0]], data.yAxis[maxPos[1]]],
        minPos: [data.xAxis[minPos[0]], data.yAxis[minPos[1]]]
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'vol_surface',
          prompt: `请分析${symbol.toUpperCase()}波动率平面数据，提供专业的期权市场分析。数据包括：
          - 最高波动率: ${max.toFixed(2)}% (${data.xAxis[maxPos[0]]} ${data.yAxis[maxPos[1]]})
          - 最低波动率: ${min.toFixed(2)}% (${data.xAxis[minPos[0]]} ${data.yAxis[minPos[1]]})
          - 平均波动率: ${avgVol.toFixed(2)}%
          - 期限斜率: ${(termSlope > 0 ? '+' : '') + termSlope.toFixed(2)}%
          - 偏斜度: ${(skew > 0 ? '+' : '') + skew.toFixed(2)}%
          
          请提供结构化的分析报告，包括核心统计指标、期限结构特征、Delta结构洞察、市场情绪分析和风险提示。`
        })
      });

      console.log('[VolSurface] OpenAI API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[VolSurface] OpenAI API错误详情:', errorData);
        throw new Error(`AI分析请求失败: ${errorData.error || '未知错误'}`);
      }

      const result = await response.json();
      console.log('[VolSurface] OpenAI API响应成功:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // 验证OpenAI返回的数据格式
      console.log('[VolSurface] OpenAI返回的原始数据:', result);
      
      if (result.summary && Array.isArray(result.summary) && result.summary.length > 0) {
        // 验证每个summary块都有必要的数据，并标准化数据格式
        const validSummary = result.summary.filter((block: any) => 
          block && block.title && block.items && Array.isArray(block.items) && block.items.length > 0
        ).map((block: any) => {
          // 标准化每个数据项，确保所有必要字段都存在
          const normalizedItems = block.items.map((item: any) => ({
            title: item.title || '未知指标',
            value: item.value || 'N/A',
            valueColor: item.valueColor || 'text-gray-600',
            subTitle: item.subTitle || '',
            subValue: item.subValue || ''
          }));
          
          return {
            type: block.type || 'unknown',
            title: block.title,
            icon: block.icon || 'stats',
            items: normalizedItems
          };
        });
        
        console.log('[VolSurface] 标准化后的summary:', validSummary);
        
        if (validSummary.length > 0) {
          setAiSummary(validSummary);
        } else {
          throw new Error('OpenAI返回的summary格式无效');
        }
      } else {
        throw new Error('OpenAI返回的summary为空或格式错误');
      }

    } catch (error) {
      console.error('AI分析错误:', error);
      // 如果OpenAI失败或返回无效数据，回退到本地分析
      console.log('[VolSurface] 回退到本地分析...');
      try {
        const fallbackSummary = [
          {
            type: 'core',
            title: '核心统计指标',
            icon: 'stats',
            items: [
                             {
                 title: '最高波动率',
                 value: max.toFixed(2) + '%',
                 valueColor: 'text-red-500',
                 subTitle: data?.xAxis[maxPos[0]] + ' ' + data?.yAxis[maxPos[1]],
                 subValue: '',
               },
               {
                 title: '最低波动率',
                 value: min.toFixed(2) + '%',
                 valueColor: 'text-green-600',
                 subTitle: data?.xAxis[minPos[0]] + ' ' + data?.yAxis[minPos[1]],
                 subValue: '',
               },
              {
                title: '平均波动率',
                value: avgVol.toFixed(2) + '%',
                valueColor: 'text-blue-600',
                subTitle: '标准差',
                subValue: volStd.toFixed(2) + '%',
              },
            ],
          },
          {
            type: 'structure',
            title: '期限结构分析',
            icon: 'structure',
            items: [
              {
                title: '短期平均波动率',
                value: shortTermAvg.toFixed(2) + '%',
                valueColor: 'text-orange-600',
                subTitle: '近期到期',
                subValue: '',
              },
              {
                title: '长期平均波动率',
                value: longTermAvg.toFixed(2) + '%',
                valueColor: 'text-blue-600',
                subTitle: '远期到期',
                subValue: '',
              },
              {
                title: '期限斜率',
                value: (termSlope > 0 ? '+' : '') + termSlope.toFixed(2) + '%',
                valueColor: 'text-purple-600',
                subTitle: termSlope > 0 ? '正向' : '反向',
                subValue: '',
              },
            ],
          },
          {
            type: 'sentiment',
            title: 'Delta结构洞察',
            icon: 'sentiment',
            items: [
              {
                title: '平均偏斜度',
                value: (skew > 0 ? '+' : '') + skew.toFixed(2) + '%',
                valueColor: 'text-yellow-600',
                subTitle: skew > 0 ? '看涨偏斜' : '看跌偏斜',
                subValue: '',
              },
              {
                title: '偏斜特征',
                value: (Math.abs(skew) > 1 ? '显著' : '轻微') + (skew > 0 ? '看涨' : '看跌') + '偏斜',
                valueColor: 'text-yellow-600',
                subTitle: '市场情绪',
                subValue: skew > 0.5 ? '偏向看涨' : skew < -0.5 ? '偏向看跌' : '相对平衡',
              },
            ],
          },
          {
            type: 'risk',
            title: '风险提示',
            icon: 'risk',
            items: [
                             {
                 title: '高波动率区域',
                 value: data?.xAxis[maxPos[0]] + ' ' + data?.yAxis[maxPos[1]],
                 valueColor: 'text-red-500',
                 subTitle: '波动率',
                 subValue: max.toFixed(2) + '%',
               },
               {
                 title: '低波动率区域',
                 value: data?.xAxis[minPos[0]] + ' ' + data?.yAxis[minPos[1]],
                 valueColor: 'text-green-600',
                 subTitle: '波动率',
                 subValue: min.toFixed(2) + '%',
               },
            ],
          },
          {
            type: 'advice',
            title: 'AI操作建议',
            icon: 'advice',
            items: [
              {
                title: '策略建议',
                value: skew > 0.5 ? '考虑看涨策略' : skew < -0.5 ? '考虑看跌策略' : '保持中性策略',
                valueColor: 'text-emerald-600',
                subTitle: '基于偏斜度',
                subValue: skew > 0.5 ? '市场偏向看涨' : skew < -0.5 ? '市场偏向看跌' : '市场相对平衡',
              },
              {
                title: '仓位管理',
                value: volRange > 10 ? '增加对冲仓位' : '正常仓位',
                valueColor: 'text-emerald-600',
                subTitle: '风险控制',
                subValue: volRange > 10 ? '波动率差异较大' : '波动率相对稳定',
              },
              {
                title: '时间窗口',
                value: '关注1-3个月到期',
                valueColor: 'text-emerald-600',
                subTitle: '最佳时机',
                subValue: '波动率曲面拐点',
              },
            ],
          },
        ];
        
        setAiSummary(fallbackSummary);
      } catch (fallbackError) {
        console.error('[VolSurface] 本地分析也失败:', fallbackError);
        setAiSummary({ error: 'AI分析生成失败，请稍后重试。' });
      }
    } finally {
      setIsAILoading(false);
    }
  };

  // 独立的AI分析函数，用于定时器
  const performAIAnalysis = async () => {
    try {
      console.log('[VolSurface] 执行独立AI分析');
      
      if (!data) {
        console.log('[VolSurface] 数据为空，返回基础分析');
        return null;
      }

      // 验证数据质量
      const validData = data.zData.filter((row: any) => 
        row && Array.isArray(row) && row.length > 0
      );

      if (validData.length < 2) {
        console.log('[VolSurface] 有效数据点不足，返回基础分析');
        return null;
      }

      // 准备分析数据
      const analysisData = {
        symbol: symbol.toUpperCase(),
        xAxis: data.xAxis,
        yAxis: data.yAxis,
        zData: data.zData,
        max,
        min,
        avgVol,
        volRange,
        volStd,
        shortTermAvg,
        longTermAvg,
        termSlope,
        skew,
        maxPos: [data.xAxis[maxPos[0]], data.yAxis[maxPos[1]]],
        minPos: [data.xAxis[minPos[0]], data.yAxis[minPos[1]]]
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'vol_surface',
          prompt: `请分析${symbol.toUpperCase()}波动率平面数据，提供专业的期权市场分析。数据包括：
          - 最高波动率: ${max.toFixed(2)}% (${data.xAxis[maxPos[0]]} ${data.yAxis[maxPos[1]]})
          - 最低波动率: ${min.toFixed(2)}% (${data.xAxis[minPos[0]]} ${data.yAxis[minPos[1]]})
          - 平均波动率: ${avgVol.toFixed(2)}%
          - 期限斜率: ${(termSlope > 0 ? '+' : '') + termSlope.toFixed(2)}%
          - 偏斜度: ${(skew > 0 ? '+' : '') + skew.toFixed(2)}%
          
          请提供结构化的分析报告，包括核心统计指标、期限结构特征、Delta结构洞察、市场情绪分析和风险提示。`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[VolSurface] OpenAI API错误:', errorData);
        return null;
      }

      const result = await response.json();
      
      if (result.error || !result.summary) {
        console.error('[VolSurface] OpenAI返回错误:', result.error);
        return null;
      }

      // 验证和标准化AI分析结果
      if (result.summary && Array.isArray(result.summary) && result.summary.length > 0) {
        const validSummary = result.summary.filter((block: any) => 
          block && block.title && block.items && Array.isArray(block.items) && block.items.length > 0
        ).map((block: any) => {
          const normalizedItems = block.items.map((item: any) => ({
            title: item.title || '未知指标',
            value: item.value || 'N/A',
            valueColor: item.valueColor || 'text-gray-600',
            subTitle: item.subTitle || '',
            subValue: item.subValue || ''
          }));
          
          return {
            type: block.type || 'unknown',
            title: block.title,
            icon: block.icon || 'stats',
            items: normalizedItems
          };
        });
        
        console.log('[VolSurface] AI分析成功，返回结果');
        return validSummary;
      }

      return null;
    } catch (error) {
      console.error('[VolSurface] AI分析错误:', error);
      return null;
    }
  };

  // 使用AI分析结果生成海报
  const generatePosterImageWithData = async (analysisResult: any): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      canvas.width = 900;
      canvas.height = 1200;

      // 设置背景
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 900, 1200);

      // 添加渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 900, 1200);
      gradient.addColorStop(0, '#0C68E9');
      gradient.addColorStop(1, '#B5E4CA');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 900, 1200);

      // 添加标题
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${symbol.toUpperCase()} 波动率平面分析`, 450, 80);

      // 添加时间戳
      ctx.font = '18px Arial';
      ctx.fillText(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 450, 110);

      let yPos = 160;

      // 使用传入的AI分析结果
      if (analysisResult && Array.isArray(analysisResult) && analysisResult.length > 0) {
        console.log('[VolSurface] 使用AI分析结果生成海报，模块数量:', analysisResult.length);
        
        // 1. 核心统计指标
        const coreBlock = analysisResult.find((block: any) => block.type === 'core' || block.title?.includes('核心'));
        if (coreBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('📊 核心统计指标', 450, yPos);
          yPos += 40;

          ctx.font = '20px Arial';
          coreBlock.items?.forEach((item: any) => {
            ctx.fillText(`${item.title}: ${item.value}`, 450, yPos);
            yPos += 30;
          });
          yPos += 20;
        }

        // 2. 期限结构分析
        const structureBlock = analysisResult.find((block: any) => block.type === 'structure' || block.title?.includes('期限'));
        if (structureBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('📈 期限结构分析', 450, yPos);
          yPos += 40;

          ctx.font = '20px Arial';
          structureBlock.items?.forEach((item: any) => {
            ctx.fillText(`${item.title}: ${item.value}`, 450, yPos);
            yPos += 30;
          });
          yPos += 20;
        }

        // 3. Delta结构洞察
        const sentimentBlock = analysisResult.find((block: any) => block.type === 'sentiment' || block.title?.includes('Delta'));
        if (sentimentBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('🎯 Delta结构洞察', 450, yPos);
          yPos += 40;

          ctx.font = '20px Arial';
          sentimentBlock.items?.forEach((item: any) => {
            ctx.fillText(`${item.title}: ${item.value}`, 450, yPos);
            yPos += 30;
          });
          yPos += 20;
        }

        // 4. 风险提示
        const riskBlock = analysisResult.find((block: any) => block.type === 'risk' || block.title?.includes('风险'));
        if (riskBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ff6b6b';
          ctx.fillText('⚠️ 风险提示', 450, yPos);
          yPos += 40;

          ctx.font = '20px Arial';
          ctx.fillStyle = '#ff6b6b';
          riskBlock.items?.forEach((item: any) => {
            ctx.fillText(`${item.title}: ${item.value}`, 450, yPos);
            yPos += 30;
          });
          yPos += 20;
        }

        // 5. AI操作建议
        const adviceBlock = analysisResult.find((block: any) => block.type === 'advice' || block.title?.includes('建议'));
        if (adviceBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#51cf66';
          ctx.fillText('💡 AI操作建议', 450, yPos);
          yPos += 40;

          ctx.font = '20px Arial';
          ctx.fillStyle = '#51cf66';
          adviceBlock.items?.forEach((item: any) => {
            ctx.fillText(`${item.title}: ${item.value}`, 450, yPos);
            yPos += 30;
          });
          yPos += 20;
        }
      } else {
        // 如果没有AI分析结果，显示基础数据
        console.log('[VolSurface] 使用基础数据生成海报');
        if (data) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('📊 核心指标', 450, yPos);
          yPos += 40;
          
          ctx.font = '20px Arial';
          ctx.fillText(`最高波动率: ${max.toFixed(2)}%`, 450, yPos);
          yPos += 30;
          ctx.fillText(`最低波动率: ${min.toFixed(2)}%`, 450, yPos);
          yPos += 30;
          ctx.fillText(`平均波动率: ${avgVol.toFixed(2)}%`, 450, yPos);
          yPos += 30;
        }
      }

      // 添加底部信息
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Powered by AI Analysis', 450, 1150);

      // 转换为base64图片数据
      const imageData = canvas.toDataURL('image/png');
      resolve(imageData);
    });
  };

  // 发送到Telegram
  const sendToTelegram = async (imageData: string, chatId: string, botToken: string) => {
    try {
      console.log('[VolSurface] 开始推送到Telegram');
      
      // 使用我们的后端API
      const response = await fetch('/api/telegram/send-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          chatId,
          botToken,
          caption: `📊 ${symbol.toUpperCase()} 波动率平面分析\n⏰ ${new Date().toLocaleString('zh-CN')}\n🤖 AI自动生成`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[VolSurface] 成功推送到Telegram:', result);
      } else {
        const errorData = await response.json();
        console.error('[VolSurface] Telegram推送失败:', errorData);
      }
    } catch (error) {
      console.error('[VolSurface] Telegram推送错误:', error);
    }
  };

  // 如果没有数据，显示加载状态
  if (!data) {
    return (
      <Card title="模型波动率平面" className={className}>
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-theme-secondary">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            加载中...
          </div>
        </div>
      </Card>
    );
  }

  // 处理zData，确保无负值和null
  const zData = data.zData.map(row => row.map(z => z !== null && z >= 0 ? z : 0));
  const x = data.xAxis;
  const y = data.yAxis;

  // 计算极值点
  let max = -Infinity, min = Infinity, maxPos = [0, 0], minPos = [0, 0];
  zData.forEach((row, i) => {
    row.forEach((z, j) => {
      if (z > max) { max = z; maxPos = [i, j]; }
      if (z < min) { min = z; minPos = [i, j]; }
    });
  });

  // 计算统计指标（移到组件级别）
  const allValues = zData.flat().filter(v => v > 0);
  const avgVol = allValues.reduce((sum, v) => sum + v, 0) / allValues.length;
  const volRange = max - min;
  const volStd = Math.sqrt(allValues.reduce((sum, v) => sum + Math.pow(v - avgVol, 2), 0) / allValues.length);

  // 分析期限结构
  const shortTermAvg = Array.isArray(zData[0]) && zData[0].length > 0 ? zData[0].reduce((sum, v) => sum + v, 0) / zData[0].length : 0;
  const longTermAvg = Array.isArray(zData[zData.length - 1]) && zData[zData.length - 1].length > 0 ? zData[zData.length - 1].reduce((sum, v) => sum + v, 0) / zData[zData.length - 1].length : 0;
  const termSlope = longTermAvg - shortTermAvg;

  // 分析Delta结构
  const atmCalls = zData.map(row => row[2]); // 30C
  const atmPuts = zData.map(row => row[1]);  // 20P
  const skew = atmCalls.reduce((sum, v, i) => sum + (v - atmPuts[i]), 0) / atmCalls.length;

  const themeMaxColor = 'rgba(59,130,246,0.7)'; // 主题蓝，半透明
  const themeMinColor = 'rgba(251,191,36,0.7)'; // 主题橙，半透明

  const extremePoints = [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: [x[maxPos[0]]],
      y: [y[maxPos[1]]],
      z: [max],
      marker: {
        color: 'rgba(0,0,0,0)', // 完全透明无色
        size: 11,
        opacity: 0, // marker本体完全透明
        line: { color: '#3b82f6', width: 2 } // 仅保留主题色边框
      },
      name: 'MAX',
      showlegend: false,
      hoverinfo: 'x+y+z'
    },
    {
      type: 'scatter3d',
      mode: 'markers',
      x: [x[minPos[0]]],
      y: [y[minPos[1]]],
      z: [min],
      marker: {
        color: 'rgba(0,0,0,0)', // 完全透明无色
        size: 11,
        opacity: 0, // marker本体完全透明
        line: { color: '#fbbf24', width: 2 } // 仅保留主题色边框
      },
      name: 'MIN',
      showlegend: false,
      hoverinfo: 'x+y+z'
    }
  ];

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {symbol.toUpperCase()} 模型波动率平面
          </h2>
          <div className="flex items-center gap-2">
            <select 
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value)}
              className="px-3 py-1 rounded text-sm border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
            </select>
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
          <div className="h-full flex items-center justify-center">
            <Plot
              data={[
                {
                  type: 'surface',
                  x: x,
                  y: y,
                  z: zData,
                  colorscale: [
                    [0, '#3b82f6'],
                    [0.5, '#fbbf24'],
                    [1, '#ef4444']
                  ],
                  showscale: false,
                  contours: { z: { show: false } },
                  hoverinfo: 'x+y+z',
                  hovertemplate: [
                    '<b>到期日</b>: %{x}<br>',
                    '<b>Delta</b>: %{y}<br>',
                    '<b>波动率</b>: %{z:.2f}%<extra></extra>'
                  ].join('')
                },
                ...extremePoints
              ]}
              layout={{
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: axisColor, family: 'inherit', size: 16 },
                hoverlabel: {
                  bgcolor: '#23232b',
                  bordercolor: '#3b82f6',
                  font: { color: '#fff', size: 18, family: 'inherit' }
                },
                scene: {
                  xaxis: {
                    title: { text: '到期日', font: { color: axisColor, size: 16, family: 'inherit' } },
                    tickmode: 'array',
                    tickvals: x.filter((_, i) => i % Math.ceil(x.length / 5) === 0),
                    ticktext: x.filter((_, i) => i % Math.ceil(x.length / 5) === 0),
                    color: axisColor,
                    gridcolor: gridColor,
                    gridwidth: 2,
                    zerolinecolor: axisColor,
                    zerolinewidth: 3,
                    showbackground: false,
                    tickfont: { size: 14, color: axisColor, family: 'inherit' }
                  },
                  yaxis: {
                    title: { text: 'Delta', font: { color: axisColor, size: 16, family: 'inherit' } },
                    tickmode: 'array',
                    tickvals: y.filter((_, i) => i % Math.ceil(y.length / 3) === 0),
                    ticktext: y.filter((_, i) => i % Math.ceil(y.length / 3) === 0),
                    color: axisColor,
                    gridcolor: gridColor,
                    gridwidth: 2,
                    zerolinecolor: axisColor,
                    zerolinewidth: 3,
                    showbackground: false,
                    tickfont: { size: 14, color: axisColor, family: 'inherit' }
                  },
                  zaxis: {
                    title: { text: '波动率(%)', font: { color: axisColor, size: 16, family: 'inherit' } },
                    color: axisColor,
                    gridcolor: gridColor,
                    gridwidth: 2,
                    zerolinecolor: axisColor,
                    zerolinewidth: 3,
                    showbackground: false,
                    tickfont: { size: 14, color: axisColor, family: 'inherit' }
                  },
                  bgcolor: 'rgba(0,0,0,0)'
                },
                margin: { l: 0, r: 0, b: 0, t: 0 }
              }}
              config={{
                displayModeBar: false,
                responsive: true
              }}
              style={{ width: '90%', height: '90%' }}
            />
          </div>
        </div>

        {/* 全屏模式下的AI总结模态框 */}
        {showAISummary && (
          <AISummaryModal
            isLoading={isAILoading}
            summary={aiSummary}
            onClose={() => setShowAISummary(false)}
            title="AI 波动率平面分析总结"
            symbol={symbol + " 波动率平面"}
          />
        )}
      </div>
    );
  }

  return (
    <Card title="模型波动率平面" className={className}>
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
      
      <div className="h-96 flex items-center justify-center">
        <Plot
          data={[
            {
              type: 'surface',
              x: x,
              y: y,
              z: zData,
              colorscale: [
                [0, '#3b82f6'],
                [0.5, '#fbbf24'],
                [1, '#ef4444']
              ],
              showscale: false,
              contours: { z: { show: false } },
              hoverinfo: 'x+y+z',
              hovertemplate: [
                '<b>到期日</b>: %{x}<br>',
                '<b>Delta</b>: %{y}<br>',
                '<b>波动率</b>: %{z:.2f}%<extra></extra>'
              ].join('')
            },
            ...extremePoints
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: axisColor, family: 'inherit', size: 16 },
            hoverlabel: {
              bgcolor: '#23232b',
              bordercolor: '#3b82f6',
              font: { color: '#fff', size: 18, family: 'inherit' }
            },
            scene: {
              xaxis: {
                title: { text: '到期日', font: { color: axisColor, size: 16, family: 'inherit' } },
                tickmode: 'array',
                tickvals: x.filter((_, i) => i % Math.ceil(x.length / 5) === 0),
                ticktext: x.filter((_, i) => i % Math.ceil(x.length / 5) === 0),
                color: axisColor,
                gridcolor: gridColor,
                gridwidth: 2,
                zerolinecolor: axisColor,
                zerolinewidth: 3,
                showbackground: false,
                tickfont: { size: 14, color: axisColor, family: 'inherit' }
              },
              yaxis: {
                title: { text: 'Delta', font: { color: axisColor, size: 16, family: 'inherit' } },
                tickmode: 'array',
                tickvals: y.filter((_, i) => i % Math.ceil(y.length / 3) === 0),
                ticktext: y.filter((_, i) => i % Math.ceil(y.length / 3) === 0),
                color: axisColor,
                gridcolor: gridColor,
                gridwidth: 2,
                zerolinecolor: axisColor,
                zerolinewidth: 3,
                showbackground: false,
                tickfont: { size: 14, color: axisColor, family: 'inherit' }
              },
              zaxis: {
                title: { text: '波动率(%)', font: { color: axisColor, size: 16, family: 'inherit' } },
                color: axisColor,
                gridcolor: gridColor,
                gridwidth: 2,
                zerolinecolor: axisColor,
                zerolinewidth: 3,
                showbackground: false,
                tickfont: { size: 14, color: axisColor, family: 'inherit' }
              },
              bgcolor: 'rgba(0,0,0,0)'
            },
            margin: { l: 0, r: 0, b: 0, t: 0 }
          }}
          config={{
            displayModeBar: false,
            responsive: true
          }}
          style={{ width: '90%', height: '90%' }}
        />
      </div>

      {/* AI总结模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI 波动率平面分析总结"
          symbol={symbol + " 波动率平面"}
        />
      )}

      {/* 定时器设置模态框 */}
      {showTimerModal && (
        <TimerSettingsModal 
          settings={timerSettings}
          onSave={async (newSettings) => {
            try {
              // 验证设置
              if (newSettings.enabled) {
                if (!newSettings.telegramBotToken.trim()) {
                  throw new Error('请输入Telegram Bot Token');
                }
                if (!newSettings.telegramChatId.trim()) {
                  throw new Error('请输入Telegram Chat ID');
                }
                
                // 验证Chat ID格式
                const chatId = newSettings.telegramChatId.trim();
                if (!/^-?\d+$/.test(chatId)) {
                  throw new Error('Chat ID必须是数字格式');
                }
                
                // 验证Bot Token格式
                const botToken = newSettings.telegramBotToken.trim();
                if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)) {
                  throw new Error('Bot Token格式不正确');
                }
              }
              
              // 保存设置
              setTimerSettings(newSettings);
              
              // 启动或停止定时器
              if (newSettings.enabled) {
                startTimer();
              } else {
                stopTimer();
              }
              
              // 返回成功
              return Promise.resolve();
            } catch (error) {
              console.error('保存定时器设置失败:', error);
              throw error;
            }
          }}
          onClose={() => setShowTimerModal(false)}
        />
      )}
    </Card>
  );
};

export default VolSurface; 