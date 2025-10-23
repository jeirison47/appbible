import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sistema de XP y Niveles inspirado en Duolingo
 *
 * Mecánica:
 * - Leer un capítulo completo: 10 XP base
 * - Bonus por racha: +5 XP si tienes racha activa
 * - Bonus por velocidad: +3 XP si lees en menos de 5 minutos
 * - Nivel = sqrt(totalXP / 100) redondeado hacia abajo
 * - Cada nivel requiere más XP (curva exponencial)
 */

interface AwardXpParams {
  userId: string;
  amount: number;
  reason: string;
  metadata?: Record<string, any>;
}

interface XpCalculationResult {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  bonuses: string[];
}

export class XpService {
  /**
   * Calcula el nivel basado en el XP total
   * Fórmula: nivel = floor(sqrt(totalXP / 100))
   * Ejemplos:
   * - 0 XP = Nivel 0
   * - 100 XP = Nivel 1
   * - 400 XP = Nivel 2
   * - 900 XP = Nivel 3
   * - 1600 XP = Nivel 4
   */
  static calculateLevel(totalXp: number): number {
    return Math.floor(Math.sqrt(totalXp / 100));
  }

  /**
   * Calcula cuánto XP se necesita para el siguiente nivel
   */
  static getXpForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return (nextLevel * nextLevel) * 100;
  }

  /**
   * Calcula cuánto XP falta para el siguiente nivel
   */
  static getXpToNextLevel(totalXp: number): { current: number; required: number; remaining: number } {
    const currentLevel = this.calculateLevel(totalXp);
    const xpForCurrentLevel = (currentLevel * currentLevel) * 100;
    const xpForNextLevel = this.getXpForNextLevel(currentLevel);
    const xpInCurrentLevel = totalXp - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const xpRemaining = xpNeededForNextLevel - xpInCurrentLevel;

    return {
      current: xpInCurrentLevel,
      required: xpNeededForNextLevel,
      remaining: xpRemaining,
    };
  }

  /**
   * Calcula XP por leer un capítulo
   */
  static async calculateChapterXp(
    userId: string,
    chapterId: string,
    readingTimeSeconds: number
  ): Promise<XpCalculationResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    let baseXp = 10;
    let bonusXp = 0;
    const bonuses: string[] = [];

    // Bonus por racha activa
    if (user.currentStreak > 0) {
      bonusXp += 5;
      bonuses.push(`+5 XP por racha de ${user.currentStreak} días`);
    }

    // Bonus por lectura rápida (menos de 5 minutos)
    if (readingTimeSeconds < 300) {
      bonusXp += 3;
      bonuses.push('+3 XP por lectura rápida');
    }

    // Bonus por racha larga (7+ días)
    if (user.currentStreak >= 7) {
      bonusXp += 5;
      bonuses.push('+5 XP por racha de 7+ días');
    }

    return {
      baseXp,
      bonusXp,
      totalXp: baseXp + bonusXp,
      bonuses,
    };
  }

  /**
   * Otorga XP a un usuario y actualiza su nivel
   */
  static async awardXp({ userId, amount, reason, metadata = {} }: AwardXpParams) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true, currentLevel: true },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const newTotalXp = user.totalXp + amount;
    const newLevel = this.calculateLevel(newTotalXp);
    const leveledUp = newLevel > user.currentLevel;

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
      },
      select: {
        id: true,
        displayName: true,
        totalXp: true,
        currentLevel: true,
        currentStreak: true,
      },
    });

    // Calcular progreso al siguiente nivel
    const nextLevelProgress = this.getXpToNextLevel(newTotalXp);

    return {
      user: updatedUser,
      xpAwarded: amount,
      leveledUp,
      previousLevel: user.currentLevel,
      currentLevel: newLevel,
      nextLevelProgress,
      reason,
      metadata,
    };
  }

  /**
   * Obtiene estadísticas de XP de un usuario
   */
  static async getUserXpStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        currentLevel: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const nextLevelProgress = this.getXpToNextLevel(user.totalXp);
    const xpForNextLevel = this.getXpForNextLevel(user.currentLevel);

    return {
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      xpForNextLevel,
      progress: {
        current: nextLevelProgress.current,
        required: nextLevelProgress.required,
        remaining: nextLevelProgress.remaining,
        percentage: Math.floor((nextLevelProgress.current / nextLevelProgress.required) * 100),
      },
    };
  }
}
