'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Login from '@/components/Login'
import Field from '@/components/Field'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('请输入邮箱地址')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('密码重置链接已发送到您的邮箱，请查收')
      } else {
        setError(data.error || '发送失败，请稍后重试')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Login title="忘记密码" image="/images/login-pic-1.png" signIn>
      <div className="mb-5 text-base-2">
        请输入您的邮箱地址，我们将发送密码重置链接
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
          className="mb-6"
          placeholder="请输入您的邮箱"
          icon="envelope"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className="btn-primary w-full mb-4"
          disabled={isLoading}
        >
          {isLoading ? "发送中..." : "发送重置链接"}
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