'use client'

import React from 'react'
import Layout from '@/components/Layout'
import AISharesAnalysis from '@/components/AISharesAnalysis'

const AISharesAnalysisPage: React.FC = () => {
  return (
    <Layout title="A股分析">
      <AISharesAnalysis />
    </Layout>
  )
}

export default AISharesAnalysisPage