import { FC } from 'react'

interface TokenChartProps {
  // 定义props类型
}

const TokenChart: FC<TokenChartProps> = () => {
  return (
    <div className="p-6 bg-theme-on-surface-1 rounded-2xl md:p-4 mb-6">
      {/* Token图表组件占位符 - 暂未实现 */}
      <div className="h-64 flex items-center justify-center text-theme-secondary">
        <div className="text-center">
          <div className="mb-2">📊</div>
          <div>图表模块开发中...</div>
        </div>
      </div>
    </div>
  )
}

export default TokenChart
