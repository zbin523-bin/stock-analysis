import React from 'react'

const Watchlist: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">自选股</h1>
        <p className="text-gray-500">管理您的自选股列表</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p>自选股功能正在开发中...</p>
        </div>
      </div>
    </div>
  )
}

export default Watchlist