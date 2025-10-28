import { ConfigService } from '../services/config.service';

/**
 * Inicializa configuraciones por defecto de la aplicación
 */
export async function initializeDefaultConfig() {
  try {
    console.log('📝 Inicializando configuraciones por defecto...');

    // Configuración de XP por día de meta de racha
    await ConfigService.updateConfig(
      'streak_goal_xp_per_day',
      '50',
      'number'
    );

    // === Configuraciones de Sistema de XP (Prioridad Alta) ===

    // XP base por completar un capítulo
    await ConfigService.updateConfig(
      'base_xp_per_chapter',
      '10',
      'number'
    );

    // Bonus XP por tener racha activa
    await ConfigService.updateConfig(
      'streak_active_bonus_xp',
      '5',
      'number'
    );

    // Bonus XP por lectura rápida
    await ConfigService.updateConfig(
      'speed_reading_bonus_xp',
      '3',
      'number'
    );

    // Umbral en segundos para considerar lectura rápida (5 minutos = 300 segundos)
    await ConfigService.updateConfig(
      'speed_reading_threshold_seconds',
      '300',
      'number'
    );

    // Bonus XP por racha larga
    await ConfigService.updateConfig(
      'long_streak_bonus_xp',
      '5',
      'number'
    );

    // Umbral en días para considerar racha larga (7 días)
    await ConfigService.updateConfig(
      'long_streak_threshold_days',
      '7',
      'number'
    );

    // Divisor para fórmula de cálculo de nivel (nivel = sqrt(totalXP / divisor))
    await ConfigService.updateConfig(
      'level_formula_divisor',
      '100',
      'number'
    );

    console.log('✅ Configuraciones inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar configuraciones:', error);
  }
}
