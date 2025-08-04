import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[OpenAI Test] 开始测试OpenAI配置');
    
    // 获取OpenAI API密钥
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log('[OpenAI Test] API密钥状态:', openaiApiKey ? '已配置' : '未配置');
    
    if (!openaiApiKey) {
      return NextResponse.json({ 
        status: 'error',
        message: 'OpenAI API密钥未配置',
        details: '请在.env.local文件中配置OPENAI_API_KEY环境变量'
      });
    }

    if (openaiApiKey === 'sk-your-openai-api-key-here') {
      return NextResponse.json({ 
        status: 'error',
        message: 'OpenAI API密钥未更新',
        details: '请更新.env.local文件中的OPENAI_API_KEY为有效的API密钥'
      });
    }

    // 测试OpenAI API连接
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        status: 'error',
        message: 'OpenAI API连接失败',
        details: errorData.error?.message || '未知错误',
        statusCode: response.status
      });
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      status: 'success',
      message: 'OpenAI API配置正常',
      details: `可用模型数量: ${result.data?.length || 0}`,
      models: result.data?.slice(0, 5).map((model: any) => model.id) || []
    });

  } catch (error) {
    console.error('[OpenAI Test] 测试错误:', error);
    return NextResponse.json({ 
      status: 'error',
      message: '测试过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
} 