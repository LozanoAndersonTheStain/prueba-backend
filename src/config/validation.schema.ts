import * as Joi from 'joi';

/**
 * Schema de validación para variables de entorno
 *
 * Usa Joi para validar que todas las variables requeridas estén presentes
 * y tengan el formato correcto antes de iniciar la aplicación
 *
 * Si alguna variable no cumple las reglas, la app no iniciará y mostrará
 * un error descriptivo
 */
export const validationSchema = Joi.object({
  // ==========================================
  // DATABASE
  // ==========================================
  DATABASE_URL: Joi.string()
    .required()
    .description('PostgreSQL connection string'),

  // ==========================================
  // APPLICATION
  // ==========================================
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Current environment'),

  PORT: Joi.number().default(3000).description('Port number for the API'),

  API_PREFIX: Joi.string().default('api/v1').description('Global API prefix'),

  // ==========================================
  // SECURITY
  // ==========================================
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for JWT tokens'),

  JWT_EXPIRATION: Joi.string()
    .default('1d')
    .description('JWT token expiration time'),

  // ==========================================
  // CORS
  // ==========================================
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000')
    .description('Allowed CORS origins (comma-separated)'),

  // ==========================================
  // SWAGGER
  // ==========================================
  SWAGGER_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable/disable Swagger documentation'),

  SWAGGER_PATH: Joi.string().default('api/docs').description('Swagger UI path'),

  SWAGGER_TITLE: Joi.string()
    .default('API Documentation')
    .description('Swagger document title'),

  SWAGGER_DESCRIPTION: Joi.string()
    .default('API REST documentation')
    .description('Swagger document description'),

  SWAGGER_VERSION: Joi.string().default('1.0').description('API version'),

  // ==========================================
  // LOGGING
  // ==========================================
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info')
    .description('Application log level'),
});
