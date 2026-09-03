import * as React from 'react'
import { cn } from '../../lib/utils'

const RadioGroupContext = React.createContext({
  value: undefined,
  onChange: () => {},
  name: undefined,
})

const RadioGroup = React.forwardRef(
  ({ className, value, defaultValue, onChange, name, children, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolledValue

    const handleChange = React.useCallback(
      (val) => {
        if (!isControlled) setUncontrolledValue(val)
        if (onChange) onChange(val)
      },
      [isControlled, onChange]
    )

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onChange: handleChange, name }}>
        <div ref={ref} role="radiogroup" className={cn('grid gap-2', className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef(
  ({ className, value, id, children, disabled, ...props }, ref) => {
    const { value: groupValue, onChange, name } = React.useContext(RadioGroupContext)
    const isChecked = groupValue === value

    return (
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-all select-none',
          isChecked
            ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/30 font-semibold'
            : 'border-border/80 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input
          ref={ref}
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary text-primary transition-colors',
            isChecked ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-transparent'
          )}
        >
          {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
        <div className="flex-1 text-xs">{children}</div>
      </label>
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
