import * as React from 'react'
import { cn } from '../../lib/utils'

export function InputOTP({ value = '', onChange, maxLength = 6, disabled = false, className }) {
  const inputRefs = React.useRef([])

  const digits = React.useMemo(() => {
    const arr = value.split('')
    while (arr.length < maxLength) {
      arr.push('')
    }
    return arr.slice(0, maxLength)
  }, [value, maxLength])

  const handleChange = (e, index) => {
    const char = e.target.value.slice(-1)
    if (!/^\d*$/.test(char)) return

    const newArr = [...digits]
    newArr[index] = char
    const newVal = newArr.join('')
    if (onChange) onChange(newVal)

    // Auto-advance if character entered
    if (char && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    const numericData = pastedData.replace(/\D/g, '').slice(0, maxLength)
    if (numericData && onChange) {
      onChange(numericData)
      const nextFocus = Math.min(numericData.length, maxLength - 1)
      inputRefs.current[nextFocus]?.focus()
    }
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 sm:gap-3', className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-input bg-background shadow-xs transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50',
            digit ? 'border-primary/60 bg-primary/5 text-primary' : 'text-foreground'
          )}
        />
      ))}
    </div>
  )
}
