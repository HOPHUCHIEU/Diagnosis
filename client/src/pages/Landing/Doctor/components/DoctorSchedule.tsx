import { CustomCalendar } from '@/components/ui/custom-calendar'
import { cn } from '@/lib/utils'
import { differenceInMinutes, parse, isToday, format, startOfMonth, endOfMonth } from 'date-fns'
import { useGetDoctorAvailabilityQuery } from '@/redux/services/publicApi'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  timeSlots: string[]
  onTimeSlotSelect: (slot: string) => void
  isLoading?: boolean
  doctorId: string
}

export default function DoctorSchedule({
  selectedDate,
  onDateSelect,
  timeSlots,
  onTimeSlotSelect,
  isLoading,
  doctorId
}: Props) {
  // Get first and last day of current month for availability
  const startDate = format(startOfMonth(selectedDate), 'yyyy-M-d')
  const endDate = format(endOfMonth(selectedDate), 'yyyy-M-d')

  const { data: availabilityData, refetch: refetchAvailability } = useGetDoctorAvailabilityQuery(
    {
      id: doctorId,
      startDate,
      endDate
    },
    {
      skip: !doctorId,
      refetchOnMountOrArgChange: true
    }
  )

  // Thêm useEffect để refetch dữ liệu khi component mount hoặc khi selectedDate thay đổi
  useEffect(() => {
    if (doctorId) {
      refetchAvailability()
    }
  }, [refetchAvailability, doctorId, selectedDate])

  const isTimeSlotValid = (timeSlot: string) => {
    // If not today, all slots are valid
    if (!isToday(selectedDate)) return true

    const currentTime = new Date()
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const slotTime = new Date(selectedDate)
    slotTime.setHours(hours, minutes)

    // Check if slot is at least 1 hour ahead
    return differenceInMinutes(slotTime, currentTime) >= 60
  }

  const getSlotStatus = (timeSlot: string) => {
    if (!availabilityData?.data) return null

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    const dayAvailability = availabilityData.data.find((day) => day.date === selectedDateStr)

    if (!dayAvailability) return null

    const bookedSlot = dayAvailability.bookedSlots.find((slot) => slot.startTime === timeSlot)
    if (!bookedSlot) return null

    return {
      status: bookedSlot.status,
      count: dayAvailability.bookedSlots.filter((slot) => slot.startTime === timeSlot).length
    }
  }

  const isSlotAvailable = (timeSlot: string) => {
    const slotStatus = getSlotStatus(timeSlot)
    if (!slotStatus) return true
    return slotStatus.status !== 'confirmed'
  }

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <CustomCalendar selectedDate={selectedDate} onDateSelect={onDateSelect} />

      <div className='p-4 rounded-lg border'>
        <h3 className='mb-4 font-medium'>Chọn giờ khám</h3>
        {isLoading ? (
          <div className='grid h-[200px] place-items-center'>
            <div className='w-8 h-8 rounded-full border-b-2 animate-spin border-primary'></div>
          </div>
        ) : timeSlots.length > 0 ? (
          <div className='grid grid-cols-3 gap-2'>
            {timeSlots.map((slot) => {
              const isValid = isTimeSlotValid(slot)
              const slotStatus = getSlotStatus(slot)
              const isAvailable = isSlotAvailable(slot)
              const isDisabled = !isValid || !isAvailable

              return (
                <button
                  key={slot}
                  onClick={() => !isDisabled && onTimeSlotSelect(slot)}
                  className={cn(
                    'relative p-2 text-sm rounded-md transition-colors',
                    'border border-primary/20',
                    isDisabled ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/10',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                  disabled={isDisabled}
                  title={
                    isDisabled
                      ? !isValid
                        ? 'Thời gian đặt lịch phải trước ít nhất 1 tiếng'
                        : 'Khung giờ này đã được đặt đầy'
                      : undefined
                  }
                >
                  <div className='flex justify-between items-center'>
                    <span>{slot}</span>
                    {slotStatus && (
                      <Badge
                        variant={slotStatus.status === 'confirmed' ? 'success' : 'secondary'}
                        className='ml-1 text-[10px]'
                      >
                        <Users className='w-3 h-3 mr-0.5' />
                        {slotStatus.count}
                      </Badge>
                    )}
                  </div>
                  {slotStatus?.status === 'confirmed' && (
                    <div className='flex absolute inset-0 justify-center items-center rounded-md bg-primary/20'>
                      <Clock className='w-4 h-4 text-primary' />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className='grid h-[200px] place-items-center'>
            <p className='text-gray-500'>Không có ca khám trong ngày này</p>
          </div>
        )}
      </div>
    </div>
  )
}
