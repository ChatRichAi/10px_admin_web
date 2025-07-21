// API 基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// API 客户端类
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 获取认证头
  getAuthHeaders() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
    return {};
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API 请求失败:', error);
      throw error;
    }
  }

  // GET 请求
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST 请求
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT 请求
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE 请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// 创建 API 客户端实例
const apiClient = new ApiClient();

// 认证相关 API
export const authAPI = {
  // 登录
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  
  // 注册
  register: (userData) => apiClient.post('/api/auth/register', userData),
  
  // 获取当前用户信息
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  
  // 刷新令牌
  refreshToken: () => apiClient.post('/api/auth/refresh'),
};

// 管理后台 API
export const adminAPI = {
  // 获取用户列表
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/api/admin/users?${queryString}`);
  },
  
  // 获取用户详情
  getUser: (userId) => apiClient.get(`/api/admin/users/${userId}`),
  
  // 更新用户
  updateUser: (userId, data) => apiClient.put(`/api/admin/users/${userId}`, data),
  
  // 删除用户
  deleteUser: (userId) => apiClient.delete(`/api/admin/users/${userId}`),
  
  // 批量更新权限
  batchUpdatePermissions: (userIds, permissions) => 
    apiClient.post('/api/admin/users/batch-permissions', { userIds, permissions }),
  
  // 批量更新订阅
  batchUpdateSubscriptions: (userIds, subscription) => 
    apiClient.post('/api/admin/users/batch-subscriptions', { userIds, subscription }),
  
  // 获取统计数据
  getStats: () => apiClient.get('/api/admin/stats'),
  
  // 设置管理员
  setupAdmin: (adminData) => apiClient.post('/api/admin/setup-admin', adminData),
};

// 用户 API
export const userAPI = {
  // 获取当前用户信息
  getCurrentUser: () => apiClient.get('/api/users/me'),
  
  // 更新用户信息
  updateUser: (data) => apiClient.put('/api/users/me', data),
  
  // 获取订阅信息
  getSubscription: () => apiClient.get('/api/users/subscription'),
  
  // 获取权限信息
  getPermissions: () => apiClient.get('/api/users/permissions'),
};

export default apiClient; 