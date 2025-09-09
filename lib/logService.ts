// 日志记录服务 - 统一管理AI工作流系统的日志记录

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: 'workflow' | 'api' | 'system' | 'user' | 'performance';
  message: string;
  details?: any;
  workflowId?: string;
  runId?: string;
  userId?: string;
  duration?: number; // 执行时间（毫秒）
  tags?: string[];
}

export interface LogFilter {
  level?: string[];
  category?: string[];
  workflowId?: string;
  runId?: string;
  startTime?: string;
  endTime?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  recentErrors: LogEntry[];
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    successRate: number;
  };
}

class LogService {
  private logs: LogEntry[] = [];
  private maxLogs = 10000; // 最大日志条数
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    // 初始化时添加一些系统日志
    this.log('system', 'info', 'LogService initialized', { service: 'LogService' });
  }

  // 记录日志
  log(
    category: LogEntry['category'],
    level: LogEntry['level'],
    message: string,
    details?: any,
    options?: {
      workflowId?: string;
      runId?: string;
      userId?: string;
      duration?: number;
      tags?: string[];
    }
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      workflowId: options?.workflowId,
      runId: options?.runId,
      userId: options?.userId,
      duration: options?.duration,
      tags: options?.tags || []
    };

    // 添加到日志数组
    this.logs.unshift(logEntry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // 通知监听器
    this.notifyListeners();

    // 在开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry);
    }
  }

  // 记录工作流相关日志
  logWorkflow(
    level: LogEntry['level'],
    message: string,
    workflowId: string,
    runId?: string,
    details?: any
  ): void {
    this.log('workflow', level, message, details, { workflowId, runId });
  }

  // 记录API相关日志
  logAPI(
    level: LogEntry['level'],
    message: string,
    endpoint: string,
    duration?: number,
    details?: any
  ): void {
    this.log('api', level, message, { ...details, endpoint }, { duration });
  }

  // 记录系统相关日志
  logSystem(
    level: LogEntry['level'],
    message: string,
    details?: any
  ): void {
    this.log('system', level, message, details);
  }

  // 记录用户操作日志
  logUser(
    level: LogEntry['level'],
    message: string,
    userId: string,
    action: string,
    details?: any
  ): void {
    this.log('user', level, message, { ...details, action }, { userId });
  }

  // 记录性能相关日志
  logPerformance(
    level: LogEntry['level'],
    message: string,
    operation: string,
    duration: number,
    details?: any
  ): void {
    this.log('performance', level, message, { ...details, operation }, { duration });
  }

  // 获取日志
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.level!.includes(log.level));
      }

      if (filter.category && filter.category.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.category!.includes(log.category));
      }

      if (filter.workflowId) {
        filteredLogs = filteredLogs.filter(log => log.workflowId === filter.workflowId);
      }

      if (filter.runId) {
        filteredLogs = filteredLogs.filter(log => log.runId === filter.runId);
      }

      if (filter.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startTime!);
      }

      if (filter.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endTime!);
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          log.details?.endpoint?.toLowerCase().includes(searchLower) ||
          log.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // 分页
      const offset = filter.offset || 0;
      const limit = filter.limit || 100;
      filteredLogs = filteredLogs.slice(offset, offset + limit);
    }

    return filteredLogs;
  }

  // 获取日志统计
  getLogStats(): LogStats {
    const total = this.logs.length;
    const byLevel: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalDuration = 0;
    let errorCount = 0;
    let successCount = 0;

    this.logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
      
      if (log.duration) {
        totalDuration += log.duration;
      }
      
      if (log.level === 'error') {
        errorCount++;
      } else if (log.level === 'success') {
        successCount++;
      }
    });

    const recentErrors = this.logs
      .filter(log => log.level === 'error')
      .slice(0, 10);

    const performanceMetrics = {
      averageResponseTime: totalDuration / this.logs.filter(log => log.duration).length || 0,
      errorRate: (errorCount / total) * 100,
      successRate: (successCount / total) * 100
    };

    return {
      total,
      byLevel,
      byCategory,
      recentErrors,
      performanceMetrics
    };
  }

  // 清空日志
  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
    this.logSystem('info', 'Logs cleared');
  }

  // 导出日志
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'message', 'workflowId', 'runId', 'duration'];
      const csvRows = [headers.join(',')];
      
      this.logs.forEach(log => {
        const row = headers.map(header => {
          const value = log[header as keyof LogEntry];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value || '';
        });
        csvRows.push(row.join(','));
      });
      
      return csvRows.join('\n');
    }
    
    return JSON.stringify(this.logs, null, 2);
  }

  // 订阅日志更新
  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 通知监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  // 生成唯一ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 控制台输出
  private logToConsole(log: LogEntry): void {
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${log.category.toUpperCase()}] [${log.level.toUpperCase()}]`;
    
    const styles = {
      info: 'color: #3b82f6',
      success: 'color: #10b981',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
      debug: 'color: #6b7280'
    };

    console.log(
      `%c${prefix} ${log.message}`,
      styles[log.level],
      log.details ? log.details : ''
    );
  }
}

// 导出单例实例
export const logService = new LogService();
export default logService;
