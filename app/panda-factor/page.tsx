'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Icon from '@/components/Icon';

const PandaFactorPage = () => {
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // 检查 PandaFactor 服务状态
    const checkServiceStatus = async () => {
      try {
        const response = await fetch('/api/panda-factor/status', {
          method: 'GET',
        });
        const data = await response.json();
        if (data.status === 'online') {
          setServiceStatus('online');
        } else {
          setServiceStatus('offline');
        }
      } catch (error) {
        console.error('检查服务状态失败:', error);
        setServiceStatus('offline');
      }
    };

    checkServiceStatus();
    // 每30秒检查一次服务状态
    const interval = setInterval(checkServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartService = async () => {
    try {
      // 这里可以添加启动服务的逻辑
      alert('服务启动功能需要后端支持，请手动启动 PandaFactor 服务');
    } catch (error) {
      console.error('启动服务失败:', error);
    }
  };

  return (
    <Layout title="PandaFactor 因子库">
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="chart" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-theme-primary">
                    PandaFactor 因子库
                  </h1>
                  <p className="text-theme-secondary mt-1 text-lg">
                    高性能量化算子库，提供金融数据分析、技术指标计算和因子构建功能
                  </p>
                </div>
              </div>
              
              {/* 服务状态指示器 */}
              <div className="flex items-center gap-3 p-4 bg-theme-on-surface-1 border border-theme-stroke rounded-xl shadow-sm">
                <div className={`w-3 h-3 rounded-full ${
                  serviceStatus === 'online' ? 'bg-green-500' : 
                  serviceStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="text-theme-primary font-medium">
                    {serviceStatus === 'online' ? '服务运行中' : 
                     serviceStatus === 'offline' ? '服务离线' : '检查服务状态中...'}
                  </p>
                  <p className="text-theme-secondary text-sm">
                    {serviceStatus === 'online' ? 'PandaFactor 服务正常运行' : 
                     serviceStatus === 'offline' ? '请启动 PandaFactor 服务' : '正在检查服务状态...'}
                  </p>
                </div>
                {serviceStatus === 'offline' && (
                  <button
                    onClick={handleStartService}
                    className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    启动服务
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 功能模块网格 */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* 超级图表 */}
          <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icon name="chart" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">超级图表</h3>
                  <p className="text-sm text-theme-secondary">可视化数据分析</p>
                </div>
              </div>
              <p className="text-theme-secondary mb-4">
                强大的图表分析工具，支持多种图表类型和交互式分析功能，提供实时数据可视化。
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.open('http://127.0.0.1:8000/charts/', '_blank')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200"
                  disabled={serviceStatus !== 'online'}
                >
                  打开超级图表
                </button>
                <p className="text-xs text-theme-tertiary text-center">
                  需要服务运行中
                </p>
              </div>
            </div>
          </div>

          {/* 工作流设计器 */}
          <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Icon name="settings" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">工作流设计器</h3>
                  <p className="text-sm text-theme-secondary">可视化工作流编排</p>
                </div>
              </div>
              <p className="text-theme-secondary mb-4">
                基于节点的可视化工作流设计器，支持拖拽式构建复杂的量化研究流程和策略开发。
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.open('http://127.0.0.1:8000/quantflow/', '_blank')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200"
                  disabled={serviceStatus !== 'online'}
                >
                  打开工作流设计器
                </button>
                <p className="text-xs text-theme-tertiary text-center">
                  需要服务运行中
                </p>
              </div>
            </div>
          </div>

          {/* API 文档 */}
          <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Icon name="document" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">API 文档</h3>
                  <p className="text-sm text-theme-secondary">接口文档和测试</p>
                </div>
              </div>
              <p className="text-theme-secondary mb-4">
                完整的 API 接口文档，支持在线测试和调试功能，方便开发者集成和使用。
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.open('http://127.0.0.1:8000/docs', '_blank')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200"
                  disabled={serviceStatus !== 'online'}
                >
                  查看 API 文档
                </button>
                <p className="text-xs text-theme-tertiary text-center">
                  需要服务运行中
                </p>
              </div>
            </div>
          </div>

          {/* 因子库管理 */}
          <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Icon name="star" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">因子库管理</h3>
                  <p className="text-sm text-theme-secondary">因子创建和管理</p>
                </div>
              </div>
              <p className="text-theme-secondary mb-4">
                管理和创建量化因子，支持 Python 和公式两种编写方式，提供丰富的因子模板。
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => alert('因子库管理功能正在开发中...')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-lg transition-all duration-200"
                >
                  管理因子库
                </button>
                <p className="text-xs text-theme-tertiary text-center">
                  即将推出
                </p>
              </div>
            </div>
          </div>

          {/* 数据源管理 */}
          <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Icon name="database" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">数据源管理</h3>
                  <p className="text-sm text-theme-secondary">多数据源支持</p>
                </div>
              </div>
              <p className="text-theme-secondary mb-4">
                支持多种数据源：Tushare、RiceQuant、迅投、Tqsdk、QMT、Wind、Choice 等。
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => alert('数据源管理功能正在开发中...')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-lg transition-all duration-200"
                >
                  管理数据源
                </button>
                <p className="text-xs text-theme-tertiary text-center">
                  即将推出
                </p>
              </div>
            </div>
          </div>

          {/* 回测引擎 */}
          <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Icon name="trending-up" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">回测引擎</h3>
                  <p className="text-sm text-theme-secondary">策略回测验证</p>
                </div>
              </div>
              <p className="text-theme-secondary mb-4">
                高性能回测引擎，支持股票、期货等，完整的事件驱动架构，精确模拟真实交易环境。
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => alert('回测引擎功能正在开发中...')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-medium rounded-lg transition-all duration-200"
                >
                  启动回测
                </button>
                <p className="text-xs text-theme-tertiary text-center">
                  即将推出
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 服务信息 */}
        <div className="bg-theme-on-surface-1 rounded-2xl shadow-md border border-theme-stroke p-6">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">服务信息</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-theme-secondary mb-2">服务地址</h4>
              <p className="text-theme-primary font-mono">http://127.0.0.1:8000</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-theme-secondary mb-2">服务状态</h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  serviceStatus === 'online' ? 'bg-green-500' : 
                  serviceStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-theme-primary">
                  {serviceStatus === 'online' ? '运行中' : 
                   serviceStatus === 'offline' ? '离线' : '检查中...'}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-theme-secondary mb-2">版本信息</h4>
              <p className="text-theme-primary">PandaFactor v0.1.0</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-theme-secondary mb-2">最后更新</h4>
              <p className="text-theme-primary">2024-01-20</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PandaFactorPage;
