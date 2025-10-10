import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import {
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  className?: string
}

interface HeaderStats {
  totalAssets: number
  totalProfit: number
  todayProfit: number
  profitRate: number
  marketStatus: 'up' | 'down' | 'flat'
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [stats, setStats] = useState<HeaderStats>({
    totalAssets: 100000,
    totalProfit: 23450,
    todayProfit: 856,
    profitRate: 23.45,
    marketStatus: 'up'
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 模拟数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟实时数据更新
      const variation = (Math.random() - 0.5) * 100
      setStats(prev => ({
        ...prev,
        todayProfit: prev.todayProfit + variation,
        totalProfit: prev.totalProfit + variation * 0.5,
        profitRate: ((prev.totalProfit + variation * 0.5) / prev.totalAssets) * 100,
        marketStatus: variation > 0 ? 'up' : variation < 0 ? 'down' : 'flat'
      }))
      setLastUpdate(new Date())
    }, 5000) // 每5秒更新一次

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number, currency: 'CNY' | 'USD' | 'HKD' = 'CNY') => {
    const symbols = {
      CNY: '¥',
      USD: '$',
      HKD: 'HK$'
    }
    return `${symbols[currency]}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-success-600'
    if (value < 0) return 'text-danger-600'
    return 'text-gray-600'
  }

  const getProfitBgColor = (value: number) => {
    if (value > 0) return 'bg-success-50 text-success-600 border-success-200'
    if (value < 0) return 'bg-danger-50 text-danger-600 border-danger-200'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <header className={clsx('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className="container-responsive px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧Logo和标题 */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">股票投资组合</h1>
              <p className="text-sm text-gray-500">智能投资管理系统</p>
            </div>
          </div>

          {/* 中间统计数据 - 桌面端显示 */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* 总资产 */}
            <div className="text-center">
              <p className="text-sm text-gray-500">总资产</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(stats.totalAssets)}
              </p>
            </div>

            {/* 累计盈亏 */}
            <div className="text-center">
              <p className="text-sm text-gray-500">累计盈亏</p>
              <div className="flex items-center space-x-1">
                <p className={clsx('text-lg font-semibold', getProfitColor(stats.totalProfit))}>
                  {formatCurrency(stats.totalProfit)}
                </p>
                {stats.totalProfit !== 0 && (
                  <div className={clsx('p-1 rounded-full', getProfitBgColor(stats.totalProfit))}>
                    {stats.totalProfit > 0 ? (
                      <ArrowTrendingUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-3 h-3" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 今日盈亏 */}
            <div className="text-center">
              <p className="text-sm text-gray-500">今日盈亏</p>
              <div className="flex items-center space-x-1">
                <p className={clsx('text-lg font-semibold', getProfitColor(stats.todayProfit))}>
                  {formatCurrency(stats.todayProfit)}
                </p>
                <div className={clsx('text-xs px-2 py-1 rounded-full', getProfitBgColor(stats.todayProfit))}>
                  {formatPercentage(stats.todayProfit / (stats.totalAssets * 0.01))}
                </div>
              </div>
            </div>

            {/* 收益率 */}
            <div className="text-center">
              <p className="text-sm text-gray-500">收益率</p>
              <p className={clsx('text-lg font-semibold', getProfitColor(stats.profitRate))}>
                {formatPercentage(stats.profitRate)}
              </p>
            </div>

            {/* 市场状态 */}
            <div className="flex items-center space-x-2">
              <div className={clsx(
                'w-3 h-3 rounded-full',
                stats.marketStatus === 'up' ? 'bg-success-500' :
                stats.marketStatus === 'down' ? 'bg-danger-500' : 'bg-gray-500'
              )} />
              <span className="text-sm text-gray-600">
                {stats.marketStatus === 'up' ? '上涨' :
                 stats.marketStatus === 'down' ? '下跌' : '平盘'}
              </span>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center space-x-4">
            {/* 更新时间 */}
            <div className="hidden sm:flex items-center text-sm text-gray-500">
              <span>更新时间: {lastUpdate.toLocaleTimeString('zh-CN')}</span>
            </div>

            {/* 通知 */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 主题切换 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* 设置 */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 移动端统计数据 - 紧凑显示 */}
        <div className="lg:hidden border-t border-gray-200 px-4 py-2">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">总资产</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(stats.totalAssets)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">今日盈亏</p>
              <p className={clsx('text-sm font-semibold', getProfitColor(stats.todayProfit))}>
                {formatCurrency(stats.todayProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">累计盈亏</p>
              <p className={clsx('text-sm font-semibold', getProfitColor(stats.totalProfit))}>
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">收益率</p>
              <p className={clsx('text-sm font-semibold', getProfitColor(stats.profitRate))}>
                {formatPercentage(stats.profitRate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header