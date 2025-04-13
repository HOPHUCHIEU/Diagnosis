import * as React from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { MonthPicker } from './month-picker'

interface MonthPickerPopoverProps {
  date?: Date
  onDateChange: (date: Date) => void
  placeholder?: string
  className?: string
}

export function MonthPickerPopover({
  date,
  onDateChange,
  placeholder = 'Chọn tháng',
  className
}: MonthPickerPopoverProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedDate: Date) => {
    onDateChange(selectedDate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-[280px] h-8 justify-start text-left capitalize font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='w-4 h-4 mr-2' />
          {date ? format(date, 'MMMM yyyy', { locale: vi }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <MonthPicker
          selectedMonth={date}
          onMonthSelect={handleSelect}
          callbacks={{
            monthLabel: (month) => format(new Date(0, month.number), 'MMMM', { locale: vi })
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
