import { registerAs } from '@nestjs/config';

/**
 * Configuración de la aplicación
 *
 * Centraliza todas las configuraciones relacionadas con la app
 * Usa registerAs para crear un namespace de configuración
 *
 * Uso:
 * ```typescript
 * constructor(
 *   @Inject(appConfig.KEY)
 *   private config: ConfigType<typeof appConfig>
 * ) {}
 *
 * const port = this.config.port;
 * ```
 */
export default registerAs('app', () => ({
  // Entorno de ejecución
  nodeEnv: process.env.NODE_ENV || 'development',

  // Servidor
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map((origin) =>
    origin.trim(),
  ) || [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
  ],

  // Swagger/OpenAPI
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    path: process.env.SWAGGER_PATH || 'api/docs',
    title: process.env.SWAGGER_TITLE || 'API Documentation',
    description: process.env.SWAGGER_DESCRIPTION || 'API REST documentation',
    version: process.env.SWAGGER_VERSION || '1.0',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Security
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },
}));
