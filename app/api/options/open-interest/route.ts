import { NextRequest, NextResponse } from 'next/server';

// 模拟后端数据结构
const mockBackendData = {
  "symbol": "BTC",
  "timestamp": "2025-01-27T10:30:00Z",
  "pcr": 0.56,
  "total_calls": 65458.4,
  "total_puts": 36623.7,
  "expiry_data": [
    {"expiry": "2025-07-15", "calls": 2436.6, "puts": 2906.5, "total": 5343.1},
    {"expiry": "2025-07-16", "calls": 887.2, "puts": 1189.6, "total": 2076.8},
    {"expiry": "2025-07-17", "calls": 1200.0, "puts": 800.0, "total": 2000.0},
    {"expiry": "2025-07-18", "calls": 2500.0, "puts": 1100.0, "total": 3600.0},
    {"expiry": "2025-07-25", "calls": 13000.0, "puts": 12500.0, "total": 25500.0},
    {"expiry": "2025-08-01", "calls": 12000.0, "puts": 10000.0, "total": 22000.0},
    {"expiry": "2025-08-29", "calls": 40000.0, "puts": 27000.0, "total": 67000.0},
    {"expiry": "2025-09-26", "calls": 17000.0, "puts": 5000.0, "total": 22000.0},
    {"expiry": "2025-12-26", "calls": 47000.0, "puts": 18000.0, "total": 65000.0},
    {"expiry": "2026-03-27", "calls": 25000.0, "puts": 12000.0, "total": 37000.0},
    {"expiry": "2026-06-26", "calls": 7000.0, "puts": 2000.0, "total": 9000.0}
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'btc';
    
    // 这里应该是从你的实际数据源获取数据
    // 例如：从数据库、外部API等
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 根据symbol返回不同的数据（这里简化处理）
    const responseData = {
      ...mockBackendData,
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('获取期权持仓量数据失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '数据获取失败'
      },
      { status: 500 }
    );
  }
} 