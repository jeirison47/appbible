import { PrismaClient } from '@prisma/client';
import { startOfDay, differenceInDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Sistema de Rachas (Streaks) inspirado en Duolingo
 *
 * Mecánica:
 * - Racha = días consecutivos ganando la cantidad mínima de XP configurada
 * - El admin puede configurar cuánto XP se necesita (por defecto 100 XP)
 * - Se mantiene si cumples el objetivo hoy o ayer (gracia de 1 día)
 * - Se pierde si pasaron más de 1 día sin cumplir el objetivo
 * - Récord personal se guarda siempre
 */

export class StreakService {
  /**
   * Actualiza la racha del usuario después de ganar XP
   */
  static async updateStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    streakExtended: boolean;
    streakStarted: boolean;
    xpToday: number;
    xpRequired: number;
    goalMet: boolean;
  }> {
    // Obtener la cantidad de XP necesaria para mantener la racha desde la configuración
    const streakXpConfig = await prisma.appConfig.findUnique({
      where: { key: 'streak_xp_required' },
    });
    const xpRequired = parseInt(streakXpConfig?.value || '100');

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

    // Obtener el XP ganado hoy
    const todayProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const xpToday = todayProgress?.xpEarned || 0;
    const goalMet = xpToday >= xpRequired;

    let newCurrentStreak = user.currentStreak;
    let streakExtended = false;
    let streakStarted = false;

    // Solo actualizar la racha si se cumplió el objetivo de XP
    if (goalMet) {
      if (!lastRead) {
        // Primera vez cumpliendo el objetivo
        newCurrentStreak = 1;
        streakStarted = true;
      } else {
        const daysSinceLastRead = differenceInDays(today, lastRead);

        if (daysSinceLastRead === 0) {
          // Ya cumplió el objetivo hoy, no hacer nada
          newCurrentStreak = user.currentStreak;
        } else if (daysSinceLastRead === 1) {
          // Cumplió ayer, extender la racha
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
        xpToday,
        xpRequired,
        goalMet,
      };
    }

    // Si no se cumplió el objetivo, retornar el estado actual
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      streakExtended: false,
      streakStarted: false,
      xpToday,
      xpRequired,
      goalMet: false,
    };
  }

  /**
   * Verifica si la racha del usuario está en riesgo y el progreso de XP del día
   */
  static async checkStreakStatus(userId: string): Promise<{
    hasStreak: boolean;
    currentStreak: number;
    isAtRisk: boolean;
    goalMetToday: boolean;
    daysUntilLost: number;
    xpToday: number;
    xpRequired: number;
    xpProgress: number;
  }> {
    // Obtener la cantidad de XP necesaria para mantener la racha
    const streakXpConfig = await prisma.appConfig.findUnique({
      where: { key: 'streak_xp_required' },
    });
    const xpRequired = parseInt(streakXpConfig?.value || '100');

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

    // Obtener el XP ganado hoy
    const todayProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const xpToday = todayProgress?.xpEarned || 0;
    const goalMetToday = xpToday >= xpRequired;
    const xpProgress = Math.min((xpToday / xpRequired) * 100, 100);

    if (!lastRead) {
      return {
        hasStreak: false,
        currentStreak: 0,
        isAtRisk: false,
        goalMetToday,
        daysUntilLost: 0,
        xpToday,
        xpRequired,
        xpProgress,
      };
    }

    const daysSinceLastRead = differenceInDays(today, lastRead);
    const hasStreak = user.currentStreak > 0;
    const isAtRisk = daysSinceLastRead === 0 ? false : daysSinceLastRead === 1 ? false : true;
    const daysUntilLost = goalMetToday ? 2 : daysSinceLastRead === 1 ? 1 : 0;

    return {
      hasStreak,
      currentStreak: user.currentStreak,
      isAtRisk,
      goalMetToday,
      daysUntilLost,
      xpToday,
      xpRequired,
      xpProgress,
    };
  }

  /**
   * Obtiene el historial de rachas del usuario (últimos 30 días)
   */
  static async getStreakHistory(userId: string): Promise<{
    date: Date;
    hasActivity: boolean;
    xpEarned: number;
  }[]> {
    // Obtener la cantidad de XP necesaria para mantener la racha
    const streakXpConfig = await prisma.appConfig.findUnique({
      where: { key: 'streak_xp_required' },
    });
    const xpRequired = parseInt(streakXpConfig?.value || '100');

    const thirtyDaysAgo = subDays(new Date(), 30);

    // Obtener todos los días con actividad en los últimos 30 días
    const dailyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        date: true,
        xpEarned: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Crear array de 30 días
    const history: { date: Date; hasActivity: boolean; xpEarned: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const activity = dailyProgress.find(
        (dp) => startOfDay(dp.date).getTime() === date.getTime()
      );

      const xpEarned = activity?.xpEarned || 0;
      history.push({
        date,
        hasActivity: xpEarned >= xpRequired,
        xpEarned,
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
