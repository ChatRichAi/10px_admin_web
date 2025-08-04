'use client'

import { useState, useEffect } from 'react'
import { PERMISSIONS, PERMISSION_GROUPS } from '@/lib/permissions'

interface PermissionManagerProps {
  readOnly?: boolean
}

export default function PermissionManager({ readOnly = false }: PermissionManagerProps) {
  const [selectedRole, setSelectedRole] = useState('user')
  const [permissions, setPermissions] = useState<string[]>([])

  const roles = [
    { id: 'user', name: '普通用户', description: '基础功能访问权限' },
    { id: 'moderator', name: '版主', description: '内容审核和管理权限' },
    { id: 'admin', name: '管理员', description: '完整系统管理权限' },
  ]

  const permissionDescriptions = {
    [PERMISSIONS.ADMIN_ACCESS]: '访问管理后台',
    [PERMISSIONS.USER_READ]: '查看用户信息',
    [PERMISSIONS.USER_WRITE]: '编辑用户信息',
    [PERMISSIONS.USER_DELETE]: '删除用户',
    [PERMISSIONS.SUBSCRIPTION_READ]: '查看订阅信息',
    [PERMISSIONS.SUBSCRIPTION_WRITE]: '编辑订阅信息',
    [PERMISSIONS.SUBSCRIPTION_DELETE]: '删除订阅',
    [PERMISSIONS.PERMISSION_READ]: '查看权限信息',
    [PERMISSIONS.PERMISSION_WRITE]: '编辑权限信息',
    [PERMISSIONS.LOG_READ]: '查看系统日志',
    [PERMISSIONS.ANALYTICS_READ]: '查看数据分析',
    [PERMISSIONS.SYSTEM_CONFIG]: '系统配置',
  }

  useEffect(() => {
    // 根据角色设置默认权限
    const rolePermissions = {
      user: [PERMISSIONS.USER_READ],
      moderator: [PERMISSIONS.USER_READ, PERMISSIONS.USER_WRITE, PERMISSIONS.LOG_READ],
      admin: Object.values(PERMISSIONS),
    }
    setPermissions(rolePermissions[selectedRole as keyof typeof rolePermissions] || [])
  }, [selectedRole])

  const handlePermissionToggle = (permission: string) => {
    if (readOnly) return
    
    setPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, permissions }),
      })

      if (response.ok) {
        alert('权限保存成功')
      } else {
        alert('权限保存失败')
      }
    } catch (error) {
      console.error('保存权限失败:', error)
      alert('保存权限失败')
    }
  }

  return (
    <div className="admin-card">
      <div className="p-6 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-foreground">权限管理</h3>
          {!readOnly && (
            <button
              onClick={handleSave}
              className="admin-button admin-button-primary"
            >
              保存权限
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 角色选择 */}
          <div className="lg:col-span-1">
            <h4 className="text-md font-medium text-foreground mb-4">选择角色</h4>
            <div className="space-y-3">
              {roles.map(role => (
                <div
                  key={role.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <h5 className="font-medium text-foreground">{role.name}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 权限配置 */}
          <div className="lg:col-span-2">
            <h4 className="text-md font-medium text-foreground mb-4">
              {roles.find(r => r.id === selectedRole)?.name} 权限配置
            </h4>
            
            <div className="space-y-6">
              {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPermissions]) => (
                <div key={groupName} className="border border-border rounded-lg p-4">
                  <h5 className="font-medium text-foreground mb-3">
                    {groupName === 'USER_MANAGEMENT' && '用户管理'}
                    {groupName === 'SUBSCRIPTION_MANAGEMENT' && '订阅管理'}
                    {groupName === 'PERMISSION_MANAGEMENT' && '权限管理'}
                    {groupName === 'SYSTEM_MANAGEMENT' && '系统管理'}
                  </h5>
                  <div className="space-y-2">
                    {groupPermissions.map(permission => (
                      <label
                        key={permission}
                        className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                          permissions.includes(permission)
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={readOnly}
                          className="rounded border-border"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {permission}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {permissionDescriptions[permission as keyof typeof permissionDescriptions]}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 