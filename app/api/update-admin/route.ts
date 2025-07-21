import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-simple'

export async function POST(request: NextRequest) {
  try {
    console.log('开始更新管理员订阅状态...')
    
    const { email } = await request.json()
    console.log('更新邮箱:', email)

    // 查找管理员用户
    const usersRef = db.collection('users')
    const querySnapshot = await usersRef.where('email', '==', email).get()

    if (querySnapshot.empty) {
      console.log('用户不存在')
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const userDoc = querySnapshot.docs[0]
    
    // 更新订阅状态
    const updateData = {
      subscription: {
        plan: 'admin',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100年后过期
        stripeCustomerId: null,
        stripeSubscriptionId: null
      },
      permissions: ['admin_access'],
      updatedAt: new Date().toISOString()
    }

    await userDoc.ref.update(updateData)
    console.log('管理员订阅状态更新成功')

    return NextResponse.json({
      message: '管理员订阅状态更新成功',
      email: email
    })
  } catch (error) {
    console.error('更新管理员订阅状态错误:', error)
    return NextResponse.json(
      { 
        error: '服务器错误，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 