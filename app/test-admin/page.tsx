'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TestAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [countdown, setCountdown] = useState(20)

  useEffect(() => {
    console.log('测试页面加载，状态:', status)
    console.log('Session数据:', session)
    
    if (status === 'loading') {
      console.log('正在加载中...')
      return
    }
    
    if (!session) {
      console.log('没有session，跳转到登录页')
      router.push('/sign-in')
      return
    }

    // 检查用户权限
    const user = session.user as any
    console.log('用户数据:', user)
    console.log('订阅信息:', user?.subscription)
    console.log('权限信息:', user?.permissions)
    
    if (!user?.subscription || user.subscription.status !== 'active') {
      console.log('订阅状态检查失败:', user?.subscription)
      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return
    }

    if (!user?.permissions?.includes('admin_access')) {
      console.log('权限检查失败:', user?.permissions)
      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return
    }
    
    console.log('权限检查通过')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user as any

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">管理后台测试页面</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">用户信息</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">权限检查</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full ${user?.subscription?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>订阅状态: {user?.subscription?.status || '未知'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full ${user?.permissions?.includes('admin_access') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>管理员权限: {user?.permissions?.includes('admin_access') ? '是' : '否'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full ${user?.subscription?.plan === 'admin' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>套餐类型: {user?.subscription?.plan || '未知'}</span>
                </div>
              </div>
              
              {countdown > 0 && (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                  <p className="text-yellow-800">
                    ⚠️ 权限检查失败，{countdown} 秒后自动跳转到首页
                  </p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">操作</h2>
              <div className="space-x-4">
                <button 
                  onClick={() => router.push('/admin')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  进入管理后台
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 