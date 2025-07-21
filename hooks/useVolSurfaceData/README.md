# useVolSurfaceData Hook

这是一个用于获取波动率平面数据的自定义React Hook。

## 功能特性

- ✅ 自动数据获取和刷新
- ✅ 错误处理和重试机制
- ✅ 加载状态管理
- ✅ 数据格式验证
- ✅ 可配置的刷新间隔
- ✅ 手动刷新功能

## 使用方法

### 基本用法

```tsx
import { useVolSurfaceData } from '@/hooks/useVolSurfaceData';

const MyComponent = () => {
  const { data, loading, error, refresh } = useVolSurfaceData('BTC');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!data) return <div>无数据</div>;
  
  return (
    <div>
      <h3>{data.symbol} 波动率平面</h3>
      <p>到期日: {data.xAxis.join(', ')}</p>
      <p>Delta: {data.yAxis.join(', ')}</p>
      <button onClick={refresh}>刷新</button>
    </div>
  );
};
```

### 高级用法

```tsx
const { data, loading, error, fetchData, refresh } = useVolSurfaceData(
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

### useVolSurfaceData(symbol, autoRefresh, refreshInterval)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| symbol | string | 'BTC' | 交易对符号 |
| autoRefresh | boolean | true | 是否自动刷新 |
| refreshInterval | number | 300000 | 刷新间隔（毫秒） |

## 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| data | VolSurfaceData \| null | 波动率平面数据 |
| loading | boolean | 加载状态 |
| error | string \| null | 错误信息 |
| fetchData | (symbol: string) => Promise<void> | 手动获取数据 |
| refresh | () => void | 手动刷新当前数据 |

## 数据类型

```typescript
interface VolSurfaceData {
  xAxis: string[];        // 到期日数组
  yAxis: string[];        // Delta值数组
  zData: number[][];      // 波动率数据（二维数组）
  timestamp?: string;     // 数据时间戳
  symbol?: string;        // 交易对符号
}
```

## 错误处理

Hook 包含以下错误处理机制：

1. **网络错误**: 自动重试（10秒后）
2. **数据格式错误**: 显示错误信息
3. **API错误**: 使用默认数据作为后备

## 配置

### API端点

默认API端点：`https://10px.xyz/api/vol-surface?symbol=${symbol}`

你可以在Hook中修改这个端点：

```tsx
// 在 useVolSurfaceData/index.tsx 中修改
const response = await fetch(`你的API端点?symbol=${targetSymbol}`);
```

### 默认数据

如果API失败，Hook会使用默认的模拟数据。你可以在 `defaultData` 中修改这些数据。

## 示例

查看 `templates/Handicap/VolSurface/index.tsx` 了解完整的使用示例。 