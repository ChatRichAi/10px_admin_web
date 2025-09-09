// 工作流卡片组件 - 显示单个工作流的详细信息

import React from 'react';
import Icon from '@/components/Icon';
import { Workflow } from '@/types/workflow';

interface WorkflowCardProps {
  workflow: Workflow;
  isLoading?: boolean;
  onStart: (workflowId: string) => void;
  onStop: (workflowId: string) => void;
  onConfigure: (workflowId: string) => void;
  onViewReport: (workflowId: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  isLoading = false,
  onStart,
  onStop,
  onConfigure,
  onViewReport,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Icon name="plus" className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <Icon name="check" className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <Icon name="close" className="w-4 h-4 text-red-500" />;
      case 'stopped':
        return <Icon name="pause" className="w-4 h-4 text-yellow-500" />;
      default:
        return <Icon name="info" className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      running: 'px-2 py-1 text-xs rounded-full bg-theme-green-100 text-theme-green-800',
      completed: 'px-2 py-1 text-xs rounded-full bg-theme-brand-100 text-theme-brand-800',
      error: 'px-2 py-1 text-xs rounded-full bg-theme-red-100 text-theme-red-800',
      stopped: 'px-2 py-1 text-xs rounded-full bg-theme-yellow-100 text-theme-yellow-800'
    };

    const labels = {
      running: '运行中',
      completed: '已完成',
      error: '错误',
      stopped: '已停止'
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses] || statusClasses.stopped}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleStart = () => {
    onStart(workflow.id);
  };

  const handleStop = () => {
    onStop(workflow.id);
  };

  const handleConfigure = () => {
    onConfigure(workflow.id);
  };

  const handleViewReport = () => {
    onViewReport(workflow.id);
  };

  return (
    <div className="bg-theme-on-surface-1 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-theme-stroke overflow-hidden group">
      {/* 卡片头部 */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              {getStatusIcon(workflow.status)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-theme-primary group-hover:text-blue-600 transition-colors">
                {workflow.name}
              </h3>
              <p className="text-sm text-theme-secondary">{workflow.category}</p>
            </div>
          </div>
          {getStatusBadge(workflow.status)}
        </div>
        
        <p className="text-theme-secondary text-sm leading-relaxed mb-4">
          {workflow.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-theme-tertiary mb-4">
          <div className="flex items-center gap-1">
            <Icon name="settings" className="w-3 h-3 text-theme-tertiary" />
            <span>{workflow.nodes} 节点</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3 text-theme-tertiary" />
            <span>{workflow.createdAt}</span>
          </div>
        </div>

        {workflow.lastRun && (
          <div className="text-xs text-theme-tertiary mb-4 flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3 text-theme-tertiary" />
            <span>最后运行: {workflow.lastRun}</span>
          </div>
        )}
      </div>

      {/* 收益指标 */}
      {workflow.totalReturn !== undefined && (
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-theme-on-surface-2 to-theme-brand-100/20 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-semibold text-theme-primary mb-3">收益表现</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className={`text-lg font-bold ${workflow.totalReturn >= 0 ? 'text-theme-green' : 'text-theme-red'}`}>
                  {workflow.totalReturn > 0 ? '+' : ''}{workflow.totalReturn}%
                </div>
                <div className="text-xs text-theme-secondary">总收益率</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-theme-red">
                  {workflow.maxDrawdown}%
                </div>
                <div className="text-xs text-theme-secondary">最大回撤</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-theme-brand">
                  {workflow.sharpeRatio}
                </div>
                <div className="text-xs text-theme-secondary">夏普比率</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-theme-green">
                  {workflow.winRate}%
                </div>
                <div className="text-xs text-theme-secondary">胜率</div>
              </div>
            </div>
            <div className="text-center pt-2 border-t border-theme-stroke">
              <div className="text-sm font-medium text-theme-primary">{workflow.totalTrades} 笔交易</div>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-2">
          {workflow.status === 'running' ? (
            <button 
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={handleStop}
              disabled={isLoading}
            >
              <Icon name="pause" className="w-3 h-3 text-white" />
              停止
            </button>
          ) : (
            <button 
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              onClick={handleStart}
              disabled={isLoading}
            >
              <Icon name="plus" className="w-3 h-3 text-white" />
              启动
            </button>
          )}
          <button 
            className="px-3 py-2 bg-theme-on-surface-2 hover:bg-theme-on-surface-3 text-theme-primary text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
            onClick={handleConfigure}
          >
            <Icon name="settings" className="w-3 h-3 text-theme-primary" />
            配置
          </button>
          <button 
            className="px-3 py-2 bg-theme-brand-100 hover:bg-theme-brand-200 text-theme-brand-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
            onClick={handleViewReport}
          >
            <Icon name="star" className="w-3 h-3 text-theme-brand-700" />
            报告
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
