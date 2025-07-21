import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-simple'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      )
    }

    console.log('查询用户:', email)

    // 查找用户
    const usersRef = db.collection('users')
    const querySnapshot = await usersRef.where('email', '==', email).get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    console.log('用户原始数据:', userData)

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json(
      { 
        error: '服务器错误，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 