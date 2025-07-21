import { Metadata } from 'next'
import AdminSidebar from '@/components/AdminSidebar'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'

export const metadata: Metadata = {
  title: '管理后台 - 10px AI',
  description: '用户和订阅管理后台',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1">
          <div className="p-6">
            <AdminBreadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 