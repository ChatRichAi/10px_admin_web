import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 创建超时控制器
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, 120000); // 2分钟超时
    
    const apiRes = await fetch('http://103.106.191.243/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') || '',
      },
      body: req.body,
      duplex: 'half',
      signal: timeoutController.signal,
    } as RequestInit);
    
    clearTimeout(timeoutId); // 清除超时定时器
    
    if (!apiRes.ok) {
      throw new Error(`Dify API 响应错误: ${apiRes.status} ${apiRes.statusText}`);
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = apiRes.body?.getReader();

    const pump = async () => {
      if (!reader) {
        writer.close();
        return;
      }
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) await writer.write(value);
        }
      } catch (error) {
        console.error('Stream pump error:', error);
        // 尝试优雅地关闭流
        try {
          await writer.abort(error);
        } catch (abortError) {
          console.error('Writer abort error:', abortError);
        }
      } finally {
        writer.close();
      }
    };
    pump();

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Dify API route error:', error);
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误', 
        message: error instanceof Error ? error.message : '未知错误' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 