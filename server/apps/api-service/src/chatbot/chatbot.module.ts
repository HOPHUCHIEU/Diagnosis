import { Module } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotController } from './chatbot.controller'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ChatbotGateway } from 'apps/api-service/src/chatbot/chatbot.gateway'

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'api-chatbot',
              brokers: [configService.get<string>('KAFKA_BROKERS')],
              retry: {
                initialRetryTime: 1000,
                retries: 10
              }
            },
            consumer: {
              groupId: 'api-chatbot-consumer'
            }
          }
        }),
        inject: [ConfigService]
      }
    ])
  ],
  controllers: [ChatbotController],
  providers: [ChatbotGateway, ChatbotService],
  exports: [ChatbotService, ChatbotGateway]
})
export class ChatbotModule {}
