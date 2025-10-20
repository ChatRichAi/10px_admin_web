"use client";

import Layout from "@/components/Layout";
import LazyChartWrapper from "@/components/LazyChartWrapper";
import TotalBalance from "./TotalBalance";
import BestToBuy from "./BestToBuy";
import TradeDataForm from "./TradeDataForm";
import { SymbolProvider, useSymbolContext } from '@/components/contexts/SymbolContext';
import OrderBookDepth from "./OrderBookDepth";
import ATMVolTermStructure from "./ATMVolTermStructure";
import VolSurface from "./VolSurface";
import VolSmile from "./VolSmile";
import TermStructure from "./TermStructure";
import IVvsRV from "./IVvsRV";
import VolCone from "./VolCone";
import IV7dMomentum from "./IV7dMomentum";
import HistoricalIVFixedExpiry from "./HistoricalIVFixedExpiry";
import VolumeByStrike from "./VolumeByStrike";
import OptionVolumeRatio from "./OptionVolumeRatio";
import OptionOpenInterest from "./OptionOpenInterest";
import GammaDistribution from "./GammaDistribution";
import AddChart, { AddChartRef } from "./AddChart";
import AddButton from "./AddButton";
import { useState, useRef } from 'react';

const MODULES = [
  { key: 'TotalBalance', label: '总资产', Comp: TotalBalance },
  { key: 'BestToBuy', label: '最佳买入', Comp: BestToBuy },
  { key: 'ATMVolTermStructure', label: 'ATM波动率期限结构', Comp: ATMVolTermStructure },
  { key: 'VolSurface', label: '模型波动率平面', Comp: VolSurface },
  { key: 'VolSmile', label: '模型波动率微笑', Comp: VolSmile },
  { key: 'TermStructure', label: '期限结构', Comp: TermStructure },
  { key: 'IVvsRV', label: 'IV vs RV', Comp: IVvsRV },
  { key: 'VolCone', label: '波动率锥体', Comp: VolCone },
  { key: 'IV7dMomentum', label: 'IV 7d动量', Comp: IV7dMomentum },
  { key: 'HistoricalIVFixedExpiry', label: '历史IV(固定到期)', Comp: HistoricalIVFixedExpiry },
  { key: 'VolumeByStrike', label: '分行权价成交量', Comp: VolumeByStrike },
  { key: 'OptionOpenInterest', label: '期权未平仓', Comp: OptionOpenInterest },
  { key: 'GammaDistribution', label: 'Gamma分布', Comp: GammaDistribution },
];

const HandicapPageContent = () => {
    const { symbol } = useSymbolContext();
    const addChartRef = useRef<AddChartRef>(null);
  
  // 初始加载全部模块，每个模块类型都显示2个实例
  const initialModules = [
    { id: '1', key: 'TotalBalance', label: '总资产' },
    { id: '2', key: 'BestToBuy', label: '最佳买入' },
    { id: '3', key: 'ATMVolTermStructure', label: 'ATM波动率期限结构' },
    { id: '4', key: 'ATMVolTermStructure', label: 'ATM波动率期限结构' },
    { id: '5', key: 'VolSurface', label: '模型波动率平面' },
    { id: '6', key: 'VolSurface', label: '模型波动率平面' },
    { id: '7', key: 'VolSmile', label: '模型波动率微笑' },
    { id: '8', key: 'VolSmile', label: '模型波动率微笑' },
    { id: '9', key: 'TermStructure', label: '期限结构' },
    { id: '10', key: 'TermStructure', label: '期限结构' },
    { id: '11', key: 'IVvsRV', label: 'IV vs RV' },
    { id: '12', key: 'IVvsRV', label: 'IV vs RV' },
    { id: '13', key: 'VolCone', label: '波动率锥体' },
    { id: '14', key: 'VolCone', label: '波动率锥体' },
    { id: '15', key: 'IV7dMomentum', label: 'IV 7d动量' },
    { id: '16', key: 'IV7dMomentum', label: 'IV 7d动量' },
    { id: '17', key: 'HistoricalIVFixedExpiry', label: '历史IV(固定到期)' },
    { id: '18', key: 'HistoricalIVFixedExpiry', label: '历史IV(固定到期)' },
    { id: '19', key: 'VolumeByStrike', label: '分行权价成交量' },
    { id: '20', key: 'VolumeByStrike', label: '分行权价成交量' },
    { id: '21', key: 'OptionOpenInterest', label: '期权未平仓' },
    { id: '22', key: 'OptionOpenInterest', label: '期权未平仓' },
    { id: '23', key: 'GammaDistribution', label: 'Gamma分布' },
    { id: '24', key: 'GammaDistribution', label: 'Gamma分布' },
  ];

  // 可选模块列表，按优先级排序
  const availableModules = MODULES
    .filter(m => m.key !== 'TotalBalance' && m.key !== 'BestToBuy')
    .map((m, idx) => ({ id: `${m.key}-1`, key: m.key, label: m.label }));
  const [modules, setModules] = useState(initialModules);
  const [nextId, setNextId] = useState(initialModules.length + 1); // 下一个可用ID (25)

  // 删除模块
  const handleRemove = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  // 添加模块 - 允许重复添加
  const handleAdd = (key: string) => {
    const moduleInfo = MODULES.find(m => m.key === key);
    if (moduleInfo) {
      const newModule = {
        id: nextId.toString(),
        key: key,
        label: moduleInfo.label
      };
      setModules([...modules, newModule]);
      setNextId(nextId + 1);
    }
  };



    return (
    <Layout title="数据实验室🧪">
            <div className="space-y-2">
        {/* 固定的第一行：Volatility + DeMark */}
        <div className="relative group">
          <div className="mt-3">
            <div className="flex lg:block gap-2 rounded-2xl overflow-hidden">
              <TotalBalance symbol={symbol} className="flex-1 min-w-0" />
                    <BestToBuy symbol={symbol} />
            </div>
          </div>
        </div>

        {/* 动态模块：按类型分组，相同类型模块横向排列 */}
        <div className="space-y-2">
          {(() => {
            // 按模块类型分组
            const groupedModules: { [key: string]: any[] } = {};
            modules.forEach(module => {
              if (module.key !== 'TotalBalance' && module.key !== 'BestToBuy') {
                if (!groupedModules[module.key]) {
                  groupedModules[module.key] = [];
                }
                groupedModules[module.key].push(module);
              }
            });

            // 渲染分组后的模块
            return Object.entries(groupedModules).map(([key, moduleGroup], index) => {
              const mod = MODULES.find(m => m.key === key);
              if (!mod) return null;
              const Comp = mod.Comp;

              // 如果只有一个模块，直接渲染
              if (moduleGroup.length === 1) {
                const module = moduleGroup[0];
                return (
                  <LazyChartWrapper key={module.id} className="relative group">
                    {/* 删除按钮 */}
                    <button
                      className="absolute right-1 top-1 z-10 w-6 h-6 bg-theme-on-surface-1 dark:bg-gray-800 hover:bg-theme-on-surface-2 dark:hover:bg-gray-700 text-theme-secondary dark:text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md flex items-center justify-center border border-theme-stroke dark:border-gray-600"
                      onClick={() => handleRemove(module.id)}
                      title="删除此图表"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* 模块内容 */}
                    <div className="mt-3">
                      <Comp symbol={symbol} className="min-w-0" />
                    </div>
                  </LazyChartWrapper>
                );
              }

              // 如果有多个相同类型的模块，在同一行显示（最多2个）
              return (
                <div key={key} className="flex gap-2">
                  {moduleGroup.slice(0, 2).map((module) => (
                    <LazyChartWrapper key={module.id} className="relative group flex-1 min-w-0">
                      {/* 删除按钮 */}
                      <button
                        className="absolute right-1 top-1 z-10 w-6 h-6 bg-theme-on-surface-1 dark:bg-gray-800 hover:bg-theme-on-surface-2 dark:hover:bg-gray-700 text-theme-secondary dark:text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md flex items-center justify-center border border-theme-stroke dark:border-gray-600"
                        onClick={() => handleRemove(module.id)}
                        title="删除此图表"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* 模块内容 */}
                      <div className="mt-3">
                        <Comp symbol={symbol} className="min-w-0" />
                      </div>
                    </LazyChartWrapper>
                  ))}
                  {/* 如果超过2个相同类型模块，其余模块换行显示 */}
                  {moduleGroup.length > 2 && (
                    <div className="flex gap-2 w-full">
                      {moduleGroup.slice(2).map((module) => (
                        <LazyChartWrapper key={module.id} className="relative group flex-1 min-w-0">
                          {/* 删除按钮 */}
                          <button
                            className="absolute right-1 top-1 z-10 w-6 h-6 bg-theme-on-surface-1 dark:bg-gray-800 hover:bg-theme-on-surface-2 dark:hover:bg-gray-700 text-theme-secondary dark:text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-md flex items-center justify-center border border-theme-stroke dark:border-gray-600"
                            onClick={() => handleRemove(module.id)}
                            title="删除此图表"
                          >
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {/* 模块内容 */}
                          <div className="mt-3">
                            <Comp symbol={symbol} className="min-w-0" />
                          </div>
                        </LazyChartWrapper>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
        
        {/* 添加图表卡片 */}
        <div className="mt-6">
          <AddChart ref={addChartRef} onAddChart={handleAdd} />
        </div>
      </div>
      


      {/* 悬浮创建图表按钮 */}
      <AddButton onClick={() => {
        addChartRef.current?.openModal();
      }} />
        </Layout>
    );
};

const HandicapPage = () => (
    <SymbolProvider>
        <HandicapPageContent />
    </SymbolProvider>
);

export default HandicapPage;