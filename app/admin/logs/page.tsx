import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '日志管理 - 管理后台',
  description: '系统日志查看和管理',
}

export default function LogsPage() {
  const mockLogs = [
    {
      id: 1,
      level: 'INFO',
      message: '用户登录成功',
      user: 'user@example.com',
      timestamp: '2024-01-15 10:30:25',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      level: 'WARN',
      message: 'API调用频率过高',
      user: 'user@example.com',
      timestamp: '2024-01-15 10:28:15',
      ip: '192.168.1.100',
    },
    {
      id: 3,
      level: 'ERROR',
      message: '数据库连接失败',
      user: 'system',
      timestamp: '2024-01-15 10:25:42',
      ip: '127.0.0.1',
    },
    {
      id: 4,
      level: 'INFO',
      message: '订阅创建成功',
      user: 'user2@example.com',
      timestamp: '2024-01-15 10:20:18',
      ip: '192.168.1.101',
    },
    {
      id: 5,
      level: 'INFO',
      message: '权限更新成功',
      user: 'admin@example.com',
      timestamp: '2024-01-15 10:15:33',
      ip: '192.168.1.102',
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-100'
      case 'WARN':
        return 'text-yellow-600 bg-yellow-100'
      case 'INFO':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">日志管理</h1>
        <p className="text-gray-600 mt-2">系统日志查看和监控</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 日志统计 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">日志统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">总日志数</span>
                <span className="text-lg font-bold text-gray-900">12,345</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">今日日志</span>
                <span className="text-lg font-bold text-blue-600">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">错误日志</span>
                <span className="text-lg font-bold text-red-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">警告日志</span>
                <span className="text-lg font-bold text-yellow-600">45</span>
              </div>
            </div>
          </div>

          {/* 过滤器 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">过滤器</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日志级别</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">全部级别</option>
                  <option value="ERROR">错误</option>
                  <option value="WARN">警告</option>
                  <option value="INFO">信息</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="1h">最近1小时</option>
                  <option value="24h">最近24小时</option>
                  <option value="7d">最近7天</option>
                  <option value="30d">最近30天</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户</label>
                <input
                  type="text"
                  placeholder="输入邮箱搜索"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                应用过滤
              </button>
            </div>
          </div>
        </div>

        {/* 日志列表 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">系统日志</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                    刷新
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    导出
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      级别
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      消息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP地址
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.user}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{log.ip}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{log.timestamp}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          详情
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  显示 1 到 10 条，共 1,234 条记录
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    上一页
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 