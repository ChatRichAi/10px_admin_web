import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { conversation_id: string } }) {
  // 你可以将API Key安全存储在环境变量中
  const apiKey = process.env.DIFY_API_KEY || 'app-x3QH5Msqa48sfOUFgiGsAcFJ'; // 如有更安全方式请替换
  const { conversation_id } = params;
  const url = `https://api.dify.ai/v1/chat-messages/${conversation_id}/suggested-questions`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
} 