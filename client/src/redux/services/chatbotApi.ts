import { createApi } from '@reduxjs/toolkit/query/react'
import { io, Socket } from 'socket.io-client'
import { getAccessToken } from '@/utils/utils'
import { baseURLChatBotAPI } from '@/constants/url'
import customFetchBaseChatbot from './customFetchBaseChatbot'

// Global socket and connection state
let socket: Socket | null = null
let isConnecting = false
const eventListeners: Record<string, boolean> = {}

// Thêm theo dõi cho các lỗi socket
let connectionErrors = 0
const MAX_CONNECTION_ERRORS = 5
let lastConnectionAttempt = 0
const CONNECTION_RETRY_DELAY = 2000 // 2 giây

const globalCallback = {
  chatbotResponse: null as ((message: string) => void) | null,
  messageSent: null as ((message: string) => void) | null
}

// Debug function to log with extra information
const debugLog = (message: string, ...args: any[]) => {
  console.log(`[SOCKET ${new Date().toISOString()}] ${message}`, ...args)
}

// Hàm kiểm tra URL
const validateSocketUrl = (url: string | undefined): string => {
  if (!url) {
    debugLog('⚠️ baseURLChatBotAPI không được định nghĩa trong biến môi trường, sử dụng fallback')
    return 'http://103.69.87.243:5000/chatbot'
  }

  // Đảm bảo URL không kết thúc bằng dấu /
  let cleanUrl = url.trim()
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1)
  }

  // Thêm /chatbot nếu chưa có
  if (!cleanUrl.endsWith('/chatbot')) {
    cleanUrl += '/chatbot'
  }

  debugLog(`🔗 Socket URL: ${cleanUrl}`)
  return cleanUrl
}

// Hàm trích xuất nội dung tin nhắn từ các định dạng khác nhau
const extractMessageContent = (data: any): string => {
  if (!data) return ''

  debugLog('🔍 Dữ liệu tin nhắn nhận được:', data)

  try {
    // Trường hợp 1: Dữ liệu là đối tượng có cấu trúc mới { userId, message: { type, content } }
    if (typeof data === 'object' && data.message && typeof data.message === 'object' && data.message.content) {
      return data.message.content
    }

    // Trường hợp 2: Dữ liệu là đối tượng đơn giản { message: string }
    if (typeof data === 'object' && typeof data.message === 'string') {
      return data.message
    }

    // Trường hợp 3: Dữ liệu là mảng với phần tử thứ 2 chứa thông tin tin nhắn
    if (Array.isArray(data) && data.length > 1) {
      const secondItem = data[1]
      if (typeof secondItem === 'string') {
        return secondItem
      }

      if (typeof secondItem === 'object') {
        // Kiểm tra message có thể là đối tượng trong mảng
        if (secondItem.message) {
          if (typeof secondItem.message === 'string') {
            return secondItem.message
          }

          // Nếu message là một đối tượng có content
          if (typeof secondItem.message === 'object' && secondItem.message.content) {
            return secondItem.message.content
          }
        }
      }
    }

    // Trường hợp 4: Dữ liệu là chuỗi
    if (typeof data === 'string') {
      return data
    }

    // Trường hợp không khớp với bất kỳ định dạng nào trên đây
    debugLog('⚠️ Không thể trích xuất nội dung tin nhắn:', data)
    return ''
  } catch (error) {
    debugLog('❌ Lỗi khi trích xuất nội dung tin nhắn:', error)
    return ''
  }
}

export const chatbotApi = createApi({
  reducerPath: 'chatbotApi',
  baseQuery: customFetchBaseChatbot,
  tagTypes: ['Chatbot'],
  endpoints: (build) => ({
    connectChatbot: build.mutation<{ success: boolean }, void>({
      queryFn: () => {
        try {
          const token = getAccessToken()
          if (!token) {
            debugLog('❌ Không tìm thấy token xác thực')
            return { error: { status: 'CUSTOM_ERROR', error: 'No token found' } }
          }

          // Kiểm tra xem socket đã kết nối chưa
          if (socket?.connected) {
            debugLog('✅ Socket đã kết nối với ID:', socket.id)
            return { data: { success: true } }
          }

          // Đảm bảo khoảng cách giữa các lần thử kết nối
          const now = Date.now()
          if (isConnecting && now - lastConnectionAttempt < CONNECTION_RETRY_DELAY) {
            debugLog('⏳ Đã có yêu cầu kết nối đang trong tiến trình')
            return { data: { success: false, message: 'Connection in progress' } }
          }

          // Reset trạng thái và bắt đầu kết nối mới
          isConnecting = true
          lastConnectionAttempt = now

          // Log để theo dõi việc thiết lập kết nối
          debugLog('🔄 Đang thiết lập kết nối socket...')

          const setupSocket = () => {
            // Đóng socket cũ nếu có
            if (socket) {
              debugLog('🔌 Đóng kết nối socket cũ')
              socket.disconnect()
              socket = null
            }

            // Kiểm tra và xử lý URL kết nối socket
            const socketUrl = validateSocketUrl(baseURLChatBotAPI)
            debugLog('🔗 Kết nối đến:', socketUrl, 'với token:', token ? 'Có token' : 'Không có token')

            // Thiết lập socket với các options
            socket = io(socketUrl, {
              auth: { token },
              transports: ['websocket', 'polling'],
              reconnectionAttempts: 5,
              reconnectionDelay: 1000,
              timeout: 20000, // Tăng timeout để giúp kết nối ổn định hơn
              forceNew: true, // Luôn tạo kết nối mới
              autoConnect: true // Tự động kết nối ngay
            })

            // Sự kiện kết nối thành công
            socket.on('connect', () => {
              debugLog('✅ Đã kết nối tới chatbot server với ID:', socket?.id)
              isConnecting = false
              connectionErrors = 0 // Reset bộ đếm lỗi

              // Reset event listeners
              Object.keys(eventListeners).forEach((key) => {
                eventListeners[key] = false
              })

              // Thiết lập sự kiện nhận phản hồi từ chatbot
              if (socket && !eventListeners['chatbotResponse']) {
                socket.on('chatbotResponse', (data: any) => {
                  debugLog('Nhận phản hồi từ chatbot:', data)

                  // Trích xuất nội dung tin nhắn từ dữ liệu nhận được
                  const message = extractMessageContent(data)

                  if (globalCallback.chatbotResponse) {
                    globalCallback.chatbotResponse(message)
                  }
                })
                eventListeners['chatbotResponse'] = true
                debugLog('✅ Đã đăng ký listener cho sự kiện chatbotResponse')
              }

              // Thiết lập sự kiện xác nhận tin nhắn đã gửi
              if (socket && !eventListeners['messageSent']) {
                socket.on('messageSent', (data: any) => {
                  debugLog('Nhận xác nhận tin nhắn đã gửi:', data)

                  // Trích xuất nội dung tin nhắn từ dữ liệu nhận được
                  const message = extractMessageContent(data)

                  if (globalCallback.messageSent) {
                    globalCallback.messageSent(message)
                  }
                })
                eventListeners['messageSent'] = true
                debugLog('✅ Đã đăng ký listener cho sự kiện messageSent')
              }
            })

            // Sự kiện lỗi kết nối
            socket.on('connect_error', (error) => {
              debugLog('❌ Lỗi kết nối socket:', error)
              connectionErrors++
              isConnecting = false

              // Thử kết nối lại tự động nếu chưa vượt quá số lần thử
              if (connectionErrors < MAX_CONNECTION_ERRORS) {
                debugLog(
                  `⏱️ Thử kết nối lại sau ${CONNECTION_RETRY_DELAY}ms (lần thử ${connectionErrors}/${MAX_CONNECTION_ERRORS})`
                )
                setTimeout(() => {
                  debugLog('🔄 Thử kết nối lại...')
                  if (socket) {
                    socket.connect()
                  }
                }, CONNECTION_RETRY_DELAY)
              }
            })

            // Sự kiện ngắt kết nối
            socket.on('disconnect', (reason) => {
              debugLog('🔌 Ngắt kết nối từ chatbot server:', reason)

              // Reset các event listeners
              Object.keys(eventListeners).forEach((key) => {
                eventListeners[key] = false
              })

              // Nếu ngắt kết nối không phải do chủ ý (io server disconnect hoặc io client disconnect)
              if (reason !== 'io server disconnect' && reason !== 'io client disconnect') {
                debugLog('⏱️ Thử kết nối lại tự động...')
                socket?.connect()
              }
            })

            // Sự kiện lỗi socket
            socket.on('error', (error: Error) => {
              debugLog('❌ Lỗi socket:', error)
              isConnecting = false
            })

            // Sự kiện reconnect để xác nhận khi kết nối lại thành công
            socket.on('reconnect', (attemptNumber) => {
              debugLog(`✅ Kết nối lại thành công sau ${attemptNumber} lần thử`)
              connectionErrors = 0
            })
          }

          // Thực hiện thiết lập socket
          setupSocket()

          // Ping server để đảm bảo kết nối
          setTimeout(() => {
            if (socket?.connected) {
              debugLog('✅ Xác nhận kết nối đã ổn định')
            } else {
              debugLog('⚠️ Socket chưa kết nối sau khi thiết lập, có thể cần thử lại')
              isConnecting = false
            }
          }, 2000)

          return { data: { success: true } }
        } catch (error) {
          debugLog('❌ Lỗi thiết lập socket:', error)
          isConnecting = false
          return { error: { status: 'CUSTOM_ERROR', error: 'Failed to connect socket' } }
        }
      }
    }),

    sendMessage: build.mutation<{ success: boolean }, { message: string }>({
      queryFn: ({ message }) => {
        try {
          // Kiểm tra kết nối trước khi gửi tin nhắn
          if (!socket) {
            debugLog('❌ Socket chưa được khởi tạo khi gửi tin nhắn')
            return { error: { status: 'CUSTOM_ERROR', error: 'Socket not initialized' } }
          }

          if (!socket.connected) {
            debugLog('❌ Socket chưa kết nối khi gửi tin nhắn, thử kết nối lại')
            socket.connect()
            return { error: { status: 'CUSTOM_ERROR', error: 'Socket not connected' } }
          }

          debugLog('📤 Gửi tin nhắn:', message)
          socket.emit('sendMessage', { message })
          return { data: { success: true } }
        } catch (error) {
          debugLog('❌ Lỗi khi gửi tin nhắn:', error)
          return { error: { status: 'CUSTOM_ERROR', error: 'Failed to send message' } }
        }
      }
    }),

    disconnectChatbot: build.mutation<{ success: boolean }, void>({
      queryFn: () => {
        try {
          if (socket) {
            debugLog('🔌 Ngắt kết nối socket theo yêu cầu')
            socket.disconnect()
            socket = null
            isConnecting = false
          } else {
            debugLog('ℹ️ Không có socket để ngắt kết nối')
          }
          return { data: { success: true } }
        } catch (error) {
          debugLog('❌ Lỗi khi ngắt kết nối socket:', error)
          return { error: { status: 'CUSTOM_ERROR', error: 'Failed to disconnect socket' } }
        }
      }
    }),

    pingChatbot: build.mutation<{ connected: boolean }, void>({
      queryFn: () => {
        try {
          const connected = !!socket && socket.connected
          debugLog(`🔍 Kiểm tra kết nối socket: ${connected ? 'đã kết nối' : 'chưa kết nối'}`)

          // Kết nối lại nếu socket đã được khởi tạo nhưng chưa kết nối
          if (socket && !socket.connected) {
            debugLog('🔄 Phát hiện socket chưa kết nối, thử kết nối lại')
            socket.connect()
          }

          return { data: { connected } }
        } catch (error) {
          debugLog('❌ Lỗi khi kiểm tra kết nối socket:', error)
          return { error: { status: 'CUSTOM_ERROR', error: 'Failed to check socket connection' } }
        }
      }
    })
  })
})

export const {
  useConnectChatbotMutation,
  useSendMessageMutation,
  useDisconnectChatbotMutation,
  usePingChatbotMutation
} = chatbotApi

export const listenForChatbotResponse = (callback: (message: string) => void) => {
  debugLog('✅ Đăng ký callback cho chatbotResponse')
  globalCallback.chatbotResponse = callback
}

export const listenForMessageSent = (callback: (message: string) => void) => {
  debugLog('✅ Đăng ký callback cho messageSent')
  globalCallback.messageSent = callback
}

/**
 * Kiểm tra trạng thái kết nối hiện tại của socket
 * @returns {boolean} true nếu socket đã kết nối, false nếu không
 */
export const getSocketConnectionStatus = (): boolean => {
  const isConnected = !!socket && socket.connected
  debugLog(`🔍 Trạng thái kết nối socket: ${isConnected ? 'đã kết nối' : 'chưa kết nối'}`)
  return isConnected
}

/**
 * Kết nối lại socket một cách chủ động
 * @returns {Promise<boolean>} Promise trả về true nếu kết nối thành công, false nếu thất bại
 */
export const reconnectSocket = async (): Promise<boolean> => {
  debugLog('🔄 Kết nối lại socket theo yêu cầu')

  if (!socket) {
    debugLog('❌ Không có socket để kết nối lại, cần khởi tạo mới')
    return false
  }

  try {
    socket.connect()

    // Đợi kết nối hoàn tất
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false)
        debugLog('⏱️ Hết thời gian chờ kết nối lại')
      }, 5000)

      const connectHandler = () => {
        clearTimeout(timeout)
        socket?.off('connect', connectHandler)
        debugLog('✅ Kết nối lại thành công')
        resolve(true)
      }

      socket?.once('connect', connectHandler)
    })
  } catch (error) {
    debugLog('❌ Lỗi khi kết nối lại socket:', error)
    return false
  }
}
