import * as React from 'react'
import { cn } from '../../lib/utils'

const DropdownContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const DropdownMenu = ({ open: controlledOpen, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback((val) => {
    if (!isControlled) setUncontrolledOpen(val)
    if (onOpenChange) onOpenChange(val)
  }, [isControlled, onOpenChange])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  )
}

const DropdownMenuTrigger = ({ asChild, children, className, ...props }) => {
  const { open, setOpen } = React.useContext(DropdownContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e)
        setOpen(!open)
      },
      ...props,
    })
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn('inline-flex items-center cursor-pointer', className)}
      {...props}
    >
      {children}
    </button>
  )
}

const DropdownMenuContent = React.forwardRef(
  ({ className, align = 'end', sideOffset = 4, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownContext)
    const menuRef = React.useRef(null)

    React.useEffect(() => {
      if (!open) return
      const handleOutsideClick = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
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
          menuRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        style={{ marginTop: `${sideOffset}px` }}
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/80 bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95',
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
DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef(
  ({ className, disabled, onClick, children, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownContext)

    return (
      <div
        ref={ref}
        role="menuitem"
        onClick={(e) => {
          if (disabled) return
          if (onClick) onClick(e)
          setOpen(false)
        }}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-muted focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuSeparator = ({ className, ...props }) => (
  <div className={cn('-mx-1 my-1 h-px bg-border/60', className)} {...props} />
)
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
