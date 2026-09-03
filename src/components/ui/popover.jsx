import * as React from 'react'
import { cn } from '../../lib/utils'

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const Popover = ({ open: controlledOpen, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback((val) => {
    if (!isControlled) setUncontrolledOpen(val)
    if (onOpenChange) onOpenChange(val)
  }, [isControlled, onOpenChange])

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = ({ asChild, children, className, ...props }) => {
  const { open, setOpen } = React.useContext(PopoverContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e)
        setOpen(!open)
      },
      'aria-expanded': open,
      ...props,
    })
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className={cn('inline-flex items-center cursor-pointer', className)}
      {...props}
    >
      {children}
    </button>
  )
}

const PopoverContent = React.forwardRef(
  ({ className, align = 'center', sideOffset = 8, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(PopoverContext)
    const contentRef = React.useRef(null)

    React.useEffect(() => {
      if (!open) return
      const handleOutsideClick = (e) => {
        if (contentRef.current && !contentRef.current.contains(e.target)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [open, setOpen])

    if (!open) return null

    const alignClass =
      align === 'end' ? 'right-0' : align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2'

    return (
      <div
        ref={(el) => {
          contentRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        style={{ marginTop: `${sideOffset}px` }}
        className={cn(
          'absolute z-50 w-72 rounded-2xl border border-border/80 bg-popover p-4 text-popover-foreground shadow-2xl outline-none animate-in fade-in-0 zoom-in-95',
          alignClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }
