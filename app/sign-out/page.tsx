'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ 
          callbackUrl: '/sign-in',
          redirect: false 
        })
        router.push('/sign-in')
      } catch (error) {
        console.error('注销失败:', error)
        router.push('/')
      }
    }

    handleSignOut()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在注销...</p>
      </div>
    </div>
  )
} 