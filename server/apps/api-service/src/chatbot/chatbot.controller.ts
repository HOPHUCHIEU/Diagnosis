import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { SendMessageDto } from 'apps/api-service/src/chatbot/dto/chatbot.dto'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { ChatbotGateway } from 'apps/api-service/src/chatbot/chatbot.gateway'

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly chatbotGateway: ChatbotGateway
  ) {}

  @Post('send')
  async sendMessage(@Body() messageDto: SendMessageDto): Promise<any> {
    return this.chatbotService.sendMessage(messageDto)
  }

  @MessagePattern('chat-responses')
  async handleChatbotResponse(@Payload() data: any) {
    console.log('Received message from chatbot:', data)
    if (data.userId) {
      this.chatbotGateway.sendToUser(data.userId, data.content)
    }
    return data
  }
}
