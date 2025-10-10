import React, { useState } from 'react'
import { clsx } from 'clsx'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export interface Column<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  className?: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  empty?: React.ReactNode
  rowKey?: string | ((record: T) => string)
  selectable?: boolean
  selectedRowKeys?: string[]
  onSelectionChange?: (selectedRowKeys: string[], selectedRows: T[]) => void
  pagination?: {
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
    onChange?: (page: number, pageSize: number) => void
  }
  search?: {
    placeholder?: string
    onSearch: (value: string) => void
  }
  className?: string
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  size?: 'small' | 'middle' | 'large'
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  empty,
  rowKey = 'id',
  selectable = false,
  selectedRowKeys = [],
  onSelectionChange,
  pagination,
  search,
  className,
  striped = false,
  hoverable = true,
  bordered = false,
  size = 'middle'
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T
    direction: 'asc' | 'desc'
  } | null>(null)
  const [searchValue, setSearchValue] = useState('')

  // 排序处理
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 获取排序后的数据
  const getSortedData = () => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // 获取筛选后的数据
  const getFilteredData = () => {
    if (!searchValue) return getSortedData()

    return getSortedData().filter(record =>
      columns.some(column => {
        const value = record[column.key]
        return value && value.toString().toLowerCase().includes(searchValue.toLowerCase())
      })
    )
  }

  // 选择处理
  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      const keys = checked ? data.map(record => getRowKey(record)) : []
      onSelectionChange(keys, checked ? data : [])
    }
  }

  const handleSelectRow = (checked: boolean, record: T) => {
    if (onSelectionChange) {
      const key = getRowKey(record)
      const newSelectedKeys = checked
        ? [...selectedRowKeys, key]
        : selectedRowKeys.filter(k => k !== key)
      const newSelectedRows = data.filter(r => newSelectedKeys.includes(getRowKey(r)))
      onSelectionChange(newSelectedKeys, newSelectedRows)
    }
  }

  const getRowKey = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return record[rowKey] as string
  }

  const filteredData = getFilteredData()
  const isAllSelected = data.length > 0 && selectedRowKeys.length === data.length
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length

  // 尺寸样式
  const sizeClasses = {
    small: 'text-xs',
    middle: 'text-sm',
    large: 'text-base'
  }

  const paddingClasses = {
    small: 'px-2 py-1',
    middle: 'px-4 py-2',
    large: 'px-6 py-3'
  }

  // 渲染表格头部
  const renderTableHead = () => (
    <thead className={clsx(
      'bg-gray-50',
      sizeClasses[size],
      striped && 'bg-gray-50'
    )}>
      <tr>
        {selectable && (
          <th className={clsx(
            paddingClasses[size],
            'text-left font-medium text-gray-500 uppercase tracking-wider',
            bordered && 'border-b border-gray-200'
          )}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={String(column.key)}
            className={clsx(
              paddingClasses[size],
              'font-medium text-gray-500 uppercase tracking-wider',
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              bordered && 'border-b border-gray-200',
              column.sortable && 'cursor-pointer hover:bg-gray-100'
            )}
            style={{ width: column.width }}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center gap-1">
              {column.title}
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUpIcon
                    className={clsx(
                      'w-3 h-3',
                      sortConfig?.key === column.key && sortConfig.direction === 'asc'
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    )}
                  />
                  <ChevronDownIcon
                    className={clsx(
                      'w-3 h-3 -mt-1',
                      sortConfig?.key === column.key && sortConfig.direction === 'desc'
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    )}
                  />
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )

  // 渲染表格内容
  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              {selectable && (
                <td className={clsx(paddingClasses[size], bordered && 'border-b border-gray-200')}>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={clsx(
                    paddingClasses[size],
                    bordered && 'border-b border-gray-200',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  <div className="h-4 bg-gray-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      )
    }

    if (filteredData.length === 0) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              className={clsx(
                paddingClasses[size],
                'text-center text-gray-500',
                bordered && 'border-b border-gray-200'
              )}
            >
              {empty || (
                <div className="py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p>暂无数据</p>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody>
        {filteredData.map((record, index) => {
          const isSelected = selectedRowKeys.includes(getRowKey(record))
          const rowClasses = clsx(
            hoverable && 'hover:bg-gray-50',
            striped && index % 2 === 1 && 'bg-gray-50',
            isSelected && 'bg-primary-50'
          )

          return (
            <tr key={getRowKey(record)} className={rowClasses}>
              {selectable && (
                <td className={clsx(
                  paddingClasses[size],
                  bordered && 'border-b border-gray-200'
                )}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectRow(e.target.checked, record)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={clsx(
                    paddingClasses[size],
                    column.className,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    bordered && 'border-b border-gray-200'
                  )}
                >
                  {column.render
                    ? column.render(record[column.key], record, index)
                    : record[column.key]}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    )
  }

  // 渲染分页
  const renderPagination = () => {
    if (!pagination) return null

    const { current, pageSize, total, showSizeChanger, showQuickJumper, onChange } = pagination
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (current - 1) * pageSize + 1
    const endIndex = Math.min(current * pageSize, total)

    return (
      <div className={clsx(
        'flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200',
        sizeClasses[size]
      )}>
        <div className="text-sm text-gray-700">
          显示第 {startIndex}-{endIndex} 条，共 {total} 条记录
        </div>

        <div className="flex items-center space-x-4">
          {showSizeChanger && (
            <select
              value={pageSize}
              onChange={(e) => onChange?.(1, Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={10}>10 条/页</option>
              <option value={20}>20 条/页</option>
              <option value={50}>50 条/页</option>
              <option value={100}>100 条/页</option>
            </select>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onChange?.(Math.max(1, current - 1), pageSize)}
              disabled={current === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {showQuickJumper && (
              <span className="text-sm text-gray-700">
                第
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={current}
                  onChange={(e) => {
                    const page = Number(e.target.value)
                    if (page >= 1 && page <= totalPages) {
                      onChange?.(page, pageSize)
                    }
                  }}
                  className="w-16 mx-1 text-center border border-gray-300 rounded px-1 py-0.5"
                />
                / {totalPages} 页
              </span>
            )}

            <button
              onClick={() => onChange?.(Math.min(totalPages, current + 1), pageSize)}
              disabled={current === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow overflow-hidden', className)}>
      {search && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={search.placeholder || '搜索...'}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                search.onSearch?.(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {renderTableHead()}
          {renderTableBody()}
        </table>
      </div>

      {renderPagination()}
    </div>
  )
}

export default Table