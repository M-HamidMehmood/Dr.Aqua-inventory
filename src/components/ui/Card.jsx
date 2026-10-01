import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'

export const Card = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-subtle transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = 'Card'

export const CardHeader = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  )
})
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
})
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
})
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
})
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})
CardFooter.displayName = 'CardFooter'
