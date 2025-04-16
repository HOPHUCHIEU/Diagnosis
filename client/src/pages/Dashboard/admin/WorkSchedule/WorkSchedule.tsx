import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  AdminDaySchedule,
  AdminDayShift,
  ApprovalStatus,
  DoctorShiftRegistration,
  Shift,
  DailySchedule,
  ShiftSchedule
} from '@/types/workSchedule.type'
import DoctorListDialog from './components/DoctorListDialog'
import { MonthPickerPopover } from '@/components/ui/month-picker-popover'
import { Badge } from '@/components/ui/badge'
import { useGetAllSchedulesQuery } from '@/redux/services/workScheduleApi'
import { Skeleton } from '@/components/ui/skeleton'
import { bufferToHex } from '@/utils/utils'

// Add helper type for type-safe property access
type ShiftKey = keyof ShiftSchedule
type ShiftKeyPrefix = 'morning' | 'afternoon' | 'evening'

// Add type guards and helpers
function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

export default function WorkSchedule() {
  const [selectedDay, setSelectedDay] = useState<AdminDaySchedule | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)

  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd')

  const {
    data: scheduleData,
    isLoading,
    isFetching,
    refetch: refetchAllSchedules
  } = useGetAllSchedulesQuery({
    startDate,
    endDate
  })

  const processScheduleForDate = (date: Date): AdminDaySchedule | null => {
    const dateYear = date.getFullYear()
    const dateMonth = date.getMonth()
    const dateDay = date.getDate()

    const schedules = scheduleData?.data?.data || []
    const daySchedules = schedules.filter((schedule: DailySchedule) => {
      const scheduleDate = new Date(schedule.date)
      const scheduleYear = scheduleDate.getUTCFullYear()
      const scheduleMonth = scheduleDate.getUTCMonth()
      const scheduleDay = scheduleDate.getUTCDate()

      return scheduleYear === dateYear && scheduleMonth === dateMonth && scheduleDay === dateDay
    })

    if (daySchedules.length === 0) return null
    const shifts: AdminDayShift[] = ['morning', 'afternoon', 'evening']
      .map((shiftType): AdminDayShift | null => {
        const doctors = daySchedules
          .map((schedule: DailySchedule): DoctorShiftRegistration | null => {
            const schedules = schedule.schedules
            const prefix = shiftType as ShiftKeyPrefix

            // Type-safe property access with validation
            const enabled = schedules[prefix] as boolean
            const approvalStatus = schedules[`${prefix}ApprovalStatus` as ShiftKey]
            const rejectionReason = schedules[`${prefix}RejectionReason` as ShiftKey] as string
            const startTime = schedules[`${prefix}Start` as ShiftKey] as string
            const endTime = schedules[`${prefix}End` as ShiftKey] as string

            if (!enabled || !startTime || !endTime || !isApprovalStatus(approvalStatus)) return null

            return {
              doctorId: schedule.doctor ? bufferToHex(schedule.doctor._id) : '',
              scheduleId: bufferToHex(schedule._id),
              doctorName: schedule?.doctor
                ? `${schedule?.doctor?.profile?.firstName} ${schedule?.doctor?.profile?.lastName}`
                : 'Unknown Doctor',
              status: approvalStatus,
              startTime,
              endTime,
              rejectionReason
            }
          })
          .filter((doc): doc is DoctorShiftRegistration => doc !== null)

        if (doctors.length === 0) return null

        return {
          shift: shiftType as Shift,
          startTime: doctors[0].startTime,
          endTime: doctors[0].endTime,
          doctors
        }
      })
      .filter((shift): shift is AdminDayShift => shift !== null)

    // Sử dụng định dạng chuẩn hóa để đảm bảo ngày tháng không bị ảnh hưởng bởi múi giờ
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

    return shifts.length > 0 ? { date: formattedDate, shifts } : null
  }

  // Add effect to update selectedDay when data changes
  useEffect(() => {
    if (selectedDay && !isFetching && scheduleData) {
      const updatedSchedule = processScheduleForDate(new Date(selectedDay.date))
      if (updatedSchedule) {
        setSelectedDay(updatedSchedule)
      } else {
        setSelectedDay(null)
      }
    }
  }, [scheduleData, isFetching])

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date)
  }

  const handleDayClick = (day: AdminDaySchedule) => {
    if (day.shifts.length > 0) {
      setSelectedDay(day)
    }
  }

  const getPendingCount = (shifts: AdminDaySchedule['shifts']) => {
    return shifts.reduce((acc, shift) => {
      return acc + shift.doctors.filter((doc) => doc.status === 'pending').length
    }, 0)
  }

  const handleUpdateSuccess = async () => {
    try {
      setIsUpdating(true)
      await refetchAllSchedules()
    } catch (error) {
      console.error('Error updating schedule:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getActiveShiftCount = (shift: AdminDayShift) => {
    return shift.doctors.filter((doc) => doc.status !== 'rejected').length
  }

  return (
    <div className='p-4 sm:p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Quản lý lịch làm việc</h1>
        <MonthPickerPopover date={currentDate} onDateChange={handleMonthChange} />
      </div>

      {isLoading ? (
        <div className='grid grid-cols-3 gap-2 sm:gap-4 sm:grid-cols-5 lg:grid-cols-7'>
          {Array.from({ length: 35 }).map((_, index) => (
            <Skeleton key={index} className='w-full h-48' />
          ))}
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
              const daySchedule = processScheduleForDate(date) as AdminDaySchedule

              return (
                <Card
                  key={format(date, 'yyyy-MM-dd')}
                  className={`h-48 transition-shadow ${daySchedule ? 'cursor-pointer hover:shadow-lg' : ''}`}
                  onClick={() => daySchedule && handleDayClick(daySchedule as AdminDaySchedule)}
                >
                  <CardContent className='p-2 h-full'>
                    <div className='flex flex-col h-full text-center'>
                      <div>
                        <div className='text-sm font-medium'>{format(date, 'EEEE', { locale: vi })}</div>
                        <div className='text-xl font-bold'>{format(date, 'd')}</div>
                        {daySchedule && getPendingCount(daySchedule.shifts) > 0 && (
                          <Badge variant='secondary' className='justify-center mt-2 w-full'>
                            {getPendingCount(daySchedule.shifts)} chờ duyệt
                          </Badge>
                        )}
                      </div>

                      <div className='flex-1 mt-2'>
                        {daySchedule ? (
                          <div className='text-sm text-gray-600 truncate'>
                            {daySchedule.shifts.map((shift) => {
                              const activeCount = shift.doctors.length
                              if (activeCount === 0) return null

                              const pendingCount = shift.doctors.filter((d) => d.status === 'pending').length
                              const approvedCount = shift.doctors.filter((d) => d.status === 'approved').length

                              return (
                                <div key={shift.shift} className='mb-1'>
                                  {shift.shift === 'morning' && 'Sáng'}
                                  {shift.shift === 'afternoon' && 'Chiều'}
                                  {shift.shift === 'evening' && 'Tối'}: {approvedCount}/{activeCount}
                                  {pendingCount > 0 && ` (${pendingCount} chờ duyệt)`}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className='text-sm text-gray-400 truncate'>Chưa có lịch</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      )}

      <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className='lg:max-w-3xl'>
          {selectedDay && (
            <DoctorListDialog
              key={`${selectedDay.date}-${isFetching}`}
              date={selectedDay.date}
              shifts={selectedDay.shifts}
              onClose={() => setSelectedDay(null)}
              onUpdateSuccess={handleUpdateSuccess}
              isUpdating={isUpdating || isFetching}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
