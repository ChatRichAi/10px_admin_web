'use client'

import React from 'react'
import Icon from '../Icon'

interface Props {
  data: string[]
}

const InvestmentAdvice: React.FC<Props> = ({ data }) => {
  const adviceCategories = [
    {
      title: '投资策略',
      icon: 'target',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: '风险提示',
      icon: 'shield',
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300'
    },
    {
      title: '关注重点',
      icon: 'eye',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: '操作建议',
      icon: 'settings',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  ]

  const getAdviceCategory = (index: number) => {
    return adviceCategories[index % adviceCategories.length]
  }

  return (
    <div className="space-y-8">
      {/* 投资建议 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Icon name="lightbulb" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">投资建议</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((advice, index) => {
            const category = getAdviceCategory(index)
            return (
              <div 
                key={index}
                className={`${category.bgColor} rounded-xl p-6 border border-theme-stroke hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon name={category.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${category.textColor} mb-2`}>
                      {category.title}
                    </h4>
                    <p className="text-theme-primary leading-relaxed">
                      {advice}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 投资策略详解 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Icon name="book-open" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">投资策略详解</h3>
        </div>
        
        <div className="space-y-6">
          {/* 策略1: 关注热点题材中的龙头股 */}
          <div className="flex items-start gap-4 p-4 bg-theme-on-surface-2 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon name="target" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">关注热点题材中的龙头股</h4>
              <p className="text-theme-secondary leading-relaxed">
                在热点题材中，龙头股通常具有更强的资金关注度和上涨潜力。选择具有核心竞争力的公司，
                关注其基本面和技术面的双重支撑，能够获得更好的投资回报。
              </p>
            </div>
          </div>

          {/* 策略2: 重点关注强势股的后续表现 */}
          <div className="flex items-start gap-4 p-4 bg-theme-on-surface-2 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon name="trending-up" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">重点关注强势股的后续表现</h4>
              <p className="text-theme-secondary leading-relaxed">
                强势股往往具有持续上涨的动力，但需要密切关注其换手率、封单金额等关键指标。
                及时跟踪市场情绪变化，把握进出场时机，避免追高风险。
              </p>
            </div>
          </div>

          {/* 策略3: 注意连板率，判断市场情绪强弱 */}
          <div className="flex items-start gap-4 p-4 bg-theme-on-surface-2 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon name="activity" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">注意连板率，判断市场情绪强弱</h4>
              <p className="text-theme-secondary leading-relaxed">
                连板率是衡量市场情绪的重要指标。高连板率表明市场情绪高涨，资金活跃；
                低连板率则可能意味着市场情绪转冷，需要谨慎操作。结合其他技术指标综合判断。
              </p>
            </div>
          </div>

          {/* 策略4: 结合基本面选择优质标的 */}
          <div className="flex items-start gap-4 p-4 bg-theme-on-surface-2 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <Icon name="search" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-theme-primary mb-2">结合基本面选择优质标的</h4>
              <p className="text-theme-secondary leading-relaxed">
                技术面分析需要与基本面分析相结合。关注公司的财务状况、行业地位、发展前景等基本面因素，
                选择具有长期投资价值的优质标的，降低投资风险。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 风险提示 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Icon name="alert-triangle" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">风险提示</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <Icon name="alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">市场风险</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                股市有风险，投资需谨慎。涨停板股票波动较大，存在较大投资风险。
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <Icon name="info" className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">操作风险</h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                建议控制仓位，设置止损点，避免盲目追高和重仓操作。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentAdvice
