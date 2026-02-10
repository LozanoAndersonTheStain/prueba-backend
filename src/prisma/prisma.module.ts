import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global de Prisma
 *
 * @Global - Se marca como global para que esté disponible en toda la app
 * sin necesidad de importarlo en cada módulo
 *
 * Exporta:
 * - PrismaService: Para acceso a la base de datos
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
