import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '系统管理 - 管理后台',
  description: '系统设置和配置管理',
}

export default function SystemPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">系统管理</h1>
        <p className="text-gray-600 mt-2">系统设置、配置管理和维护工具</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 系统信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">💻</span>
            <h3 className="text-lg font-medium text-gray-900">系统信息</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">系统版本</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Node.js</span>
              <span className="font-medium">18.x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">数据库</span>
              <span className="font-medium">Firebase</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">运行环境</span>
              <span className="font-medium">Production</span>
            </div>
          </div>
        </div>

        {/* 环境配置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">⚙️</span>
            <h3 className="text-lg font-medium text-gray-900">环境配置</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Firebase</span>
              <span className="text-green-600">✓ 已配置</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stripe</span>
              <span className="text-green-600">✓ 已配置</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Google OAuth</span>
              <span className="text-green-600">✓ 已配置</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">NextAuth</span>
              <span className="text-green-600">✓ 已配置</span>
            </div>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📊</span>
            <h3 className="text-lg font-medium text-gray-900">系统状态</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">API服务</span>
              <span className="text-green-600">✓ 正常</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">数据库</span>
              <span className="text-green-600">✓ 正常</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">支付服务</span>
              <span className="text-green-600">✓ 正常</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">邮件服务</span>
              <span className="text-yellow-600">⚠ 警告</span>
            </div>
          </div>
        </div>

        {/* 维护工具 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🔧</span>
            <h3 className="text-lg font-medium text-gray-900">维护工具</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              清理缓存
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              备份数据
            </button>
            <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm">
              系统检查
            </button>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🔒</span>
            <h3 className="text-lg font-medium text-gray-900">安全设置</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">两步验证</span>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300">
                启用
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IP白名单</span>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300">
                配置
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">会话管理</span>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300">
                查看
              </button>
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🔔</span>
            <h3 className="text-lg font-medium text-gray-900">通知设置</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">系统通知</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">错误报告</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">性能监控</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 