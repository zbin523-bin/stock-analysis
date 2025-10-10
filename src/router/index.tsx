import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// 懒加载页面组件
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const PortfolioList = lazy(() => import('@/pages/portfolio/PortfolioList'))
const PortfolioDetail = lazy(() => import('@/pages/portfolio/PortfolioDetail'))
const TransactionList = lazy(() => import('@/pages/transactions/TransactionList'))
const StockSearch = lazy(() => import('@/pages/stocks/StockSearch'))
const Watchlist = lazy(() => import('@/pages/stocks/Watchlist'))
const MarketData = lazy(() => import('@/pages/market/MarketData'))
const Accounts = lazy(() => import('@/pages/accounts/Accounts'))
const Settings = lazy(() => import('@/pages/Settings'))

// 加载组件
const PageLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="加载页面中..." />
  </div>
)

// 错误边界组件
const ErrorBoundary: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">页面加载失败</h1>
      <p className="text-gray-600 mb-4">
        {error?.message || '页面加载时发生未知错误'}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        刷新页面
      </button>
    </div>
  </div>
)

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'portfolio',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoading />}>
                <PortfolioList />
              </Suspense>
            )
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<PageLoading />}>
                <PortfolioDetail />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'transactions',
        element: (
          <Suspense fallback={<PageLoading />}>
            <TransactionList />
          </Suspense>
        )
      },
      {
        path: 'stocks',
        children: [
          {
            path: 'search',
            element: (
              <Suspense fallback={<PageLoading />}>
                <StockSearch />
              </Suspense>
            )
          },
          {
            path: 'watchlist',
            element: (
              <Suspense fallback={<PageLoading />}>
                <Watchlist />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'market',
        element: (
          <Suspense fallback={<PageLoading />}>
            <MarketData />
          </Suspense>
        )
      },
      {
        path: 'accounts',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Accounts />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoading />}>
            <Settings />
          </Suspense>
        )
      }
    ]
  }
])

// 路由提供者组件
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default AppRouter