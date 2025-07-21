'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { User } from '@/types/user'
import { PERMISSIONS, Permission } from '@/lib/permissions'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  freeUsers: number
  starterUsers: number
  standardUsers: number
  proUsers: number
  monthlyRevenue: number
  cancelledSubscriptions: number
}

interface PermissionInfo {
  key: string
  value: string
  description: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<PermissionInfo[]>([])
  const [stats, setStats] = useState<AdminStats>({
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
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null)
  
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchPermissions(),
        fetchStats(),
      ])
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

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      }
    } catch (error) {
      console.error('获取权限数据失败:', error)
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

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      })

      if (response.ok) {
        await fetchUsers()
        setEditingUser(null)
      } else {
        const error = await response.json()
        alert(`更新失败: ${error.error}`)
      }
    } catch (error) {
      console.error('更新用户失败:', error)
      alert('更新用户失败')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchUsers()
        await fetchStats()
      } else {
        const error = await response.json()
        alert(`删除失败: ${error.error}`)
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      alert('删除用户失败')
    }
  }

  const handleBulkAction = async (action: string, plan?: string) => {
    if (selectedUsers.length === 0) {
      alert('请先选择用户')
      return
    }

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers, plan }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        await fetchUsers()
        await fetchStats()
        setSelectedUsers([])
      } else {
        const error = await response.json()
        alert(`操作失败: ${error.error}`)
      }
    } catch (error) {
      console.error('批量操作失败:', error)
      alert('批量操作失败')
    }
  }

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permissions }),
      })

      if (response.ok) {
        await fetchUsers()
        setShowPermissionModal(false)
        setSelectedUserForPermissions(null)
      } else {
        const error = await response.json()
        alert(`更新权限失败: ${error.error}`)
      }
    } catch (error) {
      console.error('更新权限失败:', error)
      alert('更新权限失败')
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载管理后台...</p>
        </div>
      </div>
    )
  }
  
  return (
    <ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* 头部 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
            <p className="text-gray-600 mt-2">用户管理、权限控制和订阅管理</p>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">套餐分布</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.starterUsers + stats.standardUsers + stats.proUsers}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 标签页 */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', name: '概览', icon: '📊' },
                  { id: 'users', name: '用户管理', icon: '👥' },
                  { id: 'permissions', name: '权限管理', icon: '🔐' },
                  { id: 'subscriptions', name: '订阅管理', icon: '💳' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* 概览标签页 */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">套餐分布</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">免费版</span>
                          <span className="text-sm font-medium">{stats.freeUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">入门版</span>
                          <span className="text-sm font-medium">{stats.starterUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">标准版</span>
                          <span className="text-sm font-medium">{stats.standardUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">专业版</span>
                          <span className="text-sm font-medium">{stats.proUsers}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">订阅状态</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">活跃订阅</span>
                          <span className="text-sm font-medium text-green-600">{stats.activeSubscriptions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">已取消</span>
                          <span className="text-sm font-medium text-red-600">{stats.cancelledSubscriptions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">月收入</span>
                          <span className="text-sm font-medium">¥{stats.monthlyRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 用户管理标签页 */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 max-w-sm">
                      <input
                        type="text"
                        placeholder="搜索用户..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('upgrade', 'starter')}
                        disabled={selectedUsers.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        批量升级
                      </button>
                      <button
                        onClick={() => handleBulkAction('cancel')}
                        disabled={selectedUsers.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        批量取消
                      </button>
                    </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(filteredUsers.map(u => u.id))
                                } else {
                                  setSelectedUsers([])
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                    </th>
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
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                          <tr key={user.id}>
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
                              {format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUserForPermissions(user)
                                    setShowPermissionModal(true)
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  权限
                        </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  删除
                        </button>
                              </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                  </div>
                </div>
              )}

              {/* 权限管理标签页 */}
              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">可用权限列表</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map(permission => (
                      <div key={permission.key} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{permission.key}</h4>
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                        <code className="text-xs text-gray-500 mt-2 block">{permission.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 订阅管理标签页 */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">批量操作</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleBulkAction('upgrade', 'starter')}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          批量升级到入门版
                        </button>
                        <button
                          onClick={() => handleBulkAction('upgrade', 'standard')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          批量升级到标准版
                        </button>
                        <button
                          onClick={() => handleBulkAction('upgrade', 'pro')}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          批量升级到专业版
                        </button>
                        <button
                          onClick={() => handleBulkAction('cancel')}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          批量取消订阅
                        </button>
                        <button
                          onClick={() => handleBulkAction('reactivate')}
                          className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        >
                          批量重新激活
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">订阅统计</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>总用户数</span>
                          <span className="font-medium">{stats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>活跃订阅</span>
                          <span className="font-medium text-green-600">{stats.activeSubscriptions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>已取消</span>
                          <span className="font-medium text-red-600">{stats.cancelledSubscriptions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>月收入</span>
                          <span className="font-medium">¥{stats.monthlyRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 编辑用户模态框 */}
        {editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">编辑用户</h3>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleUpdateUser(editingUser.id, {
                    name: formData.get('name'),
                    subscription: {
                      plan: formData.get('plan'),
                      status: formData.get('status'),
                    }
                  })
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">姓名</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingUser.name}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">套餐</label>
                      <select
                        name="plan"
                        defaultValue={editingUser.subscription.plan}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="free">免费版</option>
                        <option value="starter">入门版</option>
                        <option value="standard">标准版</option>
                        <option value="pro">专业版</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">状态</label>
                      <select
                        name="status"
                        defaultValue={editingUser.subscription.status}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">活跃</option>
                        <option value="cancelled">已取消</option>
                        <option value="expired">已过期</option>
                        <option value="past_due">逾期</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 权限管理模态框 */}
        {showPermissionModal && selectedUserForPermissions && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  管理权限 - {selectedUserForPermissions.name}
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {permissions.map(permission => (
                    <label key={permission.key} className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={selectedUserForPermissions.permissions.includes(permission.value)}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.description}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPermissionModal(false)
                      setSelectedUserForPermissions(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                                     <button
                     onClick={() => {
                       const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
                       const selectedPermissions = Array.from(checkboxes).map(cb => 
                         permissions.find(p => p.description === cb.nextElementSibling?.textContent)?.value
                       ).filter((value): value is string => Boolean(value))
                       handleUpdatePermissions(selectedUserForPermissions.id, selectedPermissions)
                     }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    保存权限
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 