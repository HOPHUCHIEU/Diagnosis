import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HTTP_STATUS_MESSAGES } from '../constant'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  public constructor(private readonly reflector: Reflector) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const code = this.reflector.get<number>('__httpCode__', context.getHandler()) || 200

    return next.handle().pipe(
      map((data) => {
        const now = new Date()
        // const localTime = new Date(now.getTime() + timezoneConfig.TIMEZONE_OFFSET * 60 * 60 * 1000)
        if (data && typeof data === 'object' && 'message' in data && Object.keys(data).length === 1) {
          return {
            timestamp: now.toISOString(),
            code,
            message: data.message
            // Don't include data field
          }
        }

        return {
          timestamp: now.toISOString(),
          code,
          message: HTTP_STATUS_MESSAGES[code],
          data
        }
      })
    )
  }
}
