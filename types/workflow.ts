// 工作流相关类型定义

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error' | 'completed';
  createdAt: string;
  lastRun?: string;
  nodes: number;
  category: string;
  // 收益相关字段
  totalReturn?: number; // 总收益率
  maxDrawdown?: number; // 最大回撤
  sharpeRatio?: number; // 夏普比率
  winRate?: number; // 胜率
  totalTrades?: number; // 总交易次数
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  progress: number;
  logs: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
}

export interface WorkflowRequest {
  action: 'create' | 'start' | 'stop' | 'delete';
  workflowId?: string;
  workflowData?: any;
}

export interface WorkflowResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface WorkflowServiceStatus {
  status: 'connected' | 'disconnected' | 'unknown';
  lastCheck: number;
}
