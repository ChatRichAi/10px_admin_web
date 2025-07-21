'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Login from '@/components/Login'
import Field from '@/components/Field'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('无效的重置链接')
      return
    }

    // 验证重置令牌
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/validate-reset-token?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setIsValidToken(true)
      } else {
        setError(data.error || '重置链接已过期或无效')
      }
    } catch (error) {
      setError('验证失败，请稍后重试')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('请填写所有字段')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('密码重置成功！正在跳转到登录页面...')
        setTimeout(() => {
          router.push('/sign-in')
        }, 2000)
      } else {
        setError(data.error || '密码重置失败，请稍后重试')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Login title="密码重置" image="/images/login-pic-1.png" signIn>
        <div className="text-center">
          <div className="text-red-600 mb-4">无效的重置链接</div>
          <Link href="/forgot-password" className="text-primary hover:underline">
            重新发送重置链接
          </Link>
        </div>
      </Login>
    )
  }

  if (!isValidToken && !error) {
    return (
      <Login title="密码重置" image="/images/login-pic-1.png" signIn>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>验证重置链接中...</p>
        </div>
      </Login>
    )
  }

  return (
    <Login title="重置密码" image="/images/login-pic-1.png" signIn>
      <div className="mb-5 text-base-2">
        请输入您的新密码
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Field
          className="mb-3"
          placeholder="请输入新密码"
          icon="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <Field
          className="mb-6"
          placeholder="请确认新密码"
          icon="password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className="btn-primary w-full mb-4"
          disabled={isLoading || !isValidToken}
        >
          {isLoading ? "重置中..." : "重置密码"}
        </button>
      </form>
      
      <div className="text-center text-sm text-base-2">
        想起密码了？
        <Link href="/sign-in" className="text-primary ml-1 hover:underline">
          返回登录
        </Link>
      </div>
    </Login>
  )
} 