// 工作流数据管理Hook - 统一管理工作流相关的状态和操作

import { useState, useEffect, useCallback } from 'react';
import { Workflow, WorkflowRun, WorkflowServiceStatus } from '@/types/workflow';
import { workflowService } from '@/lib/workflowService';

interface UseWorkflowDataReturn {
  // 数据状态
  workflows: Workflow[];
  activeRuns: WorkflowRun[];
  serviceStatus: WorkflowServiceStatus['status'];
  
  // 加载状态
  isLoading: boolean;
  isStarting: boolean;
  isStopping: boolean;
  
  // 操作方法
  refreshWorkflows: () => Promise<void>;
  refreshActiveRuns: () => Promise<void>;
  startWorkflow: (workflowId: string) => Promise<boolean>;
  stopWorkflow: (workflowId: string) => Promise<boolean>;
  createWorkflow: (workflowData: any) => Promise<boolean>;
  getWorkflowLogs: (runId: string) => Promise<string[]>;
  
  // 状态更新
  updateWorkflowStatus: (workflowId: string, status: Workflow['status']) => void;
}

export const useWorkflowData = (): UseWorkflowDataReturn => {
  // 数据状态
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeRuns, setActiveRuns] = useState<WorkflowRun[]>([]);
  const [serviceStatus, setServiceStatus] = useState<WorkflowServiceStatus['status']>('unknown');
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // 检查服务状态
  const checkServiceStatus = useCallback(async () => {
    try {
      const isConnected = await workflowService.checkServiceStatus();
      setServiceStatus(isConnected ? 'connected' : 'disconnected');
      return isConnected;
    } catch (error) {
      console.error('Service status check failed:', error);
      setServiceStatus('disconnected');
      return false;
    }
  }, []);

  // 获取工作流列表
  const refreshWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const workflowsData = await workflowService.getWorkflows();
      setWorkflows(workflowsData);
      
      // 检查服务状态
      await checkServiceStatus();
    } catch (error) {
      console.error('Failed to refresh workflows:', error);
      setServiceStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, [checkServiceStatus]);

  // 获取运行中的工作流
  const refreshActiveRuns = useCallback(async () => {
    try {
      const runsData = await workflowService.getActiveRuns();
      setActiveRuns(runsData);
    } catch (error) {
      console.error('Failed to refresh active runs:', error);
    }
  }, []);

  // 启动工作流
  const startWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    setIsStarting(true);
    try {
      const result = await workflowService.startWorkflow(workflowId);
      
      if (result.success) {
        // 更新本地状态
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, status: 'running' as const } : w
        ));
        
        // 刷新运行状态
        await refreshActiveRuns();
        return true;
      } else {
        console.error('Failed to start workflow:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      return false;
    } finally {
      setIsStarting(false);
    }
  }, [refreshActiveRuns]);

  // 停止工作流
  const stopWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    setIsStopping(true);
    try {
      const result = await workflowService.stopWorkflow(workflowId);
      
      if (result.success) {
        // 更新本地状态
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, status: 'stopped' as const } : w
        ));
        
        // 刷新运行状态
        await refreshActiveRuns();
        return true;
      } else {
        console.error('Failed to stop workflow:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error stopping workflow:', error);
      return false;
    } finally {
      setIsStopping(false);
    }
  }, [refreshActiveRuns]);

  // 创建工作流
  const createWorkflow = useCallback(async (workflowData: any): Promise<boolean> => {
    try {
      const result = await workflowService.createWorkflow(workflowData);
      
      if (result.success) {
        // 刷新工作流列表
        await refreshWorkflows();
        return true;
      } else {
        console.error('Failed to create workflow:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      return false;
    }
  }, [refreshWorkflows]);

  // 获取工作流日志
  const getWorkflowLogs = useCallback(async (runId: string): Promise<string[]> => {
    try {
      return await workflowService.getWorkflowLogs(runId);
    } catch (error) {
      console.error('Error fetching workflow logs:', error);
      return [];
    }
  }, []);

  // 更新工作流状态（本地状态更新）
  const updateWorkflowStatus = useCallback((workflowId: string, status: Workflow['status']) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status } : w
    ));
  }, []);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      await refreshWorkflows();
      await refreshActiveRuns();
    };

    initializeData();
  }, [refreshWorkflows, refreshActiveRuns]);

  // 设置定时刷新运行状态
  useEffect(() => {
    const interval = setInterval(() => {
      refreshActiveRuns();
    }, 5000); // 每5秒刷新一次

    return () => clearInterval(interval);
  }, [refreshActiveRuns]);

  return {
    // 数据状态
    workflows,
    activeRuns,
    serviceStatus,
    
    // 加载状态
    isLoading,
    isStarting,
    isStopping,
    
    // 操作方法
    refreshWorkflows,
    refreshActiveRuns,
    startWorkflow,
    stopWorkflow,
    createWorkflow,
    getWorkflowLogs,
    
    // 状态更新
    updateWorkflowStatus,
  };
};

export default useWorkflowData;
