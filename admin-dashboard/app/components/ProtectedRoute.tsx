'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Permission } from '@/lib/permissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: Permission
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  permission, 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      if (!permission) {
        setHasPermission(true)
      } else {
        // 检查用户是否有指定权限
        const userPermissions = user.permissions || []
        setHasPermission(userPermissions.includes(permission))
      }
    }
  }, [user, loading, permission])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">需要登录</h1>
          <p className="text-muted-foreground mb-4">请先登录以访问管理后台</p>
          <a 
            href="/login" 
            className="admin-button admin-button-primary"
          >
            前往登录
          </a>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">权限不足</h1>
          <p className="text-muted-foreground">
            您没有访问此页面的权限
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 