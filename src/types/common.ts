// 通用类型定义

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BaseUser {
  id: string
  email: string
  name: string
  phone?: string
  emailVerified: boolean
  twoFactorEnabled: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export type SortDirection = 'asc' | 'desc'
export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
export type Currency = 'CNY' | 'USD' | 'HKD'
export type MarketType = 'A_STOCK' | 'US_STOCK' | 'HK_STOCK' | 'FUND'
export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' | 'MERGER' | 'BONUS' | 'TRANSFER_IN' | 'TRANSFER_OUT'

// 主题相关
export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  danger: string
  warning: string
  info: string
}

// 表单相关
export interface FormFieldError {
  message: string
  type: string
}

export interface FormState {
  isSubmitting: boolean
  errors: Record<string, FormFieldError>
  touched: Record<string, boolean>
}

// 图表相关
export interface ChartDataPoint {
  x: string | number
  y: number
  name?: string
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter'
  title?: string
  subtitle?: string
  xAxis?: string
  yAxis?: string
  colors?: string[]
}

// 通知相关
export interface NotificationOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// 搜索相关
export interface SearchFilters {
  query?: string
  market?: MarketType
  sector?: string
  industry?: string
  priceRange?: [number, number]
  marketCapRange?: [number, number]
}

export interface SearchResult<T> {
  items: T[]
  total: number
  suggestions?: string[]
  hasMore: boolean
}

// 导入导出相关
export interface ImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  fields?: string[]
  dateRange?: [string, string]
  includeHeaders?: boolean
}