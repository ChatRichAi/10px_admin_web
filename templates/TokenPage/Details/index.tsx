import { FC } from 'react'

interface TokenDetailsProps {
  // 定义props类型
}

const TokenDetails: FC<TokenDetailsProps> = () => {
  return (
    <div className="p-6 bg-theme-on-surface-1 rounded-2xl md:p-4">
      {/* Token详情组件占位符 - 暂未实现 */}
      <div className="h-48 flex items-center justify-center text-theme-secondary">
        <div className="text-center">
          <div className="mb-2">📋</div>
          <div>详情模块开发中...</div>
        </div>
      </div>
    </div>
  )
}

export default TokenDetails
