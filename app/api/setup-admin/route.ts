import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-simple'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('开始创建管理员账户...')
    
    const { email, password } = await request.json()
    console.log('接收到的数据:', { email, password: password ? '***' : 'undefined' })

    if (!email || !password) {
      console.log('缺少必要参数')
      return NextResponse.json(
        { error: '邮箱和密码是必需的' },
        { status: 400 }
      )
    }

    // 检查Firebase连接
    console.log('检查Firebase连接...')
    const testDoc = await db.collection('test').doc('connection').get()
    console.log('Firebase连接成功')

    // 检查用户是否已存在
    console.log('检查用户是否已存在...')
    const usersRef = db.collection('users')
    const querySnapshot = await usersRef.where('email', '==', email).get()

    if (!querySnapshot.empty) {
      console.log('用户已存在')
      return NextResponse.json(
        { error: '用户已存在' },
        { status: 409 }
      )
    }

    // 加密密码
    console.log('加密密码...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建管理员用户
    console.log('创建管理员用户对象...')
    const adminUser = {
      email,
      name: '管理员',
      password: hashedPassword,
      image: null,
      emailVerified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: ['admin_access'],
      subscription: {
        plan: 'admin',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100年后过期
        stripeCustomerId: null,
        stripeSubscriptionId: null
      }
    }

    // 保存到数据库
    console.log('保存到数据库...')
    const docRef = await usersRef.add(adminUser)
    console.log('管理员账户创建成功，文档ID:', docRef.id)

    return NextResponse.json({
      message: '管理员账户创建成功',
      email: email,
      userId: docRef.id
    })
  } catch (error) {
    console.error('创建管理员账户错误:', error)
    console.error('错误堆栈:', error instanceof Error ? error.stack : '未知错误')
    return NextResponse.json(
      { 
        error: '服务器错误，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 