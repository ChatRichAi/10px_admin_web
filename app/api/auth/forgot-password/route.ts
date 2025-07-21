import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址是必需的' },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const usersRef = db.collection('users')
    const querySnapshot = await usersRef.where('email', '==', email).get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: '该邮箱地址未注册' },
        { status: 404 }
      )
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1小时后过期

    // 保存重置令牌到数据库
    const userDoc = querySnapshot.docs[0]
    await userDoc.ref.update({
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString(),
    })

    // 发送重置邮件（这里需要配置邮件服务）
    // 暂时返回成功消息，实际项目中需要集成邮件服务
    console.log(`密码重置链接: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)

    return NextResponse.json({
      message: '密码重置链接已发送到您的邮箱',
    })
  } catch (error) {
    console.error('密码重置错误:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
} 