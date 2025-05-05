import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import {
  useConnectChatbotMutation,
  useSendMessageMutation,
  useDisconnectChatbotMutation,
  usePingChatbotMutation
} from '@/redux/services/chatbotApi'
import {
  listenForChatbotResponse,
  listenForMessageSent,
  getSocketConnectionStatus,
  reconnectSocket
} from '@/redux/services/chatbotApi'
import { useAppSelector } from '@/redux/store'
import { useNavigate } from 'react-router-dom'
import path from '@/constants/path'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface Message {
  role: string
  content: string
  timestamp: Date
  id: string
  isTyping?: boolean
}
interface Props {
  onClose: () => void
}

// Hằng số cho localStorage key
const CHAT_HISTORY_KEY = 'chatbot_message_history'
const CHAT_HISTORY_EXPIRY_KEY = 'chatbot_message_history_expiry'
const CHAT_HISTORY_EXPIRY_DAYS = 5 // Số ngày lưu trữ lịch sử chat

// Component nút restart riêng biệt để tái sử dụng
interface RestartButtonProps {
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'error'
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

// Helper function để chuyển đổi Date thành chuỗi ISO và ngược lại
const serializeMessages = (messages: Message[]): string => {
  const serialized = messages.map((msg) => ({
    ...msg,
    timestamp: msg.timestamp.toISOString() // Chuyển Date thành chuỗi ISO
  }))
  return JSON.stringify(serialized)
}

const deserializeMessages = (serializedMessages: string): Message[] => {
  try {
    const parsed = JSON.parse(serializedMessages)
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp) // Chuyển chuỗi ISO thành Date
    }))
  } catch (error) {
    console.error('Lỗi khi phân tích lịch sử tin nhắn:', error)
    return []
  }
}

const RestartButton = ({
  onClick,
  variant = 'primary',
  showIcon = true,
  className = '',
  size = 'md',
  label = 'Khởi động lại cuộc trò chuyện'
}: RestartButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    error: 'bg-red-100 text-red-700 hover:bg-red-200'
  }

  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-2 px-4'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 font-medium rounded-md transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <RefreshCw
          className={clsx('animate-spin-once', size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')}
        />
      )}
      <span>{label}</span>
    </motion.button>
  )
}

export default function ChatbotDialog({ onClose }: Props) {
  const { t } = useTranslation('landing')
  const navigate = useNavigate()

  // Tin nhắn chào mừng mặc định
  const defaultWelcomeMessage: Message = {
    role: 'bot',
    content: 'Xin chào! Tôi là trợ lý ảo Diagnosis Bot. Tôi có thể giúp gì cho bạn hôm nay?',
    timestamp: new Date(),
    id: 'initial-message'
  }

  const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>(
    'disconnected'
  )
  const [showErrorRestart, setShowErrorRestart] = useState(false) // Trạng thái hiển thị nút restart khi lỗi
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAuthen = useAppSelector((state) => state.authState.isAuthenticated)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Để xử lý loading timeout
  const messageQueueRef = useRef<{ message: string; timestamp: number }[]>([]) // Hàng đợi tin nhắn để tránh gửi quá nhanh
  const processingMessageRef = useRef<boolean>(false) // Đánh dấu đang xử lý tin nhắn
  const lastMessageRef = useRef<string>('') // Lưu trữ ID tin nhắn cuối cùng để tránh trùng lặp
  const connectionAttemptRef = useRef<number>(0) // Đếm số lần thử kết nối
  const maxRetries = 3 // Số lần thử kết nối tối đa
  const userId = useAppSelector((state) => state.authState.user?._id) // Lấy ID người dùng để tạo key cho localStorage

  const BOT_RESPONSE_DELAY = 5000 // Độ trễ hiển thị tin nhắn bot (3 giây)
  const MIN_TIME_BETWEEN_MESSAGES = 3000 // Thời gian tối thiểu giữa các tin nhắn (2 giây)

  const [connectChatbot] = useConnectChatbotMutation()
  const [sendMessage] = useSendMessageMutation()
  const [disconnectChatbot] = useDisconnectChatbotMutation()
  const [pingChatbot] = usePingChatbotMutation()

  // Hàm lưu lịch sử chat vào localStorage
  const saveChatHistory = useCallback(
    (chatMessages: Message[]) => {
      if (!isAuthen || !userId) return // Chỉ lưu khi đã đăng nhập

      try {
        // Lấy key dựa trên ID người dùng
        const storageKey = `${CHAT_HISTORY_KEY}_${userId}`
        const expiryKey = `${CHAT_HISTORY_EXPIRY_KEY}_${userId}`

        // Tính thời điểm hết hạn (hiện tại + số ngày cấu hình)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + CHAT_HISTORY_EXPIRY_DAYS)

        // Lưu lịch sử chat
        localStorage.setItem(storageKey, serializeMessages(chatMessages))
        localStorage.setItem(expiryKey, expiryDate.toISOString())
      } catch (error) {
        console.error('Lỗi khi lưu lịch sử chat:', error)
      }
    },
    [isAuthen, userId]
  )

  // Hàm tải lịch sử chat từ localStorage
  const loadChatHistory = useCallback(() => {
    if (!isAuthen || !userId) return null // Chỉ tải khi đã đăng nhập

    try {
      // Lấy key dựa trên ID người dùng
      const storageKey = `${CHAT_HISTORY_KEY}_${userId}`
      const expiryKey = `${CHAT_HISTORY_EXPIRY_KEY}_${userId}`

      // Kiểm tra thời gian hết hạn
      const expiryDateStr = localStorage.getItem(expiryKey)
      if (expiryDateStr) {
        const expiryDate = new Date(expiryDateStr)
        const now = new Date()

        // Nếu đã hết hạn, xóa lịch sử cũ
        if (now > expiryDate) {
          localStorage.removeItem(storageKey)
          localStorage.removeItem(expiryKey)
          return null
        }
      }

      // Tải lịch sử tin nhắn
      const savedHistory = localStorage.getItem(storageKey)
      if (savedHistory) {
        return deserializeMessages(savedHistory)
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử chat:', error)
    }
    return null
  }, [isAuthen, userId])

  // Xóa lịch sử chat
  const clearChatHistory = useCallback(() => {
    if (!isAuthen || !userId) return

    try {
      const storageKey = `${CHAT_HISTORY_KEY}_${userId}`
      const expiryKey = `${CHAT_HISTORY_EXPIRY_KEY}_${userId}`

      localStorage.removeItem(storageKey)
      localStorage.removeItem(expiryKey)
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử chat:', error)
    }
  }, [isAuthen, userId])

  // Debug log helper
  const debugLog = useCallback((message: string, ...args: any[]) => {
    console.log(`[CHATBOT ${new Date().toISOString()}] ${message}`, ...args)
  }, [])

  // Kiểm tra trạng thái kết nối socket định kỳ
  const checkConnectionStatus = useCallback(() => {
    const isSocketConnected = getSocketConnectionStatus()
    setIsConnected(isSocketConnected)
    setConnectionStatus(isSocketConnected ? 'connected' : 'disconnected')
    return isSocketConnected
  }, [])

  // Hàm xử lý hàng đợi tin nhắn
  const processMessageQueue = useCallback(() => {
    if (processingMessageRef.current || messageQueueRef.current.length === 0) {
      return
    }

    // Đánh dấu đang xử lý tin nhắn
    processingMessageRef.current = true

    // Lấy tin nhắn tiếp theo từ hàng đợi
    const nextMessage = messageQueueRef.current.shift()
    if (!nextMessage) {
      processingMessageRef.current = false
      return
    }

    const { message, timestamp } = nextMessage

    // Tính toán thời gian đã trôi qua từ khi nhận được tin nhắn
    const timeElapsed = Date.now() - timestamp

    // Thêm placeholder "đang nhập" ngay lập tức
    const typingId = `typing-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        content: '',
        timestamp: new Date(),
        id: typingId,
        isTyping: true
      }
    ])

    // Tính toán thời gian trễ còn lại
    const remainingDelay = Math.max(0, BOT_RESPONSE_DELAY - timeElapsed)

    // Hiển thị tin nhắn thật sau thời gian delay
    setTimeout(() => {
      // Xóa tin nhắn "đang nhập" và thêm tin nhắn thật
      setMessages((prev) => {
        // Lọc bỏ tin nhắn typing
        const filteredMessages = prev.filter((msg) => msg.id !== typingId)

        // Thêm tin nhắn thật
        return [
          ...filteredMessages,
          {
            role: 'bot',
            content: message,
            timestamp: new Date(),
            id: `bot-${Date.now()}`
          }
        ]
      })

      // Đánh dấu đã xử lý xong
      setIsLoading(false)

      // Đặt timeout để xử lý tin nhắn tiếp theo trong hàng đợi
      setTimeout(() => {
        processingMessageRef.current = false
        processMessageQueue()
      }, MIN_TIME_BETWEEN_MESSAGES)
    }, remainingDelay)
  }, [BOT_RESPONSE_DELAY, MIN_TIME_BETWEEN_MESSAGES])

  // Khai báo hàm handleBotResponse - được cập nhật để thêm delay
  const handleBotResponse = useCallback(
    (message: string) => {
      debugLog('Nhận phản hồi từ bot:', message)

      // Dù message rỗng vẫn phải clear loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      // Khởi tạo messageId trước để dùng cho cả trường hợp message rỗng và không rỗng
      const timestamp = Date.now()
      const messageId = message && message.trim() ? `bot-${timestamp}` : `empty-response-error-${timestamp}`

      if (!message || message.trim() === '') {
        debugLog('Tin nhắn từ bot rỗng, hiển thị thông báo lỗi')
        setIsLoading(false)
        setShowErrorRestart(true) // Hiển thị nút restart khi lỗi

        // Thêm thông báo lỗi khi nhận được message rỗng từ server
        const errorMessage: Message = {
          role: 'bot',
          content: 'Xin lỗi, tôi đang gặp một số vấn đề kỹ thuật. Vui lòng thử lại sau.',
          timestamp: new Date(),
          id: messageId
        }
        setMessages((prev) => [...prev, errorMessage])

        // Reset lastMessageRef để đảm bảo tin nhắn lỗi tiếp theo vẫn được hiển thị
        lastMessageRef.current = `empty-${timestamp}`
        return
      }

      // Kiểm tra tin nhắn trùng lặp dựa trên nội dung
      if (lastMessageRef.current === message) {
        debugLog('Phát hiện tin nhắn trùng lặp, bỏ qua')
        setIsLoading(false)
        return
      }

      lastMessageRef.current = message

      // Thêm tin nhắn vào hàng đợi thay vì hiển thị ngay lập tức
      messageQueueRef.current.push({
        message,
        timestamp: Date.now()
      })

      // Bắt đầu xử lý hàng đợi nếu chưa có tiến trình xử lý
      if (!processingMessageRef.current) {
        processMessageQueue()
      }
    },
    [debugLog, processMessageQueue]
  )

  // Khai báo hàm handleMessageSent trước
  const handleMessageSent = useCallback(
    (message: string) => {
      debugLog('Xác nhận đã gửi tin nhắn:', message)
    },
    [debugLog]
  )

  // Kiểm tra và xử lý kết nối socket
  const manageConnection = useCallback(async () => {
    if (!isAuthen) {
      setConnectionStatus('disconnected')
      return false
    }

    // Nếu đã kết nối, không cần kết nối lại
    if (checkConnectionStatus()) {
      debugLog('Socket đã kết nối, không cần kết nối lại')
      return true
    }

    // Đánh dấu đang kết nối
    setConnectionStatus('connecting')

    // Thử ping trước để kiểm tra kết nối hiện tại
    try {
      const pingResult = await pingChatbot().unwrap()
      if (pingResult.connected) {
        debugLog('Ping thành công, socket đã kết nối')
        checkConnectionStatus()
        return true
      }
    } catch (error) {
      debugLog('Ping thất bại, thử kết nối mới', error)
    }

    // Thử kết nối lại nếu socket đã tồn tại nhưng mất kết nối
    try {
      const reconnected = await reconnectSocket()
      if (reconnected) {
        debugLog('Kết nối lại socket thành công')
        checkConnectionStatus()
        return true
      }
    } catch (error) {
      debugLog('Kết nối lại socket thất bại', error)
    }

    // Thử kết nối mới nếu không thể kết nối lại
    try {
      debugLog('Thực hiện kết nối mới')
      await connectChatbot().unwrap()

      // Kiểm tra kết nối sau 1 giây
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const isConnected = checkConnectionStatus()
      if (isConnected) {
        debugLog('Kết nối socket mới thành công')

        // Thiết lập lắng nghe các sự kiện socket
        listenForChatbotResponse(handleBotResponse)
        listenForMessageSent(handleMessageSent)
        return true
      } else {
        debugLog('Kết nối socket mới thất bại')
        setConnectionStatus('error')
        return false
      }
    } catch (error) {
      debugLog('Lỗi khi kết nối socket mới', error)
      setConnectionStatus('error')
      return false
    }
  }, [isAuthen, checkConnectionStatus, pingChatbot, connectChatbot, handleBotResponse, handleMessageSent, debugLog])

  // Hàm khởi động lại cuộc trò chuyện
  const restartConversation = useCallback(() => {
    debugLog('Khởi động lại cuộc trò chuyện theo yêu cầu')
    sendMessage({ message: '/restart' }).unwrap()
    // Xóa mọi tin nhắn đang chờ trong hàng đợi
    messageQueueRef.current = []
    processingMessageRef.current = false

    // Xóa trạng thái tin nhắn hiện tại
    const newMessages = [
      {
        role: 'bot',
        content: 'Cuộc trò chuyện đã được khởi động lại.',
        timestamp: new Date(),
        id: `restart-${Date.now()}`
      },
      {
        ...defaultWelcomeMessage,
        timestamp: new Date(),
        id: `welcome-${Date.now()}`
      }
    ]
    setMessages(newMessages)

    // Xóa lịch sử chat cũ khi restart
    clearChatHistory()

    // Reset các trạng thái khác
    setIsLoading(false)
    setShowErrorRestart(false)
    lastMessageRef.current = ''

    // Xóa timeout nếu có
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    return true
  }, [debugLog, clearChatHistory])

  // Thiết lập kết nối socket khi component mount và thử lại khi thất bại
  useEffect(() => {
    let connectionTimeout: NodeJS.Timeout | null = null
    let retryCount = 0
    let connectionCheckInterval: NodeJS.Timeout | null = null

    const attemptConnection = async () => {
      if (!isAuthen) return

      debugLog(`Khởi tạo kết nối chatbot (lần thử ${retryCount + 1} / ${maxRetries + 1})`)

      // Reset counter on first attempt
      if (retryCount === 0) {
        connectionAttemptRef.current = 0
      }

      const success = await manageConnection()

      if (!success && retryCount < maxRetries) {
        // Exponential backoff for retries: 2s, 4s, 8s...
        const delay = Math.pow(2, retryCount) * 1000
        retryCount++

        debugLog(`Kết nối thất bại, thử lại sau ${delay}ms...`)
        connectionTimeout = setTimeout(attemptConnection, delay)
      } else if (success) {
        debugLog('Kết nối thành công')
        retryCount = 0

        // Kiểm tra lại kết nối sau 2 giây
        connectionTimeout = setTimeout(() => {
          if (!checkConnectionStatus()) {
            debugLog('Kiểm tra xác thực kết nối thất bại, kết nối lại...')
            attemptConnection()
          }
        }, 2000)
      } else {
        // Nếu đã hết số lần thử và vẫn thất bại
        debugLog('Đã hết số lần thử kết nối')
        setConnectionStatus('error')

        // Thêm tin nhắn lỗi vào cuộc trò chuyện
        const errorMessage: Message = {
          role: 'bot',
          content: 'Không thể kết nối đến máy chủ chatbot. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
          timestamp: new Date(),
          id: `connection-error-${Date.now()}`
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }

    // Bắt đầu quá trình kết nối nếu người dùng đã đăng nhập
    if (isAuthen) {
      attemptConnection()

      // Thiết lập interval kiểm tra kết nối
      connectionCheckInterval = setInterval(() => {
        const isSocketConnected = checkConnectionStatus()

        // Nếu mất kết nối, thử kết nối lại
        if (!isSocketConnected && isAuthen) {
          debugLog('Kiểm tra định kỳ: Mất kết nối, đang kết nối lại...')
          retryCount = 0
          attemptConnection()
        }
      }, 15000) // Kiểm tra mỗi 15 giây
    }

    // Cleanup function
    return () => {
      debugLog('Dọn dẹp kết nối chatbot...')

      // Xóa interval kiểm tra kết nối
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval)
      }

      // Xóa timeout khi unmount
      if (connectionTimeout) {
        clearTimeout(connectionTimeout)
      }

      // Xử lý timeout của loading nếu có
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      // Thực hiện ngắt kết nối
      disconnectChatbot()

      // Đặt lại trạng thái
      setIsConnected(false)
      setConnectionStatus('disconnected')
      connectionAttemptRef.current = 0
    }
  }, [isAuthen, manageConnection, checkConnectionStatus, disconnectChatbot, maxRetries, debugLog])

  // Tự động cuộn xuống khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load lịch sử chat khi component mount
  useEffect(() => {
    const savedMessages = loadChatHistory()
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages)
      debugLog('Đã tải lịch sử chat từ localStorage')
    }
  }, [loadChatHistory, debugLog])

  // Lưu lịch sử chat khi messages thay đổi
  useEffect(() => {
    // Chỉ lưu lịch sử khi có nhiều hơn tin nhắn chào mừng mặc định
    if (messages.length > 1) {
      saveChatHistory(messages)
    }
  }, [messages, saveChatHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || isLoading || !isAuthen) return

    const inputText = input.trim()

    // Kiểm tra lệnh restart
    if (inputText.toLowerCase() === '/restart') {
      debugLog('Lệnh restart được phát hiện')

      // Thêm tin nhắn của người dùng vào trước
      const userMessage: Message = {
        role: 'user',
        content: inputText,
        timestamp: new Date(),
        id: `user-${Date.now()}`
      }
      setMessages((prev) => [...prev, userMessage])

      // Reset input
      setInput('')

      // Gửi lệnh restart lên server
      try {
        debugLog('Gửi lệnh restart lên server')
        await sendMessage({ message: '/restart' }).unwrap()

        // Không cần đợi phản hồi từ server để thực hiện reset ở client
        setTimeout(() => {
          restartConversation()
        }, 500)
      } catch (error) {
        debugLog('Lỗi khi gửi lệnh restart lên server:', error)
        // Vẫn thực hiện restart ở client ngay cả khi gửi lên server thất bại
        restartConversation()
      }

      return
    }

    // Kiểm tra kết nối trước khi gửi
    const isSocketConnected = checkConnectionStatus()

    if (!isSocketConnected) {
      debugLog('Socket không kết nối, thử kết nối lại trước khi gửi')
      setConnectionStatus('connecting')

      // Hiển thị thông báo đang kết nối lại
      const connectingMessage: Message = {
        role: 'bot',
        content: 'Đang kết nối lại...',
        timestamp: new Date(),
        id: `reconnecting-${Date.now()}`
      }
      setMessages((prev) => [...prev, connectingMessage])

      // Thử kết nối lại
      const reconnected = await manageConnection()

      if (!reconnected) {
        debugLog('Không thể kết nối lại socket')

        // Cập nhật tin nhắn kết nối thành lỗi
        const errorMessage: Message = {
          role: 'bot',
          content: 'Không thể kết nối đến máy chủ chatbot. Vui lòng thử lại sau.',
          timestamp: new Date(),
          id: `connection-error-${Date.now()}`
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      } else {
        // Cập nhật tin nhắn kết nối thành công
        const successMessage: Message = {
          role: 'bot',
          content: 'Đã kết nối lại. Bạn có thể tiếp tục cuộc trò chuyện.',
          timestamp: new Date(),
          id: `reconnected-${Date.now()}`
        }
        setMessages((prev) => [...prev, successMessage])
      }
    }

    setIsLoading(true)
    setInput('')
    setShowErrorRestart(false) // Ẩn nút restart khi gửi tin nhắn mới

    // Xử lý trường hợp người dùng gửi nhiều tin nhắn liên tiếp - reset tracking message
    lastMessageRef.current = ''

    // Thêm tin nhắn người dùng vào danh sách ngay lập tức
    const messageId = `user-${Date.now()}`
    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      id: messageId
    }
    setMessages((prev) => [...prev, userMessage])

    // Đặt timeout cho loading (15 giây)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }

    loadingTimeoutRef.current = setTimeout(() => {
      debugLog('Hết thời gian chờ phản hồi - dừng loading')

      // Chỉ thêm tin nhắn lỗi nếu vẫn trong trạng thái loading
      if (isLoading) {
        setIsLoading(false)
        setShowErrorRestart(true) // Hiển thị nút restart khi timeout

        const errorMessage: Message = {
          role: 'bot',
          content: 'Xin lỗi, tôi không nhận được phản hồi từ máy chủ. Vui lòng thử lại sau.',
          timestamp: new Date(),
          id: `timeout-error-${Date.now()}`
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }, 15000) // 15s timeout

    try {
      debugLog('Gửi tin nhắn:', inputText)
      await sendMessage({ message: inputText }).unwrap()
    } catch (error) {
      debugLog('Lỗi khi gửi tin nhắn:', error)

      // Dừng loading và xóa timeout
      setIsLoading(false)
      setShowErrorRestart(true) // Hiển thị nút restart khi lỗi gửi tin nhắn

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      // Kiểm tra kết nối và thử kết nối lại
      const socketConnected = checkConnectionStatus()
      if (!socketConnected) {
        debugLog('Socket mất kết nối, thử kết nối lại')
        manageConnection()
      }

      // Thêm thông báo lỗi gửi tin nhắn
      const errorMessage: Message = {
        role: 'bot',
        content: 'Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối mạng và thử lại.',
        timestamp: new Date(),
        id: `send-error-${Date.now()}`
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    'Làm thế nào để đặt lịch khám?',
    'Tôi cần chuẩn bị gì khi đi khám?',
    'Đội ngũ bác sĩ có chuyên môn gì?',
    'Chi phí khám bệnh như thế nào?'
  ]

  // Render messages với hiệu ứng typing
  const renderMessages = () => {
    return messages.map((message) => (
      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] rounded-lg p-3 ${
            message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.isTyping ? (
            // Hiệu ứng "đang nhập..."
            <div className='flex gap-1'>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]' />
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]' />
            </div>
          ) : (
            <>
              <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
              <p className='text-[10px] mt-1 opacity-70'>{message.timestamp.toLocaleTimeString()}</p>
            </>
          )}
        </div>
      </div>
    ))
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center p-4 border-b bg-primary/50'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-2'>
            <Bot className='w-6 h-6 text-primary' />
            <h2 className='font-semibold'>Diagnosis Bot</h2>
            <Sparkles className='w-4 h-4 text-yellow-500' />

            {/* Hiển thị trạng thái kết nối chi tiết hơn */}
            {connectionStatus === 'connected' ? (
              <span className='flex items-center ml-2 text-xs text-green-600'>
                <span className='w-2 h-2 mr-1 bg-green-600 rounded-full'></span>Đã kết nối
              </span>
            ) : connectionStatus === 'connecting' ? (
              <span className='flex items-center ml-2 text-xs text-orange-500'>
                <span className='w-2 h-2 mr-1 bg-orange-500 rounded-full animate-pulse'></span>Đang kết nối
              </span>
            ) : connectionStatus === 'error' ? (
              <span className='flex items-center ml-2 text-xs text-red-500'>
                <span className='w-2 h-2 mr-1 bg-red-500 rounded-full'></span>Lỗi kết nối
              </span>
            ) : (
              <span className='flex items-center ml-2 text-xs text-gray-500'>
                <span className='w-2 h-2 mr-1 bg-gray-500 rounded-full'></span>Ngắt kết nối
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 p-4 space-y-4 overflow-x-hidden overflow-y-auto'>
        {renderMessages()}

        {/* Nút restart khi lỗi hoặc timeout */}
        <AnimatePresence>
          {showErrorRestart && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className='flex justify-center my-4'
            >
              <div className='flex flex-col items-center gap-2 p-3 rounded-lg bg-red-50'>
                <div className='flex items-center gap-2 text-red-600'>
                  <AlertCircle className='w-4 h-4' />
                  <span className='text-sm font-medium'>Có vẻ đã xảy ra lỗi</span>
                </div>
                <RestartButton
                  onClick={restartConversation}
                  variant='error'
                  size='sm'
                  label='Khởi động lại cuộc trò chuyện'
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint về lệnh restart */}
        {messages.length <= 2 && (
          <div className='mt-2 text-center'>
            <p className='text-xs italic text-gray-500'>
              Gõ "/restart" hoặc nhấn nút <RefreshCw className='inline w-3 h-3' /> để khởi động lại cuộc trò chuyện
            </p>
          </div>
        )}

        {/* Suggested questions - only show when there's 1 message (the initial greeting) */}
        {messages.length === 1 && (
          <div className='mt-4'>
            <p className='mb-2 text-xs text-gray-500'>Một số câu hỏi gợi ý:</p>
            <div className='flex flex-wrap gap-2'>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className='text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-gray-700 transition-colors duration-200'
                  onClick={() => {
                    setInput(question)
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && !processingMessageRef.current && messageQueueRef.current.length === 0 && (
          <div className='flex justify-start'>
            <div className='p-3 bg-gray-100 rounded-lg'>
              <div className='flex gap-1'>
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]' />
                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]' />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!isAuthen && (
        <Button
          variant='link'
          className='px-0 py-0 pl-1 mb-4 text-sm hover:underline h-fit text-primary'
          onClick={() => navigate(path.signin)}
        >
          {t('auth.signUp.signIn')}
        </Button>
      )}

      {/* Nút Restart cố định ở cuối khung chat */}
      {messages.length > 2 && !showErrorRestart && (
        <div className='flex justify-center mb-2'>
          <RestartButton
            onClick={restartConversation}
            variant='secondary'
            size='sm'
            label='Khởi động lại'
            className='shadow-sm'
          />
        </div>
      )}

      {/* Input */}
      <div className='p-3 border-t bg-gray-50'>
        <div className='flex items-center gap-2'>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              !isAuthen
                ? 'Vui lòng đăng nhập để sử dụng chatbot'
                : connectionStatus === 'connected'
                  ? 'Nhập tin nhắn... (gõ /restart để khởi động lại)'
                  : connectionStatus === 'connecting'
                    ? 'Đang kết nối đến chatbot...'
                    : connectionStatus === 'error'
                      ? 'Không thể kết nối đến chatbot'
                      : 'Ngắt kết nối đến chatbot'
            }
            className='min-h-[45px] max-h-[120px] text-sm'
            disabled={isLoading || !isAuthen || connectionStatus !== 'connected'}
          />
          <Button
            size='icon'
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isAuthen || connectionStatus !== 'connected'}
            className='rounded-full shrink-0'
          >
            <Send className='w-4 h-4' />
          </Button>
        </div>
        {connectionStatus === 'error' && (
          <div className='flex justify-center mt-2'>
            <Button variant='outline' size='sm' onClick={() => manageConnection()} className='text-xs'>
              Thử kết nối lại
            </Button>
          </div>
        )}
        <div className='text-[10px] text-gray-400 mt-1 text-center'>Powered by Diagnosis AI</div>
      </div>
    </div>
  )
}
