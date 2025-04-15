import { Inject, Injectable } from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { SendMessageDto, ChatbotResponseDto } from './dto/chatbot.dto'

@Injectable()
export class ChatbotService {
  constructor(@Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    // Subscribe to response topic
    this.kafkaClient.subscribeToResponseOf('chat-responses')
    await this.kafkaClient.connect()
  }

  async sendMessage(messageDto: any): Promise<any> {
    try {
      return this.kafkaClient.emit('chat-messages', messageDto)
    } catch (error) {
      console.error('Error sending message to chatbot:', error)
      throw error
    }
  }
}
