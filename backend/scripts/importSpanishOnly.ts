import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_ES = 'https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api';

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

interface APIVerseES {
  cleanText: string;
  reference: string;
}

async function fetchSpanishChapter(apiBookId: string, chapterNum: number) {
  const response = await fetch(`${API_ES}/books/${apiBookId}/verses/${chapterNum}`);
  const verses: APIVerseES[] = await response.json();

  const versesObject: Record<string, string> = {};
  verses.forEach((v, i) => {
    const verseNum = i + 1;
    versesObject[String(verseNum)] = v.cleanText;
  });

  const fullContent = verses.map((v, i) => {
    const verseNum = i + 1;
    return `${verseNum} ${v.cleanText}`;
  }).join(' ');

  return { versesObject, fullContent, count: verses.length };
}

async function importSpanishBible() {
  console.log('📖 Importando Biblia completa en español (RV1960)...\n');

  try {
    const booksResponse = await fetch(`${API_ES}/books`);
    const apiBooks = await booksResponse.json();

    let totalChapters = 0;
    let totalVerses = 0;

    for (const apiBook of apiBooks) {
      const slug = BOOK_MAP_ES[apiBook.id];
      if (!slug) continue;

      const book = await prisma.book.findUnique({ where: { slug } });
      if (!book) continue;

      console.log(`\n📖 ${book.name} (${apiBook.chapters.length} caps)`);

      for (let chapterNum = 1; chapterNum <= apiBook.chapters.length; chapterNum++) {
        try {
          const spanish = await fetchSpanishChapter(apiBook.id, chapterNum);
          await new Promise(resolve => setTimeout(resolve, 150));

          let chapter = await prisma.chapter.findFirst({
            where: { bookId: book.id, number: chapterNum },
          });

          const chapterData = {
            contentRV1960: spanish.fullContent,
            versesRV1960: spanish.versesObject,
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
                contentKJV: '',
                versesKJV: {},
                ...chapterData,
              },
            });
          }

          totalChapters++;
          totalVerses += spanish.count;

          if (chapterNum % 20 === 0) {
            console.log(`  ✓ ${chapterNum} caps`);
          }

        } catch (error: any) {
          console.error(`  ❌ Cap. ${chapterNum}: ${error.message.substring(0, 60)}`);
        }
      }

      console.log(`  ✅ Completado`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORTACIÓN COMPLETA!');
    console.log(`📊 Capítulos: ${totalChapters}`);
    console.log(`📊 Versículos: ${totalVerses}`);
    console.log(`🇪🇸 Español: RV1960`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importSpanishBible();
