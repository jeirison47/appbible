import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermission } from '../hooks/usePermission';
import { progressApi, readingApi, adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';

interface ProgressData {
  user: {
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    dailyGoal: number;
    personalDailyGoal: number | null;
    systemDailyGoal: number;
  };
  xp: {
    totalXp: number;
    currentLevel: number;
    xpForNextLevel: number;
    progress: {
      current: number;
      required: number;
      remaining: number;
      percentage: number;
    };
  };
  dailyGoal: {
    goal: number;
    progress: number;
    completed: boolean;
    percentage: number;
    chaptersRemaining: number;
    minutesRead: number;
  };
  stats: {
    totalChaptersRead: number;
    booksInProgress: number;
    booksCompleted: number;
  };
  lastRead?: {
    camino: {
      bookName: string;
      bookSlug: string;
      chapterNumber: number;
      chapterTitle: string;
    } | null;
    libre: {
      bookName: string;
      bookSlug: string;
      chapterNumber: number;
      chapterTitle: string;
    } | null;
  };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalChaptersRead: number;
  totalXpEarned: number;
  systemDailyGoal: number;
}

interface UserStats {
  id: string;
  displayName: string;
  email: string;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  totalChaptersRead: number;
  booksCompleted: number;
}

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const { permissions } = usePermission();

  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Admin state
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);

  const isAdmin = roles.some((r) => r.name === 'admin');

  // Actualizar seconds cuando cambie el progreso
  useEffect(() => {
    if (progress?.dailyGoal?.minutesRead) {
      setSeconds(progress.dailyGoal.minutesRead * 60);
    }
  }, [progress?.dailyGoal?.minutesRead]);

  // Función para formatear tiempo
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(seconds);

  useEffect(() => {
    if (isAdmin) {
      // Cargar estadísticas del sistema para admin
      loadSystemStats();
      loadUserStats();
    } else {
      // Cargar progreso del usuario regular
      progressApi
        .getMyProgress()
        .then((data) => {
          setProgress(data.data);
        })
        .catch((err) => {
          console.error('Failed to load progress:', err);
        });

      // Cargar versículo del día
      readingApi
        .getVerseOfTheDay('RV1960')
        .then((data) => {
          setVerse(data.verse);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load verse of the day:', err);
          setLoading(false);
        });
    }
  }, [isAdmin]);

  const loadSystemStats = async () => {
    try {
      const data = await adminApi.getSystemStats();
      setSystemStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load system stats:', error);
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const data = await adminApi.getUserStats();
      setUserStats(data.users);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  // Vista de Admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 pb-28 md:pb-0">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-orange-600">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
              Panel de Administrador
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Gestiona el sistema y supervisa el progreso de los usuarios
            </p>
          </div>

          {/* System Stats Grid */}
          {systemStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Total Users */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Usuarios Totales</p>
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{systemStats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                  {systemStats.activeUsers} activos
                </p>
              </div>

              {/* Total Chapters Read */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Capítulos Leídos</p>
                  <span className="text-xl sm:text-2xl">📖</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{systemStats.totalChaptersRead}</p>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">En total</p>
              </div>

              {/* Total XP */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-purple-500 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">XP Total</p>
                  <span className="text-xl sm:text-2xl">⭐</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{systemStats.totalXpEarned}</p>
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">Entre todos los usuarios</p>
              </div>
            </div>
          )}

          {/* User Statistics Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Estadísticas de Usuarios</h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando estadísticas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Nivel</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">XP Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Racha</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Capítulos</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Libros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800">{user.displayName}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-sm">{user.email}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            Nivel {user.currentLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-indigo-600">
                          {user.totalXp} XP
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span>🔥</span>
                            <span className="font-semibold text-orange-600">{user.currentStreak}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-green-600">
                          {user.totalChaptersRead}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-blue-600">
                          {user.booksCompleted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista de Usuario Regular
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-28 md:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-indigo-600">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            ¡Hola {user?.displayName}!
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Bienvenido de vuelta a tu aventura bíblica
          </p>
        </div>

        {/* Verse of the Day */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📖</span>
            Versículo del Día
          </h3>

          {loading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">Cargando...</p>
            </div>
          ) : verse ? (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-3 sm:mb-4">
                "{verse.text}"
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                {verse.reference.fullReference} ({verse.version})
              </p>
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">No se pudo cargar el versículo</p>
          )}
        </div>

        {/* Stats Grid - Estadísticas principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* XP Card */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">XP Total</p>
              <span className="text-xl sm:text-2xl">⭐</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600">{progress?.user.totalXp || 0}</p>
            {progress?.xp && (
              <div className="mt-2 sm:mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Nivel {progress.xp.currentLevel}</span>
                  <span>{progress.xp.progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.xp.progress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.xp.progress.remaining} XP para nivel {progress.xp.currentLevel + 1}
                </p>
              </div>
            )}
          </div>

          {/* Progreso de Hoy */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Progreso de Hoy</p>
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
              {progress?.dailyGoal.progress || 0}/{progress?.dailyGoal.goal || 1}
            </p>
            {progress?.dailyGoal && (
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.dailyGoal.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.dailyGoal.completed
                    ? '¡Meta completada! 🎉'
                    : `${progress.dailyGoal.chaptersRemaining} ${progress.dailyGoal.chaptersRemaining === 1 ? 'cap. restante' : 'caps. restantes'}`}
                </p>
              </div>
            )}
          </div>

          {/* Racha */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Racha</p>
              <span className="text-xl sm:text-2xl">🔥</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">
              {progress?.user.currentStreak || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              Récord: {progress?.user.longestStreak || 0} días
            </p>
          </div>

          {/* Tiempo de Lectura Hoy */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Tiempo Hoy</p>
              <span className="text-xl sm:text-2xl">⏱️</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
              {formattedTime}
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              {seconds >= 600 ? `${Math.floor(seconds / 600)} bloques de 10 min` : 'Acumulando...'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Lectura Camino */}
          <Link
            to={
              progress?.lastRead?.camino
                ? `/camino/${progress.lastRead.camino.bookSlug}/${progress.lastRead.camino.chapterNumber}`
                : '/camino'
            }
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Lectura Camino</h3>
                {progress?.lastRead?.camino ? (
                  <>
                    <p className="opacity-90 mb-1 text-sm sm:text-base">Continuar leyendo:</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      {progress.lastRead.camino.bookName} - Cap. {progress.lastRead.camino.chapterNumber}
                    </p>
                  </>
                ) : (
                  <p className="opacity-90 text-sm sm:text-base">Comienza tu camino de lectura guiado</p>
                )}
              </div>
              <span className="text-3xl sm:text-4xl lg:text-5xl">📖</span>
            </div>
          </Link>

          {/* Lectura Libre */}
          <Link
            to={
              progress?.lastRead?.libre
                ? `/lectura-libre/${progress.lastRead.libre.bookSlug}/${progress.lastRead.libre.chapterNumber}`
                : '/lectura-libre'
            }
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Lectura Libre</h3>
                {progress?.lastRead?.libre ? (
                  <>
                    <p className="opacity-90 mb-1 text-sm sm:text-base">Continuar leyendo:</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      {progress.lastRead.libre.bookName} - Cap. {progress.lastRead.libre.chapterNumber}
                    </p>
                  </>
                ) : (
                  <p className="opacity-90 text-sm sm:text-base">Explora cualquier libro o capítulo</p>
                )}
              </div>
              <span className="text-3xl sm:text-4xl lg:text-5xl">🗺️</span>
            </div>
          </Link>
        </div>

        {/* Debug: Permissions - Solo para Admin */}
        {isAdmin && (
          <details className="mt-6 bg-white rounded-lg shadow p-4">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Ver Permisos del Sistema
            </summary>
            <div className="mt-4 flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {perm}
                </span>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
