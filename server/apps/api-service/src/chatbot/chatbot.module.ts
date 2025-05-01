import { Module } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotController } from './chatbot.controller'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ChatbotGateway } from 'apps/api-service/src/chatbot/chatbot.gateway'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' }
      })
    }),
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const configuredBroker = configService.get<string>('KAFKA_BROKERS') || 'localhost:9092'
          console.log(`DEBUG: ChatbotModule - Original broker: ${configuredBroker}`)

          const brokerAddress = 'localhost:9092' // Force localhost
          console.log(`DEBUG: ChatbotModule - Using broker: ${brokerAddress}`)
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'api-chatbot',
                brokers: [brokerAddress],
                retry: {
                  initialRetryTime: 1000,
                  retries: 10
                }
              },
              consumer: {
                groupId: 'api-chatbot-consumer'
              }
            }
          }
        },
        inject: [ConfigService]
      }
    ])
  ],
  controllers: [ChatbotController],
  providers: [ChatbotGateway, ChatbotService],
  exports: [ChatbotService, ChatbotGateway]
})
export class ChatbotModule {}
