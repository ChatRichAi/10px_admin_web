import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/logs/${params.logId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('日志删除API代理错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 