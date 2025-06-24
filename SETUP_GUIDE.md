# 注册登录系统配置指南

## 📋 前置准备清单

### 1. 环境变量配置

创建 `.env.local` 文件，并配置以下环境变量：

```env
# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth 配置
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase 配置
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-firebase-private-key\n-----END PRIVATE KEY-----"

# Stripe 配置 (可选)
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# 管理员邮箱 (可选)
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### 2. Firebase 配置

#### 2.1 创建 Firebase 项目
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "创建项目"
3. 输入项目名称，如 "10px-ai-react"
4. 按照步骤完成项目创建

#### 2.2 启用 Firestore 数据库
1. 在 Firebase 控制台中选择项目
2. 点击 "Firestore Database"
3. 点击 "创建数据库"
4. 选择"以测试模式启动"（开发阶段）
5. 选择数据库位置（建议选择亚洲区域）

#### 2.3 生成服务账户密钥
1. 在 Firebase 控制台中，点击 "项目设置"
2. 选择 "服务账户" 标签
3. 点击 "生成新的私钥"
4. 下载 JSON 文件
5. 从 JSON 文件中提取以下信息：
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

#### 2.4 配置 Firestore 安全规则
在 Firestore 规则中添加：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许已认证用户读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 管理员可以读写所有用户数据
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in ["admin@example.com"];
    }
  }
}
```

### 3. Google OAuth 配置

#### 3.1 创建 Google OAuth 应用
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID

#### 3.2 配置 OAuth 设置
1. 在 "OAuth 同意屏幕" 中配置应用信息
2. 在 "凭据" 中创建 OAuth 2.0 客户端 ID
3. 添加授权回调 URL：
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### 4. Stripe 配置（可选）

#### 4.1 创建 Stripe 账户
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册或登录账户
3. 切换到测试模式

#### 4.2 获取 API 密钥
1. 在 Stripe Dashboard 中点击 "开发者"
2. 点击 "API 密钥"
3. 复制可发布密钥和秘密密钥

#### 4.3 创建产品和价格
1. 在 Stripe Dashboard 中创建产品
2. 为每个套餐创建价格
3. 记录价格 ID 用于配置

### 5. 依赖包安装

确保安装以下依赖包：

```bash
npm install next-auth
npm install firebase-admin
npm install bcryptjs
npm install @types/bcryptjs
npm install stripe
npm install @chakra-ui/react
npm install @mui/material
```

### 6. 生成 NextAuth Secret

生成一个安全的密钥：

```bash
# 使用 OpenSSL
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 启动步骤

1. **克隆项目**
   ```bash
   git clone your-repo-url
   cd 10px_ai_react
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```
   然后编辑 `.env.local` 文件，填入实际的配置值

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问 `http://localhost:3000`

## 🔍 测试功能

### 测试注册功能
1. 访问 `/sign-up`
2. 使用有效邮箱注册
3. 检查 Firestore 中是否创建了用户记录

### 测试登录功能
1. 访问 `/sign-in`
2. 使用注册的账户登录
3. 或使用 Google 账户登录

### 测试权限系统
1. 访问需要权限的页面
2. 检查是否正确重定向到升级页面

## 🛠️ 故障排除

### 常见问题

1. **Firebase 连接失败**
   - 检查 Firebase 项目配置
   - 确认私钥格式正确（包含换行符）

2. **Google OAuth 失败**
   - 检查回调 URL 配置
   - 确认 OAuth 应用状态为已发布

3. **权限错误**
   - 检查 Firestore 安全规则
   - 确认用户权限配置

4. **环境变量问题**
   - 重启开发服务器
   - 检查变量名称拼写

## 📝 开发建议

1. **安全性**
   - 生产环境使用 HTTPS
   - 定期更新密钥
   - 限制 CORS 设置

2. **性能优化**
   - 使用 Firebase 索引
   - 缓存用户会话
   - 优化数据库查询

3. **用户体验**
   - 添加加载状态
   - 提供错误恢复选项
   - 支持多语言

## 📞 技术支持

如果遇到问题，请检查：
1. 环境变量配置
2. Firebase 控制台日志
3. 浏览器开发者工具
4. 服务器日志

---

*配置完成后，您的注册登录系统就可以正常运行了！* 