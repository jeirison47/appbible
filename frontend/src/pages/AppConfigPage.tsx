import { useEffect, useState } from 'react';
import { configApi } from '../services/api';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';

interface AppConfig {
  app_name: string;
  app_short_name: string;
  app_description: string;
  default_bible_version: string;
  default_daily_goal: string;
  streak_xp_required: string;
  xp_per_minute_reading: string;
  bonus_streak_multiplier: string;
  streak_goal_xp_per_day: string;
  // Nuevos parámetros de prioridad alta
  base_xp_per_chapter: string;
  streak_active_bonus_xp: string;
  speed_reading_bonus_xp: string;
  speed_reading_threshold_seconds: string;
  long_streak_bonus_xp: string;
  long_streak_threshold_days: string;
  level_formula_divisor: string;
}

export default function AppConfigPage() {
  const [config, setConfig] = useState<AppConfig>({
    app_name: '',
    app_short_name: '',
    app_description: '',
    default_bible_version: 'RV1960',
    default_daily_goal: '1',
    streak_xp_required: '100',
    xp_per_minute_reading: '10',
    bonus_streak_multiplier: '1.5',
    streak_goal_xp_per_day: '50',
    // Nuevos parámetros de prioridad alta
    base_xp_per_chapter: '10',
    streak_active_bonus_xp: '5',
    speed_reading_bonus_xp: '3',
    speed_reading_threshold_seconds: '300',
    long_streak_bonus_xp: '5',
    long_streak_threshold_days: '7',
    level_formula_divisor: '100',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await configApi.getAllConfig();
      if (response.success && response.data) {
        setConfig(response.data as AppConfig);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Error al cargar configuración');
      setLoading(false);
    }
  };

  const handleChange = (key: keyof AppConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configArray = Object.entries(config).map(([key, value]) => ({
        key,
        value: value.toString(),
        type: key.includes('xp_') ||
              key.includes('multiplier') ||
              key.includes('goal') ||
              key.includes('required') ||
              key.includes('_per_') ||
              key.includes('bonus') ||
              key.includes('threshold') ||
              key.includes('divisor') ? 'number' : 'string',
      }));

      await configApi.updateMultipleConfig(configArray);
      toast.success('Configuración actualizada exitosamente');

      // Recargar la página después de 1 segundo para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-l-4 border-orange-600">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            ⚙️ Configuración de la App
          </h2>
          <p className="text-gray-600 text-lg">
            Personaliza el nombre, eslogan y configuraciones de la aplicación
          </p>
        </div>

        {/* Branding Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📱</span>
            Identidad de la App
          </h3>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-yellow-800 mb-1">Nota Importante</p>
                <p className="text-xs text-yellow-700">
                  Estos valores se guardan en la base de datos pero requieren un nuevo build para aplicarse en la PWA.
                  Modifica también manualmente en <code className="bg-yellow-100 px-1 rounded">frontend/vite.config.ts</code> para cambios inmediatos.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* App Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de la App
              </label>
              <input
                type="text"
                value={config.app_name}
                onChange={(e) => handleChange('app_name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold"
                placeholder="Ej: Manah"
              />
              <p className="text-sm text-gray-500 mt-1">
                Nombre completo de la aplicación (se muestra en el título y PWA)
              </p>
            </div>

            {/* Short Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre Corto
              </label>
              <input
                type="text"
                value={config.app_short_name}
                onChange={(e) => handleChange('app_short_name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ej: Manah"
                maxLength={12}
              />
              <p className="text-sm text-gray-500 mt-1">
                Nombre corto para el icono de la app (máx. 12 caracteres)
              </p>
            </div>

            {/* Description / Slogan */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descripción / Eslogan
              </label>
              <textarea
                value={config.app_description}
                onChange={(e) => handleChange('app_description', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Ej: Descubre la Biblia de forma interactiva con gamificación"
              />
              <p className="text-sm text-gray-500 mt-1">
                Descripción que aparece en el PWA y meta tags
              </p>
            </div>
          </div>
        </div>

        {/* XP & Gamification Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🎮</span>
            Gamificación y XP
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Default Daily Goal */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Meta Diaria por Defecto
              </label>
              <input
                type="number"
                value={config.default_daily_goal}
                onChange={(e) => handleChange('default_daily_goal', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold"
                min="1"
                max="10"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                Capítulos por día para nuevos usuarios
              </p>
            </div>

            {/* Streak XP Required */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                XP Requerido para Racha
              </label>
              <input
                type="number"
                value={config.streak_xp_required}
                onChange={(e) => handleChange('streak_xp_required', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold"
                min="10"
                step="10"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                XP mínimo diario para mantener racha
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* XP per Minute Reading */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                XP por Minuto de Lectura
              </label>
              <input
                type="number"
                value={config.xp_per_minute_reading}
                onChange={(e) => handleChange('xp_per_minute_reading', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                XP por cada minuto de lectura
              </p>
            </div>

            {/* Streak Multiplier */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Multiplicador de Racha
              </label>
              <input
                type="number"
                step="0.1"
                value={config.bonus_streak_multiplier}
                onChange={(e) => handleChange('bonus_streak_multiplier', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold"
                min="1"
                max="5"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                Bonus XP por mantener racha (1.5 = +50%)
              </p>
            </div>
          </div>

          {/* Streak Goal XP Per Day */}
          <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className="text-lg font-bold text-gray-800">XP por Día de Meta de Racha</h4>
                <p className="text-sm text-gray-600">
                  Recompensa por cada día de meta de racha completada
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={config.streak_goal_xp_per_day}
                onChange={(e) => handleChange('streak_goal_xp_per_day', e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-3xl font-bold bg-white"
                min="1"
                step="5"
              />
              <span className="text-xl font-bold text-gray-600">XP/día</span>
            </div>
            <p className="text-sm text-gray-600 mt-3 bg-white rounded-lg p-3 border border-orange-200">
              <strong>Ejemplo:</strong> Si el usuario establece una meta de 10 días y este valor es 50,
              ganará <strong>500 XP</strong> (10 × 50) al completar la meta.
            </p>
          </div>

          {/* Advanced XP Configuration */}
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⚡</span>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Configuración Avanzada de XP</h4>
                <p className="text-sm text-gray-600">
                  Parámetros detallados del sistema de experiencia y bonificaciones
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Base XP per Chapter */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  XP Base por Capítulo
                </label>
                <input
                  type="number"
                  value={config.base_xp_per_chapter}
                  onChange={(e) => handleChange('base_xp_per_chapter', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  XP fundamental otorgado al completar cualquier capítulo (sin bonos)
                </p>
              </div>

              {/* Streak Active Bonus */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bonus XP por Racha Activa
                </label>
                <input
                  type="number"
                  value={config.streak_active_bonus_xp}
                  onChange={(e) => handleChange('streak_active_bonus_xp', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  XP adicional cuando el usuario tiene una racha activa (currentStreak &gt; 0)
                </p>
              </div>

              {/* Speed Reading Bonus */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bonus XP por Lectura Rápida
                </label>
                <input
                  type="number"
                  value={config.speed_reading_bonus_xp}
                  onChange={(e) => handleChange('speed_reading_bonus_xp', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  XP adicional por leer rápido (menos del umbral de segundos)
                </p>
              </div>

              {/* Speed Reading Threshold */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Umbral de Lectura Rápida (segundos)
                </label>
                <input
                  type="number"
                  value={config.speed_reading_threshold_seconds}
                  onChange={(e) => handleChange('speed_reading_threshold_seconds', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="60"
                  step="30"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tiempo máximo para obtener bonus de lectura rápida (300 seg = 5 min)
                </p>
              </div>

              {/* Long Streak Bonus */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bonus XP por Racha Larga
                </label>
                <input
                  type="number"
                  value={config.long_streak_bonus_xp}
                  onChange={(e) => handleChange('long_streak_bonus_xp', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  XP adicional cuando la racha supera el umbral de días largos
                </p>
              </div>

              {/* Long Streak Threshold */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Umbral de Racha Larga (días)
                </label>
                <input
                  type="number"
                  value={config.long_streak_threshold_days}
                  onChange={(e) => handleChange('long_streak_threshold_days', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Días mínimos de racha para obtener bonus de racha larga (ej: 7 días)
                </p>
              </div>

              {/* Level Formula Divisor */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Divisor de Fórmula de Nivel
                </label>
                <input
                  type="number"
                  value={config.level_formula_divisor}
                  onChange={(e) => handleChange('level_formula_divisor', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  min="10"
                  step="10"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Fórmula:</strong> nivel = floor(sqrt(totalXP / divisor)).
                  <strong> Ejemplos con divisor = 100:</strong> 0 XP = nivel 0, 100 XP = nivel 1, 400 XP = nivel 2, 900 XP = nivel 3.
                  <strong> Aumentar el divisor hace que los niveles sean más difíciles de alcanzar.</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-yellow-800 mb-1">Advertencia</p>
                  <p className="text-xs text-yellow-700">
                    Cambiar estos valores afecta directamente el balance del juego.
                    Se recomienda probar en un ambiente de desarrollo antes de aplicar en producción.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bible Version */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>📖</span>
            Configuración de la Biblia
          </h3>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Versión de la Biblia por Defecto
            </label>
            <select
              value={config.default_bible_version}
              onChange={(e) => handleChange('default_bible_version', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
            >
              <option value="RV1960">Reina Valera 1960 (Español)</option>
              <option value="KJV">King James Version (Inglés)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Versión de la Biblia que se muestra por defecto
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white text-lg font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </span>
            ) : (
              '💾 Guardar Configuración'
            )}
          </button>
          <p className="text-sm text-gray-500 text-center mt-3">
            Los cambios se aplicarán inmediatamente en toda la aplicación
          </p>
        </div>
      </div>
    </div>
  );
}
