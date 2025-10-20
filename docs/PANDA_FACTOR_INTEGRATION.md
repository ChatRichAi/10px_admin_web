# PandaFactor 因子库集成指南

## 概述

本项目已成功集成 PandaFactor 因子库，为用户提供强大的量化因子分析能力。PandaFactor 是一个高性能的量化算子库，支持金融数据分析、技术指标计算和因子构建。

## 功能特性

### 🎯 核心功能
- **因子浏览器**: 浏览和管理量化因子库
- **技术指标计算**: 实时计算 RSI、MACD、布林带等技术指标
- **因子回测**: 支持单因子和多因子组合回测
- **波动率分析集成**: 在波动率分析中集成因子计算
- **AI 工作流支持**: 支持在 AI 工作流中使用因子节点

### 🔧 技术架构
- **前端**: Next.js + React + TypeScript
- **后端**: PandaFactor (FastAPI)
- **数据库**: MongoDB
- **缓存**: 内置缓存系统
- **API**: RESTful API 接口

## 快速开始

### 1. 环境配置

复制环境配置文件：
```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，配置以下变量：
```env
# PandaFactor 配置
PANDA_FACTOR_API_BASE=http://127.0.0.1:8000
PANDA_FACTOR_MONGODB_URI=mongodb://localhost:27017/panda_factor
```

### 2. 启动 PandaFactor 服务

使用提供的启动脚本：
```bash
./scripts/start-panda-factor.sh
```

或手动启动：
```bash
cd panda_factor
pip install -r requirements.txt
cd panda_factor_server
python __main__.py
```

### 3. 验证集成

1. 启动 Next.js 应用: `npm run dev`
2. 访问: `http://localhost:3000/factor-analysis`
3. 检查 PandaFactor 服务状态

## API 接口

### 因子管理

#### 获取因子列表
```http
GET /api/panda-factor/factors?limit=10&offset=0&category=技术指标&search=RSI
```

#### 计算因子
```http
POST /api/panda-factor/calculate
Content-Type: application/json

{
  "symbol": "BTC",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "factors": ["RSI_14", "MACD_12_26_9"],
  "timeframe": "1d"
}
```

#### 因子回测
```http
POST /api/panda-factor/backtest
Content-Type: application/json

{
  "symbol": "BTC",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "factors": ["RSI_14", "MACD_12_26_9"],
  "strategy": "long_short",
  "rebalance_frequency": "daily",
  "transaction_cost": 0.001,
  "initial_capital": 1000000
}
```

### 服务状态

#### 检查服务状态
```http
GET /api/panda-factor/status
```

## 使用指南

### 1. 因子浏览器

访问 `/factor-analysis` 页面，可以：
- 浏览所有可用因子
- 按类别筛选因子
- 搜索特定因子
- 查看因子性能指标
- 选择因子进行组合分析

### 2. 波动率分析集成

在波动率分析页面 (`/handicap`) 中：
- 点击"因子"按钮查看技术指标
- 在 AI 分析中自动集成因子数据
- 实时计算技术指标信号

### 3. Hook 使用

使用 `usePandaFactor` Hook：

```typescript
import { usePandaFactor } from '@/hooks/usePandaFactor';

const MyComponent = () => {
  const {
    technicalIndicators,
    loading,
    error,
    getTechnicalIndicators,
    isServiceOnline
  } = usePandaFactor('BTC', true, 5 * 60 * 1000);

  // 使用技术指标数据
  return (
    <div>
      {technicalIndicators?.map(indicator => (
        <div key={indicator.name}>
          {indicator.name}: {indicator.value}
        </div>
      ))}
    </div>
  );
};
```

## 因子类型

### 技术指标
- **RSI_14**: 14日相对强弱指数
- **MACD_12_26_9**: MACD指标
- **BOLLINGER_20_2**: 20日布林带
- **STOCH_14_3_3**: 随机指标

### 趋势指标
- **SMA_20**: 20日简单移动平均
- **EMA_12**: 12日指数移动平均

### 量价关系
- **VOLUME_RATIO**: 成交量比率

### 风险指标
- **ATR_14**: 14日平均真实波幅

## 性能优化

### 缓存策略
- 因子列表缓存：30分钟
- 因子计算结果缓存：5分钟
- 回测结果缓存：1小时

### 请求队列
- 批量因子计算优先级管理
- 大规模回测任务排队
- 自动重试机制

## 故障排除

### 常见问题

#### 1. PandaFactor 服务启动失败
```bash
# 检查 Python 环境
python --version

# 检查依赖安装
pip list | grep panda

# 检查 MongoDB 连接
mongosh --eval "db.runCommand('ping')"
```

#### 2. API 调用失败
- 确认 PandaFactor 服务运行在 8000 端口
- 检查防火墙设置
- 查看服务日志: `panda_factor_server/logs/`

#### 3. 因子计算错误
- 检查数据源连接
- 验证因子参数配置
- 查看计算日志

### 日志位置

- **系统日志**: `panda_factor_server/logs/`
- **因子计算日志**: 通过 API 接口获取
- **错误日志**: 浏览器开发者工具控制台

## 扩展功能

### 1. 自定义因子
- 支持 Python 模式编写
- 支持公式模式编写
- 实时预览和验证

### 2. 因子组合
- 多因子权重优化
- IC 分析
- 因子相关性分析

### 3. 高级回测
- 事件驱动回测
- 风险模型集成
- 交易成本建模

## 开发指南

### 添加新因子

1. 在 PandaFactor 中定义因子
2. 更新 API 接口
3. 在前端添加因子显示
4. 更新文档

### 自定义 Hook

```typescript
// 创建自定义因子 Hook
export const useCustomFactor = (symbol: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const calculateFactor = useCallback(async () => {
    // 实现因子计算逻辑
  }, [symbol]);
  
  return { data, loading, calculateFactor };
};
```

## 许可证

本项目采用 GPLV3 许可证，请遵守相关开源协议。

## 技术支持

- **文档**: [PandaFactor GitHub](https://github.com/PandaAI-Tech/panda_factor)
- **社区**: 加入 PandaAI 交流群获取支持
- **问题反馈**: 通过 GitHub Issues 提交问题

## 更新日志

### v1.0.0 (2024-01-20)
- ✅ 完成 PandaFactor 基础集成
- ✅ 实现因子浏览器功能
- ✅ 集成波动率分析
- ✅ 添加技术指标计算
- ✅ 支持因子回测
- ✅ 创建 AI 工作流节点
