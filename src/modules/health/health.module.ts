import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

/**
 * Health Check Module
 *
 * Proporciona endpoints para monitoreo del estado de la aplicación
 * Usa @nestjs/terminus para health checks estandarizados
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
