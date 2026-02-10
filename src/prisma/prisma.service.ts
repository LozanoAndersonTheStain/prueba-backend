/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Prisma Client
 * Maneja la conexión a la base de datos PostgreSQL
 *
 * @extends PrismaClient - Cliente generado por Prisma
 * @implements OnModuleInit - Hook para conectar al iniciar
 * @implements OnModuleDestroy - Hook para desconectar al terminar
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: any;

  /**
   * Constructor con configuración de logging y adapter
   */
  constructor(private configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });

    // Guardar pool para cleanup posterior
    this.pool = pool;
  }

  /**
   * Se ejecuta al inicializar el módulo
   * Establece la conexión con la base de datos
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');

      // Log de queries en desarrollo
      if (process.env.NODE_ENV === 'development') {
        (this as any).$on('query', (e: any) => {
          this.logger.debug(`Query: ${e.query}`);
          this.logger.debug(`Duration: ${e.duration}ms`);
        });
      }
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  /**
   * Se ejecuta al destruir el módulo
   * Cierra la conexión con la base de datos
   */
  async onModuleDestroy() {
    await this.$disconnect();
    if (this.pool) {
      await this.pool.end();
    }
    this.logger.log('🔌 Database disconnected');
  }

  /**
   * Limpia toda la base de datos
   * ⚠️ SOLO usar en desarrollo/testing
   *
   * @throws Error si se intenta usar en producción
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ Cannot clean database in production!');
    }

    // Obtener todos los modelos de Prisma
    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_'),
    );

    // Eliminar todos los registros de cada modelo
    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as string];
        if (model && typeof model.deleteMany === 'function') {
          return model.deleteMany();
        }
      }),
    );
  }

  /**
   * Ejecuta transacciones de forma segura
   *
   * @param fn Función con las operaciones a ejecutar
   * @returns Resultado de la transacción
   */
  async executeTransaction<T>(
    fn: (
      tx: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
      >,
    ) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn);
  }

  /**
   * Health check de la conexión
   *
   * @returns true si la conexión está activa
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
