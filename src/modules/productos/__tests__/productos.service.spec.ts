/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from '../productos.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Prisma } from '@prisma/client';

/**
 * Tests unitarios del ProductosService
 *
 * Verifica que la lógica de negocio funcione correctamente
 * Usa mocks para aislar el servicio de las dependencias externas
 */
describe('ProductosService', () => {
  let service: ProductosService;

  // Mock de PrismaService
  const mockPrismaService = {
    producto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createDto: CreateProductoDto = {
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
      };

      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.producto.create.mockResolvedValue(mockProduct);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.nombre).toBe(createDto.nombre);
      expect(mockPrismaService.producto.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(mockPrismaService.producto.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if creation fails', async () => {
      // Arrange
      const createDto: CreateProductoDto = {
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
      };

      mockPrismaService.producto.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // Arrange
      const mockProducts = [
        {
          id: '1',
          nombre: 'Product 1',
          precio: 100,
          stock: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          nombre: 'Product 2',
          precio: 200,
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.producto.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.producto.count.mockResolvedValue(2);

      // Act
      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter products by name', async () => {
      // Arrange
      const mockProducts = [
        {
          id: '1',
          nombre: 'Laptop Dell',
          precio: 899,
          stock: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.producto.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.producto.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll({
        nombre: 'Laptop',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            nombre: {
              contains: 'Laptop',
              mode: 'insensitive',
            },
          }),
        }),
      );
    });

    it('should filter products by price range', async () => {
      // Arrange
      mockPrismaService.producto.findMany.mockResolvedValue([]);
      mockPrismaService.producto.count.mockResolvedValue(0);

      // Act
      await service.findAll({
        precioMin: 100,
        precioMax: 500,
        page: 1,
        limit: 10,
      });

      // Assert
      expect(mockPrismaService.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            precio: {
              gte: 100,
              lte: 500,
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return a product by id', async () => {
      // Arrange
      const mockProduct = {
        id: validId,
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.producto.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findOne(validId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(validId);
      expect(mockPrismaService.producto.findUnique).toHaveBeenCalledWith({
        where: { id: validId },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      mockPrismaService.producto.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      // Act & Assert
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a product', async () => {
      // Arrange
      const existingProduct = {
        id: validId,
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto: UpdateProductoDto = {
        nombre: 'Laptop Dell Updated',
        precio: 799.99,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateDto,
      };

      mockPrismaService.producto.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.producto.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(validId, updateDto);

      // Assert
      expect(result.nombre).toBe(updateDto.nombre);
      expect(result.precio).toBe(updateDto.precio);
      expect(mockPrismaService.producto.update).toHaveBeenCalledWith({
        where: { id: validId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      mockPrismaService.producto.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(validId, { nombre: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if no data provided', async () => {
      // Arrange
      const existingProduct = {
        id: validId,
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.producto.findUnique.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.update(validId, {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should delete a product', async () => {
      // Arrange
      const mockProduct = {
        id: validId,
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.producto.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.producto.delete.mockResolvedValue(mockProduct);

      // Act
      const result = await service.remove(validId);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.producto.delete).toHaveBeenCalledWith({
        where: { id: validId },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      // Arrange
      mockPrismaService.producto.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(validId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update product stock', async () => {
      // Arrange
      const mockProduct = {
        id: validId,
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = {
        ...mockProduct,
        stock: 15,
      };

      mockPrismaService.producto.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.producto.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.updateStock(validId, 5);

      // Assert
      expect(result.stock).toBe(15);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      // Arrange
      const mockProduct = {
        id: validId,
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.producto.findUnique.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.updateStock(validId, -10)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getStats', () => {
    it('should return product statistics', async () => {
      // Arrange
      const mockStats = {
        _count: 10,
        _avg: {
          precio: new Prisma.Decimal(500),
          stock: 20,
        },
        _sum: {
          stock: 200,
        },
        _min: {
          precio: new Prisma.Decimal(100),
        },
        _max: {
          precio: new Prisma.Decimal(1000),
        },
      };

      mockPrismaService.producto.aggregate.mockResolvedValue(mockStats);

      // Act
      const result = await service.getStats();

      // Assert
      expect(result.totalProductos).toBe(10);
      expect(result.precioPromedio).toBe(500);
      expect(result.stockTotal).toBe(200);
    });
  });
});
