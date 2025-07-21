'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { authAPI, userAPI } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  image?: string
  subscription: {
    plan: string
    status: string
    startDate: string
    endDate: string
  }
  permissions: string[]
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 检查用户是否已登录
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      const result = await authAPI.getCurrentUser()
      if (result.success) {
        setUser(result.user)
      } else {
        // Token 无效，清除本地存储
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
      }
    } catch (error) {
      console.error('认证检查失败:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authAPI.login({ email, password })
      if (result.success) {
        localStorage.setItem('auth_token', result.token)
        localStorage.setItem('user_info', JSON.stringify(result.user))
        setUser(result.user)
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const result = await userAPI.getCurrentUser()
      if (result.success) {
        setUser(result.user)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 