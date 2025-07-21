'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import PermissionManager from '@/components/PermissionManager'

export default function PermissionPageClient() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">权限管理</h1>
        <p className="text-gray-600 mt-2">为用户分配和管理特定权限</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户选择器 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">选择用户</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">加载中...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.image || '/images/avatar-1.jpg'}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          权限: {user.permissions?.length || 0} 个
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 权限管理 */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <PermissionManager
              user={selectedUser}
              onUpdate={(userId, permissions) => {
                console.log('权限更新:', userId, permissions)
                // 更新本地用户数据
                setUsers(prev => prev.map(user => 
                  user.id === userId 
                    ? { ...user, permissions }
                    : user
                ))
              }}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-12">
              <div className="text-center">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择用户</h3>
                <p className="text-gray-600">请从左侧选择一个用户来管理其权限</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 