import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/middleware/auth'
import { db } from '@/lib/firebase'
import { PlanType, SubscriptionStatus } from '@/types/user'

// 获取所有订阅统计
export async function GET() {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const usersSnapshot = await db.collection('users').get()
    const stats = {
      totalUsers: 0,
      activeSubscriptions: 0,
      freeUsers: 0,
      starterUsers: 0,
      standardUsers: 0,
      proUsers: 0,
      monthlyRevenue: 0,
      cancelledSubscriptions: 0,
    }

    const planPrices = {
      starter: 128,
      standard: 198,
      pro: 498,
    }

    usersSnapshot.forEach(doc => {
      const data = doc.data()
      stats.totalUsers++

      const plan = data.subscription?.plan || 'free'
      const status = data.subscription?.status || 'expired'

      if (status === 'active') {
        stats.activeSubscriptions++
        if (plan !== 'free') {
          stats.monthlyRevenue += planPrices[plan as keyof typeof planPrices] || 0
        }
      }

      if (status === 'cancelled') {
        stats.cancelledSubscriptions++
      }

      switch (plan) {
        case 'free':
          stats.freeUsers++
          break
        case 'starter':
          stats.starterUsers++
          break
        case 'standard':
          stats.standardUsers++
          break
        case 'pro':
          stats.proUsers++
          break
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取订阅统计失败:', error)
    return NextResponse.json(
      { error: '获取订阅统计失败' },
      { status: 500 }
    )
  }
}

// 更新用户订阅
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const { userId, subscription } = await request.json()

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: '用户ID和订阅信息是必需的' },
        { status: 400 }
      )
    }

    const { plan, status, startDate, endDate } = subscription

    // 验证套餐类型
    const validPlans: PlanType[] = ['free', 'starter', 'standard', 'pro']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: '无效的套餐类型' },
        { status: 400 }
      )
    }

    // 验证状态
    const validStatuses: SubscriptionStatus[] = ['active', 'cancelled', 'expired', 'trialing', 'past_due']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '无效的订阅状态' },
        { status: 400 }
      )
    }

    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const updateData = {
      'subscription.plan': plan,
      'subscription.status': status,
      'subscription.startDate': startDate ? new Date(startDate) : new Date(),
      'subscription.endDate': endDate ? new Date(endDate) : new Date(),
      updatedAt: new Date(),
    }

    await userRef.update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新订阅失败:', error)
    return NextResponse.json(
      { error: '更新订阅失败' },
      { status: 500 }
    )
  }
}

// 批量更新订阅状态
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const { action, userIds, plan, status } = await request.json()

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: '操作类型和用户ID列表是必需的' },
        { status: 400 }
      )
    }

    const batch = db.batch()

    for (const userId of userIds) {
      const userRef = db.collection('users').doc(userId)
      
      switch (action) {
        case 'upgrade':
          if (!plan) {
            return NextResponse.json(
              { error: '升级操作需要指定套餐' },
              { status: 400 }
            )
          }
          batch.update(userRef, {
            'subscription.plan': plan,
            'subscription.status': 'active',
            'subscription.startDate': new Date(),
            'subscription.endDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
            updatedAt: new Date(),
          })
          break

        case 'cancel':
          batch.update(userRef, {
            'subscription.status': 'cancelled',
            'subscription.cancelAtPeriodEnd': true,
            updatedAt: new Date(),
          })
          break

        case 'reactivate':
          batch.update(userRef, {
            'subscription.status': 'active',
            'subscription.cancelAtPeriodEnd': false,
            updatedAt: new Date(),
          })
          break

        case 'expire':
          batch.update(userRef, {
            'subscription.status': 'expired',
            updatedAt: new Date(),
          })
          break

        default:
          return NextResponse.json(
            { error: '无效的操作类型' },
            { status: 400 }
          )
      }
    }

    await batch.commit()

    return NextResponse.json({ 
      success: true, 
      message: `成功${action === 'upgrade' ? '升级' : action === 'cancel' ? '取消' : action === 'reactivate' ? '重新激活' : '过期'}了 ${userIds.length} 个用户的订阅` 
    })
  } catch (error) {
    console.error('批量操作失败:', error)
    return NextResponse.json(
      { error: '批量操作失败' },
      { status: 500 }
    )
  }
} 