/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/**
 * Filter global para manejar excepciones de Prisma
 *
 * Convierte los errores específicos de Prisma en respuestas HTTP
 * apropiadas con mensajes descriptivos
 *
 * Códigos de error manejados:
 * - P2002: Unique constraint violation (409 Conflict)
 * - P2025: Record not found (404 Not Found)
 * - P2003: Foreign key constraint (400 Bad Request)
 * - P2014: Required relation (400 Bad Request)
 * - Otros: 500 Internal Server Error
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Mapeo de códigos de error de Prisma a HTTP
    const errorMap: Record<
      string,
      {
        status: HttpStatus;
        message: string;
        getDetails?: (meta: any) => string;
      }
    > = {
      P2002: {
        status: HttpStatus.CONFLICT,
        message: 'El registro ya existe',
        getDetails: (meta) => {
          const field = meta?.target?.[0] || 'campo';
          return `Ya existe un registro con este ${field}`;
        },
      },
      P2025: {
        status: HttpStatus.NOT_FOUND,
        message: 'Registro no encontrado',
        getDetails: () =>
          'El registro solicitado no existe en la base de datos',
      },
      P2003: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Violación de restricción de clave foránea',
        getDetails: (meta) => {
          const field = meta?.field_name || 'relación';
          return `El ${field} especificado no es válido`;
        },
      },
      P2014: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Relación requerida no encontrada',
        getDetails: () => 'Falta una relación requerida',
      },
      P2016: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error en la consulta',
        getDetails: () => 'Los parámetros de la consulta no son válidos',
      },
    };

    const error = errorMap[exception.code] || {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error en la base de datos',
    };

    const details = error.getDetails
      ? error.getDetails(exception.meta)
      : error.message;

    const errorResponse = {
      statusCode: error.status,
      message: details,
      error: 'Database Error',
      code: exception.code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log del error
    this.logger.error(
      `Prisma Error [${exception.code}]: ${details}`,
      exception.stack,
    );

    response.status(error.status).json(errorResponse);
  }
}
