import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { progressApi } from '../services/api';
import Navbar from '../components/Navbar';

interface ProgressData {
  user: {
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    dailyGoal: number;
  };
  xp: {
    currentLevel: number;
    progress: {
      current: number;
      required: number;
      percentage: number;
      remaining: number;
    };
  };
  streak: {
    current: number;
    longest: number;
    lastReadAt: string | null;
    status: {
      hasStreak: boolean;
      currentStreak: number;
      isAtRisk: boolean;
      goalMetToday: boolean;
      daysUntilLost: number;
      xpToday: number;
      xpRequired: number;
      xpProgress: number;
    };
  };
  stats: {
    totalChaptersRead: number;
    booksInProgress: number;
    booksCompleted: number;
  };
  dailyGoal: {
    goal: number;
    progress: number;
    completed: boolean;
    percentage: number;
    chaptersRemaining: number;
    minutesRead: number;
  };
}

export default function StatsPage() {
  const user = useAuthStore((state) => state.user);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  // Timer para el tiempo de lectura de hoy (minutesRead viene en segundos desde el backend)
  useEffect(() => {
    if (progress?.dailyGoal.minutesRead) {
      setSeconds(progress.dailyGoal.minutesRead);
    }
  }, [progress?.dailyGoal.minutesRead]);

  const loadProgress = async () => {
    try {
      const data = await progressApi.getMyProgress();
      setProgress(data.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to load progress:', error);
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const formattedTime = formatTime(seconds);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-32">
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando estadísticas...</p>
          </div>
        </div>
      ) : (
        <>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-indigo-600">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            📊 Tus Estadísticas
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Revisa tu progreso detallado en tu aventura bíblica
          </p>
        </div>

        {/* Gamificación Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Nivel Card */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Nivel Actual</p>
              <span className="text-xl sm:text-2xl">🏆</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-purple-600">
              Nivel {progress?.user.currentLevel || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              {progress?.stats.totalChaptersRead || 0} capítulos leídos
            </p>
          </div>

          {/* Racha Actual */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Racha Actual</p>
              <span className="text-xl sm:text-2xl">🔥</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-orange-600">
              {progress?.user.currentStreak || 0} días
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              Días consecutivos con actividad
            </p>
          </div>

          {/* Racha Récord */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Racha Récord</p>
              <span className="text-xl sm:text-2xl">⭐</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-red-600">
              {progress?.user.longestStreak || 0} días
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              Tu mejor racha hasta ahora
            </p>
          </div>
        </div>

        {/* Progreso de Libros */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📚</span>
            Progreso de Libros
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">En Progreso</p>
              <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                {progress?.stats.booksInProgress || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">Libros que estás leyendo</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Completados</p>
              <p className="text-3xl sm:text-4xl font-bold text-green-600">
                {progress?.stats.booksCompleted || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">Libros finalizados</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Capítulos Totales</p>
              <p className="text-3xl sm:text-4xl font-bold text-purple-600">
                {progress?.stats.totalChaptersRead || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">Capítulos leídos en total</p>
            </div>
          </div>
        </div>

        {/* Actividad de Hoy */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📅</span>
            Actividad de Hoy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2 flex items-center gap-1">
                <span>⏱️</span>
                Tiempo de Lectura Hoy
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-orange-600">
                {formattedTime}
              </p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                Sigue leyendo para ganar XP
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-5 lg:p-6">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Meta Diaria</p>
              <p className="text-3xl sm:text-4xl font-bold text-green-600">
                {progress?.dailyGoal.progress || 0}/{progress?.dailyGoal.goal || 1}
              </p>
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress?.dailyGoal.percentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                  {progress?.dailyGoal.completed
                    ? '¡Meta completada! 🎉'
                    : `${progress?.dailyGoal.chaptersRemaining || 0} ${progress?.dailyGoal.chaptersRemaining === 1 ? 'cap. restante' : 'caps. restantes'}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Racha */}
        {progress?.streak && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🔥</span>
              Estado de tu Racha
            </h3>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Progreso de XP Hoy</p>
                <div className="mb-2 sm:mb-3">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                    <span>{progress.streak.status.xpToday} XP</span>
                    <span>{progress.streak.status.xpRequired} XP requeridos</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div
                      className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                        progress.streak.status.goalMetToday ? 'bg-green-600' : 'bg-orange-500'
                      }`}
                      style={{ width: `${progress.streak.status.xpProgress}%` }}
                    ></div>
                  </div>
                </div>
                {progress.streak.status.goalMetToday ? (
                  <p className="text-xs sm:text-sm text-green-600 font-semibold">
                    ✅ ¡Meta de XP completada hoy!
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600">
                    Te faltan {progress.streak.status.xpRequired - progress.streak.status.xpToday} XP para mantener la racha
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* XP Progress */}
        {progress?.xp && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⭐</span>
              Progreso de Experiencia
            </h3>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6">
              <div className="flex justify-between items-end mb-2 sm:mb-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">XP Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{progress.user.totalXp} XP</p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Nivel Actual</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">Nivel {progress.xp.currentLevel}</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                  <span>{progress.xp.progress.current} XP</span>
                  <span>{progress.xp.progress.percentage}%</span>
                  <span>{progress.xp.progress.required} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 sm:h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress.xp.progress.percentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 text-center mt-2 sm:mt-3">
                {progress.xp.progress.remaining} XP para alcanzar nivel {progress.xp.currentLevel + 1}
              </p>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
