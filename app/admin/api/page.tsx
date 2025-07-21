import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API管理 - 管理后台',
  description: 'API密钥和配置管理',
}

export default function ApiPage() {
  const mockApiKeys = [
    {
      id: 1,
      name: '生产环境API',
      key: 'sk_prod_1234567890abcdef',
      status: 'active',
      permissions: ['read', 'write'],
      createdAt: '2024-01-01',
      lastUsed: '2024-01-15 10:30:25',
      usage: 1234,
    },
    {
      id: 2,
      name: '测试环境API',
      key: 'sk_test_abcdef1234567890',
      status: 'active',
      permissions: ['read'],
      createdAt: '2024-01-10',
      lastUsed: '2024-01-14 15:20:10',
      usage: 567,
    },
    {
      id: 3,
      name: '开发环境API',
      key: 'sk_dev_0987654321fedcba',
      status: 'inactive',
      permissions: ['read', 'write', 'admin'],
      createdAt: '2024-01-05',
      lastUsed: '2024-01-12 09:15:30',
      usage: 89,
    },
  ]

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API管理</h1>
        <p className="text-gray-600 mt-2">管理API密钥和访问权限</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API统计 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">总API密钥</span>
                <span className="text-lg font-bold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">活跃密钥</span>
                <span className="text-lg font-bold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">今日调用</span>
                <span className="text-lg font-bold text-blue-600">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">本月调用</span>
                <span className="text-lg font-bold text-purple-600">45,678</span>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                创建新API密钥
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                批量生成密钥
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">
                导出密钥列表
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                清理过期密钥
              </button>
            </div>
          </div>

          {/* 使用指南 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">使用指南</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">认证方式</h4>
                <p>在请求头中添加：</p>
                <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">权限说明</h4>
                <ul className="space-y-1">
                  <li>• read: 只读权限</li>
                  <li>• write: 读写权限</li>
                  <li>• admin: 管理员权限</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API密钥列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">API密钥列表</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="搜索API密钥..."
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  />
                  <button className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    新建
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      API密钥
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      权限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      使用量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最后使用
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockApiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                        <div className="text-sm text-gray-500">创建于 {apiKey.createdAt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {apiKey.key.substring(0, 12)}...
                          </code>
                          <button className="text-blue-600 hover:text-blue-900 text-sm">
                            复制
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(apiKey.status)}`}>
                          {apiKey.status === 'active' ? '活跃' : '停用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {apiKey.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{apiKey.usage.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{apiKey.lastUsed}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            编辑
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            续期
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API使用统计 */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API使用统计</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">98.5%</div>
                <div className="text-sm text-gray-600">成功率</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">45ms</div>
                <div className="text-sm text-gray-600">平均响应时间</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1.2K</div>
                <div className="text-sm text-gray-600">每分钟请求数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 