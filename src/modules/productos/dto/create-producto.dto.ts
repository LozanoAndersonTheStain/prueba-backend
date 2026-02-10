/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsNumber,
  IsInt,
  Min,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un producto
 *
 * Valida los datos de entrada para la creación de productos
 * Usa class-validator para validaciones automáticas
 * Usa ApiProperty para documentación en Swagger
 */
export class CreateProductoDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron 15',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre!: string;

  @ApiProperty({
    description: 'Precio del producto en USD',
    example: 899.99,
    minimum: 0.01,
    type: Number,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  precio!: number;

  @ApiProperty({
    description: 'Cantidad disponible en inventario',
    example: 50,
    minimum: 0,
    type: Number,
  })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock!: number;
}
