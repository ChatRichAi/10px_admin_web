import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/user-service'
import { createStripeCustomer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()
    
    // 验证输入
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: '邮箱、姓名和密码不能为空' },
        { status: 400 }
      )
    }
    
    // 检查用户是否已存在
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: '用户已存在' },
        { status: 400 }
      )
    }
    
    // 创建用户
    const userId = await createUser({
      email,
      name,
      password,
      provider: 'credentials',
    })
    
    // 如果配置了Stripe，创建Stripe客户
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
      try {
        const stripeCustomerId = await createStripeCustomer(email, name, userId)
        console.log('Stripe客户创建成功:', stripeCustomerId)
        // 这里可以更新用户的stripeCustomerId，如果需要的话
      } catch (stripeError) {
        console.error('创建Stripe客户失败:', stripeError)
        // 不影响用户注册流程
      }
    } else {
      console.log('跳过Stripe客户创建 - 未配置Stripe密钥')
    }
    
    return NextResponse.json({
      message: '注册成功',
      userId,
    })
    
  } catch (error) {
    console.error('注册失败 - 详细错误:', error)
    console.error('错误堆栈:', error instanceof Error ? error.stack : 'Unknown error')
    return NextResponse.json(
      { 
        error: '注册失败，请稍后重试',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 