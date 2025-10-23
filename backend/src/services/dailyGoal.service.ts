import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Sistema de Metas Diarias inspirado en Duolingo
 *
 * Mecánica:
 * - Meta por defecto: 1 capítulo por día
 * - El usuario puede personalizar su meta (1, 3, 5, 10 capítulos)
 * - Se resetea cada día a las 00:00
 * - Progreso se muestra como porcentaje y fracción (ej: 2/3 capítulos)
 */

export interface DailyGoalStats {
  goal: number;
  progress: number;
  completed: boolean;
  percentage: number;
  chaptersRemaining: number;
  xpEarned: number;
  minutesRead: number;
}

export class DailyGoalService {
  /**
   * Obtiene o crea el progreso diario del usuario para hoy
   */
  static async getTodayProgress(userId: string): Promise<DailyGoalStats> {
    const today = startOfDay(new Date());

    // Obtener usuario y sus settings para determinar la meta
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user || !user.settings) {
      throw new Error('Usuario no encontrado');
    }

    // Usar la meta configurada por el usuario
    const goal = user.settings.dailyGoal;

    // Buscar o crear progreso diario
    let dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!dailyProgress) {
      dailyProgress = await prisma.dailyProgress.create({
        data: {
          userId,
          date: today,
          chaptersRead: 0,
          xpEarned: 0,
          timeReading: 0,
        },
      });
    }

    const actualProgress = dailyProgress.chaptersRead;
    const completed = actualProgress >= goal;
    // Limitar el progreso mostrado al máximo de la meta
    const progress = Math.min(actualProgress, goal);
    const percentage = Math.min(Math.floor((actualProgress / goal) * 100), 100);
    const chaptersRemaining = Math.max(0, goal - actualProgress);

    return {
      goal,
      progress,
      completed,
      percentage,
      chaptersRemaining,
      xpEarned: dailyProgress.xpEarned,
      minutesRead: dailyProgress.timeReading,
    };
  }

  /**
   * Actualiza el progreso diario después de completar un capítulo
   */
  static async updateProgress(
    userId: string,
    xpEarned: number,
    minutesRead: number
  ): Promise<DailyGoalStats> {
    const today = startOfDay(new Date());

    // Obtener usuario y sus settings para determinar la meta
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user || !user.settings) {
      throw new Error('Usuario no encontrado');
    }

    // Usar la meta configurada por el usuario
    const goal = user.settings.dailyGoal;

    // Buscar o crear progreso diario
    let dailyProgress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!dailyProgress) {
      dailyProgress = await prisma.dailyProgress.create({
        data: {
          userId,
          date: today,
          chaptersRead: 1,
          xpEarned,
          timeReading: minutesRead,
        },
      });
    } else {
      dailyProgress = await prisma.dailyProgress.update({
        where: { id: dailyProgress.id },
        data: {
          chaptersRead: { increment: 1 },
          xpEarned: { increment: xpEarned },
          timeReading: { increment: minutesRead },
        },
      });
    }

    const actualProgress = dailyProgress.chaptersRead;
    const completed = actualProgress >= goal;
    // Limitar el progreso mostrado al máximo de la meta
    const progress = Math.min(actualProgress, goal);
    const percentage = Math.min(Math.floor((actualProgress / goal) * 100), 100);
    const chaptersRemaining = Math.max(0, goal - actualProgress);

    return {
      goal,
      progress,
      completed,
      percentage,
      chaptersRemaining,
      xpEarned: dailyProgress.xpEarned,
      minutesRead: dailyProgress.timeReading,
    };
  }

  /**
   * Actualiza la meta diaria del usuario
   */
  static async updateDailyGoal(userId: string, newGoal: number): Promise<void> {
    // Validar que la meta sea razonable (1-10 capítulos)
    if (newGoal < 1 || newGoal > 10) {
      throw new Error('La meta debe estar entre 1 y 10 capítulos');
    }

    // Actualizar la meta en UserSettings
    await prisma.userSettings.update({
      where: { userId },
      data: { dailyGoal: newGoal },
    });
  }

  /**
   * Obtiene historial de progreso diario (últimos 7 días)
   */
  static async getWeeklyHistory(userId: string): Promise<{
    date: Date;
    progress: number;
    completed: boolean;
    xpEarned: number;
  }[]> {
    const today = startOfDay(new Date());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        date: true,
        chaptersRead: true,
        xpEarned: true,
        systemGoalCompleted: true,
        personalGoalCompleted: true,
      },
    });

    return history.map((day) => ({
      date: day.date,
      progress: day.chaptersRead,
      completed: day.systemGoalCompleted || day.personalGoalCompleted,
      xpEarned: day.xpEarned,
    }));
  }

  /**
   * Obtiene estadísticas generales de metas diarias
   */
  static async getGoalStats(userId: string): Promise<{
    currentGoal: number;
    today: DailyGoalStats;
    weeklyHistory: any[];
    totalDaysCompleted: number;
    currentWeekStreak: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyGoal: true },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const today = await this.getTodayProgress(userId);
    const weeklyHistory = await this.getWeeklyHistory(userId);

    // Contar días totales completados (días donde se completó alguna meta)
    const totalDaysCompleted = await prisma.dailyProgress.count({
      where: {
        userId,
        OR: [
          { systemGoalCompleted: true },
          { personalGoalCompleted: true },
        ],
      },
    });

    // Calcular racha semanal
    let currentWeekStreak = 0;
    for (const day of weeklyHistory) {
      if (day.completed) {
        currentWeekStreak++;
      } else {
        break;
      }
    }

    return {
      currentGoal: user.dailyGoal,
      today,
      weeklyHistory,
      totalDaysCompleted,
      currentWeekStreak,
    };
  }
}
