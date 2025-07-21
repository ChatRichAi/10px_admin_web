import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/middleware/auth'
import { db } from '@/lib/firebase'
import { PERMISSIONS, Permission } from '@/lib/permissions'

// 获取所有可用权限
export async function GET() {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const permissions = Object.entries(PERMISSIONS).map(([key, value]) => ({
      key,
      value,
      description: getPermissionDescription(value),
    }))

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('获取权限列表失败:', error)
    return NextResponse.json(
      { error: '获取权限列表失败' },
      { status: 500 }
    )
  }
}

// 分配权限给用户
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const { userId, permissions } = await request.json()

    if (!userId || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: '用户ID和权限列表是必需的' },
        { status: 400 }
      )
    }

    // 验证权限是否有效
    const validPermissions = Object.values(PERMISSIONS)
    const invalidPermissions = permissions.filter(
      (p: string) => !validPermissions.includes(p as Permission)
    )

    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: `无效的权限: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      )
    }

    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    await userRef.update({
      permissions,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('分配权限失败:', error)
    return NextResponse.json(
      { error: '分配权限失败' },
      { status: 500 }
    )
  }
}

// 撤销用户权限
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const permission = searchParams.get('permission')

    if (!userId || !permission) {
      return NextResponse.json(
        { error: '用户ID和权限是必需的' },
        { status: 400 }
      )
    }

    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const currentPermissions = userData?.permissions || []
    const updatedPermissions = currentPermissions.filter((p: string) => p !== permission)

    await userRef.update({
      permissions: updatedPermissions,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('撤销权限失败:', error)
    return NextResponse.json(
      { error: '撤销权限失败' },
      { status: 500 }
    )
  }
}

// 获取权限描述
function getPermissionDescription(permission: Permission): string {
  const descriptions: Record<Permission, string> = {
    [PERMISSIONS.BASIC_ANALYSIS]: '基础资产分析',
    [PERMISSIONS.PRICE_ALERTS]: '实时价格预警',
    [PERMISSIONS.ADVANCED_ANALYSIS]: '高级市场分析',
    [PERMISSIONS.AI_PREDICTION]: 'AI预测分析',
    [PERMISSIONS.MARKET_DEPTH]: '市场深度分析',
    [PERMISSIONS.AUTO_TRADING]: '自动化交易',
    [PERMISSIONS.PRIORITY_SUPPORT]: '优先客户支持',
    [PERMISSIONS.ADVANCED_CHARTS]: '高级图表工具',
    [PERMISSIONS.API_ACCESS]: 'API访问权限',
    [PERMISSIONS.ADMIN_ACCESS]: '管理员权限',
  }
  return descriptions[permission] || permission
} 