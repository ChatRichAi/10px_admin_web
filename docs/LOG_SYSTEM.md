# AI工作流日志系统

## 概述

AI工作流日志系统为整个应用提供了完整的日志记录、查看和管理功能。系统支持多种日志级别、类别，并提供实时查看、过滤、搜索和导出功能。

## 功能特性

### 1. 日志记录
- **多种日志级别**: info, success, warn, error, debug
- **多种日志类别**: workflow, api, system, user, performance
- **自动记录**: API调用、工作流操作、系统事件
- **详细信息**: 支持附加数据、标签、执行时间等
- **关联信息**: 工作流ID、运行ID、用户ID等

### 2. 日志查看
- **实时显示**: 支持实时日志流显示
- **自动刷新**: 可配置的自动刷新间隔
- **多维度过滤**: 按级别、类别、时间、关键词过滤
- **搜索功能**: 全文搜索日志内容
- **详情展开**: 查看完整的日志详细信息

### 3. 日志管理
- **统计信息**: 日志数量、错误率、性能指标等
- **导出功能**: 支持JSON和CSV格式导出
- **清空功能**: 支持清空所有日志
- **分页显示**: 支持大量日志的分页显示

## 核心组件

### 1. LogService (lib/logService.ts)
核心日志服务类，提供所有日志操作功能：

```typescript
import { logService } from '@/lib/logService';

// 记录工作流日志
logService.logWorkflow('info', '工作流开始执行', 'workflow-123', 'run-456');

// 记录API日志
logService.logAPI('success', 'API调用成功', '/api/workflow/start', 150);

// 记录系统日志
logService.logSystem('error', '系统错误', { error: 'Connection failed' });

// 记录性能日志
logService.logPerformance('warn', '响应时间过长', 'database_query', 2000);
```

### 2. LogViewer (components/LogViewer/index.tsx)
日志查看器组件，提供完整的日志显示和交互功能：

```tsx
<LogViewer
  logs={logs}
  isLoading={isLoading}
  onRefresh={handleRefresh}
  onClear={handleClear}
  onExport={handleExport}
  onFilter={handleFilter}
  autoRefresh={true}
  refreshInterval={5000}
  maxHeight="600px"
  showFilters={true}
  showStats={true}
/>
```

### 3. LogStats (components/LogStats/index.tsx)
日志统计组件，显示日志统计信息和性能指标：

```tsx
<LogStats stats={stats} />
```

### 4. useLogs Hook (hooks/useLogs/index.tsx)
日志管理Hook，提供状态管理和操作函数：

```tsx
const { logs, stats, isLoading, clearLogs, exportLogs, applyFilter } = useLogs({
  autoRefresh: true,
  refreshInterval: 5000
});
```

## API接口

### GET /api/ai-workflow/logs
获取日志列表，支持多种查询参数：

- `runId`: 运行ID
- `workflowId`: 工作流ID
- `level`: 日志级别（逗号分隔）
- `category`: 日志类别（逗号分隔）
- `search`: 搜索关键词
- `startTime`: 开始时间
- `endTime`: 结束时间
- `limit`: 限制数量
- `offset`: 偏移量

### POST /api/ai-workflow/logs
执行日志管理操作：

```json
{
  "action": "clear|export|stats|search",
  "logData": { "format": "json|csv" },
  "filter": { /* 过滤条件 */ }
}
```

## 使用示例

### 1. 在工作流服务中记录日志

```typescript
// 在workflowService.ts中
async startWorkflow(workflowId: string) {
  const startTime = Date.now();
  try {
    logService.logWorkflow('info', `Starting workflow: ${workflowId}`, workflowId);
    
    // ... 执行工作流启动逻辑
    
    const duration = Date.now() - startTime;
    logService.logWorkflow('success', `Workflow started successfully`, workflowId, runId, {
      duration
    });
  } catch (error) {
    logService.logWorkflow('error', `Failed to start workflow`, workflowId, undefined, {
      error: error.message
    });
  }
}
```

### 2. 在组件中使用日志功能

```tsx
import { useLogs } from '@/hooks/useLogs';
import LogViewer from '@/components/LogViewer';

const MyComponent = () => {
  const { logs, stats, clearLogs, exportLogs, applyFilter } = useLogs({
    autoRefresh: true,
    refreshInterval: 5000
  });

  return (
    <div>
      <LogViewer
        logs={logs}
        onClear={clearLogs}
        onExport={exportLogs}
        onFilter={applyFilter}
        autoRefresh={true}
      />
    </div>
  );
};
```

### 3. 自定义日志记录

```typescript
import { logService } from '@/lib/logService';

// 记录自定义日志
logService.log('user', 'info', '用户登录成功', {
  userId: 'user123',
  loginTime: new Date().toISOString()
}, {
  userId: 'user123',
  tags: ['authentication', 'login']
});

// 记录性能日志
logService.logPerformance('info', '数据库查询完成', 'user_query', 150, {
  queryType: 'SELECT',
  recordCount: 100
});
```

## 配置选项

### LogService配置
- `maxLogs`: 最大日志条数（默认10000）
- 自动清理：超过最大条数时自动清理旧日志

### LogViewer配置
- `autoRefresh`: 是否自动刷新（默认false）
- `refreshInterval`: 刷新间隔（默认5000ms）
- `maxHeight`: 最大高度（默认600px）
- `showFilters`: 是否显示过滤器（默认true）
- `showStats`: 是否显示统计信息（默认true）

## 测试页面

访问 `/test-logs` 页面可以测试日志功能：

1. 生成测试日志
2. 生成错误日志
3. 生成性能日志
4. 查看日志统计
5. 测试过滤和搜索功能
6. 测试导出功能

## 最佳实践

1. **合理使用日志级别**：
   - `debug`: 调试信息，生产环境可关闭
   - `info`: 一般信息，记录重要操作
   - `success`: 成功操作
   - `warn`: 警告信息，需要关注但不影响运行
   - `error`: 错误信息，需要立即处理

2. **选择合适的日志类别**：
   - `workflow`: 工作流相关操作
   - `api`: API调用和响应
   - `system`: 系统级事件
   - `user`: 用户操作
   - `performance`: 性能相关数据

3. **记录有用的信息**：
   - 包含足够的上下文信息
   - 记录执行时间
   - 包含错误详情和堆栈信息
   - 使用有意义的标签

4. **避免过度记录**：
   - 不要记录敏感信息
   - 避免记录过于频繁的日志
   - 定期清理旧日志

## 故障排除

### 常见问题

1. **日志不显示**：
   - 检查API接口是否正常
   - 检查过滤器设置
   - 查看浏览器控制台错误

2. **自动刷新不工作**：
   - 检查autoRefresh设置
   - 检查refreshInterval值
   - 确保组件正确挂载

3. **导出功能失败**：
   - 检查浏览器是否支持Blob
   - 检查文件大小限制
   - 查看网络请求状态

### 调试技巧

1. 使用浏览器开发者工具查看网络请求
2. 检查控制台输出的日志信息
3. 使用测试页面验证功能
4. 查看服务器端日志

## 扩展功能

系统支持以下扩展：

1. **日志持久化**：可以集成数据库存储
2. **日志分析**：可以添加更复杂的分析功能
3. **告警功能**：可以基于日志级别设置告警
4. **日志聚合**：可以集成ELK等日志聚合系统
5. **实时通知**：可以添加实时日志通知功能
