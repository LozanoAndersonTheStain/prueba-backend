/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filter global para capturar TODAS las excepciones no manejadas
 *
 * Actúa como safety net para errores inesperados
 * Asegura que siempre se retorne una respuesta JSON válida
 *
 * Orden de filters:
 * 1. PrismaExceptionFilter (errores de Prisma)
 * 2. HttpExceptionFilter (errores HTTP)
 * 3. AllExceptionsFilter (cualquier otro error)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determinar mensaje
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Formato de respuesta
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: HttpStatus[status] || 'Internal Server Error',
    };

    // Log completo del error inesperado
    this.logger.error(
      `Unhandled Exception: ${request.method} ${request.url} - ${status}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // En desarrollo, incluir stack trace
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
