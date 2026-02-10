/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Health Check Controller
 *
 * Proporciona endpoints para verificar el estado de la aplicación
 * Útil para:
 * - Load balancers
 * - Monitoring systems (Datadog, New Relic)
 * - Kubernetes readiness/liveness probes
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * GET /health
   * Health check completo de la aplicación
   */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Verificar estado de la aplicación' })
  @ApiResponse({
    status: 200,
    description: 'Aplicación funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio no disponible',
  })
  check() {
    return this.health.check([
      // Verificar conexión a base de datos
      () => this.prismaHealth.pingCheck('database', this.prisma),

      // Verificar uso de memoria (heap)
      // Falla si supera 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Verificar uso de memoria (RSS)
      // Falla si supera 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Verificar espacio en disco
      // Falla si hay menos de 50GB disponibles
      () =>
        this.disk.checkStorage('disk_storage', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.9, // 90% usado
        }),
    ]);
  }

  /**
   * GET /health/database
   * Health check específico de la base de datos
   */
  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Verificar conexión a base de datos' })
  @ApiResponse({
    status: 200,
    description: 'Base de datos conectada',
  })
  @ApiResponse({
    status: 503,
    description: 'Base de datos no disponible',
  })
  checkDatabase() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  /**
   * GET /health/memory
   * Health check de uso de memoria
   */
  @Get('memory')
  @HealthCheck()
  @ApiOperation({ summary: 'Verificar uso de memoria' })
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  /**
   * GET /health/ready
   * Readiness probe para Kubernetes
   * Indica si la app está lista para recibir tráfico
   */
  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (Kubernetes)' })
  checkReady() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  /**
   * GET /health/live
   * Liveness probe para Kubernetes
   * Indica si la app está viva (no debe reiniciarse)
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (Kubernetes)' })
  checkLive() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
