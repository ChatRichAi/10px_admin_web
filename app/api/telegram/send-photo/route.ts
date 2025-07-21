import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData, chatId, botToken, caption } = await request.json();

    if (!imageData || !chatId || !botToken) {
      return NextResponse.json({ 
        error: '缺少必要参数',
        details: '需要提供imageData、chatId和botToken'
      }, { status: 400 });
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

    console.log('[Telegram Photo API] 发送图片到Chat ID:', chatId);

    // 将base64图片数据转换为Blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    
    // 创建FormData
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', blob, 'atm_analysis.png');
    formData.append('caption', caption || `📊 BTC ATM波动率期限结构分析\n⏰ ${new Date().toLocaleString('zh-CN')}\n🤖 AI自动生成`);

    // 发送到Telegram Bot API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    if (telegramResponse.ok) {
      const result = await telegramResponse.json();
      console.log('[Telegram Photo API] 发送成功:', result);
      return NextResponse.json({ 
        success: true, 
        message: '成功推送到Telegram',
        result 
      });
    } else {
      const errorData = await telegramResponse.text();
      console.error('[Telegram Photo API] 推送失败:', errorData);
      return NextResponse.json({ 
        error: 'Telegram推送失败',
        details: errorData
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Telegram Photo API] 处理错误:', error);
    return NextResponse.json({ 
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 