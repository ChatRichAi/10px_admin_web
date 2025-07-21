# Telegram Bot 故障排除指南

## 常见错误及解决方案

### 1. "Forbidden: bot was blocked by the user"

**错误原因：** 用户阻止了Bot，Bot无法发送消息

**解决方案：**
1. 在Telegram中搜索您的Bot（如 @FUZITRADEBOT）
2. 点击Bot头像进入聊天界面
3. 如果显示"Bot被阻止"，点击"解除阻止"
4. 或者发送 `/start` 命令重新激活Bot

### 2. "Forbidden: bot was kicked from the group chat"

**错误原因：** Bot被从群组中踢出

**解决方案：**
1. 重新将Bot添加到群组
2. 确保Bot有发送消息的权限
3. 检查群组设置是否允许Bot发送消息

### 3. "Bad Request: chat not found"

**错误原因：** Chat ID不正确

**解决方案：**
1. 重新获取正确的Chat ID
2. 确保Bot与目标聊天有对话历史

### 4. "Unauthorized"

**错误原因：** Bot Token不正确

**解决方案：**
1. 检查Bot Token格式：`数字:字母数字组合`
2. 重新从 @BotFather 获取Token

## 验证流程

### 步骤1：验证Bot Token
```bash
# 在浏览器中访问（替换YOUR_BOT_TOKEN）
https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getMe
```
如果返回 `{"ok":true,"result":{...}}` 说明Token正确

### 步骤2：验证Chat ID
```bash
# 访问（替换YOUR_BOT_TOKEN）
https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates
```
在返回的JSON中找到 `chat.id` 字段

### 步骤3：测试发送消息
```bash
# 发送测试消息（替换参数）
curl -X POST https://api.telegram.org/bot{YOUR_BOT_TOKEN}/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"YOUR_CHAT_ID","text":"测试消息"}'
```

## 个人聊天 vs 群组聊天

### 个人聊天
- Chat ID: 正数（如：123456789）
- 需要用户主动与Bot开始对话
- 发送 `/start` 命令激活Bot

### 群组聊天
- Chat ID: 负数（如：-1001234567890）
- 需要将Bot添加到群组
- 确保Bot有发送消息权限

## 最佳实践

1. **先测试个人聊天**：确保Bot在个人聊天中正常工作
2. **再测试群组**：将Bot添加到群组进行测试
3. **定期检查**：确保Bot没有被阻止或踢出
4. **权限管理**：只给Bot必要的权限

## 联系支持

如果问题仍然存在，请检查：
- Bot Token 是否正确
- Chat ID 是否正确
- 网络连接是否正常
- Bot 是否在线 