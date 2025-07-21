# useVolSmileData Hook

这是一个用于获取波动率微笑数据的自定义React Hook。

## 功能特性

- ✅ 自动数据获取和刷新
- ✅ 错误处理和重试机制
- ✅ 加载状态管理
- ✅ 数据格式验证
- ✅ 可配置的刷新间隔
- ✅ 手动刷新功能
- ✅ 支持多交易对切换

## API接口

使用Deribit期权波动率微笑API：
- **端点**: `http://103.106.191.243:8000/deribit/option/vol_smile`
- **参数**: `symbol` (交易对符号，如 BTC, ETH, SOL)
- **方法**: GET

## 使用方法

### 基本用法

```tsx
import { useVolSmileData } from '@/hooks/useVolSmileData';

const MyComponent = () => {
  const { data, loading, error, refresh } = useVolSmileData('BTC');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!data) return <div>无数据</div>;
  
  return (
    <div>
      <h3>{data.symbol} 波动率微笑</h3>
      <p>数据点数量: {data.data.length}</p>
      <p>到期日数量: {data.expiries.length}</p>
      <button onClick={refresh}>刷新</button>
    </div>
  );
};
```

### 高级用法

```tsx
const { data, loading, error, fetchData, refresh } = useVolSmileData(
  'ETH',           // 交易对
  true,            // 自动刷新
  2 * 60 * 1000    // 刷新间隔（2分钟）
);

// 手动切换交易对
const handleSymbolChange = (newSymbol: string) => {
  fetchData(newSymbol);
};
```

## API 参数

### useVolSmileData(symbol, autoRefresh, refreshInterval)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| symbol | string | 'BTC' | 交易对符号 |
| autoRefresh | boolean | true | 是否自动刷新 |
| refreshInterval | number | 300000 | 刷新间隔（毫秒） |

## 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| data | VolSmileData \| null | 波动率微笑数据 |
| loading | boolean | 加载状态 |
| error | string \| null | 错误信息 |
| fetchData | (symbol: string) => Promise<void> | 手动获取数据 |
| refresh | () => void | 手动刷新当前数据 |

## 数据类型

```typescript
interface VolSmileDataPoint {
  delta: string;    // Delta值，如 '5P', '10P', 'ATM', '10C', '5C'
  [key: string]: string | number;  // 动态键值对，如 d1, d2, d3 等
}

interface ExpiryConfig {
  label: string;    // 显示标签，如 '01JUL25'
  value: string;    // 数据键名，如 'd1'
  color: string;    // 颜色代码，如 '#eab308'
}

interface LineConfig {
  key: string;      // 唯一标识符
  name: string;     // 显示名称
  color: string;    // 线条颜色
}

interface VolSmileData {
  data: VolSmileDataPoint[];      // 波动率数据点
  expiries: ExpiryConfig[];       // 到期日配置
  lines: LineConfig[];            // 线条配置
  timestamp?: string;             // 数据时间戳
  symbol?: string;                // 交易对符号
}
```

## 数据格式示例

```typescript
const exampleData: VolSmileData = {
  data: [
    { delta: '5P', d1: 32, d2: 28, d3: 35 },
    { delta: '10P', d1: 30, d2: 27, d3: 33 },
    { delta: '20P', d1: 29, d2: 26, d3: 32 },
    { delta: '30P', d1: 28, d2: 25, d3: 31 },
    { delta: '40P', d1: 29, d2: 26, d3: 32 },
    { delta: 'ATM', d1: 31, d2: 28, d3: 34 },
    { delta: '40C', d1: 33, d2: 30, d3: 36 },
    { delta: '30C', d1: 34, d2: 31, d3: 37 },
    { delta: '20C', d1: 36, d2: 33, d3: 39 },
    { delta: '10C', d1: 38, d2: 35, d3: 41 },
    { delta: '5C', d1: 40, d2: 37, d3: 43 },
  ],
  expiries: [
    { label: '01JUL25', value: 'd1', color: '#eab308' },
    { label: '26SEP25', value: 'd2', color: '#22d3ee' },
    { label: '26DEC25', value: 'd3', color: '#a78bfa' },
  ],
  lines: [
    { key: 'd1', name: '01JUL25', color: '#eab308' },
    { key: 'd2', name: '26SEP25', color: '#22d3ee' },
    { key: 'd3', name: '26DEC25', color: '#a78bfa' },
  ],
  timestamp: '2024-01-01T12:00:00.000Z',
  symbol: 'BTC'
};
```

## 错误处理

Hook 包含以下错误处理机制：

1. **网络错误**: 自动重试（10秒后）
2. **数据格式错误**: 显示错误信息
3. **API错误**: 使用默认数据作为后备

## 配置

### API端点

默认API端点：`http://103.106.191.243:8000/deribit/option/vol_smile?symbol=${symbol}`

你可以在Hook中修改这个端点：

```tsx
// 在 useVolSmileData/index.tsx 中修改
const apiUrl = `你的API端点?symbol=${targetSymbol.toUpperCase()}`;
```

### 默认数据

如果API失败，Hook会使用默认的模拟数据。你可以在 `defaultData` 中修改这些数据。

### 颜色配置

Hook使用预定义的颜色调色板：

```typescript
const colorPalette = [
  '#eab308', '#22d3ee', '#a78bfa', '#f472b6', '#a3e635', 
  '#f59e42', '#f43f5e', '#6366f1', '#06b6d4', '#38bdf8'
];
```

## 示例

查看 `templates/Handicap/VolSmile/index.tsx` 了解完整的使用示例。

## 注意事项

1. **Delta值范围**: 从看跌期权 (5P-40P) 到平值期权 (ATM) 到看涨期权 (40C-5C)
2. **波动率值**: 百分比形式，通常在 25-45% 范围内
3. **多到期日**: 支持多个到期日的波动率曲线对比
4. **颜色编码**: 每个到期日有独特的颜色标识 