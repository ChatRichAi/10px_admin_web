import Stripe from 'stripe'
import { PlanType } from '@/types/user'

// 只有在实际配置了有效的Stripe密钥时才初始化
const hasValidStripeKey = process.env.STRIPE_SECRET_KEY && 
  process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here'

export const stripe = hasValidStripeKey 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    })
  : null

// Stripe价格ID配置
export const STRIPE_PRICE_IDS: Record<PlanType, { monthly: string; yearly: string }> = {
  free: {
    monthly: '',
    yearly: '',
  },
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
  },
  standard: {
    monthly: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
}

// 创建Stripe客户
export async function createStripeCustomer(
  email: string,
  name: string,
  userId: string
): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe未配置')
  }
  
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    })

    return customer.id
  } catch (error) {
    console.error('创建Stripe客户失败:', error)
    throw new Error('创建Stripe客户失败')
  }
}

// 创建订阅
export async function createSubscription(
  customerId: string,
  priceId: string,
  userId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
      },
    })

    return subscription
  } catch (error) {
    console.error('创建订阅失败:', error)
    throw new Error('创建订阅失败')
  }
}

// 创建结账会话
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    })

    return session
  } catch (error) {
    console.error('创建结账会话失败:', error)
    throw new Error('创建结账会话失败')
  }
}

// 创建客户门户会话
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('创建客户门户会话失败:', error)
    throw new Error('创建客户门户会话失败')
  }
}

// 取消订阅
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return subscription
  } catch (error) {
    console.error('取消订阅失败:', error)
    throw new Error('取消订阅失败')
  }
}

// 立即取消订阅
export async function cancelSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('立即取消订阅失败:', error)
    throw new Error('立即取消订阅失败')
  }
}

// 恢复订阅
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return subscription
  } catch (error) {
    console.error('恢复订阅失败:', error)
    throw new Error('恢复订阅失败')
  }
}

// 获取订阅信息
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('获取订阅信息失败:', error)
    throw new Error('获取订阅信息失败')
  }
}

// 验证webhook签名
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  endpointSecret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  } catch (error) {
    console.error('Webhook签名验证失败:', error)
    throw new Error('Webhook签名验证失败')
  }
}

// 根据套餐获取价格ID
export function getPriceId(plan: PlanType, billing: 'monthly' | 'yearly'): string {
  return STRIPE_PRICE_IDS[plan][billing]
} 