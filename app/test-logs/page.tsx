// 日志功能测试页面

'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LogViewer from '@/components/LogViewer';
import LogStats from '@/components/LogStats';
import Icon from '@/components/Icon';
import { logService } from '@/lib/logService';
import { useLogs } from '@/hooks/useLogs';

const TestLogsPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { logs, stats, isLoading, clearLogs, exportLogs, applyFilter, refreshLogs } = useLogs({
    autoRefresh: true,
    refreshInterval: 3000
  });

  // 生成测试日志
  const generateTestLogs = () => {
    setIsGenerating(true);
    
    // 生成各种类型的日志
    const logTypes = [
      { level: 'info', category: 'workflow', message: '工作流开始执行' },
      { level: 'success', category: 'api', message: 'API调用成功' },
      { level: 'warn', category: 'system', message: '系统资源使用率较高' },
      { level: 'error', category: 'workflow', message: '工作流执行失败' },
      { level: 'debug', category: 'performance', message: '性能调试信息' }
    ];

    const workflows = ['workflow-001', 'workflow-002', 'workflow-003'];
    const runs = ['run-001', 'run-002', 'run-003'];

    // 生成50条随机日志
    for (let i = 0; i < 50; i++) {
      const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
      const workflowId = workflows[Math.floor(Math.random() * workflows.length)];
      const runId = runs[Math.floor(Math.random() * runs.length)];
      
      logService.log(
        logType.category as any,
        logType.level as any,
        `${logType.message} - 测试 ${i + 1}`,
        {
          testData: `测试数据 ${i + 1}`,
          randomValue: Math.random() * 100
        },
        {
          workflowId,
          runId,
          duration: Math.random() * 1000,
          tags: ['test', 'demo']
        }
      );
    }

    setTimeout(() => {
      setIsGenerating(false);
      refreshLogs();
    }, 1000);
  };

  // 生成错误日志
  const generateErrorLogs = () => {
    const errors = [
      '数据库连接失败',
      'API请求超时',
      '工作流节点执行错误',
      '内存不足',
      '网络连接中断'
    ];

    errors.forEach((error, index) => {
      logService.logWorkflow(
        'error',
        error,
        `workflow-${index + 1}`,
        `run-${index + 1}`,
        {
          errorCode: `ERR_${index + 1}`,
          stackTrace: `Error stack trace ${index + 1}`
        }
      );
    });

    refreshLogs();
  };

  // 生成性能日志
  const generatePerformanceLogs = () => {
    const operations = [
      '数据库查询',
      'API调用',
      '文件处理',
      '数据转换',
      '缓存操作'
    ];

    operations.forEach((operation, index) => {
      const duration = Math.random() * 2000 + 100;
      logService.logPerformance(
        duration > 1000 ? 'warn' : 'info',
        `${operation}完成`,
        operation,
        duration,
        {
          operationId: `op-${index + 1}`,
          memoryUsage: Math.random() * 100
        }
      );
    });

    refreshLogs();
  };

  return (
    <Layout title="日志功能测试">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-primary">日志功能测试</h1>
            <p className="text-theme-secondary mt-2">测试AI工作流系统的日志记录功能</p>
          </div>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-theme-on-surface-1 rounded-xl border border-theme-stroke p-6">
          <h2 className="text-xl font-semibold text-theme-primary mb-4">测试控制面板</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={generateTestLogs}
              disabled={isGenerating}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              {isGenerating ? '生成中...' : '生成测试日志'}
            </button>
            
            <button
              onClick={generateErrorLogs}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="x-circle" className="w-4 h-4" />
              生成错误日志
            </button>
            
            <button
              onClick={generatePerformanceLogs}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="clock" className="w-4 h-4" />
              生成性能日志
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        {stats && (
          <LogStats stats={stats} />
        )}

        {/* 日志查看器 */}
        <LogViewer
          logs={logs}
          isLoading={isLoading}
          onRefresh={refreshLogs}
          onClear={clearLogs}
          onExport={exportLogs}
          onFilter={applyFilter}
          autoRefresh={true}
          refreshInterval={3000}
          maxHeight="500px"
          showFilters={true}
          showStats={false}
        />

        {/* 功能说明 */}
        <div className="bg-theme-on-surface-2 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">功能说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-theme-primary mb-2">日志记录功能</h4>
              <ul className="text-sm text-theme-secondary space-y-1">
                <li>• 支持多种日志级别（info, success, warn, error, debug）</li>
                <li>• 支持多种日志类别（workflow, api, system, user, performance）</li>
                <li>• 自动记录API调用和执行时间</li>
                <li>• 支持工作流和运行ID关联</li>
                <li>• 支持标签和详细信息</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-theme-primary mb-2">日志查看功能</h4>
              <ul className="text-sm text-theme-secondary space-y-1">
                <li>• 实时日志显示和自动刷新</li>
                <li>• 多维度过滤和搜索</li>
                <li>• 日志统计和性能指标</li>
                <li>• 日志导出（JSON/CSV格式）</li>
                <li>• 日志详情展开和选择</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestLogsPage;
