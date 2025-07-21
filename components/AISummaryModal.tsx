import React, { useState, useEffect } from 'react';

export interface AISummaryModalProps {
  isLoading: boolean;
  summary: any;
  onClose: () => void;
  title?: string;
  symbol?: string;
}

const iconConfig: Record<string, { icon: JSX.Element, gradient: string, bgGradient: string }> = {
  stats: {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-blue-500/90 to-blue-600/90',
    bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
  },
  structure: {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-purple-500/90 to-purple-600/90',
    bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
  },
  sentiment: {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: 'from-orange-500/90 to-orange-600/90',
    bgGradient: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
  },
  risk: {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    gradient: 'from-red-500/90 to-red-600/90',
    bgGradient: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
  },
  advice: {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-emerald-500/90 to-emerald-600/90',
    bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20'
  },
  arbitrage: {
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-cyan-500/90 to-cyan-600/90',
    bgGradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20'
  },
};

// 数值动画组件
const AnimatedValue = ({ value, className }: { value: string | number, className: string }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    
    if (isNaN(numericValue)) {
      setDisplayValue(value.toString());
      return;
    }

    const startValue = 0;
    const endValue = numericValue;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = startValue + (endValue - startValue) * progress;
      
      if (typeof value === 'number') {
        setDisplayValue(currentValue.toFixed(2));
      } else {
        // 对于包含非数字字符的值，保持原格式
        setDisplayValue(value.toString());
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [value]);

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {displayValue}
    </span>
  );
};

const AISummaryModal: React.FC<AISummaryModalProps> = ({ isLoading, summary, onClose, title, symbol }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {/* 头部 */}
        <div className="relative bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] p-8 overflow-hidden">
          {/* 装饰性背景元素 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{title || 'AI 分析总结'}</h3>
                {symbol && <p className="text-white/90 text-sm mt-1 font-medium">基于{symbol}数据智能分析</p>}
              </div>
            </div>
            <button 
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl hover:scale-110"
              onClick={onClose}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className={`p-8 ${isLoading ? 'flex items-center justify-center min-h-[400px]' : 'overflow-y-auto max-h-[60vh]'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="text-center max-w-md">
                {/* 灯泡图标和装饰性动画 */}
                <div className="relative flex items-center justify-center mb-10">
                  {/* 灯泡图标 */}
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl ai-pulse flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
                    <svg className="w-8 h-8 text-white ai-bounce-delayed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  {/* 装饰性圆点 */}
                  <div className="absolute -top-3 -right-3 w-5 h-5 bg-yellow-400 rounded-full animate-ping shadow-lg"></div>
                  <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-purple-400 rounded-full animate-ping shadow-lg" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute top-1/2 -right-8 w-3 h-3 bg-blue-400 rounded-full animate-ping shadow-lg" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 -left-8 w-3 h-3 bg-green-400 rounded-full animate-ping shadow-lg" style={{animationDelay: '1.5s'}}></div>
                </div>
                {/* 加载文本 */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">AI正在分析数据</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                    正在深度分析数据，生成专业分析报告...
                  </p>
                  {/* 进度指示器 */}
                  <div className="flex items-center justify-center space-x-3 mt-8">
                    <div className="w-4 h-4 bg-blue-400 rounded-full ai-bounce-delayed shadow-lg"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full ai-bounce-delayed shadow-lg" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded-full ai-bounce-delayed shadow-lg" style={{animationDelay: '0.4s'}}></div>
                    <div className="w-4 h-4 bg-purple-400 rounded-full ai-bounce-delayed shadow-lg" style={{animationDelay: '0.6s'}}></div>
                    <div className="w-4 h-4 bg-red-400 rounded-full ai-bounce-delayed shadow-lg" style={{animationDelay: '0.8s'}}></div>
                  </div>
                  {/* 分析步骤提示 */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                        <span className="font-medium">数据验证与预处理</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                        <span className="font-medium">统计分析与模式识别</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                        <span className="font-medium">市场情绪与风险评估</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                        <span className="font-medium">生成专业分析报告</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 w-full">
              {summary?.error ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-lg font-medium">{summary.error}</div>
                </div>
              ) : !summary || !Array.isArray(summary) || summary.length === 0 ? (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-orange-200/80 to-orange-300/90 rounded-2xl p-8 border border-white/30 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white">市场情绪洞察</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 flex flex-col items-start justify-center min-h-[100px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="text-sm text-gray-600 mb-2 font-medium">趋势分析</div>
                        <div className="text-2xl font-bold text-yellow-600 mb-2">数据加载中</div>
                        <div className="text-sm text-gray-500">正在分析</div>
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 flex flex-col items-start justify-center min-h-[100px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="text-sm text-gray-600 mb-2 font-medium">市场情绪</div>
                        <div className="text-2xl font-bold text-yellow-600 mb-2">待分析</div>
                        <div className="text-sm text-gray-500">情绪状态</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-300/80 to-red-400/90 rounded-2xl p-8 border border-white/30 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white">风险提示</h4>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="text-sm text-gray-600 mb-2 font-medium">波动率风险</div>
                      <div className="text-2xl font-bold text-red-500 mb-2">分析中</div>
                      <div className="text-sm text-gray-500">风险等级: 待评估</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-300/80 to-emerald-400/90 rounded-2xl p-8 border border-white/30 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-white">AI操作建议</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 flex flex-col items-start justify-center min-h-[100px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="text-sm text-gray-600 mb-2 font-medium">策略建议</div>
                        <div className="text-2xl font-bold text-emerald-600 mb-2">分析中</div>
                        <div className="text-sm text-gray-500">基于期限结构</div>
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 flex flex-col items-start justify-center min-h-[100px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="text-sm text-gray-600 mb-2 font-medium">仓位管理</div>
                        <div className="text-2xl font-bold text-emerald-600 mb-2">分析中</div>
                        <div className="text-sm text-gray-500">风险控制</div>
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 flex flex-col items-start justify-center min-h-[100px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="text-sm text-gray-600 mb-2 font-medium">时间窗口</div>
                        <div className="text-2xl font-bold text-emerald-600 mb-2">分析中</div>
                        <div className="text-sm text-gray-500">最佳时机</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                summary.map((block: any, idx: number) => {
                  const safeBlock = {
                    type: block?.type || 'unknown',
                    title: block?.title || '未知分析',
                    icon: block?.icon || 'stats',
                    items: Array.isArray(block?.items) ? block.items : []
                  };
                  
                  if (!safeBlock.items || safeBlock.items.length === 0) {
                    return (
                      <div key={idx} className={`bg-gradient-to-r ${iconConfig[safeBlock.icon]?.gradient || 'from-gray-300/80 to-gray-400/90'} rounded-2xl p-8 border border-white/30 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg">
                            {iconConfig[safeBlock.icon]?.icon}
                          </div>
                          <h4 className="text-xl font-bold text-white">{safeBlock.title}</h4>
                        </div>
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                          <div className="text-gray-500 text-base text-center">暂无分析数据</div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={idx} className={`bg-gradient-to-r ${iconConfig[safeBlock.icon]?.gradient || 'from-gray-300/80 to-gray-400/90'} rounded-2xl p-8 border border-white/30 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {iconConfig[safeBlock.icon]?.icon}
                        </div>
                        <h4 className="text-xl font-bold text-white">{safeBlock.title}</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {safeBlock.items.length === 0 ? (
                          <div className="col-span-full bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-lg">
                            <div className="text-gray-500 text-base text-center">暂无分析数据</div>
                          </div>
                        ) : (
                          safeBlock.items.map((item: any, i: number) => {
                            const safeItem = {
                              title: item?.title || '未知指标',
                              value: item?.value || 'N/A',
                              valueColor: item?.valueColor || 'text-gray-600',
                              subTitle: item?.subTitle || '',
                              subValue: item?.subValue || ''
                            };
                            
                            return (
                              <div key={i} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/40 flex flex-col items-start justify-center min-h-[100px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/item">
                                <div className="text-sm text-gray-600 mb-2 font-medium group-hover/item:text-gray-800 transition-colors">{safeItem.title}</div>
                                <div className={`text-2xl font-bold ${safeItem.valueColor} mb-2`}>
                                  {typeof safeItem.value === 'number' || !isNaN(parseFloat(safeItem.value.toString())) ? (
                                    <AnimatedValue value={safeItem.value} className={safeItem.valueColor} />
                                  ) : (
                                    safeItem.value
                                  )}
                                </div>
                                {safeItem.subTitle && (
                                  <div className="text-sm text-gray-500 group-hover/item:text-gray-600 transition-colors">
                                    {safeItem.subTitle}
                                    {safeItem.subValue && <span className="ml-1">{safeItem.subValue}</span>}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        
        {/* 底部按钮 */}
        <div className="flex justify-end p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button 
            className="px-8 py-3 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-xl hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 transform"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal; 