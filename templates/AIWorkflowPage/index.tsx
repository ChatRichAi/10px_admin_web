// AI工作流页面模板 - 整合所有子组件

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Icon from '@/components/Icon';
import WorkflowTemplateModal from '@/components/WorkflowTemplateModal';
import WorkflowList from '@/templates/HomePage/WorkflowList';
import WorkflowRuns from '@/templates/HomePage/WorkflowRuns';
import WorkflowAnalytics from '@/templates/HomePage/WorkflowAnalytics';
import WorkflowLogs from '@/templates/HomePage/WorkflowLogs';
import { useWorkflowData } from '@/hooks/useWorkflowData';
import { workflowService } from '@/lib/workflowService';

const AIWorkflowPage = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const {
    workflows,
    activeRuns,
    serviceStatus,
    isLoading,
    isStarting,
    isStopping,
    startWorkflow,
    stopWorkflow,
    createWorkflow,
    getWorkflowLogs,
  } = useWorkflowData();

  const tabItems = [
    { id: 'workflows', title: '工作流管理' },
    { id: 'runs', title: '运行监控' },
    { id: 'analytics', title: '分析报告' },
    { id: 'logs', title: '日志管理' },
    { id: 'pandafactor', title: 'PandaFactor 因子库' }
  ];

  const handleStartWorkflow = async (workflowId: string) => {
    const success = await startWorkflow(workflowId);
    if (!success) {
      alert('启动工作流失败，请检查后端服务是否运行');
    }
  };

  const handleStopWorkflow = async (workflowId: string) => {
    const success = await stopWorkflow(workflowId);
    if (!success) {
      alert('停止工作流失败，请检查后端服务是否运行');
    }
  };

  const handleConfigureWorkflow = (workflowId: string) => {
    console.log('配置工作流:', workflowId);
    // TODO: 实现工作流配置功能
    alert(`配置工作流 ${workflowId} 功能正在开发中...`);
  };

  const handleViewReport = (workflowId: string) => {
    console.log('查看收益报告:', workflowId);
    // TODO: 实现收益报告查看功能
    alert(`查看工作流 ${workflowId} 的收益报告功能正在开发中...`);
  };

  const handleViewLogs = async (runId: string) => {
    // 跳转到日志管理标签页，并设置过滤器
    setActiveTab('logs');
    // 可以通过状态管理或URL参数传递runId到日志组件
    console.log('查看工作流日志:', runId);
  };

  const openQuantflowUI = () => {
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

  return (
    <Layout title="策略工作流">
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="settings" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-theme-primary">
                    策略工作流
                  </h1>
                  <p className="text-theme-secondary mt-1 text-lg">
                    基于QuantFlow的智能量化工作流平台
                  </p>
                </div>
              </div>
              
              {serviceStatus === 'disconnected' && (
                <div className="flex items-center gap-3 p-4 bg-theme-yellow-100 border border-theme-yellow-300 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-theme-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-theme-yellow-600 text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-theme-yellow-800 font-medium">服务未连接</p>
                    <p className="text-theme-yellow-700 text-sm">后端服务未运行，当前显示演示数据</p>
                  </div>
                </div>
              )}
              
              {serviceStatus === 'connected' && workflows.length > 0 && workflows[0].id.startsWith('demo-') && (
                <div className="flex items-center gap-3 p-4 bg-theme-brand-100 border border-theme-brand-300 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-theme-brand-200 rounded-full flex items-center justify-center">
                    <Icon name="info" className="w-4 h-4 text-theme-brand-600" />
                  </div>
                  <div>
                    <p className="text-theme-brand-800 font-medium">演示模式</p>
                    <p className="text-theme-brand-700 text-sm">当前显示演示数据，点击"新建工作流"开始创建</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
              <button 
                onClick={() => setShowTemplateModal(true)} 
                className="px-3 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="plus" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">新建工作流</span>
                <span className="sm:hidden">新建</span>
              </button>
              <button 
                onClick={openQuantflowUI} 
                className="px-3 sm:px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="settings" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">打开工作流设计器</span>
                <span className="sm:hidden">设计器</span>
              </button>
              <button 
                onClick={() => window.open('http://127.0.0.1:8000/charts/', '_blank')} 
                className="px-3 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="chart" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">PandaFactor 超级图表</span>
                <span className="sm:hidden">图表</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    const result = await workflowService.syncWorkflows('from-quantflow');
                    if (result.success) {
                      alert(`同步成功！从 QuantFlow 同步了 ${result.data?.total || 0} 个工作流`);
                      // 刷新工作流列表
                      window.location.reload();
                    } else {
                      alert(`同步失败：${result.error}`);
                    }
                  } catch (error) {
                    alert(`同步失败：${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                className="px-3 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="refresh" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">同步工作流</span>
                <span className="sm:hidden">同步</span>
              </button>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-2">
          <div className="flex gap-1">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* 工作流管理 */}
        {activeTab === 'workflows' && (
          <WorkflowList
            workflows={workflows}
            isLoading={isLoading || isStarting || isStopping}
            onStartWorkflow={handleStartWorkflow}
            onStopWorkflow={handleStopWorkflow}
            onConfigureWorkflow={handleConfigureWorkflow}
            onViewReport={handleViewReport}
          />
        )}

        {/* 运行监控 */}
        {activeTab === 'runs' && (
          <WorkflowRuns
            activeRuns={activeRuns}
            workflows={workflows}
            onViewLogs={handleViewLogs}
          />
        )}

        {/* 分析报告 */}
        {activeTab === 'analytics' && (
          <WorkflowAnalytics workflows={workflows} />
        )}

        {/* 日志管理 */}
        {activeTab === 'logs' && (
          <WorkflowLogs />
        )}

        {/* PandaFactor 因子库 */}
        {activeTab === 'pandafactor' && (
          <div className="space-y-6">
            {/* PandaFactor 介绍卡片 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="chart" className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">PandaFactor 量化因子库</h2>
                  <p className="text-gray-700 mb-4 text-lg">
                    高性能的量化算子库，提供金融数据分析、技术指标计算和因子构建功能，支持多种数据源和可视化图表。
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">因子挖掘</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">技术指标</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">数据可视化</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">多数据源</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 功能模块网格 */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* 超级图表 */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Icon name="chart" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">超级图表</h3>
                      <p className="text-sm text-gray-600">可视化数据分析</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    强大的图表分析工具，支持多种图表类型和交互式分析功能。
                  </p>
                  <button 
                    onClick={() => window.open('http://127.0.0.1:8000/charts/', '_blank')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    打开超级图表
                  </button>
                </div>
              </div>

              {/* 工作流设计器 */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Icon name="settings" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">工作流设计器</h3>
                      <p className="text-sm text-gray-600">可视化工作流编排</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    基于节点的可视化工作流设计器，支持拖拽式构建复杂的量化研究流程。
                  </p>
                  <button 
                    onClick={() => window.open('http://127.0.0.1:8000/quantflow/', '_blank')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    打开工作流设计器
                  </button>
                </div>
              </div>

              {/* API 文档 */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Icon name="document" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">API 文档</h3>
                      <p className="text-sm text-gray-600">接口文档和测试</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    完整的 API 接口文档，支持在线测试和调试功能。
                  </p>
                  <button 
                    onClick={() => window.open('http://127.0.0.1:8000/docs', '_blank')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    查看 API 文档
                  </button>
                </div>
              </div>
            </div>

            {/* 数据同步 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">数据同步</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">工作流同步</h4>
                    <p className="text-sm text-gray-600">从 QuantFlow 同步工作流到本地</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const result = await workflowService.syncWorkflows('from-quantflow');
                        if (result.success) {
                          alert(`同步成功！从 QuantFlow 同步了 ${result.data?.total || 0} 个工作流`);
                        } else {
                          alert(`同步失败：${result.error}`);
                        }
                      } catch (error) {
                        alert(`同步失败：${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    立即同步
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">反向同步</h4>
                    <p className="text-sm text-gray-600">将本地工作流同步到 QuantFlow</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const result = await workflowService.syncWorkflows('to-quantflow', workflows);
                        if (result.success) {
                          alert(`同步成功！向 QuantFlow 同步了 ${result.data?.total || 0} 个工作流`);
                        } else {
                          alert(`同步失败：${result.error}`);
                        }
                      } catch (error) {
                        alert(`同步失败：${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    立即同步
                  </button>
                </div>
              </div>
            </div>

            {/* 服务状态 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">服务状态</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">PandaFactor 服务运行中</span>
                </div>
                <div className="text-sm text-gray-500">
                  地址: http://127.0.0.1:8000
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 工作流模板选择弹窗 */}
        <WorkflowTemplateModal
          visible={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </Layout>
  );
};

export default AIWorkflowPage;
