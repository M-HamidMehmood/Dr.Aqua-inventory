import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

function Calendar({
  className,
  selected,
  onSelect,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(selected ? new Date(selected) : new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrev = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNext = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isSelected = (day) => {
    if (!selected) return false
    const d = new Date(selected)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  }

  const isToday = (day) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  return (
    <div className={cn('p-3 bg-card border border-border/80 rounded-2xl shadow-xs select-none w-64', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-xs font-bold font-outfit text-foreground">
          {monthNames[month]} {year}
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground uppercase pb-1">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const selectedDay = isSelected(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                if (onSelect) {
                  const newDate = new Date(year, month, day)
                  onSelect(newDate)
                }
              }}
              className={cn(
                'h-7 w-7 mx-auto rounded-lg flex items-center justify-center font-mono text-[11px] transition-all cursor-pointer',
                selectedDay
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : today
                  ? 'border border-primary/40 font-bold text-primary bg-primary/5'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
