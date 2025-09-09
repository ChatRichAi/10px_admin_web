import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 检查 PandaFactor 服务状态
    const response = await fetch('http://127.0.0.1:8000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 设置超时时间
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'online',
        message: 'PandaFactor 服务运行正常',
        data: data,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'PandaFactor 服务响应异常',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  } catch (error) {
    console.error('检查 PandaFactor 服务状态失败:', error);
    return NextResponse.json({
      status: 'offline',
      message: 'PandaFactor 服务不可用',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      // 这里可以添加启动服务的逻辑
      // 由于安全考虑，通常不建议通过 API 直接启动系统服务
      return NextResponse.json({
        status: 'success',
        message: '服务启动请求已接收，请手动启动 PandaFactor 服务',
        instructions: [
          '1. 打开终端',
          '2. 进入 panda_quantflow 目录',
          '3. 运行: ./manage_service.sh start',
        ],
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: 'error',
      message: '不支持的操作',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  } catch (error) {
    console.error('处理 PandaFactor 服务请求失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '处理请求失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
