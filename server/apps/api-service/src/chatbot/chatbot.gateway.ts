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

  constructor(private readonly chatbotService: ChatbotService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized')
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id)
    const userId = client.handshake.query.userId as string
    if (userId) {
      this.userSockets.set(userId, client)
      console.log(`Client connected: ${userId}`)
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
    // Lưu socket connection của người dùng
    this.userSockets.set(payload.userId, client)

    console.log('Message received:', payload)
    // Gửi tin nhắn đến chatbot qua Kafka
    const payloadKafka = {
      userId: payload.userId,
      messageId: payload.userId,
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
    }
  }
}
