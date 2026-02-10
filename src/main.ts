import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Bootstrap de la aplicación
 *
 * Configura:
 * - CORS
 * - Validation Pipes
 * - Exception Filters
 * - Swagger Documentation
 * - Global prefix
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Crear aplicación NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obtener ConfigService
  const configService = app.get(ConfigService);

  // CORS - Configuración de seguridad
  const corsOrigins = configService.get<string[]>('app.corsOrigin') || [];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    maxAge: 3600,
  });

  logger.log(`CORS enabled for origins: ${corsOrigins.join(', ')}`);

  // GLOBAL PREFIX - Prefijo para todas las rutas
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  logger.log(`Global prefix set to: /${apiPrefix}`);

  // VALIDATION PIPE - Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      // Transformación automática de tipos
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Convertir tipos automáticamente
      },
      // Validación estricta
      whitelist: true, // Eliminar propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
      // Mensajes de error detallados
      disableErrorMessages: false,
      validationError: {
        target: false, // No incluir el objeto completo en el error
        value: false, // No incluir el valor en el error
      },
    }),
  );

  logger.log('Global validation pipe configured');

  // EXCEPTION FILTERS - Manejo global de errores
  // Orden de aplicación: LIFO (Last In, First Out)
  // 1. AllExceptionsFilter (catch-all)
  // 2. HttpExceptionFilter (HTTP errors)
  // 3. PrismaExceptionFilter (Database errors)
  app.useGlobalFilters(
    new AllExceptionsFilter(), // Último filtro - captura todo
    new HttpExceptionFilter(), // Segundo filtro - errores HTTP
    new PrismaExceptionFilter(), // Primer filtro - errores Prisma
  );

  logger.log('Global exception filters configured');

  // SWAGGER DOCUMENTATION - OpenAPI
  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled');

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(
        configService.get<string>('app.swagger.title') || 'API Documentation',
      )
      .setDescription(
        configService.get<string>('app.swagger.description') ||
          'API REST Documentation',
      )
      .setVersion(configService.get<string>('app.swagger.version') || '1.0')
      .addTag('Productos', 'CRUD de productos')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // Este nombre se usa en @ApiBearerAuth('JWT-auth')
      )
      .addServer(`http://localhost:${configService.get('app.port')}`, 'Local')
      .addServer('https://api.example.com', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath =
      configService.get<string>('app.swagger.path') || 'api/docs';

    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Mantener token en localStorage
        docExpansion: 'none', // No expandir endpoints por defecto
        filter: true, // Habilitar búsqueda
        showRequestDuration: true, // Mostrar duración de requests
      },
      customSiteTitle: 'API Docs',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    });

    logger.log(`Swagger documentation available at: /${swaggerPath}`);
  } else {
    logger.log('Swagger documentation is disabled');
  }

  // GRACEFUL SHUTDOWN - Manejo de señales
  app.enableShutdownHooks();

  // START SERVER
  const port = configService.get<number>('app.port') || 3000;
  const nodeEnv = configService.get<string>('app.nodeEnv') || 'development';

  await app.listen(port);

  logger.log('');
  logger.log('===========================================');
  logger.log(`Application is running in ${nodeEnv.toUpperCase()} mode`);
  logger.log(`Server listening on: http://localhost:${port}`);
  logger.log(`API Base URL: http://localhost:${port}/${apiPrefix}`);

  if (swaggerEnabled) {
    const swaggerPath = configService.get<string>('app.swagger.path');
    logger.log(`Swagger Docs: http://localhost:${port}/${swaggerPath}`);
  }

  logger.log('===========================================');
  logger.log('');
  logger.log('Available endpoints:');
  logger.log(`   GET    /${apiPrefix}/productos          - List products`);
  logger.log(`   GET    /${apiPrefix}/productos/:id      - Get product`);
  logger.log(`   POST   /${apiPrefix}/productos          - Create product`);
  logger.log(`   PATCH  /${apiPrefix}/productos/:id      - Update product`);
  logger.log(`   DELETE /${apiPrefix}/productos/:id      - Delete product`);
  logger.log(`   GET    /${apiPrefix}/productos/stats    - Get statistics`);
  logger.log('===========================================');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Application failed to start', error);
  process.exit(1);
});
