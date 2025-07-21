// Dify API 封装
export async function fetchDifyMessage(message: string, apiKey: string, onMessage?: (msg: string) => void, signal?: AbortSignal) {
  let response: Response;
  let conversationId: string | undefined;
  // 自动拼接推荐问题指令
  const promptWithSuggest = `${message}\n\n请在回答后额外给出3个用户可能会继续追问的相关问题，格式如下：\n【推荐问题】\n1. xxx\n2. xxx\n3. xxx`;
  const requestStartTime = new Date().toISOString();
  console.log(`[${requestStartTime}] [fetchDifyMessage] 请求开始`, { message, apiKey, signal });
  
  // 创建超时控制器
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, 60000); // 60秒超时
  
  try {
    // 合并用户信号和超时信号
    const combinedSignal = signal ? 
      AbortSignal.any([signal, timeoutController.signal]) : 
      timeoutController.signal;
    
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
      signal: combinedSignal,
    });
    
    clearTimeout(timeoutId); // 清除超时定时器
  } catch (e: any) {
    clearTimeout(timeoutId); // 清除超时定时器
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] [fetchDifyMessage] fetch异常`, {
      error: e,
      errorType: e?.name,
      errorMsg: e?.message,
      conversationId,
      message,
      apiKey,
      signal,
    });
    if (e?.name === 'AbortError') {
      if (timeoutController.signal.aborted) {
        throw new Error('请求超时，请稍后重试');
      }
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
    const errorTime = new Date().toISOString();
    console.error(`[${errorTime}] [fetchDifyMessage] 响应非OK`, {
      status: response.status,
      statusText: response.statusText,
      msg,
      conversationId,
      message,
      apiKey,
      signal,
    });
    throw new Error(msg);
  }

  // 处理流式返回
  const reader = response.body?.getReader();
  let result = '';
  let suggestions: string[] = [];
  let lastChunkTime = Date.now();
  
  if (reader) {
    const decoder = new TextDecoder('utf-8');
    while (true) {
      let readResult;
      try {
        // 检查是否超时（30秒内没有新数据）
        if (Date.now() - lastChunkTime > 30000) {
          throw new Error('流式响应超时，请重试');
        }
        
        readResult = await reader.read();
        lastChunkTime = Date.now(); // 更新最后接收时间
      } catch (e: any) {
        const errorTime = new Date().toISOString();
        console.error(`[${errorTime}] [fetchDifyMessage] 读取流异常`, {
          error: e,
          errorType: e?.name,
          errorMsg: e?.message,
          conversationId,
          message,
          apiKey,
          signal,
        });
        if (e?.name === 'AbortError') {
          throw new Error('请求已被中断');
        }
        throw new Error('流式读取异常');
      }
      const { done, value } = readResult;
      if (done) {
        console.log(`[${new Date().toISOString()}] [fetchDifyMessage] 流式读取结束`, { conversationId });
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      console.log(`[${new Date().toISOString()}] [fetchDifyMessage] 收到新chunk:`, chunk);
      // Dify SSE 每行以 data: 开头
      chunk.split('\n').forEach(line => {
        if (line.startsWith('data:')) {
          const dataStr = line.replace('data:', '').trim();
          if (dataStr && dataStr !== '[DONE]') {
            try {
              const dataObj = JSON.parse(dataStr);
              console.log(`[${new Date().toISOString()}] [fetchDifyMessage] Dify返回内容:`, dataObj); // 日志追踪
              if (dataObj.answer) {
                result += dataObj.answer;
                if (onMessage) {
                  console.log(`[${new Date().toISOString()}] [fetchDifyMessage] onMessage被调用，当前result:`, result);
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
            } catch (e) {
              console.error(`[${new Date().toISOString()}] [fetchDifyMessage] chunk解析异常`, e);
            }
          }
        }
      });
    }
  }

  // === 新逻辑：递归剥离所有推理内容 ===
  // 先移除推荐问题文本，避免被误判为推理内容
  let resultWithoutSuggest = result;
  const suggestMatch = result.match(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/);
  if (suggestMatch) {
    const suggestBlock = suggestMatch[1];
    suggestions = suggestBlock.split(/\n|\r/)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line && !/^【/.test(line));
    // 移除推荐问题文本
    resultWithoutSuggest = result.replace(/【推荐问题】([\s\S]*?)(?:$|\n{2,}|【|\[)/, '').trim();
  }
  const { thinking, final } = splitThinkingAndFinal(resultWithoutSuggest);
  console.log(`[${new Date().toISOString()}] [fetchDifyMessage] 返回最终结果`, { thinking, final, suggestions, conversationId });
  return { thinking, final, suggestions };
}

// === 递归剥离推理内容的工具函数 ===
function splitThinkingAndFinal(text: string) {
    // 匹配所有 <details>...</details>
    const detailsRegex = /<details[\s\S]*?<summary>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi;
    let thinkingArr: string[] = [];
    let match;
    let textWithoutDetails = text;
    while ((match = detailsRegex.exec(text)) !== null) {
        thinkingArr.push(match[1].trim());
    }
    // 移除所有 <details>...</details>
    textWithoutDetails = textWithoutDetails.replace(detailsRegex, '').trim();
    // 匹配所有 [THINK]...[/THINK]
    const thinkRegex = /\[THINK\]([\s\S]*?)\[\/THINK\]/gi;
    let thinkMatch;
    while ((thinkMatch = thinkRegex.exec(textWithoutDetails)) !== null) {
        thinkingArr.push(thinkMatch[1].trim());
    }
    // 移除所有 [THINK]...[/THINK]
    textWithoutDetails = textWithoutDetails.replace(thinkRegex, '').trim();
    // 递归剥离所有推理/分析/思考/流程/步骤等前缀段落，包括"思考步骤"
    // 支持多行、冒号、点号、换行等，且允许"思考步骤"后跟多行内容
    const flowPrefixRegex = /^(\s*(思考步骤|分析流程|推理过程|思考过程|分析步骤|推理步骤|分析思路|推理思路|分析|推理|思考|流程|步骤|首先|需要先|请先|优先|失败则|如需|如果.*?，|需先|务必|务必先|务必首先|务必需要|务必请先|务必优先|务必失败则|务必如需|务必如果.*?，)[：:.。\n\r\-\s]*([\s\S]*?))(?=\n{2,}|$)/i;
    let found = true;
    while (found) {
        const flowMatch = textWithoutDetails.match(flowPrefixRegex);
        if (flowMatch) {
            // flowMatch[0]为整个段落，flowMatch[1]为前缀+内容
            thinkingArr.push(flowMatch[0].trim());
            textWithoutDetails = textWithoutDetails.replace(flowPrefixRegex, '').trim();
        } else {
            found = false;
        }
    }
    return {
        thinking: thinkingArr.join('\n\n'),
        final: textWithoutDetails
    };
} 