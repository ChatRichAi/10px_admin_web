import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiRes = await fetch('http://103.106.191.243/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.get('authorization') || '',
    },
    body: req.body,
    duplex: 'half',
  } as RequestInit);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = apiRes.body?.getReader();

  async function pump() {
    if (!reader) {
      writer.close();
      return;
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) await writer.write(value);
    }
    writer.close();
  }
  pump();

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 