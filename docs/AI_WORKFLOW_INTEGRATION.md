# AI工作流集成指南

## 概述

本项目已集成PandaAI QuantFlow量化工作流平台，为用户提供强大的AI驱动量化分析能力。

## 功能特性

### 🎯 核心功能
- **可视化工作流设计**: 基于节点的拖拽式工作流构建
- **机器学习集成**: 支持XGBoost、LightGBM、神经网络等算法
- **因子分析**: 高性能回测引擎和因子挖掘
- **实时监控**: 工作流执行状态和进度监控
- **多资产支持**: 股票、期货、期权等多种金融工具

### 🔧 技术架构
- **前端**: Next.js + React + TypeScript
- **后端**: PandaAI QuantFlow (FastAPI)
- **数据库**: MongoDB
- **消息队列**: RabbitMQ (可选)

## 快速开始

### 1. 启动PandaAI QuantFlow服务

```bash
# 使用提供的启动脚本
./scripts/start-quantflow.sh

# 或手动启动
cd panda_quantflow
python src/panda_server/main.py
```

### 2. 访问AI工作流页面

1. 启动Next.js应用: `npm run dev`
2. 访问: `http://localhost:3000/ai-workflow`
3. 点击"打开工作流设计器"进入可视化设计界面

### 3. 环境配置

在项目根目录创建 `.env.local` 文件:

```env
# PandaAI QuantFlow API配置
QUANTFLOW_API_BASE=http://127.0.0.1:8000
NEXT_PUBLIC_QUANTFLOW_UI_URL=http://127.0.0.1:8000/quantflow/
```

## API接口

### 工作流管理

#### 获取工作流列表
```http
GET /api/ai-workflow?action=list
```

#### 启动工作流
```http
POST /api/ai-workflow
Content-Type: application/json

{
  "action": "start",
  "workflowId": "workflow_id"
}
```

#### 停止工作流
```http
POST /api/ai-workflow
Content-Type: application/json

{
  "action": "stop",
  "workflowId": "workflow_id"
}
```

### 运行监控

#### 获取运行状态
```http
GET /api/ai-workflow/runs?workflowId=workflow_id
```

#### 获取执行日志
```http
GET /api/ai-workflow/logs?runId=run_id
```

## 工作流类型

### 1. 因子挖掘工作流
- **用途**: 基于机器学习算法挖掘有效股票因子
- **节点**: 数据加载 → 特征工程 → 模型训练 → 因子评估
- **输出**: 因子权重、回测结果、IC分析

### 2. 期权波动率预测
- **用途**: 使用深度学习预测期权波动率变化
- **节点**: 期权数据 → 波动率计算 → 神经网络 → 预测结果
- **输出**: 波动率预测、交易信号

### 3. 多资产组合优化
- **用途**: 基于风险平价模型优化投资组合
- **节点**: 资产数据 → 相关性分析 → 优化算法 → 权重分配
- **输出**: 最优权重、风险指标、回测表现

## 自定义节点开发

### 创建自定义节点

```python
from panda_plugins.base import BaseWorkNode, work_node
from pydantic import BaseModel

class InputModel(BaseModel):
    data: str

class OutputModel(BaseModel):
    result: str

@work_node(name="自定义节点", group="我的节点")
class CustomNode(BaseWorkNode):
    @classmethod
    def input_model(cls):
        return InputModel

    @classmethod
    def output_model(cls):
        return OutputModel

    def run(self, input: BaseModel):
        # 实现节点逻辑
        return OutputModel(result=f"处理结果: {input.data}")
```

### 节点部署

1. 将自定义节点文件放置在 `panda_quantflow/src/panda_plugins/custom/` 目录
2. 重启QuantFlow服务
3. 在工作流设计器中即可使用新节点

## 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查Python环境
python --version

# 检查依赖安装
pip list | grep panda

# 检查MongoDB连接
mongosh --eval "db.runCommand('ping')"
```

#### 2. API调用失败
- 确认QuantFlow服务运行在8000端口
- 检查防火墙设置
- 查看服务日志: `panda_quantflow/src/common/logs/`

#### 3. 工作流执行错误
- 检查数据源连接
- 验证节点参数配置
- 查看执行日志

### 日志位置

- **系统日志**: `panda_quantflow/src/common/logs/`
- **工作流日志**: 通过API接口获取
- **错误日志**: 浏览器开发者工具控制台

## 扩展功能

### 1. 集成更多数据源
- 支持Alpha Vantage、Yahoo Finance等
- 自定义数据适配器

### 2. 添加交易执行
- CTP期货交易接口
- QMT股票交易接口
- 数字货币交易支持

### 3. 增强监控功能
- 实时性能指标
- 告警通知系统
- 历史数据分析

## 技术支持

- **文档**: [PandaAI QuantFlow GitHub](https://github.com/PandaAI-Tech/panda_quantflow)
- **社区**: 加入PandaAI交流群获取支持
- **问题反馈**: 通过GitHub Issues提交问题

## 许可证

本项目采用GPLV3许可证，请遵守相关开源协议。
