import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuth } from '@/hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()

  // 暂时直接渲染，不使用认证逻辑
  const isLayoutReady = true

  const handleSidebarCollapse = (collapsed: boolean) => {
    // 可以添加状态管理逻辑
    console.log('Sidebar collapsed:', collapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onCollapse={handleSidebarCollapse} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="container-responsive">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout