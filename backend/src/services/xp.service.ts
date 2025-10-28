import { PrismaClient } from '@prisma/client';
import { ConfigService } from './config.service';

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
   * Fórmula: nivel = floor(sqrt(totalXP / divisor))
   * Ejemplos (con divisor = 100):
   * - 0 XP = Nivel 0
   * - 100 XP = Nivel 1
   * - 400 XP = Nivel 2
   * - 900 XP = Nivel 3
   * - 1600 XP = Nivel 4
   */
  static async calculateLevel(totalXp: number): Promise<number> {
    const divisorStr = await ConfigService.getConfigByKey('level_formula_divisor');
    const divisor = divisorStr ? parseInt(divisorStr) : 100;
    return Math.floor(Math.sqrt(totalXp / divisor));
  }

  /**
   * Calcula cuánto XP se necesita para el siguiente nivel
   */
  static async getXpForNextLevel(currentLevel: number): Promise<number> {
    const divisorStr = await ConfigService.getConfigByKey('level_formula_divisor');
    const divisor = divisorStr ? parseInt(divisorStr) : 100;
    const nextLevel = currentLevel + 1;
    return (nextLevel * nextLevel) * divisor;
  }

  /**
   * Calcula cuánto XP falta para el siguiente nivel
   */
  static async getXpToNextLevel(totalXp: number): Promise<{ current: number; required: number; remaining: number }> {
    const divisorStr = await ConfigService.getConfigByKey('level_formula_divisor');
    const divisor = divisorStr ? parseInt(divisorStr) : 100;

    const currentLevel = await this.calculateLevel(totalXp);
    const xpForCurrentLevel = (currentLevel * currentLevel) * divisor;
    const xpForNextLevel = await this.getXpForNextLevel(currentLevel);
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

    // Obtener configuraciones
    const baseXpStr = await ConfigService.getConfigByKey('base_xp_per_chapter');
    const streakBonusStr = await ConfigService.getConfigByKey('streak_active_bonus_xp');
    const speedBonusStr = await ConfigService.getConfigByKey('speed_reading_bonus_xp');
    const speedThresholdStr = await ConfigService.getConfigByKey('speed_reading_threshold_seconds');
    const longStreakBonusStr = await ConfigService.getConfigByKey('long_streak_bonus_xp');
    const longStreakThresholdStr = await ConfigService.getConfigByKey('long_streak_threshold_days');

    // Valores por defecto si no existen las configuraciones
    const baseXp = baseXpStr ? parseInt(baseXpStr) : 10;
    const streakBonus = streakBonusStr ? parseInt(streakBonusStr) : 5;
    const speedBonus = speedBonusStr ? parseInt(speedBonusStr) : 3;
    const speedThreshold = speedThresholdStr ? parseInt(speedThresholdStr) : 300;
    const longStreakBonus = longStreakBonusStr ? parseInt(longStreakBonusStr) : 5;
    const longStreakThreshold = longStreakThresholdStr ? parseInt(longStreakThresholdStr) : 7;

    let bonusXp = 0;
    const bonuses: string[] = [];

    // Bonus por racha activa
    if (user.currentStreak > 0) {
      bonusXp += streakBonus;
      bonuses.push(`+${streakBonus} XP por racha de ${user.currentStreak} días`);
    }

    // Bonus por lectura rápida (menos de umbral configurado)
    if (readingTimeSeconds < speedThreshold) {
      bonusXp += speedBonus;
      bonuses.push(`+${speedBonus} XP por lectura rápida`);
    }

    // Bonus por racha larga (umbral configurado o más días)
    if (user.currentStreak >= longStreakThreshold) {
      bonusXp += longStreakBonus;
      bonuses.push(`+${longStreakBonus} XP por racha de ${longStreakThreshold}+ días`);
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
    const newLevel = await this.calculateLevel(newTotalXp);
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
    const nextLevelProgress = await this.getXpToNextLevel(newTotalXp);

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

    const nextLevelProgress = await this.getXpToNextLevel(user.totalXp);
    const xpForNextLevel = await this.getXpForNextLevel(user.currentLevel);

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
