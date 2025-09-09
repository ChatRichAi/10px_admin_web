// 工作流日志管理页面

import React, { useState, useEffect } from 'react';
import LogViewer from '@/components/LogViewer';
import LogStats from '@/components/LogStats';
import Icon from '@/components/Icon';
import { LogEntry, LogFilter, logService } from '@/lib/logService';

interface WorkflowLogsProps {
  workflowId?: string;
  runId?: string;
}

const WorkflowLogs: React.FC<WorkflowLogsProps> = ({ workflowId, runId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<LogFilter>({
    limit: 100,
    level: [],
    category: [],
    search: '',
    workflowId,
    runId
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // 获取日志数据
  const fetchLogs = async (currentFilter?: LogFilter) => {
    setIsLoading(true);
    try {
      const filterToUse = currentFilter || filter;
      const params = new URLSearchParams();
      
      if (filterToUse.workflowId) params.append('workflowId', filterToUse.workflowId);
      if (filterToUse.runId) params.append('runId', filterToUse.runId);
      if (filterToUse.level?.length) params.append('level', filterToUse.level.join(','));
      if (filterToUse.category?.length) params.append('category', filterToUse.category.join(','));
      if (filterToUse.search) params.append('search', filterToUse.search);
      if (filterToUse.startTime) params.append('startTime', filterToUse.startTime);
      if (filterToUse.endTime) params.append('endTime', filterToUse.endTime);
      if (filterToUse.limit) params.append('limit', filterToUse.limit.toString());
      if (filterToUse.offset) params.append('offset', filterToUse.offset.toString());

      const response = await fetch(`/api/ai-workflow/logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      // 使用本地日志服务作为后备
      const localLogs = logService.getLogs(filterToUse);
      setLogs(localLogs);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai-workflow/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stats' }),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        // 使用本地统计作为后备
        setStats(logService.getLogStats());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(logService.getLogStats());
    }
  };

  // 清空日志
  const handleClearLogs = async () => {
    if (window.confirm('确定要清空所有日志吗？此操作不可撤销。')) {
      try {
        const response = await fetch('/api/ai-workflow/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'clear' }),
        });

        if (response.ok) {
          await fetchLogs();
          await fetchStats();
        } else {
          // 使用本地清空作为后备
          logService.clearLogs();
          await fetchLogs();
          await fetchStats();
        }
      } catch (error) {
        console.error('Failed to clear logs:', error);
        logService.clearLogs();
        await fetchLogs();
        await fetchStats();
      }
    }
  };

  // 导出日志
  const handleExportLogs = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch('/api/ai-workflow/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'export',
          logData: { format }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([data.data], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // 使用本地导出作为后备
        const exportData = logService.exportLogs(format);
        const blob = new Blob([exportData], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // 应用过滤器
  const handleFilter = (newFilter: LogFilter) => {
    setFilter(newFilter);
    fetchLogs(newFilter);
  };

  // 初始加载
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // 自动刷新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs();
        fetchStats();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, filter]);

  return (
    <div className="space-y-6">
      {/* 页面标题和工具栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">工作流日志</h2>
          <p className="text-theme-secondary mt-1">
            {workflowId ? `工作流: ${workflowId}` : '所有工作流日志'}
            {runId && ` • 运行: ${runId}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showStats 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="bar-chart" className="w-4 h-4 mr-2" />
            统计信息
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="refresh" className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            自动刷新
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      {showStats && stats && (
        <LogStats stats={stats} />
      )}

      {/* 日志查看器 */}
      <LogViewer
        logs={logs}
        isLoading={isLoading}
        onRefresh={() => fetchLogs()}
        onClear={handleClearLogs}
        onExport={handleExportLogs}
        onFilter={handleFilter}
        autoRefresh={autoRefresh}
        refreshInterval={5000}
        maxHeight="600px"
        showFilters={true}
        showStats={false}
      />

      {/* 日志信息 */}
      <div className="bg-theme-on-surface-2 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-theme-secondary">总日志数:</span>
            <span className="ml-2 font-medium text-theme-primary">{logs.length}</span>
          </div>
          <div>
            <span className="text-theme-secondary">错误数:</span>
            <span className="ml-2 font-medium text-red-600">
              {logs.filter(log => log.level === 'error').length}
            </span>
          </div>
          <div>
            <span className="text-theme-secondary">警告数:</span>
            <span className="ml-2 font-medium text-yellow-600">
              {logs.filter(log => log.level === 'warn').length}
            </span>
          </div>
          <div>
            <span className="text-theme-secondary">成功数:</span>
            <span className="ml-2 font-medium text-green-600">
              {logs.filter(log => log.level === 'success').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowLogs;
