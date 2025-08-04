'use client';

import React, { useState } from 'react';
import { 
  AILoadingAnimation, 
  MarketSentimentIndicator, 
  AIButton,
  AIAnalysisResult 
} from "@/components/AIAnimation";

const AIAnimationDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pcr, setPcr] = useState(1.2);

  const mockAnalysisData = [
    {
      type: 'stats',
      title: '核心数据指标',
      icon: 'stats',
      items: [
        {
          title: '总Call持仓量',
          value: '1,234,567',
          valueColor: 'text-green-600',
          subTitle: '看涨期权总持仓量',
          subValue: ''
        },
        {
          title: '总Put持仓量',
          value: '987,654',
          valueColor: 'text-blue-600',
          subTitle: '看跌期权总持仓量',
          subValue: ''
        },
        {
          title: '整体PCR',
          value: '0.80',
          valueColor: 'text-yellow-500',
          subTitle: '多空平衡',
          subValue: ''
        }
      ]
    },
    {
      type: 'sentiment',
      title: '市场情绪分析',
      icon: 'sentiment',
      items: [
        {
          title: '看涨到期日',
          value: '5个',
          valueColor: 'text-green-600',
          subTitle: 'PCR < 0.7',
          subValue: ''
        },
        {
          title: '看跌到期日',
          value: '3个',
          valueColor: 'text-red-600',
          subTitle: 'PCR > 1.2',
          subValue: ''
        },
        {
          title: '平衡到期日',
          value: '7个',
          valueColor: 'text-yellow-600',
          subTitle: '多空相对平衡',
          subValue: ''
        }
      ]
    }
  ];

  const handleStartAnalysis = () => {
    setIsLoading(true);
    setShowResults(false);
    
    // 模拟AI分析过程
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI动画功能演示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            展示期权持仓量分析页面的AI动画效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：动画演示 */}
          <div className="space-y-8">
            {/* AI加载动画演示 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI加载动画
              </h2>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {isLoading ? (
                  <AILoadingAnimation message="AI正在分析数据..." />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      点击下方按钮开始AI分析
                    </p>
                    <AIButton onClick={handleStartAnalysis} isLoading={isLoading}>
                      开始AI分析
                    </AIButton>
                  </div>
                )}
              </div>
            </div>

            {/* 市场情绪指示器演示 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                市场情绪指示器
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">PCR值调节：</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={pcr}
                    onChange={(e) => setPcr(parseFloat(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">{pcr.toFixed(1)}</span>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <MarketSentimentIndicator pcr={pcr} isVisible={true} />
                </div>
              </div>
            </div>

            {/* AI按钮演示 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI按钮组件
              </h2>
              <div className="flex flex-wrap gap-4">
                <AIButton onClick={() => {}} isLoading={false}>
                  正常状态
                </AIButton>
                <AIButton onClick={() => {}} isLoading={true}>
                  加载状态
                </AIButton>
              </div>
            </div>
          </div>

          {/* 右侧：AI分析结果演示 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              AI分析结果展示
            </h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {showResults ? (
                <AIAnalysisResult summary={mockAnalysisData} isVisible={showResults} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">
                    完成AI分析后将显示结果
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            功能特性说明
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎨 视觉动画
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 旋转的AI大脑图标</li>
                <li>• 粒子效果动画</li>
                <li>• 进度条动画</li>
                <li>• 平滑过渡效果</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📊 数据可视化
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 实时PCR数值动画</li>
                <li>• 市场情绪指示器</li>
                <li>• 渐进式数据加载</li>
                <li>• 动态颜色变化</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🤖 AI交互
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 智能分析按钮</li>
                <li>• 加载状态反馈</li>
                <li>• 结果展示动画</li>
                <li>• 用户友好提示</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 技术实现 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            技术实现
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                前端技术栈
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• React 18 + TypeScript</li>
                <li>• Tailwind CSS 动画</li>
                <li>• React Hooks</li>
                <li>• 组件化设计</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                动画技术
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• CSS Transform</li>
                <li>• setInterval 平滑过渡</li>
                <li>• 状态管理动画</li>
                <li>• 性能优化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnimationDemo; 