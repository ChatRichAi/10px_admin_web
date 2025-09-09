import { NextRequest, NextResponse } from 'next/server';

// PandaAI QuantFlow API 基础URL
const QUANTFLOW_API_BASE = process.env.QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

interface WorkflowRequest {
  action: 'list' | 'create' | 'start' | 'stop' | 'status';
  workflowId?: string;
  workflowData?: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const workflowId = searchParams.get('workflowId');

    let response;

    switch (action) {
      case 'list':
        response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/all?limit=100&page=1`, {
          headers: {
            'uid': '0' // 使用用户ID 0，这是您保存工作流时使用的ID
          }
        });
        break;
      case 'status':
        if (!workflowId) {
          return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
        }
        response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/run?workflow_run_id=${workflowId}`, {
          headers: {
            'uid': '0'
          }
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('AI Workflow API error:', error);
    // 如果连接被拒绝，返回503服务不可用状态
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'PandaAI QuantFlow service is not running. Please start the service first.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch workflow data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowRequest = await request.json();
    const { action, workflowId, workflowData } = body;

    let response;

    switch (action) {
      case 'create':
        response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'uid': '0'
          },
          body: JSON.stringify(workflowData),
        });
        break;
      case 'start':
        if (!workflowId) {
          return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
        }
        response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'uid': '0',
            'quantflow-auth': 'demo-auth'
          },
          body: JSON.stringify({ workflow_id: workflowId }),
        });
        break;
      case 'stop':
        if (!workflowId) {
          return NextResponse.json({ error: 'workflowId is required' }, { status: 400 });
        }
        response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/run/terminate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'uid': '0'
          },
          body: JSON.stringify({ workflow_run_id: workflowId }),
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('AI Workflow API error:', error);
    // 如果连接被拒绝，返回503服务不可用状态
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'PandaAI QuantFlow service is not running. Please start the service first.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to execute workflow action' },
      { status: 500 }
    );
  }
}
