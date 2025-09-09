// 工作流服务层 - 统一管理所有工作流相关的API调用

import { Workflow, WorkflowRun, WorkflowRequest, WorkflowResponse } from '@/types/workflow';
import { logService } from '@/lib/logService';

const QUANTFLOW_API_BASE = process.env.NEXT_PUBLIC_QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

class WorkflowService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = QUANTFLOW_API_BASE;
  }

  // 检查服务状态
  async checkServiceStatus(): Promise<boolean> {
    const startTime = Date.now();
    try {
      logService.logSystem('info', 'Checking QuantFlow service status');
      
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        timeout: 5000,
      });
      
      const duration = Date.now() - startTime;
      const isOk = response.ok;
      
      if (isOk) {
        logService.logSystem('success', 'QuantFlow service is running', { 
          status: response.status,
          duration 
        });
      } else {
        logService.logSystem('warn', 'QuantFlow service returned error', { 
          status: response.status,
          duration 
        });
      }
      
      return isOk;
    } catch (error) {
      const duration = Date.now() - startTime;
      logService.logSystem('error', 'QuantFlow service check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration 
      });
      return false;
    }
  }

  // 获取工作流列表
  async getWorkflows(): Promise<Workflow[]> {
    const startTime = Date.now();
    try {
      logService.logAPI('info', 'Fetching workflows list', '/api/workflow/all');
      
      // 直接调用 QuantFlow API，绕过 Next.js API 路由
      const response = await fetch(`${this.baseUrl}/api/workflow/all?limit=100&page=1`, {
        method: 'GET',
        headers: {
          'uid': '0',
          'Content-Type': 'application/json',
        },
        mode: 'cors', // 添加 CORS 模式
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const workflows = this.transformWorkflows(data.workflows || []);
      
      logService.logAPI('success', 'Successfully fetched workflows', '/api/workflow/all', duration, {
        count: workflows.length
      });
      
      return workflows;
    } catch (error) {
      const duration = Date.now() - startTime;
      logService.logAPI('error', 'Failed to fetch workflows', '/api/workflow/all', duration, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // 返回模拟数据以便测试
      const mockWorkflows = this.getMockWorkflows();
      logService.logAPI('info', 'Using mock workflows data', '/api/workflow/all', undefined, {
        count: mockWorkflows.length
      });
      
      return mockWorkflows;
    }
  }

  // 获取运行中的工作流
  async getActiveRuns(): Promise<WorkflowRun[]> {
    const startTime = Date.now();
    try {
      logService.logAPI('info', 'Fetching active workflow runs', '/api/workflow/runs');
      
      // 直接调用 QuantFlow API
      const response = await fetch(`${this.baseUrl}/api/workflow/runs`, {
        method: 'GET',
        headers: {
          'uid': 'demo-user',
          'Content-Type': 'application/json',
        },
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const runs = this.transformWorkflowRuns(data.data?.runs || []);
      
      logService.logAPI('success', 'Successfully fetched active runs', '/api/workflow/runs', duration, {
        count: runs.length
      });
      
      return runs;
    } catch (error) {
      const duration = Date.now() - startTime;
      logService.logAPI('error', 'Failed to fetch active runs', '/api/workflow/runs', duration, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  // 启动工作流
  async startWorkflow(workflowId: string): Promise<WorkflowResponse> {
    const startTime = Date.now();
    try {
      logService.logWorkflow('info', `Starting workflow: ${workflowId}`, workflowId);
      
      const response = await fetch(`${this.baseUrl}/api/workflow/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uid': '0',
          'quantflow-auth': 'demo-auth'
        },
        body: JSON.stringify({
          workflow_id: workflowId,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      logService.logWorkflow('success', `Workflow started successfully: ${workflowId}`, workflowId, data.run_id, {
        runId: data.run_id,
        duration
      });
      
      return { success: true, data };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logService.logWorkflow('error', `Failed to start workflow: ${workflowId}`, workflowId, undefined, {
        error: errorMessage,
        duration
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // 停止工作流
  async stopWorkflow(workflowId: string): Promise<WorkflowResponse> {
    const startTime = Date.now();
    try {
      logService.logWorkflow('info', `Stopping workflow: ${workflowId}`, workflowId);
      
      const response = await fetch(`${this.baseUrl}/api/workflow/run/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uid': '0'
        },
        body: JSON.stringify({
          workflow_run_id: workflowId,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      logService.logWorkflow('success', `Workflow stopped successfully: ${workflowId}`, workflowId, workflowId, {
        duration
      });
      
      return { success: true, data };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logService.logWorkflow('error', `Failed to stop workflow: ${workflowId}`, workflowId, undefined, {
        error: errorMessage,
        duration
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // 创建工作流
  async createWorkflow(workflowData: any): Promise<WorkflowResponse> {
    const startTime = Date.now();
    try {
      logService.logWorkflow('info', `Creating workflow: ${workflowData.name || 'Unnamed'}`, undefined, undefined, {
        workflowName: workflowData.name,
        nodeCount: workflowData.nodes?.length || 0
      });
      
      const response = await fetch(`${this.baseUrl}/api/workflow/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uid': '0'
        },
        body: JSON.stringify(workflowData),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      logService.logWorkflow('success', `Workflow created successfully: ${data.id || 'Unknown'}`, data.id, undefined, {
        workflowId: data.id,
        workflowName: workflowData.name,
        duration
      });
      
      return { success: true, data };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logService.logWorkflow('error', `Failed to create workflow: ${workflowData.name || 'Unnamed'}`, undefined, undefined, {
        error: errorMessage,
        workflowName: workflowData.name,
        duration
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // 获取工作流执行日志
  async getWorkflowLogs(runId: string): Promise<string[]> {
    const startTime = Date.now();
    try {
      logService.logAPI('info', `Fetching workflow logs for run: ${runId}`, '/api/ai-workflow/logs', undefined, {
        runId
      });
      
      const response = await fetch(`/api/ai-workflow/logs?runId=${runId}`);
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const logs = data.logs || [];
      
      logService.logAPI('success', `Successfully fetched workflow logs for run: ${runId}`, '/api/ai-workflow/logs', duration, {
        runId,
        logCount: logs.length
      });
      
      return logs;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logService.logAPI('error', `Failed to fetch workflow logs for run: ${runId}`, '/api/ai-workflow/logs', duration, {
        runId,
        error: errorMessage
      });
      
      return [];
    }
  }

  // 转换工作流数据格式
  private transformWorkflows(workflows: any[]): Workflow[] {
    return workflows.map((wf: any) => ({
      id: wf.id,
      name: wf.name || wf.title,
      description: wf.description || '暂无描述',
      status: wf.status || 'stopped',
      createdAt: wf.created_at || new Date().toISOString().split('T')[0],
      lastRun: wf.last_run,
      nodes: wf.node_count || 0,
      category: wf.category || '默认分类'
    }));
  }

  // 转换工作流运行数据格式
  private transformWorkflowRuns(runs: any[]): WorkflowRun[] {
    return runs.map((run: any) => ({
      id: run.id,
      workflowId: run.workflow_id,
      status: run.status,
      startTime: run.created_at || new Date().toISOString(),
      endTime: run.status === 'completed' || run.status === 'failed' ? new Date().toISOString() : null,
      progress: run.progress || 0,
      logs: run.logs || [],
      runningNodeIds: run.running_node_ids || [],
      successNodeIds: run.success_node_ids || [],
      failedNodeIds: run.failed_node_ids || [],
      passedLinkIds: run.passed_link_ids || []
    }));
  }

  // 获取模拟工作流数据
  private getMockWorkflows(): Workflow[] {
    const now = new Date();
    const formatTime = (date: Date) => {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return [
      {
        id: 'demo-1',
        name: '股票因子挖掘工作流',
        description: '基于机器学习算法挖掘有效股票因子',
        status: 'stopped',
        createdAt: '2025-09-03',
        lastRun: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        nodes: 8,
        category: '因子分析',
        totalReturn: 15.8,
        maxDrawdown: -3.2,
        sharpeRatio: 1.45,
        winRate: 68.5,
        totalTrades: 156
      },
      {
        id: 'demo-2',
        name: '期权波动率预测',
        description: '使用深度学习预测期权波动率变化',
        status: 'completed',
        createdAt: '2025-09-03',
        lastRun: formatTime(new Date(now.getTime() - 30 * 60 * 1000)),
        nodes: 12,
        category: '期权分析',
        totalReturn: 22.3,
        maxDrawdown: -5.1,
        sharpeRatio: 1.82,
        winRate: 72.1,
        totalTrades: 89
      },
      {
        id: 'demo-3',
        name: '多资产组合优化',
        description: '基于风险平价模型优化投资组合',
        status: 'stopped',
        createdAt: '2025-09-03',
        lastRun: formatTime(new Date(now.getTime() - 4 * 60 * 60 * 1000)),
        nodes: 6,
        category: '组合管理',
        totalReturn: 8.7,
        maxDrawdown: -2.1,
        sharpeRatio: 1.12,
        winRate: 61.3,
        totalTrades: 203
      }
    ];
  }

  // 同步工作流数据
  async syncWorkflows(action: 'from-quantflow' | 'to-quantflow', workflows?: Workflow[]): Promise<WorkflowResponse> {
    const startTime = Date.now();
    try {
      logService.logSystem('info', `Starting workflow sync: ${action}`);

      const response = await fetch('/api/workflow-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: `sync-${action}`,
          workflows: workflows || [],
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        logService.logSystem('success', `Workflow sync completed: ${action}`, {
          total: data.data?.total || 0,
          duration
        });
        
        return {
          success: true,
          data: data.data,
          message: data.message || 'Sync completed successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        logService.logSystem('error', `Workflow sync failed: ${action}`, {
          status: response.status,
          error: errorData.message || 'Unknown error',
          duration
        });
        
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
          message: 'Sync failed'
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logService.logSystem('error', `Exception during workflow sync: ${action}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Exception occurred during sync'
      };
    }
  }

  // 获取同步状态
  async getSyncStatus(source: 'quantflow' = 'quantflow'): Promise<WorkflowResponse> {
    const startTime = Date.now();
    try {
      logService.logSystem('info', `Getting sync status for: ${source}`);

      const response = await fetch(`/api/workflow-sync?source=${source}`, {
        method: 'GET',
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        logService.logSystem('success', `Sync status retrieved: ${source}`, {
          status: data.status,
          total: data.data?.total || 0,
          duration
        });
        
        return {
          success: true,
          data: data,
          message: 'Sync status retrieved successfully'
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        logService.logSystem('error', `Failed to get sync status: ${source}`, {
          status: response.status,
          error: errorData.message || 'Unknown error',
          duration
        });
        
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}`,
          message: 'Failed to get sync status'
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logService.logSystem('error', `Exception getting sync status: ${source}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Exception occurred while getting sync status'
      };
    }
  }
}

// 导出单例实例
export const workflowService = new WorkflowService();
export default workflowService;
