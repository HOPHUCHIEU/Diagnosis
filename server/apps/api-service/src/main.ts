import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common'
import * as bodyParser from 'body-parser'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { IoAdapter } from '@nestjs/platform-socket.io'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config: ConfigService = app.get(ConfigService)

  // FIX lỗi favicon.ico khi browser tự động gọi (trả về 204 No Content)
  app.use('/favicon.ico', (req, res) => res.status(204).end())

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [config.get<string>('KAFKA_BROKERS')],
        clientId: 'api-service',
        retry: {
          initialRetryTime: 1000,
          retries: 10
        }
      },
      consumer: {
        groupId: 'api-consumer'
      },
      subscribe: {
        fromBeginning: true
      }
    }
  })

  app.enableVersioning({
    type: VersioningType.URI
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.enableCors()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.setGlobalPrefix('api/v1')
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  app.useWebSocketAdapter(new IoAdapter(app))
  app.getHttpAdapter().get('/', (req, res) => {
    res.send('API Server is running! Please use /api/v1 for API routes.');
  });
  app.getHttpAdapter().get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });
  app.startAllMicroservices()
  console.log(`🚀 Kafka Microservice (API) is running`)
  const port: number = config.get<number>('PORT')
  await app.listen(port, () => {
    console.log(`[WEB]`, config.get<string>('BASE_URL'), `🚀 🚀 🚀 `)
    console.log(`[KAFKA] Connected to ${config.get<string>('KAFKA_BROKERS')} 📫`)
  })
}

bootstrap()
