import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message = this.resolveMessage(exceptionResponse);
    const code = this.resolveCode(exceptionResponse);

    response.status(status).json({
      success: false,
      ...(code ? { code } : {}),
      message: Array.isArray(message) ? 'No se pudo completar la operacion' : message,
      errors: Array.isArray(message) ? message : [],
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: context.getRequest<Request>().url,
    });
  }

  private resolveMessage(response: unknown) {
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object' && 'message' in response) {
      return (response as { message: unknown }).message;
    }

    return 'No se pudo completar la operacion';
  }

  private resolveCode(response: unknown) {
    if (response && typeof response === 'object' && 'code' in response) {
      const code = (response as { code: unknown }).code;
      return typeof code === 'string' ? code : undefined;
    }

    return undefined;
  }
}
