import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/types/user'

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    image: '/images/avatar-1.jpg',
    subscription: {
      plan: 'pro',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    },
    permissions: ['user:read', 'user:write'],
    role: 'user',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z',
    isActive: true
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    image: '/images/avatar-2.jpg',
    subscription: {
      plan: 'standard',
      status: 'active',
      startDate: '2024-01-05',
      endDate: '2024-12-31'
    },
    permissions: ['user:read'],
    role: 'user',
    createdAt: '2024-01-05T00:00:00Z',
    lastLoginAt: '2024-01-14T15:20:00Z',
    isActive: true
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    subscription: {
      plan: 'free',
      status: 'active'
    },
    permissions: [],
    role: 'user',
    createdAt: '2024-01-10T00:00:00Z',
    lastLoginAt: '2024-01-13T09:15:00Z',
    isActive: true
  }
]

export async function GET() {
  try {
    // 这里应该添加认证和权限检查
    return NextResponse.json(mockUsers)
  } catch (error) {
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()
    
    // 这里应该添加认证和权限检查
    const userIndex = mockUsers.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 更新用户信息
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      subscription: {
        ...mockUsers[userIndex].subscription,
        ...updates.subscription
      }
    }

    return NextResponse.json({ success: true, user: mockUsers[userIndex] })
  } catch (error) {
    return NextResponse.json(
      { error: '更新用户失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    // 这里应该添加认证和权限检查
    const userIndex = mockUsers.findIndex(user => user.id === userId)
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 删除用户
    mockUsers.splice(userIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    )
  }
} 