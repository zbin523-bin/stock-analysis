import React from 'react'
import { useParams } from 'react-router-dom'

const PortfolioDetail: React.FC = () => {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投资组合详情</h1>
        <p className="text-gray-500">组合ID: {id}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p>投资组合详情功能正在开发中...</p>
        </div>
      </div>
    </div>
  )
}

export default PortfolioDetail