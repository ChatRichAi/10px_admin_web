import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // 从 PandaFactor 服务获取因子列表
    const response = await fetch(`http://127.0.0.1:8000/api/factors?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'success',
        data: data,
        timestamp: new Date().toISOString(),
      });
    } else {
      // 如果 PandaFactor 服务不可用，返回模拟数据
      return NextResponse.json({
        status: 'success',
        data: {
          factors: [
            {
              id: 'factor_001',
              name: '动量因子',
              description: '基于价格动量的技术指标因子',
              category: '技术指标',
              author: 'PandaAI',
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-20T15:30:00Z',
              status: 'active',
            },
            {
              id: 'factor_002',
              name: '波动率因子',
              description: '基于历史波动率的风险因子',
              category: '风险指标',
              author: 'PandaAI',
              created_at: '2024-01-16T09:00:00Z',
              updated_at: '2024-01-20T14:20:00Z',
              status: 'active',
            },
            {
              id: 'factor_003',
              name: '成交量因子',
              description: '基于成交量变化的价格预测因子',
              category: '量价关系',
              author: 'PandaAI',
              created_at: '2024-01-17T11:00:00Z',
              updated_at: '2024-01-20T16:45:00Z',
              status: 'active',
            },
          ],
          total: 3,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
        message: 'PandaFactor 服务不可用，返回模拟数据',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('获取因子列表失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '获取因子列表失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, code, type } = body;

    // 验证必需字段
    if (!name || !description || !category) {
      return NextResponse.json({
        status: 'error',
        message: '缺少必需字段: name, description, category',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // 创建新因子
    const factorData = {
      name,
      description,
      category,
      code: code || '',
      type: type || 'python',
      author: 'Current User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft',
    };

    // 这里可以添加保存到数据库的逻辑
    // 目前返回成功响应
    return NextResponse.json({
      status: 'success',
      message: '因子创建成功',
      data: {
        id: `factor_${Date.now()}`,
        ...factorData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('创建因子失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '创建因子失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
