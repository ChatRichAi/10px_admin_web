import { NextRequest, NextResponse } from 'next/server';

// PandaAI QuantFlow API 基础URL
const QUANTFLOW_API_BASE = process.env.QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

// 临时绕过认证的中间件
function bypassAuth() {
  // 在开发环境中，我们可以临时绕过认证
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // 临时绕过认证检查
    console.log('AI Workflow Runs API called');
    
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const runId = searchParams.get('runId');

    // 如果没有runId，返回空数组（表示没有正在运行的流程）
    if (!runId) {
      return NextResponse.json({
        runs: [],
        total: 0
      });
    }

    let url = `${QUANTFLOW_API_BASE}/api/workflow/run?workflow_run_id=${runId}`;

    const response = await fetch(url, {
      headers: {
        'uid': 'demo-user'
      }
    });

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Workflow runs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow runs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, parameters } = body;

    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
    }

    const response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uid': '0',
        'quantflow-auth': 'demo-auth'
      },
      body: JSON.stringify({ workflow_id: workflowId }),
    });

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Workflow run API error:', error);
    return NextResponse.json(
      { error: 'Failed to start workflow run' },
      { status: 500 }
    );
  }
}
