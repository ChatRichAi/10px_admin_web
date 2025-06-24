import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { updateUserSubscription } from '@/lib/user-service'
import { PlanType } from '@/types/user'

// 根据Stripe价格ID映射到套餐类型
const PRICE_TO_PLAN_MAP: Record<string, PlanType> = {
  [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '']: 'starter',
  [process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '']: 'starter',
  [process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID || '']: 'standard',
  [process.env.STRIPE_STANDARD_YEARLY_PRICE_ID || '']: 'standard',
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '']: 'pro',
  [process.env.STRIPE_PRO_YEARLY_PRICE_ID || '']: 'pro',
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    return NextResponse.json(
      { error: '缺少Stripe签名' },
      { status: 400 }
    )
  }
  
  try {
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      default:
        console.log(`未处理的事件类型: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook处理失败:', error)
    return NextResponse.json(
      { error: 'Webhook处理失败' },
      { status: 400 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.userId
  if (!userId) return
  
  const subscriptionId = session.subscription
  if (!subscriptionId) return
  
  // 获取订阅详情
  const { getSubscription } = await import('@/lib/stripe')
  const subscription = await getSubscription(subscriptionId)
  
  const priceId = subscription.items.data[0]?.price.id
  const plan = PRICE_TO_PLAN_MAP[priceId] || 'free'
  
  await updateUserSubscription(userId, {
    plan,
    status: 'active',
    startDate: new Date((subscription as any).current_period_start * 1000),
    endDate: new Date((subscription as any).current_period_end * 1000),
    stripeSubscriptionId: subscriptionId,
  })
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription
  if (!subscriptionId) return
  
  const { getSubscription } = await import('@/lib/stripe')
  const subscription = await getSubscription(subscriptionId)
  
  const userId = subscription.metadata?.userId
  if (!userId) return
  
  await updateUserSubscription(userId, {
    status: 'active',
    startDate: new Date((subscription as any).current_period_start * 1000),
    endDate: new Date((subscription as any).current_period_end * 1000),
  })
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription
  if (!subscriptionId) return
  
  const { getSubscription } = await import('@/lib/stripe')
  const subscription = await getSubscription(subscriptionId)
  
  const userId = subscription.metadata?.userId
  if (!userId) return
  
  await updateUserSubscription(userId, {
    status: 'past_due',
  })
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.userId
  if (!userId) return
  
  const priceId = subscription.items.data[0]?.price.id
  const plan = PRICE_TO_PLAN_MAP[priceId] || 'free'
  
  await updateUserSubscription(userId, {
    plan,
    status: (subscription as any).status,
    startDate: new Date((subscription as any).current_period_start * 1000),
    endDate: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
  })
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.userId
  if (!userId) return
  
  await updateUserSubscription(userId, {
    status: 'cancelled',
    plan: 'free',
  })
} 