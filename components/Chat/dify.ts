// Dify API 封装
export async function fetchDifyMessage(message: string, apiKey: string, onMessage?: (msg: string) => void, signal?: AbortSignal) {
  let response: Response;
  let conversationId: string | undefined;
  // 自动拼接推荐问题指令
  const promptWithSuggest = `${message}\n\n请在回答后额外给出3个用户可能会继续追问的相关问题，格式如下：\n【推荐问题】\n1. xxx\n2. xxx\n3. xxx`;
  try {
    response = await fetch(`/api/dify-chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        user: 'test-user',
        inputs: { dummy: '1' },
        query: promptWithSuggest,
        response_mode: 'streaming',
      }),
      signal,
    });
  } catch (e) {
    if ((e as any).name === 'AbortError') {
      throw new Error('请求已被中断');
    }
    throw new Error('网络异常，请检查网络连接。');
  }
  if (!response.ok) {
    let msg = 'Dify API 请求失败';
    try {
      const err = await response.json();
      msg += `：${err.message || JSON.stringify(err)}`;
    } catch {}
    throw new Error(msg);
  }

  // 处理流式返回
  const reader = response.body?.getReader();
  let result = '';
  let suggestions: string[] = [];
  if (reader) {
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      console.log('收到新chunk:', chunk);
      // Dify SSE 每行以 data: 开头
      chunk.split('\n').forEach(line => {
        if (line.startsWith('data:')) {
          const dataStr = line.replace('data:', '').trim();
          if (dataStr && dataStr !== '[DONE]') {
            try {
              const dataObj = JSON.parse(dataStr);
              console.log('Dify返回内容:', dataObj); // 日志追踪
              if (dataObj.answer) {
                result += dataObj.answer;
                if (onMessage) {
                  console.log('onMessage被调用，当前result:', result);
                  onMessage(result);
                }
              }
              // 记录conversation_id
              if (dataObj.conversation_id) {
                conversationId = dataObj.conversation_id;
              }
              // 新增：解析推荐问题
              if (Array.isArray(dataObj.suggested_questions)) {
                suggestions = dataObj.suggested_questions;
              }
            } catch (e) {}
          }
        }
      });
    }
  }

  // 拆分思考内容和最终回复
  let thinking = '';
  let final = result;
  const detailsMatch = result.match(/<details[\s\S]*?<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/i);
  if (detailsMatch) {
    thinking = detailsMatch[2]?.trim() || '';
    final = result.replace(detailsMatch[0], '').trim();
  }

  // 新增：正则提取推荐问题
  const suggestMatch = final.match(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/);
  if (suggestMatch) {
    const suggestBlock = suggestMatch[1];
    suggestions = suggestBlock.split(/\n|\r/)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line && !/^【/.test(line));
    // 移除推荐问题文本
    final = final.replace(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/, '').trim();
  }

  return { thinking, final, suggestions };
} 