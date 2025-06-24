'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { PlanType } from '@/types/user'
import CurrencyFormat from '@/components/CurrencyFormat'
import Icon from '@/components/Icon'
import Image from '@/components/Image'

interface PricingCardProps {
  plan: PlanType
  title: string
  description: string
  image: string
  priceMonthly: number
  priceYearly: number
  features: string[]
  popular?: boolean
  billingType: 'monthly' | 'yearly'
  onSubscribe?: (plan: PlanType, billing: 'monthly' | 'yearly') => void
}

export default function PricingCard({
  plan,
  title,
  description,
  image,
  priceMonthly,
  priceYearly,
  features,
  popular = false,
  billingType,
  onSubscribe,
}: PricingCardProps) {
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const price = billingType === 'monthly' ? priceMonthly : priceYearly
  const isCurrentPlan = user?.subscription?.plan === plan
  const isActivePlan = isCurrentPlan && user?.subscription?.status === 'active'
  
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      // 跳转到登录页面
      window.location.href = '/sign-in'
      return
    }
    
    if (isActivePlan) {
      // 跳转到管理订阅页面
      window.location.href = '/subscription/manage'
      return
    }
    
    setIsLoading(true)
    
    try {
      if (onSubscribe) {
        await onSubscribe(plan, billingType)
      } else {
        // 默认行为：调用API创建结账会话
        const response = await fetch('/api/subscription/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            billing: billingType,
          }),
        })
        
        const data = await response.json()
        
        if (response.ok && data.url) {
          window.location.href = data.url
        } else {
          throw new Error(data.error || '创建订阅失败')
        }
      }
    } catch (error) {
      console.error('订阅失败:', error)
      alert('订阅失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  const getButtonText = () => {
    if (isLoading) return '处理中...'
    if (isActivePlan) return '当前套餐'
    if (isCurrentPlan) return '续费订阅'
    if (plan === 'free') return '免费使用'
    return `升级到${title}`
  }
  
  const getButtonClass = () => {
    // 用户未登录或未订阅，标准版高亮
    if (!user?.subscription?.plan && popular) return 'btn-white text-black';
    // 用户已订阅，当前套餐高亮
    if (isActivePlan) return 'btn-white text-black cursor-not-allowed';
    return 'btn-gray';
  }
  
  return (
    <div className={`flex flex-col flex-1 p-1 rounded-2xl bg-theme-on-surface-1 ${
      popular ? 'shadow-depth-1' : ''
    }`}>
      <div className={`relative px-7 py-6 border border-theme-stroke rounded-xl md:px-4 ${
        popular ? 'bg-theme-light shadow-depth-1 border-transparent' : ''
      }`}>
        {popular && (
          <div className="absolute top-1 right-1 px-5 py-0.5 bg-levender-300 rounded-full text-caption-2 font-bold text-theme-primary-fixed">
            热门推荐
          </div>
        )}
        
        <div className="flex items-center mb-2 text-title-1s">
          <div className="mr-3 text-0">
            <Image
              className="crypto-logo w-6"
              src={image}
              width={24}
              height={24}
              alt=""
            />
          </div>
          {title}
        </div>
        
        <div className="flex mb-8 text-h3 items-end">
          <div className="mr-3">$</div>
          <CurrencyFormat value={price} />
          {billingType === 'monthly' && (
            <>
              <span className="mx-1 text-theme-tertiary">/</span>
              <span className="text-xs text-theme-tertiary font-bold align-bottom">月</span>
            </>
          )}
          {billingType === 'yearly' && (
            <>
              <span className="mx-1 text-theme-tertiary">/</span>
              <span className="text-xs text-theme-tertiary font-bold align-bottom">年</span>
            </>
          )}
        </div>
        
        <div className="mb-8 line-clamp-3 text-body-2s text-theme-secondary 2xl:line-clamp-4">
          {description}
        </div>
        
        {isActivePlan ? (
          <div className="flex justify-between items-center h-12 px-6 rounded-full bg-theme-secondary text-button-1 text-theme-white-fixed">
            当前套餐
            <Icon className="fill-theme-white-fixed" name="check" />
          </div>
        ) : (
          <button
            className={`w-full ${getButtonClass()}`}
            onClick={handleSubscribe}
            disabled={isLoading || (isActivePlan && plan !== 'free')}
          >
            {getButtonText()}
          </button>
        )}
      </div>
      
      <div className="grow pt-8 px-7 pb-9 space-y-5 md:px-4">
        {features.map((feature, index) => (
          <div className="flex text-body-2s" key={index}>
            <Icon
              className="shrink-0 mr-3 fill-primary-2"
              name="check-circle"
            />
            <div className="flex items-center grow">
              {feature}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 