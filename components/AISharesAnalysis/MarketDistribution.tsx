'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import Icon from '../Icon'

interface MarketDistributionData {
  hs: number
  gem: number
  star: number
}

interface Props {
  data: MarketDistributionData
}

const MarketDistribution: React.FC<Props> = ({ data }) => {
  const total = data.hs + data.gem + data.star
  
  const chartData = [
    { name: '沪深主板', value: data.hs, color: '#3b82f6', percentage: ((data.hs / total) * 100).toFixed(1) },
    { name: '创业板', value: data.gem, color: '#10b981', percentage: ((data.gem / total) * 100).toFixed(1) },
    { name: '科创板', value: data.star, color: '#f59e0b', percentage: ((data.star / total) * 100).toFixed(1) }
  ]

  const marketInfo = [
    {
      name: '沪深主板',
      code: 'HS',
      count: data.hs,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      description: '传统行业龙头，稳定性强'
    },
    {
      name: '创业板',
      code: 'GEM',
      count: data.gem,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      description: '成长性企业，创新活跃'
    },
    {
      name: '科创板',
      code: 'STAR',
      count: data.star,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      description: '科技前沿，高成长潜力'
    }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div
          className="bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-90 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-4 text-xs min-w-[160px]"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="text-gray-700 dark:text-white text-base font-bold mb-2">{data.name}</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-700 dark:text-white">数量</span>
              <span className="text-gray-700 dark:text-white font-bold">{data.value}只</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-700 dark:text-white">占比</span>
              <span className="text-gray-700 dark:text-white font-bold">{data.payload.percentage}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* 市场分布概览 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Icon name="pie-chart" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">市场分布概览</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 饼图 */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 详细数据 */}
          <div className="space-y-4">
            {marketInfo.map((market, index) => (
              <div 
                key={index}
                className={`${market.bgColor} rounded-xl p-4 border border-theme-stroke`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${market.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon name="building" className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-theme-primary">{market.name}</h4>
                      <p className="text-sm text-theme-secondary">{market.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${market.textColor}`}>{market.count}</div>
                    <div className="text-sm text-theme-secondary">只</div>
                  </div>
                </div>
                <p className="text-sm text-theme-secondary">{market.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 市场分析 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Icon name="trending-up" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">市场分析</h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {marketInfo.map((market, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`w-16 h-16 bg-gradient-to-r ${market.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <Icon name="activity" className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">{market.name}</h4>
              <div className="text-3xl font-bold text-theme-primary mb-1">{market.count}</div>
              <div className="text-sm text-theme-secondary mb-2">只涨停</div>
              <div className="text-xs text-theme-tertiary">{market.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketDistribution
