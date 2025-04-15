import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  useGetVideoMeetingsQuery,
  useJoinVideoCallMutation,
  useEndVideoCallMutation
} from '@/redux/services/appointmentApi'
import { toast } from 'react-toastify'
import { useAppSelector } from '@/redux/store'
import { bufferToHex } from '@/utils/utils'

interface UseJoinVideoCallOptions {
  isDev?: boolean // Chế độ phát triển, bỏ qua các kiểm tra thời gian
}

export const useJoinVideoCall = (options?: UseJoinVideoCallOptions) => {
  const { isDev = false } = options || {}
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.authState)
  const [joinVideoCallApi] = useJoinVideoCallMutation()
  const [endVideoCallApi] = useEndVideoCallMutation()
  const {
    data: videoMeetingsData,
    isLoading: isLoadingMeetings,
    refetch
  } = useGetVideoMeetingsQuery(undefined, {
    skip: user?.role === 'user',
    // Đảm bảo dữ liệu luôn mới
    refetchOnMountOrArgChange: true
  })
  const [validMeetings, setValidMeetings] = useState<Set<string>>(new Set())
  const [appointmentMeetings, setAppointmentMeetings] = useState<Record<string, string>>({}) // meetingId -> appointmentId

  // Lấy danh sách các cuộc họp video hợp lệ khi component mount hoặc khi dữ liệu thay đổi
  useEffect(() => {
    console.log('[DEBUG useJoinVideoCall] Cập nhật danh sách cuộc họp', videoMeetingsData?.data)
    if (videoMeetingsData?.data) {
      const meetingIds = new Set(videoMeetingsData.data.map((meeting) => meeting.meetingId))
      setValidMeetings(meetingIds)

      // Lưu mapping giữa meeting ID và appointment ID
      const meetingMap: Record<string, string> = {}
      videoMeetingsData.data.forEach((meeting) => {
        const appointmentId = bufferToHex(meeting.appointmentId)
        meetingMap[meeting.meetingId] = appointmentId
      })
      setAppointmentMeetings(meetingMap)
    }
  }, [videoMeetingsData])

  /**
   * Buộc cập nhật lại danh sách cuộc họp
   */
  const refreshMeetings = useCallback(async () => {
    console.log('[DEBUG useJoinVideoCall] Refreshing meetings list')
    if (refetch) {
      try {
        await refetch()
      } catch (error) {
        console.error('[DEBUG useJoinVideoCall] Error refreshing meetings:', error)
      }
    }
  }, [refetch])

  /**
   * Kiểm tra xem meetingId có hợp lệ không
   * @param meetingId ID cuộc họp cần kiểm tra
   */
  const isMeetingIdValid = (meetingId: string): boolean => {
    // Trong chế độ phát triển, luôn trả về true
    if (isDev) return true
    return validMeetings.has(meetingId)
  }

  /**
   * Kiểm tra quyền tham gia cuộc gọi dựa trên vai trò người dùng
   */
  const hasVideoCallPermission = (): boolean => {
    if (!user) return false

    // Trong chế độ phát triển, luôn cho phép
    if (isDev) return true

    // Chỉ doctor và admin mới có quyền tạo/kết thúc cuộc gọi
    return user.role === 'admin' || user.role === 'doctor'
  }

  /**
   * Xử lý tham gia cuộc gọi video
   * @param meetingInfo Thông tin cuộc gọi video từ API
   * @param appointmentId ID cuộc hẹn nếu có
   */
  const joinVideoCall = async (
    meetingInfo: { meetingUrl?: string; meetingId?: string } | undefined,
    appointmentId?: string
  ) => {
    console.log('[DEBUG useJoinVideoCall] Join video call', { meetingInfo, appointmentId })

    // Nếu không có thông tin cuộc gọi
    if (!meetingInfo || !meetingInfo.meetingId) {
      toast.error('Không có thông tin cuộc gọi')
      return false
    }

    // Kiểm tra xem meetingId có hợp lệ không (bỏ qua kiểm tra nếu ở chế độ dev)
    if (!isDev && !isMeetingIdValid(meetingInfo.meetingId)) {
      console.log(
        '[DEBUG useJoinVideoCall] MeetingId không hợp lệ:',
        meetingInfo.meetingId,
        'ValidMeetings:',
        validMeetings
      )

      // Thử cập nhật lại danh sách cuộc họp trước khi thông báo lỗi
      await refreshMeetings()

      // Kiểm tra lại sau khi đã refresh
      if (!validMeetings.has(meetingInfo.meetingId)) {
        toast.error('ID cuộc gọi không hợp lệ')
        return false
      }
    }

    // Thông báo backend là người dùng đã tham gia cuộc gọi
    try {
      // Lấy appointmentId từ mapping nếu không được truyền vào
      const apptId = appointmentId || appointmentMeetings[meetingInfo.meetingId]

      if (apptId && (user?.role === 'doctor' || user?.role === 'admin')) {
        console.log('[DEBUG useJoinVideoCall] Gọi API bắt đầu cuộc gọi với ID:', apptId)
        await joinVideoCallApi(apptId).unwrap()
        console.log('[DEBUG useJoinVideoCall] API thành công')
      }
    } catch (error) {
      console.error('[DEBUG useJoinVideoCall] Lỗi khi đánh dấu tham gia cuộc gọi', error)
    }

    // Chuyển hướng đến trang video call
    console.log('[DEBUG useJoinVideoCall] Chuyển hướng đến phòng:', meetingInfo.meetingId)
    navigate(`/room/${meetingInfo.meetingId}`)
    return true
  }

  /**
   * Xử lý kết thúc cuộc gọi video
   * @param meetingId ID cuộc họp
   */
  const endVideoCall = async (meetingId: string) => {
    console.log('[DEBUG useJoinVideoCall] End video call', meetingId)

    // Bỏ qua kiểm tra quyền nếu đang ở chế độ phát triển
    if (!isDev && !hasVideoCallPermission()) {
      toast.error('Bạn không có quyền kết thúc cuộc gọi')
      return false
    }

    try {
      const appointmentId = appointmentMeetings[meetingId]
      if (appointmentId) {
        console.log('[DEBUG useJoinVideoCall] Gọi API kết thúc cuộc gọi với ID:', appointmentId)
        await endVideoCallApi(appointmentId).unwrap()
        toast.success('Đã kết thúc cuộc gọi')

        // Cập nhật lại danh sách cuộc họp sau khi kết thúc
        await refreshMeetings()

        return true
      } else {
        toast.error('Không tìm thấy thông tin cuộc hẹn')
        return false
      }
    } catch (error) {
      console.error('[DEBUG useJoinVideoCall] Lỗi khi kết thúc cuộc gọi', error)
      toast.error('Không thể kết thúc cuộc gọi')
      return false
    }
  }

  /**
   * Kiểm tra có thể tham gia cuộc gọi hay không dựa trên thời gian
   * @param appointmentDate Ngày hẹn
   * @param startTime Giờ bắt đầu
   * @param allowEarly Cho phép tham gia sớm 30 phút (dành cho bác sĩ và admin)
   */
  const canJoinVideoCall = (appointmentDate: string, startTime: string, allowEarly: boolean = false): boolean => {
    // Trong chế độ phát triển, luôn cho phép tham gia
    if (isDev) return true

    if (!appointmentDate || !startTime) return false

    if (allowEarly && !hasVideoCallPermission()) {
      return false // Nếu yêu cầu quyền tham gia sớm nhưng người dùng không có quyền
    }

    const appointmentDateTime = new Date(appointmentDate)
    const timeParts = startTime.split(':')
    appointmentDateTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0)

    const now = new Date()

    // Nếu là bác sĩ hoặc admin, cho phép tham gia trước 30 phút
    if (allowEarly) {
      const thirtyMinutesBefore = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000)
      return now >= thirtyMinutesBefore
    }

    // Nếu là bệnh nhân, chỉ được tham gia đúng giờ hẹn
    return now >= appointmentDateTime
  }

  /**
   * Tính thời gian còn lại trước khi có thể tham gia cuộc gọi
   * @param appointmentDate Ngày hẹn
   * @param startTime Giờ bắt đầu
   * @param allowEarly Cho phép tham gia sớm 30 phút (dành cho bác sĩ và admin)
   */
  const getTimeUntilJoinable = (
    appointmentDate: string,
    startTime: string,
    allowEarly: boolean = false
  ): string | null => {
    // Trong chế độ phát triển, luôn trả về null (đã đến thời gian tham gia)
    if (isDev) return null

    if (!appointmentDate || !startTime) return null

    if (allowEarly && !hasVideoCallPermission()) {
      return null // Nếu yêu cầu quyền tham gia sớm nhưng người dùng không có quyền
    }

    const appointmentDateTime = new Date(appointmentDate)
    const timeParts = startTime.split(':')
    appointmentDateTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0)

    const now = new Date()
    let targetTime = appointmentDateTime

    // Nếu là bác sĩ hoặc admin, mục tiêu là 30 phút trước giờ hẹn
    if (allowEarly) {
      targetTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000)
    }

    // Nếu đã đến thời gian target
    if (now >= targetTime) return null

    // Tính thời gian còn lại
    const diffMs = targetTime.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMins / 60)

    if (diffHrs > 0) {
      return `${diffHrs} giờ ${diffMins % 60} phút`
    }
    return `${diffMins} phút`
  }

  return {
    joinVideoCall,
    endVideoCall,
    canJoinVideoCall,
    getTimeUntilJoinable,
    isMeetingIdValid,
    hasVideoCallPermission,
    isLoadingMeetings,
    validMeetings,
    refreshMeetings,
    isDev // Trả về isDev để component có thể biết đang ở chế độ nào
  }
}
