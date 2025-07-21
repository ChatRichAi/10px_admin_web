import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/middleware/auth'
import { db } from '@/lib/firebase-simple'
import { User } from '@/types/user'

// 获取所有用户
export async function GET() {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const usersSnapshot = await db.collection('users').get()
    const users: User[] = []

    usersSnapshot.forEach(doc => {
      const data = doc.data()
      users.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        image: data.image,
        subscription: {
          plan: data.subscription?.plan || 'free',
          status: data.subscription?.status || 'expired',
          startDate: data.subscription?.startDate?.toDate() || new Date(),
          endDate: data.subscription?.endDate?.toDate() || new Date(),
          stripeSubscriptionId: data.subscription?.stripeSubscriptionId,
          paymentMethod: data.subscription?.paymentMethod,
          cancelAtPeriodEnd: data.subscription?.cancelAtPeriodEnd,
        },
        permissions: data.permissions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        provider: data.provider,
        stripeCustomerId: data.stripeCustomerId,
      })
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
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

    // 只允许更新特定字段
    const allowedUpdates = {
      name: updates.name,
      subscription: updates.subscription,
      permissions: updates.permissions,
      updatedAt: new Date(),
    }

    // 过滤掉undefined的字段
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    )

    await userRef.update(filteredUpdates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新用户失败:', error)
    return NextResponse.json(
      { error: '更新用户失败' },
      { status: 500 }
    )
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必需的' },
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

    await userRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    )
  }
} 