import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { GlobalExceptionFilter } from 'apps/api-service/src/core/interceptors/exception.interceptor'
import { ResponseInterceptor } from 'apps/api-service/src/core/interceptors/response.interceptor'
import { LoggingMiddleware } from 'apps/api-service/src/core/middlewares/logging.middleware'

@Module({
  controllers: [],
  imports: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ]
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*')
  }
}
