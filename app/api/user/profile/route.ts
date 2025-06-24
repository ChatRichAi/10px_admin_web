import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserById, updateUserProfile } from '@/lib/user-service'

// 获取用户档案
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const user = await getUserById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 不返回敏感信息
    const { password, ...safeUser } = user as any
    
    return NextResponse.json({
      user: safeUser
    })
    
  } catch (error) {
    console.error('获取用户档案失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新用户档案
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, image, location, bio, website, twitter } = body
    
    // 验证输入
    if (name && name.trim().length === 0) {
      return NextResponse.json(
        { error: '姓名不能为空' },
        { status: 400 }
      )
    }

    if (name && name.trim().length > 50) {
      return NextResponse.json(
        { error: '姓名不能超过50个字符' },
        { status: 400 }
      )
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: '个人简介不能超过500个字符' },
        { status: 400 }
      )
    }

    if (website && website.length > 200) {
      return NextResponse.json(
        { error: '网站地址不能超过200个字符' },
        { status: 400 }
      )
    }

    if (twitter && twitter.length > 100) {
      return NextResponse.json(
        { error: 'Twitter用户名不能超过100个字符' },
        { status: 400 }
      )
    }

    // 准备更新数据
    const updateData: any = {}
    
    if (name !== undefined) {
      updateData.name = name.trim()
    }
    
    if (image !== undefined) {
      updateData.image = image
    }

    if (location !== undefined) {
      updateData.location = location.trim()
    }

    if (bio !== undefined) {
      updateData.bio = bio.trim()
    }

    if (website !== undefined) {
      updateData.website = website.trim()
    }

    if (twitter !== undefined) {
      updateData.twitter = twitter.trim()
    }

    // 更新用户档案
    await updateExtendedUserProfile(session.user.id, updateData)
    
    return NextResponse.json({
      message: '档案更新成功'
    })
    
  } catch (error) {
    console.error('更新用户档案失败:', error)
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 扩展的用户档案更新函数
async function updateExtendedUserProfile(
  userId: string, 
  profileData: {
    name?: string
    image?: string | null
    location?: string
    bio?: string
    website?: string
    twitter?: string
  }
): Promise<void> {
  try {
    const { db } = await import('@/lib/firebase')
    
    const updateData: any = {
      updatedAt: new Date()
    }

    // 只更新提供的字段
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    await db.collection('users').doc(userId).update(updateData)
  } catch (error) {
    console.error('更新用户档案失败:', error)
    throw new Error('更新用户档案失败')
  }
} 