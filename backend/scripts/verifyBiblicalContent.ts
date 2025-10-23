import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📚 VERIFICACIÓN DE CONTENIDO BÍBLICO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Estadísticas generales
  const totalBooks = await prisma.book.count();
  const totalChapters = await prisma.chapter.count();

  console.log('📊 ESTADÍSTICAS GENERALES:');
  console.log(`  Total de libros: ${totalBooks}/66`);
  console.log(`  Total de capítulos: ${totalChapters}\n`);

  // Verificar libros disponibles en el Camino
  const availableBooks = await prisma.book.findMany({
    where: { isAvailableInPath: true },
    include: {
      chapters: {
        select: { number: true, title: true, verseCount: true },
        orderBy: { number: 'asc' },
      },
    },
  });

  console.log('📖 LIBROS DISPONIBLES EN EL CAMINO:\n');

  for (const book of availableBooks) {
    console.log(`${book.name}:`);
    console.log(`  ├─ Testamento: ${book.testament === 'OLD' ? 'Antiguo' : 'Nuevo'}`);
    console.log(`  ├─ Categoría: ${book.category}`);
    console.log(`  ├─ Capítulos esperados: ${book.totalChapters}`);
    console.log(`  ├─ Capítulos en base de datos: ${book.chapters.length}`);
    console.log(`  └─ Estado: ${book.chapters.length === book.totalChapters ? '✅ COMPLETO' : '⚠️  INCOMPLETO'}\n`);

    if (book.chapters.length > 0) {
      console.log(`  Capítulos importados:`);

      // Mostrar primeros 5 capítulos
      const firstFive = book.chapters.slice(0, 5);
      firstFive.forEach((chapter) => {
        console.log(`    • Cap. ${chapter.number}: ${chapter.title} (${chapter.verseCount} versículos)`);
      });

      if (book.chapters.length > 10) {
        console.log(`    ... (${book.chapters.length - 10} capítulos más) ...`);
      }

      // Mostrar últimos 5 capítulos
      if (book.chapters.length > 5) {
        const lastFive = book.chapters.slice(-5);
        lastFive.forEach((chapter) => {
          console.log(`    • Cap. ${chapter.number}: ${chapter.title} (${chapter.verseCount} versículos)`);
        });
      }
      console.log('');
    }
  }

  // Contar versículos totales
  const genesisChapters = await prisma.chapter.findMany({
    where: { book: { slug: 'genesis' } },
    select: { verseCount: true },
  });

  const juanChapters = await prisma.chapter.findMany({
    where: { book: { slug: 'juan' } },
    select: { verseCount: true },
  });

  const genesisVerses = genesisChapters.reduce((sum, ch) => sum + ch.verseCount, 0);
  const juanVerses = juanChapters.reduce((sum, ch) => sum + ch.verseCount, 0);

  console.log('📊 RESUMEN DE VERSÍCULOS:');
  console.log(`  Génesis: ${genesisVerses} versículos en ${genesisChapters.length} capítulos`);
  console.log(`  Juan: ${juanVerses} versículos en ${juanChapters.length} capítulos`);
  console.log(`  Total: ${genesisVerses + juanVerses} versículos en ${genesisChapters.length + juanChapters.length} capítulos\n`);

  // Verificar versiones
  const chapterSample = await prisma.chapter.findFirst({
    where: { book: { slug: 'genesis' }, number: 1 },
  });

  if (chapterSample) {
    console.log('📖 VERSIONES BÍBLICAS DISPONIBLES:');
    console.log(`  ${chapterSample.contentRV1960 ? '✅' : '❌'} Reina Valera 1960 (RV1960)`);
    console.log(`  ${chapterSample.contentNVI ? '✅' : '❌'} Nueva Versión Internacional (NVI)`);
    console.log(`  ${chapterSample.contentTLA ? '✅' : '❌'} Traducción en Lenguaje Actual (TLA)`);
    console.log(`  ${chapterSample.contentNTV ? '✅' : '❌'} Nueva Traducción Viviente (NTV)\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ VERIFICACIÓN COMPLETADA\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
