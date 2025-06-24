import { FC } from 'react'

interface NeuraAIChatProps {
  // 定义props类型
}

const NeuraAIChat: FC<NeuraAIChatProps> = () => {
  return (
    <div className="p-6 bg-theme-on-surface-1 rounded-2xl md:p-4">
      {/* NeuraAI聊天组件占位符 - 暂未实现 */}
      <div className="h-32 flex items-center justify-center text-theme-secondary">
        <div className="text-center">
          <div className="mb-2">🤖</div>
          <div>AI聊天模块开发中...</div>
        </div>
      </div>
    </div>
  )
}

export default NeuraAIChat 