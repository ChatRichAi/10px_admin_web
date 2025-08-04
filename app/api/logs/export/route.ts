import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/logs/export?${searchParams}`, {
      headers: {
        'Authorization': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const contentType = response.headers.get('content-type')
    const contentDisposition = response.headers.get('content-disposition')
    const data = await response.blob()

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Disposition': contentDisposition || 'attachment'
      }
    })
  } catch (error) {
    console.error('日志导出API代理错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
} 