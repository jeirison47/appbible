import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBookProgress() {
  console.log('🔧 Reparando BookProgress para Génesis...\n');

  // Buscar el libro
  const book = await prisma.book.findUnique({
    where: { slug: 'genesis' },
  });

  if (!book) {
    console.log('❌ Libro no encontrado');
    return;
  }

  // Buscar todos los ChapterReads del libro
  const chapterReads = await prisma.chapterRead.findMany({
    where: {
      chapter: {
        bookId: book.id,
      },
    },
    include: {
      chapter: true,
      user: true,
    },
  });

  console.log(`📚 Encontrados ${chapterReads.length} capítulos leídos\n`);

  // Agrupar por usuario
  const userReads = new Map<string, any[]>();
  for (const read of chapterReads) {
    if (!userReads.has(read.userId)) {
      userReads.set(read.userId, []);
    }
    userReads.get(read.userId)!.push(read);
  }

  // Crear/actualizar BookProgress para cada usuario
  for (const [userId, reads] of userReads.entries()) {
    const user = reads[0].user;
    const chaptersCompleted = reads.length;
    const lastChapterRead = Math.max(...reads.map(r => r.chapter.number));
    const totalXpEarned = reads.reduce((sum, r) => sum + r.xpEarned, 0);
    const isCompleted = chaptersCompleted >= book.totalChapters;

    console.log(`👤 Usuario: ${user.displayName}`);
    console.log(`   Capítulos completados: ${chaptersCompleted}`);
    console.log(`   Último capítulo leído: ${lastChapterRead}`);
    console.log(`   XP total ganado: ${totalXpEarned}`);

    const result = await prisma.bookProgress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id,
        },
      },
      create: {
        userId,
        bookId: book.id,
        chaptersCompleted,
        lastChapterRead,
        totalXpEarned,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        chaptersCompleted,
        lastChapterRead,
        totalXpEarned,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    console.log(`   ✅ BookProgress ${result.id.substring(0, 8)}... creado/actualizado\n`);
  }

  console.log('✨ Reparación completada!');

  await prisma.$disconnect();
}

fixBookProgress().catch(console.error);
