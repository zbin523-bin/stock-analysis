import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChartBarIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

import { portfolioService, marketService, accountService } from '@/services/api'
import { PortfolioSummary, MarketStats, AccountSummary } from '@/types/portfolio'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/ui/StatsCard'
import { LineChart, PieChart, BarChart } from '@/components/ui/Charts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { usePortfolioStore } from '@/stores/portfolioStore'

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { setSelectedPortfolioId, selectedPortfolioId } = usePortfolioStore()

  // 获取投资组合汇总数据
  const {
    data: portfolioSummary,
    isLoading: isLoadingPortfolio,
    refetch: refetchPortfolio
  } = useQuery({
    queryKey: ['portfolioSummary', selectedPortfolioId, selectedPeriod],
    queryFn: () => portfolioService.getPortfolioSummary(selectedPortfolioId || undefined),
    refetchInterval: 30000, // 30秒刷新一次
  })

  // 获取市场统计数据
  const {
    data: marketStats,
    isLoading: isLoadingMarket,
    refetch: refetchMarket
  } = useQuery({
    queryKey: ['marketStats'],
    queryFn: () => marketService.getMarketStats(),
    refetchInterval: 60000, // 1分钟刷新一次
  })

  // 获取账户汇总数据
  const {
    data: accountSummary,
    isLoading: isLoadingAccount,
    refetch: refetchAccount
  } = useQuery({
    queryKey: ['accountSummary'],
    queryFn: () => accountService.getAccountSummary(),
    refetchInterval: 30000, // 30秒刷新一次
  })

  // 获取盈亏统计
  const {
    data: profitStats,
    isLoading: isLoadingProfit,
    refetch: refetchProfit
  } = useQuery({
    queryKey: ['profitStats', selectedPortfolioId, selectedPeriod],
    queryFn: () => portfolioService.getProfitStats(selectedPortfolioId || undefined, selectedPeriod),
    refetchInterval: 30000,
  })

  // 获取资产分布
  const {
    data: assetDistribution,
    isLoading: isLoadingDistribution,
    refetch: refetchDistribution
  } = useQuery({
    queryKey: ['assetDistribution', selectedPortfolioId],
    queryFn: () => portfolioService.getAssetDistribution(selectedPortfolioId || undefined),
    refetchInterval: 60000,
  })

  // 手动刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchPortfolio(),
        refetchMarket(),
        refetchAccount(),
        refetchProfit(),
        refetchDistribution()
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  // 格式化货币
  const formatCurrency = (amount: number, currency = 'CNY') => {
    const symbols = { CNY: '¥', USD: '$', HKD: 'HK$' }
    return `${symbols[currency as keyof typeof symbols] || '¥'}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }

  // 格式化百分比
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // 获取盈亏颜色
  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-success-600'
    if (value < 0) return 'text-danger-600'
    return 'text-gray-600'
  }

  // 获取盈亏背景色
  const getProfitBgColor = (value: number) => {
    if (value > 0) return 'bg-success-50 border-success-200'
    if (value < 0) return 'bg-danger-50 border-danger-200'
    return 'bg-gray-50 border-gray-200'
  }

  const isLoading = isLoadingPortfolio || isLoadingMarket || isLoadingAccount || isLoadingProfit || isLoadingDistribution

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载仪表板数据..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投资仪表板</h1>
          <p className="text-gray-500">全面掌握您的投资组合表现</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* 时间段选择 */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {[
              { value: 'day', label: '今日' },
              { value: 'week', label: '本周' },
              { value: 'month', label: '本月' },
              { value: 'year', label: '本年' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* 刷新按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={isRefreshing ? undefined : ArrowPathIcon}
          >
            {isRefreshing ? '刷新中...' : '刷新'}
          </Button>
        </div>
      </div>

      {/* 主要统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总资产"
          value={formatCurrency(portfolioSummary?.totalAssets || 0)}
          icon={CurrencyDollarIcon}
          trend={profitStats?.totalProfitRate || 0}
          format="currency"
        />

        <StatsCard
          title="累计盈亏"
          value={formatCurrency(profitStats?.totalProfit || 0)}
          icon={TrendingUpIcon}
          trend={profitStats?.totalProfitRate || 0}
          format="currency"
        />

        <StatsCard
          title={`${selectedPeriod === 'day' ? '今日' : selectedPeriod === 'week' ? '本周' : selectedPeriod === 'month' ? '本月' : '本年'}盈亏`}
          value={formatCurrency(
            selectedPeriod === 'day' ? profitStats?.todayProfit || 0 :
            selectedPeriod === 'week' ? profitStats?.weeklyProfit || 0 :
            selectedPeriod === 'month' ? profitStats?.monthlyProfit || 0 :
            profitStats?.yearlyProfit || 0
          )}
          icon={selectedPeriod === 'day' ? TrendingDownIcon : TrendingUpIcon}
          trend={
            selectedPeriod === 'day' ? profitStats?.todayProfitRate || 0 :
            selectedPeriod === 'week' ? profitStats?.weeklyProfitRate || 0 :
            selectedPeriod === 'month' ? profitStats?.monthlyProfitRate || 0 :
            profitStats?.yearlyProfitRate || 0
          }
          format="currency"
        />

        <StatsCard
          title="总市值"
          value={formatCurrency(portfolioSummary?.totalValue || 0)}
          icon={BriefcaseIcon}
          trend={((portfolioSummary?.totalValue || 0) / (portfolioSummary?.totalInvested || 1) - 1) * 100}
          format="currency"
        />
      </div>

      {/* 资产分布和持仓分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 资产分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-primary-600" />
              <span>资产分布</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {assetDistribution && assetDistribution.length > 0 ? (
                <PieChart
                  data={assetDistribution.map(item => ({
                    name: item.market,
                    value: item.value,
                    percentage: item.percentage
                  }))}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  暂无资产分布数据
                </div>
              )}
            </div>

            {/* 资产分布详情 */}
            {assetDistribution && assetDistribution.length > 0 && (
              <div className="mt-4 space-y-2">
                {assetDistribution.map((item, index) => (
                  <div key={item.market} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: [
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                          ][index % 5]
                        }}
                      />
                      <span className="font-medium">{item.market}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.value)}</div>
                      <div className="text-gray-500">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 账户余额 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BanknotesIcon className="h-5 w-5 text-primary-600" />
              <span>账户余额</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 总现金 */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-blue-600 font-medium">总现金</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(accountSummary?.totalBalance || 0)}
                  </div>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
              </div>

              {/* 货币分布 */}
              {accountSummary?.currencyDistribution && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">货币分布</h4>
                  {accountSummary.currencyDistribution.map((currency) => (
                    <div key={currency.currency} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{currency.currency}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatCurrency(currency.balance, currency.currency)}
                        </div>
                        <div className="text-xs text-gray-500">{currency.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 账户类型分布 */}
              {accountSummary?.accountTypeDistribution && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">账户类型</h4>
                  <div className="h-40">
                    <PieChart
                      data={accountSummary.accountTypeDistribution.map(item => ({
                        name: item.type,
                        value: item.value,
                        percentage: item.percentage
                      }))}
                      valueFormatter={(value) => formatCurrency(value)}
                      showLabels={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近交易和市场动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近交易 */}
        <Card>
          <CardHeader>
            <CardTitle>最近交易</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioSummary?.recentTransactions && portfolioSummary.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {portfolioSummary.recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'BUY' ? 'bg-green-500' :
                        transaction.type === 'SELL' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{transaction.stock.symbol}</div>
                        <div className="text-xs text-gray-500">
                          {transaction.type === 'BUY' ? '买入' : '卖出'} {transaction.quantity}股
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.transactionDate).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                暂无最近交易记录
              </div>
            )}
          </CardContent>
        </Card>

        {/* 市场动态 */}
        <Card>
          <CardHeader>
            <CardTitle>市场动态</CardTitle>
          </CardHeader>
          <CardContent>
            {marketStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">市场总值</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(marketStats.totalMarketCap)}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">总成交量</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(marketStats.totalVolume)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-green-600">上涨</div>
                    <div className="text-lg font-bold text-green-700">
                      {marketStats.advancingStocks}
                    </div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <div className="text-xs text-red-600">下跌</div>
                    <div className="text-lg font-bold text-red-700">
                      {marketStats.decliningStocks}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600">平盘</div>
                    <div className="text-lg font-bold text-gray-700">
                      {marketStats.unchangedStocks}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">市场情绪</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      marketStats.marketSentiment === 'BULLISH' ? 'bg-green-100 text-green-800' :
                      marketStats.marketSentiment === 'BEARISH' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {marketStats.marketSentiment === 'BULLISH' ? '看涨' :
                       marketStats.marketSentiment === 'BEARISH' ? '看跌' : '中性'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  最后更新: {new Date(marketStats.lastUpdate).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard