import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://bolls.life';
const TRANSLATION = 'NVI';

// bookid (1-66) → slug usado en nuestra DB
const BOOK_ID_TO_SLUG: Record<number, string> = {
  1:  'genesis',          2:  'exodo',            3:  'levitico',
  4:  'numeros',          5:  'deuteronomio',      6:  'josue',
  7:  'jueces',           8:  'rut',               9:  '1-samuel',
  10: '2-samuel',         11: '1-reyes',           12: '2-reyes',
  13: '1-cronicas',       14: '2-cronicas',        15: 'esdras',
  16: 'nehemias',         17: 'ester',             18: 'job',
  19: 'salmos',           20: 'proverbios',        21: 'eclesiastes',
  22: 'cantares',         23: 'isaias',            24: 'jeremias',
  25: 'lamentaciones',    26: 'ezequiel',          27: 'daniel',
  28: 'oseas',            29: 'joel',              30: 'amos',
  31: 'abdias',           32: 'jonas',             33: 'miqueas',
  34: 'nahum',            35: 'habacuc',           36: 'sofonias',
  37: 'hageo',            38: 'zacarias',          39: 'malaquias',
  40: 'mateo',            41: 'marcos',            42: 'lucas',
  43: 'juan',             44: 'hechos',            45: 'romanos',
  46: '1-corintios',      47: '2-corintios',       48: 'galatas',
  49: 'efesios',          50: 'filipenses',        51: 'colosenses',
  52: '1-tesalonicenses', 53: '2-tesalonicenses',  54: '1-timoteo',
  55: '2-timoteo',        56: 'tito',              57: 'filemon',
  58: 'hebreos',          59: 'santiago',          60: '1-pedro',
  61: '2-pedro',          62: '1-juan',            63: '2-juan',
  64: '3-juan',           65: 'judas',             66: 'apocalipsis',
};

interface BollsBook {
  bookid: number;
  name: string;
  chapters: number;
}

interface BollsVerse {
  pk: number;
  verse: number;
  text: string;
  comment?: string;
}

interface OutputVerse {
  number: number;
  text: string;
}

interface OutputChapter {
  number: number;
  verseCount: number;
  verses: OutputVerse[];
}

interface OutputBook {
  slug: string;
  name: string;
  chapters: OutputChapter[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

async function main() {
  console.log(`📖 Descargando ${TRANSLATION} desde bolls.life...\n`);

  const booksRes = await fetch(`${BASE_URL}/get-books/${TRANSLATION}/`);
  if (!booksRes.ok) throw new Error(`get-books error: ${booksRes.status}`);
  const bollsBooks: BollsBook[] = await booksRes.json();

  console.log(`✓ ${bollsBooks.length} libros encontrados\n`);

  const books: OutputBook[] = [];
  let totalChapters = 0;
  let totalVerses = 0;
  let errors = 0;

  for (const book of bollsBooks) {
    const slug = BOOK_ID_TO_SLUG[book.bookid];
    if (!slug) {
      console.log(`⚠️  Sin slug para bookid ${book.bookid}: ${book.name}`);
      errors++;
      continue;
    }

    process.stdout.write(`📘 ${book.name} (${book.chapters} caps)... `);
    const outputChapters: OutputChapter[] = [];

    for (let chNum = 1; chNum <= book.chapters; chNum++) {
      const url = `${BASE_URL}/get-chapter/${TRANSLATION}/${book.bookid}/${chNum}/`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`\n  ❌ Error cap ${chNum}: HTTP ${res.status}`);
        errors++;
        continue;
      }

      const verses: BollsVerse[] = await res.json();
      const outputVerses: OutputVerse[] = verses.map((v) => ({
        number: v.verse,
        text: stripHtml(v.text),
      }));

      outputChapters.push({
        number: chNum,
        verseCount: outputVerses.length,
        verses: outputVerses,
      });

      totalVerses += outputVerses.length;

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 80));
    }

    books.push({ slug, name: book.name, chapters: outputChapters });
    totalChapters += outputChapters.length;
    console.log(`✓ ${outputChapters.length} caps`);
  }

  const output = {
    version: TRANSLATION,
    source: 'https://bolls.life',
    generatedAt: new Date().toISOString(),
    stats: { books: books.length, chapters: totalChapters, verses: totalVerses },
    books,
  };

  const outPath = path.join(__dirname, '..', '..', '..', 'Scrapping', 'exports', 'NVI_bolls.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ GENERACIÓN COMPLETA');
  console.log(`📚 Libros:     ${books.length}`);
  console.log(`📖 Capítulos:  ${totalChapters}`);
  console.log(`📝 Versículos: ${totalVerses}`);
  if (errors) console.log(`⚠️  Errores:    ${errors}`);
  console.log(`💾 Guardado en: ${outPath}`);
  console.log('='.repeat(60));
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
