'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Tabs from '@/components/Tabs';
import Icon from '@/components/Icon';
import WorkflowTemplateModal from '@/components/WorkflowTemplateModal';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error' | 'completed';
  createdAt: string;
  lastRun?: string;
  nodes: number;
  category: string;
  // 收益相关字段
  totalReturn?: number; // 总收益率
  maxDrawdown?: number; // 最大回撤
  sharpeRatio?: number; // 夏普比率
  winRate?: number; // 胜率
  totalTrades?: number; // 总交易次数
}

interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  progress: number;
  logs: string[];
}

const AIWorkflowPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeRuns, setActiveRuns] = useState<WorkflowRun[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');
  const [serviceStatus, setServiceStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      await fetchWorkflows();
      await fetchActiveRuns();
    };

    initializeData();

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchActiveRuns();
    }, 5000); // 每5秒刷新一次运行状态

    return () => clearInterval(interval);
  }, []);

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
      running: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      completed: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      error: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
      stopped: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800'
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

  const handleStartWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          workflowId: workflowId,
        }),
      });

      if (!response.ok) {
        throw new Error('启动工作流失败');
      }

      const result = await response.json();
      console.log('工作流启动结果:', result);
      
      // 更新工作流状态
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'running' as const } : w
      ));

      // 刷新运行状态
      await fetchActiveRuns();
    } catch (error) {
      console.error('启动工作流失败:', error);
      alert('启动工作流失败，请检查后端服务是否运行');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
          workflowId: workflowId,
        }),
      });

      if (!response.ok) {
        throw new Error('停止工作流失败');
      }

      const result = await response.json();
      console.log('工作流停止结果:', result);
      
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { ...w, status: 'stopped' as const } : w
      ));

      // 刷新运行状态
      await fetchActiveRuns();
    } catch (error) {
      console.error('停止工作流失败:', error);
      alert('停止工作流失败，请检查后端服务是否运行');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (workflowId: string) => {
    // 这里可以跳转到收益报告页面或打开模态框
    console.log('查看收益报告:', workflowId);
    // 暂时使用alert，后续可以改为打开模态框或跳转页面
    alert(`查看工作流 ${workflowId} 的收益报告功能正在开发中...`);
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/ai-workflow?action=list');
      if (response.ok) {
        const data = await response.json();
        // 转换后端服务的数据格式到我们的格式
        const convertedWorkflows = data.workflows?.map((wf: any) => ({
          id: wf.id,
          name: wf.name || wf.title,
          description: wf.description || '暂无描述',
          status: wf.status || 'stopped',
          createdAt: wf.created_at || new Date().toISOString().split('T')[0],
          lastRun: wf.last_run,
          nodes: wf.node_count || 0,
          category: wf.category || '默认分类'
        })) || [];
        
        // 如果工作流列表为空，显示演示数据
        if (convertedWorkflows.length === 0) {
          setServiceStatus('connected');
          // 使用演示数据
          const now = new Date();
          const formatTime = (date: Date) => {
            return date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          };
          
          const mockWorkflows: Workflow[] = [
            {
              id: 'demo-1',
              name: '股票因子挖掘工作流',
              description: '基于机器学习算法挖掘有效股票因子',
              status: 'stopped',
              createdAt: '2025-09-03',
              lastRun: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // 2小时前
              nodes: 8,
              category: '因子分析',
              totalReturn: 15.8,
              maxDrawdown: -3.2,
              sharpeRatio: 1.45,
              winRate: 68.5,
              totalTrades: 156
            },
            {
              id: 'demo-2',
              name: '期权波动率预测',
              description: '使用深度学习预测期权波动率变化',
              status: 'completed',
              createdAt: '2025-09-03',
              lastRun: formatTime(new Date(now.getTime() - 30 * 60 * 1000)), // 30分钟前
              nodes: 12,
              category: '期权分析',
              totalReturn: 22.3,
              maxDrawdown: -5.1,
              sharpeRatio: 1.82,
              winRate: 72.1,
              totalTrades: 89
            },
            {
              id: 'demo-3',
              name: '多资产组合优化',
              description: '基于风险平价模型优化投资组合',
              status: 'stopped',
              createdAt: '2025-09-03',
              lastRun: formatTime(new Date(now.getTime() - 4 * 60 * 60 * 1000)), // 4小时前
              nodes: 6,
              category: '组合管理',
              totalReturn: 8.7,
              maxDrawdown: -2.1,
              sharpeRatio: 1.12,
              winRate: 61.3,
              totalTrades: 203
            }
          ];
          setWorkflows(mockWorkflows);
        } else {
          setWorkflows(convertedWorkflows);
          setServiceStatus('connected');
        }
      } else {
        // 如果API调用失败，设置服务状态为断开
        setServiceStatus('disconnected');
        // 使用模拟数据
        const now = new Date();
        const formatTime = (date: Date) => {
          return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        
        const mockWorkflows: Workflow[] = [
          {
            id: '1',
            name: '股票因子挖掘工作流',
            description: '基于机器学习算法挖掘有效股票因子',
            status: 'stopped',
            createdAt: '2025-09-03',
            lastRun: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // 2小时前
            nodes: 8,
            category: '因子分析',
            totalReturn: 15.8,
            maxDrawdown: -3.2,
            sharpeRatio: 1.45,
            winRate: 68.5,
            totalTrades: 156
          },
          {
            id: '2',
            name: '期权波动率预测',
            description: '使用深度学习预测期权波动率变化',
            status: 'completed',
            createdAt: '2025-09-03',
            lastRun: formatTime(new Date(now.getTime() - 30 * 60 * 1000)), // 30分钟前
            nodes: 12,
            category: '期权分析',
            totalReturn: 22.3,
            maxDrawdown: -5.1,
            sharpeRatio: 1.82,
            winRate: 72.1,
            totalTrades: 89
          },
          {
            id: '3',
            name: '多资产组合优化',
            description: '基于风险平价模型优化投资组合',
            status: 'stopped',
            createdAt: '2025-09-03',
            lastRun: formatTime(new Date(now.getTime() - 4 * 60 * 60 * 1000)), // 4小时前
            nodes: 6,
            category: '组合管理',
            totalReturn: 8.7,
            maxDrawdown: -2.1,
            sharpeRatio: 1.12,
            winRate: 61.3,
            totalTrades: 203
          }
        ];
        setWorkflows(mockWorkflows);
      }
    } catch (error) {
      console.error('获取工作流列表失败:', error);
      setServiceStatus('disconnected');
      // 使用模拟数据作为后备
      const now = new Date();
      const formatTime = (date: Date) => {
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: '股票因子挖掘工作流',
          description: '基于机器学习算法挖掘有效股票因子',
          status: 'stopped',
          createdAt: '2025-09-03',
          lastRun: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)), // 2小时前
          nodes: 8,
          category: '因子分析',
          totalReturn: 15.8,
          maxDrawdown: -3.2,
          sharpeRatio: 1.45,
          winRate: 68.5,
          totalTrades: 156
        },
        {
          id: '2',
          name: '期权波动率预测',
          description: '使用深度学习预测期权波动率变化',
          status: 'completed',
          createdAt: '2025-09-03',
          lastRun: formatTime(new Date(now.getTime() - 30 * 60 * 1000)), // 30分钟前
          nodes: 12,
          category: '期权分析',
          totalReturn: 22.3,
          maxDrawdown: -5.1,
          sharpeRatio: 1.82,
          winRate: 72.1,
          totalTrades: 89
        },
        {
          id: '3',
          name: '多资产组合优化',
          description: '基于风险平价模型优化投资组合',
          status: 'stopped',
          createdAt: '2025-09-03',
          lastRun: formatTime(new Date(now.getTime() - 4 * 60 * 60 * 1000)), // 4小时前
          nodes: 6,
          category: '组合管理',
          totalReturn: 8.7,
          maxDrawdown: -2.1,
          sharpeRatio: 1.12,
          winRate: 61.3,
          totalTrades: 203
        }
      ];
      setWorkflows(mockWorkflows);
    }
  };

  const fetchActiveRuns = async () => {
    try {
      const response = await fetch('/api/ai-workflow/runs');
      if (response.ok) {
        const data = await response.json();
        const convertedRuns = data.runs?.map((run: any) => ({
          id: run.id,
          workflowId: run.workflow_id,
          status: run.status,
          startTime: run.start_time,
          endTime: run.end_time,
          progress: run.progress || 0,
          logs: run.logs || []
        })) || [];
        setActiveRuns(convertedRuns);
      } else {
        // 如果API调用失败，使用空数组
        setActiveRuns([]);
      }
    } catch (error) {
      console.error('获取运行状态失败:', error);
      // 使用空数组作为后备
      setActiveRuns([]);
    }
  };

  const openQuantflowUI = () => {
    // 打开后端服务的Web UI
    const quantflowUIUrl = process.env.NEXT_PUBLIC_QUANTFLOW_UI_URL || 'http://127.0.0.1:8000/quantflow/';
    window.open(quantflowUIUrl, '_blank');
  };

  const handleSelectTemplate = (template: any) => {
    console.log('选择的模板:', template);
    
    if (template.id === 'empty') {
      // 创建空白工作流，打开通用工作流设计器
      openQuantflowUI();
    } else {
      // 其他模板，可以在这里添加具体的处理逻辑
      openQuantflowUI();
    }
  };

  const tabItems = [
    { id: 'workflows', title: '工作流管理' },
    { id: 'runs', title: '运行监控' },
    { id: 'analytics', title: '分析报告' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* 页面标题 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="settings" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    策略工作流
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">
                    基于QuantFlow的智能量化工作流平台
                  </p>
                </div>
              </div>
              
              {serviceStatus === 'disconnected' && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-amber-800 font-medium">服务未连接</p>
                    <p className="text-amber-700 text-sm">后端服务未运行，当前显示演示数据</p>
                  </div>
                </div>
              )}
              
              {serviceStatus === 'connected' && workflows.length > 0 && workflows[0].id.startsWith('demo-') && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="info" className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">演示模式</p>
                    <p className="text-blue-700 text-sm">当前显示演示数据，点击"新建工作流"开始创建</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowTemplateModal(true)} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
              >
                <Icon name="plus" className="w-5 h-5 text-white" />
                新建工作流
              </button>
              <button 
                onClick={openQuantflowUI} 
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg border border-gray-200 transition-all duration-200 flex items-center gap-2"
              >
                <Icon name="settings" className="w-5 h-5 text-gray-700" />
                打开工作流设计器
              </button>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <div className="flex gap-1">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* 工作流管理 */}
        {activeTab === 'workflows' && (
          <div className="grid gap-6 grid-cols-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                {/* 卡片头部 */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        {getStatusIcon(workflow.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-500">{workflow.category}</p>
                      </div>
                    </div>
                    {getStatusBadge(workflow.status)}
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {workflow.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Icon name="settings" className="w-3 h-3 text-gray-500" />
                      <span>{workflow.nodes} 节点</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3 text-gray-500" />
                      <span>{workflow.createdAt}</span>
                    </div>
                  </div>

                  {workflow.lastRun && (
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3 text-gray-500" />
                      <span>最后运行: {workflow.lastRun}</span>
                    </div>
                  )}
                </div>

                {/* 收益指标 */}
                {workflow.totalReturn !== undefined && (
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">收益表现</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${workflow.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {workflow.totalReturn > 0 ? '+' : ''}{workflow.totalReturn}%
                          </div>
                          <div className="text-xs text-gray-500">总收益率</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-500">
                            {workflow.maxDrawdown}%
                          </div>
                          <div className="text-xs text-gray-500">最大回撤</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {workflow.sharpeRatio}
                          </div>
                          <div className="text-xs text-gray-500">夏普比率</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {workflow.winRate}%
                          </div>
                          <div className="text-xs text-gray-500">胜率</div>
                        </div>
                      </div>
                      <div className="text-center pt-2 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700">{workflow.totalTrades} 笔交易</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {workflow.status === 'running' ? (
                      <button 
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                        onClick={() => handleStopWorkflow(workflow.id)}
                        disabled={isLoading}
                      >
                        <Icon name="pause" className="w-3 h-3 text-white" />
                        停止
                      </button>
                    ) : (
                      <button 
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                        onClick={() => handleStartWorkflow(workflow.id)}
                        disabled={isLoading}
                      >
                        <Icon name="plus" className="w-3 h-3 text-white" />
                        启动
                      </button>
                    )}
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1">
                      <Icon name="settings" className="w-3 h-3 text-gray-700" />
                      配置
                    </button>
                    <button 
                      className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                      onClick={() => handleViewReport(workflow.id)}
                    >
                      <Icon name="star" className="w-3 h-3 text-blue-700" />
                      报告
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 运行监控 */}
        {activeTab === 'runs' && (
          <Card title="运行中的工作流">
            {activeRuns.length === 0 ? (
              <div className="text-center py-8 text-theme-secondary">
                当前没有运行中的工作流
              </div>
            ) : (
              <div className="space-y-4">
                {activeRuns.map((run) => (
                  <div key={run.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {workflows.find(w => w.id === run.workflowId)?.name}
                        </h4>
                        {getStatusBadge(run.status)}
                      </div>
                      <span className="text-sm text-theme-secondary">
                        {run.startTime}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>进度</span>
                        <span>{run.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${run.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-2">执行日志</h5>
                      <div className="bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                        {run.logs.map((log, index) => (
                          <div key={index} className="text-xs text-theme-secondary">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 分析报告 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card title="总工作流数">
                <div className="text-2xl font-bold">{workflows.length}</div>
                <p className="text-xs text-theme-secondary">
                  +2 较上月
                </p>
              </Card>

              <Card title="运行中">
                <div className="text-2xl font-bold">
                  {workflows.filter(w => w.status === 'running').length}
                </div>
                <p className="text-xs text-theme-secondary">
                  活跃工作流
                </p>
              </Card>

              <Card title="成功率">
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-theme-secondary">
                  +1.2% 较上月
                </p>
              </Card>

              <Card title="平均执行时间">
                <div className="text-2xl font-bold">12.5m</div>
                <p className="text-xs text-theme-secondary">
                  -2.1m 较上月
                </p>
              </Card>
            </div>

            <Card title="工作流执行趋势">
              <div className="h-64 flex items-center justify-center text-theme-secondary">
                图表组件待集成
              </div>
            </Card>
          </div>
        )}

        {/* 工作流模板选择弹窗 */}
        <WorkflowTemplateModal
          visible={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </div>
  );
};

export default AIWorkflowPage;