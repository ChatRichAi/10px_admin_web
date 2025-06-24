# 🚀 快速开始指南

## ⚡ 30秒快速启动

如果您已经有Firebase和Google OAuth配置，可以快速启动：

```bash
# 1. 创建环境文件
cp .env.example .env.local

# 2. 编辑环境变量
nano .env.local  # 或使用您喜欢的编辑器

# 3. 检查配置
npm run check-env

# 4. 启动应用
npm run dev
```

## 📋 必需准备清单

### ✅ 立即需要的：

1. **NextAuth Secret** - 用于JWT加密
   ```bash
   # 生成一个随机密钥
   openssl rand -base64 32
   ```

2. **Firebase项目** - 用于用户数据存储
   - 创建Firebase项目
   - 启用Firestore数据库
   - 下载服务账户JSON文件

### 🔧 可选配置：

1. **Google OAuth** - 用于Google登录
   - Google Cloud Console中创建OAuth应用
   - 获取客户端ID和密钥

2. **Stripe** - 用于付费功能
   - 创建Stripe账户
   - 获取API密钥

## 🔑 最小环境变量配置

创建 `.env.local` 文件：

```env
# 必需 - NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# 必需 - Firebase配置
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"

# 可选 - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🎯 分步骤启动

### 第1步：环境检查
```bash
npm run check-env
```

### 第2步：配置Firebase
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目
3. 启用Firestore数据库
4. 生成服务账户密钥
5. 将信息填入 `.env.local`

### 第3步：启动应用
```bash
npm run dev
```

### 第4步：测试功能
1. 访问 http://localhost:3000/sign-up
2. 注册新账户
3. 登录测试

## 🛠️ 常见问题解决

### 问题1：Firebase连接失败
```bash
# 检查项目ID是否正确
echo $FIREBASE_PROJECT_ID

# 检查私钥格式
echo $FIREBASE_PRIVATE_KEY | head -1
```

### 问题2：NextAuth错误
```bash
# 确保密钥已设置
echo $NEXTAUTH_SECRET

# 检查URL配置
echo $NEXTAUTH_URL
```

### 问题3：依赖包问题
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📱 功能测试清单

- [ ] 用户注册 (邮箱/密码)
- [ ] 用户登录 (邮箱/密码)
- [ ] Google登录 (如果配置了)
- [ ] 用户注销
- [ ] 受保护路由访问
- [ ] 权限检查

## 🎉 成功标志

当看到以下页面时，说明配置成功：

1. **注册页面** - `/sign-up` 显示正常
2. **登录页面** - `/sign-in` 显示正常
3. **首页** - `/` 显示用户状态
4. **控制台无错误** - 浏览器开发者工具无红色错误

## 📞 获取帮助

如果遇到问题：

1. **检查日志** - 查看浏览器控制台和终端输出
2. **查看文档** - 阅读 `SETUP_GUIDE.md` 详细配置
3. **环境检查** - 运行 `npm run check-env`
4. **重启服务** - 停止并重新启动开发服务器

---

**🚀 准备好了吗？运行 `npm run dev` 开始使用！** 