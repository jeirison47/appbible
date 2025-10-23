import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para importar Juan completo (capítulos 1-21)
 *
 * NOTA IMPORTANTE: Este script crea contenido de muestra para el MVP.
 * En producción, deberías integrar con API.Bible u otra fuente oficial.
 *
 * Para cada capítulo incluimos:
 * - Título descriptivo
 * - Contenido completo en 4 versiones (RV1960, NVI, TLA, NTV)
 * - Versículos parseados por versión
 */

// Metadata de capítulos de Juan con títulos reales
const juanChapters = [
  { number: 1, title: 'El Verbo hecho carne', verseCount: 51 },
  { number: 2, title: 'Las bodas de Caná', verseCount: 25 },
  { number: 3, title: 'Nicodemo visita a Jesús', verseCount: 36 },
  { number: 4, title: 'Jesús y la mujer samaritana', verseCount: 54 },
  { number: 5, title: 'El paralítico de Betesda', verseCount: 47 },
  { number: 6, title: 'Alimentación de los cinco mil', verseCount: 71 },
  { number: 7, title: 'Jesús en la fiesta de los tabernáculos', verseCount: 53 },
  { number: 8, title: 'La mujer adúltera', verseCount: 59 },
  { number: 9, title: 'Jesús sana a un ciego de nacimiento', verseCount: 41 },
  { number: 10, title: 'El buen pastor', verseCount: 42 },
  { number: 11, title: 'La resurrección de Lázaro', verseCount: 57 },
  { number: 12, title: 'María unge a Jesús', verseCount: 50 },
  { number: 13, title: 'Jesús lava los pies de sus discípulos', verseCount: 38 },
  { number: 14, title: 'Jesús, el camino al Padre', verseCount: 31 },
  { number: 15, title: 'La vid verdadera', verseCount: 27 },
  { number: 16, title: 'La obra del Espíritu Santo', verseCount: 33 },
  { number: 17, title: 'Jesús ora por sus discípulos', verseCount: 26 },
  { number: 18, title: 'Arresto y juicio de Jesús', verseCount: 40 },
  { number: 19, title: 'La crucifixión', verseCount: 42 },
  { number: 20, title: 'La resurrección', verseCount: 31 },
  { number: 21, title: 'Jesús se aparece a sus discípulos', verseCount: 25 },
];

/**
 * Genera contenido de muestra para un capítulo
 * En producción, esto vendría de una API real
 */
function generateChapterContent(chapterNum: number, title: string, verseCount: number) {
  const verses: Record<string, string> = {};

  for (let i = 1; i <= verseCount; i++) {
    verses[i.toString()] = `Contenido del versículo ${i} de Juan ${chapterNum}: ${title}. Este es contenido de ejemplo para el MVP. En producción, integrar con API.Bible o base de datos bíblica completa.`;
  }

  // Generar contenido completo concatenando todos los versículos
  const fullContent = Object.values(verses).join(' ');

  return {
    verses,
    fullContent,
  };
}

async function main() {
  console.log('📖 Importando Juan completo (capítulos 1-21)...\n');

  // Buscar libro de Juan
  const juan = await prisma.book.findUnique({
    where: { slug: 'juan' },
  });

  if (!juan) {
    throw new Error('Libro de Juan no encontrado');
  }

  let imported = 0;
  let skipped = 0;

  for (const chapter of juanChapters) {
    // Verificar si el capítulo ya existe
    const existing = await prisma.chapter.findUnique({
      where: {
        bookId_number: {
          bookId: juan.id,
          number: chapter.number,
        },
      },
    });

    if (existing) {
      console.log(`⏭️  Juan ${chapter.number} ya existe, saltando...`);
      skipped++;
      continue;
    }

    // Generar contenido para las 4 versiones
    const rv1960 = generateChapterContent(chapter.number, chapter.title, chapter.verseCount);
    const nvi = generateChapterContent(chapter.number, chapter.title, chapter.verseCount);
    const tla = generateChapterContent(chapter.number, chapter.title, chapter.verseCount);
    const ntv = generateChapterContent(chapter.number, chapter.title, chapter.verseCount);

    // Crear capítulo
    await prisma.chapter.create({
      data: {
        bookId: juan.id,
        number: chapter.number,
        title: chapter.title,
        verseCount: chapter.verseCount,

        contentRV1960: rv1960.fullContent,
        versesRV1960: rv1960.verses,

        contentNVI: nvi.fullContent,
        versesNVI: nvi.verses,

        contentTLA: tla.fullContent,
        versesTLA: tla.verses,

        contentNTV: ntv.fullContent,
        versesNTV: ntv.verses,
      },
    });

    console.log(`✅ Juan ${chapter.number} - ${chapter.title} (${chapter.verseCount} versículos)`);
    imported++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Resumen de importación:');
  console.log(`  ✅ Capítulos importados: ${imported}`);
  console.log(`  ⏭️  Capítulos existentes: ${skipped}`);
  console.log(`  📖 Total en Juan: ${imported + skipped}/21`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 Nota: Este contenido es de ejemplo para el MVP.');
  console.log('   Para contenido bíblico real, integra con API.Bible o una base de datos completa.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
