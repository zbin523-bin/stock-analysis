import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  className?: string
  onCollapse?: (collapsed: boolean) => void
}

interface NavigationItem {
  id: string
  title: string
  icon: React.ReactNode
  href: string
  badge?: string | number
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: '仪表板',
    icon: <HomeIcon className="h-5 w-5" />,
    href: '/dashboard'
  },
  {
    id: 'portfolio',
    title: '投资组合',
    icon: <BriefcaseIcon className="h-5 w-5" />,
    href: '/portfolio',
    badge: '3',
    children: [
      {
        id: 'portfolio-list',
        title: '组合列表',
        icon: <ChartBarIcon className="h-4 w-4" />,
        href: '/portfolio/list'
      },
      {
        id: 'portfolio-detail',
        title: '组合详情',
        icon: <DocumentTextIcon className="h-4 w-4" />,
        href: '/portfolio/detail'
      }
    ]
  },
  {
    id: 'transactions',
    title: '交易记录',
    icon: <CurrencyDollarIcon className="h-5 w-5" />,
    href: '/transactions'
  },
  {
    id: 'stocks',
    title: '股票管理',
    icon: <MagnifyingGlassIcon className="h-5 w-5" />,
    href: '/stocks',
    children: [
      {
        id: 'stock-search',
        title: '股票搜索',
        icon: <MagnifyingGlassIcon className="h-4 w-4" />,
        href: '/stocks/search'
      },
      {
        id: 'watchlist',
        title: '自选股',
        icon: <BookmarkIcon className="h-4 w-4" />,
        href: '/stocks/watchlist'
      }
    ]
  },
  {
    id: 'market',
    title: '市场数据',
    icon: <ChartBarIcon className="h-5 w-5" />,
    href: '/market'
  }
]

const Sidebar: React.FC<SidebarProps> = ({ className, onCollapse }) => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 从URL路径确定当前激活的项目
  const getActiveItemId = (items: NavigationItem[], path: string): string => {
    for (const item of items) {
      if (item.href === path) return item.id
      if (item.children) {
        const childId = getActiveItemId(item.children, path)
        if (childId) {
          setExpandedItems(prev => new Set([...prev, item.id]))
          return childId
        }
      }
    }
    return ''
  }

  const activeItemId = getActiveItemId(navigationItems, location.pathname)

  // 处理子项目展开/收起
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // 响应式处理侧边栏折叠
  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 1024
      if (shouldCollapse !== isCollapsed) {
        setIsCollapsed(shouldCollapse)
        onCollapse?.(shouldCollapse)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isCollapsed, onCollapse])

  const renderNavigationItem = (item: NavigationItem, level: number = 1) => {
    const isActive = item.id === activeItemId
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <Link
          to={item.href}
          className={clsx(
            'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            level === 1 ? 'mx-2 my-1' : 'mx-8 my-0.5',
            isActive
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            isCollapsed && level === 1 && 'justify-center px-2'
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="flex-1 truncate">{item.title}</span>
            )}
            {item.badge && !isCollapsed && (
              <span className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {item.badge}
              </span>
            )}
          </div>

          {hasChildren && !isCollapsed && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="ml-auto p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronDownIcon
                className={clsx(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>
          )}
        </Link>

        {/* 渲染子项目 */}
        {hasChildren && isExpanded && (
          <div className={clsx(
            level === 1 && 'ml-6 mt-1',
            level === 2 && 'ml-12'
          )}>
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* 移动端遮罩 */}
      <div
        className={clsx(
          'fixed inset-0 bg-gray-600 bg-opacity-75 z-30 transition-opacity lg:hidden',
          !isCollapsed && 'opacity-100'
        )}
        onClick={() => {
          setIsCollapsed(true)
          onCollapse?.(true)
        }}
      />

      {/* 侧边栏内容 */}
      <div className="flex flex-col h-full">
        {/* Logo区域 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {!isCollapsed && (
              <>
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">股票投资</span>
              </>
            )}
            {isCollapsed && (
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* 折叠按钮 */}
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed)
              onCollapse?.(!isCollapsed)
            }}
            className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            {isCollapsed ? (
              <Bars3Icon className="h-6 w-6" />
            ) : (
              <XMarkIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map(item => renderNavigationItem(item))}
          </ul>
        </nav>

        {/* 底部信息 */}
        <div className="border-t border-gray-200 p-4">
          {!isCollapsed && (
            <div className="text-sm text-gray-500">
              <div className="flex items-center justify-between mb-2">
                <span>系统版本</span>
                <span className="text-gray-400">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>最后更新</span>
                <span className="text-gray-400">刚刚</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar