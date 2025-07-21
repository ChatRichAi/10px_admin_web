'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

// 基础认证钩子
export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const user = session?.user
  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  
  const signIn = () => {
    router.push('/sign-in')
  }
  
  const signOut = () => {
    router.push('/sign-out')
  }
  
  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    session,
  }
}

// 需要认证的钩子
export function useRequireAuth() {
  const { isAuthenticated, isLoading, signIn } = useAuth()
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      signIn()
    }
  }, [isLoading, isAuthenticated, signIn])
  
  return { isAuthenticated, isLoading }
}

// 权限检查钩子
export function usePermission(permission: Permission) {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated || !user) {
    return {
      hasPermission: false,
      isLoading: false,
      currentPlan: null,
    }
  }
  
  const hasRequiredPermission = hasPermission(user.subscription.plan, permission)
  
  return {
    hasPermission: hasRequiredPermission,
    isLoading: false,
    currentPlan: user.subscription.plan,
  }
}

// 检查订阅状态
export function useSubscription() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated || !user) {
    return {
      subscription: null,
      isActive: false,
      isPro: false,
      isLoading: false,
    }
  }
  
  const isActive = user.subscription.status === 'active' && 
                  new Date() <= user.subscription.endDate
  
  const isPro = ['standard', 'pro'].includes(user.subscription.plan)
  
  return {
    subscription: user.subscription,
    isActive,
    isPro,
    isLoading: false,
  }
}

export default useAuth; 