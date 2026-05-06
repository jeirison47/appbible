import { Context } from 'hono';
import prisma from '../config/database';

const VALID_VERSIONS = ['RVR1960', 'NVI', 'NTV', 'TLA', 'KJV', 'NIV', 'NLT', 'ESV'];
const VERSION_ALIASES: Record<string, string> = { 'RV1960': 'RVR1960' };
const resolveVersion = (v: string) => VERSION_ALIASES[v.toUpperCase()] ?? v.toUpperCase();

export class ReadingController {
  static async getBooks(c: Context) {
    try {
      const books = await prisma.book.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true,
          testament: true,
          category: true,
          name: true,
          slug: true,
          order: true,
          totalChapters: true,
          isAvailableInPath: true,
        },
      });
      return c.json({ books });
    } catch (error) {
      console.error('Get books error:', error);
      return c.json({ error: 'Failed to get books' }, 500);
    }
  }

  static async getBooksWithCompletion(c: Context) {
    try {
      const userId = c.get('userId');

      const books = await prisma.book.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true,
          testament: true,
          category: true,
          name: true,
          slug: true,
          order: true,
          totalChapters: true,
          isAvailableInPath: true,
        },
      });

      const completedChapters = await prisma.chapterRead.findMany({
        where: { userId },
        select: {
          chapter: { select: { bookId: true } },
        },
      });

      const completedCountByBook = completedChapters.reduce((acc, read) => {
        const bookId = read.chapter.bookId;
        acc[bookId] = (acc[bookId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const booksWithCompletion = books.map((book) => ({
        ...book,
        completed: (completedCountByBook[book.id] || 0) === book.totalChapters,
      }));

      return c.json({ books: booksWithCompletion });
    } catch (error) {
      console.error('Get books with completion error:', error);
      return c.json({ error: 'Failed to get books with completion' }, 500);
    }
  }

  static async getChapter(c: Context) {
    try {
      const bookSlug = c.req.param('bookSlug');
      const chapterNumber = c.req.param('chapterNumber');
      const version = resolveVersion(c.req.query('version') || 'RVR1960');
      const userId = c.get('userId');

      if (!VALID_VERSIONS.includes(version)) {
        return c.json({ error: `Invalid Bible version. Valid: ${VALID_VERSIONS.join(', ')}` }, 400);
      }

      const book = await prisma.book.findUnique({ where: { slug: bookSlug } });
      if (!book) return c.json({ error: 'Book not found' }, 404);

      const chapter = await prisma.chapter.findUnique({
        where: { bookId_number: { bookId: book.id, number: parseInt(chapterNumber) } },
      });
      if (!chapter) return c.json({ error: 'Chapter not found' }, 404);

      const chapterVersion = await (prisma as any).chapterVersion.findUnique({
        where: { chapterId_versionCode: { chapterId: chapter.id, versionCode: version } },
      });
      if (!chapterVersion) return c.json({ error: `Version ${version} not available for this chapter` }, 404);

      const chapterRead = await prisma.chapterRead.findUnique({
        where: { userId_chapterId: { userId, chapterId: chapter.id } },
      });

      let nextChapter = null;
      if (chapter.number < book.totalChapters) {
        const next = await prisma.chapter.findUnique({
          where: { bookId_number: { bookId: book.id, number: chapter.number + 1 } },
          select: { number: true },
        });
        if (next) nextChapter = next;
      }

      return c.json({
        book: {
          id: book.id,
          name: book.name,
          slug: book.slug,
          testament: book.testament,
          category: book.category,
          totalChapters: book.totalChapters,
        },
        chapter: {
          id: chapter.id,
          number: chapter.number,
          content: chapterVersion.content,
          verses: chapterVersion.verses,
          verseCount: chapter.verseCount,
        },
        version,
        isCompleted: !!chapterRead,
        nextChapter,
      });
    } catch (error) {
      console.error('Get chapter error:', error);
      return c.json({ error: 'Failed to get chapter' }, 500);
    }
  }

  static async getBook(c: Context) {
    try {
      const bookSlug = c.req.param('bookSlug');
      const book = await prisma.book.findUnique({
        where: { slug: bookSlug },
        include: {
          chapters: {
            select: { number: true, verseCount: true },
            orderBy: { number: 'asc' },
          },
        },
      });
      if (!book) return c.json({ error: 'Book not found' }, 404);
      return c.json({ book });
    } catch (error) {
      console.error('Get book error:', error);
      return c.json({ error: 'Failed to get book' }, 500);
    }
  }

  static async getBibleVersions(c: Context) {
    try {
      const versions = await (prisma as any).bibleVersion.findMany({
        orderBy: [{ language: 'asc' }, { code: 'asc' }],
      });
      return c.json({ versions });
    } catch (error) {
      console.error('Get bible versions error:', error);
      return c.json({ error: 'Failed to get bible versions' }, 500);
    }
  }

  static async getVerseOfTheDay(c: Context) {
    try {
      const version = resolveVersion(c.req.query('version') || 'RVR1960');

      if (!VALID_VERSIONS.includes(version)) {
        return c.json({ error: `Invalid Bible version. Valid: ${VALID_VERSIONS.join(', ')}` }, 400);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingDailyVerse = await prisma.dailyVerse.findUnique({ where: { date: today } });

      if (existingDailyVerse) {
        const versions = existingDailyVerse.versions as Record<string, string>;
        return c.json({
          verse: {
            text: versions[version] || '',
            reference: {
              book: existingDailyVerse.bookName,
              bookSlug: existingDailyVerse.bookSlug,
              chapter: existingDailyVerse.chapterNumber,
              verse: existingDailyVerse.verseNumber,
              fullReference: `${existingDailyVerse.bookName} ${existingDailyVerse.chapterNumber}:${existingDailyVerse.verseNumber}`,
            },
            version,
            date: today.toISOString().split('T')[0],
          },
        });
      }

      const totalChapters = await prisma.chapter.count();
      const shownVerses = await prisma.dailyVerse.findMany({
        where: { date: { gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } },
        select: { chapterId: true, verseNumber: true },
      });

      let selectedVerseData = null;
      let attempts = 0;

      while (!selectedVerseData && attempts < 50) {
        attempts++;
        const randomChapters = await prisma.chapter.findMany({
          take: 1,
          skip: Math.floor(Math.random() * totalChapters),
          include: { book: { select: { name: true, slug: true } } },
        });
        if (!randomChapters.length) continue;

        const chapter = randomChapters[0];
        const randomVerseNumber = Math.floor(Math.random() * chapter.verseCount) + 1;

        const alreadyShown = shownVerses.some(
          (sv) => sv.chapterId === chapter.id && sv.verseNumber === randomVerseNumber
        );
        if (alreadyShown) continue;

        // Get verse text for all versions
        const cvRows = await (prisma as any).chapterVersion.findMany({
          where: { chapterId: chapter.id },
          select: { versionCode: true, verses: true },
        });

        const versionsMap: Record<string, string> = {};
        for (const cv of cvRows) {
          const versesArr = cv.verses as Array<{ number: number; text: string }>;
          const v = versesArr.find((v) => v.number === randomVerseNumber);
          if (v) versionsMap[cv.versionCode] = v.text;
        }

        if (!versionsMap[version]) continue;

        const dailyVerse = await prisma.dailyVerse.create({
          data: {
            date: today,
            chapterId: chapter.id,
            verseNumber: randomVerseNumber,
            bookName: chapter.book.name,
            bookSlug: chapter.book.slug,
            chapterNumber: chapter.number,
            versions: versionsMap,
          },
        });
        selectedVerseData = { dailyVerse, versionsMap };
      }

      if (!selectedVerseData) return c.json({ error: 'Failed to select a verse' }, 500);

      const { dailyVerse, versionsMap } = selectedVerseData;
      return c.json({
        verse: {
          text: versionsMap[version] || '',
          reference: {
            book: dailyVerse.bookName,
            bookSlug: dailyVerse.bookSlug,
            chapter: dailyVerse.chapterNumber,
            verse: dailyVerse.verseNumber,
            fullReference: `${dailyVerse.bookName} ${dailyVerse.chapterNumber}:${dailyVerse.verseNumber}`,
          },
          version,
          date: today.toISOString().split('T')[0],
        },
      });
    } catch (error) {
      console.error('Get verse of the day error:', error);
      return c.json({ error: 'Failed to get verse of the day' }, 500);
    }
  }

  static async searchVerses(c: Context) {
    try {
      const query = c.req.query('q');
      const version = resolveVersion(c.req.query('version') || 'RVR1960');
      const limit = parseInt(c.req.query('limit') || '50');

      if (!query) return c.json({ error: 'Query parameter is required' }, 400);
      if (!VALID_VERSIONS.includes(version)) {
        return c.json({ error: `Invalid Bible version. Valid: ${VALID_VERSIONS.join(', ')}` }, 400);
      }

      const referenceRegex = /^([a-záéíóúñ\s]+)\s+(\d+)(?::(\d+))?$/i;
      const match = query.match(referenceRegex);

      if (match) {
        const bookName = match[1].trim();
        const chapterNumber = parseInt(match[2]);
        const verseNumber = match[3] ? parseInt(match[3]) : null;

        const book = await prisma.book.findFirst({
          where: { name: { contains: bookName, mode: 'insensitive' } },
        });
        if (!book) return c.json({ success: false, message: 'Libro no encontrado', results: [] });

        const chapter = await prisma.chapter.findUnique({
          where: { bookId_number: { bookId: book.id, number: chapterNumber } },
          include: { book: true },
        });
        if (!chapter) return c.json({ success: false, message: 'Capítulo no encontrado', results: [] });

        const cv = await (prisma as any).chapterVersion.findUnique({
          where: { chapterId_versionCode: { chapterId: chapter.id, versionCode: version } },
        });
        if (!cv) return c.json({ success: false, message: 'Versión no disponible', results: [] });

        const versesArr = cv.verses as Array<{ number: number; text: string }>;

        if (verseNumber) {
          const v = versesArr.find((v) => v.number === verseNumber);
          if (!v) return c.json({ success: false, message: 'Versículo no encontrado', results: [] });
          return c.json({
            success: true,
            type: 'reference',
            results: [{
              book: book.name,
              bookSlug: book.slug,
              chapter: chapterNumber,
              verse: verseNumber,
              text: v.text,
              reference: `${book.name} ${chapterNumber}:${verseNumber}`,
            }],
          });
        }

        return c.json({
          success: true,
          type: 'reference',
          results: versesArr.map((v) => ({
            book: book.name,
            bookSlug: book.slug,
            chapter: chapterNumber,
            verse: v.number,
            text: v.text,
            reference: `${book.name} ${chapterNumber}:${v.number}`,
          })),
        });
      }

      // Keyword search in chapter_versions content
      const matchingCVs = await (prisma as any).chapterVersion.findMany({
        where: {
          versionCode: version,
          content: { contains: query, mode: 'insensitive' },
        },
        include: {
          chapter: { include: { book: { select: { name: true, slug: true } } } },
        },
        take: 20,
      });

      const results: any[] = [];
      for (const cv of matchingCVs) {
        const versesArr = cv.verses as Array<{ number: number; text: string }>;
        const searchLower = query.toLowerCase();
        for (const v of versesArr) {
          if (v.text.toLowerCase().includes(searchLower)) {
            results.push({
              book: cv.chapter.book.name,
              bookSlug: cv.chapter.book.slug,
              chapter: cv.chapter.number,
              verse: v.number,
              text: v.text,
              reference: `${cv.chapter.book.name} ${cv.chapter.number}:${v.number}`,
            });
            if (results.length >= limit) break;
          }
        }
        if (results.length >= limit) break;
      }

      return c.json({ success: true, type: 'keyword', query, results: results.slice(0, limit), total: results.length });
    } catch (error) {
      console.error('Search verses error:', error);
      return c.json({ error: 'Failed to search verses' }, 500);
    }
  }
}
