'use client'

import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Icon, { ExpandIcon } from '../Icon'

interface RepresentativeStock {
  name: string
  turnoverRate: number
  blockAmount: number
  themes: string[]
}

interface HotTopic {
  name: string
  count: number
  representativeStocks: RepresentativeStock[]
}

interface Props {
  data: HotTopic[]
}

const HotTopics: React.FC<Props> = ({ data }) => {
  const [expandedCharts, setExpandedCharts] = useState<Set<number>>(new Set())

  const toggleChart = (index: number) => {
    const newExpandedCharts = new Set(expandedCharts)
    if (newExpandedCharts.has(index)) {
      newExpandedCharts.delete(index)
    } else {
      newExpandedCharts.add(index)
    }
    setExpandedCharts(newExpandedCharts)
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-500 to-orange-600'
    if (index === 1) return 'from-gray-400 to-gray-600'
    if (index === 2) return 'from-amber-600 to-yellow-700'
    return 'from-blue-500 to-purple-600'
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return 'crown'
    if (index === 1) return 'award'
    if (index === 2) return 'medal'
    return 'star'
  }

  return (
    <div className="space-y-8">
      {/* 题材热度分析 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Icon name="flame" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">题材热度分析</h3>
        </div>
        
        <div className="space-y-4">
          {data.slice(0, 5).map((topic, index) => (
            <div key={index} className="bg-theme-on-surface-2 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between py-4 px-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-theme-primary w-8">#{index + 1}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-theme-primary">{topic.name}</h4>
                    <p className="text-sm text-theme-secondary">{topic.count} 只股票涨停</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-theme-primary">{topic.count}</div>
                    <div className="text-xs text-theme-secondary">只</div>
                  </div>
                  <div className="w-32 h-2 bg-theme-on-surface-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${(topic.count / data[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => toggleChart(index)}
                    className="ml-2 p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-sm"
                    title={expandedCharts.has(index) ? '收起K线图' : '展开K线图'}
                  >
                    <ExpandIcon 
                      isExpanded={expandedCharts.has(index)}
                      className="w-4 h-4 text-white" 
                    />
                  </button>
                </div>
              </div>

              {/* K线图 */}
              {expandedCharts.has(index) && (
                <div className="px-4 pb-4 border-t border-theme-stroke">
                  <div className="flex items-center gap-2 mb-3 mt-4">
                    <Icon name="trending-up" className="w-4 h-4 text-theme-primary" />
                    <h6 className="text-sm font-medium text-theme-primary">{topic.name} 热度走势</h6>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: '周一', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周二', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周三', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周四', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周五', value: Math.floor(Math.random() * 20) + 5 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          fontSize={10}
                          fill="#6b7280"
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          fontSize={10}
                          fill="#6b7280"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            backdropFilter: 'blur(10px)',
                            fontSize: '12px'
                          }}
                          formatter={(value: any) => [`${value} 只`, '涨停数量']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="url(#heatGradient)"
                          radius={[2, 2, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* 热点题材TOP10 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Icon name="flame" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">热点题材</h3>
          <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-bold rounded">TOP10</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {data.map((topic, index) => (
            <div 
              key={index}
              className="bg-theme-on-surface-2 rounded-xl p-4 border border-theme-stroke hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 bg-gradient-to-r ${getRankColor(index)} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon name={getRankIcon(index)} className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-theme-primary">{topic.name}</h4>
                    <p className="text-xs text-theme-secondary">{topic.count} 只</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-theme-primary">{topic.count}</div>
                  <div className="text-xs text-theme-secondary">只</div>
                </div>
              </div>
              
              {/* 代表股票 */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-theme-secondary mb-1">代表股票:</h5>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {topic.representativeStocks.slice(0, 5).map((stock, stockIndex) => (
                    <div key={stockIndex} className="flex items-center justify-between py-1.5 px-2 bg-theme-on-surface-1 rounded-lg">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-theme-primary truncate">{stock.name}</span>
                        <div className="flex gap-0.5">
                          {stock.themes.slice(0, 1).map((theme, themeIndex) => (
                            <span 
                              key={themeIndex}
                              className="px-1.5 py-0.5 bg-theme-brand-100 text-theme-brand text-xs rounded-full"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-xs text-theme-secondary">
                        <div>{stock.turnoverRate}%</div>
                        <div>{stock.blockAmount}亿</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* K线图展开按钮 */}
              <div className="mt-4 pt-3 border-t border-theme-stroke">
                <button
                  onClick={() => toggleChart(index)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-theme-on-surface-2 hover:bg-theme-on-surface-3 rounded-lg transition-colors duration-200"
                >
                  <Icon name="bar-chart" className="w-4 h-4 text-theme-secondary" />
                  <span className="text-sm text-theme-secondary">
                    {expandedCharts.has(index) ? '收起K线图' : '展开K线图'}
                  </span>
                  <ExpandIcon 
                    isExpanded={expandedCharts.has(index)}
                    className="w-4 h-4 text-theme-secondary" 
                  />
                </button>
              </div>

              {/* K线图 */}
              {expandedCharts.has(index) && (
                <div className="mt-4 p-3 bg-theme-on-surface-1 rounded-lg border border-theme-stroke">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="trending-up" className="w-4 h-4 text-theme-primary" />
                    <h6 className="text-sm font-medium text-theme-primary">{topic.name} 涨停走势</h6>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: '周一', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周二', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周三', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周四', value: Math.floor(Math.random() * 20) + 5 },
                        { name: '周五', value: Math.floor(Math.random() * 20) + 5 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          fontSize={10}
                          fill="#6b7280"
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          fontSize={10}
                          fill="#6b7280"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            backdropFilter: 'blur(10px)',
                            fontSize: '12px'
                          }}
                          formatter={(value: any) => [`${value} 只`, '涨停数量']}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="url(#klineGradient)"
                          radius={[2, 2, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="klineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HotTopics
