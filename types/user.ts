export interface User {
  id: string
  email: string
  name: string
  image?: string
  subscription: UserSubscription
  permissions: string[]
  createdAt: Date
  updatedAt: Date
  provider?: 'google' | 'credentials'
  stripeCustomerId?: string
}

export interface UserSubscription {
  plan: PlanType
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  stripeSubscriptionId?: string
  paymentMethod?: string
  cancelAtPeriodEnd?: boolean
}

export type PlanType = 'free' | 'starter' | 'standard' | 'pro'

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing' | 'past_due'

export interface CreateUserData {
  email: string
  name: string
  image?: string
  provider?: 'google' | 'credentials'
  password?: string
}

export interface PlanFeatures {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  permissions: string[]
  stripePriceId: {
    monthly: string
    yearly: string
  }
  popular?: boolean
}

// 扩展NextAuth的类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      subscription: UserSubscription
      createdAt?: string | Date
    }
  }

  interface User {
    id: string
    subscription?: UserSubscription
    createdAt?: string | Date
  }
} 