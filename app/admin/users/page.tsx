import { Metadata } from 'next'
import UserManager from '@/components/UserManager'

export const metadata: Metadata = {
  title: '用户管理 - 管理后台',
  description: '管理用户账户和权限',
}

export default function UsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-2">管理用户账户、查看用户信息和编辑用户权限</p>
      </div>
      
      <UserManager />
    </div>
  )
} 