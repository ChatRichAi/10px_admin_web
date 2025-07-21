import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { FirestoreAdapter } from "@next-auth/firebase-adapter"
import { db } from './firebase-simple'
import { getUserSubscription, createUser, getUserById } from './user-service'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: FirestoreAdapter(db),
  providers: [
    // 暂时注释掉Google Provider，直到配置完成
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 从数据库查找用户
          const userSnapshot = await db
            .collection('users')
            .where('email', '==', credentials.email)
            .limit(1)
            .get()

          if (userSnapshot.empty) {
            return null
          }

          const userData = userSnapshot.docs[0].data()
          const user = { id: userSnapshot.docs[0].id, ...userData }

          // 验证密码
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            (user as any).password
          )

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: (user as any).email,
            name: (user as any).name,
            image: (user as any).image || undefined,
          }
        } catch (error) {
          console.error('认证错误:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.uid as string
        
        // 获取完整的用户信息
        try {
          const fullUser = await getUserById(token.uid as string)
          if (fullUser) {
            session.user.createdAt = fullUser.createdAt.toISOString()
            session.user.subscription = fullUser.subscription
            // 添加权限信息
            ;(session.user as any).permissions = fullUser.permissions
          } else {
            // 如果获取不到用户信息，使用默认订阅
            session.user.subscription = {
              plan: 'free',
              status: 'expired',
              startDate: new Date(),
              endDate: new Date(),
            }
            ;(session.user as any).permissions = []
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          session.user.subscription = {
            plan: 'free',
            status: 'expired',
            startDate: new Date(),
            endDate: new Date(),
          }
          ;(session.user as any).permissions = []
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // 检查用户是否已存在
          const userSnapshot = await db
            .collection('users')
            .where('email', '==', user.email)
            .limit(1)
            .get()

          if (userSnapshot.empty) {
            // 创建新用户
            await createUser({
              email: user.email!,
              name: user.name!,
              image: user.image || undefined,
              provider: 'google',
            })
          }
        } catch (error) {
          console.error('Google登录处理错误:', error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/sign-in',
    // signUp: '/sign-up', // 自定义注册页面
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions) 