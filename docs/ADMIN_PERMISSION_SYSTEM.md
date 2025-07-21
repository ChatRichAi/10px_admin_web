# 后台用户权限管理系统

## 概述

这是一个完整的后台用户权限管理系统，为您的10px AI项目提供了强大的用户管理、权限控制和订阅管理功能。

## 功能特性

### 🎯 核心功能
- **用户管理** - 完整的用户CRUD操作
- **权限管理** - 细粒度的权限分配和控制
- **订阅管理** - 订阅状态管理和批量操作
- **数据统计** - 实时数据分析和可视化

### 🔐 权限系统
- **4级套餐** - 免费版、入门版、标准版、专业版
- **10种权限** - 从基础功能到管理功能的完整权限体系
- **权限分类** - 基础功能、高级功能、专业功能、管理功能
- **权限验证** - 服务端和客户端的双重权限验证

### 📊 管理功能
- **用户搜索** - 支持按姓名和邮箱搜索
- **批量操作** - 支持批量升级、取消、激活等操作
- **实时统计** - 用户数量、收入统计、套餐分布
- **权限分配** - 可视化的权限管理界面

## 系统架构

```
前端组件 (React)
├── AdminDashboard.tsx      # 主管理仪表板
├── UserManager.tsx         # 用户管理组件
├── PermissionManager.tsx   # 权限管理组件
└── SubscriptionManager.tsx # 订阅管理组件

API接口 (Next.js)
├── /api/admin/users        # 用户管理API
├── /api/admin/permissions  # 权限管理API
└── /api/admin/subscriptions # 订阅管理API

数据层 (Firebase)
├── users集合              # 用户数据
├── 权限字段               # 用户权限列表
└── 订阅信息               # 订阅状态和套餐

权限验证
├── middleware/auth.ts      # 服务端权限验证
├── useAuth hook           # 客户端权限检查
└── ProtectedRoute         # 路由保护组件
```

## 权限体系

### 权限常量
```typescript
export const PERMISSIONS = {
  // 基础功能
  BASIC_ANALYSIS: 'basic_analysis',      // 基础资产分析
  PRICE_ALERTS: 'price_alerts',          // 实时价格预警
  
  // 高级功能
  ADVANCED_ANALYSIS: 'advanced_analysis', // 高级市场分析
  AI_PREDICTION: 'ai_prediction',         // AI预测分析
  MARKET_DEPTH: 'market_depth',           // 市场深度分析
  
  // 专业功能
  AUTO_TRADING: 'auto_trading',           // 自动化交易
  PRIORITY_SUPPORT: 'priority_support',   // 优先客户支持
  ADVANCED_CHARTS: 'advanced_charts',     // 高级图表工具
  API_ACCESS: 'api_access',               // API访问权限
  
  // 管理功能
  ADMIN_ACCESS: 'admin_access',           // 管理员权限
}
```

### 套餐权限映射
```typescript
export const PLAN_PERMISSIONS = {
  free: [],                    // 免费版 - 无权限
  starter: [                   // 入门版
    PERMISSIONS.BASIC_ANALYSIS,
    PERMISSIONS.PRICE_ALERTS,
    PERMISSIONS.AI_PREDICTION,
  ],
  standard: [                  // 标准版
    ...PLAN_PERMISSIONS.starter,
    PERMISSIONS.ADVANCED_ANALYSIS,
    PERMISSIONS.MARKET_DEPTH,
  ],
  pro: [                      // 专业版 - 全部权限
    ...PLAN_PERMISSIONS.standard,
    PERMISSIONS.AUTO_TRADING,
    PERMISSIONS.PRIORITY_SUPPORT,
    PERMISSIONS.ADVANCED_CHARTS,
    PERMISSIONS.API_ACCESS,
  ],
}
```

## API接口文档

### 用户管理API

#### 获取用户列表
```http
GET /api/admin/users
Authorization: Bearer <token>
```

**响应示例：**
```json
[
  {
    "id": "user123",
    "email": "user@example.com",
    "name": "张三",
    "image": "https://...",
    "subscription": {
      "plan": "standard",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z"
    },
    "permissions": ["basic_analysis", "price_alerts"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 更新用户信息
```http
PUT /api/admin/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user123",
  "updates": {
    "name": "新姓名",
    "subscription": {
      "plan": "pro",
      "status": "active"
    }
  }
}
```

#### 删除用户
```http
DELETE /api/admin/users?userId=user123
Authorization: Bearer <token>
```

### 权限管理API

#### 获取权限列表
```http
GET /api/admin/permissions
Authorization: Bearer <token>
```

**响应示例：**
```json
[
  {
    "key": "BASIC_ANALYSIS",
    "value": "basic_analysis",
    "description": "基础资产分析"
  }
]
```

#### 分配用户权限
```http
POST /api/admin/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user123",
  "permissions": ["basic_analysis", "ai_prediction"]
}
```

#### 撤销用户权限
```http
DELETE /api/admin/permissions?userId=user123&permission=basic_analysis
Authorization: Bearer <token>
```

### 订阅管理API

#### 获取订阅统计
```http
GET /api/admin/subscriptions
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "totalUsers": 100,
  "activeSubscriptions": 80,
  "freeUsers": 20,
  "starterUsers": 30,
  "standardUsers": 40,
  "proUsers": 10,
  "monthlyRevenue": 15800,
  "cancelledSubscriptions": 5
}
```

#### 更新用户订阅
```http
PUT /api/admin/subscriptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user123",
  "subscription": {
    "plan": "pro",
    "status": "active",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z"
  }
}
```

#### 批量订阅操作
```http
POST /api/admin/subscriptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "upgrade",
  "userIds": ["user1", "user2", "user3"],
  "plan": "standard"
}
```

**支持的操作类型：**
- `upgrade` - 升级套餐
- `cancel` - 取消订阅
- `reactivate` - 重新激活
- `expire` - 设为过期

## 组件使用指南

### AdminDashboard 主管理仪表板

```tsx
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  return <AdminDashboard />
}
```

**功能特性：**
- 4个标签页：概览、用户管理、权限管理、订阅管理
- 实时统计卡片
- 用户搜索和批量操作
- 权限分配模态框
- 用户编辑模态框

### UserManager 用户管理组件

```tsx
import UserManager from '@/components/UserManager'

<UserManager
  onUserUpdate={(userId, updates) => {
    console.log('用户更新:', userId, updates)
  }}
  onUserDelete={(userId) => {
    console.log('用户删除:', userId)
  }}
  readOnly={false}
/>
```

**Props：**
- `onUserUpdate` - 用户更新回调
- `onUserDelete` - 用户删除回调
- `readOnly` - 只读模式

### PermissionManager 权限管理组件

```tsx
import PermissionManager from '@/components/PermissionManager'

<PermissionManager
  user={selectedUser}
  onUpdate={(userId, permissions) => {
    console.log('权限更新:', userId, permissions)
  }}
  readOnly={false}
/>
```

**Props：**
- `user` - 要管理权限的用户
- `onUpdate` - 权限更新回调
- `readOnly` - 只读模式

### SubscriptionManager 订阅管理组件

```tsx
import SubscriptionManager from '@/components/SubscriptionManager'

<SubscriptionManager
  onSubscriptionUpdate={(userId, subscription) => {
    console.log('订阅更新:', userId, subscription)
  }}
  onBulkAction={(action, userIds, plan) => {
    console.log('批量操作:', action, userIds, plan)
  }}
  readOnly={false}
/>
```

**Props：**
- `onSubscriptionUpdate` - 订阅更新回调
- `onBulkAction` - 批量操作回调
- `readOnly` - 只读模式

## 权限验证

### 服务端权限验证

```typescript
import { requireAuth } from '@/middleware/auth'
import { PERMISSIONS } from '@/lib/permissions'

// 在API路由中验证权限
export async function GET() {
  const session = await requireAuth(PERMISSIONS.ADMIN_ACCESS)
  if (session instanceof NextResponse) return session
  
  // 继续处理请求...
}
```

### 客户端权限检查

```typescript
import { usePermission } from '@/hooks/useAuth'
import { PERMISSIONS } from '@/lib/permissions'

function MyComponent() {
  const { hasPermission, isLoading } = usePermission(PERMISSIONS.AI_PREDICTION)
  
  if (isLoading) return <div>加载中...</div>
  
  return (
    <div>
      {hasPermission ? (
        <AIFeature />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  )
}
```

### 路由保护

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'
import { PERMISSIONS } from '@/lib/permissions'

<ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS}>
  <AdminPage />
</ProtectedRoute>
```

## 环境配置

### 管理员邮箱配置

在 `.env.local` 中配置管理员邮箱：

```env
ADMIN_EMAILS=admin@example.com,superadmin@example.com
```

### Firebase 配置

确保已配置 Firebase Admin SDK：

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
```

## 部署说明

### 1. 安装依赖

```bash
npm install date-fns
```

### 2. 配置环境变量

参考 `.env.example` 配置所有必要的环境变量。

### 3. 设置管理员权限

在 Firebase 控制台中为管理员用户添加 `admin_access` 权限。

### 4. 访问管理后台

访问 `/admin` 路径进入管理后台。

## 安全考虑

### 权限验证
- 所有管理API都需要管理员权限
- 客户端和服务端双重验证
- 基于邮箱的管理员身份验证

### 数据保护
- 用户密码加密存储
- API请求需要有效token
- 敏感操作需要确认

### 访问控制
- 管理页面需要管理员权限
- 普通用户无法访问管理功能
- 权限不足时自动重定向

## 扩展功能

### 自定义权限
可以在 `lib/permissions.ts` 中添加新的权限：

```typescript
export const PERMISSIONS = {
  // 现有权限...
  CUSTOM_FEATURE: 'custom_feature',
}
```

### 自定义套餐
可以在 `types/user.ts` 中添加新的套餐类型：

```typescript
export type PlanType = 'free' | 'starter' | 'standard' | 'pro' | 'enterprise'
```

### 自定义统计
可以在订阅管理API中添加自定义统计逻辑。

## 故障排除

### 常见问题

1. **权限验证失败**
   - 检查用户是否在 `ADMIN_EMAILS` 列表中
   - 确认用户有 `admin_access` 权限

2. **API调用失败**
   - 检查 Firebase 配置
   - 确认网络连接正常

3. **数据不显示**
   - 检查数据库连接
   - 确认数据格式正确

### 调试模式

在开发环境中启用详细日志：

```typescript
// 在API路由中添加日志
console.log('用户数据:', userData)
console.log('权限检查:', hasPermission)
```

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完整的用户管理功能
- 权限管理系统
- 订阅管理功能
- 管理仪表板

---

这个权限管理系统为您的项目提供了企业级的用户管理能力，支持灵活的权限配置和完整的订阅管理功能。 