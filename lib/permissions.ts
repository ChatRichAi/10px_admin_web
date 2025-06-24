import { PlanType } from '@/types/user'

// 权限常量定义
export const PERMISSIONS = {
  // 基础功能
  BASIC_ANALYSIS: 'basic_analysis',
  PRICE_ALERTS: 'price_alerts',
  
  // 高级功能
  ADVANCED_ANALYSIS: 'advanced_analysis',
  AI_PREDICTION: 'ai_prediction',
  MARKET_DEPTH: 'market_depth',
  
  // 专业功能
  AUTO_TRADING: 'auto_trading',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_CHARTS: 'advanced_charts',
  API_ACCESS: 'api_access',
  
  // 管理功能
  ADMIN_ACCESS: 'admin_access',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// 各套餐包含的权限
export const PLAN_PERMISSIONS: Record<PlanType, Permission[]> = {
  free: [],
  starter: [
    PERMISSIONS.BASIC_ANALYSIS,
    PERMISSIONS.PRICE_ALERTS,
    PERMISSIONS.AI_PREDICTION,
  ],
  standard: [
    PERMISSIONS.BASIC_ANALYSIS,
    PERMISSIONS.PRICE_ALERTS,
    PERMISSIONS.AI_PREDICTION,
    PERMISSIONS.ADVANCED_ANALYSIS,
    PERMISSIONS.MARKET_DEPTH,
  ],
  pro: [
    PERMISSIONS.BASIC_ANALYSIS,
    PERMISSIONS.PRICE_ALERTS,
    PERMISSIONS.AI_PREDICTION,
    PERMISSIONS.ADVANCED_ANALYSIS,
    PERMISSIONS.MARKET_DEPTH,
    PERMISSIONS.AUTO_TRADING,
    PERMISSIONS.PRIORITY_SUPPORT,
    PERMISSIONS.ADVANCED_CHARTS,
    PERMISSIONS.API_ACCESS,
  ],
}

// 权限检查函数
export function hasPermission(userPlan: PlanType, requiredPermission: Permission): boolean {
  const userPermissions = PLAN_PERMISSIONS[userPlan] || []
  return userPermissions.includes(requiredPermission)
}

// 检查多个权限
export function hasAnyPermission(userPlan: PlanType, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userPlan, permission))
}

// 检查是否拥有所有权限
export function hasAllPermissions(userPlan: PlanType, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userPlan, permission))
}

// 获取权限描述
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
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

// 获取套餐升级建议
export function getUpgradeRecommendation(currentPlan: PlanType, requiredPermission: Permission): PlanType | null {
  const plans: PlanType[] = ['starter', 'standard', 'pro']
  
  for (const plan of plans) {
    if (plan !== currentPlan && hasPermission(plan, requiredPermission)) {
      return plan
    }
  }
  
  return null
} 