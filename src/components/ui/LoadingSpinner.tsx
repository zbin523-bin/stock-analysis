import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  }

  return (
    <div
      className={`
        inline-block animate-spin rounded-full border-2 border-solid border-current border-t-transparent
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// 全屏加载组件
export const FullScreenLoader: React.FC<{
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ message = '加载中...', size = 'lg' }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// 骨架屏组件
export const SkeletonCard: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      {[...Array(lines - 1)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      ))}
    </div>
  )
}

// 表格骨架屏
export const TableSkeleton: React.FC<{
  rows?: number
  columns?: number
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>

      {/* 表格内容 */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner