'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'

// Firebase配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// 初始化Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// 用户类型定义
export interface User {
  uid: string
  email: string | null
  name: string | null
  image: string | null
  permissions: string[]
  role: string
  createdAt: string
  lastLoginAt: string
}

// 认证上下文类型
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // 获取用户详细信息（包括权限）
          const token = await firebaseUser.getIdToken()
          const response = await fetch('/api/admin/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // 如果API调用失败，使用基本用户信息
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              image: firebaseUser.photoURL,
              permissions: [],
              role: 'user',
              createdAt: firebaseUser.metadata.creationTime || '',
              lastLoginAt: firebaseUser.metadata.lastSignInTime || '',
            })
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error('退出登录失败:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证的hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 