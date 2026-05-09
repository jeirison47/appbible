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
  const logoutLocal = useAuthStore((state) => state.logout);
  const { permissions } = usePermission();
  const { isAuthenticated, user: auth0User, logout } = useAuth0();
  const location = useLocation();

  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetProgressModal, setShowResetProgressModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const { onboarding, isLoading: tutorialLoading } = useTutorial();
  const [runOnboardingTour, setRunOnboardingTour] = useState(false);

  const isAdmin = roles.some((r) => r.name === 'admin');

  useEffect(() => {
    if (progress?.dailyGoal?.minutesRead) {
      setSeconds(progress.dailyGoal.minutesRead);
    }
  }, [progress?.dailyGoal?.minutesRead]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const formattedTime = formatTime(seconds);

  useEffect(() => {
    if (isAdmin) {
      loadSystemStats();
      loadUserStats();
    } else {
      if (user) {
        progressApi
          .getMyProgress()
          .then((data) => setProgress(data.data))
          .catch((err) => console.error('Failed to load progress:', err));
      }

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
  }, [isAdmin, user]);

  useEffect(() => {
    const locationState = location.state as { showTutorial?: boolean } | null;
    const shouldShowManually = locationState?.showTutorial;

    if (!tutorialLoading && !isAdmin && user && location.pathname === '/inicio') {
      const isFirstTime = !onboarding.completed && !onboarding.skipped;
      const shouldShow = shouldShowManually || isFirstTime;

      if (shouldShow) {
        const timer = setTimeout(() => setRunOnboardingTour(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [tutorialLoading, onboarding.completed, onboarding.skipped, isAdmin, location.pathname, location.state]);

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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Usuario eliminado exitosamente');
        setShowDeleteModal(false);
        setSelectedUserId(null);
        await loadUserStats();
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Progreso reseteado exitosamente');
        setShowResetProgressModal(false);
        setSelectedUserId(null);
        await loadUserStats();
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        setNewPassword(data.newPassword);
        toast.success('Contraseña reseteada exitosamente');
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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 pt-32">
        <Navbar />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-stone-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-l-4 border-orange-600">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-1 sm:mb-2">
              Panel de Administrador
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base lg:text-lg">
              Gestiona el sistema y supervisa el progreso de los usuarios
            </p>
          </div>

          {/* System Stats Grid */}
          {systemStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Total Users */}
              <div className="bg-white dark:bg-stone-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-stone-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">Usuarios Totales</p>
                  <svg className="w-6 h-6 text-stone-500 dark:text-stone-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-stone-700 dark:text-stone-200">{systemStats.totalUsers}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 sm:mt-2">
                  {systemStats.activeUsers} activos
                </p>
              </div>

              {/* Total Chapters Read */}
              <div className="bg-white dark:bg-stone-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">Capítulos Leídos</p>
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                  </svg>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{systemStats.totalChaptersRead}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 sm:mt-2">En total</p>
              </div>

              {/* Total XP */}
              <div className="bg-white dark:bg-stone-800 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-t-4 border-amber-500 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">XP Total</p>
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">{systemStats.totalXpEarned}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 sm:mt-2">Entre todos los usuarios</p>
              </div>
            </div>
          )}

          {/* User Statistics Table */}
          <div className="bg-white dark:bg-stone-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4 sm:mb-6">Estadísticas de Usuarios</h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="text-stone-600 dark:text-stone-300 mt-4">Cargando estadísticas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-stone-200 dark:border-stone-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700 dark:text-stone-200">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stone-700 dark:text-stone-200">Email</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700 dark:text-stone-200">Nivel</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700 dark:text-stone-200">XP Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700 dark:text-stone-200">Racha</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700 dark:text-stone-200">Capítulos</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700 dark:text-stone-200">Libros</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700 dark:text-stone-200">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((u) => (
                      <tr key={u.id} className="border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-stone-800 dark:text-stone-100">{u.displayName}</div>
                        </td>
                        <td className="px-4 py-4 text-stone-600 dark:text-stone-300 text-sm">{u.email}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                            Nivel {u.currentLevel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-amber-700 dark:text-amber-400">
                          {u.totalXp} XP
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                            </svg>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">{u.currentStreak}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-green-600 dark:text-green-400">
                          {u.totalChaptersRead}
                        </td>
                        <td className="px-4 py-4 text-center font-semibold text-stone-700 dark:text-stone-300">
                          {u.booksCompleted}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResetProgress(u.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                              title="Resetear Progreso"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleResetPassword(u.id)}
                              className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
                              title="Resetear Contraseña"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

        <ConfirmModal
          isOpen={showDeleteModal}
          title="Eliminar Usuario"
          message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer y eliminará todos sus datos incluyendo progreso, capítulos leídos y estadísticas."
          confirmText="Sí, eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteUser}
          onCancel={() => { setShowDeleteModal(false); setSelectedUserId(null); }}
          type="danger"
        />

        <ConfirmModal
          isOpen={showResetProgressModal}
          title="Resetear Progreso"
          message="¿Estás seguro de que deseas resetear todo el progreso de este usuario? Se eliminarán todos sus capítulos leídos, progreso de libros, XP, nivel y racha. Esta acción no se puede deshacer."
          confirmText="Sí, resetear"
          cancelText="Cancelar"
          onConfirm={confirmResetProgress}
          onCancel={() => { setShowResetProgressModal(false); setSelectedUserId(null); }}
          type="danger"
        />

        {showResetPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                {newPassword ? 'Contraseña Reseteada' : 'Resetear Contraseña'}
              </h3>

              {newPassword ? (
                <div>
                  <p className="text-stone-600 dark:text-stone-300 mb-4">
                    La contraseña ha sido reseteada exitosamente. Copia esta contraseña temporal y compártela con el usuario:
                  </p>
                  <div className="bg-stone-100 dark:bg-stone-700 p-4 rounded-lg mb-4">
                    <p className="text-lg font-mono font-bold text-center text-amber-700 dark:text-amber-400 select-all">
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
                      className="flex-1 bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors font-medium"
                    >
                      Copiar Contraseña
                    </button>
                    <button
                      onClick={closePasswordModal}
                      className="flex-1 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-100 px-4 py-2 rounded-lg hover:bg-stone-300 transition-colors font-medium"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-stone-600 dark:text-stone-300 mb-4">
                    ¿Estás seguro de que deseas resetear la contraseña de este usuario? Se generará una nueva contraseña temporal.
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                    ⚠️ Nota: Solo se puede resetear la contraseña de usuarios locales (no usuarios de Auth0).
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmResetPassword}
                      className="flex-1 bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors font-medium"
                    >
                      Sí, resetear
                    </button>
                    <button
                      onClick={() => { setShowResetPasswordModal(false); setSelectedUserId(null); }}
                      className="flex-1 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-100 px-4 py-2 rounded-lg hover:bg-stone-300 transition-colors font-medium"
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
  const today = new Date();
  const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const dateStr = `${dayNames[today.getDay()]} · ${today.getDate()} DE ${monthNames[today.getMonth()]}`;
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const initial = (user?.displayName ?? 'U')[0].toUpperCase();

  const currentStreak = progress?.user.currentStreak ?? 0;
  const longestStreak = progress?.user.longestStreak ?? 0;
  const goalMetToday = progress?.streak?.status.goalMetToday ?? false;
  const dayOfWeek = today.getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const filledDays = dayLabels.map((_, i) => {
    if (i > todayIdx) return false;
    const daysAgo = todayIdx - i;
    if (daysAgo === 0) return goalMetToday;
    return daysAgo < currentStreak;
  });

  const currentLevel = progress?.xp?.currentLevel ?? 0;
  const totalXp = progress?.user.totalXp ?? 0;
  const xpPct = progress?.xp?.progress.percentage ?? 0;
  const dailyProgress = progress?.dailyGoal?.progress ?? 0;
  const dailyGoal = progress?.dailyGoal?.goal ?? 0;
  const displayMinutes = Math.floor((progress?.dailyGoal?.minutesRead ?? 0) / 60);
  const displaySeconds = (progress?.dailyGoal?.minutesRead ?? 0) % 60;

  return (
    <div className="min-h-screen bg-manah-bg font-manrope">
      <Navbar />

      <div className="pt-16 sm:pt-32 max-w-xl mx-auto px-4 pb-24">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold text-manah-muted tracking-widest mb-1">{dateStr}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-manah-cream">
            {user ? `Hola, ${user.displayName}.` : 'Bienvenido.'}
          </h1>
        </div>

        {/* Versículo del Día */}
        <div className="mb-6">
          <p className="text-center text-xs font-bold text-manah-gold/60 tracking-[0.2em] mb-5">· VERSÍCULO DEL DÍA ·</p>
          {loading || !verse ? (
            <div className="animate-pulse space-y-3 px-4">
              <div className="h-5 bg-manah-deep rounded w-full"></div>
              <div className="h-5 bg-manah-deep rounded w-5/6 mx-auto"></div>
              <div className="h-5 bg-manah-deep rounded w-4/6 mx-auto"></div>
              <div className="h-3 bg-manah-deep rounded w-32 mx-auto mt-4"></div>
            </div>
          ) : verse ? (
            <Link
              to={`/lectura-libre/${verse.reference.bookSlug}/${verse.reference.chapter}/${verse.reference.verse}`}
              className="block text-center group px-2"
            >
              <p className="text-lg sm:text-xl text-manah-cream leading-relaxed italic font-light mb-4 group-hover:text-manah-gold transition-colors">
                "{verse.text}"
              </p>
              <p className="text-xs font-bold text-manah-gold/60 tracking-[0.15em]">
                — {verse.reference.fullReference} —
              </p>
            </Link>
          ) : (
            <p className="text-center text-manah-muted text-sm">No se pudo cargar el versículo</p>
          )}
        </div>

        <div className="w-full h-px bg-manah-gold/15 mb-5" />

        {/* CTA para invitados */}
        {!user && (
          <div className="bg-manah-card border border-manah-gold/20 rounded-xl p-6 mb-6 text-center">
            <p className="text-manah-muted text-sm mb-4">Crea una cuenta para acceder a tu camino de lectura, racha, estadísticas y más.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="bg-manah-gold text-manah-bg px-6 py-2.5 rounded-xl font-bold hover:bg-manah-bronze transition cursor-pointer">
                Crear cuenta
              </Link>
              <Link to="/login" className="bg-manah-deep text-manah-cream px-6 py-2.5 rounded-xl font-bold hover:bg-manah-deep/80 transition cursor-pointer border border-manah-gold/20">
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}

        {/* Racha y progreso — solo usuarios autenticados */}
        {user && (
        <>
        <div data-tutorial="racha-card" className="bg-manah-gold rounded-xl p-5 mb-4">
          {loading || !progress ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-manah-deep rounded w-20"></div>
              <div className="h-12 bg-manah-deep rounded w-36"></div>
              <div className="flex gap-2">
                {[...Array(7)].map((_, i) => <div key={i} className="flex-1 h-9 bg-manah-deep rounded-xl"></div>)}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-manah-bg/60 tracking-widest mb-2">RACHA</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-manah-bg leading-none">{currentStreak}</span>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-manah-bg text-sm font-bold">días seguidos</span>
                      <svg className="w-5 h-5 text-manah-bg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  {longestStreak > 0 && (
                    <p className="text-xs font-bold text-manah-bg/50 mb-2">mejor {longestStreak}d</p>
                  )}
                  {progress.streak?.status && (
                    <div className="w-28">
                      <div className="flex justify-between text-xs font-bold text-manah-bg/60 mb-1">
                        <span>{progress.streak.status.xpToday}/{progress.streak.status.xpRequired} XP</span>
                        <span>{Math.floor(progress.streak.status.xpProgress)}%</span>
                      </div>
                      <div className="w-full bg-manah-bg/20 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-manah-bg h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress.streak.status.xpProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs font-bold text-manah-bg/60 mt-1 leading-tight">
                        {progress.streak.status.goalMetToday ? '¡Meta cumplida!' : 'para mantener racha'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {dayLabels.map((day, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      filledDays[i]
                        ? 'bg-manah-bg dark:bg-manah-deep text-manah-cream dark:text-manah-cream'
                        : i > todayIdx
                        ? 'bg-manah-bg/10 text-manah-bg/30'
                        : 'bg-manah-bg/15 text-manah-bg/50'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Nivel */}
          <div data-tutorial="xp-card" className="bg-manah-card rounded-xl border border-manah-gold/15 p-3">
            {loading || !progress ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-manah-deep rounded w-4"></div>
                <div className="h-7 bg-manah-deep rounded"></div>
                <div className="h-3 bg-manah-deep rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 text-manah-gold mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <p className="text-xl font-bold text-manah-cream">Lv {currentLevel}</p>
                <p className="text-xs text-manah-muted mt-0.5">{totalXp} xp</p>
                <div className="w-full bg-manah-bg h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-manah-gold h-1 transition-all" style={{ width: `${xpPct}%` }} />
                </div>
              </>
            )}
          </div>

          {/* Meta */}
          <div data-tutorial="meta-card" className="bg-manah-card rounded-xl border border-manah-gold/15 p-3">
            {loading || !progress ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-manah-deep rounded w-4"></div>
                <div className="h-7 bg-manah-deep rounded"></div>
                <div className="h-3 bg-manah-deep rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 text-green-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <p className="text-xl font-bold text-manah-cream">{dailyProgress}/{dailyGoal}</p>
                <p className="text-xs text-manah-muted mt-0.5">capítulos</p>
                <div className="w-full bg-manah-bg h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-manah-gold h-1 transition-all" style={{ width: `${progress.dailyGoal.percentage}%` }} />
                </div>
              </>
            )}
          </div>

          {/* Tiempo */}
          <div data-tutorial="tiempo-card" className="bg-manah-card rounded-xl border border-manah-gold/15 p-3">
            {loading || !progress ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-manah-deep rounded w-4"></div>
                <div className="h-7 bg-manah-deep rounded"></div>
                <div className="h-3 bg-manah-deep rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 text-manah-muted mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                </svg>
                <p className="text-xl font-bold text-manah-cream">{displayMinutes}m {displaySeconds}s</p>
                <p className="text-xs text-manah-muted mt-0.5">tiempo hoy</p>
              </>
            )}
          </div>
        </div>

        {/* Acceso Rápido */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={
              progress?.lastRead?.camino
                ? `/camino/${progress.lastRead.camino.bookSlug}/${progress.lastRead.camino.chapterNumber}`
                : '/camino'
            }
            className="bg-manah-card rounded-xl border border-manah-gold/20 p-4 hover:border-manah-gold/50 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 bg-manah-deep rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1.5 4v1.5c0 .28.09.54.24.75l7.5 10A1 1 0 0 0 10 16.5h1.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4H15a1 1 0 0 0 .76-.25l7.5-10c.15-.21.24-.47.24-.75V4a.5.5 0 0 0-.5-.5H2a.5.5 0 0 0-.5.5zM3.5 5h17L14 13.5H10L3.5 5z"/>
              </svg>
            </div>
            <p className="font-bold text-sm text-manah-cream mb-1">Ruta bíblica</p>
            <p className="text-xs text-manah-muted">
              {progress?.lastRead?.camino
                ? `${progress.lastRead.camino.bookName} ${progress.lastRead.camino.chapterNumber} →`
                : 'Comienza tu camino →'}
            </p>
          </Link>

          <Link
            to={
              progress?.lastRead?.libre
                ? `/lectura-libre/${progress.lastRead.libre.bookSlug}/${progress.lastRead.libre.chapterNumber}`
                : '/lectura-libre'
            }
            className="bg-manah-card rounded-xl border border-manah-gold/20 p-4 hover:border-manah-gold/50 hover:shadow-lg transition-all"
          >
            <div className="w-10 h-10 bg-manah-gold/10 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
              </svg>
            </div>
            <p className="font-bold text-sm text-manah-cream mb-1">Lectura libre</p>
            <p className="text-xs text-manah-muted">
              {progress?.lastRead?.libre
                ? `${progress.lastRead.libre.bookName} ${progress.lastRead.libre.chapterNumber} →`
                : 'Explora 66 libros →'}
            </p>
          </Link>
        </div>
        </>
        )}

      </div>

      <OnboardingTour
        run={runOnboardingTour}
        onComplete={() => setRunOnboardingTour(false)}
      />
    </div>
  );
}


