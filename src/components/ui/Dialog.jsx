import React, { useEffect } from 'react'
import { cn } from '../../utils/cn'

export function Dialog({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  size = 'md',
  children,
}) {
  const isActualOpen = open !== undefined ? open : isOpen
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false)
    if (onClose) onClose()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isActualOpen) {
        handleClose()
      }
    }
    if (isActualOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActualOpen])

  if (!isActualOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in cursor-pointer"
        onClick={handleClose}
      />
      {/* Dialog content wrapper */}
      <div className={cn("relative z-50 w-full animate-in zoom-in-95 duration-200", sizeClasses[size] || sizeClasses.md)}>
        {title ? (
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{title}</DialogTitle>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground text-sm cursor-pointer p-1 rounded-md"
                >
                  ✕
                </button>
              </div>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {children}
          </DialogContent>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'relative w-full max-h-[90vh] max-h-[90dvh] flex flex-col rounded-xl border border-border bg-card p-6 shadow-floating text-card-foreground overflow-y-auto overscroll-contain',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left pb-4 border-b border-border sticky top-0 bg-card z-10 shrink-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

export function DialogDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-border mt-auto sticky bottom-0 bg-card z-10 shrink-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}
