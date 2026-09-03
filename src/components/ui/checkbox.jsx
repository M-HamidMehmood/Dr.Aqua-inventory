import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

const Checkbox = React.forwardRef(({ className, checked, onChange, disabled, id, ...props }, ref) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center justify-center cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        type="checkbox"
        id={id}
        ref={ref}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          'h-4 w-4 shrink-0 rounded border transition-all flex items-center justify-center',
          checked
            ? 'bg-primary border-primary text-primary-foreground shadow-xs'
            : 'border-input bg-background hover:bg-muted/50',
          disabled && 'cursor-not-allowed',
          className
        )}
      >
        {checked && <Check className="h-3 w-3 stroke-[3]" />}
      </div>
    </label>
  )
})
Checkbox.displayName = 'Checkbox'

export { Checkbox }
