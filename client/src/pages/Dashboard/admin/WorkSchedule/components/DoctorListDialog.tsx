import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { AdminDayShift, DoctorShiftRegistration, Shift } from '@/types/workSchedule.type'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { useApproveScheduleMutation, useRejectScheduleMutation } from '@/redux/services/workScheduleApi'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'

interface Props {
  date: string
  shifts: AdminDayShift[]
  onClose: () => void
  onUpdateSuccess: () => Promise<void>
  isUpdating: boolean
}

export default function DoctorListDialog({ date, shifts, onClose, onUpdateSuccess, isUpdating }: Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorShiftRegistration | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)

  const [approveSchedule] = useApproveScheduleMutation()
  const [rejectSchedule] = useRejectScheduleMutation()
  console.log('DoctorListDialog_shifts', shifts)

  const getDayOfWeek = (dateStr: string) => {
    const dayMap: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    }
    return dayMap[parseISO(dateStr).getDay()]
  }

  const handleApprove = async (doctor: DoctorShiftRegistration, shift: Shift) => {
    try {
      await approveSchedule({
        id: doctor.scheduleId,
        session: shift,
        day: getDayOfWeek(date)
      }).unwrap()

      // Wait for update to complete
      await onUpdateSuccess()

      toast.success('Đã phê duyệt lịch làm việc')
    } catch (error) {
      console.log('error', error)
    } finally {
    }
  }

  const handleReject = (doctor: DoctorShiftRegistration, shift: Shift) => {
    setSelectedDoctor(doctor)
    setSelectedShift(shift)
    setIsRejecting(true)
  }

  const handleDelete = (doctor: DoctorShiftRegistration, shift: Shift) => {
    setSelectedDoctor(doctor)
    setSelectedShift(shift)
    setIsRejecting(false)
  }

  const handleConfirmReject = async () => {
    if (!selectedDoctor || !rejectReason || !selectedShift) return

    try {
      await rejectSchedule({
        id: selectedDoctor.scheduleId,
        session: selectedShift,
        day: getDayOfWeek(date),
        rejectionReason: rejectReason
      }).unwrap()

      // Wait for update to complete
      await onUpdateSuccess()

      toast.success(isRejecting ? 'Đã từ chối lịch làm việc' : 'Đã hủy ca làm việc')
      setSelectedDoctor(null)
      setSelectedShift(null)
      setRejectReason('')

      // Only close the main dialog if all doctors in the shift are rejected
      const remainingDoctors = shifts.reduce(
        (total, shift) => total + shift.doctors.filter((d) => d.status === 'pending' || d.status === 'approved').length,
        0
      )
      if (remainingDoctors <= 1) {
        onClose()
      }
    } catch (error) {
      console.log('error', error)
    } finally {
    }
  }
  console.log('DoctorListDialog_shifts', shifts)
  // Separate doctors by status
  const getShiftDoctors = (shift: AdminDayShift) => {
    const active = shift.doctors.filter((doc) => doc.status !== 'rejected')
    const rejected = shift.doctors.filter((doc) => doc.status === 'rejected')
    return { active, rejected }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-bold'>
          Danh sách bác sĩ làm việc ngày {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
        </h2>
      </div>

      <div className='space-y-4'>
        {shifts.map((shift) => {
          const { active, rejected } = getShiftDoctors(shift)
          if (active.length === 0 && rejected.length === 0) return null

          return (
            <div key={shift.shift} className='p-4 border rounded-lg'>
              <h3 className='mb-4 font-medium'>
                {shift.shift === 'morning' && 'Ca sáng'}
                {shift.shift === 'afternoon' && 'Ca chiều'}
                {shift.shift === 'evening' && 'Ca tối'}
                <span className='ml-2 text-sm text-gray-500'>
                  ({shift.startTime} - {shift.endTime})
                </span>
              </h3>

              {/* Active doctors */}
              {active.length > 0 && (
                <div className='space-y-2'>
                  {active.map((doctor) => (
                    <div key={doctor.doctorId} className='p-2 space-y-2 border rounded'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <Avatar>
                            <AvatarImage src={doctor.avatar} />
                            <AvatarFallback>{doctor.doctorName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>{doctor.doctorName}</div>
                            <div className='text-sm text-gray-500'>
                              {doctor.startTime} - {doctor.endTime}
                            </div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant={
                              doctor.status === 'approved'
                                ? 'default'
                                : doctor.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {doctor.status === 'approved' && 'Đã duyệt'}
                            {doctor.status === 'pending' && 'Chờ duyệt'}
                            {doctor.status === 'rejected' && 'Đã từ chối'}
                          </Badge>

                          {doctor.status === 'pending' && (
                            <>
                              <Button
                                variant='default'
                                size='sm'
                                onClick={() => handleApprove(doctor, shift.shift)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? 'Đang xử lý...' : 'Duyệt'}
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleReject(doctor, shift.shift)}
                                disabled={isUpdating}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {doctor.status === 'approved' && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='text-red-500 hover:text-red-700'
                              onClick={() => handleDelete(doctor, shift.shift)}
                              disabled={isUpdating}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          )}
                        </div>
                      </div>

                      {doctor.status === 'rejected' && doctor.rejectionReason && (
                        <div className='p-2 mt-2 text-sm text-red-500 rounded bg-red-50'>
                          <span className='font-medium'>Lý do từ chối:</span> {doctor.rejectionReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Rejected doctors */}
              {rejected.length > 0 && (
                <div className='mt-4'>
                  <h4 className='mb-2 text-sm font-medium text-gray-500'>Đã từ chối</h4>
                  <div className='space-y-2'>
                    {rejected.map((doctor) => (
                      <div key={doctor.doctorId} className='p-2 space-y-2 border border-gray-200 rounded bg-gray-50'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <Avatar>
                              <AvatarImage src={doctor.avatar} />
                              <AvatarFallback>{doctor.doctorName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{doctor.doctorName}</div>
                              <div className='text-sm text-gray-500'>
                                {doctor.startTime} - {doctor.endTime}
                              </div>
                            </div>
                          </div>
                          <Badge variant='destructive'>Đã từ chối</Badge>
                        </div>
                        {doctor.rejectionReason && (
                          <div className='p-2 text-sm text-red-500 rounded bg-red-50'>
                            <span className='font-medium'>Lý do từ chối:</span> {doctor.rejectionReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isRejecting ? 'Từ chối lịch làm việc' : 'Hủy ca làm việc'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isRejecting
                ? `Bạn có chắc muốn từ chối lịch này của bác sĩ ${selectedDoctor?.doctorName}?`
                : `Bạn có chắc muốn hủy ca này của bác sĩ ${selectedDoctor?.doctorName}?`}
              <Textarea
                className='mt-4'
                placeholder='Nhập lý do...'
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedDoctor(null)
                setRejectReason('')
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReject} disabled={!rejectReason || isUpdating}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
