'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserManagerProps {
  onUserUpdate?: (userId: string, updates: any) => void
  onUserDelete?: (userId: string) => void
  readOnly?: boolean
}

export default function UserManager({ onUserUpdate, onUserDelete, readOnly = false }: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    } finally {
      setLoading(false)
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
        onUserUpdate?.(userId, updates)
        setShowUserModal(false)
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
        onUserDelete?.(userId)
      } else {
        const error = await response.json()
        alert(`删除失败: ${error.error}`)
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      alert('删除用户失败')
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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载用户数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-card">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-foreground">用户管理</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
            />
            {!readOnly && (
              <button
                onClick={() => {
                  setEditingUser({} as User)
                  setShowUserModal(true)
                }}
                className="admin-button admin-button-primary"
              >
                添加用户
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead className="bg-muted">
            <tr>
              {!readOnly && (
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                    className="rounded border-border"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                套餐
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                注册时间
              </th>
              {!readOnly && (
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-muted/50">
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
                      className="rounded border-border"
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
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground">{getPlanText(user.subscription.plan)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.subscription.status)}`}>
                    {user.subscription.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </td>
                {!readOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setShowUserModal(true)
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑用户模态框 */}
      {showUserModal && editingUser && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-foreground mb-4">
                {editingUser.id ? '编辑用户' : '添加用户'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleUpdateUser(editingUser.id || 'new', {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  subscription: {
                    plan: formData.get('plan'),
                    status: formData.get('status'),
                  }
                })
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">姓名</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser.name}
                      required
                      className="admin-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">邮箱</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingUser.email}
                      required
                      className="admin-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">套餐</label>
                    <select
                      name="plan"
                      defaultValue={editingUser.subscription?.plan || 'free'}
                      className="admin-input mt-1"
                    >
                      <option value="free">免费版</option>
                      <option value="starter">入门版</option>
                      <option value="standard">标准版</option>
                      <option value="pro">专业版</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">状态</label>
                    <select
                      name="status"
                      defaultValue={editingUser.subscription?.status || 'active'}
                      className="admin-input mt-1"
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
                    onClick={() => {
                      setShowUserModal(false)
                      setEditingUser(null)
                    }}
                    className="admin-button admin-button-secondary"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="admin-button admin-button-primary"
                  >
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 