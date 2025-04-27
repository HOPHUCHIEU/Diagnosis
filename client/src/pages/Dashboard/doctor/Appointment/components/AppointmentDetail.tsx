import { Button } from '@/components/ui/button'
import { CustomNotification } from '@/components/CustomReactToastify'
import { Textarea } from '@/components/ui/textarea'
import {
  useApproveAppointmentMutation,
  useCancelAppointmentMutation,
  useGetAppointmentDetailQuery,
  useUpdateMedicalInfoMutation,
  useCreateFollowUpAppointmentMutation
} from '@/redux/services/appointmentApi'
import { format, addDays } from 'date-fns'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { toast as sonnerToast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Video,
  CheckCircle,
  Edit,
  Plus,
  Calendar,
  User,
  FileText,
  CalendarPlus,
  XCircle,
  Clipboard,
  Minus,
  Copy,
  Stethoscope,
  X
} from 'lucide-react'
import { useJoinVideoCall } from '@/hooks/useJoinVideoCall'
import { bufferToHex } from '@/utils/utils'
import { Input } from '@/components/ui/input'
import ReviewSection from '@/components/Review/ReviewSection'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Appointment } from '@/types/appointment.type'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

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

export default function AppointmentDetail({ appointmentId, onClose }: Props) {
  const { data, isLoading, refetch } = useGetAppointmentDetailQuery(appointmentId, { refetchOnMountOrArgChange: true })
  const [approveAppointment] = useApproveAppointmentMutation()
  const [cancelAppointment] = useCancelAppointmentMutation()
  const [updateMedicalInfo, { isLoading: isUpdatingMedicalInfo }] = useUpdateMedicalInfoMutation()
  const [createFollowUpAppointment, { isLoading: isCreatingFollowUp }] = useCreateFollowUpAppointmentMutation()
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [showMedicalForm, setShowMedicalForm] = useState(false)
  const [currentAppointmentId, setCurrentAppointmentId] = useState(appointmentId)
  const [medicalReason, setMedicalReason] = useState('')
  const [medications, setMedications] = useState<string[]>([''])
  const [notes, setNotes] = useState('')
  // Thêm state để theo dõi các appointment đã cập nhật thông tin y tế
  const [updatedMedicalInfoIds, setUpdatedMedicalInfoIds] = useState<string[]>([])
  // Thêm state để quản lý trạng thái của dialog cập nhật thông tin y tế riêng biệt
  const [openMedicalDialog, setOpenMedicalDialog] = useState(false)

  // States for follow-up appointment
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpStartTime, setFollowUpStartTime] = useState('')
  const [followUpEndTime, setFollowUpEndTime] = useState('')
  const [followUpType, setFollowUpType] = useState<'video_call' | 'in_person'>('video_call')
  const [followUpReason, setFollowUpReason] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')

  const { joinVideoCall, canJoinVideoCall, getTimeUntilJoinable, isLoadingMeetings, hasVideoCallPermission } =
    useJoinVideoCall({ isDev: true })

  // Always declare useEffect hooks outside of any conditional blocks
  // Cập nhật giờ kết thúc tự động dựa trên giờ bắt đầu (30 phút sau)
  useEffect(() => {
    if (followUpStartTime) {
      const [hours, minutes] = followUpStartTime.split(':').map(Number)
      const endTimeDate = new Date()
      endTimeDate.setHours(hours, minutes + 30)
      setFollowUpEndTime(
        `${String(endTimeDate.getHours()).padStart(2, '0')}:${String(endTimeDate.getMinutes()).padStart(2, '0')}`
      )
    }
  }, [followUpStartTime])

  if (isLoading || !data || isLoadingMeetings)
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <div className='w-8 h-8 border-b-2 rounded-full animate-spin border-primary'></div>
      </div>
    )

  const appointment = data.data
  const apptId = bufferToHex(appointment._id)

  // Check if this appointment has follow-up appointments
  const hasFollowUps = appointment.followUpAppointments && appointment.followUpAppointments.length > 0

  const handleApprove = async () => {
    try {
      await approveAppointment(appointmentId).unwrap()
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Đã xác nhận lịch hẹn'
        }
      })
      onClose()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Không thể xác nhận lịch hẹn'
        }
      })
    }
  }

  const handleCancel = async () => {
    try {
      await cancelAppointment({
        id: appointmentId,
        reason: cancelReason
      }).unwrap()
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công!',
          content: 'Đã hủy lịch hẹn'
        }
      })
      onClose()
    } catch (error) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thất bại!',
          content: 'Không thể hủy lịch hẹn'
        }
      })
    }
  }

  // Kiểm tra xem bác sĩ có thể tham gia cuộc gọi hay không (trước 30 phút)
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
  const pendingMedicalInfo =
    appointment.status === 'confirmed' &&
    ((appointment.type === 'video_call' && isCallEnded) || appointment.type === 'in_person')

  // Thêm hàm xử lý thêm, xóa và cập nhật thuốc
  const handleAddMedication = () => {
    setMedications([...medications, ''])
  }

  const handleRemoveMedication = (index: number) => {
    const newMedications = [...medications]
    newMedications.splice(index, 1)
    setMedications(newMedications.length ? newMedications : [''])
  }

  const handleMedicationChange = (index: number, value: string) => {
    const newMedications = [...medications]
    newMedications[index] = value
    setMedications(newMedications)
  }

  // Xử lý mở form cập nhật thông tin y tế
  const handleOpenMedicalInfoForm = (appointmentIdToUpdate: string) => {
    setCurrentAppointmentId(appointmentIdToUpdate)
    setMedicalReason('')
    setMedications([''])
    setNotes('')
    setOpenMedicalDialog(true)
  }

  const handleSubmitMedicalInfo = async () => {
    if (!medicalReason) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thiếu thông tin',
          content: 'Vui lòng nhập chuẩn đoán cho bệnh nhân'
        }
      })
      return
    }

    try {
      toast.loading(CustomNotification, {
        data: {
          title: 'Đang xử lý',
          content: 'Đang cập nhật thông tin y tế...'
        }
      })

      // Lọc bỏ các phần tử rỗng trong mảng thuốc
      const filteredMedications = medications.filter((med) => med.trim() !== '')

      await updateMedicalInfo({
        id: currentAppointmentId, // Sử dụng currentAppointmentId thay vì appointmentId
        status: 'completed',
        medicalInfo: {
          reason: medicalReason,
          symptoms: appointment.medicalInfo?.symptoms,
          currentMedications: filteredMedications,
          notes
        }
      }).unwrap()

      toast.dismiss()
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công',
          content: 'Đã cập nhật thông tin y tế'
        }
      })

      // Thêm ID của lịch hẹn đã cập nhật vào danh sách
      setUpdatedMedicalInfoIds((prev) => [...prev, currentAppointmentId])

      // Reset form
      setOpenMedicalDialog(false)
      setMedicalReason('')
      setMedications([''])
      setNotes('')
      setCurrentAppointmentId(appointmentId) // Reset lại appointment ID
    } catch (error) {
      toast.dismiss()
      toast.error(CustomNotification, {
        data: {
          title: 'Lỗi',
          content: 'Không thể cập nhật thông tin y tế. Vui lòng thử lại sau.'
        }
      })
      console.error('Error updating medical info:', error)
    }
  }

  // Xác định nội dung nút tham gia cuộc gọi dựa vào trạng thái
  const joinButtonText = isCallStarted ? 'Tham gia cuộc gọi' : 'Bắt đầu cuộc gọi'

  // Handle create follow-up appointment
  const handleCreateFollowUpAppointment = async () => {
    if (!followUpDate || !followUpStartTime || !followUpEndTime || !followUpReason) {
      toast.error(CustomNotification, {
        data: {
          title: 'Thiếu thông tin',
          content: 'Vui lòng điền đầy đủ thông tin tái khám'
        }
      })
      return
    }

    try {
      toast.loading(CustomNotification, {
        data: {
          title: 'Đang xử lý',
          content: 'Đang tạo lịch tái khám...'
        }
      })

      await createFollowUpAppointment({
        originalAppointmentId: appointmentId,
        appointmentDate: followUpDate,
        startTime: followUpStartTime,
        endTime: followUpEndTime,
        type: followUpType,
        reason: followUpReason,
        notes: followUpNotes
      }).unwrap()

      toast.dismiss()
      toast.success(CustomNotification, {
        data: {
          title: 'Thành công',
          content: 'Đã tạo lịch tái khám'
        }
      })

      // Reset form và đóng form
      setShowFollowUpForm(false)
      setFollowUpDate('')
      setFollowUpStartTime('')
      setFollowUpEndTime('')
      setFollowUpType('video_call')
      setFollowUpReason('')
      setFollowUpNotes('')

      // Refresh để lấy thông tin mới
      refetch()
    } catch (error) {
      toast.dismiss()
      toast.error(CustomNotification, {
        data: {
          title: 'Lỗi',
          content: 'Không thể tạo lịch tái khám. Vui lòng thử lại sau.'
        }
      })
      console.error('Error creating follow-up appointment:', error)
    }
  }

  // Render follow-up appointment card
  const renderFollowUpAppointmentCard = (followUpAppointment: Appointment, index: number) => {
    const followUpApptId = bufferToHex(followUpAppointment._id)
    const canJoinFollowUp = canJoinVideoCall(followUpAppointment.appointmentDate, followUpAppointment.startTime, true)

    const isFollowUpCallStarted =
      followUpAppointment.isVideoCallStarted || (followUpAppointment.videoCallInfo?.joinedAt ? true : false)
    const isFollowUpCallEnded = followUpAppointment.isVideoCallEnded || false

    const pendingFollowUpMedicalInfo =
      followUpAppointment.status === 'confirmed' &&
      ((followUpAppointment.type === 'video_call' && isFollowUpCallEnded) || followUpAppointment.type === 'in_person')

    return (
      <div key={followUpApptId} className='p-4 mb-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <p className='font-medium'>Bệnh nhân</p>
            <p>
              {appointment.patient.profile
                ? `${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`
                : 'Chưa cập nhật'}
            </p>
          </div>
          <div>
            <p className='font-medium'>Ngày khám</p>
            <p>{format(new Date(followUpAppointment.appointmentDate), 'dd/MM/yyyy')}</p>
          </div>
          <div>
            <p className='font-medium'>Thời gian</p>
            <p>
              {followUpAppointment.startTime} - {followUpAppointment.endTime}
            </p>
          </div>
          <div>
            <p className='font-medium'>Hình thức khám</p>
            <p>{followUpAppointment.type === 'video_call' ? 'Trực tuyến' : 'Trực tiếp'}</p>
          </div>
        </div>

        {/* Hiển thị thông tin cuộc gọi video cho lịch tái khám */}
        {followUpAppointment.status === 'confirmed' &&
          followUpAppointment.type === 'video_call' &&
          followUpAppointment.videoCallInfo && (
            <div className='p-4 mt-3 border border-blue-200 rounded-lg bg-blue-50'>
              <div className='space-y-2'>
                <h3 className='font-medium text-blue-800'>Thông tin cuộc gọi video</h3>
                <p className='text-sm text-blue-700'>
                  Tái khám trực tuyến vào ngày {format(new Date(followUpAppointment.appointmentDate), 'dd/MM/yyyy')} lúc{' '}
                  {followUpAppointment.startTime}.
                </p>

                {/* Hiển thị thông báo khác nhau tùy vào trạng thái cuộc gọi */}
                {followUpAppointment.isVideoCallEnded ? (
                  <div className='p-3 text-green-700 border border-green-200 rounded-md bg-green-50'>
                    <p className='flex items-center'>
                      <CheckCircle className='w-5 h-5 mr-2 text-green-500' />
                      Cuộc gọi video đã kết thúc
                    </p>
                  </div>
                ) : !isFollowUpCallStarted ? (
                  <div className='p-3 text-blue-700 border border-blue-200 rounded-md bg-blue-50'>
                    <p className='flex items-center'>
                      <Video className='w-5 h-5 mr-2 text-blue-500' />
                      Bắt đầu cuộc gọi với bệnh nhân
                    </p>
                  </div>
                ) : (
                  <div className='p-3 text-blue-700 border border-blue-200 rounded-md bg-blue-50'>
                    <p className='flex items-center'>
                      <Video className='w-5 h-5 mr-2 text-blue-500' />
                      Cuộc gọi đang diễn ra
                    </p>
                  </div>
                )}

                {!followUpAppointment.isVideoCallEnded && (
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
                      disabled={!canJoinFollowUp}
                    >
                      <Video className='w-4 h-4 mr-2' /> Tham gia cuộc gọi
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Thông báo nhắc nhở cho khám trực tiếp - lịch tái khám */}
        {followUpAppointment.type === 'in_person' && followUpAppointment.status === 'confirmed' && (
          <div className='p-4 mt-3 border border-blue-200 rounded-lg bg-blue-50'>
            <div className='flex items-start gap-3'>
              <div className='flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full shrink-0'>
                <Calendar className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-blue-800'>Nhắc nhở lịch tái khám trực tiếp</h3>
                <p className='mt-1 text-sm text-blue-700'>
                  Lịch tái khám trực tiếp vào ngày {format(new Date(followUpAppointment.appointmentDate), 'dd/MM/yyyy')}{' '}
                  lúc {followUpAppointment.startTime}. Hãy chuẩn bị sẵn sàng để đón tiếp bệnh nhân.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo cần cập nhật hồ sơ bệnh án cho lịch tái khám video */}
        {pendingFollowUpMedicalInfo && !updatedMedicalInfoIds.includes(followUpApptId) && (
          <div className='p-4 mt-3 border rounded-lg bg-amber-50 border-amber-200'>
            <div className='flex items-start'>
              <Clipboard className='mr-3 w-5 h-5 text-amber-500 mt-0.5' />
              <div>
                <h3 className='font-medium text-amber-800'>Cập nhật hồ sơ bệnh án</h3>
                <p className='text-sm text-amber-700'>
                  Cuộc gọi video tái khám đã kết thúc. Vui lòng cập nhật thông tin y tế cho bệnh nhân.
                </p>
                <DialogTrigger asChild>
                  <Button
                    className='mt-2 bg-amber-600 hover:bg-amber-700'
                    size='sm'
                    onClick={() => handleOpenMedicalInfoForm(followUpApptId)}
                  >
                    Cập nhật thông tin y tế
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo cần cập nhật hồ sơ bệnh án sau khám trực tiếp - lịch tái khám */}
        {followUpAppointment.status === 'confirmed' &&
          followUpAppointment.type === 'in_person' &&
          !updatedMedicalInfoIds.includes(followUpApptId) && (
            <div className='p-4 mt-3 border rounded-lg bg-amber-50 border-amber-200'>
              <div className='flex items-start'>
                <Clipboard className='mr-3 w-5 h-5 text-amber-500 mt-0.5' />
                <div>
                  <h3 className='font-medium text-amber-800'>Cập nhật hồ sơ bệnh án</h3>
                  <p className='text-sm text-amber-700'>
                    Sau khi hoàn thành buổi tái khám trực tiếp, vui lòng cập nhật thông tin y tế cho bệnh nhân.
                  </p>
                  <DialogTrigger asChild>
                    <Button
                      className='mt-2 bg-amber-600 hover:bg-amber-700'
                      size='sm'
                      onClick={() => handleOpenMedicalInfoForm(followUpApptId)}
                    >
                      Cập nhật thông tin y tế
                    </Button>
                  </DialogTrigger>
                </div>
              </div>
            </div>
          )}

        {/* Hiển thị đơn thuốc cho lịch tái khám đã hoàn thành */}
        {followUpAppointment.status === 'completed' && followUpAppointment.medicalInfo && (
          <div className='mt-3'>
            <AccordionItem
              value={`prescription_followup_${index}`}
              className='mb-3 bg-white border border-green-200 rounded-lg shadow-sm'
            >
              <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
                <div className='flex items-center'>
                  <FileText className='w-4 h-4 mr-2 text-green-600' />
                  <span className='text-green-700'>Đơn thuốc tái khám</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-4 pb-4 space-y-4'>
                {followUpAppointment.medicalInfo?.reason && (
                  <div>
                    <p className='mb-1 font-medium text-green-600'>Chuẩn đoán</p>
                    <p className='p-3 text-gray-700 whitespace-pre-wrap border border-green-100 rounded-md bg-green-50'>
                      {followUpAppointment.medicalInfo.reason}
                    </p>
                  </div>
                )}
                {followUpAppointment.medicalInfo?.currentMedications &&
                  followUpAppointment.medicalInfo.currentMedications.length > 0 && (
                    <div>
                      <p className='mb-1 font-medium text-green-600'>Thuốc</p>
                      <div className='p-3 border border-green-100 rounded-md bg-green-50'>
                        <ul className='space-y-1 text-gray-700 list-decimal list-inside'>
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
                    <p className='p-3 text-gray-700 whitespace-pre-wrap border border-green-100 rounded-md bg-green-50'>
                      {followUpAppointment.medicalInfo.notes}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='mt-6 space-y-6'>
      {/* Form cập nhật thông tin y tế - Dialog riêng biệt */}
      <Dialog open={openMedicalDialog} onOpenChange={setOpenMedicalDialog}>
        <DialogContent>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold'>Cập nhật thông tin y tế</h3>
          </div>

          <div className='space-y-4'>
            <div>
              <Label className='font-medium'>Chuẩn đoán</Label>
              <Textarea
                placeholder='Nhập chuẩn đoán của bác sĩ'
                value={medicalReason}
                onChange={(e) => setMedicalReason(e.target.value)}
                className='min-h-[80px]'
              />
            </div>

            <div>
              <Label className='block mb-2 font-medium'>Thuốc</Label>
              {medications.map((med, index) => (
                <div key={index} className='flex gap-2 mb-2'>
                  <Input
                    placeholder={`Thuốc ${index + 1}`}
                    value={med}
                    onChange={(e) => handleMedicationChange(index, e.target.value)}
                    className='flex-1'
                  />
                  {medications.length > 1 && (
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => handleRemoveMedication(index)}
                      className='max-h-9 max-w-9 shrink-0'
                    >
                      <Minus className='w-4 h-4' />
                    </Button>
                  )}
                  {index === medications.length - 1 && (
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={handleAddMedication}
                      className='max-h-9 max-w-9 shrink-0'
                    >
                      <Plus className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <Label className='font-medium'>Ghi chú</Label>
              <Textarea
                placeholder='Ghi chú thêm (không bắt buộc)'
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className='min-h-[80px]'
              />
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <Button variant='outline' onClick={() => setOpenMedicalDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmitMedicalInfo} disabled={isUpdatingMedicalInfo || !medicalReason.trim()}>
                {isUpdatingMedicalInfo ? 'Đang cập nhật...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-bold'>Chi tiết lịch hẹn</h2>
          {getStatusBadge(appointment.status)}
        </div>

        {/* Thông tin bệnh nhân */}
        <div className='p-4 bg-white border border-gray-100 rounded-lg shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center rounded-full w-14 h-14 bg-primary/10 text-primary'>
              <User size={24} />
            </div>
            <div>
              <h3 className='text-lg font-medium'>
                {appointment.patient.profile
                  ? `${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`
                  : 'Chưa cập nhật'}
              </h3>
              <p className='text-sm text-gray-500'>Bệnh nhân</p>

              <div className='flex items-center gap-1 mt-1'>
                <p className='text-xs text-gray-500'>ID: {bufferToHex(appointment.patient._id)}</p>
                <Button
                  variant='ghost'
                  size='icon'
                  className='w-4 h-4'
                  onClick={() => {
                    navigator.clipboard.writeText(bufferToHex(appointment.patient._id))
                    sonnerToast.success('Đã sao chép ID bệnh nhân')
                  }}
                >
                  <Copy className='w-3 h-3' />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin bác sĩ */}
        <div className='p-4 bg-white border border-gray-100 rounded-lg shadow-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center text-green-600 bg-green-100 rounded-full w-14 h-14'>
              <Stethoscope size={24} />
            </div>
            <div>
              <h3 className='text-lg font-medium'>
                {appointment.doctor.profile
                  ? `${appointment.doctor.profile.firstName} ${appointment.doctor.profile.lastName}`
                  : 'Chưa cập nhật'}
              </h3>
              <p className='text-sm text-gray-500'>Bác sĩ</p>

              <div className='flex items-center gap-1 mt-1'>
                <p className='text-xs text-gray-500'>ID: {bufferToHex(appointment.doctor._id)}</p>
                <Button
                  variant='ghost'
                  size='icon'
                  className='w-4 h-4'
                  onClick={() => {
                    navigator.clipboard.writeText(bufferToHex(appointment.doctor._id))
                    sonnerToast.success('Đã sao chép ID bác sĩ')
                  }}
                >
                  <Copy className='w-3 h-3' />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin lịch hẹn */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='p-4 bg-white border border-gray-100 rounded-lg shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <Calendar className='w-5 h-5 text-primary' />
              <h3 className='font-medium'>Thời gian khám</h3>
            </div>
            <div className='ml-8 space-y-2'>
              <p className='flex items-center gap-2'>
                <span className='text-gray-500'>Ngày:</span>
                <span className='font-medium'>{format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}</span>
              </p>
              <p className='flex items-center gap-2'>
                <span className='text-gray-500'>Giờ:</span>
                <span className='font-medium'>
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </p>
            </div>
          </div>

          <div className='p-4 bg-white border border-gray-100 rounded-lg shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <FileText className='w-5 h-5 text-primary' />
              <h3 className='font-medium'>Thông tin khám</h3>
            </div>
            <div className='ml-8 space-y-2'>
              <p className='flex items-center gap-2'>
                <span className='text-gray-500'>Hình thức:</span>
                <span className='font-medium'>{appointment.type === 'video_call' ? 'Trực tuyến' : 'Trực tiếp'}</span>
              </p>
              {/* <p className='flex items-center gap-2'>
              <span className='text-gray-500'>Phí khám:</span>
              <span className='font-medium'>{formatCurrency(appointment.appointmentFee)}</span>
            </p> */}
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin cuộc gọi video cho bác sĩ */}
        {appointment.status === 'confirmed' && appointment.type === 'video_call' && appointment.videoCallInfo && (
          <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
            <div className='space-y-2'>
              <h3 className='font-medium text-blue-800'>Cuộc gọi video với bệnh nhân</h3>
              <p className='text-sm text-blue-700'>
                Lịch hẹn đã được xác nhận. Bạn có thể bắt đầu cuộc gọi video vào ngày{' '}
                {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')} lúc {appointment.startTime}.
              </p>

              {/* Hiển thị thông báo khác nhau tùy vào trạng thái cuộc gọi */}
              {appointment.isVideoCallEnded ? (
                <div className='p-3 text-green-700 border border-green-200 rounded-md bg-green-50'>
                  <p className='flex items-center'>
                    <CheckCircle className='w-5 h-5 mr-2 text-green-500' />
                    Cuộc gọi video đã kết thúc
                  </p>
                </div>
              ) : isCallStarted ? (
                <>
                  <div className='p-2 mb-2 text-sm text-green-600 rounded bg-green-50'>
                    <p className='flex items-center'>
                      <CheckCircle className='w-4 h-4 mr-2 text-green-500' />
                      Cuộc gọi đã được bắt đầu
                    </p>
                  </div>
                  <p className='text-sm font-medium text-blue-700'>
                    Bác sĩ có thể tham gia cuộc gọi trước 30 phút so với giờ hẹn.
                  </p>

                  {!canJoin && timeUntil && (
                    <div className='p-2 text-sm text-orange-600 rounded bg-orange-50'>
                      Bạn có thể tham gia cuộc gọi sau: {timeUntil}
                    </div>
                  )}

                  <div className='flex flex-col gap-2 sm:flex-row'>
                    <Button
                      onClick={handleJoinMeeting}
                      className='bg-primary hover:bg-blue-700'
                      disabled={!canJoin || appointment.isVideoCallEnded}
                    >
                      <Video className='w-4 h-4 mr-2' /> Tham gia cuộc gọi
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        navigator.clipboard.writeText(appointment.videoCallInfo?.meetingUrl || '')
                        sonnerToast.success('Đã sao chép liên kết cuộc gọi')
                      }}
                    >
                      Sao chép liên kết
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className='p-3 mb-2 text-blue-700 border border-blue-200 rounded-md bg-blue-50'>
                    <p className='font-medium'>Cuộc gọi chưa bắt đầu</p>
                    <p className='mt-1 text-sm'>Bạn cần bắt đầu cuộc gọi để bệnh nhân có thể tham gia.</p>
                  </div>

                  {!canJoin && timeUntil && (
                    <div className='p-2 text-sm text-orange-600 rounded bg-orange-50'>
                      Bạn có thể tham gia cuộc gọi sau: {timeUntil}
                    </div>
                  )}

                  <div className='flex flex-col gap-2 sm:flex-row'>
                    <Button
                      onClick={handleJoinMeeting}
                      className='bg-primary hover:bg-blue-700'
                      disabled={!canJoin || appointment.isVideoCallEnded}
                    >
                      <Video className='w-4 h-4 mr-2' /> {joinButtonText}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        navigator.clipboard.writeText(appointment.videoCallInfo?.meetingUrl || '')
                        sonnerToast.success('Đã sao chép liên kết cuộc gọi')
                      }}
                    >
                      Sao chép liên kết
                    </Button>
                  </div>
                </>
              )}
              <p className='text-xs text-blue-700'>ID: {appointment.videoCallInfo.meetingId}</p>
            </div>
          </div>
        )}

        {/* Thông báo nhắc nhở cho khám trực tiếp */}
        {appointment.type === 'in_person' && appointment.status === 'confirmed' && (
          <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
            <div className='flex items-start gap-3'>
              <div className='flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full shrink-0'>
                <Calendar className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-blue-800'>Nhắc nhở lịch khám trực tiếp</h3>
                <p className='mt-1 text-sm text-blue-700'>
                  Bệnh nhân sẽ đến khám trực tiếp vào ngày {format(new Date(appointment.appointmentDate), 'dd/MM/yyyy')}{' '}
                  lúc {appointment.startTime}. Vui lòng chuẩn bị đầy đủ dụng cụ và phòng khám.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị form cập nhật hồ sơ bệnh án sau khi cuộc gọi kết thúc hoặc khám trực tiếp */}
        {pendingMedicalInfo && !updatedMedicalInfoIds.includes(appointmentId) && !showMedicalForm && (
          <div className='p-4 border rounded-lg bg-amber-50 border-amber-200'>
            <h3 className='mb-2 font-medium text-amber-800'>Cập nhật hồ sơ bệnh án</h3>
            <p className='mb-3 text-sm text-amber-700'>
              {appointment.type === 'video_call'
                ? 'Cuộc gọi đã kết thúc. Bạn cần cập nhật thông tin y tế cho bệnh nhân này.'
                : 'Sau khi khám trực tiếp, vui lòng cập nhật thông tin y tế cho bệnh nhân.'}
            </p>
            <DialogTrigger asChild>
              <Button onClick={() => setOpenMedicalDialog(true)} className='bg-amber-600 hover:bg-amber-700'>
                <Edit className='w-4 h-4 mr-2' /> Cập nhật thông tin y tế
              </Button>
            </DialogTrigger>
          </div>
        )}

        <div className='space-y-4'>
          {/* Accordion Sections */}
          <Accordion type='multiple' defaultValue={['medical_info', 'more_info']}>
            <AccordionItem value='medical_info' className='mb-3 bg-white border rounded-lg shadow-sm'>
              <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
                Khai báo y tế
              </AccordionTrigger>
              <AccordionContent className='px-4 pb-4 space-y-4'>
                <div>
                  <p className='mb-1 font-medium text-gray-600'>Triệu chứng</p>
                  <p className='p-3 text-gray-700 whitespace-pre-wrap rounded bg-gray-50'>
                    {(appointment.medicalInfo?.symptoms && appointment.medicalInfo.symptoms) || 'Không có thông tin'}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {appointment.cancelReason && (
              <AccordionItem value='cancel_info' className='mb-3 bg-white border border-red-200 rounded-lg shadow-sm'>
                <AccordionTrigger className='px-4 py-3 text-base font-medium text-red-500 hover:no-underline'>
                  Thông tin hủy lịch
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4'>
                  <div className='p-3 border border-red-100 rounded-md bg-red-50'>
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
              <AccordionItem
                value='prescription'
                className='mb-3 bg-white border border-green-200 rounded-lg shadow-sm'
              >
                <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
                  <div className='flex items-center'>
                    <FileText className='w-4 h-4 mr-2 text-green-600' />
                    <span className='text-green-700'>Đơn thuốc</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='px-4 pb-4 space-y-4'>
                  {appointment.medicalInfo?.reason && (
                    <div>
                      <p className='mb-1 font-medium text-green-600'>Chuẩn đoán</p>
                      <p className='p-3 text-gray-700 whitespace-pre-wrap border border-green-100 rounded-md bg-green-50'>
                        {appointment.medicalInfo.reason}
                      </p>
                    </div>
                  )}
                  {appointment.medicalInfo?.currentMedications &&
                    appointment.medicalInfo.currentMedications.length > 0 && (
                      <div>
                        <p className='mb-1 font-medium text-green-600'>Thuốc</p>
                        <div className='p-3 border border-green-100 rounded-md bg-green-50'>
                          <ul className='space-y-1 text-gray-700 list-decimal list-inside'>
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
                      <p className='p-3 text-gray-700 whitespace-pre-wrap border border-green-100 rounded-md bg-green-50'>
                        {appointment.medicalInfo.notes}
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value='more_info' className='mb-3 bg-white border rounded-lg shadow-sm'>
              <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
                Thông tin thêm
              </AccordionTrigger>
              <AccordionContent className='px-4 pb-4'>
                <ul className='space-y-2 text-sm text-gray-600'>
                  <li className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-gray-400 shrink-0' />
                    <span>Đặt lịch lúc: {format(new Date(appointment.createdAt), 'HH:mm dd/MM/yyyy')}</span>
                  </li>
                  {appointment.isRescheduled && (
                    <li className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-amber-400 shrink-0' />
                      <span className='text-amber-600'>Đã được đổi lịch</span>
                    </li>
                  )}
                  {appointment.approvedAt && (
                    <li className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-green-500 shrink-0' />
                      <span>Xác nhận lúc: {format(new Date(appointment.approvedAt), 'HH:mm dd/MM/yyyy')}</span>
                    </li>
                  )}
                  {appointment.type === 'video_call' && (
                    <>
                      <li className='flex items-center gap-2'>
                        <Video className='w-4 h-4 text-blue-500 shrink-0' />
                        <span>
                          Trạng thái cuộc gọi:{' '}
                          <span className={appointment.isVideoCallStarted ? 'text-green-600' : 'text-amber-600'}>
                            {appointment.isVideoCallStarted ? 'Đã bắt đầu' : 'Chưa bắt đầu'}
                          </span>
                        </span>
                      </li>
                      {appointment.isVideoCallEnded && (
                        <li className='flex items-center gap-2'>
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
            userRole='doctor'
          />
        )}

        {appointment.status === 'pending' && (
          <div className='flex gap-2'>
            <Button onClick={handleApprove}>Xác nhận lịch hẹn</Button>
            <Button variant='destructive' onClick={() => setShowCancelForm(true)}>
              Từ chối
            </Button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          // <div className='flex justify-end'>
          //   <Button variant='destructive' onClick={() => setShowCancelForm(true)}>
          //     Hủy lịch hẹn
          //   </Button>
          // </div>
          <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
            <h3 className='mb-2 font-medium text-red-800'>Hủy lịch hẹn</h3>
            <p className='mb-3 text-sm text-red-700'>
              Nếu bạn muốn hủy lịch hẹn này, vui lòng nhấn nút bên dưới và cung cấp lý do hủy lịch. Bệnh nhân sẽ nhận
              được thông báo về việc hủy lịch hẹn.
            </p>
            <Button variant='destructive' onClick={() => setShowCancelForm(!showCancelForm)}>
              <X className='w-4 h-4 mr-2' /> Hủy lịch hẹn
            </Button>
          </div>
        )}

        {showCancelForm && (
          <div className='space-y-2'>
            <Textarea
              placeholder={appointment.status === 'pending' ? 'Lý do từ chối...' : 'Lý do hủy lịch...'}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowCancelForm(false)}>
                Hủy
              </Button>
              <Button variant='destructive' onClick={handleCancel} disabled={!cancelReason}>
                {appointment.status === 'pending' ? 'Xác nhận từ chối' : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        )}
        {appointment.status === 'completed' && !appointment.isFollowUp && (
          <div className='flex justify-center mt-4'>
            {!showFollowUpForm ? (
              <Button onClick={() => setShowFollowUpForm(true)} variant='default' effect='ringHover'>
                <CalendarPlus className='w-4 h-4 mr-2' />
                Tạo lịch tái khám
              </Button>
            ) : (
              <div className='w-full p-4 space-y-4 border border-blue-200 rounded-lg bg-blue-50'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold text-blue-800'>Tạo lịch tái khám</h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowFollowUpForm(false)}
                    className='text-primary hover:text-blue-800'
                  >
                    <XCircle className='w-4 h-4' />
                  </Button>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='followup-date'>Ngày tái khám</Label>
                    <Input
                      id='followup-date'
                      type='date'
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='followup-start-time'>Giờ bắt đầu</Label>
                      <Input
                        id='followup-start-time'
                        type='time'
                        value={followUpStartTime}
                        onChange={(e) => setFollowUpStartTime(e.target.value)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='followup-end-time'>Giờ kết thúc</Label>
                      <Input
                        id='followup-end-time'
                        type='time'
                        value={followUpEndTime}
                        onChange={(e) => setFollowUpEndTime(e.target.value)}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Loại tái khám</Label>
                  <RadioGroup
                    value={followUpType}
                    onValueChange={(val) => setFollowUpType(val as 'video_call' | 'in_person')}
                    className='flex space-x-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='video_call' id='video_call' />
                      <Label htmlFor='video_call' className='cursor-pointer'>
                        Khám trực tuyến
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='in_person' id='in_person' />
                      <Label htmlFor='in_person' className='cursor-pointer'>
                        Khám trực tiếp
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='followup-reason'>Lý do tái khám</Label>
                  <Textarea
                    id='followup-reason'
                    value={followUpReason}
                    onChange={(e) => setFollowUpReason(e.target.value)}
                    placeholder='Nhập lý do tái khám'
                    rows={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='followup-notes'>Ghi chú</Label>
                  <Textarea
                    id='followup-notes'
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder='Ghi chú thêm (không bắt buộc)'
                    rows={2}
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setShowFollowUpForm(false)}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreateFollowUpAppointment}
                    disabled={isCreatingFollowUp || !followUpDate || !followUpStartTime || !followUpReason}
                    className='bg-primary hover:bg-blue-700'
                  >
                    {isCreatingFollowUp ? 'Đang xử lý...' : 'Tạo lịch tái khám'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        {hasFollowUps && (
          <div className='mt-4'>
            <h3 className='mb-3 text-base font-medium'>Lịch sử tái khám ({appointment.followUpAppointments.length})</h3>
            <Accordion type='multiple'>
              {appointment.followUpAppointments.map((followUp, index) => (
                <AccordionItem
                  key={`followup_${index}`}
                  value={`followup_${index}`}
                  className='mb-3 bg-white border border-blue-100 rounded-lg shadow-sm'
                >
                  <AccordionTrigger className='px-4 py-3 font-medium hover:no-underline'>
                    <div className='flex items-center justify-between w-full mr-2'>
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
                        <CalendarPlus className='w-4 h-4 mr-2' />
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
      </Dialog>
    </div>
  )
}
