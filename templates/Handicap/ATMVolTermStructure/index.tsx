import React, { useState, useEffect, useRef } from "react";
import Card from "@/components/Card";
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from '@mui/material/styles';
import { useATMVolTerm } from "@/hooks/useATMVolTerm";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">期限: {label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-300">ATM IV:</span>
            <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>{payload[0].payload.atm}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-300">FWD IV:</span>
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>{payload[0].payload.fwd}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// 自定义底部Legend，始终显示所有按钮，变灰/高亮
function CustomLegend({ visible, onClick }: any) {
  const lines = [
    { key: 'atm', name: 'ATM IV', color: '#a78bfa' },
    { key: 'fwd', name: 'FWD IV', color: '#34d399' },
  ];
  
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

const ATMVolTermStructure = ({ className }: { className?: string }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [visible, setVisible] = useState({ atm: true, fwd: true });
  const theme = useTheme();
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
  const { data, loading, error, refresh, updateDate } = useATMVolTerm({
    symbol: 'BTC',
    date: selectedDate || undefined,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000
  });

  // 当日期改变时更新数据
  React.useEffect(() => {
    if (selectedDate) {
      updateDate(selectedDate);
    }
  }, [selectedDate, updateDate]);

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key as keyof typeof v]: !v[key as keyof typeof v] }));
  };

  // 定时器管理功能
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (timerSettings.enabled) {
      const intervalMs = timerSettings.interval * 60 * 1000;
      timerRef.current = setInterval(async () => {
        console.log('[ATMVolTermStructure] 定时AI分析开始');
        await handleScheduledAIAnalysis();
      }, intervalMs);
      
      // 设置下次运行时间
      const nextRun = new Date(Date.now() + intervalMs);
      setTimerSettings(prev => ({ ...prev, nextRun }));
      
      console.log('[ATMVolTermStructure] 定时器已启动，间隔:', timerSettings.interval, '分钟');
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerSettings(prev => ({ ...prev, enabled: false, nextRun: null }));
    console.log('[ATMVolTermStructure] 定时器已停止');
  };

  // 定时AI分析（包含图片生成和Telegram推送）
  const handleScheduledAIAnalysis = async () => {
    try {
      console.log('[ATMVolTermStructure] 开始定时AI分析');
      
      // 直接执行AI分析逻辑，不依赖UI状态
      const analysisResult = await performAIAnalysis();
      
      // 生成海报图片（传入分析结果）
      const imageData = await generatePosterImageWithData(analysisResult);
      
      // 推送到Telegram
      if (timerSettings.telegramChatId && timerSettings.telegramBotToken) {
        await sendToTelegram(imageData, timerSettings.telegramChatId, timerSettings.telegramBotToken);
      }
      
      console.log('[ATMVolTermStructure] 定时AI分析完成');
    } catch (error) {
      console.error('[ATMVolTermStructure] 定时AI分析失败:', error);
    }
  };

  // 独立的AI分析函数，用于定时器
  const performAIAnalysis = async () => {
    try {
      console.log('[ATMVolTermStructure] 执行独立AI分析');
      
      if (!data || data.length === 0) {
        console.log('[ATMVolTermStructure] 数据为空，返回基础分析');
        return null;
      }

      // 验证数据质量
      const validData = data.filter((item: any) => {
        const isValid = item && typeof item.atm === 'number' && !isNaN(item.atm) && 
                       typeof item.fwd === 'number' && !isNaN(item.fwd);
        return isValid;
      });

      if (validData.length < 2) {
        console.log('[ATMVolTermStructure] 有效数据点不足，返回基础分析');
        return null;
      }

      // 准备分析数据
      const atmValues = validData.map((item: any) => Number(item.atm));
      const fwdValues = validData.map((item: any) => Number(item.fwd));
      const terms = validData.map((item: any) => item.term);
      
      // 计算核心指标
      const maxATM = Math.max(...atmValues);
      const minATM = Math.min(...atmValues);
      const avgATM = atmValues.reduce((sum, v) => sum + v, 0) / atmValues.length;
      const shortTermATM = atmValues[0];
      const longTermATM = atmValues[atmValues.length - 1];
      const termSlope = longTermATM - shortTermATM;

      const analysisData = {
        symbol: 'BTC',
        date: selectedDate?.format('YYYY-MM-DD'),
        atmValues,
        fwdValues,
        terms,
        maxATM,
        minATM,
        avgATM,
        shortTermATM,
        longTermATM,
        termSlope,
        chartData: data.slice(0, 10)
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'atm_term_structure',
          prompt: `请分析BTC ATM波动率期限结构数据，提供专业的期权市场分析。数据包括：
          - 最高ATM波动率: ${maxATM.toFixed(2)}%
          - 最低ATM波动率: ${minATM.toFixed(2)}%
          - 平均ATM波动率: ${avgATM.toFixed(2)}%
          - 期限斜率: ${(termSlope > 0 ? '+' : '') + termSlope.toFixed(2)}%
          - 近期ATM: ${shortTermATM.toFixed(2)}%
          - 远期ATM: ${longTermATM.toFixed(2)}%
          
          请提供结构化的分析报告，包括核心统计指标、期限结构特征、市场情绪洞察和风险提示。`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ATMVolTermStructure] OpenAI API错误:', errorData);
        return null;
      }

      const result = await response.json();
      
      if (result.error || !result.summary) {
        console.error('[ATMVolTermStructure] OpenAI返回错误:', result.error);
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
        
        console.log('[ATMVolTermStructure] AI分析成功，返回结果');
        return validSummary;
      }

      return null;
    } catch (error) {
      console.error('[ATMVolTermStructure] AI分析错误:', error);
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
      ctx.fillText('BTC ATM波动率期限结构分析', 450, 80);

      // 添加时间戳
      ctx.font = '18px Arial';
      ctx.fillText(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 450, 110);

      let yPos = 160;

      // 使用传入的AI分析结果
      if (analysisResult && Array.isArray(analysisResult) && analysisResult.length > 0) {
        console.log('[ATMVolTermStructure] 使用AI分析结果生成海报，模块数量:', analysisResult.length);
        
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

        // 2. 期限结构特征
        const structureBlock = analysisResult.find((block: any) => block.type === 'structure' || block.title?.includes('期限'));
        if (structureBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('📈 期限结构特征', 450, yPos);
          yPos += 40;

          ctx.font = '20px Arial';
          structureBlock.items?.forEach((item: any) => {
            ctx.fillText(`${item.title}: ${item.value}`, 450, yPos);
            yPos += 30;
          });
          yPos += 20;
        }

        // 3. 市场情绪洞察
        const sentimentBlock = analysisResult.find((block: any) => block.type === 'sentiment' || block.title?.includes('情绪'));
        if (sentimentBlock) {
          ctx.font = 'bold 28px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('🎯 市场情绪洞察', 450, yPos);
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
        console.log('[ATMVolTermStructure] 使用基础数据生成海报');
        if (data && data.length > 0) {
          const validData = data.filter((item: any) => 
            item && typeof item.atm === 'number' && !isNaN(item.atm)
          );
          
          if (validData.length > 0) {
            const atmValues = validData.map((item: any) => Number(item.atm));
            const maxATM = Math.max(...atmValues);
            const minATM = Math.min(...atmValues);
            const avgATM = atmValues.reduce((sum, v) => sum + v, 0) / atmValues.length;

            ctx.font = 'bold 28px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('📊 核心指标', 450, yPos);
            yPos += 40;
            
            ctx.font = '20px Arial';
            ctx.fillText(`最高波动率: ${maxATM.toFixed(2)}%`, 450, yPos);
            yPos += 30;
            ctx.fillText(`最低波动率: ${minATM.toFixed(2)}%`, 450, yPos);
            yPos += 30;
            ctx.fillText(`平均波动率: ${avgATM.toFixed(2)}%`, 450, yPos);
            yPos += 30;
          }
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

  // 生成海报图片（兼容原有调用）
  const generatePosterImage = async (): Promise<string> => {
    return generatePosterImageWithData(aiSummary);
  };

  // 发送到Telegram
  const sendToTelegram = async (imageData: string, chatId: string, botToken: string) => {
    try {
      console.log('[ATMVolTermStructure] 开始推送到Telegram');
      
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
          caption: `📊 BTC ATM波动率期限结构分析\n⏰ ${new Date().toLocaleString('zh-CN')}\n🤖 AI自动生成`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[ATMVolTermStructure] 成功推送到Telegram:', result);
      } else {
        const errorData = await response.json();
        console.error('[ATMVolTermStructure] Telegram推送失败:', errorData);
      }
    } catch (error) {
      console.error('[ATMVolTermStructure] Telegram推送错误:', error);
    }
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

  // OpenAI驱动的AI总结功能
  const handleAISummary = async () => {
    setIsAILoading(true);
    setShowAISummary(true);
    try {
      console.log('[ATMVolTermStructure] 开始AI分析，原始数据:', data);
      console.log('[ATMVolTermStructure] 数据长度:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log('[ATMVolTermStructure] 数据为空，显示错误');
        setAiSummary({ error: '暂无数据可供分析。' });
        return;
      }

      // 验证数据质量
      const validData = data.filter((item: any) => {
        const isValid = item && typeof item.atm === 'number' && !isNaN(item.atm) && 
                       typeof item.fwd === 'number' && !isNaN(item.fwd);
        if (!isValid) {
          console.log('[ATMVolTermStructure] 无效数据项:', item);
        }
        return isValid;
      });

      console.log('[ATMVolTermStructure] 有效数据项数量:', validData.length);
      console.log('[ATMVolTermStructure] 有效数据:', validData);

      if (validData.length < 2) {
        console.log('[ATMVolTermStructure] 有效数据点不足，显示错误');
        setAiSummary({ error: '数据点不足，至少需要2个有效数据点进行分析。' });
        return;
      }

      // 准备分析数据
      const atmValues = validData.map((item: any) => Number(item.atm));
      const fwdValues = validData.map((item: any) => Number(item.fwd));
      const terms = validData.map((item: any) => item.term);
      
      // 计算核心指标
      const maxATM = Math.max(...atmValues);
      const minATM = Math.min(...atmValues);
      const avgATM = atmValues.reduce((sum, v) => sum + v, 0) / atmValues.length;
      const shortTermATM = atmValues[0];
      const longTermATM = atmValues[atmValues.length - 1];
      const termSlope = longTermATM - shortTermATM;

      const analysisData = {
        symbol: 'BTC',
        date: selectedDate?.format('YYYY-MM-DD'),
        atmValues,
        fwdValues,
        terms,
        maxATM,
        minATM,
        avgATM,
        shortTermATM,
        longTermATM,
        termSlope,
        chartData: data.slice(0, 10) // 只发送前10个数据点避免token过多
      };

      // 调用OpenAI API
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          analysisType: 'atm_term_structure',
          prompt: `请分析BTC ATM波动率期限结构数据，提供专业的期权市场分析。数据包括：
          - 最高ATM波动率: ${maxATM.toFixed(2)}%
          - 最低ATM波动率: ${minATM.toFixed(2)}%
          - 平均ATM波动率: ${avgATM.toFixed(2)}%
          - 期限斜率: ${(termSlope > 0 ? '+' : '') + termSlope.toFixed(2)}%
          - 近期ATM: ${shortTermATM.toFixed(2)}%
          - 远期ATM: ${longTermATM.toFixed(2)}%
          
          请提供结构化的分析报告，包括核心统计指标、期限结构特征、市场情绪洞察和风险提示。`
        })
      });

      console.log('[ATMVolTermStructure] OpenAI API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ATMVolTermStructure] OpenAI API错误详情:', errorData);
        throw new Error(`AI分析请求失败: ${errorData.error || '未知错误'}`);
      }

      const result = await response.json();
      console.log('[ATMVolTermStructure] OpenAI API响应成功:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // 验证OpenAI返回的数据格式，确保有完整的summary
      console.log('[ATMVolTermStructure] OpenAI返回的原始数据:', result);
      
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
        
        console.log('[ATMVolTermStructure] 标准化后的summary:', validSummary);
        
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
      console.log('[ATMVolTermStructure] 回退到本地分析...');
      try {
        // 使用验证过的数据
        const validData = data.filter((item: any) => 
          item && typeof item.atm === 'number' && !isNaN(item.atm) && 
          typeof item.fwd === 'number' && !isNaN(item.fwd)
        );
        const atmValues = validData.map((item: any) => Number(item.atm));
        const terms = validData.map((item: any) => item.term);
        const maxATM = Math.max(...atmValues);
        const minATM = Math.min(...atmValues);
        const avgATM = atmValues.reduce((sum, v) => sum + v, 0) / atmValues.length;
        const stdATM = Math.sqrt(atmValues.reduce((sum, v) => sum + Math.pow(v - avgATM, 2), 0) / atmValues.length);
        const maxIdx = atmValues.findIndex(v => v === maxATM);
        const minIdx = atmValues.findIndex(v => v === minATM);
        const shortTermATM = atmValues[0];
        const longTermATM = atmValues[atmValues.length - 1];
        const termSlope = longTermATM - shortTermATM;
        const structureType = termSlope > 1 ? '正斜率（远期高于近期）' : termSlope < -1 ? '负斜率（远期低于近期）' : '平坦';
        const riskTip = Math.abs(termSlope) > 5 ? '期限结构陡峭，需警惕波动率回归风险' : '期限结构平稳，风险适中';

        const fallbackSummary = [
          {
            type: 'core',
            title: '核心统计指标',
            icon: 'stats',
            items: [
              {
                title: '最高波动率',
                value: maxATM.toFixed(2) + '%',
                valueColor: 'text-red-500',
                subTitle: terms[maxIdx],
                subValue: '',
              },
              {
                title: '最低波动率',
                value: minATM.toFixed(2) + '%',
                valueColor: 'text-green-600',
                subTitle: terms[minIdx],
                subValue: '',
              },
              {
                title: '平均波动率',
                value: avgATM.toFixed(2) + '%',
                valueColor: 'text-blue-600',
                subTitle: '标准差',
                subValue: stdATM.toFixed(2) + '%',
              },
            ],
          },
          {
            type: 'structure',
            title: '期限结构特征',
            icon: 'structure',
            items: [
              {
                title: '结构类型',
                value: structureType,
                valueColor: 'text-purple-500',
                subTitle: '',
                subValue: '',
              },
              {
                title: '斜率',
                value: (termSlope > 0 ? '+' : '') + termSlope.toFixed(2) + '%',
                valueColor: 'text-purple-500',
                subTitle: '近期ATM',
                subValue: shortTermATM.toFixed(2) + '%，远期ATM: ' + longTermATM.toFixed(2) + '%',
              },
            ],
          },
          {
            type: 'sentiment',
            title: '市场情绪洞察',
            icon: 'sentiment',
            items: [
              {
                title: '趋势分析',
                value: structureType === '正斜率（远期高于近期）' ? '上升趋势' : structureType === '负斜率（远期低于近期）' ? '下降趋势' : '平稳趋势',
                valueColor: 'text-yellow-600',
                subTitle: '期限结构',
                subValue: '',
              },
              {
                title: '市场情绪',
                value: structureType === '正斜率（远期高于近期）' ? '市场预期未来波动率上升' : structureType === '负斜率（远期低于近期）' ? '市场预期未来波动率下降' : '市场预期平稳',
                valueColor: 'text-yellow-600',
                subTitle: '情绪状态',
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
                title: '波动率风险',
                value: riskTip,
                valueColor: 'text-red-500',
                subTitle: '风险等级',
                subValue: Math.abs(termSlope) > 5 ? '高风险' : Math.abs(termSlope) > 2 ? '中风险' : '低风险',
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
                value: structureType === '正斜率（远期高于近期）' ? '考虑做多波动率策略' : structureType === '负斜率（远期低于近期）' ? '考虑做空波动率策略' : '保持中性策略',
                valueColor: 'text-emerald-600',
                subTitle: '基于期限结构',
                subValue: structureType === '正斜率（远期高于近期）' ? '远期波动率预期上升' : structureType === '负斜率（远期低于近期）' ? '远期波动率预期下降' : '波动率预期平稳',
              },
              {
                title: '仓位管理',
                value: Math.abs(termSlope) > 5 ? '增加对冲仓位' : Math.abs(termSlope) > 2 ? '适度对冲' : '正常仓位',
                valueColor: 'text-emerald-600',
                subTitle: '风险控制',
                subValue: Math.abs(termSlope) > 5 ? '建议50-70%对冲比例' : Math.abs(termSlope) > 2 ? '建议30-50%对冲比例' : '建议20-30%对冲比例',
              },
              {
                title: '时间窗口',
                value: '关注1-3个月到期',
                valueColor: 'text-emerald-600',
                subTitle: '最佳时机',
                subValue: '波动率曲线拐点',
              },
            ],
          },
        ];
        console.log('[ATMVolTermStructure] 本地分析结果:', fallbackSummary);
        setAiSummary(fallbackSummary);
      } catch (fallbackError) {
        console.error('本地分析也失败:', fallbackError);
        // 最后的备选方案：显示基本的错误信息和数据概览
        const basicSummary = [
          {
            type: 'core',
            title: '数据概览',
            icon: 'stats',
            items: [
              {
                title: '数据点数量',
                value: data ? data.length.toString() : '0',
                valueColor: 'text-blue-600',
                subTitle: '可用数据',
                subValue: '',
              },
              {
                title: '分析状态',
                value: '需要重试',
                valueColor: 'text-yellow-600',
                subTitle: 'AI服务暂时不可用',
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
                title: '趋势分析',
                value: '数据不足',
                valueColor: 'text-yellow-600',
                subTitle: '无法分析',
                subValue: '',
              },
              {
                title: '市场情绪',
                value: '需要更多数据',
                valueColor: 'text-yellow-600',
                subTitle: '情绪状态',
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
                title: '波动率风险',
                value: '数据不足，无法评估',
                valueColor: 'text-red-500',
                subTitle: '风险等级',
                subValue: '未知',
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
                value: '数据不足，无法给出建议',
                valueColor: 'text-emerald-600',
                subTitle: '基于期限结构',
                subValue: '需要更多数据',
              },
              {
                title: '仓位管理',
                value: '建议谨慎操作',
                valueColor: 'text-emerald-600',
                subTitle: '风险控制',
                subValue: '等待数据更新',
              },
              {
                title: '时间窗口',
                value: '暂无法确定',
                valueColor: 'text-emerald-600',
                subTitle: '最佳时机',
                subValue: '数据不足',
              },
            ],
          },
        ];
        setAiSummary(basicSummary);
      }
    } finally {
      setIsAILoading(false);
    }
  };

  // 图表内容
  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
        <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[20, 50]} unit="%" interval={0} tickCount={7} ticks={[20,25,30,35,40,45,50]} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#6F767E" strokeDasharray="3 3" strokeWidth={1} />
        <RechartsLegend
          iconType="plainline"
          wrapperStyle={{ fontSize: 12 }}
          content={() => <CustomLegend visible={visible} onClick={handleLegendClick} />}
        />
        {visible.atm && (
          <Line type="monotone" dataKey="atm" name="ATM IV" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4, stroke: '#a78bfa', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
        )}
        {visible.fwd && (
          <Line type="monotone" dataKey="fwd" name="FWD IV" stroke="#34d399" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, stroke: '#34d399', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  // 全屏视图
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {/* 全屏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ATM波动率期限结构 - 全屏视图</h2>
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
        {/* AI总结模态框 */}
        {showAISummary && (
          <AISummaryModal
            isLoading={isAILoading}
            summary={aiSummary}
            onClose={() => setShowAISummary(false)}
            title="AI ATM期限结构分析总结"
            symbol="BTC ATM波动率期限结构"
          />
        )}
      </div>
    );
  }

  return (
    <Card title="ATM波动率期限结构" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM-DD"
              slots={{ openPickerIcon: CalendarMonthIcon }}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    bgcolor: theme => theme.palette.mode === 'dark' ? '#23272b' : 'background.paper',
                    borderRadius: 2,
                    fontSize: 14,
                    height: 36,
                    minWidth: 160,
                    maxWidth: 180,
                    boxShadow: 2,
                    border: 'none',
                    outline: 'none',
                    '& .MuiOutlinedInput-root': {
                      border: 'none !important',
                      outline: 'none !important',
                      boxShadow: 2,
                      '&.Mui-focused': {
                        border: 'none !important',
                        outline: 'none !important',
                        boxShadow: 2,
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none !important',
                    },
                    '& input': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                    },
                    '&:hover': {
                      border: 'none',
                      outline: 'none',
                    },
                    '&.Mui-focused': {
                      border: 'none',
                      outline: 'none',
                    },
                    '& .MuiSvgIcon-root': {
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#23272b',
                    },
                  },
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#23272b' : '#fff',
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#23272b',
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
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
      <div className="h-64">
        {loading && !data.length ? (
          <div className="flex items-center justify-center h-full text-theme-secondary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              加载中...
            </div>
          </div>
        ) : (
          chartContent
        )}
      </div>
      {/* AI总结模态框 */}
      {showAISummary && (
        <AISummaryModal
          isLoading={isAILoading}
          summary={aiSummary}
          onClose={() => setShowAISummary(false)}
          title="AI ATM期限结构分析总结"
          symbol="BTC ATM波动率期限结构"
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

export default ATMVolTermStructure; 