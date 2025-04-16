import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ApprovalStatus, DaySchedule, Shift, ShiftDetail, ShiftTime, WeekSchedule } from '@/types/workSchedule.type'
import { MonthPickerPopover } from '@/components/ui/month-picker-popover'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import CreateScheduleDialog from './components/CreateScheduleDialog'
import { useAppSelector } from '@/redux/store'
import { useGetDoctorScheduleQuery } from '@/redux/services/workScheduleApi'
import { bufferToHex } from '@/utils/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function WorkSchedule() {
  const { user } = useAppSelector((state) => state.authState)
  const doctorId = user?.doctorProfileId ? bufferToHex(user.doctorProfileId) : ''
  const [currentDate, setCurrentDate] = useState(new Date())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Get first and last day of selected month
  const startDate = format(startOfMonth(currentDate), 'yyyy-M-d')
  const endDate = format(endOfMonth(currentDate), 'yyyy-M-d')

  const { data: scheduleData, isLoading } = useGetDoctorScheduleQuery(
    {
      id: doctorId,
      startDate,
      endDate,
      includeAll: true
    },
    {
      skip: !doctorId
    }
  )

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date)
  }

  const getShiftStatusClass = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-50 text-red-800'
      default:
        return 'bg-yellow-50 text-yellow-800'
    }
  }

  const renderShift = (shift: 'morning' | 'afternoon' | 'evening', schedules: any) => {
    if (!schedules[shift]) return null

    const status = schedules[`${shift}ApprovalStatus`]
    const reason = schedules[`${shift}RejectionReason`]
    const startTime = schedules[`${shift}Start`]
    const endTime = schedules[`${shift}End`]

    return (
      <TooltipProvider key={shift}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`truncate text-sm mb-0.5 px-2 py-0.5 rounded ${getShiftStatusClass(status)} transition-colors`}
            >
              {shift === 'morning' && `Sáng (${startTime}-${endTime})`}
              {shift === 'afternoon' && `Chiều (${startTime}-${endTime})`}
              {shift === 'evening' && `Tối (${startTime}-${endTime})`}
              <span className='ml-1'>
                {status === 'approved' && '✓'}
                {status === 'rejected' && '✕'}
                {status === 'pending' && '⋯'}
              </span>
            </div>
          </TooltipTrigger>
          {status === 'rejected' && reason && (
            <TooltipContent className='text-red-800 bg-red-50 border-red-200'>
              <p>Lý do từ chối: {reason}</p>
            </TooltipContent>
          )}
          {status === 'pending' && (
            <TooltipContent>
              <p>Đang chờ duyệt</p>
            </TooltipContent>
          )}
          {status === 'approved' && (
            <TooltipContent className='text-green-800 bg-green-50 border-green-200'>
              <p>Đã được duyệt</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className='p-4 sm:p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Lịch làm việc</h1>
        <div className='flex gap-4 items-center'>
          <MonthPickerPopover date={currentDate} onDateChange={handleMonthChange} />
          <Button className='h-8' size={'sm'} onClick={() => setCreateDialogOpen(true)}>
            <Plus className='mr-2 w-4 h-4' />
            Tạo lịch làm việc
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center min-h-[200px]'>
          <div className='w-8 h-8 rounded-full border-b-2 animate-spin border-primary'></div>
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-2 sm:gap-4 sm:grid-cols-5 lg:grid-cols-7'>
          {/* Calendar header */}
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <div key={day} className='p-2 font-medium text-center'>
              {day}
            </div>
          ))}

          {/* Empty cells */}
          {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map(
            (_, index) => (
              <div key={`empty-${index}`} className='h-48' />
            )
          )}

          {/* Calendar days */}
          {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map(
            (_, index) => {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1)
              const dateYear = date.getFullYear()
              const dateMonth = date.getMonth()
              const dateDay = date.getDate()

              // Tìm lịch làm việc cho ngày hiện tại bằng cách so sánh ngày, tháng, năm (không dùng format)
              const daySchedule = scheduleData?.data.find((schedule) => {
                const scheduleDate = new Date(schedule.date)
                const scheduleYear = scheduleDate.getUTCFullYear()
                const scheduleMonth = scheduleDate.getUTCMonth()
                const scheduleDay = scheduleDate.getUTCDate()

                return scheduleYear === dateYear && scheduleMonth === dateMonth && scheduleDay === dateDay
              })

              return (
                <Card key={index} className='h-48'>
                  <CardContent className='p-2'>
                    <div className='text-center'>
                      <div className='text-sm font-medium'>{format(date, 'EEEE', { locale: vi })}</div>
                      <div className='text-xl font-bold'>{format(date, 'd')}</div>
                      {daySchedule && (
                        <div className='mt-1 text-xs text-gray-600'>
                          {renderShift('morning', daySchedule.schedules)}
                          {renderShift('afternoon', daySchedule.schedules)}
                          {renderShift('evening', daySchedule.schedules)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] overflow-y-auto'>
          <CreateScheduleDialog onClose={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
