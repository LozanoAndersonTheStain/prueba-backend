import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';

/**
 * Módulo de Productos
 *
 * Encapsula toda la funcionalidad relacionada con productos
 *
 * Providers:
 * - ProductosService: Lógica de negocio
 *
 * Controllers:
 * - ProductosController: Endpoints REST
 *
 * Nota: PrismaService se inyecta automáticamente porque PrismaModule
 * está marcado como @Global() en src/prisma/prisma.module.ts
 */
@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
