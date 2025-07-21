import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { botToken, chatId } = await request.json();

    // 验证参数
    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: '缺少必要参数: botToken, chatId' },
        { status: 400 }
      );
    }

    console.log('[Telegram Verify] 开始验证配置');

    // 步骤1：验证Bot Token
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoResponse.json();

    if (!botInfoResponse.ok) {
      return NextResponse.json({
        error: 'Bot Token验证失败',
        details: botInfo.description || 'Token无效或格式错误',
        step: 'bot_token_verification'
      }, { status: 400 });
    }

    console.log('[Telegram Verify] Bot Token验证成功:', botInfo.result.username);

    // 步骤2：验证Chat ID格式
    if (!/^-?\d+$/.test(chatId)) {
      return NextResponse.json({
        error: 'Chat ID格式错误',
        details: 'Chat ID必须是数字格式',
        step: 'chat_id_format'
      }, { status: 400 });
    }

    // 步骤3：尝试发送测试消息
    const testMessage = `🔍 配置验证测试\n\n时间: ${new Date().toLocaleString('zh-CN')}\nBot: @${botInfo.result.username}\nChat ID: ${chatId}\n\n如果收到此消息，说明配置正确！`;

    const sendResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'HTML'
      })
    });

    const sendResult = await sendResponse.json();

    if (!sendResponse.ok) {
      let errorMessage = '发送消息失败';
      let solution = '';

      if (sendResult.description?.includes('blocked by the user')) {
        errorMessage = 'Bot被用户阻止';
        solution = '请在Telegram中找到Bot并解除阻止，或发送 /start 命令';
      } else if (sendResult.description?.includes('kicked from the group')) {
        errorMessage = 'Bot被从群组中踢出';
        solution = '请重新将Bot添加到群组';
      } else if (sendResult.description?.includes('chat not found')) {
        errorMessage = '聊天未找到';
        solution = '请检查Chat ID是否正确，或先与Bot开始对话';
      } else if (sendResult.description?.includes('bot was stopped')) {
        errorMessage = 'Bot已停止';
        solution = '请重新启动Bot或联系Bot管理员';
      }

      return NextResponse.json({
        error: errorMessage,
        details: sendResult.description,
        solution: solution,
        step: 'message_sending'
      }, { status: 400 });
    }

    console.log('[Telegram Verify] 消息发送成功');

    return NextResponse.json({
      success: true,
      message: '配置验证成功！',
      botInfo: {
        username: botInfo.result.username,
        firstName: botInfo.result.first_name,
        isBot: botInfo.result.is_bot
      },
      chatId: chatId,
      result: sendResult
    });

  } catch (error) {
    console.error('[Telegram Verify] 验证错误:', error);
    return NextResponse.json(
      { 
        error: '验证过程中发生错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 