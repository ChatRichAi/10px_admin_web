'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'

interface SubscriptionManagerProps {
  onSubscriptionUpdate?: (userId: string, subscription: any) => void
  onBulkAction?: (action: string, userIds: string[], plan?: string) => void
  readOnly?: boolean
}

interface SubscriptionStats {
  totalUsers: number
  activeSubscriptions: number
  freeUsers: number
  starterUsers: number
  standardUsers: number
  proUsers: number
  monthlyRevenue: number
  cancelledSubscriptions: number
}

export default function SubscriptionManager({ 
  onSubscriptionUpdate, 
  onBulkAction, 
  readOnly = false 
}: SubscriptionManagerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SubscriptionStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    starterUsers: 0,
    standardUsers: 0,
    proUsers: 0,
    monthlyRevenue: 0,
    cancelledSubscriptions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [bulkPlan, setBulkPlan] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([fetchUsers(), fetchStats()])
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      alert('请先选择用户')
      return
    }

    if (!bulkAction) {
      alert('请选择操作类型')
      return
    }

    if (bulkAction === 'upgrade' && !bulkPlan) {
      alert('升级操作需要选择套餐')
      return
    }

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: bulkAction, 
          userIds: selectedUsers, 
          plan: bulkPlan 
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        await fetchData()
        setSelectedUsers([])
        setBulkAction('')
        setBulkPlan('')
        onBulkAction?.(bulkAction, selectedUsers, bulkPlan)
      } else {
        const error = await response.json()
        alert(`操作失败: ${error.error}`)
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      alert('批量操作失败')
    }
  }

  const handleUpdateSubscription = async (userId: string, subscription: any) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      })

      if (response.ok) {
        await fetchData()
        onSubscriptionUpdate?.(userId, subscription)
      } else {
        const error = await response.json()
        alert(`更新失败: ${error.error}`)
      }
    } catch (error) {
      console.error('更新订阅失败:', error)
      alert('更新订阅失败')
    }
  }

  const getPlanText = (plan: string) => {
    const planMap = {
      free: '免费版',
      starter: '入门版',
      standard: '标准版',
      pro: '专业版',
    }
    return planMap[plan as keyof typeof planMap] || plan
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100'
      case 'expired':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载订阅数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总用户数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">活跃订阅</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">月收入</p>
              <p className="text-2xl font-semibold text-gray-900">¥{stats.monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已取消</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cancelledSubscriptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 批量操作 */}
      {!readOnly && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">批量操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">操作类型</label>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择操作</option>
                <option value="upgrade">升级套餐</option>
                <option value="cancel">取消订阅</option>
                <option value="reactivate">重新激活</option>
                <option value="expire">设为过期</option>
              </select>
            </div>
            {bulkAction === 'upgrade' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目标套餐</label>
                <select
                  value={bulkPlan}
                  onChange={(e) => setBulkPlan(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">选择套餐</option>
                  <option value="starter">入门版</option>
                  <option value="standard">标准版</option>
                  <option value="pro">专业版</option>
                </select>
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={handleBulkAction}
                disabled={selectedUsers.length === 0 || !bulkAction || (bulkAction === 'upgrade' && !bulkPlan)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                执行操作 ({selectedUsers.length} 个用户)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 套餐分布 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">套餐分布</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.freeUsers}</div>
            <div className="text-sm text-gray-600">免费版</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{stats.starterUsers}</div>
            <div className="text-sm text-blue-600">入门版</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{stats.standardUsers}</div>
            <div className="text-sm text-green-600">标准版</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">{stats.proUsers}</div>
            <div className="text-sm text-purple-600">专业版</div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">订阅用户列表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {!readOnly && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(u => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  套餐
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  开始时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  结束时间
                </th>
                {!readOnly && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {!readOnly && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.image || '/images/avatar-1.jpg'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getPlanText(user.subscription.plan)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.subscription.status)}`}>
                      {user.subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.subscription.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.subscription.endDate).toLocaleDateString()}
                  </td>
                  {!readOnly && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          const newStatus = user.subscription.status === 'active' ? 'cancelled' : 'active'
                          handleUpdateSubscription(user.id, {
                            ...user.subscription,
                            status: newStatus
                          })
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {user.subscription.status === 'active' ? '取消' : '激活'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 