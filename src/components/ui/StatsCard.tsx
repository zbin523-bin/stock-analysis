import React from 'react'
import { clsx } from 'clsx'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ChartBarIcon,
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'

export interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ComponentType<any>
  trend?: number
  format?: 'currency' | 'percentage' | 'number'
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  description?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  format = 'number',
  color = 'primary',
  size = 'md',
  className,
  description
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
      case 'percentage':
        return `${val.toFixed(2)}%`
      case 'number':
      default:
        return val.toLocaleString('zh-CN')
    }
  }

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return null
    return trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-gray-500'
    return trend > 0 ? 'text-success-600' : 'text-danger-600'
  }

  const getTrendBgColor = () => {
    if (trend === undefined || trend === 0) return 'bg-gray-100 text-gray-600'
    return trend > 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
  }

  const getColorClasses = () => {
    const colorMap = {
      primary: {
        bg: 'bg-primary-50',
        text: 'text-primary-600',
        border: 'border-primary-200'
      },
      success: {
        bg: 'bg-success-50',
        text: 'text-success-600',
        border: 'border-success-200'
      },
      danger: {
        bg: 'bg-danger-50',
        text: 'text-danger-600',
        border: 'border-danger-200'
      },
      warning: {
        bg: 'bg-warning-50',
        text: 'text-warning-600',
        border: 'border-warning-200'
      },
      info: {
        bg: 'bg-info-50',
        text: 'text-info-600',
        border: 'border-info-200'
      }
    }
    return colorMap[color]
  }

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const titleSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const TrendIcon = getTrendIcon()
  const colorClasses = getColorClasses()

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md',
      sizeClasses[size],
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={clsx(
            'font-medium text-gray-600 mb-1',
            titleSizeClasses[size]
          )}>
            {title}
          </div>

          <div className={clsx(
            'font-bold text-gray-900 mb-2',
            valueSizeClasses[size]
          )}>
            {formatValue(value)}
          </div>

          {/* 趋势指标 */}
          {trend !== undefined && (
            <div className="flex items-center space-x-2">
              {TrendIcon && (
                <div className={clsx(
                  'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                  getTrendBgColor()
                )}>
                  <TrendIcon className="w-3 h-3" />
                  <span>
                    {trend > 0 ? '+' : ''}{trend.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 描述文本 */}
          {description && (
            <div className="text-xs text-gray-500 mt-2">
              {description}
            </div>
          )}
        </div>

        {/* 图标 */}
        {Icon && (
          <div className={clsx(
            'flex-shrink-0 p-3 rounded-lg',
            colorClasses.bg,
            colorClasses.text
          )}>
            <Icon className={clsx(
              size === 'sm' ? 'h-5 w-5' :
              size === 'md' ? 'h-6 w-6' :
              'h-8 w-8'
            )} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard