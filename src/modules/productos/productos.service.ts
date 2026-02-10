import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductoDto } from './dto/query-producto.dto';
import { ProductoEntity } from './entities/producto.entity';
import { Prisma } from '@prisma/client';

/**
 * Servicio de Productos
 *
 * Contiene toda la lógica de negocio relacionada con productos
 * Implementa el patrón Repository usando Prisma
 *
 * Responsabilidades:
 * - CRUD de productos
 * - Validaciones de negocio
 * - Búsqueda y filtrado
 * - Paginación
 */
@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo producto
   *
   * @param createProductoDto Datos del producto a crear
   * @returns Producto creado
   */
  async create(createProductoDto: CreateProductoDto): Promise<ProductoEntity> {
    this.logger.log(`Creating product: ${createProductoDto.nombre}`);

    try {
      const producto = await this.prisma.producto.create({
        data: {
          nombre: createProductoDto.nombre,
          precio: createProductoDto.precio,
          stock: createProductoDto.stock,
        },
      });

      this.logger.log(`Product created successfully: ${producto.id}`);
      return new ProductoEntity(producto);
    } catch (error) {
      this.logger.error('Error creating product', error);
      throw error;
    }
  }

  /**
   * Obtener todos los productos con filtros y paginación
   *
   * @param queryDto Parámetros de búsqueda y paginación
   * @returns Lista paginada de productos
   */
  async findAll(queryDto: QueryProductoDto) {
    const {
      nombre,
      precioMin,
      precioMax,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    // Construir filtros dinámicos
    const where: Prisma.ProductoWhereInput = {};

    if (nombre) {
      where.nombre = {
        contains: nombre,
        mode: 'insensitive', // Búsqueda case-insensitive
      };
    }

    if (precioMin !== undefined || precioMax !== undefined) {
      where.precio = {};
      if (precioMin !== undefined) {
        where.precio.gte = precioMin;
      }
      if (precioMax !== undefined) {
        where.precio.lte = precioMax;
      }
    }

    // Calcular paginación
    const skip = (page - 1) * limit;
    const take = limit;

    try {
      // Ejecutar queries en paralelo
      const [productos, total] = await Promise.all([
        this.prisma.producto.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        this.prisma.producto.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Found ${productos.length} products (page ${page}/${totalPages})`,
      );

      return {
        data: productos.map((p) => new ProductoEntity(p)),
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching products', error);
      throw error;
    }
  }

  /**
   * Obtener un producto por ID
   *
   * @param id ID del producto
   * @returns Producto encontrado
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<ProductoEntity> {
    // Validar formato de UUID
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    try {
      const producto = await this.prisma.producto.findUnique({
        where: { id },
      });

      if (!producto) {
        this.logger.warn(`Product not found: ${id}`);
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      this.logger.log(`Product found: ${id}`);
      return new ProductoEntity(producto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching product ${id}`, error);
      throw error;
    }
  }

  /**
   * Actualizar un producto
   *
   * @param id ID del producto
   * @param updateProductoDto Datos a actualizar
   * @returns Producto actualizado
   * @throws NotFoundException si no existe
   */
  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<ProductoEntity> {
    // Validar que el producto exista
    await this.findOne(id);

    // Validar que haya datos para actualizar
    if (Object.keys(updateProductoDto).length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un campo para actualizar',
      );
    }

    try {
      const producto = await this.prisma.producto.update({
        where: { id },
        data: updateProductoDto,
      });

      this.logger.log(`Product updated: ${id}`);
      return new ProductoEntity(producto);
    } catch (error) {
      this.logger.error(`Error updating product ${id}`, error);
      throw error;
    }
  }

  /**
   * Eliminar un producto
   *
   * @param id ID del producto
   * @returns Producto eliminado
   * @throws NotFoundException si no existe
   */
  async remove(id: string): Promise<ProductoEntity> {
    // Validar que el producto exista
    await this.findOne(id);

    try {
      const producto = await this.prisma.producto.delete({
        where: { id },
      });

      this.logger.log(`Product deleted: ${id}`);
      return new ProductoEntity(producto);
    } catch (error) {
      this.logger.error(`Error deleting product ${id}`, error);
      throw error;
    }
  }

  /**
   * Actualizar el stock de un producto
   *
   * @param id ID del producto
   * @param quantity Cantidad a sumar/restar (puede ser negativa)
   * @returns Producto actualizado
   */
  async updateStock(id: string, quantity: number): Promise<ProductoEntity> {
    const producto = await this.findOne(id);

    const newStock = producto.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${producto.stock}, cantidad solicitada: ${Math.abs(quantity)}`,
      );
    }

    return this.update(id, { stock: newStock });
  }

  /**
   * Obtener estadísticas de productos
   *
   * @returns Estadísticas agregadas
   */
  async getStats() {
    try {
      const stats = await this.prisma.producto.aggregate({
        _count: true,
        _avg: {
          precio: true,
          stock: true,
        },
        _sum: {
          stock: true,
        },
        _min: {
          precio: true,
        },
        _max: {
          precio: true,
        },
      });

      return {
        totalProductos: stats._count,
        precioPromedio: stats._avg.precio?.toNumber() || 0,
        stockPromedio: Math.round(stats._avg.stock || 0),
        stockTotal: stats._sum.stock || 0,
        precioMinimo: stats._min.precio?.toNumber() || 0,
        precioMaximo: stats._max.precio?.toNumber() || 0,
      };
    } catch (error) {
      this.logger.error('Error getting stats', error);
      throw error;
    }
  }

  /**
   * Validar formato de UUID v4
   *
   * @param uuid String a validar
   * @returns true si es un UUID válido
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
