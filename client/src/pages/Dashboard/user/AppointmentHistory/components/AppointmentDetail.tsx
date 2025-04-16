import { useGetAppointmentDetailQuery } from '@/redux/services/appointmentApi'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Video,
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  FileText,
  ExternalLink,
  CalendarPlus,
  Copy
} from 'lucide-react'
import { useJoinVideoCall } from '@/hooks/useJoinVideoCall'
import { bufferToHex } from '@/utils/utils'
import { toast as sonnerToast } from 'sonner'
import ReviewSection from '@/components/Review/ReviewSection'
import { Appointment } from '@/types/appointment.type'

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
  const { joinVideoCall, canJoinVideoCall, getTimeUntilJoinable, isLoadingMeetings } = useJoinVideoCall({ isDev: true })

  if (isLoading || !data || isLoadingMeetings)
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='w-8 h-8 rounded-full border-b-2 animate-spin border-primary'></div>
      </div>
    )

  const appointment = data.data
  const apptId = bufferToHex(appointment._id)

  // Check if this appointment has follow-up appointments
  const hasFollowUps = appointment.followUpAppointments && appointment.followUpAppointments.length > 0

  // Kiểm tra xem bệnh nhân có thể tham gia cuộc gọi hay không (chỉ đúng giờ hẹn)
  const canJoin = canJoinVideoCall(appointment.appointmentDate, appointment.startTime, false)

  // Tính thời gian còn lại đến giờ hẹn
  const timeUntil = getTimeUntilJoinable(appointment.appointmentDate, appointment.startTime, false)

  // Xử lý tham gia cuộc gọi video
  const handleJoinMeeting = () => {
    joinVideoCall(appointment.videoCallInfo, apptId)
  }

  // Kiểm tra trạng thái cuộc gọi
  const isCallEnded = appointment.isVideoCallEnded || false
  const appointmentFinished = appointment.status === 'confirmed' && appointment.type === 'video_call' && isCallEnded

  // Render follow-up appointment card
  const renderFollowUpAppointmentCard = (followUpAppointment: Appointment, index: number) => {
    const followUpApptId = bufferToHex(followUpAppointment._id)
    const canJoinFollowUp = canJoinVideoCall(followUpAppointment.appointmentDate, followUpAppointment.startTime)
    const isFollowUpCallStarted =
      followUpAppointment.isVideoCallStarted || (followUpAppointment.videoCallInfo?.joinedAt ? true : false)
    const isFollowUpCallEnded = followUpAppointment.isVideoCallEnded || false
    const followUpFinished =
      followUpAppointment.status === 'confirmed' && followUpAppointment.type === 'video_call' && isFollowUpCallEnded

    return (
      <div className='p-4'>
        {/* Thông tin bác sĩ */}
        <div className='p-3 mb-3 bg-gray-50 rounded-lg'>
          <div className='flex gap-3 items-center'>
            <div className='flex justify-center items-center w-10 h-10 rounded-full bg-primary/10 text-primary'>
              <User size={20} />
            </div>
            <div>
              <p className='font-medium'>Bác sĩ</p>
              <p className='text-sm text-gray-600'>
                {appointment.doctor.profile
                  ? `${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                  : 'Chưa cập nhật'}
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
                      Cuộc gọi sẽ được bác sĩ bắt đầu. Vui lòng giữ liên lạc với điện thoại.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className='text-sm font-medium text-blue-700'>
                      Bạn có thể tham gia cuộc gọi trước 30 phút so với giờ hẹn.
                    </p>

                    {!canJoinFollowUp &&
                      getTimeUntilJoinable(followUpAppointment.appointmentDate, followUpAppointment.startTime) && (
                        <div className='p-2 text-sm text-orange-600 bg-orange-50 rounded'>
                          Bạn có thể tham gia cuộc gọi sau:{' '}
                          {getTimeUntilJoinable(followUpAppointment.appointmentDate, followUpAppointment.startTime)}
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
                        <Video className='mr-2 w-4 h-4' /> Tham gia
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
                  lúc {followUpAppointment.startTime}. Vui lòng đến đúng giờ và mang theo các giấy tờ cần thiết.
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

        {/* Hiển thị thông báo cho bệnh nhân khi cuộc gọi tái khám đã kết thúc */}
        {followUpFinished && (
          <div className='p-4 mt-3 bg-amber-50 rounded-lg border border-amber-200'>
            <div className='flex items-start'>
              <div className='flex justify-center items-center mr-3 w-10 h-10 bg-amber-100 rounded-full shrink-0'>
                <Clock className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-amber-800'>Đang cập nhật thông tin</h3>
                <p className='mt-1 text-sm text-amber-700'>
                  Cuộc gọi tái khám đã kết thúc. Thông tin y tế của bạn sẽ được bác sĩ cập nhật sớm.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='mt-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-bold text-gray-900'>Chi tiết lịch hẹn</h2>
        {getStatusBadge(appointment.status)}
      </div>

      {/* Thông tin bác sĩ */}
      <div className='p-4 bg-white rounded-lg border border-gray-100 shadow-sm'>
        <div className='flex gap-4 items-center'>
          <div className='flex justify-center items-center w-14 h-14 rounded-full bg-primary/10 text-primary'>
            <User size={24} />
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-medium'>
              {appointment.doctor.profile
                ? `${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                : 'Chưa cập nhật'}
            </h3>
            <p className='text-sm text-gray-500'>Bác sĩ phụ trách</p>
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
        </div>
      </div>

      {/* Thông tin lịch hẹn */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='p-4 bg-white rounded-lg border border-gray-100 shadow-sm'>
          <div className='flex gap-3 items-center mb-3'>
            <Calendar className='w-5 h-5 text-primary' />
            <h3 className='font-medium'>Thời gian khám</h3>
          </div>
          <div className='ml-8 space-y-2'>
            <p className='flex gap-2 items-center'>
              <span className='text-gray-500'>Ngày:</span>
              <span className='font-medium'>{format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}</span>
            </p>
            <p className='flex gap-2 items-center'>
              <span className='text-gray-500'>Giờ:</span>
              <span className='font-medium'>
                {appointment.startTime} - {appointment.endTime}
              </span>
            </p>
          </div>
        </div>

        <div className='p-4 bg-white rounded-lg border border-gray-100 shadow-sm'>
          <div className='flex gap-3 items-center mb-3'>
            <FileText className='w-5 h-5 text-primary' />
            <h3 className='font-medium'>Thông tin khám</h3>
          </div>
          <div className='ml-8 space-y-2'>
            <p className='flex gap-2 items-center'>
              <span className='text-gray-500'>Hình thức:</span>
              <span className='font-medium'>{appointment.type === 'video_call' ? 'Trực tuyến' : 'Trực tiếp'}</span>
            </p>
            {/* <p className='flex gap-2 items-center'>
              <span className='text-gray-500'>Phí khám:</span>
              <span className='font-medium'>{formatCurrency(appointment.appointmentFee)}</span>
            </p> */}
          </div>
        </div>
      </div>

      {/* Hiển thị button tham gia cuộc gọi video khi đã xác nhận và là khám online */}
      {appointment.status === 'confirmed' && appointment.type === 'video_call' && appointment.videoCallInfo && (
        <div className='p-5 bg-blue-50 rounded-lg border border-blue-200 shadow-sm'>
          <div className='flex flex-col gap-4 mb-3 md:flex-row md:items-center'>
            <div className='flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full shrink-0'>
              <Video className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-blue-800'>Cuộc gọi video</h3>
              <p className='text-sm text-blue-700'>
                Lịch hẹn của bạn đã được xác nhận vào ngày {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}{' '}
                lúc {appointment.startTime}.
              </p>
            </div>
          </div>
          {appointment.isVideoCallEnded ? (
            <div className='flex items-start p-4 mt-2 text-green-700 bg-green-50 rounded-md border border-green-200'>
              <CheckCircle className='shrink-0 mt-0.5 mr-3 w-5 h-5 text-green-500' />
              <div>
                <p className='font-medium'>Cuộc gọi video đã hoàn thành</p>
                <p className='mt-1 text-sm'>Cảm ơn bạn đã tham gia cuộc gọi với bác sĩ.</p>
              </div>
            </div>
          ) : (
            <>
              <div className='p-4 mt-2 bg-white rounded-md border border-blue-100'>
                <p className='mb-3 text-sm font-medium text-blue-700'>Bạn có thể tham gia cuộc gọi khi đến giờ hẹn.</p>

                {!canJoin && timeUntil && (
                  <div className='flex items-center p-3 mb-3 text-sm text-orange-600 bg-orange-50 rounded-md border border-orange-100'>
                    <Clock className='mr-2 w-4 h-4 shrink-0' />
                    <span>Còn {timeUntil} nữa đến giờ khám. Vui lòng quay lại sau.</span>
                  </div>
                )}

                <div className='flex flex-col gap-3 sm:flex-row'>
                  <Button
                    onClick={handleJoinMeeting}
                    className='bg-blue-600 hover:bg-blue-700'
                    disabled={
                      !canJoin ||
                      appointment.isVideoCallEnded ||
                      (!appointment.isVideoCallStarted && !appointment.videoCallInfo.joinedAt)
                    }
                  >
                    <Video className='mr-2 w-4 h-4' /> Tham gia cuộc gọi
                  </Button>

                  {appointment.videoCallInfo.meetingUrl && (
                    <Button
                      variant='outline'
                      className='text-blue-600 border-blue-200 hover:bg-blue-50'
                      onClick={() => {
                        navigator.clipboard.writeText(appointment.videoCallInfo?.meetingUrl || '')
                        sonnerToast.success('Đã sao chép liên kết cuộc gọi')
                      }}
                    >
                      <ExternalLink className='mr-2 w-4 h-4' /> Sao chép liên kết
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
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
                Bạn sẽ đến khám trực tiếp vào ngày {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')} lúc{' '}
                {appointment.startTime}. Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo cho bệnh nhân khi cuộc gọi đã kết thúc */}
      {appointmentFinished && (
        <div className='p-4 bg-amber-50 rounded-lg border border-amber-200 shadow-sm'>
          <div className='flex items-start'>
            <div className='flex justify-center items-center mr-3 w-10 h-10 bg-amber-100 rounded-full shrink-0'>
              <Clock className='w-5 h-5 text-amber-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-amber-800'>Đang cập nhật thông tin</h3>
              <p className='mt-1 text-sm text-amber-700'>
                Cuộc gọi đã kết thúc. Thông tin y tế của bạn sẽ được bác sĩ cập nhật sớm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin y tế */}
      <div className='mt-6'>
        <Accordion type='multiple' defaultValue={['medical_info', 'more_info']}>
          <AccordionItem value='medical_info' className='mb-3 bg-white rounded-lg border shadow-sm'>
            <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
              Khai báo y tế
            </AccordionTrigger>
            <AccordionContent className='px-4 pb-4 space-y-4'>
              <div>
                <p className='mb-1 font-medium text-gray-600'>Triệu chứng</p>
                <p className='p-3 text-gray-700 whitespace-pre-wrap bg-gray-50 rounded'>
                  {appointment.medicalInfo?.symptoms || 'Không có thông tin'}
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
                {appointment.isFollowUp && (
                  <li className='flex gap-2 items-center'>
                    <CalendarPlus className='w-4 h-4 text-blue-500 shrink-0' />
                    <span className='text-blue-600'>Đây là lịch tái khám</span>
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* Thêm review section cho các lịch đã hoàn thành */}
      {appointment.status === 'completed' && (
        <ReviewSection
          appointmentId={appointmentId}
          isCompleted={appointment.status === 'completed'}
          userRole='patient'
        />
      )}
      {hasFollowUps && (
        <div className='mt-4'>
          <h3 className='mb-3 text-base font-medium'>Lịch sử tái khám ({appointment.followUpAppointments.length})</h3>
          <Accordion type='multiple'>
            {appointment.followUpAppointments.map((followUp, index) => (
              <AccordionItem
                key={`followup_${index}`}
                value={`followup_${index}`}
                className='mb-3 bg-white rounded-lg border border-blue-100 shadow-sm'
              >
                <AccordionTrigger className='px-4 py-3 font-medium hover:no-underline'>
                  <div className='flex justify-between items-center mr-2 w-full'>
                    <div
                      className={`flex items-center ${
                        followUp.status === 'pending'
                          ? 'text-yellow-700'
                          : followUp.status === 'confirmed'
                            ? 'text-blue-700'
                            : followUp.status === 'completed'
                              ? 'text-green-700'
                              : 'text-red-700'
                      }`}
                    >
                      <CalendarPlus className='mr-2 w-4 h-4' />
                      <span className={`font-medium`}>
                        Tái khám #{index + 1} - {format(new Date(followUp.appointmentDate), 'dd/MM/yyyy')}{' '}
                        {followUp.startTime} - {followUp.endTime}
                      </span>
                    </div>
                    {getStatusBadge(followUp.status)}
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  {renderFollowUpAppointmentCard(followUp, index)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  )
}
