'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Icon from '../Icon'

interface AShareData {
  sector: string
  changePercent: number
  volume: number
  turnover: number
  leadingStocks: string[]
}

interface Props {
  data: AShareData[]
}

const HotSectorAnalysis: React.FC<Props> = ({ data }) => {
  const formatVolume = (volume: number) => {
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(2)}亿`
    }
    return `${(volume / 10000).toFixed(2)}万`
  }

  const formatTurnover = (turnover: number) => {
    if (turnover >= 100000000) {
      return `${(turnover / 100000000).toFixed(2)}亿`
    }
    return `${(turnover / 10000).toFixed(2)}万`
  }

  const getColor = (value: number) => {
    if (value > 4) return '#22c55e'  // 更亮的绿色
    if (value > 2) return '#f59e0b'  // 保持黄色
    return '#ef4444'  // 保持红色
  }

  const getCardColor = (index: number) => {
    const colors = [
      'from-red-500 to-orange-500',
      'from-blue-500 to-purple-500', 
      'from-green-500 to-teal-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-8">
      {/* 板块卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getCardColor(index)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <Icon name="trending-up" className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-theme-primary">{item.sector}</h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.changePercent > 0
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-red-500 text-white shadow-lg'
                }`}
              >
                {item.changePercent > 0 ? '+' : ''}{item.changePercent}%
              </span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 px-3 bg-theme-on-surface-2 rounded-xl">
                <span className="text-theme-secondary">成交量</span>
                <span className="font-semibold text-theme-primary">{formatVolume(item.volume)}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-theme-on-surface-2 rounded-xl">
                <span className="text-theme-secondary">成交额</span>
                <span className="font-semibold text-theme-primary">{formatTurnover(item.turnover)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-theme-stroke">
              <h4 className="text-sm font-medium text-theme-secondary mb-3">领涨个股</h4>
              <div className="flex flex-wrap gap-2">
                {item.leadingStocks.map((stock, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-theme-brand-100 text-theme-brand text-xs rounded-full font-medium"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 板块涨幅对比图表 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Icon name="bar-chart" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">板块涨幅对比</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis 
              dataKey="sector" 
              tick={{ fontSize: 12, fill: '#6F767E' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6F767E' }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      className="bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-90 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-4 text-xs min-w-[160px]"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <div className="text-gray-700 dark:text-white text-base font-bold mb-2">板块: {label}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-700 dark:text-white">涨幅</span>
                          <span className="text-gray-700 dark:text-white font-bold">{payload[0].value}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="changePercent" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.changePercent)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 成交额分布图表 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Icon name="dollar-sign" className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">成交额分布</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
            <XAxis 
              dataKey="sector" 
              tick={{ fontSize: 12, fill: '#6F767E' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6F767E' }}
              tickFormatter={(value) => `${(value / 100000000).toFixed(0)}`}
              axisLine={false}
              tickLine={false}
              unit="亿"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      className="bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-90 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-4 text-xs min-w-[160px]"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <div className="text-gray-700 dark:text-white text-base font-bold mb-2">板块: {label}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-700 dark:text-white">成交额</span>
                          <span className="text-gray-700 dark:text-white font-bold">{(payload[0].value / 100000000).toFixed(2)}亿</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="turnover" fill="#0C68E9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default HotSectorAnalysis