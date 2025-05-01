import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatbotService } from './chatbot.service'
import { SendMessageDto } from './dto/chatbot.dto'
import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  port: 5001,
  namespace: 'chatbot'
})
export class ChatbotGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private userSockets: Map<string, Socket> = new Map()

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized')
  }

  handleConnection(client: Socket) {
    try {
      console.log('Client connected:', client.id)
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1] ||
        (client.handshake.query.token as string)

      if (!token) {
        client.emit('error', { message: 'Authentication error: Token is required' })
        client.disconnect()
        return
      }

      try {
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET_KEY')
        })

        if (!payload || !payload.id) {
          client.emit('error', { message: 'Authentication error: Invalid token' })
          client.disconnect()
          return
        }

        const userId = payload.id

        client.data = { ...client.data, userId }
        this.userSockets.set(userId, client)

        client.emit('connected', { userId })
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          client.emit('error', { message: 'Authentication error: Token has expired' })
        } else {
          client.emit('error', { message: 'Authentication error: Invalid token' })
        }
        client.disconnect()
      }
    } catch (error) {
      client.emit('error', { message: 'Server error during authentication' })
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string
    if (userId) {
      this.userSockets.delete(userId)
      console.log(`Client disconnected: ${userId}`)
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: SendMessageDto) {
    const userId = client.data?.userId

    if (!userId) {
      return { event: 'error', data: 'Unauthorized' }
    }

    console.log('Message received:', payload)
    const payloadKafka = {
      userId: userId,
      messageId: userId,
      token: client.handshake.auth.token,
      content: payload.message,
      timestamp: new Date().toISOString()
    }
    await this.chatbotService.sendMessage(payloadKafka)

    return { event: 'messageSent', data: 'Message sent to chatbot' }
  }

  // Phương thức để gửi phản hồi đến người dùng cụ thể
  sendToUser(userId: string, message: string) {
    const userSocket = this.userSockets.get(userId)
    if (userSocket) {
      userSocket.emit('chatbotResponse', { userId, message })
      console.log(`Sent message to user ${userId}: ${message}`)
    }
  }
}
