import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './modules/productos/productos.module';
import { HealthModule } from './modules/health/health.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { validationSchema } from './config/validation.schema';

/**
 * Módulo raíz de la aplicación
 *
 * Importa y configura todos los módulos necesarios:
 * - ConfigModule: Manejo de variables de entorno
 * - PrismaModule: Conexión a base de datos (Global)
 * - ProductosModule: Funcionalidad de productos
 */
@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible globalmente
      envFilePath: '.env', // Ruta del archivo .env
      load: [appConfig, databaseConfig], // Cargar configuraciones
      validationSchema, // Validar .env con Joi
      validationOptions: {
        allowUnknown: true, // Permitir variables no definidas en el schema
        abortEarly: false, // Validar todas las variables antes de fallar
      },
    }),

    // Módulos de la aplicación
    PrismaModule, // Base de datos (Global)
    ProductosModule, // CRUD de productos
    HealthModule, // Health checks y monitoring
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
