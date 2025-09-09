// 工作流分析报告组件 - 显示工作流的统计信息和趋势

import React from 'react';
import Card from '@/components/Card';
import { Workflow } from '@/types/workflow';

interface WorkflowAnalyticsProps {
  workflows: Workflow[];
}

const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({ workflows }) => {
  // 计算统计数据
  const totalWorkflows = workflows.length;
  const runningWorkflows = workflows.filter(w => w.status === 'running').length;
  const completedWorkflows = workflows.filter(w => w.status === 'completed').length;
  const errorWorkflows = workflows.filter(w => w.status === 'error').length;
  
  // 计算平均收益率
  const workflowsWithReturns = workflows.filter(w => w.totalReturn !== undefined);
  const averageReturn = workflowsWithReturns.length > 0 
    ? workflowsWithReturns.reduce((sum, w) => sum + (w.totalReturn || 0), 0) / workflowsWithReturns.length
    : 0;

  // 计算成功率
  const successRate = totalWorkflows > 0 ? ((completedWorkflows / totalWorkflows) * 100).toFixed(1) : '0.0';

  // 计算平均执行时间（模拟数据）
  const averageExecutionTime = '12.5m';

  const stats = [
    {
      title: '总工作流数',
      value: totalWorkflows,
      change: '+2 较上月',
      icon: 'settings',
      color: 'text-blue-600'
    },
    {
      title: '运行中',
      value: runningWorkflows,
      change: '活跃工作流',
      icon: 'play',
      color: 'text-green-600'
    },
    {
      title: '成功率',
      value: `${successRate}%`,
      change: '+1.2% 较上月',
      icon: 'check',
      color: 'text-purple-600'
    },
    {
      title: '平均执行时间',
      value: averageExecutionTime,
      change: '-2.1m 较上月',
      icon: 'clock',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} title={stat.title}>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-theme-secondary">
                {stat.change}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* 收益分析 */}
      {workflowsWithReturns.length > 0 && (
        <Card title="收益分析">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-theme-green-100 rounded-lg">
                <div className="text-2xl font-bold text-theme-green">
                  {averageReturn > 0 ? '+' : ''}{averageReturn.toFixed(1)}%
                </div>
                <div className="text-sm text-theme-green-700">平均收益率</div>
              </div>
              <div className="text-center p-4 bg-theme-brand-100 rounded-lg">
                <div className="text-2xl font-bold text-theme-brand">
                  {workflowsWithReturns.length}
                </div>
                <div className="text-sm text-theme-brand-700">有收益数据的工作流</div>
              </div>
              <div className="text-center p-4 bg-theme-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-theme-purple">
                  {workflowsWithReturns.filter(w => (w.totalReturn || 0) > 0).length}
                </div>
                <div className="text-sm text-theme-purple-700">盈利工作流</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 工作流执行趋势 */}
      <Card title="工作流执行趋势">
        <div className="h-64 flex items-center justify-center text-theme-secondary">
          <div className="text-center">
            <div className="w-16 h-16 bg-theme-on-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-theme-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">图表组件待集成</h3>
            <p className="text-theme-secondary">将集成Chart.js或Recharts来显示执行趋势</p>
          </div>
        </div>
      </Card>

      {/* 工作流分类统计 */}
      <Card title="工作流分类统计">
        <div className="space-y-3">
          {(() => {
            const categoryStats = workflows.reduce((acc, workflow) => {
              const category = workflow.category || '未分类';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-theme-on-surface-2 rounded-lg">
                <span className="font-medium text-theme-primary">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-theme-on-surface-3 rounded-full h-2">
                    <div 
                      className="bg-theme-brand h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / totalWorkflows) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-theme-secondary w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ));
          })()}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowAnalytics;
