import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de IDs de la API a nuestros slugs
const API_TO_SLUG_MAP: Record<string, string> = {
  // Antiguo Testamento
  'genesis': 'genesis',
  'exodus': 'exodo',
  'leviticus': 'levitico',
  'numbers': 'numeros',
  'deuteronomy': 'deuteronomio',
  'joshua': 'josue',
  'judges': 'jueces',
  'ruth': 'rut',
  '1-samuel': '1-samuel',
  '2-samuel': '2-samuel',
  '1-kings': '1-reyes',
  '2-kings': '2-reyes',
  '1-chronicles': '1-cronicas',
  '2-chronicles': '2-cronicas',
  'ezra': 'esdras',
  'nehemiah': 'nehemias',
  'esther': 'ester',
  'job': 'job',
  'psalms': 'salmos',
  'proverbs': 'proverbios',
  'ecclesiastes': 'eclesiastes',
  'song-of-solomon': 'cantares',
  'isaiah': 'isaias',
  'jeremiah': 'jeremias',
  'lamentations': 'lamentaciones',
  'ezekiel': 'ezequiel',
  'daniel': 'daniel',
  'hosea': 'oseas',
  'joel': 'joel',
  'amos': 'amos',
  'obadiah': 'abdias',
  'jonah': 'jonas',
  'micah': 'miqueas',
  'nahum': 'nahum',
  'habakkuk': 'habacuc',
  'zephaniah': 'sofonias',
  'haggai': 'hageo',
  'zechariah': 'zacarias',
  'malachi': 'malaquias',
  // Nuevo Testamento
  'matthew': 'mateo',
  'mark': 'marcos',
  'luke': 'lucas',
  'john': 'juan',
  'acts': 'hechos',
  'romans': 'romanos',
  '1-corinthians': '1-corintios',
  '2-corinthians': '2-corintios',
  'galatians': 'galatas',
  'ephesians': 'efesios',
  'philippians': 'filipenses',
  'colossians': 'colosenses',
  '1-thessalonians': '1-tesalonicenses',
  '2-thessalonians': '2-tesalonicenses',
  '1-timothy': '1-timoteo',
  '2-timothy': '2-timoteo',
  'titus': 'tito',
  'philemon': 'filemon',
  'hebrews': 'hebreos',
  'james': 'santiago',
  '1-peter': '1-pedro',
  '2-peter': '2-pedro',
  '1-john': '1-juan',
  '2-john': '2-juan',
  '3-john': '3-juan',
  'jude': 'judas',
  'revelation': 'apocalipsis',
};

const API_BASE_URL_ES = 'https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api';  // RV1960 Español
const API_BASE_URL_EN = 'https://bible-api.com';  // KJV Inglés

interface APIBook {
  id: string;
  testament: 'OT' | 'NT';
  name: string;
  chapters: { chapter: string }[];
}

interface APIVerse {
  cleanText: string;
  reference: string;
}

async function importCompleteBible() {
  console.log('🚀 Iniciando importación completa de la Biblia...\n');

  try {
    // 1. Obtener todos los libros de la API
    console.log('📚 Obteniendo lista de libros...');
    const booksResponse = await fetch(`${API_BASE_URL}/books`);
    const apiBooks: APIBook[] = await booksResponse.json();
    console.log(`✓ ${apiBooks.length} libros encontrados\n`);

    let totalChaptersImported = 0;
    let totalVersesImported = 0;

    // 2. Procesar cada libro
    for (const apiBook of apiBooks) {
      const slug = API_TO_SLUG_MAP[apiBook.id];

      if (!slug) {
        console.log(`⚠️  Libro no mapeado: ${apiBook.id}, saltando...`);
        continue;
      }

      // Buscar el libro en nuestra DB
      const book = await prisma.book.findUnique({
        where: { slug },
      });

      if (!book) {
        console.log(`⚠️  Libro no encontrado en DB: ${slug}, saltando...`);
        continue;
      }

      console.log(`\n📖 Procesando: ${book.name} (${apiBook.chapters.length} capítulos)`);

      // 3. Procesar cada capítulo del libro
      for (let chapterNum = 1; chapterNum <= apiBook.chapters.length; chapterNum++) {
        try {
          // Obtener todos los versículos del capítulo
          console.log(`  Cap. ${chapterNum}...`);
          const versesResponse = await fetch(
            `${API_BASE_URL}/books/${apiBook.id}/verses/${chapterNum}`
          );
          const apiVerses: APIVerse[] = await versesResponse.json();

          // Construir objeto de versículos { "1": "texto", "2": "texto", ... }
          const versesObject: Record<string, string> = {};
          apiVerses.forEach((verse, index) => {
            versesObject[String(index + 1)] = verse.cleanText;
          });

          // Construir contenido completo (para contentRV1960)
          const fullContent = apiVerses.map((v, i) => `${i + 1} ${v.cleanText}`).join(' ');

          // Buscar si ya existe el capítulo
          let chapter = await prisma.chapter.findFirst({
            where: {
              bookId: book.id,
              number: chapterNum,
            },
          });

          if (chapter) {
            // Actualizar capítulo existente
            await prisma.chapter.update({
              where: { id: chapter.id },
              data: {
                contentRV1960: fullContent,
                versesRV1960: versesObject,
                verseCount: apiVerses.length,
                // Mantenemos las otras versiones con contenido placeholder
                contentNVI: fullContent,
                versesNVI: versesObject,
                contentTLA: fullContent,
                versesTLA: versesObject,
                contentNTV: fullContent,
                versesNTV: versesObject,
              },
            });
          } else {
            // Crear nuevo capítulo
            chapter = await prisma.chapter.create({
              data: {
                bookId: book.id,
                number: chapterNum,
                title: `Capítulo ${chapterNum}`,
                contentRV1960: fullContent,
                versesRV1960: versesObject,
                contentNVI: fullContent,
                versesNVI: versesObject,
                contentTLA: fullContent,
                versesTLA: versesObject,
                contentNTV: fullContent,
                versesNTV: versesObject,
                verseCount: apiVerses.length,
              },
            });
          }

          totalChaptersImported++;
          totalVersesImported += apiVerses.length;

          // Pequeña pausa para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`    ❌ Error en capítulo ${chapterNum}:`, error);
        }
      }

      console.log(`  ✓ ${book.name} completado`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ IMPORTACIÓN COMPLETA!');
    console.log(`📊 Total de capítulos importados: ${totalChaptersImported}`);
    console.log(`📊 Total de versículos importados: ${totalVersesImported}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error en la importación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
importCompleteBible()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
