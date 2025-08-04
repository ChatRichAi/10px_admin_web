'use client'

import { useState, useEffect } from 'react'

interface ChartData {
  users: number
  revenue: number
  subscriptions: number
  growth: number
}

export default function AdminDashboardCharts() {
  const [chartData, setChartData] = useState<ChartData>({
    users: 0,
    revenue: 0,
    subscriptions: 0,
    growth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      // 模拟数据获取
      const mockData = {
        users: 1234,
        revenue: 45678,
        subscriptions: 567,
        growth: 15.2
      }
      setChartData(mockData)
    } catch (error) {
      console.error('获取图表数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-card p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-card p-6 mb-8">
      <h2 className="text-xl font-bold text-foreground mb-6">数据概览</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 用户统计 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">总用户数</p>
              <p className="text-2xl font-bold">{chartData.users.toLocaleString()}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          <div className="mt-2">
            <span className="text-sm opacity-90">+{chartData.growth}% 本月</span>
          </div>
        </div>

        {/* 收入统计 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">月收入</p>
              <p className="text-2xl font-bold">${chartData.revenue.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <div className="mt-2">
            <span className="text-sm opacity-90">+12.5% 本月</span>
          </div>
        </div>

        {/* 订阅统计 */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">活跃订阅</p>
              <p className="text-2xl font-bold">{chartData.subscriptions.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💳</div>
          </div>
          <div className="mt-2">
            <span className="text-sm opacity-90">+8.3% 本月</span>
          </div>
        </div>

        {/* 转化率 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">转化率</p>
              <p className="text-2xl font-bold">23.4%</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
          <div className="mt-2">
            <span className="text-sm opacity-90">+2.1% 本月</span>
          </div>
        </div>
      </div>

      {/* 简单的图表区域 */}
      <div className="mt-8">
        <div className="bg-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">用户增长趋势</h3>
          <div className="h-48 bg-background rounded border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <p>图表组件待集成</p>
              <p className="text-sm">可集成 Chart.js 或 Recharts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 