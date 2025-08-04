import React, { useState, useImperativeHandle, forwardRef } from 'react';
import Card from "@/components/Card";

const MODULES = [
  { key: 'ATMVolTermStructure', label: 'ATM波动率期限结构' },
  { key: 'VolSurface', label: '模型波动率平面' },
  { key: 'VolSmile', label: '模型波动率微笑' },
  { key: 'TermStructure', label: '期限结构' },
  { key: 'IVvsRV', label: 'IV vs RV' },
  { key: 'VolCone', label: '波动率锥体' },
  { key: 'IV7dMomentum', label: 'IV 7d动量' },
  { key: 'HistoricalIVFixedExpiry', label: '历史IV(固定到期)' },
  { key: 'VolumeByStrike', label: '分行权价成交量' },
  { key: 'OptionOpenInterest', label: '期权未平仓' },
  { key: 'GammaDistribution', label: 'Gamma分布' },
];

interface AddChartProps {
  onAddChart: (key: string) => void;
  className?: string;
}

export interface AddChartRef {
  openModal: () => void;
}

const AddChart = forwardRef<AddChartRef, AddChartProps>(({ onAddChart, className }, ref) => {
  const [showAdd, setShowAdd] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal: () => setShowAdd(true)
  }));

  const handleAdd = (key: string) => {
    onAddChart(key);
    setShowAdd(false);
  };

  return (
    <>
      {/* 添加图表卡片 */}
      <Card title="创建图表" className={className}>
        <div
          className="flex flex-col items-center justify-center h-64 bg-theme-on-surface-1 dark:bg-[#181C23] rounded-2xl cursor-pointer hover:bg-theme-on-surface-2 dark:hover:bg-[#23272b] transition-colors border border-theme-stroke dark:border-gray-700"
          onClick={() => setShowAdd(true)}
        >
          <div className="text-5xl text-theme-secondary dark:text-[#3b4252] mb-2">+</div>
          <div className="text-lg font-semibold text-theme-primary dark:text-white mb-1">创建图表</div>
          <div className="text-sm text-theme-secondary dark:text-gray-400 text-center">
            隐含波动率，历史波动率，成交量，未平仓量，Delta，Gamma，Vega，Theta
          </div>
        </div>
      </Card>
      
      {/* 添加图表弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-theme-on-surface-1 dark:bg-[#23272b] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-lg lg:max-w-2xl shadow-2xl border border-theme-stroke dark:border-gray-700 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 w-8 h-8 sm:w-10 sm:h-10 bg-theme-stroke dark:bg-gray-700 hover:bg-theme-on-surface-2 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary dark:text-white group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 标题区域 */}
            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-theme-primary dark:text-white mb-1 sm:mb-2">添加图表</h2>
              <p className="text-theme-secondary dark:text-gray-400 text-xs sm:text-sm">选择要添加的数据可视化模块</p>
            </div>

            {/* 模块数量信息 */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-[#0C68E9]/10 to-[#B5E4CA]/10 border border-[#0C68E9]/20 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] rounded-full"></div>
                  <span className="text-sm sm:text-base font-medium text-theme-primary dark:text-white">
                    已选择 <span className="text-[#0C68E9] dark:text-[#B5E4CA] font-bold">{MODULES.length}</span> 个模块
                  </span>
                  <div className="w-2 h-2 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* 模块选择网格 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
              {MODULES.map(m => (
                <button
                  key={m.key}
                  className="group bg-theme-on-surface-2 dark:bg-[#181C23] hover:bg-gradient-to-r hover:from-[#0C68E9]/10 hover:to-[#B5E4CA]/10 text-theme-primary dark:text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 flex flex-col items-center border border-theme-stroke dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => handleAdd(m.key)}
                >
                  {/* 模块图标 */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#0C68E9]/20 to-[#B5E4CA]/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:from-[#0C68E9]/30 group-hover:to-[#B5E4CA]/30 transition-all duration-300">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#0C68E9] dark:text-[#B5E4CA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  {/* 模块名称 */}
                  <div className="text-xs sm:text-sm font-semibold text-center leading-tight">{m.label}</div>
                  {/* 悬停指示器 */}
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-[#0C68E9] to-[#B5E4CA] rounded-full mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>

            {/* 底部按钮区域 */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button 
                className="py-2.5 sm:py-3 px-4 sm:px-6 bg-theme-stroke dark:bg-gray-700 text-theme-primary dark:text-white hover:bg-theme-on-surface-2 dark:hover:bg-gray-600 transition-all duration-200 rounded-lg sm:rounded-xl font-medium hover:shadow-md text-sm sm:text-base"
                onClick={() => setShowAdd(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default AddChart; 