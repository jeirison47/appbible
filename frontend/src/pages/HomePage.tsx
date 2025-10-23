import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermission } from '../hooks/usePermission';
import { progressApi, readingApi, adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useReadingTimer } from '../hooks/useReadingTimer';

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

  // Timer de lectura (para usuarios regulares)
  const { formattedTime, seconds } = useReadingTimer();

  // Admin state
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newSystemGoal, setNewSystemGoal] = useState(50);

  const isAdmin = roles.some((r) => r.name === 'admin');

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
      setNewSystemGoal(data.stats.systemDailyGoal);
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

  const handleSaveSystemGoal = async () => {
    try {
      await adminApi.updateSystemDailyGoal(newSystemGoal);
      toast.success('Meta diaria del sistema actualizada');
      setEditingGoal(false);
      await loadSystemStats();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar meta del sistema');
    }
  };

  // Vista de Admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-l-4 border-orange-600">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Panel de Administrador
            </h2>
            <p className="text-gray-600 text-lg">
              Gestiona el sistema y supervisa el progreso de los usuarios
            </p>
          </div>

          {/* System Stats Grid */}
          {systemStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">Usuarios Totales</p>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{systemStats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {systemStats.activeUsers} activos
                </p>
              </div>

              {/* Total Chapters Read */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">Capítulos Leídos</p>
                  <span className="text-2xl">📖</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{systemStats.totalChaptersRead}</p>
                <p className="text-xs text-gray-500 mt-2">En total</p>
              </div>

              {/* Total XP */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">XP Total</p>
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{systemStats.totalXpEarned}</p>
                <p className="text-xs text-gray-500 mt-2">Entre todos los usuarios</p>
              </div>

              {/* System Daily Goal */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 font-medium">Meta Diaria Sistema</p>
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">{systemStats.systemDailyGoal}</p>
                <p className="text-xs text-gray-500 mt-2">Capítulos por día</p>
              </div>
            </div>
          )}

          {/* System Daily Goal Configuration */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Meta Diaria del Sistema</h3>
                <p className="text-gray-600">Establece la meta diaria predeterminada para todos los usuarios</p>
              </div>
              {!editingGoal && (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Editar Meta
                </button>
              )}
            </div>

            {editingGoal ? (
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Diaria (capítulos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSystemGoal}
                    onChange={(e) => setNewSystemGoal(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSaveSystemGoal}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingGoal(false);
                        setNewSystemGoal(systemStats?.systemDailyGoal || 50);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-orange-600 mb-2">
                  {systemStats?.systemDailyGoal || 50}
                </div>
                <p className="text-gray-600">Capítulos por día (predeterminado)</p>
              </div>
            )}
          </div>

          {/* User Statistics Table */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas de Usuarios</h3>

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-l-4 border-indigo-600">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            ¡Hola {user?.displayName}!
          </h2>
          <p className="text-gray-600 text-lg">
            Bienvenido de vuelta a tu aventura bíblica
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* XP Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Experiencia</p>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">{progress?.user.totalXp || 0} XP</p>
            {progress?.xp && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Nivel {progress.xp.currentLevel}</span>
                  <span>{progress.xp.progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.xp.progress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.xp.progress.remaining} XP para nivel {progress.xp.currentLevel + 1}
                </p>
              </div>
            )}
          </div>

          {/* Level Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Nivel</p>
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              Nivel {progress?.user.currentLevel || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {progress?.stats.totalChaptersRead || 0} capítulos leídos
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Racha</p>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {progress?.user.currentStreak || 0} días
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Récord: {progress?.user.longestStreak || 0} días
            </p>
          </div>

          {/* Meta Diaria Actual (Progreso) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Progreso de Hoy</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {progress?.dailyGoal.progress || 0}/{progress?.dailyGoal.goal || 1}
            </p>
            {progress?.dailyGoal && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.dailyGoal.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.dailyGoal.completed
                    ? '¡Meta completada!'
                    : `${progress.dailyGoal.chaptersRemaining} capítulos restantes`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metas Grid - 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Meta del Sistema */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${
            progress?.user.personalDailyGoal === null
              ? 'border-indigo-500 ring-2 ring-indigo-200'
              : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Meta del Sistema</p>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-indigo-600">
                {progress?.user.systemDailyGoal || 0}
              </p>
              {progress?.user.personalDailyGoal === null && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  ✓ En uso
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress?.user.systemDailyGoal === 1 ? 'capítulo' : 'capítulos'} por día (configurado por admin)
            </p>
          </div>

          {/* Meta Personal */}
          <div className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${
            progress?.user.personalDailyGoal !== null
              ? 'border-green-500 ring-2 ring-green-200'
              : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Meta Personal</p>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold ${
                progress?.user.personalDailyGoal !== null
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}>
                {progress?.user.personalDailyGoal || '-'}
              </p>
              {progress?.user.personalDailyGoal !== null && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  ✓ En uso
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress?.user.personalDailyGoal
                ? `${progress.user.personalDailyGoal === 1 ? 'capítulo' : 'capítulos'} por día (tu meta)`
                : 'No configurada - usando meta del sistema'}
            </p>
          </div>
        </div>

        {/* Book Progress & Reading Timer */}
        {progress && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tus Libros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">En Progreso</p>
                <p className="text-3xl font-bold text-blue-600">
                  {progress.stats.booksInProgress}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Completados</p>
                <p className="text-3xl font-bold text-green-600">
                  {progress.stats.booksCompleted}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Leídos</p>
                <p className="text-3xl font-bold text-purple-600">
                  {progress.stats.totalChaptersRead} caps
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-1">
                  <span>⏱️</span>
                  Tiempo de Lectura Hoy
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {formattedTime}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {seconds >= 600 ? `${Math.floor(seconds / 600)} bloques de 10 min` : 'Acumulando tiempo...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Lectura Camino */}
          <Link
            to={
              progress?.lastRead?.camino
                ? `/camino/${progress.lastRead.camino.bookSlug}/${progress.lastRead.camino.chapterNumber}`
                : '/camino'
            }
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Lectura Camino</h3>
                {progress?.lastRead?.camino ? (
                  <>
                    <p className="opacity-90 mb-1">Continuar leyendo:</p>
                    <p className="text-sm font-semibold">
                      {progress.lastRead.camino.bookName} - Cap. {progress.lastRead.camino.chapterNumber}
                    </p>
                  </>
                ) : (
                  <p className="opacity-90">Comienza tu camino de lectura guiado</p>
                )}
              </div>
              <span className="text-5xl">📖</span>
            </div>
          </Link>

          {/* Lectura Libre */}
          <Link
            to={
              progress?.lastRead?.libre
                ? `/lectura-libre/${progress.lastRead.libre.bookSlug}/${progress.lastRead.libre.chapterNumber}`
                : '/lectura-libre'
            }
            className="bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Lectura Libre</h3>
                {progress?.lastRead?.libre ? (
                  <>
                    <p className="opacity-90 mb-1">Continuar leyendo:</p>
                    <p className="text-sm font-semibold">
                      {progress.lastRead.libre.bookName} - Cap. {progress.lastRead.libre.chapterNumber}
                    </p>
                  </>
                ) : (
                  <p className="opacity-90">Explora cualquier libro o capítulo</p>
                )}
              </div>
              <span className="text-5xl">🗺️</span>
            </div>
          </Link>
        </div>

        {/* Verse of the Day */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📖</span>
            Versículo del Día
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando...</p>
            </div>
          ) : verse ? (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
              <p className="text-xl text-gray-700 leading-relaxed mb-4">
                "{verse.text}"
              </p>
              <p className="text-sm text-gray-600 font-semibold">
                {verse.reference.fullReference} ({verse.version})
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No se pudo cargar el versículo</p>
          )}
        </div>

        {/* Debug: Permissions */}
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
      </div>
    </div>
  );
}
