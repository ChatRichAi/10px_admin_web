import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/middleware/auth'
import { createCheckoutSession, getPriceId } from '@/lib/stripe'
import { getUserById, updateUserStripeCustomerId } from '@/lib/user-service'
import { PlanType } from '@/types/user'

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  
  if ('error' in authResult) {
    return authResult
  }
  
  const session = authResult
  
  try {
    const { plan, billing }: { plan: PlanType; billing: 'monthly' | 'yearly' } = await request.json()
    
    // 验证输入
    if (!plan || !billing) {
      return NextResponse.json(
        { error: '套餐和计费周期不能为空' },
        { status: 400 }
      )
    }
    
    // 获取用户信息
    const user = await getUserById((session as any).user.id)
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }
    
    // 如果用户没有Stripe客户ID，创建一个
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const { createStripeCustomer } = await import('@/lib/stripe')
      stripeCustomerId = await createStripeCustomer(
        user.email,
        user.name,
        user.id
      )
      await updateUserStripeCustomerId(user.id, stripeCustomerId)
    }
    
    // 获取价格ID
    const priceId = getPriceId(plan, billing)
    if (!priceId) {
      return NextResponse.json(
        { error: '价格配置错误' },
        { status: 400 }
      )
    }
    
    // 创建结账会话
    const checkoutSession = await createCheckoutSession(
      stripeCustomerId,
      priceId,
      user.id,
      `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.NEXTAUTH_URL}/pricing`
    )
    
    return NextResponse.json({
      url: checkoutSession.url,
    })
    
  } catch (error) {
    console.error('创建结账会话失败:', error)
    return NextResponse.json(
      { error: '创建结账会话失败' },
      { status: 500 }
    )
  }
} 