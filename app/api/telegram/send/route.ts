import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatId, botToken, message } = await request.json();

    // 验证参数
    if (!chatId || !botToken || !message) {
      return NextResponse.json(
        { error: '缺少必要参数: chatId, botToken, message' },
        { status: 400 }
      );
    }

    // 验证Chat ID格式
    if (!/^-?\d+$/.test(chatId)) {
      return NextResponse.json(
        { error: 'Chat ID必须是数字格式' },
        { status: 400 }
      );
    }

    // 验证Bot Token格式
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)) {
      return NextResponse.json(
        { error: 'Bot Token格式不正确' },
        { status: 400 }
      );
    }

    console.log('[Telegram API] 发送消息到Chat ID:', chatId);

    // 调用Telegram Bot API发送消息
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('[Telegram API] 发送失败:', telegramResult);
      return NextResponse.json(
        { error: `Telegram发送失败: ${telegramResult.description || '未知错误'}` },
        { status: 400 }
      );
    }

    console.log('[Telegram API] 发送成功:', telegramResult);
    return NextResponse.json({ 
      success: true, 
      message: '消息发送成功',
      result: telegramResult 
    });

  } catch (error) {
    console.error('[Telegram API] 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 