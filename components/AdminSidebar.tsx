'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { PERMISSIONS } from '@/lib/permissions'

interface NavItem {
  name: string
  href: string
  icon: string
  description: string
  permission?: string
}

const navigation: NavItem[] = [
  {
    name: '仪表板',
    href: '/admin',
    icon: '📊',
    description: '管理后台概览',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '快速访问',
    href: '/admin/quick-access',
    icon: '⚡',
    description: '常用功能快捷入口',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: '👥',
    description: '管理用户账户',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '权限管理',
    href: '/admin/permissions',
    icon: '🔐',
    description: '分配和管理权限',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '订阅管理',
    href: '/admin/subscriptions',
    icon: '💳',
    description: '管理订阅状态',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '系统管理',
    href: '/admin/system',
    icon: '⚙️',
    description: '系统设置和配置',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '数据统计',
    href: '/admin/analytics',
    icon: '📈',
    description: '数据分析和报表',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '日志管理',
    href: '/admin/logs',
    icon: '📝',
    description: '系统日志查看',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: 'API管理',
    href: '/admin/api',
    icon: '🔌',
    description: 'API密钥和配置',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
]

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS}>
      <div className={`bg-white shadow-lg ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 min-h-screen`}>
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">管理后台</h1>
                <p className="text-xs text-gray-500">10px AI</p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* 用户信息 */}
        {!collapsed && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user.image || '/images/avatar-1.jpg'}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 导航菜单 */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* 底部操作 */}
        {!collapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <span>🏠</span>
                <span className="text-sm">返回首页</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full"
              >
                <span>🚪</span>
                <span className="text-sm">退出登录</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 