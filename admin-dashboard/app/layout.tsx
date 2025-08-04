import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '管理后台 - 10px AI',
  description: '用户和订阅管理后台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  )
} 