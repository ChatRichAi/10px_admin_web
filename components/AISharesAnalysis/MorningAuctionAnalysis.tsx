'use client'

import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Icon from '../Icon'

interface AuctionData {
  stockCode: string
  stockName: string
  auctionPrice: number
  changePercent: number
  auctionVolume: number
  auctionAmount: number
  industry: string
}

interface Props {
  data: AuctionData[]
}

const MorningAuctionAnalysis: React.FC<Props> = ({ data }) => {
  const [sortField, setSortField] = useState<'changePercent' | 'auctionAmount'>('changePercent')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const formatVolume = (volume: number) => {
    if (volume >= 10000) {
      return `${(volume / 10000).toFixed(2)}万`
    }
    return volume.toString()
  }

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(2)}亿`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(2)}万`
    }
    return amount.toString()
  }

  const sortedData = [...data].sort((a, b) => {
    const multiplier = sortOrder === 'desc' ? -1 : 1
    return (a[sortField] - b[sortField]) * multiplier
  })

  const handleSort = (field: 'changePercent' | 'auctionAmount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getChangeColor = (percent: number) => {
    if (percent > 5) return '#22c55e'  // 更亮的绿色
    if (percent > 2) return '#f59e0b'  // 保持黄色
    if (percent > 0) return '#3b82f6'  // 保持蓝色
    return '#ef4444'  // 保持红色
  }

  return (
    <div className="space-y-8">
      {/* 早盘竞价数据表格 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke overflow-hidden">
        <div className="p-6 border-b border-theme-stroke">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Icon name="clock" className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-theme-primary">早盘竞价数据</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSort('changePercent')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortField === 'changePercent'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-theme-on-surface-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-3'
              }`}
            >
              按涨幅 {sortField === 'changePercent' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => handleSort('auctionAmount')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortField === 'auctionAmount'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                  : 'bg-theme-on-surface-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-3'
              }`}
            >
              按金额 {sortField === 'auctionAmount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-theme-on-surface-2">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  代码
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  竞价价
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  涨幅
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  竞价量
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  竞金额
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider">
                  行业
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-stroke">
              {sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-theme-on-surface-2 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-semibold text-theme-primary">
                    {item.stockCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-theme-primary font-medium">{item.stockName}</td>
                  <td className="px-6 py-4 text-sm text-theme-primary font-medium">¥{item.auctionPrice}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.changePercent > 0
                          ? 'bg-green-500 text-white shadow-lg'
                          : item.changePercent < 0
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-gray-500 text-white shadow-lg'
                      }`}
                    >
                      {item.changePercent > 0 ? '+' : ''}{item.changePercent}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-theme-primary font-medium">
                    {formatVolume(item.auctionVolume)}
                  </td>
                  <td className="px-6 py-4 text-sm text-theme-primary font-medium">
                    {formatAmount(item.auctionAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-theme-secondary">{item.industry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 竞价涨幅分布图表 */}
        <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Icon name="trending-up" className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-theme-primary">竞价涨幅分布</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
              <XAxis 
                dataKey="stockName" 
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
                        <div className="text-gray-700 dark:text-white text-base font-bold mb-2">股票: {label}</div>
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
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChangeColor(entry.changePercent)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 竞价金额对比图表 */}
        <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Icon name="dollar-sign" className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-theme-primary">竞价金额对比</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
              <XAxis 
                dataKey="stockName" 
                tick={{ fontSize: 12, fill: '#6F767E' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6F767E' }}
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}`}
                axisLine={false}
                tickLine={false}
                unit="万"
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
                        <div className="text-gray-700 dark:text-white text-base font-bold mb-2">股票: {label}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-700 dark:text-white">竞价金额</span>
                            <span className="text-gray-700 dark:text-white font-bold">{formatAmount(payload[0].value)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="auctionAmount" fill="#0C68E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default MorningAuctionAnalysis