// 工作流列表组件 - 显示所有工作流的网格布局

import React from 'react';
import WorkflowCard from '../WorkflowCard';
import { Workflow } from '@/types/workflow';

interface WorkflowListProps {
  workflows: Workflow[];
  isLoading?: boolean;
  onStartWorkflow: (workflowId: string) => void;
  onStopWorkflow: (workflowId: string) => void;
  onConfigureWorkflow: (workflowId: string) => void;
  onViewReport: (workflowId: string) => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  isLoading = false,
  onStartWorkflow,
  onStopWorkflow,
  onConfigureWorkflow,
  onViewReport,
}) => {
  if (workflows.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-theme-on-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-theme-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-theme-primary mb-2">暂无工作流</h3>
        <p className="text-theme-secondary">点击"新建工作流"开始创建您的第一个工作流</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden animate-pulse">
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-theme-on-surface-2 rounded-xl"></div>
                  <div>
                    <div className="h-5 bg-theme-on-surface-2 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-theme-on-surface-2 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-6 bg-theme-on-surface-2 rounded-full w-16"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-theme-on-surface-2 rounded w-full"></div>
                <div className="h-4 bg-theme-on-surface-2 rounded w-3/4"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-theme-on-surface-2 rounded w-16"></div>
                <div className="h-4 bg-theme-on-surface-2 rounded w-20"></div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-theme-on-surface-2 rounded-lg"></div>
                <div className="h-8 bg-theme-on-surface-2 rounded-lg"></div>
                <div className="h-8 bg-theme-on-surface-2 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          isLoading={isLoading}
          onStart={onStartWorkflow}
          onStop={onStopWorkflow}
          onConfigure={onConfigureWorkflow}
          onViewReport={onViewReport}
        />
      ))}
    </div>
  );
};

export default WorkflowList;
