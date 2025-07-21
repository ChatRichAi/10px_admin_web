import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '数据统计 - 管理后台',
  description: '数据分析和报表管理',
}

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
        <p className="text-gray-600 mt-2">数据分析和业务报表</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户增长趋势 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">用户增长趋势</h3>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-600">图表区域</p>
              <p className="text-sm text-gray-500">用户注册趋势图</p>
            </div>
          </div>
        </div>

        {/* 收入统计 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">收入统计</h3>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>本月</option>
              <option>本季度</option>
              <option>本年</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-gray-600">图表区域</p>
              <p className="text-sm text-gray-500">收入趋势图</p>
            </div>
          </div>
        </div>

        {/* 套餐分布 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">套餐分布</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">免费版</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">1,234</div>
                <div className="text-xs text-gray-500">45%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">入门版</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">567</div>
                <div className="text-xs text-gray-500">21%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">标准版</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">456</div>
                <div className="text-xs text-gray-500">17%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">专业版</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">234</div>
                <div className="text-xs text-gray-500">9%</div>
              </div>
            </div>
          </div>
        </div>

        {/* 活跃度统计 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">用户活跃度</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">日活跃用户</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">周活跃用户</span>
                <span className="font-medium">5,678</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">月活跃用户</span>
                <span className="font-medium">12,345</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能使用统计 */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">功能使用统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-gray-600">基础分析</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">67%</div>
              <div className="text-sm text-gray-600">AI预测</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">45%</div>
              <div className="text-sm text-gray-600">自动交易</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <div className="text-sm text-gray-600">价格预警</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 