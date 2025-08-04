export interface User {
  id: string
  name: string
  email: string
  image?: string
  subscription: {
    plan: 'free' | 'starter' | 'standard' | 'pro'
    status: 'active' | 'cancelled' | 'expired' | 'past_due'
    startDate?: string
    endDate?: string
  }
  permissions: string[]
  role: 'user' | 'admin' | 'moderator'
  createdAt: string
  lastLoginAt: string
  isActive: boolean
}

export interface UserUpdateData {
  name?: string
  email?: string
  subscription?: {
    plan?: 'free' | 'starter' | 'standard' | 'pro'
    status?: 'active' | 'cancelled' | 'expired' | 'past_due'
  }
  permissions?: string[]
  role?: 'user' | 'admin' | 'moderator'
  isActive?: boolean
} 