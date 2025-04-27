import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { zegoCloudAppID, zegoCloudServerSecret } from '@/constants/url'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { bufferToHex } from '@/utils/utils'
import { useJoinVideoCall } from '@/hooks/useJoinVideoCall'
import {
  useGetVideoCallDataQuery,
  useJoinVideoCallMutation,
  useEndVideoCallMutation
} from '@/redux/services/appointmentApi'
import { toast } from 'react-toastify'

export default function VideoRoom() {
  const { roomId } = useParams<{ roomId: string }>()
  const myMeeting = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.authState)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const zegoInstanceRef = useRef<any>(null)
  const hasMountedRef = useRef(false)

  // Sử dụng isDev khi ở môi trường phát triển
  const { isLoadingMeetings, refreshMeetings } = useJoinVideoCall({ isDev: true })

  // RTK Query hooks
  const [joinVideoCall] = useJoinVideoCallMutation()
  const [endVideoCall] = useEndVideoCallMutation()
  const {
    data: videoCallData,
    isLoading: isLoadingVideoCallData,
    isFetching,
    isError,
    error: videoCallError,
    refetch: refetchVideoCallData
  } = useGetVideoCallDataQuery(roomId || '', {
    skip: !roomId,
    refetchOnMountOrArgChange: true,
    // Thêm polling để kiểm tra trạng thái cuộc gọi mỗi 5 giây
    pollingInterval: 5000
  })

  console.log('videoCallData', videoCallData)
  console.log('videoCallError', videoCallError)
  console.log('error', error)
  console.log('user', user)
  console.log('isFetching', isFetching)

  // Xử lý lỗi khi lấy dữ liệu
  useEffect(() => {
    if (isError && videoCallError) {
      setError('Không thể tải thông tin cuộc hẹn')
    }
  }, [isError, videoCallError])

  // Xác định liệu user hiện tại có phải là bác sĩ hoặc admin không
  const isHost = user?.role === 'doctor' || user?.role === 'admin'

  // Kiểm tra xem cuộc gọi đã kết thúc và bắt đầu chưa
  const isCallEnded = videoCallData?.data?.videoCallInfo?.endedAt ? true : false
  // Giả sử cuộc gọi đã bắt đầu nếu có joinedAt (cho trường hợp API chưa có trường isVideoCallStarted)
  const isCallStarted = videoCallData?.data?.videoCallInfo?.joinedAt ? true : false

  // Hàm để dọn dẹp kết nối với ZEGO khi rời phòng hoặc cuộc gọi kết thúc
  const cleanupZegoConnection = () => {
    console.log('[DEBUG] Bắt đầu dọn dẹp kết nối Zego')

    if (zegoInstanceRef.current) {
      try {
        // Gọi hàm dọn dẹp của ZegoUIKit (nếu có)
        if (typeof zegoInstanceRef.current.destroy === 'function') {
          console.log('[DEBUG] Gọi hàm destroy của Zego instance')
          zegoInstanceRef.current.destroy()
        }
      } catch (err) {
        console.error('Error cleaning up Zego instance:', err)
      }
      zegoInstanceRef.current = null
    }

    // Dọn dẹp các element DOM còn sót lại của Zego
    console.log('[DEBUG] Xóa các phần tử DOM của Zego')
    const zegoElements = document.querySelectorAll('[class*="zego"]')
    console.log('[DEBUG] Tìm thấy', zegoElements.length, 'phần tử Zego để xóa')
    zegoElements.forEach((el) => {
      try {
        el.remove()
      } catch (err) {
        console.error('Error removing Zego element:', err)
      }
    })

    // Dọn dẹp tất cả WebSockets
    console.log('[DEBUG] Đóng tất cả WebSocket connections')
    closeAllZegoWebSockets()

    console.log('[DEBUG] Hoàn tất dọn dẹp kết nối Zego')
  }

  // Hàm để lấy tất cả WebSocket đang mở
  const getAllWebSockets = () => {
    const connections: WebSocket[] = []

    // Method 1: Check global objects in window
    try {
      // @ts-ignore - Custom property to track WebSockets
      if (Array.isArray(window._zegoWebSockets)) {
        // @ts-ignore
        connections.push(...window._zegoWebSockets)
      }
    } catch (e) {
      console.error('[DEBUG] Error accessing custom WebSocket tracker:', e)
    }

    // Method 2: Find by inspecting DOM elements
    try {
      // Look for WebSocket references in DOM elements
      const elements = document.querySelectorAll('*')
      elements.forEach((el) => {
        try {
          // @ts-ignore
          if (el._ws instanceof WebSocket) {
            // @ts-ignore
            connections.push(el._ws)
          }
        } catch (err) {
          // Ignore errors for properties that can't be accessed
        }
      })
    } catch (e) {
      console.error('[DEBUG] Error finding WebSockets in DOM:', e)
    }

    return connections
  }

  // Hàm để lấy tất cả network interfaces (WebSockets, XHR, Fetch)
  const getNetworkInterfaces = () => {
    const interfaces: any[] = []

    // Kiểm tra các WebSocket connections
    try {
      // @ts-ignore - Đã được thiết lập bởi overrideWebSocketForZego
      if (Array.isArray(window._zegoWebSockets)) {
        // @ts-ignore
        interfaces.push(...window._zegoWebSockets)
      }

      // Kiểm tra các thuộc tính global khác có thể chứa WebSocket
      const possibleContainers = [
        // @ts-ignore
        window.zegoWebSocket,
        // @ts-ignore
        window.zc,
        // @ts-ignore
        window.zg,
        // @ts-ignore
        window.zegoClient,
        // @ts-ignore
        window.logger
      ]

      possibleContainers.forEach((container) => {
        if (container) {
          // Kiểm tra các thuộc tính có thể chứa WebSocket
          ;['ws', 'socket', 'connection', '_ws', '_socket', 'webSocket', 'logger'].forEach((prop) => {
            try {
              // @ts-ignore
              if (container[prop] instanceof WebSocket) {
                // @ts-ignore
                interfaces.push(container[prop])
              }
            } catch (e) {
              // Bỏ qua lỗi khi không thể truy cập thuộc tính
            }
          })
        }
      })
    } catch (e) {
      console.error('[DEBUG] Lỗi khi lấy network interfaces:', e)
    }

    return interfaces
  }

  // Hàm cụ thể để chặn WebSocket logger của Zegocloud
  const blockZegoLoggerWebSockets = () => {
    try {
      // Tìm tất cả các thẻ script của Zegocloud
      const zegoScripts = Array.from(document.querySelectorAll('script')).filter(
        (script) =>
          script.src &&
          (script.src.includes('zegocloud') || script.src.includes('zego') || script.src.includes('weblogger'))
      )

      console.log('[DEBUG] Tìm thấy', zegoScripts.length, 'Zego scripts để xử lý')

      // Xóa các script này khỏi DOM
      zegoScripts.forEach((script) => {
        console.log('[DEBUG] Removing Zego script:', script.src)
        script.remove()
      })

      // Tìm và ngăn chặn weblogger cụ thể
      const networkInterfaces = getNetworkInterfaces()
      if (networkInterfaces.length > 0) {
        console.log('[DEBUG] Tìm thấy', networkInterfaces.length, 'network interfaces để kiểm tra')

        // Tìm và đóng các kết nối logger
        for (const ni of networkInterfaces) {
          try {
            if (
              typeof ni.url === 'string' &&
              (ni.url.includes('weblogger-wss.coolzcloud.com/zglog/ws') || ni.url.includes('zglog/ws'))
            ) {
              console.log('[DEBUG] Đóng kết nối logger cụ thể:', ni.url)
              if (ni.close && ni.readyState !== WebSocket.CLOSED) {
                ni.close()
              }
            }
          } catch (niError) {
            console.error('[DEBUG] Lỗi khi đóng network interface:', niError)
          }
        }
      }
    } catch (error) {
      console.error('[DEBUG] Lỗi khi chặn Zego logger:', error)
    }
  }

  // Hàm để đóng tất cả WebSocket liên quan đến Zegocloud
  const closeAllZegoWebSockets = () => {
    try {
      // Cách 1: Tìm và đóng tất cả WebSocket hiện có
      const allWebSockets = getAllWebSockets()
      console.log('[DEBUG] Tìm thấy', allWebSockets.length, 'WebSocket connections để đóng')

      for (const ws of allWebSockets) {
        try {
          if (
            ws.url &&
            (ws.url.includes('zegocloud.com') ||
              ws.url.includes('coolzcloud.com') ||
              ws.url.includes('wss://weblogger-wss') ||
              ws.url.includes('zglog/ws'))
          ) {
            console.log('[DEBUG] Đóng Zegocloud WebSocket:', ws.url)
            if (ws.readyState !== WebSocket.CLOSED) {
              ws.close()
            }
          }
        } catch (wsError) {
          console.error('[DEBUG] Lỗi khi đóng WebSocket:', wsError)
        }
      }

      // Cách 2: Sử dụng kỹ thuật override WebSocket để chặn các kết nối mới
      overrideWebSocketForZego()

      // Cách 3: Cố gắng chặn các logger WebSocket cụ thể
      blockZegoLoggerWebSockets()
    } catch (error) {
      console.error('[DEBUG] Lỗi khi đóng các WebSocket:', error)
    }
  }

  // Override WebSocket để theo dõi và chặn các kết nối Zegocloud mới
  const overrideWebSocketForZego = () => {
    try {
      // Lưu lại constructor gốc
      const OriginalWebSocket = window.WebSocket

      // Lưu lại reference đến constructor gốc để khôi phục sau này
      // @ts-ignore
      window._originalWebSocket = OriginalWebSocket

      // Tạo một tracker nếu chưa có
      // @ts-ignore
      if (!window._zegoWebSockets) {
        // @ts-ignore
        window._zegoWebSockets = []
      }

      // Override constructor WebSocket
      // @ts-ignore
      window.WebSocket = function (url, protocols) {
        // Tạo WebSocket thật
        const ws = new OriginalWebSocket(url, protocols)

        console.log('[DEBUG] WebSocket được tạo cho URL:', url)

        // Chặn kết nối đến Zegocloud sau khi đã rời phòng
        if (
          typeof url === 'string' &&
          (url.includes('zegocloud.com') ||
            url.includes('coolzcloud.com') ||
            url.includes('wss://weblogger-wss') ||
            url.includes('zglog/ws'))
        ) {
          console.log('[DEBUG] Chặn Zegocloud WebSocket mới:', url)

          // Đóng ngay lập tức nếu component đã unmount
          if (hasMountedRef.current === false) {
            console.log('[DEBUG] Tự động đóng WebSocket sau unmount:', url)
            setTimeout(() => {
              if (ws.readyState !== WebSocket.CLOSED) {
                ws.close()
              }
            }, 100)
          }

          // Theo dõi WebSocket này
          // @ts-ignore
          window._zegoWebSockets.push(ws)
        }

        return ws
      }

      // Copy tất cả properties từ constructor gốc
      for (const prop in OriginalWebSocket) {
        // @ts-ignore
        window.WebSocket[prop] = OriginalWebSocket[prop]
      }

      // @ts-ignore
      window.WebSocket.prototype = OriginalWebSocket.prototype
    } catch (error) {
      console.error('[DEBUG] Lỗi khi override WebSocket:', error)
    }
  }

  // Effect để theo dõi khi cuộc gọi kết thúc và tự động chuyển hướng người dùng không phải bác sĩ/admin
  useEffect(() => {
    if (isCallEnded) {
      // Dọn dẹp kết nối Zego khi cuộc gọi kết thúc
      cleanupZegoConnection()

      if (!isHost) {
        // Hiển thị thông báo rằng bác sĩ đã kết thúc cuộc gọi
        toast.info('Bác sĩ đã kết thúc cuộc gọi. Bạn sẽ được chuyển hướng về trang trước đó.')

        // Cho người dùng một chút thời gian để đọc thông báo, sau đó chuyển hướng
        const timer = setTimeout(() => {
          navigate(-1)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [isCallEnded, isHost, navigate])

  // Cleanup khi component unmount
  useEffect(() => {
    // Khởi tạo theo dõi WebSocket khi mount component
    overrideWebSocketForZego()

    // Thêm event listener để dọn dẹp kết nối khi người dùng đóng trình duyệt hoặc rời trang
    const handleBeforeUnload = () => {
      console.log('[DEBUG] Người dùng sắp rời trang - cleanup tài nguyên')
      cleanupZegoConnection()
      return null
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Thiết lập một interval để kiểm tra và dọn dẹp các kết nối không sử dụng
    const cleanupInterval = setInterval(() => {
      // Kiểm tra nếu cuộc gọi đã kết thúc
      if (isCallEnded) {
        console.log('[DEBUG] Auto cleanup - Cuộc gọi đã kết thúc, dọn dẹp WebSocket thừa')
        closeAllZegoWebSockets()
      }
    }, 10000) // Kiểm tra mỗi 10 giây

    return () => {
      console.log('[DEBUG] Component unmount - dọn dẹp tài nguyên')

      // Xóa interval
      clearInterval(cleanupInterval)

      // Xóa event listener
      window.removeEventListener('beforeunload', handleBeforeUnload)

      // Đánh dấu component đã unmount
      hasMountedRef.current = false

      // Hủy bỏ polling
      if (videoCallData && 'unsubscribe' in videoCallData) {
        console.log('[DEBUG] Unsubscribe từ videoCallData')
        try {
          // @ts-ignore
          videoCallData.unsubscribe()
        } catch (error) {
          console.error('[DEBUG] Error unsubscribing:', error)
        }
      }

      // Dọn dẹp kết nối Zego
      cleanupZegoConnection()

      // Khôi phục constructor WebSocket gốc nếu đã override
      try {
        // @ts-ignore
        if (window._originalWebSocket) {
          // @ts-ignore
          window.WebSocket = window._originalWebSocket
          console.log('[DEBUG] Đã khôi phục WebSocket constructor gốc')
        }
      } catch (error) {
        console.error('[DEBUG] Lỗi khi khôi phục WebSocket constructor:', error)
      }
    }
  }, [isCallEnded])

  // Xử lý tạo và tham gia phòng họp video
  useEffect(() => {
    if (!roomId || !user || !myMeeting.current || !videoCallData?.data) return

    // Kiểm tra xem cuộc gọi đã kết thúc chưa
    if (isCallEnded) {
      setError('Cuộc gọi video này đã kết thúc')
      return
    }

    // Nếu component đã mount trước đây và đã khởi tạo Zego instance, không khởi tạo lại
    if (hasMountedRef.current && zegoInstanceRef.current) {
      console.log('[DEBUG] Không khởi tạo lại Zego instance vì đã tồn tại')
      return
    }

    // Đánh dấu component đã mount
    hasMountedRef.current = true

    // Kiểm tra xem cuộc gọi đã bắt đầu chưa (trừ khi là bác sĩ/admin)
    if (!isCallStarted && !isHost) {
      setError('Cuộc gọi video chưa được bắt đầu. Vui lòng chờ bác sĩ bắt đầu cuộc gọi.')
      return
    }

    // Kiểm tra xem có thông tin video call không
    if (!videoCallData?.data.videoCallInfo) {
      setError('Thông tin cuộc gọi video không hợp lệ')
      return
    }

    // Lấy meetingId từ API
    const meetingId = videoCallData.data.videoCallInfo.meetingId

    // Lấy appointmentId từ dữ liệu
    const appointmentId = bufferToHex(videoCallData.data._id)

    // Kiểm tra xem meetingId có hợp lệ không
    if (!meetingId) {
      setError('Thông tin phòng họp không hợp lệ')
      return
    }

    // Tạo instance cho ZegoUIKit
    const createMeeting = async () => {
      setIsCreatingRoom(true)
      try {
        console.log('[DEBUG] Tạo phòng họp với ID:', meetingId)

        // Dọn dẹp trước khi tạo instance mới để tránh xung đột
        cleanupZegoConnection()

        // Tạo một Kit token cho xác thực với ZegoCloud
        const appID = Number(zegoCloudAppID)
        const serverSecret = zegoCloudServerSecret
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          meetingId,
          bufferToHex(user._id), // userID lấy từ redux store
          user.profile?.firstName + ' ' + user.profile?.lastName // userName hiển thị
        )

        console.log('[DEBUG] Đã tạo xong token, chuẩn bị tạo instance ZegoUIKit')

        // Tạo instance của ZegoUIKitPrebuilt
        const zp = ZegoUIKitPrebuilt.create(kitToken)
        zegoInstanceRef.current = zp

        console.log('[DEBUG] Đã tạo xong instance ZegoUIKit')

        // Thiết lập callback khi một người dùng tham gia
        const onUserJoin = (users: any) => {
          console.log('[DEBUG] Người dùng tham gia:', users)
        }

        // Thiết lập callback khi một người dùng rời đi
        const onUserLeave = (users: any) => {
          console.log('[DEBUG] Người dùng rời đi:', users)
        }

        console.log('[DEBUG] Chuẩn bị join room với container:', myMeeting.current)

        // Khởi tạo phòng video call
        zp.joinRoom({
          container: myMeeting.current,
          sharedLinks: [
            {
              name: 'Copy link',
              url: videoCallData.data.videoCallInfo.meetingUrl || `${window.location.origin}/room/${meetingId}`
            }
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference
          },
          showTurnOffRemoteCameraButton: isHost, // Chỉ bác sĩ/admin có thể tắt camera của người khác
          showTurnOffRemoteMicrophoneButton: isHost, // Chỉ bác sĩ/admin có thể tắt micro của người khác
          showRemoveUserButton: isHost, // Chỉ bác sĩ/admin có thể xóa người tham gia khỏi cuộc gọi
          showUserList: true,
          maxUsers: 10,
          layout: 'Auto', // Bố cục tự động điều chỉnh theo số lượng người tham gia
          showScreenSharingButton: true,
          showRoomDetailsButton: true,
          onLeaveRoom: async () => {
            console.log('[DEBUG] Người dùng rời phòng, bắt đầu dọn dẹp kết nối')
            // Dọn dẹp kết nối trước
            cleanupZegoConnection()

            // Chỉ host (doctor/admin) mới có thể kết thúc cuộc gọi
            if (isHost) {
              // Hỏi người dùng xem họ có muốn kết thúc cuộc gọi không
              const confirmed = window.confirm('Bạn có muốn kết thúc cuộc gọi cho tất cả mọi người không?')
              if (confirmed) {
                try {
                  console.log('[DEBUG] Gọi API kết thúc cuộc gọi cho ID:', appointmentId)
                  // Gọi API kết thúc cuộc gọi
                  await endVideoCall(appointmentId).unwrap()
                  toast.success('Cuộc gọi đã kết thúc thành công')
                } catch (error) {
                  console.error('[DEBUG] Error ending call:', error)
                  toast.error('Không thể kết thúc cuộc gọi')
                }
              }
            }

            // Chuyển hướng về trang trước đó khi rời phòng
            navigate(-1)
          },
          onUserJoin,
          onUserLeave
        })

        console.log('[DEBUG] Đã join room thành công')
      } catch (error) {
        console.error('[DEBUG] Error creating Zego meeting:', error)
        setError('Có lỗi xảy ra khi tạo phòng họp')
      } finally {
        setIsCreatingRoom(false)
      }
    }

    // Nếu là bác sĩ và cuộc gọi chưa bắt đầu, gọi API để bắt đầu
    const startMeeting = async () => {
      console.log(
        '[DEBUG] StartMeeting được gọi, isHost:',
        isHost,
        'joinedAt:',
        videoCallData.data.videoCallInfo.joinedAt
      )

      // Chỉ thực hiện API call khi là bác sĩ và cuộc gọi chưa bắt đầu
      if (isHost && !videoCallData.data.videoCallInfo.joinedAt) {
        try {
          console.log('[DEBUG] Bắt đầu cuộc gọi cho ID:', appointmentId)
          // Bắt đầu cuộc gọi video cho phòng họp này
          await joinVideoCall(appointmentId).unwrap()

          // Cập nhật lại dữ liệu sau khi bắt đầu cuộc gọi
          await refetchVideoCallData()

          toast.success('Đã bắt đầu cuộc gọi thành công')
        } catch (error) {
          console.error('[DEBUG] Error starting call:', error)
          toast.error('Không thể bắt đầu cuộc gọi')
        }
      }

      // Tạo và tham gia phòng
      createMeeting()
    }

    startMeeting()
  }, [
    roomId,
    user,
    navigate,
    videoCallData,
    endVideoCall,
    joinVideoCall,
    isHost,
    isCallEnded,
    isCallStarted,
    refetchVideoCallData
  ])

  // Xử lý quay lại trang trước
  const handleGoBack = () => {
    // Dọn dẹp kết nối trước khi quay lại
    cleanupZegoConnection()
    navigate(-1)
  }

  // Hiển thị loading trong khi kiểm tra roomId và tải dữ liệu cuộc hẹn
  if (isLoadingMeetings || isLoadingVideoCallData) {
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-gray-100'>
        <Loader2 className='mb-4 w-10 h-10 animate-spin text-primary' />
        <p>Đang tải thông tin cuộc gọi...</p>
      </div>
    )
  }

  // Hiển thị thông báo khi cuộc gọi chưa bắt đầu (chỉ với bệnh nhân)
  if (!isCallStarted && !isHost) {
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-gray-100'>
        <Loader2 className='mb-4 w-16 h-16 text-blue-500 animate-spin' />
        <h1 className='mb-4 text-2xl font-bold'>Đang chờ bác sĩ bắt đầu cuộc gọi</h1>
        <p className='mb-6 max-w-md text-center'>
          Cuộc gọi video chưa được bắt đầu. Vui lòng đợi trong giây lát, bác sĩ sẽ bắt đầu cuộc gọi sớm.
        </p>
        <Button onClick={handleGoBack} className='mb-4'>
          <ArrowLeft className='mr-2 w-4 h-4' />
          Quay lại
        </Button>
      </div>
    )
  }

  // Hiển thị thông báo khi cuộc gọi đã kết thúc
  if (isCallEnded) {
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-gray-100'>
        <CheckCircle className='mb-4 w-16 h-16 text-green-500' />
        <h1 className='mb-4 text-2xl font-bold'>Cuộc gọi đã hoàn thành</h1>
        <p className='mb-6 max-w-md text-center'>
          Cuộc gọi video với bệnh nhân đã kết thúc. Cảm ơn bạn đã tham gia cuộc gọi.
        </p>
        <Button onClick={handleGoBack} className='mb-4'>
          <ArrowLeft className='mr-2 w-4 h-4' />
          Quay lại
        </Button>
      </div>
    )
  }

  // Hiển thị lỗi nếu không có thông tin hợp lệ
  if (!roomId || !user || error) {
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-gray-100'>
        <AlertCircle className='mb-4 w-10 h-10 text-red-500' />
        <h1 className='mb-4 text-2xl font-bold'>Không thể tham gia cuộc gọi</h1>
        <p className='mb-6'>{error || 'Thông tin phòng hoặc người dùng không hợp lệ.'}</p>
        <Button onClick={handleGoBack} className='mb-4'>
          <ArrowLeft className='mr-2 w-4 h-4' />
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center p-4 bg-white border-b'>
        <Button variant='ghost' onClick={handleGoBack} className='mr-4'>
          <ArrowLeft className='mr-2 w-4 h-4' />
          Quay lại
        </Button>
        <h1 className='text-xl font-semibold'>
          Phòng khám trực tuyến - ID: {videoCallData?.data.videoCallInfo?.meetingId || roomId}
        </h1>
      </div>
      {isCreatingRoom ? (
        <div className='flex flex-col flex-1 justify-center items-center'>
          <Loader2 className='mb-4 w-10 h-10 animate-spin text-primary' />
          <p>Đang chuẩn bị phòng khám...</p>
        </div>
      ) : (
        <div ref={myMeeting} className='flex-1' />
      )}
    </div>
  )
}
