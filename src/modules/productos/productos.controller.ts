import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductoDto } from './dto/query-producto.dto';
import { ProductoEntity } from './entities/producto.entity';

/**
 * Controller de Productos
 *
 * Expone los endpoints REST para el CRUD de productos
 * Documentado con Swagger/OpenAPI
 *
 * Base URL: /api/v1/productos
 */
@ApiTags('Productos')
@Controller('productos')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /**
   * POST /productos
   * Crear un nuevo producto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: ProductoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El producto ya existe',
  })
  async create(
    @Body() createProductoDto: CreateProductoDto,
  ): Promise<ProductoEntity> {
    return this.productosService.create(createProductoDto);
  }

  /**
   * GET /productos
   * Obtener todos los productos con filtros y paginación
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductoEntity' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryProductoDto) {
    return this.productosService.findAll(queryDto);
  }

  /**
   * GET /productos/stats
   * Obtener estadísticas de productos
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener estadísticas de productos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async getStats() {
    return this.productosService.getStats();
  }

  /**
   * GET /productos/:id
   * Obtener un producto por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: ProductoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
  })
  async findOne(@Param('id') id: string): Promise<ProductoEntity> {
    return this.productosService.findOne(id);
  }

  /**
   * PATCH /productos/:id
   * Actualizar un producto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: ProductoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoEntity> {
    return this.productosService.update(id, updateProductoDto);
  }

  /**
   * DELETE /productos/:id
   * Eliminar un producto
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
    type: ProductoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async remove(@Param('id') id: string): Promise<ProductoEntity> {
    return this.productosService.remove(id);
  }

  /**
   * PATCH /productos/:id/stock
   * Actualizar el stock de un producto
   */
  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar stock de un producto' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock actualizado exitosamente',
    type: ProductoEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente',
  })
  async updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ): Promise<ProductoEntity> {
    return this.productosService.updateStock(id, body.quantity);
  }
}
