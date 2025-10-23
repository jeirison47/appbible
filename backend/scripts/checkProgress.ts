import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProgress() {
  console.log('🔍 Verificando progreso del libro Génesis...\n');

  // Buscar el libro
  const book = await prisma.book.findUnique({
    where: { slug: 'genesis' },
  });

  if (!book) {
    console.log('❌ Libro no encontrado');
    return;
  }

  console.log(`📖 Libro: ${book.name} (ID: ${book.id})`);
  console.log(`   Total de capítulos: ${book.totalChapters}\n`);

  // Buscar progreso del usuario
  const bookProgress = await prisma.bookProgress.findMany({
    where: { bookId: book.id },
    include: {
      user: {
        select: {
          displayName: true,
          email: true,
        },
      },
    },
  });

  console.log(`👤 Usuarios con progreso en Génesis: ${bookProgress.length}\n`);

  for (const progress of bookProgress) {
    console.log(`Usuario: ${progress.user.displayName} (${progress.user.email})`);
    console.log(`  Capítulos completados: ${progress.chaptersCompleted}`);
    console.log(`  Último capítulo leído: ${progress.lastChapterRead}`);
    console.log(`  Completado: ${progress.completedAt ? 'Sí' : 'No'}`);
    console.log(`  XP total ganado: ${progress.totalXpEarned}`);
    console.log('');
  }

  // Verificar capítulos leídos
  const chapterReads = await prisma.chapterRead.findMany({
    where: {
      chapter: {
        bookId: book.id,
      },
    },
    include: {
      chapter: {
        select: {
          number: true,
          title: true,
        },
      },
      user: {
        select: {
          displayName: true,
        },
      },
    },
    orderBy: {
      readAt: 'desc',
    },
  });

  console.log(`📚 Capítulos leídos: ${chapterReads.length}\n`);

  for (const read of chapterReads) {
    console.log(`${read.user.displayName} leyó capítulo ${read.chapter.number}: ${read.chapter.title}`);
    console.log(`  Fecha: ${read.readAt}`);
    console.log(`  XP ganado: ${read.xpEarned}`);
    console.log(`  Tiempo: ${read.timeSpent}s`);
    console.log('');
  }

  await prisma.$disconnect();
}

checkProgress().catch(console.error);
