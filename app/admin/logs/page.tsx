import { Metadata } from 'next'
import LogManager from '@/components/LogManager'

export const metadata: Metadata = {
  title: '日志管理 - 管理后台',
  description: '系统日志查看和管理',
}

export default function LogsPage() {
  return <LogManager />
} 