'use client';

import { useState } from 'react';

export default function OpenAITestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOpenAI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/openai/test');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        status: 'error',
        message: '测试请求失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          OpenAI API 配置测试
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            配置检查
          </h2>
          
          <button
            onClick={testOpenAI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {loading ? '测试中...' : '测试 OpenAI API 配置'}
          </button>
        </div>

        {testResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              测试结果
            </h2>
            
            <div className={`p-4 rounded-lg ${
              testResult.status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${
                  testResult.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {testResult.status === 'success' ? '成功' : '失败'}
                </span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {testResult.message}
              </p>
              
              {testResult.details && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  详情: {testResult.details}
                </p>
              )}
              
              {testResult.availableModels && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  可用模型数量: {testResult.availableModels}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            配置说明
          </h2>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold mb-2">1. 获取 OpenAI API 密钥</h3>
              <p className="text-sm">
                访问 <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI 官网</a>，注册账户并创建 API 密钥
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. 配置环境变量</h3>
              <p className="text-sm">
                在项目根目录创建 <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> 文件，添加：
              </p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto">
{`OPENAI_API_KEY=sk-your-actual-api-key-here`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">3. 重启开发服务器</h3>
              <p className="text-sm">
                配置完成后重启开发服务器以使环境变量生效
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 