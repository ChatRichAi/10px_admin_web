'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'
import { PERMISSIONS, Permission } from '@/lib/permissions'

interface PermissionManagerProps {
  user: User
  onUpdate?: (userId: string, permissions: string[]) => void
  readOnly?: boolean
}

interface PermissionInfo {
  key: string
  value: string
  description: string
}

export default function PermissionManager({ user, onUpdate, readOnly = false }: PermissionManagerProps) {
  const [permissions, setPermissions] = useState<PermissionInfo[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(user.permissions || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

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

  const handlePermissionToggle = (permissionValue: string) => {
    if (readOnly) return

    setSelectedPermissions(prev => {
      if (prev.includes(permissionValue)) {
        return prev.filter(p => p !== permissionValue)
      } else {
        return [...prev, permissionValue]
      }
    })
  }

  const handleSave = async () => {
    if (readOnly) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, permissions: selectedPermissions }),
      })

      if (response.ok) {
        onUpdate?.(user.id, selectedPermissions)
      } else {
        const error = await response.json()
        alert(`更新权限失败: ${error.error}`)
      }
    } catch (error) {
      console.error('更新权限失败:', error)
      alert('更新权限失败')
    } finally {
      setLoading(false)
    }
  }

  const getPermissionCategory = (permission: PermissionInfo) => {
    const { value } = permission
    if (value.includes('BASIC') || value.includes('PRICE_ALERTS')) {
      return '基础功能'
    } else if (value.includes('ADVANCED') || value.includes('AI') || value.includes('MARKET')) {
      return '高级功能'
    } else if (value.includes('AUTO') || value.includes('API') || value.includes('PRIORITY')) {
      return '专业功能'
    } else if (value.includes('ADMIN')) {
      return '管理功能'
    }
    return '其他'
  }

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = getPermissionCategory(permission)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, PermissionInfo[]>)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          权限管理 - {user.name}
        </h3>
        {!readOnly && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存权限'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryPermissions.map(permission => (
                <label
                  key={permission.key}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedPermissions.includes(permission.value)
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.value)}
                    onChange={() => handlePermissionToggle(permission.value)}
                    disabled={readOnly}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {permission.key}
                    </div>
                    <div className="text-xs text-gray-500">
                      {permission.description}
                    </div>
                    <code className="text-xs text-gray-400 block mt-1">
                      {permission.value}
                    </code>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>已选择 {selectedPermissions.length} 个权限</span>
            <button
              onClick={() => setSelectedPermissions([])}
              className="text-red-600 hover:text-red-700"
            >
              清除所有
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 