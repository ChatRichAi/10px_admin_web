import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[OpenAI API] 开始处理请求');
    
    const { data, analysisType, prompt } = await request.json();
    console.log('[OpenAI API] 请求数据:', { analysisType, prompt: prompt?.substring(0, 100) + '...' });
    
    // 获取OpenAI API密钥
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log('[OpenAI API] API密钥状态:', openaiApiKey ? '已配置' : '未配置');
    
    if (!openaiApiKey) {
      console.log('[OpenAI API] 错误: API密钥未配置');
      return NextResponse.json({ 
        error: 'OpenAI API密钥未配置',
        details: '请在.env.local文件中配置OPENAI_API_KEY环境变量'
      }, { status: 500 });
    }

    // 构建系统提示词
    const systemPrompt = `你是一个专业的期权市场分析师，专门分析期权期限结构数据和IV vs RV数据。请根据提供的数据生成结构化的分析报告。

分析要求：
1. 提供准确的数据解读
2. 识别关键市场趋势
3. 评估风险因素
4. 给出专业的投资建议
5. 提供具体的操作建议和策略指导

关键特征分析要求：
- 隐含波动率形态：分析曲线是正向、反向还是水平，判断市场对未来的预期
- 市场情绪：分析曲线斜率变化反映短期或长期风险偏好
- 时间价值衰减：分析不同期限的波动率差异揭示时间价值损耗规律
- 套利机会：对比历史数据，发现高估或低估的合约
- 动态调整信号：分析曲线突变提示市场预期变化，提供及时调整策略的建议

IV vs RV五大关键特征分析要求：
1. 预期偏差分析：
   - 分析IV是否高估或低估实际波动率（RV）
   - 如IV持续高于RV可能反映市场过度恐慌
   - 计算各期限的IV-RV差值及其趋势

2. 期限结构分析：
   - 对比不同期限的IV和RV曲线形态
   - 短期陡升可能提示事件风险
   - 长期平稳则体现均值回归特征

3. 交易信号分析：
   - 识别IV-RV差值极端情况
   - 如IV显著高于RV时，可能适合卖出期权套利
   - 提供具体的交易时机建议

4. 情绪与流动性分析：
   - 分析日内IV和RV的联动模式
   - 如开盘冲高能反映散户情绪或做市商行为
   - 评估市场流动性预期

5. 风险预警分析：
   - 识别持续背离可能预示的黑天鹅风险
   - 提供动态调整对冲策略的建议
   - 评估当前风险等级

请严格按照以下JSON格式返回分析结果，确保所有字段都存在且格式正确，必须包含套利机会分析模块：

{
  "summary": [
    {
      "type": "core",
      "title": "核心统计指标",
      "icon": "stats",
      "items": [
        {
          "title": "平均IV溢价",
          "value": "数值%",
          "valueColor": "颜色类名",
          "subTitle": "说明",
          "subValue": "补充信息"
        }
      ]
    },
    {
      "type": "structure",
      "title": "期限结构特征",
      "icon": "structure",
      "items": [
        {
          "title": "IV-RV结构",
          "value": "分析结果",
          "valueColor": "颜色类名",
          "subTitle": "市场预期",
          "subValue": "详细说明"
        }
      ]
    },
    {
      "type": "sentiment",
      "title": "市场情绪洞察",
      "icon": "sentiment",
      "items": [
        {
          "title": "情绪状态",
          "value": "情绪分析",
          "valueColor": "颜色类名",
          "subTitle": "基于IV溢价",
          "subValue": "详细说明"
        }
      ]
    },
    {
      "type": "arbitrage",
      "title": "套利机会分析",
      "icon": "arbitrage",
      "items": [
        {
          "title": "套利方向",
          "value": "套利建议",
          "valueColor": "颜色类名",
          "subTitle": "基于IV-RV差值",
          "subValue": "详细说明"
        }
      ]
    },
    {
      "type": "risk",
      "title": "风险预警",
      "icon": "risk",
      "items": [
        {
          "title": "背离风险",
          "value": "风险分析",
          "valueColor": "颜色类名",
          "subTitle": "风险等级",
          "subValue": "风险等级"
        }
      ]
    },
    {
      "type": "advice",
      "title": "AI操作建议",
      "icon": "advice",
      "items": [
        {
          "title": "策略建议",
          "value": "具体建议",
          "valueColor": "颜色类名",
          "subTitle": "基于分析",
          "subValue": "详细说明"
        }
      ]
    }
  ]
}

重要提示：
1. 必须严格按照上述JSON格式返回，不要添加任何额外的文本或说明
2. 确保每个item都有title、value、valueColor、subTitle、subValue这5个字段
3. 如果某个字段没有值，请使用空字符串""而不是null或undefined
4. 数值要包含适当的单位（如%）
5. 不要使用中文引号，请使用英文引号
6. 必须包含套利机会分析模块，这是强制要求
7. 对于IV vs RV分析，必须包含预期偏差、期限结构、交易信号、情绪与流动性、风险预警五大关键特征`;

    console.log('[OpenAI API] 开始调用OpenAI API');
    
    // 调用OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });

    console.log('[OpenAI API] OpenAI响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[OpenAI API] OpenAI API错误:', errorData);
      return NextResponse.json({ 
        error: 'OpenAI API调用失败',
        details: errorData.error?.message || '未知错误',
        status: response.status
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('[OpenAI API] OpenAI响应成功');
    
    const aiResponse = result.choices[0]?.message?.content;
    console.log('[OpenAI API] AI响应内容长度:', aiResponse?.length || 0);

    if (!aiResponse) {
      console.log('[OpenAI API] 错误: AI响应为空');
      return NextResponse.json({ error: 'AI响应为空' }, { status: 500 });
    }

    // 尝试解析JSON响应
    try {
      console.log('[OpenAI API] 开始解析JSON响应');
      const parsedResponse = JSON.parse(aiResponse);
      console.log('[OpenAI API] JSON解析成功');
      return NextResponse.json({ summary: parsedResponse.summary });
    } catch (parseError) {
      console.error('[OpenAI API] JSON解析错误:', parseError);
      console.log('[OpenAI API] 原始AI响应:', aiResponse);
      // 如果解析失败，返回错误
      return NextResponse.json({ 
        error: 'AI响应格式错误',
        details: 'AI返回的内容不是有效的JSON格式',
        rawResponse: aiResponse.substring(0, 500) + '...'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[OpenAI API] API处理错误:', error);
    return NextResponse.json({ 
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 