'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import ProtectedRoute from './ProtectedRoute'
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
    href: '/',
    icon: '📊',
    description: '管理后台概览',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '快速访问',
    href: '/quick-access',
    icon: '⚡',
    description: '常用功能快捷入口',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '用户管理',
    href: '/users',
    icon: '👥',
    description: '管理用户账户',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '权限管理',
    href: '/permissions',
    icon: '🔐',
    description: '分配和管理权限',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '订阅管理',
    href: '/subscriptions',
    icon: '💳',
    description: '管理订阅状态',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '系统管理',
    href: '/system',
    icon: '⚙️',
    description: '系统设置和配置',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '数据统计',
    href: '/analytics',
    icon: '📈',
    description: '数据分析和报表',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: '日志管理',
    href: '/logs',
    icon: '📝',
    description: '系统日志查看',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  {
    name: 'API管理',
    href: '/api',
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
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.ADMIN_ACCESS}>
      <div className={`admin-sidebar ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 h-screen flex flex-col`}>
        {/* 头部 */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">管理后台</h1>
                <p className="text-xs text-muted-foreground">10px AI</p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* 用户信息 */}
        {!collapsed && user && (
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img
                src={user.image || '/images/avatar-1.jpg'}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* 底部操作 - 固定位置 */}
        {!collapsed && (
          <div className="border-t border-border flex-shrink-0">
            <div className="p-4 space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <span className="text-lg flex-shrink-0">🏠</span>
                <span className="text-sm font-medium">返回首页</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg w-full transition-colors"
              >
                <span className="text-lg flex-shrink-0">🚪</span>
                <span className="text-sm font-medium">退出登录</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
} 