import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '快速访问 - 管理后台',
  description: '常用功能的快捷入口',
}

export default function QuickAccessPage() {
  const quickActions = [
    {
      category: '用户相关',
      actions: [
        {
          title: '查看所有用户',
          description: '浏览和管理所有用户账户',
          icon: '👥',
          href: '/admin/users',
          color: 'bg-blue-500'
        },
        {
          title: '添加新用户',
          description: '手动创建新用户账户',
          icon: '➕',
          href: '/admin/users?action=add',
          color: 'bg-green-500'
        },
        {
          title: '批量导入用户',
          description: '从CSV文件批量导入用户',
          icon: '📁',
          href: '/admin/users?action=import',
          color: 'bg-purple-500'
        }
      ]
    },
    {
      category: '权限管理',
      actions: [
        {
          title: '权限分配',
          description: '为用户分配特定权限',
          icon: '🔐',
          href: '/admin/permissions',
          color: 'bg-indigo-500'
        },
        {
          title: '角色管理',
          description: '创建和管理用户角色',
          icon: '👑',
          href: '/admin/roles',
          color: 'bg-yellow-500'
        },
        {
          title: '权限审计',
          description: '查看权限变更历史',
          icon: '📋',
          href: '/admin/permissions/audit',
          color: 'bg-red-500'
        }
      ]
    },
    {
      category: '订阅管理',
      actions: [
        {
          title: '订阅概览',
          description: '查看所有订阅状态',
          icon: '💳',
          href: '/admin/subscriptions',
          color: 'bg-pink-500'
        },
        {
          title: '批量操作',
          description: '批量升级或取消订阅',
          icon: '⚡',
          href: '/admin/subscriptions?action=bulk',
          color: 'bg-orange-500'
        },
        {
          title: '支付管理',
          description: '处理支付和退款',
          icon: '💰',
          href: '/admin/payments',
          color: 'bg-teal-500'
        }
      ]
    },
    {
      category: '系统维护',
      actions: [
        {
          title: '系统状态',
          description: '检查系统运行状态',
          icon: '📊',
          href: '/admin/system',
          color: 'bg-cyan-500'
        },
        {
          title: '日志查看',
          description: '查看系统日志',
          icon: '📝',
          href: '/admin/logs',
          color: 'bg-gray-500'
        },
        {
          title: '数据备份',
          description: '创建系统备份',
          icon: '💾',
          href: '/admin/backup',
          color: 'bg-emerald-500'
        }
      ]
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">快速访问</h1>
        <p className="text-gray-600 mt-2">常用功能的快捷入口</p>
      </div>

      <div className="space-y-8">
        {quickActions.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.actions.map((action, actionIndex) => (
                <Link
                  key={actionIndex}
                  href={action.href}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all duration-200 group border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-200`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 最近访问 */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">最近访问</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">用户管理</p>
                  <p className="text-xs text-gray-500">2分钟前访问</p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                访问
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">🔐</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">权限管理</p>
                  <p className="text-xs text-gray-500">15分钟前访问</p>
                </div>
              </div>
              <Link
                href="/admin/permissions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                访问
              </Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">💳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">订阅管理</p>
                  <p className="text-xs text-gray-500">1小时前访问</p>
                </div>
              </div>
              <Link
                href="/admin/subscriptions"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                访问
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 