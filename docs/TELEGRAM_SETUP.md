# Telegram Bot 配置指南

## 1. 获取 Bot Token

您已经有了Bot Token：`6985778584:AAFlyLYlgjsy49te6wGgW3IYv-x_kaw3eVU`

## 2. 获取 Chat ID

### 方法1：通过 @userinfobot（推荐）

1. 在Telegram中搜索 `@userinfobot`
2. 点击 "Start" 开始对话
3. 机器人会返回您的Chat ID，格式类似：`123456789`

### 方法2：通过您的Bot获取

1. 向您的Bot发送任意消息
2. 访问：`https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
3. 在返回的JSON中找到 `chat.id` 字段

### 方法3：群组Chat ID

如果要发送到群组：
1. 将Bot添加到群组
2. 在群组中发送消息
3. 通过上述API获取群组的Chat ID

## 3. 配置到系统

在定时器设置中填入：
- **Bot Token**: `6985778584:AAFlyLYlgjsy49te6wGgW3IYv-x_kaw3eVU`
- **Chat ID**: 您获取到的Chat ID（纯数字）

## 4. 测试配置

配置完成后，可以点击"测试推送"按钮验证设置是否正确。

## 注意事项

- Chat ID 通常是纯数字，如：`123456789`
- 群组Chat ID 通常是负数，如：`-1001234567890`
- 确保Bot有发送消息的权限
- 如果发送到群组，确保Bot是群组成员 