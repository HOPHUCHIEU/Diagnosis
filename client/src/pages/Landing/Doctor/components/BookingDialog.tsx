import { useCreateAppointmentMutation } from '@/redux/services/appointmentApi'
import { useGetMyAppointmentPackageQuery } from '@/redux/services/packageApi'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Textarea } from '@/components/ui/textarea'
import { vi } from 'date-fns/locale'
import { useAppSelector } from '@/redux/store'
import { bufferToHex } from '@/utils/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import BuyPackageDialog from '@/pages/Dashboard/user/AppointmentStats/components/BuyPackageDialog'
import { TicketIcon, PlusCircleIcon } from 'lucide-react'

interface Props {
  doctorId: string
  doctorProfileId: string | Buffer<ArrayBufferLike>
  date: Date
  timeSlot: string
  onClose: () => void
  onBookingSuccess?: () => void
}

export default function BookingDialog({ doctorId, doctorProfileId, date, timeSlot, onClose, onBookingSuccess }: Props) {
  const user = useAppSelector((state) => state.authState.user)
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation()
  const { data: packageData, isFetching: isLoadingPackage, refetch } = useGetMyAppointmentPackageQuery(null)

  const [type, setType] = useState<'video_call' | 'in_person'>('video_call')
  const [symptoms, setSymptoms] = useState('')
  const [showBuyPackage, setShowBuyPackage] = useState(false)

  const remainingAppointments = packageData?.data?.totalRemainingAppointments || 0
  const hasRemainingAppointments = remainingAppointments > 0

  const handleSubmit = async () => {
    try {
      // Kiểm tra xem người dùng còn lượt khám không
      if (!hasRemainingAppointments) {
        toast.error(CustomNotification, {
          data: {
            title: 'Không có lượt khám!',
            content: 'Bạn không còn lượt khám nào. Vui lòng mua gói trước khi đặt lịch.'
          }
        })
        return
      }

      // Hiển thị thông báo đang xử lý
      toast.loading(CustomNotification, {
        data: {
          title: 'Đang xử lý',
          content: 'Đang đặt lịch khám...'
        }
      })

      // Calculate endTime (assuming 30 min duration)
      const [hours, minutes] = timeSlot.split(':').map(Number)
      const endTimeDate = new Date(date)
      endTimeDate.setHours(hours, minutes + 30)
      const endTime = format(endTimeDate, 'HH:mm')

      await createAppointment({
        patient: bufferToHex(user?._id!),
        doctor: bufferToHex(doctorProfileId),
        appointmentDate: format(date, 'yyyy-MM-dd'),
        startTime: timeSlot,
        endTime,
        type: 'in_person',
        medicalInfo: {
          symptoms
        }
      }).unwrap()

      // Đóng thông báo loading nếu có
      toast.dismiss()
      refetch()
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Đặt lịch khám thành công'
        }
      })

      // Gọi callback để cập nhật lại dữ liệu
      onBookingSuccess?.()
      onClose()
    } catch (error) {
      // Đóng thông báo loading nếu có
      toast.dismiss()
      refetch()
      // Hiển thị thông báo lỗi
      toast.error(CustomNotification, {
        data: {
          title: 'Lỗi!',
          content: 'Đã xảy ra lỗi khi đặt lịch khám. Vui lòng thử lại sau.'
        }
      })

      console.log('Error:', error)
    }
  }

  const handleCloseBuyDialog = () => {
    setShowBuyPackage(false)
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-semibold'>Xác nhận đặt lịch khám</h2>

      {/* Hiển thị số lượt khám còn lại */}
      <div className='flex items-center justify-between p-3 rounded-md bg-blue-50'>
        <div className='flex items-center gap-2'>
          <TicketIcon className='w-5 h-5 text-blue-500 min-w-5' />
          <span className='text-sm'>
            {isLoadingPackage
              ? 'Đang tải...'
              : hasRemainingAppointments
                ? `Bạn còn ${remainingAppointments} lượt khám`
                : 'Bạn không có lượt khám nào'}
          </span>
        </div>
        {!hasRemainingAppointments && (
          <Button size='sm' variant='outline' className='gap-1 text-xs' onClick={() => setShowBuyPackage(true)}>
            <PlusCircleIcon className='w-4 h-4' />
            Mua lượt khám
          </Button>
        )}
      </div>

      <div className='space-y-2'>
        <p>Ngày khám: {format(date, 'dd/MM/yyyy')}</p>
        <p>Thời gian: {timeSlot}</p>
        {/* <div className='space-y-2'>
          <p className='font-medium'>Hình thức khám:</p>
          <div className='flex gap-4'>
            <Button
              type='button'
              variant={type === 'video_call' ? 'default' : 'outline'}
              onClick={() => setType('video_call')}
            >
              Khám trực tuyến
            </Button>
            <Button
              type='button'
              variant={type === 'in_person' ? 'default' : 'outline'}
              onClick={() => setType('in_person')}
            >
              Khám trực tiếp
            </Button>
          </div>
        </div> */}
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Mô tả triệu chứng:</label>
        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder='Vui lòng mô tả triệu chứng của bạn...'
          className='min-h-[30vh]'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !hasRemainingAppointments}>
          {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
        </Button>
      </div>

      <Dialog open={showBuyPackage} onOpenChange={setShowBuyPackage}>
        <DialogContent className='max-w-4xl max-h-[calc(100vh-4rem)] min-h-[500px] overflow-y-auto'>
          <BuyPackageDialog onClose={handleCloseBuyDialog} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
