import { useEffect, useState } from 'react';
import { configApi } from '../services/api';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';

interface AppConfig {
  app_name: string;
  app_short_name: string;
  app_description: string;
  theme_color: string;
  background_color: string;
  default_bible_version: string;
  default_daily_goal: string;
  streak_xp_required: string;
  xp_per_chapter: string;
  xp_per_minute_free_reading: string;
  bonus_streak_multiplier: string;
}

export default function AppConfigPage() {
  const [config, setConfig] = useState<AppConfig>({
    app_name: '',
    app_short_name: '',
    app_description: '',
    theme_color: '#4F46E5',
    background_color: '#ffffff',
    default_bible_version: 'RV1960',
    default_daily_goal: '1',
    streak_xp_required: '100',
    xp_per_chapter: '100',
    xp_per_minute_free_reading: '10',
    bonus_streak_multiplier: '1.5',
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
        type: key.includes('xp_') || key.includes('multiplier') || key.includes('goal') || key.includes('required') ? 'number' : 'string',
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

      <div className="max-w-5xl mx-auto px-4 py-8">
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
            <span>🎨</span>
            Identidad de Marca
          </h3>

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

        {/* Colors Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🎨</span>
            Colores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Color Principal (Theme)
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={config.theme_color}
                  onChange={(e) => handleChange('theme_color', e.target.value)}
                  className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={config.theme_color}
                  onChange={(e) => handleChange('theme_color', e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  placeholder="#4F46E5"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Color principal de la app (usado en PWA y UI)
              </p>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Color de Fondo
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={config.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={config.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  placeholder="#ffffff"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Color de fondo del PWA y splash screen
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* XP per Chapter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                XP por Capítulo
              </label>
              <input
                type="number"
                value={config.xp_per_chapter}
                onChange={(e) => handleChange('xp_per_chapter', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                XP base por completar un capítulo
              </p>
            </div>

            {/* XP per Minute Free Reading */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                XP por Minuto (Lectura Libre)
              </label>
              <input
                type="number"
                value={config.xp_per_minute_free_reading}
                onChange={(e) => handleChange('xp_per_minute_free_reading', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold"
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1 text-center">
                XP por cada 10 minutos de lectura libre
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
