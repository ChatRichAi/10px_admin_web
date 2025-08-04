import React, { useState, useEffect } from 'react';

// AI加载动画组件
export const AILoadingAnimation = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      {/* AI大脑动画 */}
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        {/* 旋转的粒子效果 */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">{message}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">AI正在深度分析市场数据...</p>
      
      {/* 分析步骤指示器 */}
      <div className="flex justify-center gap-2 mt-4">
        {['数据收集', '模式识别', '趋势分析', '风险评估', '生成报告'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${index < 3 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
            {index < 4 && <div className="w-4 h-0.5 bg-gray-300 mx-1"></div>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 市场情绪指示器动画
export const MarketSentimentIndicator = ({ pcr, isVisible }: { pcr: number, isVisible: boolean }) => {
  const [animatedPCR, setAnimatedPCR] = useState(0);
  
  useEffect(() => {
    if (isVisible) {
      const duration = 1500;
      const steps = 60;
      const stepDuration = duration / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        setAnimatedPCR(pcr * progress);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedPCR(pcr);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [isVisible, pcr]);
  
  const getSentimentColor = (pcr: number) => {
    if (pcr < 0.7) return 'text-green-500';
    if (pcr > 1.2) return 'text-red-500';
    return 'text-yellow-500';
  };
  
  const getSentimentText = (pcr: number) => {
    if (pcr < 0.7) return '看涨主导';
    if (pcr > 1.2) return '看跌主导';
    return '多空平衡';
  };
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-theme-secondary relative group cursor-help">
        PCR:
        <span className="text-xs text-theme-tertiary ml-1">ⓘ</span>
        {/* PCR悬浮提示 */}
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
          <div className="font-medium mb-1">Put/Call Ratio (PCR)</div>
          <div className="space-y-1">
            <div>• <span className="text-green-400">PCR &lt; 0.7</span>: 看涨情绪强烈</div>
            <div>• <span className="text-yellow-400">0.7 ≤ PCR ≤ 1.2</span>: 市场平衡</div>
            <div>• <span className="text-red-400">PCR &gt; 1.2</span>: 看跌情绪强烈</div>
          </div>
          <div className="mt-2 text-gray-300">
            当前PCR: {animatedPCR.toFixed(2)} - {getSentimentText(animatedPCR)}
          </div>
          {/* 小三角 */}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      </span>
      <span className={`font-semibold text-theme-primary transition-all duration-500 ${getSentimentColor(animatedPCR)}`}>
        {animatedPCR.toFixed(2)}
      </span>
      {/* 情绪指示器动画 */}
      <div className={`w-3 h-3 rounded-full transition-all duration-500 ${getSentimentColor(animatedPCR).replace('text-', 'bg-')} animate-pulse`}></div>
    </div>
  );
};

// 数据可视化动画组件
export const DataVisualizationAnimation = ({ data, isVisible }: { data: any[], isVisible: boolean }) => {
  const [animatedData, setAnimatedData] = useState(data.map(d => ({ ...d, calls: 0, puts: 0 })));
  
  useEffect(() => {
    if (isVisible && data.length > 0) {
      const duration = 2000; // 2秒动画
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedData(data.map(d => ({
          ...d,
          calls: Math.floor(d.calls * progress),
          puts: Math.floor(d.puts * progress)
        })));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedData(data);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [isVisible, data]);
  
  return animatedData;
};

// AI分析结果动画组件
export const AIAnalysisResultAnimation = ({ summary, isVisible }: { summary: any[], isVisible: boolean }) => {
  const [visibleSections, setVisibleSections] = useState<number[]>([]);
  
  useEffect(() => {
    if (isVisible && summary.length > 0) {
      summary.forEach((_, index) => {
        setTimeout(() => {
          setVisibleSections(prev => [...prev, index]);
        }, index * 300); // 每个部分延迟300ms显示
      });
    }
  }, [isVisible, summary]);
  
  return { visibleSections };
};

// AI分析结果展示组件
export const AIAnalysisResult = ({ summary, isVisible }: { summary: any[], isVisible: boolean }) => {
  const { visibleSections } = AIAnalysisResultAnimation({ summary, isVisible });
  
  return (
    <div className="space-y-6">
      {summary.map((section, sectionIndex) => (
        <div 
          key={sectionIndex}
          className={`transition-all duration-500 transform ${
            visibleSections.includes(sectionIndex) 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: `${sectionIndex * 100}ms` }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{section.title}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.title}</p>
                  <p className={`text-lg font-bold ${item.valueColor || 'text-gray-900 dark:text-white'}`}>
                    {item.value}
                  </p>
                  {item.subTitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.subTitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// AI按钮组件
export const AIButton = ({ 
  onClick, 
  isLoading, 
  children 
}: { 
  onClick: () => void, 
  isLoading: boolean, 
  children: React.ReactNode 
}) => (
  <button 
    className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] text-white rounded-md hover:from-[#0B58D9] hover:to-[#A5D4BA] transition-all duration-200 disabled:opacity-50"
    title="AI总结"
    onClick={onClick}
    disabled={isLoading}
  >
    {isLoading ? (
      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
    ) : (
      children
    )}
  </button>
); 