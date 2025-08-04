# 管理后台系统

这是一个独立的管理后台系统，用于管理用户、权限、订阅等系统功能。

## 功能特性

- 🔐 用户认证和权限管理
- 👥 用户管理（增删改查）
- 🔑 权限和角色管理
- 💳 订阅管理
- 📊 数据统计和图表
- 📝 系统日志查看
- ⚙️ 系统配置管理
- 🔌 API密钥管理

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **认证**: Firebase Auth
- **数据库**: Firebase Firestore (可配置)
- **图表**: Recharts (可选)
- **类型检查**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# Firebase 配置
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 服务端 Firebase Admin SDK (可选)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
admin-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── admin/         # 管理后台 API
│   ├── components/        # 页面组件
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── lib/                   # 工具库
│   ├── auth.ts           # 认证相关
│   └── permissions.ts    # 权限定义
├── types/                 # TypeScript 类型定义
├── public/                # 静态资源
└── package.json
```

## 主要页面

- `/` - 仪表板首页
- `/users` - 用户管理
- `/permissions` - 权限管理
- `/subscriptions` - 订阅管理
- `/analytics` - 数据统计
- `/logs` - 系统日志
- `/system` - 系统设置
- `/api` - API管理

## 权限系统

系统使用基于角色的权限控制（RBAC）：

### 角色
- **用户 (user)**: 基础功能访问权限
- **版主 (moderator)**: 内容审核和管理权限
- **管理员 (admin)**: 完整系统管理权限

### 权限
- `admin:access` - 访问管理后台
- `user:read` - 查看用户信息
- `user:write` - 编辑用户信息
- `user:delete` - 删除用户
- `subscription:read` - 查看订阅信息
- `subscription:write` - 编辑订阅信息
- `permission:read` - 查看权限信息
- `permission:write` - 编辑权限信息
- `log:read` - 查看系统日志
- `analytics:read` - 查看数据分析
- `system:config` - 系统配置

## API 接口

### 用户管理
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users` - 更新用户信息
- `DELETE /api/admin/users` - 删除用户

### 权限管理
- `GET /api/admin/permissions` - 获取权限配置
- `PUT /api/admin/permissions` - 更新权限配置

### 订阅管理
- `GET /api/admin/subscriptions` - 获取订阅列表
- `PUT /api/admin/subscriptions` - 更新订阅信息

## 自定义配置

### 主题配置

在 `tailwind.config.js` 中可以自定义主题颜色：

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        // ... 其他颜色
      }
    }
  }
}
```

### 权限配置

在 `lib/permissions.ts` 中可以添加新的权限：

```typescript
export const PERMISSIONS = {
  // 现有权限...
  NEW_PERMISSION: 'new:permission',
} as const
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目可以部署到任何支持 Next.js 的平台：

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 开发指南

### 添加新页面

1. 在 `app/` 目录下创建新的页面文件
2. 在 `app/components/AdminSidebar.tsx` 中添加导航项
3. 创建对应的组件和API路由

### 添加新组件

1. 在 `app/components/` 目录下创建组件文件
2. 使用 TypeScript 定义接口
3. 遵循现有的样式规范

### 添加新API

1. 在 `app/api/admin/` 目录下创建API路由
2. 实现 GET、POST、PUT、DELETE 方法
3. 添加适当的错误处理

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 