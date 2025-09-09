// 日志查看器组件 - 支持实时日志显示、过滤和搜索

import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/Icon';
import { LogEntry, LogFilter } from '@/lib/logService';

interface LogViewerProps {
  logs: LogEntry[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onClear?: () => void;
  onExport?: (format: 'json' | 'csv') => void;
  onFilter?: (filter: LogFilter) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxHeight?: string;
  showFilters?: boolean;
  showStats?: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  isLoading = false,
  onRefresh,
  onClear,
  onExport,
  onFilter,
  autoRefresh = false,
  refreshInterval = 5000,
  maxHeight = '600px',
  showFilters = true,
  showStats = true
}) => {
  const [filter, setFilter] = useState<LogFilter>({
    level: [],
    category: [],
    search: '',
    limit: 100
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && onRefresh) {
      autoRefreshRef.current = setInterval(onRefresh, refreshInterval);
      return () => {
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
      };
    }
  }, [autoRefresh, onRefresh, refreshInterval]);

  // 自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // 应用过滤器
  const applyFilter = (newFilter: Partial<LogFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    onFilter?.(updatedFilter);
  };

  // 切换日志展开状态
  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // 切换日志选择状态
  const toggleLogSelection = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedLogs.size === logs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(logs.map(log => log.id)));
    }
  };

  // 获取日志级别样式
  const getLogLevelStyle = (level: LogEntry['level']) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warn: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      debug: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[level] || styles.info;
  };

  // 获取日志类别样式
  const getLogCategoryStyle = (category: LogEntry['category']) => {
    const styles = {
      workflow: 'bg-purple-100 text-purple-800',
      api: 'bg-blue-100 text-blue-800',
      system: 'bg-gray-100 text-gray-800',
      user: 'bg-green-100 text-green-800',
      performance: 'bg-orange-100 text-orange-800'
    };
    return styles[category] || styles.system;
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 格式化持续时间
  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-theme-on-surface-1 rounded-xl border border-theme-stroke shadow-sm">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-theme-stroke">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-theme-primary">日志查看器</h3>
          {showStats && (
            <div className="flex items-center gap-2 text-sm text-theme-secondary">
              <span>总计: {logs.length}</span>
              <span>•</span>
              <span>错误: {logs.filter(log => log.level === 'error').length}</span>
              <span>•</span>
              <span>警告: {logs.filter(log => log.level === 'warn').length}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2 rounded-lg transition-colors"
              title="刷新日志"
            >
              <Icon name="refresh" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {onClear && (
            <button
              onClick={onClear}
              className="p-2 text-theme-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="清空日志"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          )}
          
          {onExport && (
            <div className="relative group">
              <button className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2 rounded-lg transition-colors">
                <Icon name="download" className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-theme-stroke rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => onExport('json')}
                  className="block w-full px-3 py-2 text-sm text-left hover:bg-theme-on-surface-2 rounded-t-lg"
                >
                  导出为 JSON
                </button>
                <button
                  onClick={() => onExport('csv')}
                  className="block w-full px-3 py-2 text-sm text-left hover:bg-theme-on-surface-2 rounded-b-lg"
                >
                  导出为 CSV
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-lg transition-colors ${
              showDetails 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2'
            }`}
            title="切换详细信息"
          >
            <Icon name="info" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 过滤器 */}
      {showFilters && (
        <div className="p-4 border-b border-theme-stroke bg-theme-on-surface-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 级别过滤 */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">日志级别</label>
              <div className="flex flex-wrap gap-2">
                {['info', 'success', 'warn', 'error', 'debug'].map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      const newLevels = filter.level?.includes(level)
                        ? filter.level.filter(l => l !== level)
                        : [...(filter.level || []), level];
                      applyFilter({ level: newLevels });
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filter.level?.includes(level)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 类别过滤 */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">日志类别</label>
              <div className="flex flex-wrap gap-2">
                {['workflow', 'api', 'system', 'user', 'performance'].map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      const newCategories = filter.category?.includes(category)
                        ? filter.category.filter(c => c !== category)
                        : [...(filter.category || []), category];
                      applyFilter({ category: newCategories });
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filter.category?.includes(category)
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 搜索 */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">搜索</label>
              <input
                type="text"
                value={filter.search || ''}
                onChange={(e) => applyFilter({ search: e.target.value })}
                placeholder="搜索日志内容..."
                className="w-full px-3 py-2 text-sm border border-theme-stroke rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 限制数量 */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">显示数量</label>
              <select
                value={filter.limit || 100}
                onChange={(e) => applyFilter({ limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-theme-stroke rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 日志列表 */}
      <div
        ref={logContainerRef}
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-theme-secondary">
              <Icon name="refresh" className="w-4 h-4 animate-spin" />
              <span>加载日志中...</span>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center text-theme-secondary">
              <Icon name="file-text" className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无日志记录</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-theme-stroke">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-4 hover:bg-theme-on-surface-2 transition-colors ${
                  selectedLogs.has(log.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={selectedLogs.has(log.id)}
                    onChange={() => toggleLogSelection(log.id)}
                    className="mt-1"
                  />

                  {/* 日志级别 */}
                  <div className={`px-2 py-1 text-xs font-medium rounded border ${getLogLevelStyle(log.level)}`}>
                    {log.level.toUpperCase()}
                  </div>

                  {/* 日志类别 */}
                  <div className={`px-2 py-1 text-xs font-medium rounded ${getLogCategoryStyle(log.category)}`}>
                    {log.category}
                  </div>

                  {/* 时间 */}
                  <div className="text-xs text-theme-secondary">
                    {formatTime(log.timestamp)}
                  </div>

                  {/* 持续时间 */}
                  {log.duration && (
                    <div className="text-xs text-theme-secondary">
                      {formatDuration(log.duration)}
                    </div>
                  )}

                  {/* 展开/收起按钮 */}
                  <button
                    onClick={() => toggleLogExpansion(log.id)}
                    className="ml-auto p-1 text-theme-secondary hover:text-theme-primary transition-colors"
                  >
                    <Icon 
                      name={expandedLogs.has(log.id) ? "chevron-up" : "chevron-down"} 
                      className="w-4 h-4" 
                    />
                  </button>
                </div>

                {/* 日志消息 */}
                <div className="mt-2 ml-8">
                  <p className="text-theme-primary">{log.message}</p>
                  
                  {/* 工作流信息 */}
                  {(log.workflowId || log.runId) && (
                    <div className="mt-1 text-xs text-theme-secondary">
                      {log.workflowId && <span>工作流: {log.workflowId}</span>}
                      {log.workflowId && log.runId && <span> • </span>}
                      {log.runId && <span>运行: {log.runId}</span>}
                    </div>
                  )}

                  {/* 标签 */}
                  {log.tags && log.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {log.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 详细信息 */}
                {expandedLogs.has(log.id) && (
                  <div className="mt-3 ml-8 p-3 bg-theme-on-surface-2 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-theme-secondary">ID:</span>
                        <span className="ml-2 text-xs text-theme-primary font-mono">{log.id}</span>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-theme-secondary">时间戳:</span>
                        <span className="ml-2 text-xs text-theme-primary">{log.timestamp}</span>
                      </div>

                      {log.userId && (
                        <div>
                          <span className="text-xs font-medium text-theme-secondary">用户:</span>
                          <span className="ml-2 text-xs text-theme-primary">{log.userId}</span>
                        </div>
                      )}

                      {log.details && (
                        <div>
                          <span className="text-xs font-medium text-theme-secondary">详细信息:</span>
                          <pre className="mt-1 text-xs text-theme-primary bg-theme-on-surface-1 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部工具栏 */}
      <div className="flex items-center justify-between p-4 border-t border-theme-stroke bg-theme-on-surface-2">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSelectAll}
            className="text-sm text-theme-secondary hover:text-theme-primary transition-colors"
          >
            {selectedLogs.size === logs.length ? '取消全选' : '全选'}
          </button>
          
          {selectedLogs.size > 0 && (
            <span className="text-sm text-theme-secondary">
              已选择 {selectedLogs.size} 条日志
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-theme-secondary">
          <span>自动刷新: {autoRefresh ? '开启' : '关闭'}</span>
          {autoRefresh && <span>•</span>}
          {autoRefresh && <span>间隔: {refreshInterval / 1000}s</span>}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
