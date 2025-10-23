import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableAllBooks() {
  console.log('📚 Habilitando todos los libros en el camino de lectura...\n');

  const result = await prisma.book.updateMany({
    where: {},
    data: {
      isAvailableInPath: true,
    },
  });

  console.log(`✅ ${result.count} libros habilitados en el camino de lectura`);

  // Verificar
  const enabledBooks = await prisma.book.count({
    where: { isAvailableInPath: true },
  });

  console.log(`📖 Total de libros disponibles en el camino: ${enabledBooks}`);

  await prisma.$disconnect();
}

enableAllBooks();
