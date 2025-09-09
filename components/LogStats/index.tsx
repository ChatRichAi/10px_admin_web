// 日志统计组件 - 显示日志统计信息和性能指标

import React from 'react';
import Icon from '@/components/Icon';
import { LogStats as LogStatsType } from '@/lib/logService';

interface LogStatsProps {
  stats: LogStatsType;
  className?: string;
}

const LogStats: React.FC<LogStatsProps> = ({ stats, className = '' }) => {
  const { total, byLevel, byCategory, recentErrors, performanceMetrics } = stats;

  // 获取级别颜色
  const getLevelColor = (level: string) => {
    const colors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warn: 'text-yellow-600',
      error: 'text-red-600',
      debug: 'text-gray-600'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    const colors = {
      workflow: 'text-purple-600',
      api: 'text-blue-600',
      system: 'text-gray-600',
      user: 'text-green-600',
      performance: 'text-orange-600'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600';
  };

  // 获取级别图标
  const getLevelIcon = (level: string) => {
    const icons = {
      info: 'info',
      success: 'check-circle',
      warn: 'alert-triangle',
      error: 'x-circle',
      debug: 'bug'
    };
    return icons[level as keyof typeof icons] || 'info';
  };

  return (
    <div className={`bg-theme-on-surface-1 rounded-xl border border-theme-stroke shadow-sm ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-theme-stroke">
        <div className="flex items-center gap-2">
          <Icon name="bar-chart" className="w-5 h-5 text-theme-primary" />
          <h3 className="text-lg font-semibold text-theme-primary">日志统计</h3>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 总体统计 */}
        <div>
          <h4 className="text-sm font-medium text-theme-primary mb-3">总体统计</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="text-2xl font-bold text-theme-primary">{total}</div>
              <div className="text-xs text-theme-secondary">总日志数</div>
            </div>
            <div className="text-center p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{byLevel.error || 0}</div>
              <div className="text-xs text-theme-secondary">错误数</div>
            </div>
            <div className="text-center p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{byLevel.warn || 0}</div>
              <div className="text-xs text-theme-secondary">警告数</div>
            </div>
            <div className="text-center p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{byLevel.success || 0}</div>
              <div className="text-xs text-theme-secondary">成功数</div>
            </div>
          </div>
        </div>

        {/* 按级别分布 */}
        <div>
          <h4 className="text-sm font-medium text-theme-primary mb-3">按级别分布</h4>
          <div className="space-y-2">
            {Object.entries(byLevel).map(([level, count]) => {
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20">
                    <Icon name={getLevelIcon(level)} className={`w-4 h-4 ${getLevelColor(level)}`} />
                    <span className="text-sm font-medium text-theme-primary capitalize">{level}</span>
                  </div>
                  <div className="flex-1 bg-theme-on-surface-2 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getLevelColor(level).replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-theme-secondary w-16 text-right">
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 按类别分布 */}
        <div>
          <h4 className="text-sm font-medium text-theme-primary mb-3">按类别分布</h4>
          <div className="space-y-2">
            {Object.entries(byCategory).map(([category, count]) => {
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return (
                <div key={category} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(category).replace('text-', 'bg-')}`} />
                    <span className="text-sm font-medium text-theme-primary capitalize">{category}</span>
                  </div>
                  <div className="flex-1 bg-theme-on-surface-2 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCategoryColor(category).replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-theme-secondary w-16 text-right">
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 性能指标 */}
        <div>
          <h4 className="text-sm font-medium text-theme-primary mb-3">性能指标</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="clock" className="w-4 h-4 text-theme-secondary" />
                <span className="text-sm font-medium text-theme-primary">平均响应时间</span>
              </div>
              <div className="text-lg font-bold text-theme-primary">
                {performanceMetrics.averageResponseTime.toFixed(2)}ms
              </div>
            </div>
            
            <div className="p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="x-circle" className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-theme-primary">错误率</span>
              </div>
              <div className="text-lg font-bold text-red-600">
                {performanceMetrics.errorRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="p-3 bg-theme-on-surface-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="check-circle" className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-theme-primary">成功率</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {performanceMetrics.successRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* 最近错误 */}
        {recentErrors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-theme-primary mb-3">最近错误</h4>
            <div className="space-y-2">
              {recentErrors.slice(0, 5).map((error) => (
                <div key={error.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="x-circle" className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-red-800 font-medium">{error.message}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {new Date(error.timestamp).toLocaleString('zh-CN')}
                      </p>
                      {error.workflowId && (
                        <p className="text-xs text-red-600">
                          工作流: {error.workflowId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogStats;
