import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { LoadingSpinner } from './LoadingSpinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm hover:shadow-md',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm hover:shadow-md',
      warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm hover:shadow-md',
      outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
      ghost: 'bg-transparent border-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      link: 'bg-transparent border-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-primary-500 p-0 h-auto shadow-none'
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }

    const isDisabled = disabled || loading

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} color="white" />
            {children && <span className="ml-2">{children}</span>}
          </>
        )
      }

      if (icon && iconPosition === 'left') {
        return (
          <>
            <span className={clsx(iconSizeClasses[size], 'flex-shrink-0')}>
              {icon}
            </span>
            {children && <span className="ml-2">{children}</span>}
          </>
        )
      }

      if (icon && iconPosition === 'right') {
        return (
          <>
            {children && <span className="mr-2">{children}</span>}
            <span className={clsx(iconSizeClasses[size], 'flex-shrink-0')}>
              {icon}
            </span>
          </>
        )
      }

      return children
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 按钮组合组件
export const ButtonGroup: React.FC<{
  children: React.ReactNode
  className?: string
  vertical?: boolean
}> = ({ children, className = '', vertical = false }) => {
  return (
    <div
      className={clsx(
        'inline-flex',
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
      role="group"
    >
      {children}
    </div>
  )
}

// 常用按钮变体的快捷组件
export const PrimaryButton: React.FC<ButtonProps> = (props) => (
  <Button variant="primary" {...props} />
)

export const SecondaryButton: React.FC<ButtonProps> = (props) => (
  <Button variant="secondary" {...props} />
)

export const SuccessButton: React.FC<ButtonProps> = (props) => (
  <Button variant="success" {...props} />
)

export const DangerButton: React.FC<ButtonProps> = (props) => (
  <Button variant="danger" {...props} />
)

export const WarningButton: React.FC<ButtonProps> = (props) => (
  <Button variant="warning" {...props} />
)

export const OutlineButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outline" {...props} />
)

export const GhostButton: React.FC<ButtonProps> = (props) => (
  <Button variant="ghost" {...props} />
)

export const LinkButton: React.FC<ButtonProps> = (props) => (
  <Button variant="link" {...props} />
)

export default Button