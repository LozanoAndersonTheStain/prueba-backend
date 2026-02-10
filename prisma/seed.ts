/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes (opcional)
  await prisma.producto.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Crear productos de prueba
  const productos = await prisma.producto.createMany({
    data: [
      {
        nombre: 'Laptop Dell XPS 15',
        precio: 1299.99,
        stock: 10,
      },
      {
        nombre: 'Mouse Logitech MX Master 3',
        precio: 99.99,
        stock: 50,
      },
      {
        nombre: 'Teclado Mecánico Keychron K2',
        precio: 79.99,
        stock: 30,
      },
      {
        nombre: 'Monitor LG UltraWide 34"',
        precio: 599.99,
        stock: 15,
      },
      {
        nombre: 'Webcam Logitech C920',
        precio: 69.99,
        stock: 25,
      },
    ],
  });

  console.log(`✅ Created ${productos.count} productos`);
  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
