/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from '../productos.controller';
import { ProductosService } from '../productos.service';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { ProductoEntity } from '../entities/producto.entity';
import { Prisma } from '@prisma/client';

/**
 * Tests unitarios del ProductosController
 *
 * Verifica que los endpoints REST funcionen correctamente
 * Usa mocks para aislar el controller del service
 */
describe('ProductosController', () => {
  let controller: ProductosController;
  let service: ProductosService;

  // Mock de ProductosService
  const mockProductosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStock: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        {
          provide: ProductosService,
          useValue: mockProductosService,
        },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
    service = module.get<ProductosService>(ProductosService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createDto: CreateProductoDto = {
        nombre: 'Laptop Dell',
        precio: 899.99,
        stock: 10,
      };

      const mockResult = new ProductoEntity({
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Laptop Dell',
        precio: new Prisma.Decimal(899.99),
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductosService.create.mockResolvedValue(mockResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      // Arrange
      const mockResult = {
        data: [
          new ProductoEntity({
            id: '1',
            nombre: 'Product 1',
            precio: new Prisma.Decimal(100),
            stock: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockProductosService.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should pass query parameters to service', async () => {
      // Arrange
      const queryDto = {
        nombre: 'Laptop',
        precioMin: 100,
        precioMax: 1000,
        page: 1,
        limit: 10,
      };

      mockProductosService.findAll.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      await controller.findAll(queryDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const mockResult = new ProductoEntity({
        id,
        nombre: 'Laptop Dell',
        precio: new Prisma.Decimal(899.99),
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductosService.findOne.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const updateDto: UpdateProductoDto = {
        nombre: 'Laptop Dell Updated',
        precio: 799.99,
      };

      const mockResult = new ProductoEntity({
        id,
        nombre: 'Laptop Dell Updated',
        precio: new Prisma.Decimal(799.99),
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductosService.update.mockResolvedValue(mockResult);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const mockResult = new ProductoEntity({
        id,
        nombre: 'Laptop Dell',
        precio: new Prisma.Decimal(899.99),
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductosService.remove.mockResolvedValue(mockResult);

      // Act
      const result = await controller.remove(id);

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const quantity = 5;

      const mockResult = new ProductoEntity({
        id,
        nombre: 'Laptop Dell',
        precio: new Prisma.Decimal(899.99),
        stock: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductosService.updateStock.mockResolvedValue(mockResult);

      // Act
      const result = await controller.updateStock(id, { quantity });

      // Assert
      expect(result).toEqual(mockResult);
      expect(service.updateStock).toHaveBeenCalledWith(id, quantity);
    });
  });

  describe('getStats', () => {
    it('should return product statistics', async () => {
      // Arrange
      const mockStats = {
        totalProductos: 10,
        precioPromedio: 500,
        stockPromedio: 20,
        stockTotal: 200,
        precioMinimo: 100,
        precioMaximo: 1000,
      };

      mockProductosService.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await controller.getStats();

      // Assert
      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });
});
