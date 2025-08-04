'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface LogEntry {
  id: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  userId?: string
  userEmail?: string
  ip?: string
  timestamp: string
  metadata?: any
}

interface LogStats {
  total: number
  info: number
  warn: number
  error: number
  byHour: Record<string, number>
  byDay: Record<string, number>
}

interface LogFilters {
  level?: string
  userEmail?: string
  startDate?: string
  endDate?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LogManager() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LogFilters>({})
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [timeRange, setTimeRange] = useState('24h')

  // 获取日志列表
  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })

      const response = await fetch(`/api/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('获取日志失败')
      }

      const data = await response.json()
      if (data.success) {
        setLogs(data.data.logs)
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取日志统计
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/logs/stats?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('获取统计失败')
      }

      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // 删除日志
  const deleteLog = async (logId: string) => {
    if (!confirm('确定要删除这条日志吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      const data = await response.json()
      if (data.success) {
        // 重新获取日志
        fetchLogs()
        fetchStats()
      }
    } catch (error) {
      console.error('Error deleting log:', error)
      alert('删除日志失败')
    }
  }

  // 导出日志
  const exportLogs = async (format: 'json' | 'csv' = 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      })

      const response = await fetch(`/api/logs/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `logs.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting logs:', error)
      alert('导出日志失败')
    }
  }

  // 应用过滤器
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  // 重置过滤器
  const resetFilters = () => {
    setFilters({})
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  // 获取级别颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-100'
      case 'WARN':
        return 'text-yellow-600 bg-yellow-100'
      case 'INFO':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [pagination.page, timeRange])

  useEffect(() => {
    fetchLogs()
  }, [filters])

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">日志管理</h1>
        <p className="text-gray-600 mt-2">系统日志查看和监控</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 日志统计 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">日志统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">总日志数</span>
                <span className="text-lg font-bold text-gray-900">{stats?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">信息日志</span>
                <span className="text-lg font-bold text-blue-600">{stats?.info || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">警告日志</span>
                <span className="text-lg font-bold text-yellow-600">{stats?.warn || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">错误日志</span>
                <span className="text-lg font-bold text-red-600">{stats?.error || 0}</span>
              </div>
            </div>
          </div>

          {/* 过滤器 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">过滤器</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日志级别</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={filters.level || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value || undefined }))}
                >
                  <option value="">全部级别</option>
                  <option value="ERROR">错误</option>
                  <option value="WARN">警告</option>
                  <option value="INFO">信息</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1h">最近1小时</option>
                  <option value="24h">最近24小时</option>
                  <option value="7d">最近7天</option>
                  <option value="30d">最近30天</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户邮箱</label>
                <input
                  type="text"
                  placeholder="输入邮箱搜索"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={filters.userEmail || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, userEmail: e.target.value || undefined }))}
                />
              </div>
              <div className="flex space-x-2">
                <button 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  onClick={applyFilters}
                >
                  应用过滤
                </button>
                <button 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  onClick={resetFilters}
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 日志列表 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">系统日志</h3>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                    onClick={() => { fetchLogs(); fetchStats(); }}
                  >
                    刷新
                  </button>
                  <button 
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    onClick={() => exportLogs('json')}
                  >
                    导出JSON
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    onClick={() => exportLogs('csv')}
                  >
                    导出CSV
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      级别
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      消息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP地址
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={log.message}>
                          {log.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.userEmail || log.userId || '系统'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{log.ip || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatTime(log.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => deleteLog(log.id)}
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示 {((pagination.page - 1) * pagination.limit) + 1} 到 {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      上一页
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          className={`px-3 py-1 rounded-md text-sm ${
                            pageNum === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 