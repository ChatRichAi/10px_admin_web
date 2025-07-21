// 判断标的类型：美股 or 加密
export function getSymbolType(symbol: string): 'crypto' | 'us' {
  // 美股一般为全大写且无USDT等后缀，且长度<=6
  if (/^[A-Z]{1,6}$/.test(symbol)) {
    return 'us';
  }
  // 加密币对如BTCUSDT、ETHUSDT等
  if (/^[A-Z0-9]{3,}USDT$/.test(symbol.toUpperCase())) {
    return 'crypto';
  }
  // 默认按加密处理
  return 'crypto';
} 