import { useGetAppointmentDetailQuery } from '@/redux/services/appointmentApi'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Video, CheckCircle, Loader2, Calendar, CalendarPlus, FileText, User, Clock, Trash, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { toast as sonnerToast } from 'sonner'
import { useJoinVideoCall } from '@/hooks/useJoinVideoCall'
import { bufferToHex } from '@/utils/utils'
import ReviewSection from '@/components/Review/ReviewSection'
import { CustomNotification } from '@/components/CustomReactToastify'
import { useState } from 'react'
import { Appointment } from '@/types/appointment.type'
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

interface Props {
  appointmentId: string
  onClose: () => void
}

const getStatusBadge = (status: string) => {
  const styles = {
    pending: '!bg-yellow-100 text-yellow-800',
    confirmed: '!bg-blue-100 text-blue-800',
    completed: '!bg-green-100 text-green-800',
    cancelled: '!bg-red-100 text-red-800'
  }[status]

  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }[status]

  return <Badge className={styles + ' min-w-[120px] justify-center'}>{labels}</Badge>
}

export default function AppointmentDetail({ appointmentId }: Props) {
  const { data, isLoading } = useGetAppointmentDetailQuery(appointmentId, { refetchOnMountOrArgChange: true })
  const { joinVideoCall, canJoinVideoCall, getTimeUntilJoinable, isLoadingMeetings, hasVideoCallPermission } =
    useJoinVideoCall({ isDev: true })

  // State cho dialog xóa lịch tái khám
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteFollowUpId, setDeleteFollowUpId] = useState<string>('')
  const [isDeletingFollowUp, setIsDeletingFollowUp] = useState(false)

  if (isLoading || !data || isLoadingMeetings)
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='w-8 h-8 rounded-full border-b-2 animate-spin border-primary'></div>
      </div>
    )

  const appointment = data.data
  const apptId = bufferToHex(appointment._id)

  // Kiểm tra xem admin có thể tham gia cuộc gọi hay không (trước 30 phút)
  const canJoin = canJoinVideoCall(appointment.appointmentDate, appointment.startTime, true) && hasVideoCallPermission()

  // Tính thời gian còn lại đến khi có thể tham gia
  const timeUntil = getTimeUntilJoinable(appointment.appointmentDate, appointment.startTime, true)

  // Xử lý tham gia cuộc gọi video
  const handleJoinMeeting = () => {
    joinVideoCall(appointment.videoCallInfo, apptId)
  }

  // Kiểm tra trạng thái cuộc gọi
  const isCallStarted = appointment.isVideoCallStarted || (appointment.videoCallInfo?.joinedAt ? true : false)
  const isCallEnded = appointment.isVideoCallEnded || false
  const pendingMedicalInfo = appointment.status === 'confirmed' && appointment.type === 'video_call' && isCallEnded

  // Check if this appointment has follow-up appointments
  const hasFollowUps = appointment.followUpAppointments && appointment.followUpAppointments.length > 0

  // Xử lý xóa lịch tái khám
  const handleDeleteFollowUp = async () => {
    if (!deleteFollowUpId) return

    setIsDeletingFollowUp(true)
    try {
      // TODO: Thêm mutation API xóa lịch tái khám
      // await deleteFollowUpAppointment(deleteFollowUpId)
      console.log('Xóa lịch tái khám:', deleteFollowUpId)

      toast.success(CustomNotification, {
        data: {
          title: 'Thành công',
          content: 'Đã xóa lịch tái khám'
        }
      })

      setConfirmDeleteOpen(false)
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Lỗi',
          content: 'Không thể xóa lịch tái khám. Vui lòng thử lại sau.'
        }
      })
      console.error('Error deleting follow-up appointment:', error)
    } finally {
      setIsDeletingFollowUp(false)
    }
  }

  // Mở dialog xác nhận xóa
  const openDeleteConfirm = (followUpId: string) => {
    setDeleteFollowUpId(followUpId)
    setConfirmDeleteOpen(true)
  }

  // Render follow-up appointment card
  const renderFollowUpAppointmentCard = (followUpAppointment: Appointment, index: number) => {
    const followUpApptId = bufferToHex(followUpAppointment._id)
    const canJoinFollowUp = canJoinVideoCall(followUpAppointment.appointmentDate, followUpAppointment.startTime, true)
    const isFollowUpCallStarted =
      followUpAppointment.isVideoCallStarted || (followUpAppointment.videoCallInfo?.joinedAt ? true : false)
    const isFollowUpCallEnded = followUpAppointment.isVideoCallEnded || false
    const followUpPendingMedicalInfo =
      followUpAppointment.status === 'confirmed' && followUpAppointment.type === 'video_call' && isFollowUpCallEnded

    return (
      <div className='p-4 mb-4'>
        {/* Thông tin bệnh nhân và bác sĩ */}
        <div className='grid grid-cols-1 gap-3 p-3 mb-3 bg-gray-50 rounded-lg md:grid-cols-2'>
          <div className='flex gap-3 items-center'>
            <div className='flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 text-primary'>
              <User size={20} />
            </div>
            <div>
              <p className='font-medium'>Bệnh nhân</p>
              <p className='text-sm text-gray-600'>
                {appointment.patient.profile
                  ? `${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div className='flex gap-3 items-center'>
            <div className='flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 text-primary'>
              <User size={20} />
            </div>
            <div>
              <p className='font-medium'>Bác sĩ</p>
              <p className='text-sm text-gray-600'>
                {appointment.doctor.profile
                  ? `${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin lịch tái khám */}
        <div className='grid grid-cols-1 gap-4 mb-3 md:grid-cols-2'>
          <div>
            <p className='font-medium'>Ngày khám</p>
            <p className='text-gray-600'>{format(new Date(followUpAppointment.appointmentDate), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <p className='font-medium'>Thời gian</p>
            <p className='text-gray-600'>
              {followUpAppointment.startTime} - {followUpAppointment.endTime}
            </p>
          </div>
          <div>
            <p className='font-medium'>Hình thức khám</p>
            <p className='text-gray-600'>{followUpAppointment.type === 'video_call' ? 'Trực tuyến' : 'Trực tiếp'}</p>
          </div>
          <div>
            <p className='font-medium'>Trạng thái</p>
            <p className='text-gray-600'>
              {followUpAppointment.status === 'pending'
                ? 'Chờ xác nhận'
                : followUpAppointment.status === 'confirmed'
                  ? 'Đã xác nhận'
                  : followUpAppointment.status === 'completed'
                    ? 'Đã hoàn thành'
                    : 'Đã hủy'}
            </p>
          </div>
        </div>

        {/* Thông tin cuộc gọi video cho lịch tái khám */}
        {followUpAppointment.status === 'confirmed' &&
          followUpAppointment.type === 'video_call' &&
          followUpAppointment.videoCallInfo && (
            <div className='p-4 mt-3 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='space-y-2'>
                <h3 className='font-medium text-blue-800'>Thông tin cuộc gọi video tái khám</h3>
                <p className='text-sm text-blue-700'>
                  Lịch tái khám trực tuyến vào ngày{' '}
                  {format(new Date(followUpAppointment.appointmentDate), 'dd/MM/yyyy')} lúc{' '}
                  {followUpAppointment.startTime}.
                </p>

                {/* Hiển thị thông báo khác nhau tùy vào trạng thái cuộc gọi */}
                {isFollowUpCallEnded ? (
                  <div className='p-3 text-green-700 bg-green-50 rounded-md border border-green-200'>
                    <p className='flex items-center'>
                      <CheckCircle className='mr-2 w-5 h-5 text-green-500' />
                      Cuộc gọi video đã kết thúc
                    </p>
                  </div>
                ) : !isFollowUpCallStarted ? (
                  <div className='p-3 text-blue-700 bg-blue-50 rounded-md border border-blue-200'>
                    <p className='flex items-center'>
                      <Loader2 className='mr-2 w-5 h-5 text-blue-500 animate-spin' />
                      Đang chờ bác sĩ bắt đầu cuộc gọi
                    </p>
                    <p className='mt-1 text-sm'>
                      Cuộc gọi chưa được bác sĩ bắt đầu. Admin vẫn có thể tham gia để kiểm tra.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className='text-sm font-medium text-blue-700'>
                      Admin có thể tham gia và giám sát cuộc gọi trước 30 phút so với giờ hẹn.
                    </p>

                    {!canJoinFollowUp &&
                      getTimeUntilJoinable(
                        followUpAppointment.appointmentDate,
                        followUpAppointment.startTime,
                        true
                      ) && (
                        <div className='p-2 text-sm text-orange-600 bg-orange-50 rounded'>
                          Bạn có thể tham gia cuộc gọi sau:{' '}
                          {getTimeUntilJoinable(
                            followUpAppointment.appointmentDate,
                            followUpAppointment.startTime,
                            true
                          )}
                        </div>
                      )}

                    <div className='flex flex-row gap-2 mt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          navigator.clipboard.writeText(followUpAppointment.videoCallInfo?.meetingUrl || '')
                          sonnerToast.success('Đã sao chép liên kết cuộc gọi')
                        }}
                      >
                        Sao chép liên kết
                      </Button>

                      <Button
                        size='sm'
                        onClick={() => joinVideoCall(followUpAppointment.videoCallInfo, followUpApptId)}
                        disabled={!canJoinFollowUp || isFollowUpCallEnded}
                      >
                        <Video className='mr-2 w-4 h-4' /> Tham gia giám sát
                      </Button>
                    </div>
                  </>
                )}
                <p className='text-xs text-blue-700'>ID: {followUpAppointment.videoCallInfo.meetingId}</p>
              </div>
            </div>
          )}

        {/* Thông báo nhắc nhở cho khám trực tiếp - lịch tái khám */}
        {followUpAppointment.type === 'in_person' && followUpAppointment.status === 'confirmed' && (
          <div className='p-4 mt-3 bg-blue-50 rounded-lg border border-blue-200'>
            <div className='flex gap-3 items-start'>
              <div className='flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full shrink-0'>
                <Calendar className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-blue-800'>Nhắc nhở lịch tái khám trực tiếp</h3>
                <p className='mt-1 text-sm text-blue-700'>
                  Lịch tái khám trực tiếp vào ngày {format(new Date(followUpAppointment.appointmentDate), 'dd/MM/yyyy')}{' '}
                  lúc {followUpAppointment.startTime}. Vui lòng đảm bảo bác sĩ và phòng khám đã sẵn sàng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo cho admin về việc bác sĩ chưa cập nhật bệnh án cho lịch tái khám */}
        {followUpPendingMedicalInfo && (
          <div className='p-4 mt-3 bg-amber-50 rounded-lg border border-amber-200'>
            <div className='flex items-start'>
              <div className='flex justify-center items-center mr-3 w-10 h-10 bg-amber-100 rounded-full shrink-0'>
                <Clock className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-amber-800'>Đang chờ cập nhật</h3>
                <p className='mt-1 text-sm text-amber-700'>
                  Cuộc gọi tái khám đã kết thúc. Đang chờ bác sĩ cập nhật thông tin y tế cho bệnh nhân.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị đơn thuốc cho lịch tái khám đã hoàn thành */}
        {followUpAppointment.status === 'completed' && followUpAppointment.medicalInfo && (
          <div className='mt-3'>
            <div className='overflow-hidden rounded-lg border border-green-200'>
              <div className='flex items-center px-4 py-3 bg-green-50'>
                <FileText className='mr-2 w-4 h-4 text-green-600' />
                <h3 className='font-medium text-green-700'>Đơn thuốc tái khám</h3>
              </div>
              <div className='p-4 space-y-4'>
                {followUpAppointment.medicalInfo?.reason && (
                  <div>
                    <p className='mb-1 font-medium text-green-600'>Chuẩn đoán</p>
                    <p className='p-3 text-gray-700 whitespace-pre-wrap bg-green-50 rounded-md border border-green-100'>
                      {followUpAppointment.medicalInfo.reason}
                    </p>
                  </div>
                )}
                {followUpAppointment.medicalInfo?.currentMedications &&
                  followUpAppointment.medicalInfo.currentMedications.length > 0 && (
                    <div>
                      <p className='mb-1 font-medium text-green-600'>Thuốc</p>
                      <div className='p-3 bg-green-50 rounded-md border border-green-100'>
                        <ul className='space-y-1 list-decimal list-inside text-gray-700'>
                          {followUpAppointment.medicalInfo.currentMedications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                {followUpAppointment.medicalInfo?.notes && (
                  <div>
                    <p className='mb-1 font-medium text-green-600'>Ghi chú</p>
                    <p className='p-3 text-gray-700 whitespace-pre-wrap bg-green-50 rounded-md border border-green-100'>
                      {followUpAppointment.medicalInfo.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Chi tiết lịch hẹn</h2>

      {/* Hiển thị thông tin cuộc gọi video */}
      {appointment.status === 'confirmed' && appointment.type === 'video_call' && appointment.videoCallInfo && (
        <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <div className='space-y-2'>
            <h3 className='font-medium text-blue-800'>Thông tin cuộc gọi video</h3>
            <p className='text-sm text-blue-700'>
              Lịch hẹn khám online vào ngày {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')} lúc{' '}
              {appointment.startTime}.
            </p>

            {/* Hiển thị thông báo khác nhau tùy vào trạng thái cuộc gọi */}
            {appointment.isVideoCallEnded ? (
              <div className='p-3 text-green-700 bg-green-50 rounded-md border border-green-200'>
                <p className='flex items-center'>
                  <CheckCircle className='mr-2 w-5 h-5 text-green-500' />
                  Cuộc gọi video đã kết thúc
                </p>
              </div>
            ) : !isCallStarted ? (
              <div className='p-3 text-blue-700 bg-blue-50 rounded-md border border-blue-200'>
                <p className='flex items-center'>
                  <Loader2 className='mr-2 w-5 h-5 text-blue-500 animate-spin' />
                  Đang chờ bác sĩ bắt đầu cuộc gọi
                </p>
                <p className='mt-1 text-sm'>
                  Cuộc gọi chưa được bác sĩ bắt đầu. Admin vẫn có thể tham gia để kiểm tra.
                </p>
              </div>
            ) : (
              <>
                <p className='text-sm font-medium text-blue-700'>
                  Admin có thể tham gia và giám sát cuộc gọi trước 30 phút so với giờ hẹn.
                </p>

                {!canJoin && timeUntil && (
                  <div className='p-2 text-sm text-orange-600 bg-orange-50 rounded'>
                    Bạn có thể tham gia cuộc gọi sau: {timeUntil}
                  </div>
                )}

                <div className='flex flex-row gap-2 mt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      navigator.clipboard.writeText(appointment.videoCallInfo?.meetingUrl || '')
                      sonnerToast.success('Đã sao chép liên kết cuộc gọi')
                    }}
                  >
                    Sao chép liên kết
                  </Button>

                  <Button size='sm' onClick={handleJoinMeeting} disabled={!canJoin || appointment.isVideoCallEnded}>
                    <Video className='mr-2 w-4 h-4' /> Tham gia giám sát
                  </Button>
                </div>
              </>
            )}
            <p className='text-xs text-blue-700'>ID: {appointment.videoCallInfo.meetingId}</p>
          </div>
        </div>
      )}

      {/* Thông báo cho admin về việc bác sĩ chưa cập nhật bệnh án */}
      {pendingMedicalInfo && (
        <div className='p-4 mb-4 bg-amber-50 rounded-lg border border-amber-200'>
          <div className='flex items-start'>
            <div className='flex justify-center items-center mr-3 w-10 h-10 bg-amber-100 rounded-full shrink-0'>
              <Clock className='w-5 h-5 text-amber-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-amber-800'>Đang chờ cập nhật</h3>
              <p className='mt-1 text-sm text-amber-700'>
                Cuộc gọi đã kết thúc. Đang chờ bác sĩ cập nhật thông tin y tế cho bệnh nhân.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo nhắc nhở cho khám trực tiếp */}
      {appointment.type === 'in_person' && appointment.status === 'confirmed' && (
        <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <div className='flex gap-3 items-start'>
            <div className='flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full shrink-0'>
              <Calendar className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-blue-800'>Nhắc nhở lịch khám trực tiếp</h3>
              <p className='mt-1 text-sm text-blue-700'>
                Bệnh nhân sẽ đến khám trực tiếp vào ngày {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}{' '}
                lúc {appointment.startTime}. Vui lòng đảm bảo bác sĩ và phòng khám đã sẵn sàng.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-4'>
        {/* Basic Info Card */}
        <div className='grid gap-4 p-4 rounded-lg border'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='font-medium'>Bác sĩ</p>
              <p>
                {appointment.doctor.profile
                  ? `${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                  : 'N/A'}
              </p>
              <div className='flex items-center mt-1'>
                <span className='mr-1 text-xs text-gray-500'>ID:</span>
                <code className='p-1 font-mono text-xs bg-gray-100 rounded'>{bufferToHex(appointment.doctor._id)}</code>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='p-0 ml-1 w-5 h-5'
                  onClick={() => {
                    navigator.clipboard.writeText(bufferToHex(appointment.doctor._id))
                    sonnerToast.success('Đã sao chép ID bác sĩ')
                  }}
                  title='Sao chép ID'
                >
                  <Copy className='w-3 h-3' />
                </Button>
              </div>
            </div>
            <div>
              <p className='font-medium'>Bệnh nhân</p>
              <p>
                {appointment.patient.profile
                  ? `${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`
                  : 'Chưa cập nhật'}
              </p>
              <div className='flex items-center mt-1'>
                <span className='mr-1 text-xs text-gray-500'>ID:</span>
                <code className='p-1 font-mono text-xs bg-gray-100 rounded'>
                  {bufferToHex(appointment.patient._id)}
                </code>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='p-0 ml-1 w-5 h-5'
                  onClick={() => {
                    navigator.clipboard.writeText(bufferToHex(appointment.patient._id))
                    sonnerToast.success('Đã sao chép ID bệnh nhân')
                  }}
                  title='Sao chép ID'
                >
                  <Copy className='w-3 h-3' />
                </Button>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='font-medium'>Trạng thái</p>
              <div>{getStatusBadge(appointment.status)}</div>
            </div>
            {/* <div>
              <p className='font-medium'>Phí khám</p>
              <p>{formatCurrency(appointment.appointmentFee)}</p>
            </div> */}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='font-medium'>Ngày khám</p>
              <p>{format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className='font-medium'>Thời gian</p>
              <p>
                {appointment.startTime} - {appointment.endTime}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='font-medium'>Hình thức khám</p>
              <p>{appointment.type === 'video_call' ? 'Trực tuyến' : 'Trực tiếp'}</p>
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <Accordion type='multiple' defaultValue={['medical_info', 'more_info']}>
          <AccordionItem value='medical_info' className='mb-3 bg-white rounded-lg border shadow-sm'>
            <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
              Khai báo y tế
            </AccordionTrigger>
            <AccordionContent className='px-4 pb-4 space-y-4'>
              <div>
                <p className='mb-1 font-medium text-gray-600'>Triệu chứng</p>
                <p className='p-3 text-gray-700 whitespace-pre-wrap bg-gray-50 rounded'>
                  {(appointment.medicalInfo?.symptoms && appointment.medicalInfo.symptoms) || 'Không có thông tin'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {appointment.cancelReason && (
            <AccordionItem value='cancel_info' className='mb-3 bg-white rounded-lg border border-red-200 shadow-sm'>
              <AccordionTrigger className='px-4 py-3 text-base font-medium text-red-500 hover:no-underline'>
                Thông tin hủy lịch
              </AccordionTrigger>
              <AccordionContent className='px-4 pb-4'>
                <div className='p-3 bg-red-50 rounded-md border border-red-100'>
                  <p className='mb-2'>
                    <span className='font-medium'>Lý do:</span> {appointment.cancelReason}
                  </p>
                  {appointment.cancelledAt && (
                    <p>
                      <span className='font-medium'>Thời gian hủy:</span>{' '}
                      {format(new Date(appointment.cancelledAt), 'HH:mm dd/MM/yyyy')}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {appointment.status === 'completed' && (
            <AccordionItem value='prescription' className='mb-3 bg-white rounded-lg border border-green-200 shadow-sm'>
              <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
                <div className='flex items-center'>
                  <FileText className='mr-2 w-4 h-4 text-green-600' />
                  <span className='text-green-700'>Đơn thuốc</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-4 pb-4 space-y-4'>
                {appointment.medicalInfo?.reason && (
                  <div>
                    <p className='mb-1 font-medium text-green-600'>Chuẩn đoán</p>
                    <p className='p-3 text-gray-700 whitespace-pre-wrap bg-green-50 rounded-md border border-green-100'>
                      {appointment.medicalInfo.reason}
                    </p>
                  </div>
                )}
                {appointment.medicalInfo?.currentMedications &&
                  appointment.medicalInfo.currentMedications.length > 0 && (
                    <div>
                      <p className='mb-1 font-medium text-green-600'>Thuốc</p>
                      <div className='p-3 bg-green-50 rounded-md border border-green-100'>
                        <ul className='space-y-1 list-decimal list-inside text-gray-700'>
                          {appointment.medicalInfo.currentMedications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                {appointment.medicalInfo?.notes && (
                  <div>
                    <p className='mb-1 font-medium text-green-600'>Ghi chú</p>
                    <p className='p-3 text-gray-700 whitespace-pre-wrap bg-green-50 rounded-md border border-green-100'>
                      {appointment.medicalInfo.notes}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value='more_info' className='mb-3 bg-white rounded-lg border shadow-sm'>
            <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
              Thông tin thêm
            </AccordionTrigger>
            <AccordionContent className='px-4 pb-4'>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li className='flex gap-2 items-center'>
                  <Calendar className='w-4 h-4 text-gray-400 shrink-0' />
                  <span>Đặt lịch lúc: {format(new Date(appointment.createdAt), 'HH:mm dd/MM/yyyy')}</span>
                </li>
                {appointment.isRescheduled && (
                  <li className='flex gap-2 items-center'>
                    <Calendar className='w-4 h-4 text-amber-400 shrink-0' />
                    <span className='text-amber-600'>Đã được đổi lịch</span>
                  </li>
                )}
                {appointment.approvedAt && (
                  <li className='flex gap-2 items-center'>
                    <CheckCircle className='w-4 h-4 text-green-500 shrink-0' />
                    <span>Xác nhận lúc: {format(new Date(appointment.approvedAt), 'HH:mm dd/MM/yyyy')}</span>
                  </li>
                )}
                {appointment.type === 'video_call' && (
                  <>
                    <li className='flex gap-2 items-center'>
                      <Video className='w-4 h-4 text-blue-500 shrink-0' />
                      <span>
                        Trạng thái cuộc gọi:{' '}
                        <span className={appointment.isVideoCallStarted ? 'text-green-600' : 'text-amber-600'}>
                          {appointment.isVideoCallStarted ? 'Đã bắt đầu' : 'Chưa bắt đầu'}
                        </span>
                      </span>
                    </li>
                    {appointment.isVideoCallEnded && (
                      <li className='flex gap-2 items-center'>
                        <CheckCircle className='w-4 h-4 text-green-500 shrink-0' />
                        <span className='text-green-600'>Cuộc gọi đã kết thúc</span>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Thêm phần review cho các lịch đã hoàn thành */}
      {appointment.status === 'completed' && (
        <ReviewSection
          appointmentId={appointmentId}
          isCompleted={appointment.status === 'completed'}
          userRole='admin'
        />
      )}

      {/* Hiển thị lịch tái khám nếu có */}
      {hasFollowUps && (
        <div className='mt-4'>
          <h3 className='mb-3 text-base font-medium'>Lịch tái khám ({appointment.followUpAppointments.length})</h3>
          <Accordion type='multiple'>
            {appointment.followUpAppointments.map((followUp, index) => {
              const followUpApptId = bufferToHex(followUp._id)
              return (
                <AccordionItem
                  key={`followup_${index}`}
                  value={`followup_${index}`}
                  className='mb-3 bg-white rounded-lg border border-blue-100 shadow-sm'
                >
                  <AccordionTrigger className='px-4 py-3 hover:no-underline'>
                    <div
                      className={`flex w-full mr-2 justify-between items-center ${
                        followUp.status === 'pending'
                          ? 'text-yellow-700'
                          : followUp.status === 'confirmed'
                            ? 'text-blue-700'
                            : followUp.status === 'completed'
                              ? 'text-green-700'
                              : 'text-red-700'
                      }`}
                    >
                      <div className='flex items-center'>
                        <CalendarPlus className='mr-2 w-4 h-4' />
                        <span className='font-medium'>
                          Tái khám #{index + 1} - {format(new Date(followUp.appointmentDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className='flex gap-2 items-center'>
                        {getStatusBadge(followUp.status)}
                        <Button
                          variant='destructive'
                          size='sm'
                          className='max-h-7 w-fit'
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteConfirm(followUpApptId)
                          }}
                        >
                          <Trash className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-4 pb-4'>
                    {renderFollowUpAppointmentCard(followUp, index)}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      )}

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lịch tái khám</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lịch tái khám này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFollowUp}
              className='bg-red-500 hover:bg-red-600'
              disabled={isDeletingFollowUp}
            >
              {isDeletingFollowUp ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
