import { NextRequest, NextResponse } from 'next/server';

// PandaFactor API 基础URL
const PANDA_FACTOR_API_BASE = process.env.PANDA_FACTOR_API_BASE || 'http://127.0.0.1:8000';

interface FactorBacktestRequest {
  symbol: string;
  start_date: string;
  end_date: string;
  factors: string[];
  strategy?: 'long_short' | 'long_only' | 'short_only';
  rebalance_frequency?: 'daily' | 'weekly' | 'monthly';
  transaction_cost?: number;
  initial_capital?: number;
}

interface BacktestResult {
  total_return: number;
  annual_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  avg_trade_return: number;
  volatility: number;
  calmar_ratio: number;
  sortino_ratio: number;
  equity_curve: Array<{
    date: string;
    value: number;
    return: number;
  }>;
  factor_performance: Array<{
    factor_name: string;
    ic: number;
    ir: number;
    rank_ic: number;
  }>;
  monthly_returns: Array<{
    month: string;
    return: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: FactorBacktestRequest = await request.json();
    const {
      symbol,
      start_date,
      end_date,
      factors,
      strategy = 'long_short',
      rebalance_frequency = 'daily',
      transaction_cost = 0.001,
      initial_capital = 1000000
    } = body;

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
      // 调用真实的PandaFactor API进行回测
      try {
        const response = await fetch(`${PANDA_FACTOR_API_BASE}/api/factors/backtest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol,
            start_date,
            end_date,
            factors,
            strategy,
            rebalance_frequency,
            transaction_cost,
            initial_capital
          }),
          signal: AbortSignal.timeout(60000), // 60秒超时
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            status: 'success',
            data: data,
            message: '因子回测成功',
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

    // 生成模拟回测结果
    const mockBacktestResult = generateMockBacktestResult(symbol, start_date, end_date, factors, strategy);

    return NextResponse.json({
      status: 'success',
      data: mockBacktestResult,
      message: '使用模拟数据（PandaFactor服务不可用）',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('因子回测失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '因子回测失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// 生成模拟回测结果
function generateMockBacktestResult(
  symbol: string,
  startDate: string,
  endDate: string,
  factors: string[],
  strategy: string
): BacktestResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // 生成权益曲线
  const equityCurve = [];
  let currentValue = 1000000; // 初始资金
  const startValue = currentValue;
  
  for (let i = 0; i <= daysDiff; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dailyReturn = (Math.random() - 0.5) * 0.05; // -2.5% 到 2.5% 的日收益率
    currentValue *= (1 + dailyReturn);
    
    equityCurve.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue),
      return: dailyReturn
    });
  }

  const totalReturn = (currentValue - startValue) / startValue;
  const annualReturn = Math.pow(1 + totalReturn, 365 / daysDiff) - 1;
  const volatility = Math.sqrt(equityCurve.reduce((sum, point) => sum + Math.pow(point.return, 2), 0) / equityCurve.length) * Math.sqrt(252);
  const sharpeRatio = annualReturn / volatility;
  
  // 计算最大回撤
  let maxDrawdown = 0;
  let peak = startValue;
  for (const point of equityCurve) {
    if (point.value > peak) {
      peak = point.value;
    }
    const drawdown = (peak - point.value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // 生成因子表现
  const factorPerformance = factors.map(factor => ({
    factor_name: factor,
    ic: (Math.random() - 0.5) * 0.2, // -0.1 到 0.1 的IC
    ir: (Math.random() - 0.5) * 2, // -1 到 1 的IR
    rank_ic: (Math.random() - 0.5) * 0.15 // -0.075 到 0.075 的Rank IC
  }));

  // 生成月度收益
  const monthlyReturns = [];
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const monthReturn = (Math.random() - 0.5) * 0.1; // -5% 到 5% 的月收益率
    monthlyReturns.push({
      month: currentDate.toISOString().substring(0, 7),
      return: monthReturn
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return {
    total_return: totalReturn,
    annual_return: annualReturn,
    sharpe_ratio: sharpeRatio,
    max_drawdown: maxDrawdown,
    win_rate: Math.random() * 0.4 + 0.4, // 40% 到 80% 的胜率
    total_trades: Math.floor(daysDiff * 0.1), // 假设10%的天数有交易
    avg_trade_return: (Math.random() - 0.5) * 0.02, // -1% 到 1% 的平均交易收益
    volatility: volatility,
    calmar_ratio: annualReturn / maxDrawdown,
    sortino_ratio: annualReturn / (volatility * 0.8), // 简化的Sortino比率
    equity_curve: equityCurve,
    factor_performance: factorPerformance,
    monthly_returns: monthlyReturns
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backtestId = searchParams.get('id');

    if (!backtestId) {
      return NextResponse.json({
        status: 'error',
        message: '缺少回测ID参数',
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
      // 调用真实的PandaFactor API获取回测结果
      try {
        const response = await fetch(`${PANDA_FACTOR_API_BASE}/api/factors/backtest/${backtestId}`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            status: 'success',
            data: data,
            message: '获取回测结果成功',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('PandaFactor API调用失败:', error);
      }
    }

    // 返回模拟回测结果
    return NextResponse.json({
      status: 'success',
      data: {
        id: backtestId,
        status: 'completed',
        created_at: new Date().toISOString(),
        message: '使用模拟数据（PandaFactor服务不可用）'
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('获取回测结果失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '获取回测结果失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
