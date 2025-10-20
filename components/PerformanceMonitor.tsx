import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiRequests: number;
  cacheHits: number;
  memoryUsage: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiRequests: 0,
    cacheHits: 0,
    memoryUsage: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      // 页面加载时间
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;

      // 内存使用（如果浏览器支持）
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      setMetrics(prev => ({
        ...prev,
        loadTime: loadTime || prev.loadTime,
        memoryUsage: Math.round(memoryUsage / 1024 / 1024) // MB
      }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        title="显示性能监控"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-64">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">性能监控</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">页面加载:</span>
          <span className="font-mono">{metrics.loadTime}ms</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">API请求:</span>
          <span className="font-mono">{metrics.apiRequests}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">缓存命中:</span>
          <span className="font-mono text-green-600">{metrics.cacheHits}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">内存使用:</span>
          <span className="font-mono">{metrics.memoryUsage}MB</span>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">缓存效率:</span>
            <span className="font-mono text-blue-600">
              {metrics.apiRequests > 0
                ? Math.round((metrics.cacheHits / metrics.apiRequests) * 100)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;