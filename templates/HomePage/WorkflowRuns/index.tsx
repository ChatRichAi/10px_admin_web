// 工作流运行监控组件 - 显示运行中的工作流状态

import React from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { WorkflowRun, Workflow } from '@/types/workflow';

interface WorkflowRunsProps {
  activeRuns: WorkflowRun[];
  workflows: Workflow[];
  onViewLogs?: (runId: string) => void;
}

const WorkflowRuns: React.FC<WorkflowRunsProps> = ({
  activeRuns,
  workflows,
  onViewLogs,
}) => {
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      running: 'px-2 py-1 text-xs rounded-full bg-theme-green-100 text-theme-green-800',
      completed: 'px-2 py-1 text-xs rounded-full bg-theme-brand-100 text-theme-brand-800',
      failed: 'px-2 py-1 text-xs rounded-full bg-theme-red-100 text-theme-red-800'
    };

    const labels = {
      running: '运行中',
      completed: '已完成',
      failed: '失败'
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses] || statusClasses.running}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow?.name || '未知工作流';
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  if (activeRuns.length === 0) {
    return (
      <Card title="运行中的工作流">
        <div className="text-center py-8 text-theme-secondary">
          <div className="w-16 h-16 bg-theme-on-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="pause" className="w-8 h-8 text-theme-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-theme-primary mb-2">当前没有运行中的工作流</h3>
          <p className="text-theme-secondary">启动工作流后，运行状态将在这里显示</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="运行中的工作流">
      <div className="space-y-4">
        {activeRuns.map((run) => (
          <div key={run.id} className="border border-theme-stroke rounded-lg p-4 hover:shadow-md transition-shadow bg-theme-on-surface-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-theme-primary">
                  {getWorkflowName(run.workflowId)}
                </h4>
                {getStatusBadge(run.status)}
              </div>
              <span className="text-sm text-theme-secondary">
                {formatTime(run.startTime)}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-theme-secondary">进度</span>
                <span className="font-medium text-theme-primary">{run.progress}%</span>
              </div>
              <div className="w-full bg-theme-on-surface-2 rounded-full h-2">
                <div 
                  className="bg-theme-brand h-2 rounded-full transition-all duration-300"
                  style={{ width: `${run.progress}%` }}
                />
              </div>
            </div>

            {run.logs && run.logs.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-theme-primary">执行日志</h5>
                  {onViewLogs && (
                    <button
                      onClick={() => onViewLogs(run.id)}
                      className="text-xs text-theme-brand hover:text-theme-brand-600 font-medium"
                    >
                      查看全部
                    </button>
                  )}
                </div>
                <div className="bg-theme-on-surface-2 rounded p-2 max-h-32 overflow-y-auto">
                  {run.logs.slice(-5).map((log, index) => (
                    <div key={index} className="text-xs text-theme-secondary mb-1">
                      {log}
                    </div>
                  ))}
                  {run.logs.length > 5 && (
                    <div className="text-xs text-theme-tertiary text-center mt-2">
                      ... 还有 {run.logs.length - 5} 条日志
                    </div>
                  )}
                </div>
              </div>
            )}

            {run.endTime && (
              <div className="mt-2 text-xs text-theme-tertiary">
                结束时间: {formatTime(run.endTime)}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WorkflowRuns;
