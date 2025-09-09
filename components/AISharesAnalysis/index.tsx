'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const MarketOverview = dynamic(() => import('./MarketOverview'))
const HotTopics = dynamic(() => import('./HotTopics'))
const StrongStocks = dynamic(() => import('./StrongStocks'))
const MarketDistribution = dynamic(() => import('./MarketDistribution'))
const InvestmentAdvice = dynamic(() => import('./InvestmentAdvice'))
import Icon from '../Icon'

interface MarketOverview {
  totalLimitUp: number
  firstBoard: number
  consecutiveBoard: number
  consecutiveRate: number
}

interface HotTopic {
  name: string
  count: number
  representativeStocks: {
    name: string
    turnoverRate: number
    blockAmount: number
    themes: string[]
  }[]
}

interface StrongStock {
  name: string
  turnoverRate: number
  blockAmount: number
  themes: string[]
}

interface MarketDistribution {
  hs: number
  gem: number
  star: number
}

interface AShareAnalysisData {
  date: string
  marketOverview: MarketOverview
  hotTopics: HotTopic[]
  strongStocks: StrongStock[]
  marketDistribution: MarketDistribution
  investmentAdvice: string[]
}

const AISharesAnalysis: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AShareAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('market-overview')

  useEffect(() => {
    // 模拟数据获取
    const fetchData = async () => {
      try {
        // 模拟API数据
        const mockAnalysisData: AShareAnalysisData = {
          date: '20250905',
          marketOverview: {
            totalLimitUp: 102,
            firstBoard: 83,
            consecutiveBoard: 19,
            consecutiveRate: 18.6
          },
          hotTopics: [
            {
              name: '固态电池',
              count: 25,
              representativeStocks: [
                { name: '英联股份', turnoverRate: 27.9, blockAmount: 0.5, themes: ['固态电池'] },
                { name: '杭可科技', turnoverRate: 8.0, blockAmount: 0.7, themes: ['固态电池'] },
                { name: '洁美科技', turnoverRate: 3.1, blockAmount: 0.2, themes: ['固态电池'] },
                { name: '中钢天源', turnoverRate: 9.6, blockAmount: 1.3, themes: ['固态电池'] },
                { name: '厦钨新能', turnoverRate: 4.7, blockAmount: 0.6, themes: ['固态电池'] }
              ]
            },
            {
              name: '机器人',
              count: 13,
              representativeStocks: [
                { name: '中钢天源', turnoverRate: 9.6, blockAmount: 1.3, themes: ['机器人'] },
                { name: '晶华新材', turnoverRate: 4.7, blockAmount: 0.0, themes: ['机器人'] },
                { name: '胜宏科技', turnoverRate: 10.2, blockAmount: 10.3, themes: ['机器人'] },
                { name: '卧龙电驱', turnoverRate: 18.3, blockAmount: 3.9, themes: ['机器人'] },
                { name: '东山精密', turnoverRate: 6.5, blockAmount: 2.0, themes: ['机器人'] }
              ]
            },
            {
              name: '储能',
              count: 13,
              representativeStocks: [
                { name: '德业股份', turnoverRate: 5.0, blockAmount: 0.8, themes: ['储能'] },
                { name: '小崧股份', turnoverRate: 13.7, blockAmount: 0.1, themes: ['储能'] },
                { name: '锦浪科技', turnoverRate: 16.5, blockAmount: 1.0, themes: ['储能'] },
                { name: '科华数据', turnoverRate: 9.7, blockAmount: 0.7, themes: ['储能'] },
                { name: '赣锋锂业', turnoverRate: 11.2, blockAmount: 3.1, themes: ['储能'] }
              ]
            },
            {
              name: 'AI',
              count: 12,
              representativeStocks: [
                { name: '中国高科', turnoverRate: 7.7, blockAmount: 0.2, themes: ['AI'] },
                { name: '德明利', turnoverRate: 9.0, blockAmount: 0.3, themes: ['AI'] },
                { name: '胜宏科技', turnoverRate: 10.2, blockAmount: 10.3, themes: ['AI'] },
                { name: '博实结', turnoverRate: 10.1, blockAmount: 1.3, themes: ['AI'] },
                { name: '方正科技', turnoverRate: 14.0, blockAmount: 1.1, themes: ['AI'] }
              ]
            },
            {
              name: '国企改革',
              count: 9,
              representativeStocks: [
                { name: '厦钨新能', turnoverRate: 4.7, blockAmount: 0.6, themes: ['国企改革'] },
                { name: '方正科技', turnoverRate: 14.0, blockAmount: 1.1, themes: ['国企改革'] },
                { name: '风华高科', turnoverRate: 6.0, blockAmount: 0.9, themes: ['国企改革'] },
                { name: '大东南', turnoverRate: 26.5, blockAmount: 0.8, themes: ['国企改革'] },
                { name: '*ST中基', turnoverRate: 2.5, blockAmount: 0.1, themes: ['国企改革'] }
              ]
            },
            {
              name: '汽车',
              count: 8,
              representativeStocks: [
                { name: '风华高科', turnoverRate: 6.0, blockAmount: 0.9, themes: ['汽车'] },
                { name: '均胜电子', turnoverRate: 9.0, blockAmount: 0.9, themes: ['汽车'] },
                { name: '兴业科技', turnoverRate: 4.4, blockAmount: 1.3, themes: ['汽车'] },
                { name: '横河精密', turnoverRate: 18.6, blockAmount: 0.5, themes: ['汽车'] },
                { name: '*ST原尚', turnoverRate: 1.7, blockAmount: 0.1, themes: ['汽车'] }
              ]
            },
            {
              name: '人形机器人',
              count: 7,
              representativeStocks: [
                { name: '晶华新材', turnoverRate: 4.7, blockAmount: 0.0, themes: ['人形机器人'] },
                { name: '胜宏科技', turnoverRate: 10.2, blockAmount: 10.3, themes: ['人形机器人'] },
                { name: '卧龙电驱', turnoverRate: 18.3, blockAmount: 3.9, themes: ['人形机器人'] },
                { name: '东山精密', turnoverRate: 6.5, blockAmount: 2.0, themes: ['人形机器人'] },
                { name: '均胜电子', turnoverRate: 9.0, blockAmount: 0.9, themes: ['人形机器人'] }
              ]
            },
            {
              name: '光伏',
              count: 7,
              representativeStocks: [
                { name: '大东南', turnoverRate: 26.5, blockAmount: 0.8, themes: ['光伏'] },
                { name: '华通线缆', turnoverRate: 2.7, blockAmount: 0.7, themes: ['光伏'] },
                { name: '露笑科技', turnoverRate: 16.8, blockAmount: 1.9, themes: ['光伏'] },
                { name: '*ST沐邦', turnoverRate: 4.7, blockAmount: 0.2, themes: ['光伏'] },
                { name: 'ST长园', turnoverRate: 1.9, blockAmount: 0.2, themes: ['光伏'] }
              ]
            },
            {
              name: '风电',
              count: 7,
              representativeStocks: [
                { name: '大金重工', turnoverRate: 6.3, blockAmount: 1.9, themes: ['风电'] },
                { name: '明阳智能', turnoverRate: 5.1, blockAmount: 0.3, themes: ['风电'] },
                { name: '*ST华嵘', turnoverRate: 3.1, blockAmount: 0.0, themes: ['风电'] },
                { name: '国机精工', turnoverRate: 4.8, blockAmount: 1.1, themes: ['风电'] },
                { name: '金风科技', turnoverRate: 5.0, blockAmount: 1.3, themes: ['风电'] }
              ]
            },
            {
              name: '材料',
              count: 7,
              representativeStocks: [
                { name: '洁美科技', turnoverRate: 3.1, blockAmount: 0.2, themes: ['材料'] },
                { name: '晶华新材', turnoverRate: 4.7, blockAmount: 0.0, themes: ['材料'] },
                { name: '恒勃股份', turnoverRate: 25.2, blockAmount: 0.3, themes: ['材料'] },
                { name: '尚太科技', turnoverRate: 10.3, blockAmount: 1.1, themes: ['材料'] },
                { name: '横河精密', turnoverRate: 18.6, blockAmount: 0.5, themes: ['材料'] }
              ]
            }
          ],
          strongStocks: [
            { name: '锦浪科技', turnoverRate: 16.5, blockAmount: 1.0, themes: ['逆变器', '储能', '半年报增长'] },
            { name: '卧龙电驱', turnoverRate: 18.3, blockAmount: 3.9, themes: ['H股备案', '人形机器人', '电机龙头', '业绩超预期'] },
            { name: '先导智能', turnoverRate: 19.9, blockAmount: 6.6, themes: ['固态电池', '锂电设备', '半年报增长', '全球化'] }
          ],
          marketDistribution: {
            hs: 85,
            gem: 10,
            star: 7
          },
          investmentAdvice: [
            '关注热点题材中的龙头股',
            '重点关注强势股的后续表现',
            '注意连板率，判断市场情绪强弱',
            '结合基本面选择优质标的'
          ]
        }

        setAnalysisData(mockAnalysisData)
        setLoading(false)
      } catch (error) {
        console.error('获取A股数据失败:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-theme-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="text-theme-secondary">数据加载中...</span>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'market-overview', title: '市场概览' },
    { id: 'hot-topics', title: '热点题材' },
    { id: 'strong-stocks', title: '强势股' },
    { id: 'market-distribution', title: '市场分布' },
    { id: 'investment-advice', title: '投资建议' }
  ]

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="chart" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-theme-primary">
                  A股智能分析
                </h1>
                <p className="text-theme-secondary mt-1 text-lg">
                  实时监控市场风口和强势股表现
                </p>
                {analysisData && (
                  <p className="text-theme-tertiary text-sm">
                    数据日期: {analysisData.date}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-theme-on-surface-1 rounded-2xl shadow-sm border border-theme-stroke p-2">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-orange-700 text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-on-surface-2'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* 内容区域 */}
      {analysisData && (
        <>
          {activeTab === 'market-overview' && <MarketOverview data={analysisData.marketOverview} />}
          {activeTab === 'hot-topics' && <HotTopics data={analysisData.hotTopics} />}
          {activeTab === 'strong-stocks' && <StrongStocks data={analysisData.strongStocks} />}
          {activeTab === 'market-distribution' && <MarketDistribution data={analysisData.marketDistribution} />}
          {activeTab === 'investment-advice' && <InvestmentAdvice data={analysisData.investmentAdvice} />}
        </>
      )}
    </div>
  )
}

export default AISharesAnalysis