import { db } from './firebase'
import { User, UserSubscription, CreateUserData, PlanType } from '@/types/user'
import bcrypt from 'bcryptjs'
import { FieldValue } from 'firebase-admin/firestore'

// 创建用户
export async function createUser(userData: CreateUserData): Promise<string> {
  try {
    const hashedPassword = userData.password 
      ? await bcrypt.hash(userData.password, 12)
      : undefined

    const newUser = {
      email: userData.email,
      name: userData.name,
      image: userData.image || null,
      provider: userData.provider || 'credentials',
      password: hashedPassword,
      subscription: {
        plan: 'free' as PlanType,
        status: 'expired',
        startDate: new Date(),
        endDate: new Date(),
      },
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await db.collection('users').add(newUser)
    return docRef.id
  } catch (error) {
    console.error('创建用户失败:', error)
    throw new Error('创建用户失败')
  }
}

// 根据ID获取用户
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return null
    }

    const userData = userDoc.data()!
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate(),
      subscription: {
        ...userData.subscription,
        startDate: userData.subscription.startDate.toDate(),
        endDate: userData.subscription.endDate.toDate(),
      }
    } as User
  } catch (error) {
    console.error('获取用户失败:', error)
    return null
  }
}

// 根据邮箱获取用户
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const userSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (userSnapshot.empty) {
      return null
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()
    
    return {
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate(),
      subscription: {
        ...userData.subscription,
        startDate: userData.subscription.startDate.toDate(),
        endDate: userData.subscription.endDate.toDate(),
      }
    } as User
  } catch (error) {
    console.error('获取用户失败:', error)
    return null
  }
}

// 获取用户订阅信息
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  try {
    const user = await getUserById(userId)
    
    if (!user) {
      throw new Error('用户不存在')
    }

    return user.subscription
  } catch (error) {
    console.error('获取订阅信息失败:', error)
    // 返回默认的免费订阅
    return {
      plan: 'free',
      status: 'expired',
      startDate: new Date(),
      endDate: new Date(),
    }
  }
}

// 更新用户订阅
export async function updateUserSubscription(
  userId: string, 
  subscription: Partial<UserSubscription>
): Promise<void> {
  try {
    const updateData = {
      [`subscription.${Object.keys(subscription)[0]}`]: Object.values(subscription)[0],
      updatedAt: new Date(),
    }

    // 如果更新多个字段
    Object.entries(subscription).forEach(([key, value]) => {
      updateData[`subscription.${key}`] = value
    })

    await db.collection('users').doc(userId).update(updateData)
  } catch (error) {
    console.error('更新订阅失败:', error)
    throw new Error('更新订阅失败')
  }
}

// 更新用户Stripe客户ID
export async function updateUserStripeCustomerId(
  userId: string, 
  stripeCustomerId: string
): Promise<void> {
  try {
    await db.collection('users').doc(userId).update({
      stripeCustomerId,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('更新Stripe客户ID失败:', error)
    throw new Error('更新Stripe客户ID失败')
  }
}

// 检查用户是否有效订阅
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId)
    return subscription.status === 'active' && new Date() <= subscription.endDate
  } catch (error) {
    console.error('检查订阅状态失败:', error)
    return false
  }
}

// 获取所有用户（管理员功能）
export async function getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
  try {
    const usersSnapshot = await db
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get()

    return usersSnapshot.docs.map(doc => {
      const userData = doc.data()
      return {
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt.toDate(),
        updatedAt: userData.updatedAt.toDate(),
        subscription: {
          ...userData.subscription,
          startDate: userData.subscription.startDate.toDate(),
          endDate: userData.subscription.endDate.toDate(),
        }
      } as User
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return []
  }
}

// 删除用户
export async function deleteUser(userId: string): Promise<void> {
  try {
    await db.collection('users').doc(userId).delete()
  } catch (error) {
    console.error('删除用户失败:', error)
    throw new Error('删除用户失败')
  }
}

// 更新用户档案
export async function updateUserProfile(
  userId: string, 
  profileData: { name?: string; image?: string | null }
): Promise<void> {
  try {
    const updateData: any = {
      updatedAt: new Date()
    }

    if (profileData.name !== undefined) {
      updateData.name = profileData.name
    }

    if (profileData.image !== undefined) {
      updateData.image = profileData.image
    }

    await db.collection('users').doc(userId).update(updateData)
  } catch (error) {
    console.error('更新用户档案失败:', error)
    throw new Error('更新用户档案失败')
  }
} 