import React from 'react'
import { cn } from '../../utils/cn'

export function Table({ className, children, ...props }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('[&_tr]:border-b border-border bg-muted/40', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0 divide-y divide-border/60', className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn(
        'p-4 align-middle text-sm [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}
