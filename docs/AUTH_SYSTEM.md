# 用户认证和权限管理系统

## 概述

这是一个完整的用户认证和付费权限管理系统，基于 Next.js、NextAuth、Firebase 和 Stripe 构建。

## 系统架构

```
前端应用 (Next.js)
├── 用户界面
├── API Routes (用户管理、订阅管理)
└── 管理面板 (/admin 路由)

数据服务 (Firebase)
├── 用户数据存储
├── 订阅信息管理
└── 权限控制

第三方服务
├── NextAuth (身份验证)
├── Stripe (支付处理)
└── Google OAuth (社交登录)
```

## 功能特性

### 1. 身份认证
- 邮箱/密码登录
- Google OAuth 登录
- 安全的会话管理
- 自动登录状态检查

### 2. 权限管理
- 基于套餐的权限控制
- 细粒度权限检查
- 权限不足自动引导升级

### 3. 订阅管理
- 多套餐支持（免费版、入门版、标准版、专业版）
- Stripe 支付集成
- 自动订阅续费
- 订阅状态实时同步

### 4. 管理后台
- 用户管理
- 订阅状态监控
- 收入统计
- 用户行为分析

## 目录结构

```
├── lib/
│   ├── auth.ts                 # NextAuth 配置
│   ├── firebase.ts             # Firebase 配置
│   ├── permissions.ts          # 权限管理
│   ├── stripe.ts              # Stripe 集成
│   └── user-service.ts        # 用户服务
├── types/
│   └── user.ts                # 类型定义
├── middleware/
│   └── auth.ts                # 权限中间件
├── hooks/
│   └── useAuth/               # 认证钩子
├── components/
│   ├── AuthProvider.tsx       # 认证提供程序
│   ├── ProtectedRoute.tsx     # 路由保护
│   ├── PricingCard.tsx        # 定价卡片
│   ├── SubscriptionStatus.tsx # 订阅状态
│   └── AdminDashboard.tsx     # 管理后台
└── app/
    ├── api/
    │   ├── auth/              # 认证 API
    │   ├── subscription/      # 订阅 API
    │   └── user/             # 用户 API
    ├── admin/                # 管理后台页面
    └── pricing/              # 定价页面
```

## 套餐配置

### 免费版
- 基础市场数据查看
- 简单价格提醒
- 基础教程和帮助

### 入门版 (¥128/月)
- 实时价格预警
- 基础资产分析
- AI预测分析
- 有限自动化交易

### 标准版 (¥198/月) - 热门推荐
- 包含入门版全部功能
- 市场深度分析
- 高级资产分析
- 增强版AI预测分析
- 高级图表工具

### 专业版 (¥498/月)
- 包含标准版全部功能
- 无限制自动化交易
- API访问权限
- 高优先级客户支持
- 专属客户经理

## 权限系统

### 权限常量
```typescript
export const PERMISSIONS = {
  BASIC_ANALYSIS: 'basic_analysis',
  PRICE_ALERTS: 'price_alerts',
  ADVANCED_ANALYSIS: 'advanced_analysis',
  AI_PREDICTION: 'ai_prediction',
  MARKET_DEPTH: 'market_depth',
  AUTO_TRADING: 'auto_trading',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_CHARTS: 'advanced_charts',
  API_ACCESS: 'api_access',
  ADMIN_ACCESS: 'admin_access',
}
```

### 使用示例
```typescript
// 在组件中检查权限
const { hasPermission } = usePermission(PERMISSIONS.AI_PREDICTION)

// 在API路由中验证权限
const authResult = await requireAuth(PERMISSIONS.AUTO_TRADING)
```

## 环境变量配置

创建 `.env.local` 文件：

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_STANDARD_MONTHLY_PRICE_ID=price_...
STRIPE_STANDARD_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...

# Admin Settings
ADMIN_EMAILS=admin@example.com
```

## 部署指南

### 1. Firebase 设置
1. 创建 Firebase 项目
2. 启用 Firestore 数据库
3. 生成服务账号密钥
4. 配置环境变量

### 2. Stripe 设置
1. 创建 Stripe 账户
2. 创建产品和价格
3. 配置 Webhook 端点
4. 设置价格 ID

### 3. Google OAuth 设置
1. 在 Google Cloud Console 创建项目
2. 启用 Google+ API
3. 创建 OAuth 2.0 客户端 ID
4. 配置回调 URL

### 4. 部署到 Vercel
```bash
npm run build
vercel --prod
```

## 使用说明

### 1. 保护页面
```typescript
import ProtectedRoute from '@/components/ProtectedRoute'
import { PERMISSIONS } from '@/lib/permissions'

export default function TradePage() {
  return (
    <ProtectedRoute permission={PERMISSIONS.AUTO_TRADING}>
      <div>需要自动交易权限的内容</div>
    </ProtectedRoute>
  )
}
```

### 2. 检查订阅状态
```typescript
import { useSubscription } from '@/hooks/useAuth'

export default function Dashboard() {
  const { subscription, isActive, isPro } = useSubscription()
  
  return (
    <div>
      {isActive ? '订阅有效' : '订阅已过期'}
      {isPro && <div>专业功能</div>}
    </div>
  )
}
```

### 3. 处理支付
```typescript
import PricingCard from '@/components/PricingCard'

export default function PricingPage() {
  const handleSubscribe = async (plan, billing) => {
    // 自动跳转到 Stripe 结账页面
    const response = await fetch('/api/subscription/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billing }),
    })
    
    const { url } = await response.json()
    window.location.href = url
  }
  
  return (
    <PricingCard
      plan="standard"
      title="标准版"
      onSubscribe={handleSubscribe}
      // ... 其他属性
    />
  )
}
```

## 注意事项

1. **安全性**：所有敏感操作都在服务端进行权限验证
2. **性能**：使用 React 钩子缓存用户状态，减少 API 调用
3. **用户体验**：权限不足时自动引导用户升级
4. **可扩展性**：权限系统支持灵活配置和扩展
5. **监控**：集成 Stripe webhook 实时同步订阅状态

## 故障排除

### 常见问题

1. **登录失败**
   - 检查 Google OAuth 配置
   - 验证环境变量设置

2. **支付失败**
   - 确认 Stripe 价格 ID 正确
   - 检查 webhook 端点配置

3. **权限不生效**
   - 验证用户订阅状态
   - 检查权限配置映射

### 日志查看
- 客户端错误：浏览器开发者工具
- 服务端错误：Vercel 控制台
- Stripe 事件：Stripe Dashboard

## 支持与维护

- 定期更新依赖包
- 监控系统性能和错误
- 备份用户数据
- 更新安全策略

---

如需技术支持，请联系开发团队。 