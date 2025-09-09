'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal';
import Icon from '@/components/Icon';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
}

interface WorkflowTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

const WorkflowTemplateModal: React.FC<WorkflowTemplateModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const templates: WorkflowTemplate[] = [
    // 现有模板
    {
      id: 'factor-mining',
      name: '因子大师-非线性因子-自定义模型示例',
      description: '基于机器学习算法挖掘有效股票因子，支持多种特征工程和模型训练',
      category: '因子大师',
      icon: 'chart',
      difficulty: 'intermediate',
      estimatedTime: '30-45分钟',
      features: ['特征工程', '模型训练', '因子评估', '回测验证']
    },
    {
      id: 'volatility-prediction',
      name: '因子大师-线性因子-python示例',
      description: '使用深度学习预测期权波动率变化，包含数据预处理和模型优化',
      category: '因子大师',
      icon: 'trending-up',
      difficulty: 'advanced',
      estimatedTime: '45-60分钟',
      features: ['深度学习', '波动率建模', '风险管理', '实时预测']
    },
    {
      id: 'portfolio-optimization',
      name: '因子大师-线性因子-公式示例',
      description: '基于风险平价模型优化投资组合，实现风险与收益的平衡',
      category: '因子大师',
      icon: 'pie-chart',
      difficulty: 'beginner',
      estimatedTime: '20-30分钟',
      features: ['风险平价', '组合优化', '资产配置', '绩效分析']
    },
    {
      id: 'xgboost-factor',
      name: '因子大师-非线性因子-xgboost示例',
      description: '使用XGBoost算法构建非线性因子模型，提升预测准确性',
      category: '因子大师',
      icon: 'cpu',
      difficulty: 'intermediate',
      estimatedTime: '35-50分钟',
      features: ['XGBoost算法', '特征重要性', '模型解释', '因子挖掘']
    },
    {
      id: 'xgboost-regression',
      name: '因子大师-非线性因子-超参搜索xgboost示例',
      description: '通过超参数搜索优化XGBoost回归模型，实现最佳预测效果',
      category: '中概交易',
      icon: 'search',
      difficulty: 'advanced',
      estimatedTime: '60-90分钟',
      features: ['超参数优化', '网格搜索', '交叉验证', '模型调优']
    },
    {
      id: 'single-factor-model',
      name: '因子大师-单因子模版1',
      description: '构建单因子模型的标准化流程，适合初学者学习因子投资',
      category: '因子大师',
      icon: 'bar-chart',
      difficulty: 'beginner',
      estimatedTime: '15-25分钟',
      features: ['单因子分析', '收益预测', '风险评估', '回测框架']
    }
  ];

  const categories = ['all', '因子大师', '中概交易'];
  const categoryLabels = {
    'all': '全部',
    '因子大师': '因子大师',
    '中概交易': '中概交易'
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '初级';
      case 'intermediate':
        return '中级';
      case 'advanced':
        return '高级';
      default:
        return difficulty;
    }
  };

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleCreateEmpty = () => {
    const emptyTemplate: WorkflowTemplate = {
      id: 'empty',
      name: '创建空白工作流',
      description: '从零开始创建自定义工作流',
      category: '自定义',
      icon: 'plus',
      difficulty: 'beginner',
      estimatedTime: '自定义',
      features: []
    };
    handleSelectTemplate(emptyTemplate);
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showButtonClose={true}
      classWrap="max-w-6xl w-full"
    >
      <div className="space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Icon name="plus" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-theme-primary mb-2">
              创建工作流
            </h2>
            <p className="text-theme-secondary text-lg">
              选择一个模板快速开始，或创建空白工作流
            </p>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                  : 'bg-theme-on-surface-1 text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2 border border-theme-stroke hover:border-theme-stroke shadow-sm'
              }`}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </button>
          ))}
        </div>

        {/* 创建空白工作流按钮 */}
        <div className="flex justify-center">
          <button
            onClick={handleCreateEmpty}
            className="flex items-center gap-4 p-6 border-2 border-dashed border-theme-stroke rounded-2xl hover:border-theme-brand hover:bg-theme-brand-100/20 transition-all duration-200 group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-theme-on-surface-2 to-theme-on-surface-3 group-hover:from-theme-brand-100 group-hover:to-theme-brand-200 rounded-xl flex items-center justify-center transition-all duration-200">
              <Icon name="plus" className="w-7 h-7 text-theme-tertiary group-hover:text-theme-brand" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-theme-primary group-hover:text-theme-brand transition-colors">创建空白工作流</h3>
              <p className="text-theme-secondary group-hover:text-theme-brand-700 transition-colors">从零开始构建自定义工作流</p>
            </div>
          </button>
        </div>

        {/* 模板网格 */}
        <div className="grid grid-cols-2 gap-6">
          {currentTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-theme-on-surface-1 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-theme-stroke overflow-hidden"
              onClick={() => handleSelectTemplate(template)}
            >
              {/* 模板头部 */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Icon name={template.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight text-theme-primary group-hover:text-blue-600 transition-colors mb-2">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {getDifficultyLabel(template.difficulty)}
                      </span>
                      <span className="text-xs text-theme-tertiary">{template.category}</span>
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-sm text-theme-secondary leading-relaxed mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* 预计时间 */}
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="clock" className="w-4 h-4 text-theme-tertiary" />
                  <span className="text-sm text-theme-tertiary">
                    预计时间: {template.estimatedTime}
                  </span>
                </div>

                {/* 特性标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-theme-on-surface-2 text-theme-primary"
                    >
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 3 && (
                    <span className="px-3 py-1 text-xs font-medium rounded-lg bg-theme-on-surface-2 text-theme-primary">
                      +{template.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* 使用模板按钮 */}
              <div className="px-6 pb-6">
                <button className="w-full py-3 text-sm font-semibold rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform group-hover:scale-105">
                  使用模板
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-theme-stroke disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-on-surface-2 transition-colors shadow-sm"
            >
              <Icon name="chevron-left" className="w-5 h-5 text-theme-secondary" />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                      : 'hover:bg-theme-on-surface-2 text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl border border-theme-stroke disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-on-surface-2 transition-colors shadow-sm"
            >
              <Icon name="chevron-right" className="w-5 h-5 text-theme-secondary" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WorkflowTemplateModal;