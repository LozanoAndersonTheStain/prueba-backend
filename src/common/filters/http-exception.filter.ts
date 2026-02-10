/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
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
 * Filter global para manejar excepciones HTTP
 *
 * Formatea las respuestas de error de manera consistente
 * y proporciona logging según la severidad
 *
 * Niveles de logging:
 * - 5xx: ERROR (errores del servidor)
 * - 4xx: WARN (errores del cliente)
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extraer mensaje del error
    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || exception.message;
    } else {
      message = 'Error interno del servidor';
    }

    // Formato de respuesta consistente
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: HttpStatus[status],
    };

    // Logging según la severidad
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Errores del servidor (5xx)
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        JSON.stringify(errorResponse),
        exception.stack,
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      // Errores del cliente (4xx)
      this.logger.warn(
        `${request.method} ${request.url} - ${status}`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(status).json(errorResponse);
  }
}
