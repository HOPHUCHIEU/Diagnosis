import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    console.log('GlobalExceptionFilter::', exception)

    const code = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let errorResponse: any = {
      timestamp: new Date().toISOString(),
      code,
      path: request.url
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse()

      // Handle validation errors
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = Array.isArray(exceptionResponse['message'])
          ? exceptionResponse['message']
          : [exceptionResponse['message']]

        errorResponse = {
          ...errorResponse,
          error: exception.name,
          // message: messages.map((msg) => ({
          //   field: msg.split(' ')[0],
          //   message: msg
          // }))
          message: messages
        }
      } else {
        // Handle other HTTP exceptions
        errorResponse.message = exception.message
      }
    } else {
      // Handle unknown errors
      errorResponse.message = 'Internal server error'
    }

    response.status(code).json(errorResponse)
  }
}
