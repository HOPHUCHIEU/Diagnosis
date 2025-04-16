import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAppSelector } from '@/redux/store'
import { bufferToHex } from '@/utils/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateMultiDayScheduleMutation, useCreateRecurringScheduleMutation } from '@/redux/services/workScheduleApi'
import { toast } from 'react-toastify'
import { CustomNotification } from '@/components/CustomReactToastify'
import { DateRangePicker } from '@/components/Core/Calendar/DateRangePicker'
import { DateTimePicker } from '@/components/Core/Calendar/DateTimePicker'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { endOfDay, format, startOfDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import { DayShiftSchedule } from '@/types/workSchedule.type'

const DEFAULT_SCHEDULE: DayShiftSchedule = {
  morning: false,
  morningStart: '08:00',
  morningEnd: '12:00',
  afternoon: false,
  afternoonStart: '13:00',
  afternoonEnd: '17:00',
  evening: false,
  eveningStart: '18:00',
  eveningEnd: '21:00'
}

const TIME_OPTIONS = Array.from({ length: 24 * 2 }).map((_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

const DAYS_OF_WEEK = [
  { label: 'CN', value: 0 },
  { label: 'T2', value: 1 },
  { label: 'T3', value: 2 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 4 },
  { label: 'T6', value: 5 },
  { label: 'T7', value: 6 }
]

interface DateSchedule {
  date: Date
  schedules: DayShiftSchedule
}

// Hàm so sánh ngày mà không bị ảnh hưởng bởi múi giờ
const isSameDayNoTimezone = (date1: Date, date2: Date): boolean => {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  )
}

// Hàm chuẩn hóa ngày để đảm bảo chỉ lấy ngày, tháng, năm (UTC)
const normalizeDate = (date: Date): Date => {
  const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
  return normalizedDate
}

export default function CreateScheduleDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAppSelector((state) => state.authState)
  // const doctorId = user?.doctorProfileId ? bufferToHex(user.doctorProfileId) : ''
  const doctorId = user?._id ? bufferToHex(user._id) : ''

  const [mode, setMode] = useState<'single' | 'recurring'>('single')
  const [createMultiDay] = useCreateMultiDayScheduleMutation()
  const [createRecurring] = useCreateRecurringScheduleMutation()

  // Single mode state
  const [dateSchedules, setDateSchedules] = useState<DateSchedule[]>([])

  // Recurring mode state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [recurringSchedule, setRecurringSchedule] = useState<DayShiftSchedule>(DEFAULT_SCHEDULE)
  console.log('dateSchedules', dateSchedules)
  const handleDateSelect = (dates: Date[]) => {
    // Chuẩn hóa các ngày đã chọn để đảm bảo không bị ảnh hưởng bởi múi giờ
    const normalizedDates = dates.map(normalizeDate)

    setDateSchedules((prev) => {
      // Lọc ra các lịch đã tồn tại cho các ngày đã chọn
      const existing = prev.filter((ds) => normalizedDates.some((d) => isSameDayNoTimezone(d, ds.date)))

      // Lọc ra các ngày mới chưa có trong lịch
      const newDates = normalizedDates.filter((d) => !prev.some((ds) => isSameDayNoTimezone(d, ds.date)))

      return [
        ...existing,
        ...newDates.map((date) => ({
          date,
          schedules: { ...DEFAULT_SCHEDULE }
        }))
      ]
    })
  }

  const handleScheduleUpdate = (date: Date, schedules: DayShiftSchedule) => {
    setDateSchedules((prev) => prev.map((ds) => (isSameDayNoTimezone(ds.date, date) ? { ...ds, schedules } : ds)))
  }

  const renderShiftControls = (schedule: DayShiftSchedule, setSchedule: (schedule: DayShiftSchedule) => void) => {
    const renderTimeSelect = (
      shift: keyof DayShiftSchedule,
      type: 'Start' | 'End',
      value: string,
      onChange: (value: string) => void
    ) => (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={type === 'Start' ? 'Bắt đầu' : 'Kết thúc'} />
        </SelectTrigger>
        <SelectContent>
          {TIME_OPTIONS.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )

    const renderShift = (shift: 'morning' | 'afternoon' | 'evening', label: string) => (
      <div className='space-y-2'>
        <div className='flex gap-2 items-center'>
          <Switch
            checked={schedule[shift] || false}
            onCheckedChange={(checked) => setSchedule({ ...schedule, [shift]: checked })}
          />
          <span>{label}</span>
        </div>
        {schedule[shift] && (
          <div className='grid grid-cols-2 gap-2'>
            {renderTimeSelect(shift, 'Start', schedule[`${shift}Start`] || '', (value) =>
              setSchedule({ ...schedule, [`${shift}Start`]: value })
            )}
            {renderTimeSelect(shift, 'End', schedule[`${shift}End`] || '', (value) =>
              setSchedule({ ...schedule, [`${shift}End`]: value })
            )}
          </div>
        )}
      </div>
    )

    return (
      <div className='p-4 space-y-4 rounded-lg border'>
        {renderShift('morning', 'Ca sáng')}
        {renderShift('afternoon', 'Ca chiều')}
        {renderShift('evening', 'Ca tối')}
      </div>
    )
  }

  const handleSubmit = async () => {
    try {
      if (mode === 'single') {
        if (dateSchedules.length === 0) {
          toast.error(CustomNotification, {
            data: {
              title: 'Thất bại!',
              content: 'Vui lòng chọn ít nhất một ngày'
            }
          })
          return
        }

        await createMultiDay({
          doctorId,
          daySchedules: dateSchedules.map(({ date, schedules }) => ({
            date: date.toISOString(),
            schedules
          })),
          defaultConsultationDuration: 30
        }).unwrap()
      } else {
        if (!dateRange?.from || !dateRange?.to || selectedDays.length === 0) {
          toast.error(CustomNotification, {
            data: {
              title: 'Thất bại!',
              content: 'Vui lòng chọn đầy đủ thông tin'
            }
          })
          return
        }

        await createRecurring({
          doctorId,
          startDate: startOfDay(dateRange.from).toISOString(),
          endDate: endOfDay(dateRange.to).toISOString(),
          daysOfWeek: selectedDays,
          scheduleTemplate: recurringSchedule,
          defaultConsultationDuration: 30
        }).unwrap()
      }

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Tạo lịch làm việc thành công'
        }
      })
      onClose()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Có lỗi xảy ra khi tạo lịch làm việc'
        }
      })
    }
  }

  return (
    <div className='mt-4 space-y-6'>
      <Tabs value={mode} onValueChange={(value) => setMode(value as 'single' | 'recurring')}>
        <TabsList className='grid grid-cols-2 w-full'>
          <TabsTrigger value='single'>Theo ngày</TabsTrigger>
          <TabsTrigger value='recurring'>Lặp lại</TabsTrigger>
        </TabsList>

        <TabsContent value='single' className='space-y-4'>
          <div className='space-y-2'>
            <Label>Chọn (các) ngày làm việc:</Label>
            <DateTimePicker
              mode='multiple'
              value={dateSchedules.map((ds) => ds.date)}
              onChange={(dates) => handleDateSelect(Array.isArray(dates) ? dates : [dates])}
              showTime={false}
              min={new Date()}
            />
          </div>

          {dateSchedules.length > 0 && (
            <div className='space-y-4'>
              {dateSchedules.map(({ date, schedules }) => (
                <div key={date.toISOString()} className='p-4 rounded-lg border'>
                  <h3 className='mb-4 font-medium'>{format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}</h3>
                  {renderShiftControls(schedules, (newSchedules) => handleScheduleUpdate(date, newSchedules))}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='recurring' className='space-y-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Khoảng thời gian:</Label>
              <DateRangePicker
                value={dateRange && { from: dateRange.from, to: dateRange.to }}
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to })
                  } else {
                    setDateRange(undefined)
                  }
                }}
                min={new Date()}
              />
            </div>

            <div className='space-y-2'>
              <Label>Chọn các ngày trong tuần:</Label>
              <div className='flex flex-wrap gap-2'>
                {DAYS_OF_WEEK.map(({ label, value }) => (
                  <Button
                    key={value}
                    size='sm'
                    variant={selectedDays.includes(value) ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedDays((prev) =>
                        prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
                      )
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          {renderShiftControls(recurringSchedule, setRecurringSchedule)}
        </TabsContent>
      </Tabs>

      <div className='flex gap-2 justify-end'>
        <Button variant='outline' onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>Tạo lịch</Button>
      </div>
    </div>
  )
}
