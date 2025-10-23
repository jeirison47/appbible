import { PrismaClient } from '@prisma/client';
import { XpService } from './xp.service';
import { StreakService } from './streak.service';
import { DailyGoalService } from './dailyGoal.service';

const prisma = new PrismaClient();

/**
 * Servicio de Progreso de Lectura
 *
 * Integra todos los sistemas de gamificación:
 * - XP y Niveles
 * - Rachas
 * - Metas Diarias
 * - Progreso de libros y capítulos
 */

export interface CompleteChapterResult {
  success: boolean;
  chapter: {
    id: string;
    bookName: string;
    chapterNumber: number;
    chapterTitle: string;
  };
  rewards: {
    xp: {
      baseXp: number;
      bonusXp: number;
      totalXp: number;
      bonuses: string[];
      newLevel: number;
      leveledUp: boolean;
    };
    streak: {
      currentStreak: number;
      longestStreak: number;
      streakExtended: boolean;
      streakStarted: boolean;
    };
    dailyGoal: {
      goal: number;
      progress: number;
      completed: boolean;
      percentage: number;
    };
  };
  nextChapter: {
    id: string;
    number: number;
    title: string;
    unlocked: boolean;
  } | null;
}

export class ProgressService {
  /**
   * Marca un capítulo como completado y otorga recompensas
   */
  static async completeChapter(
    userId: string,
    chapterId: string,
    readingTimeSeconds: number,
    version: 'RV1960' | 'KJV' = 'RV1960',
    readingMode: 'PATH' | 'FREE' = 'FREE'
  ): Promise<CompleteChapterResult> {
    // Obtener información del capítulo
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        book: {
          select: {
            id: true,
            name: true,
            slug: true,
            totalChapters: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new Error('Capítulo no encontrado');
    }

    // Verificar si ya fue leído
    const alreadyRead = await prisma.chapterRead.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    if (alreadyRead) {
      throw new Error('Este capítulo ya fue completado');
    }

    // 1. Calcular y otorgar XP
    const xpCalculation = await XpService.calculateChapterXp(
      userId,
      chapterId,
      readingTimeSeconds
    );

    const xpResult = await XpService.awardXp({
      userId,
      amount: xpCalculation.totalXp,
      reason: `Completar ${chapter.book.name} ${chapter.number}`,
      metadata: {
        chapterId,
        bookSlug: chapter.book.slug,
        chapterNumber: chapter.number,
      },
    });

    // 2. Actualizar racha
    const streakResult = await StreakService.updateStreak(userId);

    // 3. Actualizar meta diaria
    const minutesRead = Math.floor(readingTimeSeconds / 60);
    const dailyGoalResult = await DailyGoalService.updateProgress(
      userId,
      xpCalculation.totalXp,
      minutesRead
    );

    // 4. Marcar capítulo como leído
    await prisma.chapterRead.create({
      data: {
        userId,
        chapterId,
        readAt: new Date(),
        readType: readingMode, // 'PATH' o 'FREE'
        timeSpent: readingTimeSeconds,
        xpEarned: xpCalculation.totalXp,
      },
    });

    // 5. Actualizar progreso del libro
    const bookProgress = await prisma.bookProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: chapter.book.id,
        },
      },
    });

    const chaptersCompleted = (bookProgress?.chaptersCompleted || 0) + 1;
    const isCompleted = chaptersCompleted >= chapter.book.totalChapters;

    await prisma.bookProgress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId: chapter.book.id,
        },
      },
      create: {
        userId,
        bookId: chapter.book.id,
        chaptersCompleted: 1,
        completedAt: isCompleted ? new Date() : null,
        lastChapterRead: chapter.number,
      },
      update: {
        chaptersCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        lastChapterRead: chapter.number,
      },
    });

    // 6. Determinar siguiente capítulo
    const nextChapterNumber = chapter.number + 1;
    let nextChapter = null;

    if (nextChapterNumber <= chapter.book.totalChapters) {
      const nextChapterData = await prisma.chapter.findUnique({
        where: {
          bookId_number: {
            bookId: chapter.book.id,
            number: nextChapterNumber,
          },
        },
      });

      if (nextChapterData) {
        nextChapter = {
          id: nextChapterData.id,
          number: nextChapterData.number,
          title: nextChapterData.title || '',
          unlocked: true, // En el Camino, se desbloquea automáticamente
        };
      }
    }

    return {
      success: true,
      chapter: {
        id: chapter.id,
        bookName: chapter.book.name,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title || '',
      },
      rewards: {
        xp: {
          baseXp: xpCalculation.baseXp,
          bonusXp: xpCalculation.bonusXp,
          totalXp: xpCalculation.totalXp,
          bonuses: xpCalculation.bonuses,
          newLevel: xpResult.currentLevel,
          leveledUp: xpResult.leveledUp,
        },
        streak: streakResult,
        dailyGoal: dailyGoalResult,
      },
      nextChapter,
    };
  }

  /**
   * Obtiene el progreso completo de un usuario
   */
  static async getUserProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        currentLevel: true,
        currentStreak: true,
        longestStreak: true,
        dailyGoal: true,
        settings: {
          select: {
            systemDailyGoal: true,
            personalDailyGoal: true,
          },
        },
      },
    });

    if (!user || !user.settings) {
      throw new Error('Usuario no encontrado');
    }

    // XP Stats
    const xpStats = await XpService.getUserXpStats(userId);

    // Streak Stats
    const streakStats = await StreakService.getStreakStats(userId);

    // Daily Goal Stats
    const dailyGoalStats = await DailyGoalService.getTodayProgress(userId);

    // Book Progress
    const booksProgress = await prisma.bookProgress.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            name: true,
            slug: true,
            totalChapters: true,
            isAvailableInPath: true,
          },
        },
      },
    });

    // Total chapters read
    const totalChaptersRead = await prisma.chapterRead.count({
      where: { userId },
    });

    // Total books in the Bible (constant)
    const totalBooks = 66;

    // Obtener último capítulo leído en modo Camino (libros en path)
    const lastChapterInPath = await prisma.chapterRead.findFirst({
      where: {
        userId,
        readType: 'PATH',
        chapter: {
          book: {
            isAvailableInPath: true,
          },
        },
      },
      orderBy: {
        readAt: 'desc',
      },
      include: {
        chapter: {
          select: {
            id: true,
            number: true,
            title: true,
            book: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Obtener último capítulo leído en cualquier modo (Lectura Libre)
    const lastChapterFree = await prisma.chapterRead.findFirst({
      where: {
        userId,
      },
      orderBy: {
        readAt: 'desc',
      },
      include: {
        chapter: {
          select: {
            id: true,
            number: true,
            title: true,
            book: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return {
      user: {
        totalXp: user.totalXp,
        currentLevel: user.currentLevel,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        dailyGoal: user.dailyGoal, // Mantener por compatibilidad (deprecated)
        systemDailyGoal: user.settings.systemDailyGoal,
        personalDailyGoal: user.settings.personalDailyGoal,
      },
      xp: xpStats,
      streak: streakStats,
      dailyGoal: dailyGoalStats,
      books: booksProgress.map((bp) => ({
        bookName: bp.book.name,
        bookSlug: bp.book.slug,
        chaptersCompleted: bp.chaptersCompleted,
        totalChapters: bp.book.totalChapters,
        isCompleted: !!bp.completedAt,
        lastChapterRead: bp.lastChapterRead,
        completedAt: bp.completedAt,
        progress: Math.floor((bp.chaptersCompleted / bp.book.totalChapters) * 100),
      })),
      stats: {
        totalChaptersRead,
        booksInProgress: booksProgress.filter((bp) => !bp.completedAt).length,
        booksCompleted: booksProgress.filter((bp) => bp.completedAt).length,
        totalBooks,
      },
      lastRead: {
        camino: lastChapterInPath
          ? {
              bookName: lastChapterInPath.chapter.book.name,
              bookSlug: lastChapterInPath.chapter.book.slug,
              chapterNumber: lastChapterInPath.chapter.number,
              chapterTitle: lastChapterInPath.chapter.title,
            }
          : null,
        libre: lastChapterFree
          ? {
              bookName: lastChapterFree.chapter.book.name,
              bookSlug: lastChapterFree.chapter.book.slug,
              chapterNumber: lastChapterFree.chapter.number,
              chapterTitle: lastChapterFree.chapter.title,
            }
          : null,
      },
    };
  }

  /**
   * Obtiene el progreso de un libro específico
   */
  static async getBookProgress(userId: string, bookSlug: string) {
    const book = await prisma.book.findUnique({
      where: { slug: bookSlug },
      include: {
        chapters: {
          orderBy: { number: 'asc' },
          select: {
            id: true,
            number: true,
            title: true,
            verseCount: true,
          },
        },
      },
    });

    if (!book) {
      throw new Error('Libro no encontrado');
    }

    const bookProgress = await prisma.bookProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id,
        },
      },
    });

    const chaptersRead = await prisma.chapterRead.findMany({
      where: {
        userId,
        chapter: {
          bookId: book.id,
        },
      },
      select: {
        chapterId: true,
        readAt: true,
        readType: true,
        timeSpent: true,
      },
    });

    const chaptersWithProgress = book.chapters.map((chapter) => {
      const readInfo = chaptersRead.find((cr) => cr.chapterId === chapter.id);
      return {
        ...chapter,
        isRead: !!readInfo,
        completedAt: readInfo?.readAt,
        version: readInfo?.readType,
        timeSpent: readInfo?.timeSpent,
        isUnlocked: bookProgress
          ? chapter.number <= bookProgress.lastChapterRead + 1
          : chapter.number === 1,
      };
    });

    return {
      book: {
        id: book.id,
        name: book.name,
        slug: book.slug,
        totalChapters: book.totalChapters,
        testament: book.testament,
        category: book.category,
      },
      progress: {
        chaptersCompleted: bookProgress?.chaptersCompleted || 0,
        totalChapters: book.totalChapters,
        isCompleted: !!bookProgress?.completedAt,
        lastChapterRead: bookProgress?.lastChapterRead || 0,
        percentage: bookProgress
          ? Math.floor((bookProgress.chaptersCompleted / book.totalChapters) * 100)
          : 0,
      },
      chapters: chaptersWithProgress,
    };
  }

  /**
   * Obtiene el leaderboard global ordenado por XP
   */
  static async getLeaderboard(currentUserId: string) {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        displayName: true,
        totalXp: true,
        currentStreak: true,
      },
      orderBy: {
        totalXp: 'desc',
      },
      take: 10,
    });

    // Agregar el ranking
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      displayName: user.displayName,
      totalXp: user.totalXp,
      currentStreak: user.currentStreak,
      isCurrentUser: user.id === currentUserId,
    }));

    return leaderboard;
  }
}
