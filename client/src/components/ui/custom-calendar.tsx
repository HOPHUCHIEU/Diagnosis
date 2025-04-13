import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
  isBefore,
  startOfDay
} from 'date-fns'
import { vi } from 'date-fns/locale'

interface CustomCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function CustomCalendar({ selectedDate, onDateSelect }: CustomCalendarProps) {
  const currentDate = new Date()
  const today = startOfDay(currentDate)
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handlePreviousMonth = () => {
    onDateSelect(subMonths(selectedDate, 1))
  }

  const handleNextMonth = () => {
    onDateSelect(addMonths(selectedDate, 1))
  }

  const isDateDisabled = (date: Date) => {
    return isBefore(date, today)
  }

  const firstDayOfMonth = monthStart.getDay()
  const emptyDays = Array(firstDayOfMonth).fill(null)

  return (
    <div className='p-4 border rounded-lg'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='font-semibold capitalize text-primary'>{format(selectedDate, 'MMMM yyyy', { locale: vi })}</h2>
        <div className='flex gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='w-8 h-8'
            onClick={handlePreviousMonth}
            disabled={isBefore(endOfMonth(monthStart), today)}
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='icon' className='w-8 h-8' onClick={handleNextMonth}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7 mb-2 text-sm font-medium text-center'>
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
          <div key={day} className='p-2'>
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1 text-sm'>
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className='p-2' />
        ))}

        {daysInMonth.map((date) => {
          const isSelected = isSameDay(date, selectedDate)
          const disabled = isDateDisabled(date)
          const isCurrentDay = isToday(date)

          return (
            <Button
              key={date.toString()}
              variant='ghost'
              className={cn(
                'h-10 p-0 font-normal hover:bg-primary/10',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                disabled && 'text-muted-foreground opacity-50 hover:bg-transparent cursor-not-allowed',
                isCurrentDay && !isSelected && !disabled && 'border border-primary text-primary'
              )}
              disabled={disabled}
              onClick={() => onDateSelect(date)}
            >
              {format(date, 'd')}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
