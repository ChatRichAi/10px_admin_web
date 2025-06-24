import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { Permission } from '@/lib/permissions'

// 服务器端权限验证中间件
export async function requireAuth(permission?: Permission) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  if (permission && !hasPermission(session.user.subscription.plan, permission)) {
    return NextResponse.json({ 
      error: '权限不足', 
      requiredPermission: permission,
      currentPlan: session.user.subscription.plan
    }, { status: 403 })
  }
  
  return session
}

// 检查用户是否有活跃订阅
export async function requireActiveSubscription() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  const isActive = session.user.subscription.status === 'active' && 
                  new Date() <= session.user.subscription.endDate
  
  if (!isActive) {
    return NextResponse.json({ 
      error: '订阅已过期，请续费', 
      subscription: session.user.subscription 
    }, { status: 402 })
  }
  
  return session
}

// 检查管理员权限
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  
  // 简单的管理员检查 - 可以根据需要扩展
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  
  if (!adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: '无管理员权限' }, { status: 403 })
  }
  
  return session
} 