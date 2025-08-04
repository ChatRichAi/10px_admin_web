import { Metadata } from 'next'
import AdminSidebar from '../components/AdminSidebar'
import PermissionManager from '../components/PermissionManager'

export const metadata: Metadata = {
  title: '权限管理 - 管理后台',
  description: '管理用户权限和角色',
}

export default function PermissionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 admin-content">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">权限管理</h1>
              <p className="text-muted-foreground mt-2">管理用户权限、角色和访问控制</p>
            </div>
            <PermissionManager />
          </div>
        </main>
      </div>
    </div>
  )
} 