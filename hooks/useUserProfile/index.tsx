'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface UserProfileData {
  id: string
  name: string
  email: string
  image?: string
  location?: string
  bio?: string
  website?: string
  twitter?: string
  createdAt: string
  subscription: {
    plan: string
    status: string
  }
}

export interface UpdateProfileData {
  name?: string
  image?: string | null
  location?: string
  bio?: string
  website?: string
  twitter?: string
}

export function useUserProfile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取用户资料
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        throw new Error('获取用户信息失败')
      }

      const data = await response.json()
      setProfile(data.user)
      
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      setError(error.message || '获取用户信息失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 更新用户资料
  const updateProfile = async (updateData: UpdateProfileData) => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存失败')
      }

      // 重新获取最新数据
      await fetchProfile()
      
      return { success: true, message: '个人信息保存成功！' }
      
    } catch (error: any) {
      console.error('保存失败:', error)
      setError(error.message || '保存失败，请重试')
      return { success: false, error: error.message }
    } finally {
      setIsSaving(false)
    }
  }

  // 清除错误
  const clearError = () => {
    setError(null)
  }

  // 组件挂载时获取用户信息
  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  }
}

export default useUserProfile; 