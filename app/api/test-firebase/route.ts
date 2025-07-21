import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-simple'

export async function GET() {
  try {
    // 测试Firebase连接
    const testDoc = await db.collection('test').doc('connection').get()
    
    return NextResponse.json({
      success: true,
      message: 'Firebase连接成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Firebase连接测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 