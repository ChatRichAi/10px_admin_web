import { Metadata } from 'next'
import AdminDashboard from '@/components/AdminDashboard'

export const metadata: Metadata = {
  title: '管理后台 - 10px AI',
  description: '用户和订阅管理后台',
}

export default function AdminPage() {
  return <AdminDashboard />
} 