'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'
import { Permission } from '@/lib/permissions'
import { usePermission } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: Permission
  redirectTo?: string
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  permission, 
  redirectTo = '/sign-in',
  fallback
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { hasPermission: hasRequiredPermission, currentPlan } = usePermission(permission!)

  useEffect(() => {
    if (status === 'loading') return // 仍在加载中

    if (!session) {
      // 未登录，重定向到登录页面
      router.push(redirectTo)
      return
    }

    if (permission && !hasRequiredPermission) {
      // 没有所需权限，重定向到升级页面
      router.push('/pricing')
      return
    }
  }, [session, status, hasRequiredPermission, permission, router, redirectTo])

  // 显示加载状态
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    )
  }

  // 未登录
  if (!session) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">需要登录</h2>
          <p className="text-gray-600 mb-4">请先登录以访问此页面</p>
          <button 
            onClick={() => router.push(redirectTo)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            前往登录
          </button>
        </div>
      </div>
    )
  }

  // 权限不足
  if (permission && !hasRequiredPermission) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">权限不足</h2>
          <p className="text-gray-600 mb-4">
            您当前的套餐（{currentPlan}）无法访问此功能
          </p>
          <button 
            onClick={() => router.push('/pricing')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            升级套餐
          </button>
        </div>
      </div>
    )
  }

  // 有权限访问，渲染子组件
  return <>{children}</>
} 