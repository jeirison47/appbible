import { PrismaClient } from '@prisma/client';
import { startOfDay, differenceInDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Sistema de Rachas (Streaks) inspirado en Duolingo
 *
 * Mecánica:
 * - Racha = días consecutivos leyendo al menos 1 capítulo
 * - Se mantiene si lees hoy o ayer (gracia de 1 día)
 * - Se pierde si pasaron más de 1 día sin leer
 * - Récord personal se guarda siempre
 */

export class StreakService {
  /**
   * Actualiza la racha del usuario después de completar una lectura
   */
  static async updateStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    streakExtended: boolean;
    streakStarted: boolean;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastReadAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const now = new Date();
    const today = startOfDay(now);
    const lastRead = user.lastReadAt ? startOfDay(user.lastReadAt) : null;

    let newCurrentStreak = user.currentStreak;
    let streakExtended = false;
    let streakStarted = false;

    if (!lastRead) {
      // Primera lectura del usuario
      newCurrentStreak = 1;
      streakStarted = true;
    } else {
      const daysSinceLastRead = differenceInDays(today, lastRead);

      if (daysSinceLastRead === 0) {
        // Ya leyó hoy, no hacer nada
        newCurrentStreak = user.currentStreak;
      } else if (daysSinceLastRead === 1) {
        // Leyó ayer, extender la racha
        newCurrentStreak = user.currentStreak + 1;
        streakExtended = true;
      } else {
        // Pasaron más de 1 día, se perdió la racha
        newCurrentStreak = 1;
        streakStarted = true;
      }
    }

    // Actualizar récord si es necesario
    const newLongestStreak = Math.max(newCurrentStreak, user.longestStreak);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastReadAt: now,
      },
    });

    return {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      streakExtended,
      streakStarted,
    };
  }

  /**
   * Verifica si la racha del usuario está en riesgo
   */
  static async checkStreakStatus(userId: string): Promise<{
    hasStreak: boolean;
    currentStreak: number;
    isAtRisk: boolean;
    readToday: boolean;
    daysUntilLost: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        lastReadAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const now = new Date();
    const today = startOfDay(now);
    const lastRead = user.lastReadAt ? startOfDay(user.lastReadAt) : null;

    if (!lastRead) {
      return {
        hasStreak: false,
        currentStreak: 0,
        isAtRisk: false,
        readToday: false,
        daysUntilLost: 0,
      };
    }

    const daysSinceLastRead = differenceInDays(today, lastRead);
    const readToday = daysSinceLastRead === 0;
    const hasStreak = user.currentStreak > 0;
    const isAtRisk = daysSinceLastRead === 0 ? false : daysSinceLastRead === 1 ? false : true;
    const daysUntilLost = readToday ? 2 : daysSinceLastRead === 1 ? 1 : 0;

    return {
      hasStreak,
      currentStreak: user.currentStreak,
      isAtRisk,
      readToday,
      daysUntilLost,
    };
  }

  /**
   * Obtiene el historial de rachas del usuario (últimos 30 días)
   */
  static async getStreakHistory(userId: string): Promise<{
    date: Date;
    hasActivity: boolean;
  }[]> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Obtener todos los días que el usuario leyó en los últimos 30 días
    const dailyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        date: true,
        chaptersRead: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Crear array de 30 días
    const history: { date: Date; hasActivity: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const activity = dailyProgress.find(
        (dp) => startOfDay(dp.date).getTime() === date.getTime()
      );

      history.push({
        date,
        hasActivity: activity ? activity.chaptersRead > 0 : false,
      });
    }

    return history;
  }

  /**
   * Obtiene estadísticas completas de racha del usuario
   */
  static async getStreakStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastReadAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const status = await this.checkStreakStatus(userId);
    const history = await this.getStreakHistory(userId);

    return {
      current: user.currentStreak,
      longest: user.longestStreak,
      lastReadAt: user.lastReadAt,
      status,
      history,
    };
  }
}
