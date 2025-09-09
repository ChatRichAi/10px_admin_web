import { NextRequest, NextResponse } from 'next/server';

// PandaAI QuantFlow API 基础URL
const QUANTFLOW_API_BASE = process.env.QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试工作流API被调用');
    
    // 直接调用QuantFlow API
    const response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/all?limit=100&page=1`, {
      headers: {
        'uid': 'demo-user'
      }
    });

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 QuantFlow返回数据:', data);
    
    return NextResponse.json({
      success: true,
      message: '测试成功',
      quantflowData: data
    });

  } catch (error) {
    console.error('❌ 测试API错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 测试创建工作流API被调用');
    
    const body = await request.json();
    console.log('📝 接收到的数据:', body);
    
    // 创建测试工作流
    const testWorkflow = {
      name: '自动化测试工作流_' + Date.now(),
      description: '这是一个自动化测试创建的工作流',
      nodes: [
        {
          uuid: 'test-node-1',
          name: '数据输入',
          title: '数据输入节点',
          type: 'data_input',
          litegraph_id: 1,
          positionX: 100,
          positionY: 100,
          width: 200,
          height: 100,
          static_input_data: {}
        }
      ],
      links: [],
      litegraph: {}
    };

    const response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uid': 'demo-user'
      },
      body: JSON.stringify(testWorkflow),
    });

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 工作流创建成功:', data);
    
    return NextResponse.json({
      success: true,
      message: '工作流创建成功',
      workflowId: data.data?.workflow_id
    });

  } catch (error) {
    console.error('❌ 创建工作流错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}




