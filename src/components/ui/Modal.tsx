import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  showCloseButton?: boolean
  centered?: boolean
  footer?: React.ReactNode
  className?: string
  overlayClassName?: string
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closable = true,
  showCloseButton = true,
  centered = false,
  footer,
  className,
  overlayClassName
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // 保存当前焦点元素
      previousFocusRef.current = document.activeElement as HTMLElement
      // 禁止背景滚动
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      // 恢复焦点
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [open, closable, onClose])

  // 处理点击背景关闭
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closable) {
      onClose()
    }
  }

  // 尺寸配置
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  const panelClasses = {
    sm: 'relative w-full bg-white rounded-lg shadow-xl',
    md: 'relative w-full bg-white rounded-lg shadow-xl',
    lg: 'relative w-full bg-white rounded-lg shadow-xl',
    xl: 'relative w-full bg-white rounded-lg shadow-xl',
    full: 'relative w-full bg-white rounded-lg shadow-xl'
  }

  if (!open) return null

  const modalContent = (
    <div
      className={clsx(
        'fixed inset-0 z-50 overflow-y-auto',
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(
          'flex min-h-full items-center justify-center p-4',
          centered ? 'items-center' : 'items-start pt-16'
        )}
      >
        <div
          ref={modalRef}
          className={clsx(
            panelClasses[size],
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* 头部 */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              {title && (
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && closable && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors p-1"
                  onClick={onClose}
                  aria-label="关闭"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* 内容 */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* 底部 */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // 使用Portal渲染到body
  return createPortal(modalContent, document.body)
}

// 确认对话框
export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  content: React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger' | 'warning'
  loading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = '确认操作',
  content,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary',
  loading = false
}) => {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading || loading}
        className={clsx(
          'px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          confirmVariant === 'danger' && 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500',
          confirmVariant === 'warning' && 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
          confirmVariant === 'primary' && 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
        )}
      >
        {isLoading || loading ? '处理中...' : confirmText}
      </button>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
    >
      <div className="text-gray-600">
        {content}
      </div>
    </Modal>
  )
}

// 对话框Hook
export const useDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    open,
    close
  }
}

export default Modal