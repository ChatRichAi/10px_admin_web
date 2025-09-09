import { NextRequest, NextResponse } from 'next/server';

// 同步 QuantFlow 工作流到本地数据库
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'sync-from-quantflow') {
      // 从 QuantFlow 同步工作流数据
      const quantflowResponse = await fetch('http://127.0.0.1:8000/api/workflow/all', {
        method: 'GET',
        headers: {
          'uid': 'demo-user',
          'Content-Type': 'application/json',
        },
      });

      if (!quantflowResponse.ok) {
        throw new Error(`QuantFlow API 错误: ${quantflowResponse.status}`);
      }

      const quantflowData = await quantflowResponse.json();
      
      if (quantflowData.code === 0 && quantflowData.data.workflows) {
        // 转换 QuantFlow 工作流格式到本地格式
        const workflows = quantflowData.data.workflows.map((wf: any) => ({
          id: wf.id || `qf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: wf.name || '未命名工作流',
          description: wf.description || '从 QuantFlow 同步的工作流',
          status: wf.status || 'stopped',
          createdAt: wf.created_at || new Date().toISOString(),
          updatedAt: wf.updated_at || new Date().toISOString(),
          config: wf.config || {},
          source: 'quantflow', // 标记来源
        }));

        return NextResponse.json({
          status: 'success',
          message: `成功同步 ${workflows.length} 个工作流`,
          data: {
            workflows,
            total: workflows.length,
            source: 'quantflow',
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json({
          status: 'success',
          message: 'QuantFlow 中没有工作流数据',
          data: {
            workflows: [],
            total: 0,
            source: 'quantflow',
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (action === 'sync-to-quantflow') {
      // 将本地工作流同步到 QuantFlow
      const { workflows } = await request.json();
      
      if (!workflows || !Array.isArray(workflows)) {
        return NextResponse.json({
          status: 'error',
          message: '缺少工作流数据',
        }, { status: 400 });
      }

      const syncResults = [];
      
      for (const workflow of workflows) {
        try {
          // 转换本地工作流格式到 QuantFlow 格式
          const quantflowWorkflow = {
            name: workflow.name,
            description: workflow.description,
            config: workflow.config,
            status: workflow.status || 'stopped',
          };

          const response = await fetch('http://127.0.0.1:8000/api/workflow/query', {
            method: 'POST',
            headers: {
              'uid': 'demo-user',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(quantflowWorkflow),
          });

          if (response.ok) {
            syncResults.push({
              id: workflow.id,
              name: workflow.name,
              status: 'success',
            });
          } else {
            syncResults.push({
              id: workflow.id,
              name: workflow.name,
              status: 'failed',
              error: `HTTP ${response.status}`,
            });
          }
        } catch (error) {
          syncResults.push({
            id: workflow.id,
            name: workflow.name,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        status: 'success',
        message: `同步完成，成功: ${syncResults.filter(r => r.status === 'success').length}，失败: ${syncResults.filter(r => r.status === 'failed').length}`,
        data: {
          results: syncResults,
          total: syncResults.length,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: 'error',
      message: '不支持的操作',
    }, { status: 400 });

  } catch (error) {
    console.error('工作流同步失败:', error);
    return NextResponse.json({
      status: 'error',
      message: '同步失败',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// 获取同步状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'quantflow';

    if (source === 'quantflow') {
      // 检查 QuantFlow 服务状态
      const quantflowResponse = await fetch('http://127.0.0.1:8000/api/workflow/all', {
        method: 'GET',
        headers: {
          'uid': 'demo-user',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (quantflowResponse.ok) {
        const data = await quantflowResponse.json();
        return NextResponse.json({
          status: 'online',
          source: 'quantflow',
          data: {
            workflows: data.data?.workflows || [],
            total: data.data?.total_count || 0,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json({
          status: 'offline',
          source: 'quantflow',
          error: `HTTP ${quantflowResponse.status}`,
          timestamp: new Date().toISOString(),
        }, { status: 503 });
      }
    }

    return NextResponse.json({
      status: 'error',
      message: '不支持的数据源',
    }, { status: 400 });

  } catch (error) {
    console.error('获取同步状态失败:', error);
    return NextResponse.json({
      status: 'offline',
      source: 'quantflow',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}