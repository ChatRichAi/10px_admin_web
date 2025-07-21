import { Metadata } from 'next'
import SubscriptionManager from '@/components/SubscriptionManager'

export const metadata: Metadata = {
  title: '订阅管理 - 管理后台',
  description: '管理用户订阅状态和套餐',
}

export default function SubscriptionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">订阅管理</h1>
        <p className="text-gray-600 mt-2">管理用户订阅状态、套餐升级和批量操作</p>
      </div>
      
      <SubscriptionManager
        onSubscriptionUpdate={(userId, subscription) => {
          console.log('订阅更新:', userId, subscription)
        }}
        onBulkAction={(action, userIds, plan) => {
          console.log('批量操作:', action, userIds, plan)
        }}
      />
    </div>
  )
} 