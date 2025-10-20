import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[DeepSeek Test] 开始测试DeepSeek配置');
    
    // 获取DeepSeek API密钥和基础URL
    const deepseekApiKey = process.env.OPENAI_API_KEY;
    const deepseekBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1';
    console.log('[DeepSeek Test] API密钥状态:', deepseekApiKey ? '已配置' : '未配置');
    console.log('[DeepSeek Test] 基础URL:', deepseekBaseUrl);
    
    if (!deepseekApiKey) {
      return NextResponse.json({ 
        status: 'error',
        message: 'DeepSeek API密钥未配置',
        details: '请在.env.local文件中配置OPENAI_API_KEY环境变量'
      });
    }

    if (deepseekApiKey === 'sk-your-openai-api-key-here') {
      return NextResponse.json({ 
        status: 'error',
        message: 'DeepSeek API密钥未更新',
        details: '请更新.env.local文件中的OPENAI_API_KEY为有效的DeepSeek API密钥'
      });
    }

    // 测试DeepSeek API连接
    const response = await fetch(`${deepseekBaseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        status: 'error',
        message: 'DeepSeek API连接失败',
        details: errorData.error?.message || '未知错误',
        statusCode: response.status
      });
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      status: 'success',
      message: 'DeepSeek API配置正常',
      details: `可用模型数量: ${result.data?.length || 0}`,
      models: result.data?.slice(0, 5).map((model: any) => model.id) || []
    });

  } catch (error) {
    console.error('[DeepSeek Test] 测试错误:', error);
    return NextResponse.json({ 
      status: 'error',
      message: '测试过程中发生错误',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
} 