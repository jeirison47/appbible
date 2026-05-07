import { Context } from 'hono';
import prisma from '../config/database';

type ExerciseType = 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'WHICH_VERSE';

interface Verse {
  number: number;
  text: string;
}

interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options: string[];
  correctIndex: number;
  verseNumber: number;
}

const STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'que', 'los', 'las', 'se', 'del',
  'un', 'una', 'por', 'con', 'para', 'su', 'al', 'es', 'son', 'fue',
  'era', 'le', 'lo', 'me', 'te', 'nos', 'os', 'les', 'más', 'pero',
  'como', 'si', 'no', 'ni', 'o', 'e', 'u', 'hay', 'ser', 'han', 'has',
  'he', 'yo', 'tu', 'este', 'esta', 'ese', 'esa', 'esto', 'cual',
  'todo', 'toda', 'todos', 'todas', 'muy', 'tan', 'también', 'así',
  'the', 'and', 'of', 'to', 'in', 'is', 'it', 'that', 'was', 'for',
  'on', 'are', 'with', 'his', 'they', 'be', 'at', 'this', 'from',
  'have', 'had', 'not', 'but', 'all', 'were', 'will', 'him', 'when',
  'who', 'which', 'their', 'said',
]);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function truncate(text: string, max = 120): string {
  return text.length <= max ? text : text.substring(0, max) + '...';
}

function getMeaningfulWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(w => w.replace(/[.,;:!?¡¿"'()\-]/g, '').trim())
    .filter(w => w.length >= 5 && !STOPWORDS.has(w.toLowerCase()));
}

function buildFillInBlank(verse: Verse, allVerses: Verse[]): Exercise | null {
  const words = getMeaningfulWords(verse.text);
  if (words.length === 0) return null;

  const keyWord = words[Math.floor(Math.random() * words.length)];
  const escaped = keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blankText = verse.text.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '___');

  const otherWords = allVerses
    .filter(v => v.number !== verse.number)
    .flatMap(v => getMeaningfulWords(v.text))
    .filter(w => w.toLowerCase() !== keyWord.toLowerCase());

  const unique = [...new Set(otherWords)];
  if (unique.length < 3) return null;

  const distractors = shuffle(unique).slice(0, 3);
  const options = shuffle([keyWord, ...distractors]);
  const correctIndex = options.findIndex(o => o.toLowerCase() === keyWord.toLowerCase());

  return {
    id: `fill-${verse.number}`,
    type: 'FILL_IN_BLANK',
    question: `Completa el versículo ${verse.number}:\n"${blankText}"`,
    options,
    correctIndex,
    verseNumber: verse.number,
  };
}

function buildWhichVerse(verse: Verse, allVerses: Verse[]): Exercise | null {
  const others = allVerses.filter(v => v.number !== verse.number).map(v => v.number);
  if (others.length < 3) return null;

  const distractors = shuffle(others).slice(0, 3);
  const options = shuffle([verse.number, ...distractors]).map(n => `Versículo ${n}`);
  const correctIndex = options.indexOf(`Versículo ${verse.number}`);

  return {
    id: `which-${verse.number}`,
    type: 'WHICH_VERSE',
    question: `¿A qué versículo pertenece?\n"${truncate(verse.text, 140)}"`,
    options,
    correctIndex,
    verseNumber: verse.number,
  };
}

function buildMultipleChoice(verse: Verse, allVerses: Verse[]): Exercise {
  const others = shuffle(allVerses.filter(v => v.number !== verse.number)).slice(0, 3);
  const correctText = truncate(verse.text);
  const options = shuffle([correctText, ...others.map(v => truncate(v.text))]);
  const correctIndex = options.indexOf(correctText);

  return {
    id: `mc-${verse.number}`,
    type: 'MULTIPLE_CHOICE',
    question: `¿Cuál es el versículo ${verse.number}?`,
    options,
    correctIndex,
    verseNumber: verse.number,
  };
}

function generateExercise(verse: Verse, allVerses: Verse[], idx: number): Exercise {
  const order: ExerciseType[] = [
    'MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'WHICH_VERSE',
    'FILL_IN_BLANK', 'MULTIPLE_CHOICE', 'WHICH_VERSE',
    'FILL_IN_BLANK', 'MULTIPLE_CHOICE',
  ];
  const preferred = order[idx % order.length];

  if (preferred === 'FILL_IN_BLANK') {
    const ex = buildFillInBlank(verse, allVerses);
    if (ex) return ex;
  }
  if (preferred === 'WHICH_VERSE') {
    const ex = buildWhichVerse(verse, allVerses);
    if (ex) return ex;
  }
  return buildMultipleChoice(verse, allVerses);
}

export class StudyController {
  static async getBooks(c: Context) {
    try {
      const userId = c.get('userId');

      const books = await prisma.book.findMany({
        orderBy: { order: 'asc' },
        include: {
          chapters: {
            select: {
              id: true,
              studyProgress: { where: { userId }, select: { id: true } },
            },
          },
        },
      });

      let previousCompleted = true;

      const result = books.map((book) => {
        const total = book.chapters.length;
        const completed = book.chapters.filter(ch => ch.studyProgress.length > 0).length;
        const isFullyCompleted = total > 0 && completed === total;
        const isLocked = !previousCompleted;
        if (!isLocked) previousCompleted = isFullyCompleted;

        return {
          id: book.id,
          name: book.name,
          slug: book.slug,
          testament: book.testament,
          category: book.category,
          order: book.order,
          totalChapters: total,
          completedChapters: completed,
          isLocked,
          isCompleted: isFullyCompleted,
        };
      });

      return c.json(result);
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getBook(c: Context) {
    try {
      const userId = c.get('userId');
      const { bookSlug } = c.req.param();

      const book = await prisma.book.findUnique({
        where: { slug: bookSlug },
        include: {
          chapters: {
            orderBy: { number: 'asc' },
            include: {
              studyProgress: {
                where: { userId },
                select: { score: true, maxScore: true },
              },
            },
          },
        },
      });

      if (!book) return c.json({ error: 'Book not found' }, 404);

      const chapters = book.chapters.map((ch, idx) => {
        const progress = ch.studyProgress[0] ?? null;
        const prevCompleted = idx === 0 || !!book.chapters[idx - 1]?.studyProgress[0];
        return {
          id: ch.id,
          number: ch.number,
          verseCount: ch.verseCount,
          isCompleted: !!progress,
          isLocked: !prevCompleted,
          score: progress?.score ?? null,
          maxScore: progress?.maxScore ?? null,
        };
      });

      return c.json({
        book: {
          id: book.id,
          name: book.name,
          slug: book.slug,
          testament: book.testament,
          category: book.category,
          totalChapters: book.totalChapters,
        },
        chapters,
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getLesson(c: Context) {
    try {
      const { bookSlug, chapterNumber } = c.req.param();
      const version = (c.req.query('version') || 'RVR1960').toUpperCase();

      const book = await prisma.book.findUnique({ where: { slug: bookSlug } });
      if (!book) return c.json({ error: 'Book not found' }, 404);

      const chapter = await prisma.chapter.findFirst({
        where: { bookId: book.id, number: parseInt(chapterNumber) },
        include: { chapterVersions: { where: { versionCode: version } } },
      });

      if (!chapter || !chapter.chapterVersions[0]) {
        return c.json({ error: 'Chapter or version not found' }, 404);
      }

      const verses = chapter.chapterVersions[0].verses as Verse[];
      if (!verses || verses.length < 2) {
        return c.json({ error: 'Not enough verses' }, 404);
      }

      const count = Math.min(8, Math.max(5, Math.floor(verses.length * 0.4)));
      const selected = shuffle([...verses]).slice(0, count);
      const exercises = selected.map((v, i) => generateExercise(v, verses, i));

      return c.json({
        book: { name: book.name, slug: book.slug },
        chapter: { id: chapter.id, number: chapter.number },
        exercises,
        totalExercises: exercises.length,
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async completeLesson(c: Context) {
    try {
      const userId = c.get('userId');
      const { chapterId, score, maxScore } = await c.req.json();

      if (!chapterId || score == null || maxScore == null) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      const pct = maxScore > 0 ? score / maxScore : 0;
      const xpEarned = Math.round(pct * 30) + (score === maxScore ? 10 : 0);

      await prisma.studyProgress.upsert({
        where: { userId_chapterId: { userId, chapterId } },
        create: { userId, chapterId, score, maxScore, xpEarned },
        update: { score, maxScore, xpEarned, completedAt: new Date() },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { totalXp: { increment: xpEarned } },
      });

      return c.json({ success: true, xpEarned });
    } catch (error) {
      console.error(error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}
