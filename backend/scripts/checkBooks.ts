import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_ES = 'https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api';

async function checkBooks() {
  console.log('📚 Verificando libros en DB...\n');

  const booksInDB = await prisma.book.findMany({
    select: { id: true, slug: true, name: true }
  });

  console.log(`Libros en DB: ${booksInDB.length}`);
  booksInDB.forEach(b => {
    console.log(`  - ${b.slug} (${b.name})`);
  });

  console.log('\n📡 Verificando API española...\n');

  try {
    const response = await fetch(`${API_ES}/books`);
    const apiBooks = await response.json();

    console.log(`Libros en API: ${apiBooks.length}`);
    apiBooks.slice(0, 5).forEach((b: any) => {
      console.log(`  - ${b.id} (${b.name}, ${b.chapters.length} caps)`);
    });
  } catch (error: any) {
    console.error('❌ Error en API:', error.message);
  }

  await prisma.$disconnect();
}

checkBooks();
