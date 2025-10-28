import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermission } from '../hooks/usePermission';
import { progressApi, readingApi, adminApi } from '../services/api';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { useTutorial } from '../contexts/TutorialContext';
import { OnboardingTour } from '../tutorials/OnboardingTour';
import ConfirmModal from '../components/ConfirmModal';

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
  dailyGoal: {
    goal: number;
    progress: number;
    completed: boolean;
    percentage: number;
    chaptersRemaining: number;
    minutesRead: number; // Viene en segundos desde el backend
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
  const logoutLocal = useAuthStore((state) => state.logout);
  const { permissions } = usePermission();
  const { isAuthenticated, user: auth0User, logout } = useAuth0();
  const location = useLocation();

  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Admin state
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetProgressModal, setShowResetProgressModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  // Tutorial state
  const { onboarding, isLoading: tutorialLoading } = useTutorial();
  const [runOnboardingTour, setRunOnboardingTour] = useState(false);
  const [tutorialShownThisSession, setTutorialShownThisSession] = useState(false);

  const isAdmin = roles.some((r) => r.name === 'admin');

  // Actualizar seconds cuando cambie el progreso (minutesRead viene en segundos desde el backend)
  useEffect(() => {
    if (progress?.dailyGoal?.minutesRead) {
      setSeconds(progress.dailyGoal.minutesRead);
    }
  }, [progress?.dailyGoal?.minutesRead]);

  // Función para formatear tiempo
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}min ${secs}seg`;
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

  // Mostrar tutorial automáticamente a usuarios nuevos solo en la página de inicio
  useEffect(() => {
    if (!tutorialLoading && !isAdmin && !onboarding.completed && !onboarding.skipped && location.pathname === '/' && !tutorialShownThisSession) {
      // Esperar un poco antes de mostrar el tutorial para que la página cargue
      const timer = setTimeout(() => {
        setRunOnboardingTour(true);
        setTutorialShownThisSession(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tutorialLoading, onboarding.completed, onboarding.skipped, isAdmin, location.pathname, tutorialShownThisSession]);

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

  const handleDeleteUser = async (userId: string) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/users/${selectedUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Usuario eliminado exitosamente');
        setShowDeleteModal(false);
        setSelectedUserId(null);
        await loadUserStats(); // Recargar la tabla
      } else {
        toast.error(data.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const handleResetProgress = async (userId: string) => {
    setSelectedUserId(userId);
    setShowResetProgressModal(true);
  };

  const confirmResetProgress = async () => {
    if (!selectedUserId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/users/${selectedUserId}/reset-progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Progreso reseteado exitosamente');
        setShowResetProgressModal(false);
        setSelectedUserId(null);
        await loadUserStats(); // Recargar la tabla
      } else {
        toast.error(data.message || 'Error al resetear progreso');
      }
    } catch (error) {
      console.error('Reset progress error:', error);
      toast.error('Error al resetear progreso');
    }
  };

  const handleResetPassword = async (userId: string) => {
    setSelectedUserId(userId);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedUserId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/users/${selectedUserId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNewPassword(data.newPassword);
        toast.success('Contraseña reseteada exitosamente');
        // No cerrar el modal aún, mostrar la contraseña
      } else {
        toast.error(data.message || 'Error al resetear contraseña');
        setShowResetPasswordModal(false);
        setSelectedUserId(null);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error al resetear contraseña');
    }
  };

  const closePasswordModal = () => {
    setShowResetPasswordModal(false);
    setSelectedUserId(null);
    setNewPassword(null);
  };

  // Vista de Admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950 dark:via-yellow-950 dark:to-red-950 pt-32">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-orange-600">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2">
              Panel de Administrador
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
              Gestiona el sistema y supervisa el progreso de los usuarios
            </p>
          </div>

          {/* System Stats Grid */}
          {systemStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Total Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Usuarios Totales</p>
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{systemStats.totalUsers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                  {systemStats.activeUsers} activos
                </p>
              </div>

              {/* Total Chapters Read */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Capítulos Leídos</p>
                  <span className="text-xl sm:text-2xl">📖</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{systemStats.totalChaptersRead}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">En total</p>
              </div>

              {/* Total XP */}
              <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-purple-500 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">XP Total</p>
                  <span className="text-xl sm:text-2xl">⭐</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{systemStats.totalXpEarned}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">Entre todos los usuarios</p>
              </div>
            </div>
          )}

          {/* User Statistics Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">Estadísticas de Usuarios</h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-4">Cargando estadísticas...</p>
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
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800 dark:text-gray-100">{user.displayName}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300 text-sm">{user.email}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            Nivel {user.currentLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                          {user.totalXp} XP
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span>🔥</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">{user.currentStreak}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-green-600 dark:text-green-400">
                          {user.totalChaptersRead}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                          {user.booksCompleted}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResetProgress(user.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Resetear Progreso"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Resetear Contraseña"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar Usuario"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmación: Eliminar Usuario */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Eliminar Usuario"
          message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer y eliminará todos sus datos incluyendo progreso, capítulos leídos y estadísticas."
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUserId(null);
          }}
          type="danger"
        />

        {/* Modal de Confirmación: Resetear Progreso */}
        <ConfirmModal
          isOpen={showResetProgressModal}
          title="Resetear Progreso"
          message="¿Estás seguro de que deseas resetear todo el progreso de este usuario? Se eliminarán todos sus capítulos leídos, progreso de libros, XP, nivel y racha. Esta acción no se puede deshacer."
          confirmText="Sí, resetear"
          cancelText="Cancelar"
          onConfirm={confirmResetProgress}
          onCancel={() => {
            setShowResetProgressModal(false);
            setSelectedUserId(null);
          }}
          type="danger"
        />

        {/* Modal de Contraseña Reseteada */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {newPassword ? 'Contraseña Reseteada' : 'Resetear Contraseña'}
              </h3>

              {newPassword ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    La contraseña ha sido reseteada exitosamente. Copia esta contraseña temporal y compártela con el usuario:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-lg font-mono font-bold text-center text-indigo-600 dark:text-indigo-400 select-all">
                      {newPassword}
                    </p>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    ⚠️ Esta contraseña solo se mostrará una vez. Asegúrate de copiarla antes de cerrar esta ventana.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(newPassword);
                        toast.success('Contraseña copiada al portapapeles');
                      }}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Copiar Contraseña
                    </button>
                    <button
                      onClick={closePasswordModal}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    ¿Estás seguro de que deseas resetear la contraseña de este usuario? Se generará una nueva contraseña temporal.
                  </p>
                  <p className="text-sm text-yellow-600 mb-4">
                    ⚠️ Nota: Solo se puede resetear la contraseña de usuarios locales (no usuarios de Auth0).
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmResetPassword}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Sí, resetear
                    </button>
                    <button
                      onClick={() => {
                        setShowResetPasswordModal(false);
                        setSelectedUserId(null);
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista de Usuario Regular
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 pt-32">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-indigo-600">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-1 sm:mb-2">
            ¡Hola {user?.displayName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
            Bienvenido de vuelta a tu aventura bíblica
          </p>
        </div>

        {/* Verse of the Day */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📖</span>
            Versículo del Día
          </h3>

          {loading || !verse ? (
            <div className="animate-pulse bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-4 bg-indigo-200 dark:bg-indigo-700 rounded w-full"></div>
                <div className="h-4 bg-indigo-200 dark:bg-indigo-700 rounded w-5/6"></div>
                <div className="h-4 bg-indigo-200 dark:bg-indigo-700 rounded w-4/6"></div>
                <div className="h-3 bg-indigo-200 dark:bg-indigo-700 rounded w-32 mt-4"></div>
              </div>
            </div>
          ) : verse ? (
            <Link
              to={`/lectura-libre/${verse.reference.bookSlug}/${verse.reference.chapter}/${verse.reference.verse}`}
              className="block bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800/60 dark:hover:to-purple-800/60 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed mb-3 sm:mb-4">
                "{verse.text}"
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  {verse.reference.fullReference} ({verse.version})
                </p>
                <span className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  Leer más →
                </span>
              </div>
            </Link>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">No se pudo cargar el versículo</p>
          )}
        </div>

        {/* Stats Grid - Estadísticas principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* XP Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">XP Total</p>
              <span className="text-xl sm:text-2xl">⭐</span>
            </div>
            {loading || !progress ? (
              <div className="animate-pulse">
                <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2 sm:mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-1"></div>
              </div>
            ) : (
              <>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{progress.user.totalXp}</p>
                {progress.xp && (
                  <div className="mt-2 sm:mt-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                      <span>Nivel {progress.xp.currentLevel}</span>
                      <span>{progress.xp.progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.xp.progress.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {progress.xp.progress.remaining} XP para nivel {progress.xp.currentLevel + 1}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Meta Diaria */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Meta Diaria</p>
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            {loading || !progress ? (
              <div className="animate-pulse">
                <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 sm:mb-3"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-1"></div>
              </div>
            ) : (
              <>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                  {progress.dailyGoal.progress}/{progress.dailyGoal.goal}
                </p>
                {progress.dailyGoal && (
                  <div className="mt-2 sm:mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.dailyGoal.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {progress.dailyGoal.completed
                        ? '¡Meta completada! 🎉'
                        : `${progress.dailyGoal.chaptersRemaining} ${progress.dailyGoal.chaptersRemaining === 1 ? 'cap. restante' : 'caps. restantes'}`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Racha */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Racha</p>
              <span className="text-xl sm:text-2xl">🔥</span>
            </div>
            {loading || !progress ? (
              <div className="animate-pulse">
                <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2 sm:mb-3"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1"></div>
              </div>
            ) : (
              <>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {progress.user.currentStreak} días
                </p>
                {progress.streak?.status && (
                  <div className="mt-2 sm:mt-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                      <span>{progress.streak.status.xpToday} XP</span>
                      <span>{Math.floor(progress.streak.status.xpProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-orange-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(progress.streak.status.xpProgress, 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {progress.streak.status.goalMetToday
                        ? '¡Meta del día cumplida! ✨'
                        : `${progress.streak.status.xpRequired - progress.streak.status.xpToday} XP para mantener racha`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tiempo de Lectura Hoy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Tiempo Hoy</p>
              <span className="text-xl sm:text-2xl">⏱️</span>
            </div>
            {loading || !progress ? (
              <div className="animate-pulse">
                <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 sm:mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formattedTime}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                  Sigue leyendo para ganar XP
                </p>
              </>
            )}
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
              <span className="text-3xl sm:text-4xl lg:text-5xl">🛣</span>
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
              <span className="text-3xl sm:text-4xl lg:text-5xl">📖</span>
            </div>
          </Link>
        </div>

        {/* Debug: Permissions - Solo para Admin */}
        {isAdmin && (
          <details className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-200">
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

      {/* Tutorial de Bienvenida */}
      <OnboardingTour
        run={runOnboardingTour}
        onComplete={() => {
          setRunOnboardingTour(false);
          setTutorialShownThisSession(true);
        }}
      />
    </div>
  );
}
