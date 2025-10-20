import { NextRequest, NextResponse } from 'next/server';

// PandaFactor API 基础URL
const PANDA_FACTOR_API_BASE = process.env.PANDA_FACTOR_API_BASE || 'http://127.0.0.1:8000';

interface FactorCalculationRequest {
  symbol: string;
  start_date: string;
  end_date: string;
  factors: string[];
  timeframe?: '1d' | '1h' | '1m';
}

export async function POST(request: NextRequest) {
  try {
    const body: FactorCalculationRequest = await request.json();
    const { symbol, start_date, end_date, factors, timeframe = '1d' } = body;

    // 验证必需字段
    if (!symbol || !start_date || !end_date || !factors || !Array.isArray(factors)) {
      return NextResponse.json({
        status: 'error',
        message: '缺少必需字段: symbol, start_date, end_date, factors',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

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
      // 调用真实的PandaFactor API
      try {
        const response = await fetch(`${PANDA_FACTOR_API_BASE}/api/factors/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol,
            start_date,
            end_date,
            factors,
            timeframe
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            status: 'success',
            data: data,
            message: '因子计算成功',
            timestamp: new Date().toISOString(),
          });
        } else {
          throw new Error(`PandaFactor API error: ${response.status}`);
        }
      } catch (error) {
        console.error('PandaFactor API调用失败:', error);
        // 如果API调用失败，回退到模拟数据
      }
    }

    // 生成模拟因子数据
    const mockFactorData = generateMockFactorData(symbol, start_date, end_date, factors);

    return NextResponse.json({
      status: 'success',
      data: mockFactorData,
      message: '使用模拟数据（PandaFactor服务不可用）',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('因子计算失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '因子计算失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// 生成模拟因子数据
function generateMockFactorData(symbol: string, startDate: string, endDate: string, factors: string[]) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 生成日期范围
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  // 为每个因子和每个日期生成数据
  factors.forEach(factor => {
    dates.forEach(date => {
      data.push({
        symbol,
        date,
        value: Math.random() * 100 - 50, // -50 到 50 的随机值
        factor_name: factor,
        factor_id: `factor_${factor.toLowerCase()}_${Date.now()}`,
        created_at: new Date().toISOString(),
      });
    });
  });

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC';
    const limit = parseInt(searchParams.get('limit') || '100');

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
      // 调用真实的PandaFactor API获取因子列表
      try {
        const response = await fetch(`${PANDA_FACTOR_API_BASE}/api/factors?symbol=${symbol}&limit=${limit}`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            status: 'success',
            data: data,
            message: '获取因子列表成功',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('PandaFactor API调用失败:', error);
      }
    }

    // 返回模拟因子列表
    const mockFactors = [
      {
        id: 'rsi_14',
        name: 'RSI_14',
        description: '14日相对强弱指数',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-15T10:00:00Z',
        status: 'active',
      },
      {
        id: 'macd_12_26_9',
        name: 'MACD_12_26_9',
        description: 'MACD指标',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-16T09:00:00Z',
        status: 'active',
      },
      {
        id: 'bollinger_20_2',
        name: 'BOLLINGER_20_2',
        description: '20日布林带',
        category: '技术指标',
        author: 'PandaAI',
        created_at: '2024-01-17T11:00:00Z',
        status: 'active',
      },
      {
        id: 'sma_20',
        name: 'SMA_20',
        description: '20日简单移动平均',
        category: '趋势指标',
        author: 'PandaAI',
        created_at: '2024-01-18T14:00:00Z',
        status: 'active',
      },
      {
        id: 'ema_12',
        name: 'EMA_12',
        description: '12日指数移动平均',
        category: '趋势指标',
        author: 'PandaAI',
        created_at: '2024-01-19T16:00:00Z',
        status: 'active',
      }
    ];

    return NextResponse.json({
      status: 'success',
      data: mockFactors,
      message: '使用模拟数据（PandaFactor服务不可用）',
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
