import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  slowestRender: number;
  fastestRender: number;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  logToConsole?: boolean;
  threshold?: number; // Log warning if render time exceeds this (ms)
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions) => {
  const { componentName, enabled = __DEV__, logToConsole = __DEV__, threshold = 16 } = options;

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const renderCount = useRef<number>(0);

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
    slowestRender: 0,
    fastestRender: Infinity,
  });

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      renderCount.current += 1;
      renderTimes.current.push(renderTime);

      // Keep only last 100 render times to avoid memory issues
      if (renderTimes.current.length > 100) {
        renderTimes.current = renderTimes.current.slice(-100);
      }

      const totalTime = renderTimes.current.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / renderTimes.current.length;
      const slowest = Math.max(...renderTimes.current);
      const fastest = Math.min(...renderTimes.current);

      const newMetrics: PerformanceMetrics = {
        renderCount: renderCount.current,
        averageRenderTime: avgTime,
        lastRenderTime: renderTime,
        totalRenderTime: totalTime,
        slowestRender: slowest,
        fastestRender: fastest,
      };

      setMetrics(newMetrics);

      // Log performance warnings
      if (logToConsole && renderTime > threshold) {
        console.warn(
          `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }

      // Log detailed metrics every 10 renders
      if (logToConsole && renderCount.current % 10 === 0) {
        console.log(`[Performance] ${componentName} metrics:`, {
          renders: renderCount.current,
          avg: avgTime.toFixed(2) + 'ms',
          slowest: slowest.toFixed(2) + 'ms',
          fastest: fastest.toFixed(2) + 'ms',
        });
      }
    };
  });

  return {
    metrics,
    resetMetrics: () => {
      renderTimes.current = [];
      renderCount.current = 0;
      setMetrics({
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        totalRenderTime: 0,
        slowestRender: 0,
        fastestRender: Infinity,
      });
    },
  };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<UsePerformanceMonitorOptions, 'componentName'>
) => {
  const WrappedComponent = (props: P) => {
    usePerformanceMonitor({
      ...options,
      componentName: Component.displayName || Component.name || 'UnknownComponent',
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitor(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Hook for monitoring expensive operations
export const useExpensiveOperationMonitor = (operationName: string, enabled = __DEV__) => {
  const startTime = useRef<number>(0);

  const start = () => {
    if (enabled) {
      startTime.current = performance.now();
    }
  };

  const end = () => {
    if (enabled && startTime.current > 0) {
      const duration = performance.now() - startTime.current;
      console.log(`[Expensive Operation] ${operationName}: ${duration.toFixed(2)}ms`);
      startTime.current = 0;
    }
  };

  return { start, end };
};

// Hook for monitoring memory usage (if available)
export const useMemoryMonitor = (enabled = __DEV__) => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (enabled && 'memory' in performance) {
      const updateMemoryInfo = () => {
        const memory = (performance as any).memory;
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [enabled]);

  return memoryInfo;
};
