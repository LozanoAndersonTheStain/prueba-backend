import { PartialType } from '@nestjs/swagger';
import { CreateProductoDto } from './create-producto.dto';

/**
 * DTO para actualizar un producto
 *
 * Hereda de CreateProductoDto pero hace todos los campos opcionales
 * usando PartialType de @nestjs/swagger (mantiene documentación)
 *
 * Permite actualizaciones parciales (PATCH)
 *
 * Propiedades heredadas (todas opcionales):
 * - nombre?: string
 * - precio?: number
 * - stock?: number
 */
export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
