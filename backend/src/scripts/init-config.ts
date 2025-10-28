import { ConfigService } from '../services/config.service';

/**
 * Inicializa una configuración solo si no existe
 */
async function initConfigIfNotExists(key: string, value: string, type: 'string' | 'number') {
  try {
    const existing = await ConfigService.getConfigByKey(key);
    if (!existing) {
      await ConfigService.updateConfig(key, value, type);
      console.log(`  ✓ Inicializada: ${key} = ${value}`);
    }
  } catch (error) {
    // Si no existe, la creamos
    await ConfigService.updateConfig(key, value, type);
    console.log(`  ✓ Creada: ${key} = ${value}`);
  }
}

/**
 * Inicializa configuraciones por defecto de la aplicación
 * Solo crea las configuraciones que no existen, preservando personalizaciones
 */
export async function initializeDefaultConfig() {
  try {
    console.log('📝 Verificando configuraciones por defecto...');

    // Configuración de XP por día de meta de racha
    await initConfigIfNotExists('streak_goal_xp_per_day', '50', 'number');

    // === Configuraciones de Sistema de XP (Prioridad Alta) ===

    // XP base por completar un capítulo
    await initConfigIfNotExists('base_xp_per_chapter', '10', 'number');

    // Bonus XP por tener racha activa
    await initConfigIfNotExists('streak_active_bonus_xp', '5', 'number');

    // Bonus XP por lectura rápida
    await initConfigIfNotExists('speed_reading_bonus_xp', '3', 'number');

    // Umbral en segundos para considerar lectura rápida (5 minutos = 300 segundos)
    await initConfigIfNotExists('speed_reading_threshold_seconds', '300', 'number');

    // Bonus XP por racha larga
    await initConfigIfNotExists('long_streak_bonus_xp', '5', 'number');

    // Umbral en días para considerar racha larga (7 días)
    await initConfigIfNotExists('long_streak_threshold_days', '7', 'number');

    // Divisor para fórmula de cálculo de nivel (nivel = sqrt(totalXP / divisor))
    await initConfigIfNotExists('level_formula_divisor', '100', 'number');

    // XP por minuto de lectura
    await initConfigIfNotExists('xp_per_minute_reading', '10', 'number');

    // === Configuraciones de Colores (Modo Claro) ===

    // Color principal modo claro
    await initConfigIfNotExists('color_light_primary', '#4F46E5', 'string'); // Indigo-600

    // Color secundario modo claro
    await initConfigIfNotExists('color_light_secondary', '#9333EA', 'string'); // Purple-600

    // Color de fondo modo claro
    await initConfigIfNotExists('color_light_background', '#ffffff', 'string'); // White

    // Color de énfasis modo claro
    await initConfigIfNotExists('color_light_accent', '#EA580C', 'string'); // Orange-600

    // === Configuraciones de Colores (Modo Oscuro) ===

    // Color principal modo oscuro
    await initConfigIfNotExists('color_dark_primary', '#6366F1', 'string'); // Indigo-500

    // Color secundario modo oscuro
    await initConfigIfNotExists('color_dark_secondary', '#A78BFA', 'string'); // Purple-400

    // Color de fondo modo oscuro
    await initConfigIfNotExists('color_dark_background', '#111827', 'string'); // Gray-900

    // Color de énfasis modo oscuro
    await initConfigIfNotExists('color_dark_accent', '#F97316', 'string'); // Orange-500

    console.log('✅ Configuraciones verificadas correctamente');
  } catch (error) {
    console.error('❌ Error al verificar configuraciones:', error);
  }
}
