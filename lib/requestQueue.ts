interface RequestQueueItem {
  id: string;
  url: string;
  options?: RequestInit;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: number;
  timestamp: number;
}

class APIRequestQueue {
  private queue: RequestQueueItem[] = [];
  private processing = false;
  private concurrent = 3; // 最大并发请求数
  private activeRequests = 0;
  private requestDelay = 100; // 请求间隔毫秒

  /**
   * 添加请求到队列
   * @param id 请求唯一标识
   * @param url 请求URL
   * @param options 请求选项
   * @param priority 优先级（数字越大优先级越高）
   */
  add<T>(id: string, url: string, options?: RequestInit, priority: number = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      // 检查是否已有相同请求
      const existingIndex = this.queue.findIndex(item => item.id === id);
      if (existingIndex !== -1) {
        // 移除旧请求，添加新请求
        this.queue.splice(existingIndex, 1);
      }

      this.queue.push({
        id,
        url,
        options,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      });

      // 按优先级排序
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeRequests >= this.concurrent) return;

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrent) {
      const item = this.queue.shift();
      if (!item) break;

      this.activeRequests++;
      this.executeRequest(item);

      // 请求间隔
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
    }

    this.processing = false;
  }

  private async executeRequest(item: RequestQueueItem) {
    try {
      const response = await fetch(item.url, item.options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      item.resolve(data);
    } catch (error) {
      item.reject(error);
    } finally {
      this.activeRequests--;
      // 继续处理队列
      setTimeout(() => this.processQueue(), this.requestDelay);
    }
  }

  /**
   * 清除队列中的所有请求
   */
  clear() {
    this.queue.forEach(item => {
      item.reject(new Error('Request cancelled'));
    });
    this.queue = [];
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    return {
      queued: this.queue.length,
      active: this.activeRequests,
      processing: this.processing
    };
  }
}

// 全局请求队列实例
export const apiQueue = new APIRequestQueue();

/**
 * 带优先级的请求Hook
 */
export const usePriorityRequest = () => {
  const request = async <T>(
    id: string,
    url: string,
    options?: RequestInit,
    priority: number = 0
  ): Promise<T> => {
    return apiQueue.add<T>(id, url, options, priority);
  };

  return { request };
};