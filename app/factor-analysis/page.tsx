'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs';
import Icon from '@/components/Icon';
import { usePandaFactor } from '@/hooks/usePandaFactor';

// 因子分析页面组件
const FactorAnalysisPage = () => {
  const [activeTab, setActiveTab] = useState('explorer');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    technicalIndicators, 
    loading: factorLoading, 
    error: factorError, 
    getTechnicalIndicators,
    isServiceOnline 
  } = usePandaFactor('BTC', false);

  // 获取因子列表
  const fetchFactors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        ...(categoryFilter && { category: categoryFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/panda-factor/factors?${params}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setFactors(data.data.factors || []);
      } else {
        throw new Error(data.message || '获取因子列表失败');
      }
    } catch (err) {
      console.error('获取因子列表失败:', err);
      setError(err instanceof Error ? err.message : '获取因子列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取因子列表
  useEffect(() => {
    fetchFactors();
  }, [categoryFilter, searchTerm]);

  // 处理因子选择
  const handleFactorSelect = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  // 处理因子取消选择
  const handleFactorDeselect = (factorId: string) => {
    setSelectedFactors(prev => prev.filter(id => id !== factorId));
  };

  // 清空选择
  const clearSelection = () => {
    setSelectedFactors([]);
  };

  // 获取选中的因子信息
  const getSelectedFactorInfo = () => {
    return factors.filter(factor => selectedFactors.includes(factor.id));
  };

  const tabItems = [
    { id: 'explorer', title: '因子浏览器' },
    { id: 'editor', title: '因子编辑器' },
    { id: 'backtest', title: '因子回测' },
    { id: 'portfolio', title: '因子组合' }
  ];

  return (
    <Layout title="因子分析">
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
                    因子分析
                  </h1>
                  <p className="text-theme-secondary mt-1 text-lg">
                    探索、创建和回测量化因子，构建强大的投资策略
                  </p>
                </div>
              </div>
              
              {!isServiceOnline && (
                <div className="flex items-center gap-3 p-4 bg-theme-yellow-100 border border-theme-yellow-300 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-theme-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-theme-yellow-600 text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-theme-yellow-800 font-medium">PandaFactor 服务离线</p>
                    <p className="text-theme-yellow-700 text-sm">当前显示模拟数据，请启动 PandaFactor 服务以使用完整功能</p>
                  </div>
                </div>
              )}
              
              {isServiceOnline && (
                <div className="flex items-center gap-3 p-4 bg-theme-brand-100 border border-theme-brand-300 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-theme-brand-200 rounded-full flex items-center justify-center">
                    <Icon name="check" className="w-4 h-4 text-theme-brand-600" />
                  </div>
                  <div>
                    <p className="text-theme-brand-800 font-medium">PandaFactor 服务在线</p>
                    <p className="text-theme-brand-700 text-sm">可以执行因子计算、回测和高级分析功能</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
              <button 
                onClick={() => window.location.href = '/panda-factor'}
                className="px-3 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="chart" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">PandaFactor 主页</span>
                <span className="sm:hidden">主页</span>
              </button>
              <button 
                onClick={() => window.open('http://127.0.0.1:8000/charts/', '_blank')}
                className="px-3 sm:px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="chart" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">超级图表</span>
                <span className="sm:hidden">图表</span>
              </button>
              <button 
                onClick={() => window.open('http://127.0.0.1:8000/docs', '_blank')}
                className="px-3 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:scale-105 text-xs sm:text-base whitespace-nowrap flex-shrink-0"
              >
                <Icon name="document" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline">API 文档</span>
                <span className="sm:hidden">文档</span>
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
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="space-y-6">
          {/* 因子浏览器 */}
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              {/* 搜索和过滤卡片 */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">因子搜索</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="搜索因子名称、描述或标签..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">所有类别</option>
                    <option value="技术指标">技术指标</option>
                    <option value="趋势指标">趋势指标</option>
                    <option value="量价关系">量价关系</option>
                    <option value="风险指标">风险指标</option>
                  </select>
                  <button
                    onClick={fetchFactors}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? '搜索中...' : '搜索'}
                  </button>
                </div>
              </div>

              {/* 因子列表 */}
              {loading ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      加载因子列表中...
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12">
                  <div className="text-center">
                    <div className="text-red-500 mb-2 text-2xl">⚠️</div>
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {factors.map((factor) => (
                    <div
                      key={factor.id}
                      className={`bg-white rounded-2xl shadow-md border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedFactors.includes(factor.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleFactorSelect(factor.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <Icon name="chart" className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{factor.name}</h3>
                              <p className="text-sm text-gray-600">{factor.category}</p>
                            </div>
                          </div>
                          {selectedFactors.includes(factor.id) && (
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <Icon name="check" className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-4 text-sm leading-relaxed">{factor.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">信息系数 (IC)</span>
                            <span className="text-sm font-bold text-green-600">
                              {factor.performance?.ic?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">信息比率 (IR)</span>
                            <span className="text-sm font-bold text-blue-600">
                              {factor.performance?.ir?.toFixed(2) || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">夏普比率</span>
                            <span className="text-sm font-bold text-purple-600">
                              {factor.performance?.sharpe?.toFixed(2) || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">最大回撤</span>
                            <span className="text-sm font-bold text-red-600">
                              {factor.performance?.max_drawdown ? (factor.performance.max_drawdown * 100).toFixed(1) + '%' : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {factor.tags?.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 标签 */}
                      {factor.tags && factor.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {factor.tags.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {factor.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                              +{factor.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 因子编辑器 */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Icon name="edit" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">因子编辑器</h2>
                    <p className="text-gray-600">使用 Python 代码创建自定义因子，支持实时预览和验证</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Icon name="code" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">因子编辑器即将上线</h3>
                    <p className="text-gray-600 mb-4">
                      支持 Python 和公式两种编写模式，实时预览和验证功能
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Python 模式</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">公式模式</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">实时预览</span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">代码验证</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 因子回测 */}
          {activeTab === 'backtest' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Icon name="trending-up" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">因子回测</h2>
                    <p className="text-gray-600">对因子进行历史回测，评估其表现和风险特征</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Icon name="chart" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">因子回测功能即将上线</h3>
                    <p className="text-gray-600 mb-4">
                      支持多因子组合回测、性能分析和风险指标计算
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">历史回测</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">性能分析</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">风险指标</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">多因子组合</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 因子组合 */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Icon name="layers" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">因子组合</h2>
                    <p className="text-gray-600">构建多因子组合，优化权重分配和风险控制</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Icon name="layers" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">因子组合功能即将上线</h3>
                    <p className="text-gray-600 mb-4">
                      支持多因子权重优化、组合分析和风险控制
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">权重优化</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">组合分析</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">风险控制</span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">回测验证</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 选中因子信息 */}
        {selectedFactors.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-sm z-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Icon name="layers" className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">已选择因子</h4>
              </div>
              <button
                onClick={clearSelection}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="清空选择"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {getSelectedFactorInfo().map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                  </div>
                  <button
                    onClick={() => handleFactorDeselect(factor.id)}
                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="移除因子"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <Icon name="play" className="w-4 h-4 mr-2" />
                开始回测 ({selectedFactors.length} 个因子)
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FactorAnalysisPage;
