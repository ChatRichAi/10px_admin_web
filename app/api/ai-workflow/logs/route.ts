import { NextRequest, NextResponse } from 'next/server';
  import { logService, LogFilter } from '@/lib/logService';

// PandaAI QuantFlow API 基础URL
const QUANTFLOW_API_BASE = process.env.QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');
    const workflowId = searchParams.get('workflowId');
    const limit = searchParams.get('limit') || '100';
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const offset = searchParams.get('offset') || '0';

    // 记录API调用日志
    logService.logAPI('info', 'Fetching workflow logs', '/api/ai-workflow/logs', undefined, {
      runId,
      workflowId,
      limit,
      level,
      category,
      search
    });

    // 构建过滤器
    const filter: LogFilter = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (runId) filter.runId = runId;
    if (workflowId) filter.workflowId = workflowId;
    if (level) filter.level = level.split(',');
    if (category) filter.category = category.split(',');
    if (search) filter.search = search;
    if (startTime) filter.startTime = startTime;
    if (endTime) filter.endTime = endTime;

    // 获取本地日志
    const localLogs = logService.getLogs(filter);

    // 如果指定了runId或workflowId，尝试从QuantFlow获取日志
    let quantflowLogs: any[] = [];
    if (runId || workflowId) {
      try {
        let url = `${QUANTFLOW_API_BASE}/api/workflow/run/log`;
        const params = new URLSearchParams();
        
        if (runId) params.append('workflow_run_id', runId);
        if (workflowId) params.append('workflow_id', workflowId);
        params.append('limit', limit);

        url += `?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            'uid': 'demo-user'
          }
        });

        if (response.ok) {
          const data = await response.json();
          quantflowLogs = data.logs || [];
          
          // 记录成功获取QuantFlow日志
          logService.logAPI('success', 'Successfully fetched QuantFlow logs', '/api/ai-workflow/logs', undefined, {
            runId,
            workflowId,
            logCount: quantflowLogs.length
          });
        } else {
          logService.logAPI('warn', 'Failed to fetch QuantFlow logs', '/api/ai-workflow/logs', undefined, {
            runId,
            workflowId,
            status: response.status
          });
        }
      } catch (error) {
        logService.logAPI('error', 'Error fetching QuantFlow logs', '/api/ai-workflow/logs', undefined, {
          runId,
          workflowId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 合并本地日志和QuantFlow日志
    const allLogs = [...localLogs, ...quantflowLogs.map((log: any) => ({
      id: `qf-${log.id || Date.now()}`,
      timestamp: log.timestamp || new Date().toISOString(),
      level: log.level || 'info',
      category: 'workflow' as const,
      message: log.message || log.content || 'No message',
      details: log.details || log.data,
      workflowId: log.workflow_id || workflowId,
      runId: log.run_id || runId,
      tags: ['quantflow']
    }))];

    // 按时间排序
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      logs: allLogs,
      total: allLogs.length,
      localLogs: localLogs.length,
      quantflowLogs: quantflowLogs.length
    });

  } catch (error) {
    logService.logAPI('error', 'Workflow logs API error', '/api/ai-workflow/logs', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to fetch workflow logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, logData, filter } = body;

    logService.logAPI('info', `Log API POST action: ${action}`, '/api/ai-workflow/logs', undefined, { action });

    switch (action) {
      case 'clear':
        logService.clearLogs();
        return NextResponse.json({ success: true, message: 'Logs cleared successfully' });

      case 'export':
        const format = logData?.format || 'json';
        const exportData = logService.exportLogs(format);
        return NextResponse.json({ 
          success: true, 
          data: exportData,
          format 
        });

      case 'stats':
        const stats = logService.getLogStats();
        return NextResponse.json({ 
          success: true, 
          stats 
        });

      case 'search':
        const searchFilter: LogFilter = filter || {};
        const searchResults = logService.getLogs(searchFilter);
        return NextResponse.json({ 
          success: true, 
          logs: searchResults,
          total: searchResults.length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    logService.logAPI('error', 'Log API POST error', '/api/ai-workflow/logs', undefined, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to process log request' },
      { status: 500 }
    );
  }
}
