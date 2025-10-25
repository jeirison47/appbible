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

    console.log('✅ Configuraciones inicializadas correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar configuraciones:', error);
  }
}
