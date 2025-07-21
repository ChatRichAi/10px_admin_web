import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID ? '已设置' : '未设置',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? '已设置' : '未设置',
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? '已设置' : '未设置',
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
    },
    nextauth: {
      url: process.env.NEXTAUTH_URL ? '已设置' : '未设置',
      secret: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置'
    },
    admin: {
      emails: process.env.ADMIN_EMAILS ? '已设置' : '未设置'
    }
  })
} 