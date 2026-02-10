import { registerAs } from '@nestjs/config';

/**
 * Configuración de la base de datos
 *
 * Centraliza la configuración de conexión a PostgreSQL
 *
 * Uso:
 * ```typescript
 * constructor(
 *   @Inject(databaseConfig.KEY)
 *   private config: ConfigType<typeof databaseConfig>
 * ) {}
 *
 * const dbUrl = this.config.url;
 * ```
 */
export default registerAs('database', () => ({
  // URL de conexión a PostgreSQL
  url: process.env.DATABASE_URL,

  // Configuraciones adicionales
  pool: {
    min: 2,
    max: 10,
  },

  // Opciones de conexión
  options: {
    //ssl: process.env.NODE_ENV === 'production',
    connectionTimeoutMillis: 5000,
  },
}));
