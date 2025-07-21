# 10px AI 管理后台前端

这是 10px AI 项目的管理后台前端应用，基于 Next.js 14 和 React 构建。

## 🚀 功能特性

- **现代化 UI**: 基于 Chakra UI 的响应式设计
- **用户认证**: JWT 令牌认证系统
- **权限管理**: 基于角色的访问控制界面
- **用户管理**: 完整的用户 CRUD 操作界面
- **订阅管理**: 订阅状态和套餐管理界面
- **数据统计**: 实时数据统计和图表展示
- **响应式设计**: 支持桌面和移动设备

## 📋 系统要求

- Node.js >= 18.0.0
- npm 或 yarn
- 后端 API 服务

## 🛠️ 安装和配置

### 1. 克隆项目

```bash
git clone https://github.com/ChatRichAi/10px_admin_web.git
cd 10px_admin_web
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量示例文件：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，配置以下变量：

```env
# 后端 API 地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# 生产环境后端 API 地址
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📚 项目结构

```
├── app/                    # Next.js 13+ App Router
│   ├── admin/             # 管理后台页面
│   ├── api/               # API 路由（已移除）
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── providers.tsx      # 全局提供者
├── components/            # React 组件
│   ├── AdminDashboard.tsx # 管理后台主面板
│   ├── AdminSidebar.tsx   # 侧边栏导航
│   ├── PermissionManager.tsx # 权限管理组件
│   └── ...
├── hooks/                 # 自定义 Hooks
│   └── useAuth.tsx        # 认证 Hook
├── lib/                   # 工具库
│   └── api.js            # API 客户端
├── templates/             # 页面模板
│   ├── SignInPage/       # 登录页面
│   └── ...
└── types/                 # TypeScript 类型定义
```

## 🔐 认证系统

### 登录流程

1. 用户输入邮箱和密码
2. 前端调用后端登录 API
3. 后端验证凭据并返回 JWT 令牌
4. 前端保存令牌到 localStorage
5. 用户被重定向到管理后台

### 权限验证

- 每个受保护的路由都会检查用户权限
- 管理员权限：`admin_access`
- 订阅状态：`active`
- 套餐类型：`admin`

## 🎨 UI 组件

### 主要组件

- **AdminDashboard**: 管理后台主面板
- **AdminSidebar**: 侧边栏导航
- **PermissionManager**: 权限管理界面
- **UserManager**: 用户管理界面
- **SubscriptionManager**: 订阅管理界面

### 样式系统

- **Chakra UI**: 主要 UI 组件库
- **Tailwind CSS**: 辅助样式
- **响应式设计**: 支持多种屏幕尺寸

## 📱 页面路由

### 公开页面

- `/`: 首页
- `/sign-in`: 登录页面
- `/sign-up`: 注册页面

### 受保护页面

- `/admin`: 管理后台主页
- `/admin/users`: 用户管理
- `/admin/permissions`: 权限管理
- `/admin/subscriptions`: 订阅管理

## 🔧 开发

### 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

## 🚀 部署

### Vercel 部署（推荐）

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台

- **Netlify**: 支持 Next.js 静态导出
- **AWS Amplify**: 完整的 CI/CD 流程
- **Docker**: 容器化部署

### 环境变量配置

生产环境需要配置：

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## 🔗 API 集成

### API 客户端

前端使用统一的 API 客户端 (`lib/api.js`) 与后端通信：

```javascript
import { authAPI, adminAPI, userAPI } from '@/lib/api'

// 登录
const result = await authAPI.login({ email, password })

// 获取用户列表
const users = await adminAPI.getUsers()

// 更新用户
await adminAPI.updateUser(userId, updates)
```

### 错误处理

- 统一的错误处理机制
- 用户友好的错误提示
- 自动重试机制

## 📊 数据流

```
用户操作 → React 组件 → API 客户端 → 后端 API → 数据库
    ↑                                                      ↓
    ← 响应数据 ← 状态更新 ← 组件重新渲染 ← 数据返回 ←
```

## 🛡️ 安全特性

- **JWT 认证**: 安全的令牌认证
- **权限验证**: 前端和后端双重验证
- **输入验证**: 客户端输入验证
- **XSS 防护**: 自动转义用户输入
- **CSRF 防护**: 内置 CSRF 保护

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请联系开发团队。 