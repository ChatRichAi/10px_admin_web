import React, { useState, useRef, useEffect } from 'react';

interface LazyChartWrapperProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  placeholder?: React.ReactNode;
}

/**
 * 懒加载图表包装器组件
 * 只有当组件进入视口时才会渲染内容
 */
const LazyChartWrapper: React.FC<LazyChartWrapperProps> = ({
  children,
  className = '',
  threshold = 0.1,
  placeholder
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          // 一旦加载就断开观察
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px' // 提前50px开始加载
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  const defaultPlaceholder = (
    <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">正在加载图表...</p>
      </div>
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : (placeholder || defaultPlaceholder)}
    </div>
  );
};

export default LazyChartWrapper;