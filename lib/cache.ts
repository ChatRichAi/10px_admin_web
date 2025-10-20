import { create } from 'zustand';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheStore {
  cache: Map<string, CacheEntry>;
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  clear: (key?: string) => void;
  isValid: (key: string) => boolean;
}

/**
 * 全局数据缓存 Store
 * 用于缓存API请求结果，避免重复请求
 */
export const useCacheStore = create<CacheStore>((set, get) => ({
  cache: new Map(),

  get: <T>(key: string): T | null => {
    const state = get();
    const entry = state.cache.get(key);

    if (!entry) return null;

    // 检查是否过期
    if (Date.now() > entry.expiry) {
      // 清除过期数据
      const newCache = new Map(state.cache);
      newCache.delete(key);
      set({ cache: newCache });
      return null;
    }

    return entry.data as T;
  },

  set: <T>(key: string, data: T, ttl: number = 5 * 60 * 1000) => {
    const state = get();
    const newCache = new Map(state.cache);

    newCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });

    set({ cache: newCache });
  },

  clear: (key?: string) => {
    const state = get();

    if (key) {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      set({ cache: newCache });
    } else {
      set({ cache: new Map() });
    }
  },

  isValid: (key: string): boolean => {
    const state = get();
    const entry = state.cache.get(key);
    return entry ? Date.now() <= entry.expiry : false;
  }
}));

/**
 * 缓存Hook
 * 提供便捷的缓存操作接口
 */
export const useCache = () => {
  const { get, set, clear, isValid } = useCacheStore();

  const getCached = <T>(key: string): T | null => get<T>(key);

  const setCached = <T>(key: string, data: T, ttl?: number) => set<T>(key, data, ttl);

  const clearCache = (key?: string) => clear(key);

  const isCacheValid = (key: string): boolean => isValid(key);

  return {
    getCached,
    setCached,
    clearCache,
    isCacheValid
  };
};

/**
 * 生成缓存键的工具函数
 */
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${prefix}:${sortedParams}`;
};