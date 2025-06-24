'use client'

import { useSubscription } from '@/hooks/useAuth'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SubscriptionStatusProps {
  showDetails?: boolean
}

export default function SubscriptionStatus({ showDetails = true }: SubscriptionStatusProps) {
  const { subscription, isActive, isPro, isLoading } = useSubscription()
  
  if (isLoading) {
    return <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
  }
  
  if (!subscription) {
    return null
  }
  
  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
  
  const getStatusText = () => {
    switch (subscription.status) {
      case 'active':
        return '有效'
      case 'cancelled':
        return '已取消'
      case 'past_due':
        return '逾期'
      case 'expired':
        return '已过期'
      default:
        return '未知'
    }
  }
  
  const getPlanText = () => {
    switch (subscription.plan) {
      case 'starter':
        return '入门版'
      case 'standard':
        return '标准版'
      case 'pro':
        return '专业版'
      default:
        return '免费版'
    }
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">订阅状态</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">当前套餐：</span>
          <span className="font-medium">{getPlanText()}</span>
        </div>
        
        {showDetails && subscription.status !== 'expired' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">开始时间：</span>
              <span>{format(subscription.startDate, 'PPP', { locale: zhCN })}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">结束时间：</span>
              <span>{format(subscription.endDate, 'PPP', { locale: zhCN })}</span>
            </div>
            
            {subscription.cancelAtPeriodEnd && (
              <div className="text-yellow-600 text-sm">
                订阅将在{format(subscription.endDate, 'PPP', { locale: zhCN })}后取消
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {!isActive && (
          <Link 
            href="/pricing"
            className="btn-primary w-full"
          >
            {subscription.plan === 'free' ? '选择套餐' : '续费订阅'}
          </Link>
        )}
        
        {isActive && (
          <Link 
            href="/subscription/manage"
            className="btn-secondary w-full"
          >
            管理订阅
          </Link>
        )}
      </div>
    </div>
  )
} 