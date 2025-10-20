# DeepSeek驱动的AI分析功能

## 概述

本项目已集成DeepSeek API，为波动率微笑等期权数据提供智能分析功能。AI分析将替代原有的本地数据分析，提供更专业、更深入的金融市场洞察。

## 功能特点

### 🤖 智能分析
- 基于DeepSeek v3模型的专业期权市场分析
- 自动识别关键市场趋势和风险因素
- 提供结构化的分析报告

### 📊 结构化输出
- 核心统计指标分析
- 期限结构特征解读
- 市场情绪洞察
- 风险提示和建议

### 🔄 容错机制
- DeepSeek API失败时自动回退到本地分析
- 确保功能的稳定性和可用性

## 配置步骤

### 1. 获取DeepSeek API密钥

1. 访问 [DeepSeek官网](https://platform.deepseek.com/)
2. 注册或登录账户
3. 进入API Keys页面
4. 创建新的API密钥
5. 复制API密钥（格式：`sk-...`）

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# DeepSeek 配置
OPENAI_API_KEY=sk-your-actual-deepseek-api-key-here
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

**注意：** 请将 `sk-your-actual-deepseek-api-key-here` 替换为您的真实DeepSeek API密钥。

### 3. 重启开发服务器

```bash
npm run dev
# 或
yarn dev
```

## 使用方法

### 在波动率微笑组件中

1. 打开波动率微笑图表页面
2. 点击右上角的 "AI" 按钮
3. 等待AI分析完成（通常需要3-5秒）
4. 查看结构化的分析报告

### 分析内容

AI分析报告包含以下四个主要部分：

#### 📈 核心统计指标
- ATM波动率数值
- 微笑强度分析
- 关键数据点识别

#### 🏗️ 期限结构分析
- 短期vs长期波动率对比
- 期限结构特征判断
- 斜率分析

#### 🧠 市场情绪洞察
- 微笑曲线特征解读
- 市场情绪判断
- 趋势预测

#### ⚠️ 风险提示
- 关键风险因素识别
- 投资建议
- 注意事项

## API接口

### 分析接口

**端点：** `POST /api/openai/analyze`

**请求体：**
```json
{
  "data": {
    "symbol": "BTC",
    "atmValue": 35.2,
    "avgITM": 38.5,
    "avgOTM": 32.1,
    "smileIntensity": 6.4,
    "smileDirection": "正向微笑",
    "termSlope": 2.3,
    "expiryStats": [...],
    "chartData": [...]
  },
  "analysisType": "volatility_smile",
  "prompt": "请分析BTC波动率微笑数据..."
}
```

**响应：**
```json
{
  "summary": [
    {
      "type": "core",
      "title": "核心统计指标",
      "icon": "stats",
      "items": [
        {
          "title": "ATM波动率",
          "value": "35.20%",
          "valueColor": "text-blue-600",
          "subTitle": "Delta: 0.50",
          "subValue": ""
        }
      ]
    }
  ]
}
```

## 成本控制

### API调用费用

- **模型：** GPT-4
- **预估成本：** 每次分析约 $0.01-0.03
- **Token限制：** 最大2000 tokens

### 优化建议

1. **缓存机制：** 相同数据的分析结果可以缓存
2. **批量分析：** 多个组件可以共享分析结果
3. **本地回退：** API失败时使用本地分析

## 故障排除

### 常见问题

#### 1. "OpenAI API密钥未配置" 错误
**解决方案：** 确保在 `.env.local` 文件中正确配置了 `OPENAI_API_KEY`

#### 2. "OpenAI API调用失败" 错误
**可能原因：**
- API密钥无效或过期
- 网络连接问题
- API配额超限

**解决方案：**
- 检查API密钥是否正确
- 确认网络连接
- 检查OpenAI账户余额

#### 3. "AI响应格式错误" 错误
**解决方案：** 系统会自动回退到本地分析，功能仍可正常使用

### 调试模式

在开发环境中，可以在浏览器控制台查看详细的API调用日志：

```javascript
// 在浏览器控制台中查看
console.log('OpenAI API调用详情');
```

## 扩展功能

### 支持的分析类型

目前支持的分析类型：
- `volatility_smile` - 波动率微笑分析
- 可扩展支持其他期权分析类型

### 自定义提示词

可以通过修改 `/app/api/openai/analyze/route.ts` 中的 `systemPrompt` 来自定义AI分析风格和深度。

## 安全注意事项

1. **API密钥安全：** 永远不要在客户端代码中暴露API密钥
2. **环境变量：** 确保 `.env.local` 文件已添加到 `.gitignore`
3. **请求限制：** 考虑添加速率限制以防止滥用

## 更新日志

- **v2.0.0** - 升级到DeepSeek v3模型
- **v1.0.0** - 初始版本，支持波动率微笑AI分析
- 集成DeepSeek v3模型
- 实现结构化输出
- 添加容错机制

---

如有问题或建议，请提交Issue或联系开发团队。 