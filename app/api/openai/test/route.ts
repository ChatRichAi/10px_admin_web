import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[OpenAI Test] 开始测试API配置');
    
    // 检查环境变量
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log('[OpenAI Test] API密钥状态:', openaiApiKey ? '已配置' : '未配置');
    
    if (!openaiApiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API密钥未配置',
        details: '请在.env.local文件中配置OPENAI_API_KEY环境变量'
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

    console.log('[OpenAI Test] OpenAI API测试响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[OpenAI Test] OpenAI API测试失败:', errorData);
      return NextResponse.json({
        status: 'error',
        message: 'OpenAI API连接失败',
        details: errorData.error?.message || '未知错误',
        httpStatus: response.status
      });
    }

    const result = await response.json();
    console.log('[OpenAI Test] OpenAI API测试成功');

    return NextResponse.json({
      status: 'success',
      message: 'OpenAI API配置正确',
      availableModels: result.data?.length || 0,
      apiStatus: 'connected'
    });

  } catch (error) {
    console.error('[OpenAI Test] 测试过程出错:', error);
    return NextResponse.json({
      status: 'error',
      message: '测试过程出错',
      details: error instanceof Error ? error.message : '未知错误'
    });
  }
} 