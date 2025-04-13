import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CalendarMode = 'single' | 'multiple' | 'range'

interface CalendarProps {
  mode?: CalendarMode
  selected?: Date | Date[] | { from: Date; to: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to: Date }) => void
  minDate?: Date
  className?: string
  disabled?: boolean
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  minDate = new Date(),
  className,
  disabled = false
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfMonth = monthStart.getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  const handleDateClick = (date: Date) => {
    if (disabled) return
    if (isBefore(date, minDate)) return

    switch (mode) {
      case 'single':
        onSelect?.(date)
        break

      case 'multiple':
        const currentSelected = (selected as Date[]) || []
        const isAlreadySelected = currentSelected.some((d) => isSameDay(d, date))
        const newSelected = isAlreadySelected
          ? currentSelected.filter((d) => !isSameDay(d, date))
          : [...currentSelected, date]
        onSelect?.(newSelected)
        break

      case 'range':
        if (!rangeStart) {
          setRangeStart(date)
          onSelect?.({ from: date, to: date })
        } else {
          const range = rangeStart < date ? { from: rangeStart, to: date } : { from: date, to: rangeStart }
          setRangeStart(null)
          onSelect?.(range)
        }
        break
    }
  }

  const isDateSelected = (date: Date) => {
    if (!selected) return false

    if (mode === 'single') {
      return isSameDay(date, selected as Date)
    }

    if (mode === 'multiple') {
      return (selected as Date[]).some((d) => isSameDay(d, date))
    }

    if (mode === 'range') {
      const range = selected as { from: Date; to: Date }
      return (
        range.from &&
        range.to &&
        (isSameDay(date, range.from) || isSameDay(date, range.to) || (date > range.from && date < range.to))
      )
    }

    return false
  }

  return (
    <div className={cn('p-4 space-y-4 border rounded-lg', className)}>
      {/* Calendar header */}
      <div className='flex items-center justify-between'>
        <span className='font-medium'>{format(currentMonth, 'MMMM yyyy', { locale: vi })}</span>
        <div className='flex gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='w-8 h-8'
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            disabled={isBefore(subMonths(currentMonth, 1), minDate)}
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='w-8 h-8'
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div>
        <div className='grid grid-cols-7 mb-2 text-xs font-medium'>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <div key={day} className='flex items-center justify-center h-8'>
              {day}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-1'>
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {daysInMonth.map((date) => {
            const isDisabled = disabled || isBefore(date, minDate)
            const isSelected = isDateSelected(date)
            const isCurrentDay = isToday(date)

            return (
              <Button
                key={date.toString()}
                variant='ghost'
                className={cn(
                  'h-8 p-0 font-normal',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  isDisabled && 'text-muted-foreground opacity-50 hover:bg-transparent cursor-not-allowed',
                  isCurrentDay && !isSelected && 'border border-primary text-primary',
                  mode === 'range' && rangeStart && !isSelected && date > rangeStart && 'bg-primary/10'
                )}
                disabled={isDisabled}
                onClick={() => handleDateClick(date)}
              >
                {format(date, 'd')}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
