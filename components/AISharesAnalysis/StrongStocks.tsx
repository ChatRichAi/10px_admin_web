'use client'

import React from 'react'
import Icon from '../Icon'

interface StrongStock {
  name: string
  turnoverRate: number
  blockAmount: number
  themes: string[]
}

interface Props {
  data: StrongStock[]
}

const StrongStocks: React.FC<Props> = ({ data }) => {
  const getStrengthLevel = (turnoverRate: number, blockAmount: number) => {
    const score = turnoverRate * 0.3 + blockAmount * 0.7
    if (score > 15) return { level: '极强', color: 'from-red-500 to-pink-600', bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-700 dark:text-red-300' }
    if (score > 10) return { level: '很强', color: 'from-orange-500 to-red-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-700 dark:text-orange-300' }
    if (score > 5) return { level: '较强', color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', textColor: 'text-yellow-700 dark:text-yellow-300' }
    return { level: '一般', color: 'from-blue-500 to-purple-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' }
  }

  return (
    <div className="space-y-8">
      {/* 强势股一览 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Icon name="zap" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">强势股一览</h3>
        </div>
        
        <div className="space-y-4">
          {data.map((stock, index) => {
            const strength = getStrengthLevel(stock.turnoverRate, stock.blockAmount)
            return (
              <div 
                key={index}
                className={`${strength.bgColor} rounded-xl p-6 border border-theme-stroke hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${strength.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon name="trending-up" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-theme-primary mb-1">{stock.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${strength.textColor}`}>
                          {strength.level}
                        </span>
                        <span className="text-sm text-theme-secondary">
                          换手率: {stock.turnoverRate}%
                        </span>
                        <span className="text-sm text-theme-secondary">
                          封单: {stock.blockAmount}亿
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-theme-primary">{stock.turnoverRate}%</div>
                    <div className="text-sm text-theme-secondary">换手率</div>
                  </div>
                </div>
                
                {/* 题材标签 */}
                <div className="flex flex-wrap gap-2">
                  {stock.themes.map((theme, themeIndex) => (
                    <span 
                      key={themeIndex}
                      className="px-3 py-1 bg-theme-brand-100 text-theme-brand text-sm rounded-full font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 强势股分析 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Icon name="bar-chart" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">强势股分析</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 换手率分布 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theme-primary">换手率分布</h4>
            <div className="space-y-3">
              {data.map((stock, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-theme-on-surface-2 rounded-xl">
                  <span className="text-theme-primary font-medium">{stock.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-theme-on-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{ width: `${(stock.turnoverRate / Math.max(...data.map(s => s.turnoverRate))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-theme-primary font-semibold w-12 text-right">
                      {stock.turnoverRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 封单金额分布 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-theme-primary">封单金额分布</h4>
            <div className="space-y-3">
              {data.map((stock, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 bg-theme-on-surface-2 rounded-xl">
                  <span className="text-theme-primary font-medium">{stock.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-theme-on-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-teal-600 rounded-full"
                        style={{ width: `${(stock.blockAmount / Math.max(...data.map(s => s.blockAmount))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-theme-primary font-semibold w-12 text-right">
                      {stock.blockAmount}亿
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrongStocks
