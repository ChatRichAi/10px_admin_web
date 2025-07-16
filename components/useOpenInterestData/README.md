# useOpenInterestData Hook

这个钩子用于获取真实的期权持仓量数据，从指定的API端点获取数据并进行处理。

## 功能特性

- 🔄 自动数据刷新（可配置间隔）
- 🚀 强制刷新功能
- 📊 数据格式转换
- ⚡ 错误处理和重试机制
- 🎯 支持多币种切换

## 使用方法

```tsx
import { useOpenInterestData } from '@/components/useOpenInterestData';

const MyComponent = () => {
  const {
    data,
    rawData,
    loading,
    error,
    lastUpdate,
    refresh,
    forceRefresh,
    updateSymbol
  } = useOpenInterestData({
    symbol: 'BTC',
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5分钟
    forceRefresh: false
  });

  return (
    <div>
      {loading && <div>加载中...</div>}
      {error && <div>错误: {error}</div>}
      {data && (
        <div>
          {data.map((item, index) => (
            <div key={index}>
              {item.expiry}: Calls={item.calls}, Puts={item.puts}, PCR={item.pcr}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## API 参数

### 输入参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `symbol` | `string` | `'BTC'` | 币种符号（如 'BTC', 'ETH'） |
| `autoRefresh` | `boolean` | `true` | 是否自动刷新数据 |
| `refreshInterval` | `number` | `5 * 60 * 1000` | 自动刷新间隔（毫秒） |
| `forceRefresh` | `boolean` | `false` | 是否强制刷新 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| `data` | `OpenInterestDataItem[]` | 处理后的数据数组 |
| `rawData` | `BackendOpenInterestData \| null` | 原始后端数据 |
| `loading` | `boolean` | 加载状态 |
| `error` | `string \| null` | 错误信息 |
| `lastUpdate` | `number \| null` | 最后更新时间戳 |
| `refresh` | `() => void` | 手动刷新函数 |
| `forceRefresh` | `() => void` | 强制刷新函数 |
| `updateSymbol` | `(symbol: string) => void` | 更新币种函数 |

## 数据结构

### 后端数据结构 (BackendOpenInterestData)

```typescript
interface BackendOpenInterestData {
  symbol: string;
  pcr: number;
  total_calls: number;
  total_puts: number;
  expiries: string[];
  calls_data: number[];
  puts_data: number[];
}
```

### 前端数据结构 (OpenInterestDataItem)

```typescript
interface OpenInterestDataItem {
  expiry: string;        // 到期日（格式：YYYY/MM/DD）
  calls: number;         // Call持仓量
  puts: number;          // Put持仓量
  callsPercent: number;  // Call占比
  putsPercent: number;   // Put占比
  pcr: number;          // Put/Call比率
}
```

## API 端点

钩子使用以下API端点获取数据：

```
GET http://103.106.191.243:8001/deribit/option/open_interest_summary
```

### 查询参数

- `symbol`: 币种符号（必需）
- `force_refresh`: 是否强制刷新（可选）

### 示例请求

```
GET http://103.106.191.243:8001/deribit/option/open_interest_summary?symbol=BTC&force_refresh=true
```

## 错误处理

钩子包含完整的错误处理机制：

- 网络错误处理
- 数据格式验证
- 自动重试机制
- 用户友好的错误信息

## 注意事项

1. 确保API端点可访问
2. 币种符号需要与后端API支持的格式一致
3. 强制刷新功能会绕过缓存，谨慎使用
4. 自动刷新间隔建议设置为5分钟或更长，避免过于频繁的请求

## 示例

查看 `TestOpenInterest.tsx` 组件获取完整的使用示例。 