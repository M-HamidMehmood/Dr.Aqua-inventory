import React from 'react'
import { cn } from '../../utils/cn'

const buttonVariants = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.98]',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm active:scale-[0.98]',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm active:scale-[0.98]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
  ghost:
    'hover:bg-accent hover:text-accent-foreground',
  link:
    'text-primary underline-offset-4 hover:underline',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]',
}

const buttonSizes = {
  default: 'h-9 px-4 py-2 text-sm',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-11 rounded-lg px-8 text-base font-semibold',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-7 w-7 p-0',
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
