import { Producto as PrismaProducto, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entity de Producto
 *
 * Representa el modelo de dominio del producto
 * Implementa la interfaz generada por Prisma
 * Se usa para tipar las respuestas del servicio
 */
export class ProductoEntity implements PrismaProducto {
  @ApiProperty({
    description: 'ID único del producto (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron 15',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 899.99,
    type: Number,
  })
  precio!: Prisma.Decimal;

  @ApiProperty({
    description: 'Stock disponible',
    example: 50,
  })
  stock!: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-02-10T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-02-10T12:00:00.000Z',
  })
  updatedAt!: Date;

  constructor(partial: Partial<ProductoEntity>) {
    Object.assign(this, partial);
  }

  /**
   * Convierte el Decimal de Prisma a number para JSON
   */
  toJSON() {
    return {
      ...this,
      precio: this.precio.toNumber(),
    };
  }
}
