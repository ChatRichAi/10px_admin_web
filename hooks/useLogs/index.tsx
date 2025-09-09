// 日志管理Hook - 提供日志相关的状态管理和操作

import { useState, useEffect, useCallback } from 'react';
import { LogEntry, LogFilter, logService } from '@/lib/logService';

interface UseLogsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilter?: LogFilter;
}

export const useLogs = (options: UseLogsOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 5000,
    initialFilter = { limit: 100 }
  } = options;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<LogFilter>(initialFilter);
  const [error, setError] = useState<string | null>(null);

  // 获取日志数据
  const fetchLogs = useCallback(async (currentFilter?: LogFilter) => {
    setIsLoading(true);
    setError(null);
    
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // 使用本地日志服务作为后备
      const localLogs = logService.getLogs(filterToUse);
      setLogs(localLogs);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // 获取统计信息
  const fetchStats = useCallback(async () => {
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
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setStats(logService.getLogStats());
    }
  }, []);

  // 清空日志
  const clearLogs = useCallback(async () => {
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
    } catch (err) {
      console.error('Failed to clear logs:', err);
      logService.clearLogs();
      await fetchLogs();
      await fetchStats();
    }
  }, [fetchLogs, fetchStats]);

  // 导出日志
  const exportLogs = useCallback(async (format: 'json' | 'csv') => {
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
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  }, []);

  // 应用过滤器
  const applyFilter = useCallback((newFilter: LogFilter) => {
    setFilter(newFilter);
    fetchLogs(newFilter);
  }, [fetchLogs]);

  // 刷新日志
  const refreshLogs = useCallback(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  // 初始加载
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  // 自动刷新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs();
        fetchStats();
      }, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchLogs, fetchStats]);

  return {
    logs,
    stats,
    isLoading,
    error,
    filter,
    fetchLogs,
    fetchStats,
    clearLogs,
    exportLogs,
    applyFilter,
    refreshLogs,
    setFilter
  };
};

export default useLogs;
