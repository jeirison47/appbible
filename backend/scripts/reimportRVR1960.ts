import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '../src/generated/prisma';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient() as any;

const JSON_PATH = path.join(__dirname, '..', '..', '..', 'Scrapping', 'exports', 'RVR1960_github.json');
const VERSION_CODE = 'RVR1960';

interface Verse {
  number: number;
  text: string;
}

interface Chapter {
  number: number;
  verseCount: number;
  verses: Verse[];
}

interface Book {
  slug: string;
  name: string;
  chapters: Chapter[];
}

interface BibleJson {
  version: string;
  books: Book[];
}

async function main() {
  console.log('📖 Reimportando RVR1960 desde JSON...\n');

  const raw = fs.readFileSync(JSON_PATH, 'utf-8');
  const bible: BibleJson = JSON.parse(raw);

  console.log(`✓ JSON cargado: ${bible.books.length} libros\n`);

  // 1. Eliminar todos los chapter_versions de RVR1960
  console.log(`🗑️  Eliminando registros existentes de ${VERSION_CODE}...`);
  const deleted = await prisma.chapterVersion.deleteMany({
    where: { versionCode: VERSION_CODE },
  });
  console.log(`✓ ${deleted.count} registros eliminados\n`);

  // 2. Reinsertar desde el JSON
  let totalChapters = 0;
  let totalVerses = 0;
  let skippedBooks = 0;
  let skippedChapters = 0;

  for (const book of bible.books) {
    const dbBook = await prisma.book.findUnique({ where: { slug: book.slug } });
    if (!dbBook) {
      console.log(`⚠️  Libro no encontrado en DB: ${book.slug}`);
      skippedBooks++;
      continue;
    }

    process.stdout.write(`📘 ${book.name}... `);
    let bookChapters = 0;

    for (const chapter of book.chapters) {
      const dbChapter = await prisma.chapter.findUnique({
        where: { bookId_number: { bookId: dbBook.id, number: chapter.number } },
      });

      if (!dbChapter) {
        skippedChapters++;
        continue;
      }

      const content = chapter.verses.map((v) => `${v.number} ${v.text}`).join(' ');

      await prisma.chapterVersion.create({
        data: {
          chapterId: dbChapter.id,
          versionCode: VERSION_CODE,
          content,
          verses: chapter.verses,
        },
      });

      // Update verseCount on chapter
      await prisma.chapter.update({
        where: { id: dbChapter.id },
        data: { verseCount: chapter.verseCount },
      });

      bookChapters++;
      totalVerses += chapter.verseCount;
    }

    totalChapters += bookChapters;
    console.log(`✓ ${bookChapters} caps`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ REIMPORTACIÓN COMPLETA');
  console.log(`📚 Libros procesados:   ${bible.books.length - skippedBooks}`);
  console.log(`📖 Capítulos insertados: ${totalChapters}`);
  console.log(`📝 Versículos totales:   ${totalVerses}`);
  if (skippedBooks)    console.log(`⚠️  Libros sin match:    ${skippedBooks}`);
  if (skippedChapters) console.log(`⚠️  Caps sin match:      ${skippedChapters}`);
  console.log('='.repeat(60));

  await prisma.$disconnect();
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
