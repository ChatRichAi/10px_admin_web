import { Metadata } from 'next'
import PermissionPageClient from './PermissionPageClient'

export const metadata: Metadata = {
  title: '权限管理 - 管理后台',
  description: '分配和管理用户权限',
}

export default function PermissionsPage() {
  return <PermissionPageClient />
} 