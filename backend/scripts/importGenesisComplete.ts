import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para importar Génesis completo (capítulos 2-50)
 *
 * NOTA IMPORTANTE: Este script crea contenido de muestra para el MVP.
 * En producción, deberías integrar con API.Bible u otra fuente oficial.
 *
 * Para cada capítulo incluimos:
 * - Título descriptivo
 * - Contenido completo en 4 versiones (RV1960, NVI, TLA, NTV)
 * - Versículos parseados por versión
 */

// Metadata de capítulos de Génesis con títulos reales
const genesisChapters = [
  { number: 2, title: 'El huerto del Edén', verseCount: 25 },
  { number: 3, title: 'La caída del hombre', verseCount: 24 },
  { number: 4, title: 'Caín y Abel', verseCount: 26 },
  { number: 5, title: 'Los descendientes de Adán', verseCount: 32 },
  { number: 6, title: 'La maldad del hombre', verseCount: 22 },
  { number: 7, title: 'El diluvio', verseCount: 24 },
  { number: 8, title: 'El fin del diluvio', verseCount: 22 },
  { number: 9, title: 'El pacto de Dios con Noé', verseCount: 29 },
  { number: 10, title: 'Las naciones', verseCount: 32 },
  { number: 11, title: 'La torre de Babel', verseCount: 32 },
  { number: 12, title: 'El llamamiento de Abram', verseCount: 20 },
  { number: 13, title: 'Abram y Lot se separan', verseCount: 18 },
  { number: 14, title: 'Abram rescata a Lot', verseCount: 24 },
  { number: 15, title: 'El pacto de Dios con Abram', verseCount: 21 },
  { number: 16, title: 'Agar e Ismael', verseCount: 16 },
  { number: 17, title: 'El pacto de la circuncisión', verseCount: 27 },
  { number: 18, title: 'Isaac es prometido', verseCount: 33 },
  { number: 19, title: 'Sodoma y Gomorra', verseCount: 38 },
  { number: 20, title: 'Abraham y Abimelec', verseCount: 18 },
  { number: 21, title: 'Nacimiento de Isaac', verseCount: 34 },
  { number: 22, title: 'Dios prueba a Abraham', verseCount: 24 },
  { number: 23, title: 'Muerte de Sara', verseCount: 20 },
  { number: 24, title: 'Isaac y Rebeca', verseCount: 67 },
  { number: 25, title: 'Muerte de Abraham', verseCount: 34 },
  { number: 26, title: 'Isaac y Abimelec', verseCount: 35 },
  { number: 27, title: 'Jacob obtiene la bendición', verseCount: 46 },
  { number: 28, title: 'El sueño de Jacob', verseCount: 22 },
  { number: 29, title: 'Jacob se casa', verseCount: 35 },
  { number: 30, title: 'Los hijos de Jacob', verseCount: 43 },
  { number: 31, title: 'Jacob huye de Labán', verseCount: 55 },
  { number: 32, title: 'Jacob se prepara para encontrar a Esaú', verseCount: 32 },
  { number: 33, title: 'El encuentro de Jacob y Esaú', verseCount: 20 },
  { number: 34, title: 'Dina y Siquem', verseCount: 31 },
  { number: 35, title: 'Jacob en Betel', verseCount: 29 },
  { number: 36, title: 'Los descendientes de Esaú', verseCount: 43 },
  { number: 37, title: 'José y sus hermanos', verseCount: 36 },
  { number: 38, title: 'Judá y Tamar', verseCount: 30 },
  { number: 39, title: 'José y la esposa de Potifar', verseCount: 23 },
  { number: 40, title: 'José interpreta sueños en la cárcel', verseCount: 23 },
  { number: 41, title: 'José interpreta los sueños de Faraón', verseCount: 57 },
  { number: 42, title: 'Los hermanos de José van a Egipto', verseCount: 38 },
  { number: 43, title: 'El segundo viaje a Egipto', verseCount: 34 },
  { number: 44, title: 'La copa de José', verseCount: 34 },
  { number: 45, title: 'José se da a conocer', verseCount: 28 },
  { number: 46, title: 'Jacob va a Egipto', verseCount: 34 },
  { number: 47, title: 'José y el hambre', verseCount: 31 },
  { number: 48, title: 'Jacob bendice a Efraín y Manasés', verseCount: 22 },
  { number: 49, title: 'Jacob bendice a sus hijos', verseCount: 33 },
  { number: 50, title: 'Muerte de Jacob y José', verseCount: 26 },
];

/**
 * Genera contenido de muestra para un capítulo
 * En producción, esto vendría de una API real
 */
function generateChapterContent(chapterNum: number, title: string, verseCount: number) {
  const verses: Record<string, string> = {};

  for (let i = 1; i <= verseCount; i++) {
    verses[i.toString()] = `Contenido del versículo ${i} de Génesis ${chapterNum}: ${title}. Este es contenido de ejemplo para el MVP. En producción, integrar con API.Bible o base de datos bíblica completa.`;
  }

  // Generar contenido completo concatenando todos los versículos
  const fullContent = Object.values(verses).join(' ');

  return {
    verses,
    fullContent,
  };
}

async function main() {
  console.log('📖 Importando Génesis completo (capítulos 2-50)...\n');

  // Buscar libro de Génesis
  const genesis = await prisma.book.findUnique({
    where: { slug: 'genesis' },
  });

  if (!genesis) {
    throw new Error('Libro de Génesis no encontrado');
  }

  let imported = 0;
  let skipped = 0;

  for (const chapter of genesisChapters) {
    // Verificar si el capítulo ya existe
    const existing = await prisma.chapter.findUnique({
      where: {
        bookId_number: {
          bookId: genesis.id,
          number: chapter.number,
        },
      },
    });

    if (existing) {
      console.log(`⏭️  Génesis ${chapter.number} ya existe, saltando...`);
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
        bookId: genesis.id,
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

    console.log(`✅ Génesis ${chapter.number} - ${chapter.title} (${chapter.verseCount} versículos)`);
    imported++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Resumen de importación:');
  console.log(`  ✅ Capítulos importados: ${imported}`);
  console.log(`  ⏭️  Capítulos existentes: ${skipped}`);
  console.log(`  📖 Total en Génesis: ${imported + skipped + 1}/50`); // +1 por el cap 1 ya importado
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
