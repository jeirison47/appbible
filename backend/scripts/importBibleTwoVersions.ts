import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_ES = 'https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api';
const API_EN = 'https://bible-api.com';

// Mapeo de IDs de API española a slugs de DB
const BOOK_MAP_ES: Record<string, string> = {
  'spa-RVR1960:Gen': 'genesis', 'spa-RVR1960:Exod': 'exodo', 'spa-RVR1960:Lev': 'levitico',
  'spa-RVR1960:Num': 'numeros', 'spa-RVR1960:Deut': 'deuteronomio', 'spa-RVR1960:Josh': 'josue',
  'spa-RVR1960:Judg': 'jueces', 'spa-RVR1960:Ruth': 'rut', 'spa-RVR1960:1Sam': '1-samuel',
  'spa-RVR1960:2Sam': '2-samuel', 'spa-RVR1960:1Kgs': '1-reyes', 'spa-RVR1960:2Kgs': '2-reyes',
  'spa-RVR1960:1Chr': '1-cronicas', 'spa-RVR1960:2Chr': '2-cronicas', 'spa-RVR1960:Ezra': 'esdras',
  'spa-RVR1960:Neh': 'nehemias', 'spa-RVR1960:Esth': 'ester', 'spa-RVR1960:Job': 'job',
  'spa-RVR1960:Ps': 'salmos', 'spa-RVR1960:Prov': 'proverbios', 'spa-RVR1960:Eccl': 'eclesiastes',
  'spa-RVR1960:Song': 'cantares', 'spa-RVR1960:Isa': 'isaias', 'spa-RVR1960:Jer': 'jeremias',
  'spa-RVR1960:Lam': 'lamentaciones', 'spa-RVR1960:Ezek': 'ezequiel', 'spa-RVR1960:Dan': 'daniel',
  'spa-RVR1960:Hos': 'oseas', 'spa-RVR1960:Joel': 'joel', 'spa-RVR1960:Amos': 'amos',
  'spa-RVR1960:Obad': 'abdias', 'spa-RVR1960:Jonah': 'jonas', 'spa-RVR1960:Mic': 'miqueas',
  'spa-RVR1960:Nah': 'nahum', 'spa-RVR1960:Hab': 'habacuc', 'spa-RVR1960:Zeph': 'sofonias',
  'spa-RVR1960:Hag': 'hageo', 'spa-RVR1960:Zech': 'zacarias', 'spa-RVR1960:Mal': 'malaquias',
  'spa-RVR1960:Matt': 'mateo', 'spa-RVR1960:Mark': 'marcos', 'spa-RVR1960:Luke': 'lucas',
  'spa-RVR1960:John': 'juan', 'spa-RVR1960:Acts': 'hechos', 'spa-RVR1960:Rom': 'romanos',
  'spa-RVR1960:1Cor': '1-corintios', 'spa-RVR1960:2Cor': '2-corintios', 'spa-RVR1960:Gal': 'galatas',
  'spa-RVR1960:Eph': 'efesios', 'spa-RVR1960:Phil': 'filipenses', 'spa-RVR1960:Col': 'colosenses',
  'spa-RVR1960:1Thess': '1-tesalonicenses', 'spa-RVR1960:2Thess': '2-tesalonicenses',
  'spa-RVR1960:1Tim': '1-timoteo', 'spa-RVR1960:2Tim': '2-timoteo', 'spa-RVR1960:Titus': 'tito',
  'spa-RVR1960:Phlm': 'filemon', 'spa-RVR1960:Heb': 'hebreos', 'spa-RVR1960:Jas': 'santiago',
  'spa-RVR1960:1Pet': '1-pedro', 'spa-RVR1960:2Pet': '2-pedro', 'spa-RVR1960:1John': '1-juan',
  'spa-RVR1960:2John': '2-juan', 'spa-RVR1960:3John': '3-juan', 'spa-RVR1960:Jude': 'judas',
  'spa-RVR1960:Rev': 'apocalipsis',
};

// Mapeo para API en inglés (bible-api.com usa formato diferente)
const BOOK_MAP_EN: Record<string, string> = {
  'genesis': 'Genesis', 'exodo': 'Exodus', 'levitico': 'Leviticus', 'numeros': 'Numbers',
  'deuteronomio': 'Deuteronomy', 'josue': 'Joshua', 'jueces': 'Judges', 'rut': 'Ruth',
  '1-samuel': '1 Samuel', '2-samuel': '2 Samuel', '1-reyes': '1 Kings', '2-reyes': '2 Kings',
  '1-cronicas': '1 Chronicles', '2-cronicas': '2 Chronicles', 'esdras': 'Ezra',
  'nehemias': 'Nehemiah', 'ester': 'Esther', 'job': 'Job', 'salmos': 'Psalms',
  'proverbios': 'Proverbs', 'eclesiastes': 'Ecclesiastes', 'cantares': 'Song of Solomon',
  'isaias': 'Isaiah', 'jeremias': 'Jeremiah', 'lamentaciones': 'Lamentations',
  'ezequiel': 'Ezekiel', 'daniel': 'Daniel', 'oseas': 'Hosea', 'joel': 'Joel',
  'amos': 'Amos', 'abdias': 'Obadiah', 'jonas': 'Jonah', 'miqueas': 'Micah',
  'nahum': 'Nahum', 'habacuc': 'Habakkuk', 'sofonias': 'Zephaniah', 'hageo': 'Haggai',
  'zacarias': 'Zechariah', 'malaquias': 'Malachi',
  'mateo': 'Matthew', 'marcos': 'Mark', 'lucas': 'Luke', 'juan': 'John',
  'hechos': 'Acts', 'romanos': 'Romans', '1-corintios': '1 Corinthians',
  '2-corintios': '2 Corinthians', 'galatas': 'Galatians', 'efesios': 'Ephesians',
  'filipenses': 'Philippians', 'colosenses': 'Colossians', '1-tesalonicenses': '1 Thessalonians',
  '2-tesalonicenses': '2 Thessalonians', '1-timoteo': '1 Timothy', '2-timoteo': '2 Timothy',
  'tito': 'Titus', 'filemon': 'Philemon', 'hebreos': 'Hebrews', 'santiago': 'James',
  '1-pedro': '1 Peter', '2-pedro': '2 Peter', '1-juan': '1 John', '2-juan': '2 John',
  '3-juan': '3 John', 'judas': 'Jude', 'apocalipsis': 'Revelation',
};

interface APIVerseES {
  cleanText: string;
  reference: string;
}

interface APIResponseEN {
  verses: { book_name: string; chapter: number; verse: number; text: string; }[];
}

async function fetchSpanishChapter(apiBookId: string, chapterNum: number) {
  const response = await fetch(`${API_ES}/books/${apiBookId}/verses/${chapterNum}`);
  const verses: APIVerseES[] = await response.json();

  const versesObject: Record<string, string> = {};
  verses.forEach((v, i) => {
    versesObject[String(i + 1)] = v.cleanText;
  });

  const fullContent = verses.map((v, i) => `${i + 1} ${v.cleanText}`).join(' ');

  return { versesObject, fullContent, count: verses.length };
}

async function fetchEnglishChapter(bookName: string, chapterNum: number) {
  // bible-api.com formato: /john+3 o /john+3:1-16
  const url = `${API_EN}/${bookName.replace(/ /g, '+')}+${chapterNum}?translation=kjv`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  const text = await response.text();
  const data: APIResponseEN = JSON.parse(text);

  const versesObject: Record<string, string> = {};
  data.verses.forEach((v) => {
    versesObject[String(v.verse)] = v.text.trim();
  });

  const fullContent = data.verses.map(v => `${v.verse} ${v.text.trim()}`).join(' ');

  return { versesObject, fullContent, count: data.verses.length };
}

async function importCompleteBible() {
  console.log('🌍 Importando Biblia completa en 2 idiomas (RV1960 + KJV)...\n');

  try {
    // Obtener libros de la API española
    const booksResponse = await fetch(`${API_ES}/books`);
    const apiBooks = await booksResponse.json();

    let totalChapters = 0;
    let totalVerses = 0;

    for (const apiBook of apiBooks) {
      const slug = BOOK_MAP_ES[apiBook.id];
      if (!slug) continue;

      const book = await prisma.book.findUnique({ where: { slug } });
      if (!book) continue;

      const bookNameEN = BOOK_MAP_EN[slug];
      if (!bookNameEN) {
        console.log(`⚠️  No hay mapeo EN para: ${slug}`);
        continue;
      }

      console.log(`\n📖 ${book.name} / ${bookNameEN} (${apiBook.chapters.length} caps)`);

      for (let chapterNum = 1; chapterNum <= apiBook.chapters.length; chapterNum++) {
        try {
          // Obtener español
          const spanish = await fetchSpanishChapter(apiBook.id, chapterNum);
          await new Promise(resolve => setTimeout(resolve, 200)); // Pausa

          // Obtener inglés
          let english;
          try {
            english = await fetchEnglishChapter(bookNameEN, chapterNum);
            await new Promise(resolve => setTimeout(resolve, 200)); // Pausa
          } catch (enError: any) {
            console.log(`  ⚠️  Cap. ${chapterNum} - Error EN: ${enError.message.substring(0, 50)}`);
            // Usar valores por defecto si falla inglés
            english = { versesObject: {}, fullContent: '', count: 0 };
          }

          // Buscar o crear capítulo
          let chapter = await prisma.chapter.findFirst({
            where: { bookId: book.id, number: chapterNum },
          });

          const chapterData = {
            contentRV1960: spanish.fullContent,
            versesRV1960: spanish.versesObject,
            contentKJV: english.fullContent,
            versesKJV: english.versesObject,
            verseCount: spanish.count,
          };

          if (chapter) {
            await prisma.chapter.update({
              where: { id: chapter.id },
              data: chapterData,
            });
          } else {
            await prisma.chapter.create({
              data: {
                bookId: book.id,
                number: chapterNum,
                title: `Capítulo ${chapterNum}`,
                ...chapterData,
              },
            });
          }

          totalChapters++;
          totalVerses += spanish.count;

          if (chapterNum % 10 === 0) {
            console.log(`  ✓ ${chapterNum} caps completados`);
          }

        } catch (error: any) {
          console.error(`    ❌ Error en cap. ${chapterNum}:`, error.message);
        }
      }

      console.log(`  ✓ Completado`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETA!');
    console.log(`📊 Capítulos: ${totalChapters}`);
    console.log(`📊 Versículos: ${totalVerses}`);
    console.log(`🇪🇸 Español: RV1960`);
    console.log(`🇬🇧 Inglés: KJV`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importCompleteBible().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
