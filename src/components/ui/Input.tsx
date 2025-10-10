import React, { forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      leftIcon,
      rightIcon,
      containerClassName,
      showPasswordToggle,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const actualType = showPasswordToggle && type === 'password'
      ? showPassword ? 'text' : 'password'
      : type

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium mb-2',
              error ? 'text-danger-600' : 'text-gray-700'
            )}
          >
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* 左侧图标 */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-5 h-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={clsx(
              'block w-full rounded-lg border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
              leftIcon && 'pl-10',
              rightIcon || showPasswordToggle ? 'pr-10' : 'pr-3',
              error
                ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:ring-danger-500 focus:border-danger-500'
                : isFocused
                ? 'border-primary-300 text-primary-900 placeholder-primary-400 focus:ring-primary-500 focus:border-primary-500'
                : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
              props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {/* 右侧图标 */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  onClick={togglePassword}
                  className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none mr-2"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              ) : (
                rightIcon && (
                  <div className="mr-3 pointer-events-none">
                    <div className="w-5 h-5 text-gray-400">
                      {rightIcon}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* 错误图标 */}
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon className="w-5 h-5 text-danger-500" />
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <p className="mt-2 text-sm text-danger-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}

        {/* 帮助文本 */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500" id={`${inputId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// 文本域组件
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  containerClassName?: string
  rows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      containerClassName,
      rows = 4,
      resize = 'vertical',
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className={clsx(
              'block text-sm font-medium mb-2',
              error ? 'text-danger-600' : 'text-gray-700'
            )}
          >
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={clsx(
            'block w-full rounded-lg border shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors resize-' + resize,
            error
              ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:ring-danger-500 focus:border-danger-500'
              : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
            props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
          {...props}
        />

        {/* 错误信息 */}
        {error && (
          <p className="mt-2 text-sm text-danger-600" id={`${textareaId}-error`}>
            {error}
          </p>
        )}

        {/* 帮助文本 */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500" id={`${textareaId}-description`}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// 搜索框组件
export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (value: string) => void
  onClear?: () => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onClear,
  value = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    props.onChange?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch?.(internalValue)
    }
  }

  const handleClear = () => {
    setInternalValue('')
    onClear?.()
    props.onChange?.({ target: { value: '' } } as any)
  }

  return (
    <Input
      {...props}
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="搜索..."
      leftIcon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      rightIcon={
        internalValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null
      }
    />
  )
}

export default Input