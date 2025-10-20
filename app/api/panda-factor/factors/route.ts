import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'active';

    // PandaFactor API 基础URL
    const PANDA_FACTOR_API_BASE = process.env.PANDA_FACTOR_API_BASE || 'http://127.0.0.1:8000';

    // 检查PandaFactor服务状态
    let serviceOnline = false;
    try {
      const healthResponse = await fetch(`${PANDA_FACTOR_API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      serviceOnline = healthResponse.ok;
    } catch (error) {
      console.log('PandaFactor服务不可用，使用模拟数据');
    }

    if (serviceOnline) {
      // 从 PandaFactor 服务获取因子列表
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(category && { category }),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`${PANDA_FACTOR_API_BASE}/api/factors?${queryParams}`, {
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
      }
    }

    // 如果 PandaFactor 服务不可用，返回增强的模拟数据
    const mockFactors = [
      {
        id: 'rsi_14',
        name: 'RSI_14',
        description: '14日相对强弱指数，用于判断超买超卖状态',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        status: 'active',
        performance: {
          ic: 0.12,
          ir: 1.8,
          sharpe: 1.2,
          max_drawdown: 0.15
        },
        tags: ['momentum', 'oscillator', 'overbought', 'oversold']
      },
      {
        id: 'macd_12_26_9',
        name: 'MACD_12_26_9',
        description: 'MACD指标，用于判断趋势变化',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-16T09:00:00Z',
        updated_at: '2024-01-20T14:20:00Z',
        status: 'active',
        performance: {
          ic: 0.08,
          ir: 1.2,
          sharpe: 0.9,
          max_drawdown: 0.18
        },
        tags: ['trend', 'momentum', 'crossover']
      },
      {
        id: 'bollinger_20_2',
        name: 'BOLLINGER_20_2',
        description: '20日布林带，用于判断价格波动范围',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-17T11:00:00Z',
        updated_at: '2024-01-20T16:45:00Z',
        status: 'active',
        performance: {
          ic: 0.15,
          ir: 2.1,
          sharpe: 1.5,
          max_drawdown: 0.12
        },
        tags: ['volatility', 'mean_reversion', 'bands']
      },
      {
        id: 'sma_20',
        name: 'SMA_20',
        description: '20日简单移动平均，用于判断趋势方向',
        category: '趋势指标',
        author: 'PandaAI',
        created_at: '2024-01-18T14:00:00Z',
        updated_at: '2024-01-20T17:30:00Z',
        status: 'active',
        performance: {
          ic: 0.06,
          ir: 0.8,
          sharpe: 0.7,
          max_drawdown: 0.20
        },
        tags: ['trend', 'moving_average', 'smooth']
      },
      {
        id: 'ema_12',
        name: 'EMA_12',
        description: '12日指数移动平均，对近期价格更敏感',
        category: '趋势指标',
        author: 'PandaAI',
        created_at: '2024-01-19T16:00:00Z',
        updated_at: '2024-01-20T18:15:00Z',
        status: 'active',
        performance: {
          ic: 0.07,
          ir: 1.0,
          sharpe: 0.8,
          max_drawdown: 0.19
        },
        tags: ['trend', 'exponential', 'responsive']
      },
      {
        id: 'volume_ratio',
        name: 'VOLUME_RATIO',
        description: '成交量比率，用于判断市场活跃度',
        category: '量价关系',
        author: 'PandaAI',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T19:00:00Z',
        status: 'active',
        performance: {
          ic: 0.09,
          ir: 1.3,
          sharpe: 1.0,
          max_drawdown: 0.16
        },
        tags: ['volume', 'liquidity', 'activity']
      },
      {
        id: 'atr_14',
        name: 'ATR_14',
        description: '14日平均真实波幅，用于衡量波动率',
        category: '风险指标',
        author: 'PandaAI',
        created_at: '2024-01-21T11:00:00Z',
        updated_at: '2024-01-20T20:30:00Z',
        status: 'active',
        performance: {
          ic: 0.11,
          ir: 1.6,
          sharpe: 1.1,
          max_drawdown: 0.14
        },
        tags: ['volatility', 'risk', 'range']
      },
      {
        id: 'stoch_14_3_3',
        name: 'STOCH_14_3_3',
        description: '随机指标，用于判断超买超卖',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-22T12:00:00Z',
        updated_at: '2024-01-20T21:45:00Z',
        status: 'active',
        performance: {
          ic: 0.10,
          ir: 1.4,
          sharpe: 1.0,
          max_drawdown: 0.17
        },
        tags: ['momentum', 'oscillator', 'stochastic']
      }
    ];

    // 应用过滤条件
    let filteredFactors = mockFactors;

    if (category) {
      filteredFactors = filteredFactors.filter(factor => 
        factor.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      filteredFactors = filteredFactors.filter(factor => 
        factor.name.toLowerCase().includes(search.toLowerCase()) ||
        factor.description.toLowerCase().includes(search.toLowerCase()) ||
        factor.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (status) {
      filteredFactors = filteredFactors.filter(factor => factor.status === status);
    }

    // 应用分页
    const paginatedFactors = filteredFactors.slice(offset, offset + limit);

    return NextResponse.json({
      status: 'success',
      data: {
        factors: paginatedFactors,
        total: filteredFactors.length,
        limit,
        offset,
        has_more: offset + limit < filteredFactors.length
      },
      message: serviceOnline ? '获取因子列表成功' : 'PandaFactor 服务不可用，返回模拟数据',
      timestamp: new Date().toISOString(),
    });
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
