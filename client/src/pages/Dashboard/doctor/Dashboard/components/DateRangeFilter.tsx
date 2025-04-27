import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DateRangeFilterProps = {
  value: string
  onChange: (value: string) => void
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-8 w-[180px]'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='3months'>3 tháng qua</SelectItem>
        <SelectItem value='6months'>6 tháng qua</SelectItem>
        <SelectItem value='12months'>12 tháng qua</SelectItem>
      </SelectContent>
    </Select>
  )
}
