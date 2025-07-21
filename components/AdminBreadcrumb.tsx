'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  name: string
  href: string
}

export default function AdminBreadcrumb() {
  const pathname = usePathname()
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { name: '管理后台', href: '/admin' }
    ]

    if (segments.length > 1) {
      const pageName = segments[1]
      const pageNames: { [key: string]: string } = {
        'users': '用户管理',
        'permissions': '权限管理',
        'subscriptions': '订阅管理',
        'system': '系统管理',
        'analytics': '数据统计',
        'logs': '日志管理',
        'api': 'API管理',
        'management': '综合管理',
        'quick-access': '快速访问'
      }

      if (pageNames[pageName]) {
        breadcrumbs.push({
          name: pageNames[pageName],
          href: `/${segments.slice(0, 2).join('/')}`
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && (
            <svg
              className="w-4 h-4 mx-2 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
} 