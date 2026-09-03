import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const SheetContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const Sheet = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open)
  }, [open])

  const setOpen = (val) => {
    setIsOpen(val)
    if (onOpenChange) onOpenChange(val)
  }

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = ({ asChild, children, ...props }) => {
  const { setOpen } = React.useContext(SheetContext)
  return React.cloneElement(children, {
    onClick: (e) => {
      if (children.props.onClick) children.props.onClick(e)
      setOpen(true)
    },
    ...props,
  })
}

const SheetContent = React.forwardRef(
  ({ side = 'right', className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SheetContext)

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
        {/* Drawer panel */}
        <div
          ref={ref}
          className={cn(
            'relative z-50 h-full w-full max-w-lg bg-background shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300',
            side === 'left' && 'animate-in slide-in-from-left mr-auto border-r border-l-0',
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    )
  }
)
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6 border-b border-border/80 bg-muted/40', className)}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4 border-t border-border/80 bg-muted/20 mt-auto', className)}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-bold font-outfit text-foreground tracking-tight', className)}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
