import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

/**
 * Interfaces para tipar las respuestas de la API
 */
interface ProductoResponse {
  id: string;
  nombre: string;
  precio: Prisma.Decimal;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StatsResponse {
  totalProductos: number;
  precioPromedio: Prisma.Decimal | null;
  precioMinimo: Prisma.Decimal | null;
  precioMaximo: Prisma.Decimal | null;
  stockTotal: number;
}

/**
 * Tests E2E del módulo de Productos
 *
 * Verifica el flujo completo:
 * HTTP Request → Controller → Service → Prisma → Database
 */
describe('ProductosController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: Server;

  // Datos de prueba
  const productoTest = {
    nombre: 'Laptop Dell E2E Test',
    precio: 899.99,
    stock: 10,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar la app igual que en main.ts
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Obtener el servidor HTTP tipado correctamente
    server = app.getHttpServer() as Server;

    // Obtener PrismaService para limpiar la DB
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Limpiar base de datos después de los tests
    await prisma.cleanDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar productos antes de cada test
    await prisma.producto.deleteMany();
  });

  describe('POST /api/v1/productos', () => {
    it('should create a new product', () => {
      return request(server)
        .post('/api/v1/productos')
        .send(productoTest)
        .expect(201)
        .expect((res) => {
          const body = res.body as ProductoResponse;
          expect(body).toHaveProperty('id');
          expect(body.nombre).toBe(productoTest.nombre);
          // Precio es Prisma.Decimal, verificar estructura
          expect(body.precio).toHaveProperty('d');
          expect(body.precio).toHaveProperty('e');
          expect(body.precio).toHaveProperty('s');
          expect(body.stock).toBe(productoTest.stock);
        });
    });

    it('should return 400 for invalid data', () => {
      return request(server)
        .post('/api/v1/productos')
        .send({
          nombre: 'AB', // Muy corto (min 3)
          precio: -10, // Negativo
          stock: -5, // Negativo
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(server)
        .post('/api/v1/productos')
        .send({
          nombre: 'Test Product',
          // Falta precio y stock
        })
        .expect(400);
    });

    it('should remove unknown properties', () => {
      return request(server)
        .post('/api/v1/productos')
        .send({
          ...productoTest,
          extraField: 'should be removed', // Campo extra
        })
        .expect(400); // forbidNonWhitelisted está activo
    });
  });

  describe('GET /api/v1/productos', () => {
    beforeEach(async () => {
      // Crear productos de prueba
      await prisma.producto.createMany({
        data: [
          { nombre: 'Product 1', precio: 100, stock: 5 },
          { nombre: 'Product 2', precio: 200, stock: 10 },
          { nombre: 'Product 3', precio: 300, stock: 15 },
        ],
      });
    });

    it('should return all products with pagination', () => {
      return request(server)
        .get('/api/v1/productos')
        .expect(200)
        .expect((res) => {
          const body = res.body as PaginatedResponse<ProductoResponse>;
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(body.data).toHaveLength(3);
          expect(body.meta.total).toBe(3);
        });
    });

    it('should filter products by name', () => {
      return request(server)
        .get('/api/v1/productos')
        .query({ nombre: 'Product 1' })
        .expect(200)
        .expect((res) => {
          const body = res.body as PaginatedResponse<ProductoResponse>;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].nombre).toBe('Product 1');
        });
    });

    it('should filter products by price range', () => {
      return request(server)
        .get('/api/v1/productos')
        .query({ precioMin: 150, precioMax: 250 })
        .expect(200)
        .expect((res) => {
          const body = res.body as PaginatedResponse<ProductoResponse>;
          expect(body.data).toHaveLength(1);
          expect(body.data[0].nombre).toBe('Product 2');
        });
    });

    it('should paginate results', () => {
      return request(server)
        .get('/api/v1/productos')
        .query({ page: 1, limit: 2 })
        .expect(200)
        .expect((res) => {
          const body = res.body as PaginatedResponse<ProductoResponse>;
          expect(body.data).toHaveLength(2);
          expect(body.meta.page).toBe(1);
          expect(body.meta.limit).toBe(2);
          expect(body.meta.totalPages).toBe(2);
        });
    });
  });

  describe('GET /api/v1/productos/:id', () => {
    it('should return a product by id', async () => {
      // Crear producto
      const producto = await prisma.producto.create({
        data: productoTest,
      });

      return request(server)
        .get(`/api/v1/productos/${producto.id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as ProductoResponse;
          expect(body.id).toBe(producto.id);
          expect(body.nombre).toBe(productoTest.nombre);
        });
    });

    it('should return 404 for non-existent product', () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      return request(server).get(`/api/v1/productos/${fakeId}`).expect(404);
    });

    it('should return 400 for invalid UUID', () => {
      return request(server).get('/api/v1/productos/invalid-uuid').expect(400);
    });
  });

  describe('PATCH /api/v1/productos/:id', () => {
    it('should update a product', async () => {
      // Crear producto
      const producto = await prisma.producto.create({
        data: productoTest,
      });

      const updateData = {
        nombre: 'Updated Product',
        precio: 699.99,
      };

      return request(server)
        .patch(`/api/v1/productos/${producto.id}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          const body = res.body as ProductoResponse;
          expect(body.nombre).toBe(updateData.nombre);
          // Precio es Prisma.Decimal, verificar estructura
          expect(body.precio).toHaveProperty('d');
          expect(body.stock).toBe(productoTest.stock); // No cambió
        });
    });

    it('should return 404 for non-existent product', () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      return request(server)
        .patch(`/api/v1/productos/${fakeId}`)
        .send({ nombre: 'Test' })
        .expect(404);
    });

    it('should return 400 for empty update', async () => {
      const producto = await prisma.producto.create({
        data: productoTest,
      });

      return request(server)
        .patch(`/api/v1/productos/${producto.id}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /api/v1/productos/:id', () => {
    it('should delete a product', async () => {
      // Crear producto
      const producto = await prisma.producto.create({
        data: productoTest,
      });

      return request(server)
        .delete(`/api/v1/productos/${producto.id}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as ProductoResponse;
          expect(body.id).toBe(producto.id);
        });
    });

    it('should return 404 for non-existent product', () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      return request(server).delete(`/api/v1/productos/${fakeId}`).expect(404);
    });

    it('should verify product is deleted', async () => {
      const producto = await prisma.producto.create({
        data: productoTest,
      });

      await request(server)
        .delete(`/api/v1/productos/${producto.id}`)
        .expect(200);

      // Verificar que ya no existe
      const deleted = await prisma.producto.findUnique({
        where: { id: producto.id },
      });

      expect(deleted).toBeNull();
    });
  });

  describe('GET /api/v1/productos/stats', () => {
    beforeEach(async () => {
      await prisma.producto.createMany({
        data: [
          { nombre: 'Product 1', precio: 100, stock: 5 },
          { nombre: 'Product 2', precio: 200, stock: 10 },
          { nombre: 'Product 3', precio: 300, stock: 15 },
        ],
      });
    });

    it('should return statistics', () => {
      return request(server)
        .get('/api/v1/productos/stats')
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsResponse;
          expect(body).toHaveProperty('totalProductos');
          expect(body).toHaveProperty('precioPromedio');
          expect(body).toHaveProperty('stockTotal');
          expect(body.totalProductos).toBe(3);
          expect(body.stockTotal).toBe(30);
        });
    });
  });
});
