import { Metadata } from 'next'
import ProtectedRoute from '@/components/ProtectedRoute'
import { PERMISSIONS } from '@/lib/permissions'
import UserManager from '@/components/UserManager'
import PermissionManager from '@/components/PermissionManager'
import SubscriptionManager from '@/components/SubscriptionManager'

export const metadata: Metadata = {
  title: '用户权限管理 - 10px AI',
  description: '完整的用户权限管理系统',
}

export default function ManagementPage() {
  return (
    <ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 页面头部 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">用户权限管理系统</h1>
            <p className="text-gray-600">
              这是一个完整的后台用户权限管理系统，包含用户管理、权限控制和订阅管理功能。
            </p>
          </div>

          {/* 用户管理 */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">用户管理</h2>
            <UserManager
              onUserUpdate={(userId, updates) => {
                console.log('用户更新:', userId, updates)
              }}
              onUserDelete={(userId) => {
                console.log('用户删除:', userId)
              }}
            />
          </div>

          {/* 权限管理 */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">权限管理</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                选择用户后可以管理其权限。权限分为基础功能、高级功能、专业功能和管理功能四个类别。
              </p>
            </div>
            {/* 这里可以添加一个用户选择器，然后显示权限管理组件 */}
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-center">请先选择用户进行权限管理</p>
            </div>
          </div>

          {/* 订阅管理 */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">订阅管理</h2>
            <SubscriptionManager
              onSubscriptionUpdate={(userId, subscription) => {
                console.log('订阅更新:', userId, subscription)
              }}
              onBulkAction={(action, userIds, plan) => {
                console.log('批量操作:', action, userIds, plan)
              }}
            />
          </div>

          {/* 使用说明 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">使用说明</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>用户管理：</strong>可以查看、编辑、删除用户，支持搜索和批量操作</p>
              <p>• <strong>权限管理：</strong>可以为用户分配或撤销特定权限，支持分类管理</p>
              <p>• <strong>订阅管理：</strong>可以管理用户订阅状态，支持批量升级、取消等操作</p>
              <p>• <strong>数据统计：</strong>实时显示用户数量、收入统计、套餐分布等关键指标</p>
            </div>
          </div>

          {/* API 文档 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">API 接口</h3>
            <div className="space-y-3 text-sm">
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">GET /api/admin/users</code>
                <span className="ml-2 text-gray-600">获取所有用户列表</span>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">PUT /api/admin/users</code>
                <span className="ml-2 text-gray-600">更新用户信息</span>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">DELETE /api/admin/users</code>
                <span className="ml-2 text-gray-600">删除用户</span>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">GET /api/admin/permissions</code>
                <span className="ml-2 text-gray-600">获取权限列表</span>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">POST /api/admin/permissions</code>
                <span className="ml-2 text-gray-600">分配用户权限</span>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">GET /api/admin/subscriptions</code>
                <span className="ml-2 text-gray-600">获取订阅统计</span>
              </div>
              <div>
                <code className="bg-gray-200 px-2 py-1 rounded">POST /api/admin/subscriptions</code>
                <span className="ml-2 text-gray-600">批量订阅操作</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 