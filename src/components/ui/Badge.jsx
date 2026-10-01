import React from 'react'
import { cn } from '../../utils/cn'

const badgeVariants = {
  default:
    'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
  secondary:
    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive:
    'border-transparent bg-destructive/10 text-destructive border border-destructive/20',
  outline:
    'text-foreground border border-border',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  info:
    'border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  purple:
    'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Badge
