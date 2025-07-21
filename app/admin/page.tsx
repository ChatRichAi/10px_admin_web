import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '管理后台 - 10px AI',
  description: '用户和订阅管理后台',
}

export default function AdminPage() {
  const quickActions = [
    {
      title: '用户管理',
      description: '管理用户账户和权限',
      icon: '👥',
      href: '/admin/users',
      color: 'bg-blue-500',
      stats: '1,234 用户'
    },
    {
      title: '权限管理',
      description: '分配和管理用户权限',
      icon: '🔐',
      href: '/admin/permissions',
      color: 'bg-green-500',
      stats: '89 个权限'
    },
    {
      title: '订阅管理',
      description: '管理订阅状态和套餐',
      icon: '💳',
      href: '/admin/subscriptions',
      color: 'bg-purple-500',
      stats: '567 订阅'
    },
    {
      title: '系统管理',
      description: '系统设置和配置',
      icon: '⚙️',
      href: '/admin/system',
      color: 'bg-yellow-500',
      stats: '系统正常'
    },
    {
      title: '数据统计',
      description: '数据分析和报表',
      icon: '📈',
      href: '/admin/analytics',
      color: 'bg-indigo-500',
      stats: '实时数据'
    },
    {
      title: '日志管理',
      description: '系统日志查看',
      icon: '📝',
      href: '/admin/logs',
      color: 'bg-red-500',
      stats: '12,345 条日志'
    },
    {
      title: 'API管理',
      description: 'API密钥和配置',
      icon: '🔌',
      href: '/admin/api',
      color: 'bg-pink-500',
      stats: '12 个密钥'
    }
  ]

  const stats = [
    { label: '总用户数', value: '1,234', change: '+12%', changeType: 'positive' },
    { label: '活跃用户', value: '987', change: '+8%', changeType: 'positive' },
    { label: '总收入', value: '$45,678', change: '+15%', changeType: 'positive' },
    { label: '订阅转化率', value: '23.4%', change: '+2.1%', changeType: 'positive' },
  ]

  return (
    <div>
      {/* 欢迎信息 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">欢迎来到管理后台</h1>
        <p className="text-gray-600 mt-2">管理您的用户、权限和系统配置</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{action.stats}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">最近活动</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">新用户注册</p>
                <p className="text-xs text-gray-500">user@example.com 刚刚注册了账户</p>
              </div>
              <span className="text-xs text-gray-500">2分钟前</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💳</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">订阅升级</p>
                <p className="text-xs text-gray-500">用户升级到专业版套餐</p>
              </div>
              <span className="text-xs text-gray-500">15分钟前</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⚠</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">系统警告</p>
                <p className="text-xs text-gray-500">API调用频率过高</p>
              </div>
              <span className="text-xs text-gray-500">1小时前</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">🔐</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">权限更新</p>
                <p className="text-xs text-gray-500">管理员更新了用户权限</p>
              </div>
              <span className="text-xs text-gray-500">2小时前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 