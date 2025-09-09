'use client'

import React from 'react'
import Icon from '../Icon'

interface MarketOverviewData {
  totalLimitUp: number
  firstBoard: number
  consecutiveBoard: number
  consecutiveRate: number
}

interface Props {
  data: MarketOverviewData
}

const MarketOverview: React.FC<Props> = ({ data }) => {
  const overviewItems = [
    {
      title: '总涨停数',
      value: data.totalLimitUp,
      unit: '只',
      icon: 'trending-up',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: '首板数量',
      value: data.firstBoard,
      unit: '只',
      icon: 'zap',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: '连板数量',
      value: data.consecutiveBoard,
      unit: '只',
      icon: 'layers',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
    {
      title: '连板率',
      value: data.consecutiveRate,
      unit: '%',
      icon: 'percent',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 市场情绪概览和分析 - 同行排列 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 市场情绪概览 */}
        <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="bar-chart" className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-theme-primary">市场情绪概览</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {overviewItems.map((item, index) => (
              <div 
                key={index}
                className={`${item.bgColor} rounded-xl p-4 border border-theme-stroke hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon name={item.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${item.textColor}`}>
                      {item.value}
                    </div>
                    <div className="text-xs text-theme-secondary">
                      {item.unit}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${item.textColor}`}>
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 市场情绪分析 */}
        <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Icon name="activity" className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-theme-primary">市场情绪分析</h3>
          </div>
          
          <div className="space-y-6">
            {/* 涨停分布 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-theme-primary">涨停分布</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 px-4 bg-theme-on-surface-2 rounded-xl">
                  <span className="text-theme-secondary">首板占比</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-theme-on-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"
                        style={{ width: `${(data.firstBoard / data.totalLimitUp) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-theme-primary font-semibold text-sm">
                      {((data.firstBoard / data.totalLimitUp) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-theme-on-surface-2 rounded-xl">
                  <span className="text-theme-secondary">连板占比</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-theme-on-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                        style={{ width: `${(data.consecutiveBoard / data.totalLimitUp) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-theme-primary font-semibold text-sm">
                      {((data.consecutiveBoard / data.totalLimitUp) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 市场热度评估 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-theme-primary">市场热度评估</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 px-4 bg-theme-on-surface-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icon name="bar-chart" className="w-4 h-4 text-theme-secondary" />
                    <span className="text-theme-secondary">涨停总数</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                    data.totalLimitUp > 80 ? 'bg-green-500 text-white' : 
                    data.totalLimitUp > 50 ? 'bg-yellow-500 text-white' : 
                    'bg-red-500 text-white'
                  }`}>
                    <Icon name={data.totalLimitUp > 80 ? 'flame' : data.totalLimitUp > 50 ? 'sun' : 'snowflake'} className="w-3 h-3" />
                    {data.totalLimitUp > 80 ? '火热' : data.totalLimitUp > 50 ? '温和' : '冷淡'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-theme-on-surface-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icon name="trending-up" className="w-4 h-4 text-theme-secondary" />
                    <span className="text-theme-secondary">连板率</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                    data.consecutiveRate > 20 ? 'bg-green-500 text-white' : 
                    data.consecutiveRate > 10 ? 'bg-yellow-500 text-white' : 
                    'bg-red-500 text-white'
                  }`}>
                    <Icon name={data.consecutiveRate > 20 ? 'zap' : data.consecutiveRate > 10 ? 'activity' : 'arrow-down'} className="w-3 h-3" />
                    {data.consecutiveRate > 20 ? '强势' : data.consecutiveRate > 10 ? '一般' : '偏弱'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketOverview
