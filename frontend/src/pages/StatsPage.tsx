import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { progressApi } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';

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
    <div className="min-h-screen bg-manah-bg font-manrope pt-16 sm:pt-32 pb-24">
      <Navbar />

      {loading ? (
        <LoadingScreen fullScreen={false} />
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 border border-manah-gold/20 text-center">
              <div className="mb-2 sm:mb-3 flex justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-manah-cream">
                Tus Estadísticas
              </h2>
              <p className="text-xs sm:text-sm text-manah-muted">
                Revisa tu progreso detallado en tu aventura bíblica
              </p>
            </div>

            {/* Gamificación Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              {/* Nivel Card */}
              <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border-t-4 border-manah-gold">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium">Nivel Actual</p>
                  <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z"/>
                  </svg>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-manah-gold">
                  Nivel {progress?.user.currentLevel || 0}
                </p>
                <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">
                  {progress?.stats.totalChaptersRead || 0} capítulos leídos
                </p>
              </div>

              {/* Racha Actual */}
              <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border-t-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium">Racha Actual</p>
                  <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                  </svg>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-orange-400">
                  {progress?.user.currentStreak || 0} días
                </p>
                <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">
                  Días consecutivos con actividad
                </p>
              </div>

              {/* Racha Récord */}
              <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 border-t-4 border-manah-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium">Racha Récord</p>
                  <svg className="w-6 h-6 text-manah-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-manah-cream">
                  {progress?.user.longestStreak || 0} días
                </p>
                <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">
                  Tu mejor racha hasta ahora
                </p>
              </div>
            </div>

            {/* Progreso de Libros */}
            <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                </svg>
                Progreso de Libros
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-manah-gold/10">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium mb-2">En Progreso</p>
                  <p className="text-3xl sm:text-4xl font-bold text-manah-cream">
                    {progress?.stats.booksInProgress || 0}
                  </p>
                  <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">Libros que estás leyendo</p>
                </div>
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-green-900/30">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium mb-2">Completados</p>
                  <p className="text-3xl sm:text-4xl font-bold text-manah-gold">
                    {progress?.stats.booksCompleted || 0}
                  </p>
                  <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">Libros finalizados</p>
                </div>
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-manah-gold/20">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium mb-2">Capítulos Totales</p>
                  <p className="text-3xl sm:text-4xl font-bold text-manah-gold">
                    {progress?.stats.totalChaptersRead || 0}
                  </p>
                  <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">Capítulos leídos en total</p>
                </div>
              </div>
            </div>

            {/* Actividad de Hoy */}
            <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Actividad de Hoy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-manah-gold/10">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-manah-muted" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                    Tiempo de Lectura Hoy
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-manah-cream">
                    {formattedTime}
                  </p>
                  <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">
                    Sigue leyendo para ganar XP
                  </p>
                </div>
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-manah-gold/20">
                  <p className="text-xs sm:text-sm text-manah-muted font-medium mb-2">Meta Diaria</p>
                  <p className="text-3xl sm:text-4xl font-bold text-manah-gold">
                    {progress?.dailyGoal.progress || 0}/{progress?.dailyGoal.goal || 1}
                  </p>
                  <div className="mt-2 sm:mt-3">
                    <div className="w-full bg-manah-bg h-2 sm:h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-manah-gold h-2 sm:h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress?.dailyGoal.percentage || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-manah-muted/60 mt-1 sm:mt-2">
                      {progress?.dailyGoal.completed
                        ? '¡Meta completada!'
                        : `${progress?.dailyGoal.chaptersRemaining || 0} ${progress?.dailyGoal.chaptersRemaining === 1 ? 'cap. restante' : 'caps. restantes'}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de Racha */}
            {progress?.streak && (
              <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                  </svg>
                  Estado de tu Racha
                </h3>
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-manah-gold/10">
                  <div>
                    <p className="text-xs sm:text-sm text-manah-muted font-medium mb-2">Progreso de XP Hoy</p>
                    <div className="mb-2 sm:mb-3">
                      <div className="flex justify-between text-xs sm:text-sm text-manah-muted mb-1">
                        <span>{progress.streak.status.xpToday} XP</span>
                        <span>{progress.streak.status.xpRequired} XP requeridos</span>
                      </div>
                      <div className="w-full bg-manah-bg h-2 sm:h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-2 sm:h-3 transition-all duration-300 ${
                            progress.streak.status.goalMetToday ? 'bg-manah-gold' : 'bg-manah-bronze'
                          }`}
                          style={{ width: `${progress.streak.status.xpProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    {progress.streak.status.goalMetToday ? (
                      <p className="text-xs sm:text-sm text-manah-gold font-semibold">
                        ✓ ¡Meta de XP completada hoy!
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-manah-muted">
                        Te faltan {progress.streak.status.xpRequired - progress.streak.status.xpToday} XP para mantener la racha
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* XP Progress */}
            {progress?.xp && (
              <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  Progreso de Experiencia
                </h3>
                <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 border border-manah-gold/20">
                  <div className="flex justify-between items-end mb-2 sm:mb-3">
                    <div>
                      <p className="text-xs sm:text-sm text-manah-muted font-medium">XP Total</p>
                      <p className="text-2xl sm:text-3xl font-bold text-manah-gold">{progress.user.totalXp} XP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-manah-muted font-medium">Nivel Actual</p>
                      <p className="text-2xl sm:text-3xl font-bold text-manah-cream">Nivel {progress.xp.currentLevel}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs sm:text-sm text-manah-muted mb-1">
                      <span>{progress.xp.progress.current} XP</span>
                      <span>{progress.xp.progress.percentage}%</span>
                      <span>{progress.xp.progress.required} XP</span>
                    </div>
                    <div className="w-full bg-manah-bg h-3 sm:h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-manah-gold h-3 sm:h-4 transition-all duration-300"
                        style={{ width: `${progress.xp.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-manah-muted text-center mt-2 sm:mt-3">
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




