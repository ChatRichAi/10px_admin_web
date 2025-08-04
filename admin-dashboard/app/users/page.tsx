import { Metadata } from 'next'
import AdminSidebar from '../components/AdminSidebar'
import UserManager from '../components/UserManager'

export const metadata: Metadata = {
  title: '用户管理 - 管理后台',
  description: '管理用户账户和权限',
}

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 admin-content">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">用户管理</h1>
              <p className="text-muted-foreground mt-2">管理用户账户、权限和订阅状态</p>
            </div>
            <UserManager />
          </div>
        </main>
      </div>
    </div>
  )
} 