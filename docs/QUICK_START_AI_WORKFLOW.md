# AI工作流快速启动指南

## 🚀 快速开始

### 1. 启动PandaAI QuantFlow服务

```bash
# 使用提供的启动脚本
./scripts/start-quantflow.sh

# 或者手动启动
cd panda_quantflow
python src/panda_server/main.py
```

### 2. 访问AI工作流页面

1. 启动Next.js应用: `npm run dev`
2. 访问: `http://localhost:3000/ai-workflow`

## 📋 功能说明

### 当前状态
- ✅ **页面已创建**: AI工作流管理界面已完成
- ✅ **API集成**: 已集成panda_quantflow的API接口
- ✅ **错误处理**: 服务未运行时显示演示数据
- ✅ **导航集成**: 已添加到主导航菜单

### 主要功能
1. **工作流管理**: 查看、启动、停止工作流
2. **运行监控**: 实时监控工作流执行状态
3. **分析报告**: 查看工作流统计和趋势
4. **可视化设计器**: 直接跳转到QuantFlow设计界面

## 🔧 故障排除

### 问题1: 页面显示"服务未运行"提示
**解决方案**:
```bash
# 启动panda_quantflow服务
cd panda_quantflow
python src/panda_server/main.py
```

### 问题2: 无法连接服务
**检查项目**:
1. 确认panda_quantflow目录存在
2. 检查Python环境是否正确
3. 确认端口8000未被占用

### 问题3: 工作流设计器无法打开
**解决方案**:
1. 确保panda_quantflow服务运行在8000端口
2. 检查防火墙设置
3. 手动访问: `http://127.0.0.1:8000/quantflow/`

## 📁 文件结构

```
app/
├── ai-workflow/
│   └── page.tsx              # AI工作流主页面
└── api/
    └── ai-workflow/
        ├── route.ts          # 工作流API
        ├── runs/route.ts     # 运行状态API
        └── logs/route.ts     # 日志API

scripts/
└── start-quantflow.sh        # 服务启动脚本

docs/
├── AI_WORKFLOW_INTEGRATION.md # 详细集成文档
└── QUICK_START_AI_WORKFLOW.md # 快速启动指南
```

## 🎯 下一步

1. **启动服务**: 运行 `./scripts/start-quantflow.sh`
2. **测试功能**: 访问AI工作流页面
3. **创建工作流**: 使用可视化设计器
4. **监控执行**: 查看工作流运行状态

## 💡 提示

- 服务未运行时，页面会显示演示数据
- 所有功能都可以正常浏览和测试
- 启动服务后即可使用完整功能
- 支持实时监控和日志查看
