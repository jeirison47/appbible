import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { progressApi, authApi } from '../services/api';
import { useInstallPWA } from '../hooks/useInstallPWA';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import { useTutorial } from '../contexts/TutorialContext';

interface ProfileData {
  user: {
    id: string;
    email: string;
    displayName: string;
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    dailyGoal: number;
    createdAt: string;
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
    minutesRead?: number; // Tiempo de lectura en segundos
  };
  streakGoal: {
    current: number | null;
    startedAt: string | null;
    lastCompleted: number | null;
    progress: number;
    canSetNew: boolean;
    xpPerDay: number;
  };
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const navigate = useNavigate();
  const { logout: auth0Logout, isAuthenticated } = useAuth0();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<number>(1);
  const [savingGoal, setSavingGoal] = useState(false);

  // Edición de meta de racha
  const [editingStreakGoal, setEditingStreakGoal] = useState(false);
  const [newStreakGoal, setNewStreakGoal] = useState<number>(10);
  const [savingStreakGoal, setSavingStreakGoal] = useState(false);

  // Tiempo de lectura
  const [seconds, setSeconds] = useState(0);

  // Edición de perfil
  const [editingProfile, setEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Cambio de contraseña
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Tutoriales
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const { resetTutorial } = useTutorial();

  const isAdmin = roles.some((r) => r.name === 'admin');
  const { isInstallable, installApp } = useInstallPWA();

  useEffect(() => {
    // Solo cargar perfil si no es admin
    if (!isAdmin) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadProfile = async () => {
    try {
      const data = await progressApi.getMyProgress();
      setProfile(data.data);
      setNewGoal(data.data.user.dailyGoal);

      // Actualizar tiempo de lectura
      if (data.data.dailyGoal?.minutesRead) {
        setSeconds(data.data.dailyGoal.minutesRead);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  };

  // Formatear tiempo de lectura
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const formattedTime = formatTime(seconds);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Limpiar store local
    logout();

    // Si está autenticado con Auth0, cerrar sesión en Auth0 también
    if (isAuthenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: `${window.location.origin}/login`
        }
      });
    } else {
      // Si no está autenticado con Auth0, solo redirigir
      navigate('/login');
    }
  };

  const handleCancelEdit = () => {
    setNewGoal(profile?.user.dailyGoal || 1);
    setEditingGoal(false);
  };

  const handleEditProfile = () => {
    setNewDisplayName(user?.displayName || '');
    setNewNickname(user?.nickname || '');
    setEditingProfile(true);
  };

  const handleCancelProfileEdit = () => {
    setNewDisplayName('');
    setNewNickname('');
    setEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    const isLocal = user?.authProvider === 'local';
    const updateData: { displayName?: string; nickname?: string } = {};

    // Validar nombre si es usuario local
    if (isLocal) {
      if (!newDisplayName.trim()) {
        toast.error('El nombre no puede estar vacío');
        return;
      }
      updateData.displayName = newDisplayName.trim();
    }

    // Validar nickname
    if (!newNickname.trim()) {
      toast.error('El nickname no puede estar vacío');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newNickname)) {
      toast.error('El nickname solo puede contener letras, números, guiones y guiones bajos');
      return;
    }

    if (newNickname.length < 3 || newNickname.length > 20) {
      toast.error('El nickname debe tener entre 3 y 20 caracteres');
      return;
    }

    updateData.nickname = newNickname;

    setSavingProfile(true);
    try {
      await authApi.updateProfile(updateData);
      updateUser(updateData);
      toast.success('Perfil actualizado exitosamente');
      setEditingProfile(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangingPassword(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Contraseña actualizada exitosamente');
      handleCancelPasswordChange();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Vista de Admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 pt-32">
        <Navbar />

        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-orange-600 mx-auto"></div>
              <p className="text-gray-600 mt-4 text-base sm:text-lg font-semibold">Cargando perfil...</p>
            </div>
          </div>
        ) : (
          <>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Avatar */}
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg object-cover border-4 border-orange-500"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                  {user?.displayName?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {user?.displayName}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2">{user?.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {roles.map((role) => (
                    <span
                      key={role.name}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold"
                    >
                      👑 {role.displayName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Administrador desde {formatDate(user?.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Admin Info Card */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="text-4xl sm:text-5xl">👑</span>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold">Panel de Administración</h3>
                <p className="text-sm sm:text-base opacity-90">Tienes acceso completo al sistema</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm opacity-90">
                Como administrador, puedes gestionar usuarios, ver estadísticas del sistema y configurar parámetros globales desde el panel principal.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Cerrar Sesión
            </button>

            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg text-center"
            >
              Volver al Panel
            </Link>

            {/* Install PWA Button */}
            {isInstallable && (
              <button
                onClick={installApp}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
              >
                <span className="text-xl sm:text-2xl">📱</span>
                Instalar Aplicación
              </button>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={showLogoutModal}
          title="Cerrar Sesión"
          message="¿Estás seguro que deseas cerrar sesión?"
          confirmText="Sí, cerrar sesión"
          cancelText="Cancelar"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
          type="danger"
        />
        </>
        )}
      </div>
    );
  }

  // Vista de Usuario Regular
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-32">
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-base sm:text-lg font-semibold">Cargando perfil...</p>
          </div>
        </div>
      ) : (
        <>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 relative">
          {!editingProfile ? (
            <>
              {/* Header con botón editar */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">👤</span>
                  Información Personal
                </h3>
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar
                </button>
              </div>

              {/* Vista normal */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Avatar */}
                <div className="flex justify-center lg:justify-start">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg object-cover border-4 border-indigo-500"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                      {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Info Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Nombre</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">{user?.displayName}</p>
                  </div>

                  {/* Nickname */}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Nickname</p>
                    <p className="text-lg sm:text-xl font-bold text-indigo-600">@{user?.nickname || 'sin_nickname'}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-sm sm:text-base text-gray-700">{user?.email}</p>
                  </div>

                  {/* Rol */}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Rol</p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <span
                          key={role.name}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
                        >
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con fecha */}
              {profile?.user?.createdAt && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                    Miembro desde {formatDate(profile.user.createdAt)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Vista de edición */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Perfil</h3>

                {/* Nombre (solo si es local) */}
                {user?.authProvider === 'local' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                )}

                {user?.authProvider === 'auth0' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> No puedes cambiar tu nombre porque te registraste con Google. Solo puedes actualizar tu nickname.
                    </p>
                  </div>
                )}

                {/* Nickname (todos) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="tu_nickname"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    3-20 caracteres. Solo letras, números, guiones (-) y guiones bajos (_)
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={handleCancelProfileEdit}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                    disabled={savingProfile}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                  >
                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* XP & Level Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">⭐</span>
              Experiencia y Nivel
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Nivel Actual</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-600">
                  {profile?.user.currentLevel || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Experiencia Total</span>
                <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                  {profile?.user.totalXp || 0} XP
                </span>
              </div>
            </div>
          </div>

          {/* Streaks Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🔥</span>
              Rachas de Lectura
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Racha Actual</span>
                <span className="text-xl sm:text-2xl font-bold text-orange-600">
                  {profile?.user.currentStreak || 0} días
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Racha Más Larga</span>
                <span className="text-xl sm:text-2xl font-bold text-red-600">
                  {profile?.user.longestStreak || 0} días
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Timer Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Tiempo de Lectura Hoy</h3>
              <p className="text-xs sm:text-sm text-gray-600">Acumula tiempo y gana XP cada 10 minutos</p>
            </div>
            <span className="text-3xl sm:text-4xl">⏱️</span>
          </div>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 text-center">
            {formattedTime}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
            Sigue leyendo para ganar más XP
          </p>
        </div>

        {/* Goals Section */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 px-1 sm:px-2">
            <span className="text-xl sm:text-2xl">🎯</span>
            Metas
          </h3>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Meta Diaria Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>⭐</span>
                  Meta Diaria
                </h4>
                {!editingGoal && (
                  <button
                    onClick={() => {
                      setNewGoal(profile?.user.dailyGoal || 1);
                      setEditingGoal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editar
                  </button>
                )}
              </div>

              {editingGoal ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-1">
                      {newGoal}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {newGoal === 1 ? 'capítulo' : 'capítulos'} por día
                    </p>
                  </div>

                  {/* Controles para ajustar meta */}
                  <div className="space-y-3">
                    {/* Input directo de número */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4">
                      <button
                        onClick={() => setNewGoal(Math.max(1, newGoal - 1))}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-lg sm:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={newGoal <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={newGoal}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1) {
                            setNewGoal(value);
                          }
                        }}
                        className="w-20 sm:w-24 text-center text-2xl sm:text-3xl font-bold border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-green-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setNewGoal(newGoal + 1)}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-lg sm:text-xl"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Goal Options */}
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 5, 10].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setNewGoal(goal)}
                          className={`py-2 px-2 sm:px-3 rounded-lg font-semibold text-sm sm:text-base transition ${
                            newGoal === goal
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold text-sm sm:text-base"
                      disabled={savingGoal}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        setSavingGoal(true);
                        try {
                          await progressApi.updateDailyGoal(newGoal);
                          toast.success('Meta diaria actualizada exitosamente');
                          setEditingGoal(false);
                          await loadProfile();
                        } catch (error: any) {
                          toast.error(error.message || 'Error al actualizar meta');
                        } finally {
                          setSavingGoal(false);
                        }
                      }}
                      disabled={savingGoal}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold text-sm sm:text-base disabled:opacity-50"
                    >
                      {savingGoal ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">
                      {profile?.user.dailyGoal} {profile?.user.dailyGoal === 1 ? 'Capítulo' : 'Capítulos'}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Meta diaria en progreso
                    </p>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{profile?.dailyGoal?.progress || 0} {(profile?.dailyGoal?.progress || 0) === 1 ? 'capítulo' : 'capítulos'}</span>
                      <span>{Math.floor(((profile?.dailyGoal?.progress || 0) / (profile?.user.dailyGoal || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(Math.floor(((profile?.dailyGoal?.progress || 0) / (profile?.user.dailyGoal || 1)) * 100), 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {profile?.dailyGoal?.completed
                        ? '¡Meta del día cumplida! ✨'
                        : `Te faltan ${(profile?.user.dailyGoal || 1) - (profile?.dailyGoal?.progress || 0)} ${((profile?.user.dailyGoal || 1) - (profile?.dailyGoal?.progress || 0)) === 1 ? 'capítulo' : 'capítulos'} para completar tu meta`}
                    </p>
                  </div>

                  {/* Recompensa - solo si no está completa */}
                  {!profile?.dailyGoal?.completed && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-yellow-800 font-semibold">
                        Recompensa: 100 XP ⭐
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Meta de Racha Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-200">
              {profile?.streakGoal?.current && !profile.streakGoal.canSetNew ? (
                // Vista de meta activa
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                      <span>🔥</span>
                      Meta Activa
                    </h4>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-4xl sm:text-5xl font-bold text-orange-600 mb-2">
                      {profile.streakGoal.current} días
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Meta de racha en progreso
                    </p>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{profile.user.currentStreak} días</span>
                      <span>{profile.streakGoal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(profile.streakGoal.progress, 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {profile.user.currentStreak >= profile.streakGoal.current
                        ? '¡Meta cumplida! 🎉 Puedes establecer una nueva meta.'
                        : `Te faltan ${profile.streakGoal.current - profile.user.currentStreak} días para completar tu meta`}
                    </p>
                  </div>

                  {/* Recompensa - solo si no está cumplida */}
                  {profile.user.currentStreak < profile.streakGoal.current && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-yellow-800 font-semibold">
                        Recompensa: {profile.streakGoal.current * (profile.streakGoal.xpPerDay || 50)} XP ⭐
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Vista de establecer nueva meta
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                      <span>🎯</span>
                      Meta de Racha
                    </h4>
                    {!editingStreakGoal && profile?.streakGoal?.canSetNew && (
                      <button
                        onClick={() => {
                          const minGoal = Math.max(
                            (profile?.user.currentStreak || 0) + 1,
                            (profile?.streakGoal?.lastCompleted || 0) + 1,
                            10
                          );
                          setNewStreakGoal(minGoal);
                          setEditingStreakGoal(true);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Establecer
                      </button>
                    )}
                  </div>

                  {editingStreakGoal ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs sm:text-sm text-blue-800">
                          <strong>Racha actual:</strong> {profile?.user.currentStreak || 0} días
                          {profile?.streakGoal?.lastCompleted && (
                            <> • <strong>Última meta cumplida:</strong> {profile.streakGoal.lastCompleted} días</>
                          )}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Tu nueva meta debe ser mayor a tu racha actual y a tu última meta cumplida.
                        </p>
                      </div>

                      <div className="text-center mb-3 sm:mb-4">
                        <div className="text-4xl sm:text-5xl font-bold text-orange-600 mb-1">
                          {newStreakGoal}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          días de racha
                        </p>
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Recompensa: {newStreakGoal * (profile?.streakGoal?.xpPerDay || 50)} XP
                        </p>
                      </div>

                      {/* Controles para ajustar meta */}
                      <div className="space-y-3">
                        {/* Input directo de número */}
                        <div className="flex items-center justify-center gap-3 sm:gap-4">
                          <button
                            onClick={() => {
                              const minGoal = Math.max(
                                (profile?.user.currentStreak || 0) + 1,
                                (profile?.streakGoal?.lastCompleted || 0) + 1,
                                10
                              );
                              setNewStreakGoal(Math.max(minGoal, newStreakGoal - 5));
                            }}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-lg sm:text-xl"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="10"
                            value={newStreakGoal}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 10) {
                                setNewStreakGoal(value);
                              }
                            }}
                            className="w-20 sm:w-24 text-center text-2xl sm:text-3xl font-bold border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-orange-500 focus:outline-none"
                          />
                          <button
                            onClick={() => setNewStreakGoal(newStreakGoal + 5)}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-lg sm:text-xl"
                          >
                            +
                          </button>
                        </div>

                        {/* Quick Goal Options */}
                        <div className="grid grid-cols-5 gap-2">
                          {[10, 20, 30, 50, 100].map((goal) => (
                            <button
                              key={goal}
                              onClick={() => setNewStreakGoal(goal)}
                              className={`py-2 px-2 sm:px-3 rounded-lg font-semibold text-sm sm:text-base transition ${
                                newStreakGoal === goal
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {goal}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
                        <button
                          onClick={() => setEditingStreakGoal(false)}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold text-sm sm:text-base"
                          disabled={savingStreakGoal}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={async () => {
                            const minGoal = Math.max(
                              (profile?.user.currentStreak || 0) + 1,
                              (profile?.streakGoal?.lastCompleted || 0) + 1
                            );

                            if (newStreakGoal < minGoal) {
                              toast.error(
                                `La meta debe ser mayor a ${minGoal - 1} días`
                              );
                              return;
                            }

                            setSavingStreakGoal(true);
                            try {
                              await progressApi.setStreakGoal(newStreakGoal);
                              toast.success('Meta de racha establecida exitosamente');
                              setEditingStreakGoal(false);
                              await loadProfile();
                            } catch (error: any) {
                              toast.error(error.message || 'Error al establecer meta de racha');
                            } finally {
                              setSavingStreakGoal(false);
                            }
                          }}
                          disabled={savingStreakGoal}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-semibold text-sm sm:text-base disabled:opacity-50"
                        >
                          {savingStreakGoal ? 'Guardando...' : 'Establecer Meta'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      {profile?.streakGoal?.lastCompleted ? (
                        <>
                          <div className="text-2xl mb-2">🎉</div>
                          <p className="text-sm text-gray-700 font-semibold mb-1">
                            ¡Última meta completada: {profile.streakGoal.lastCompleted} días!
                          </p>
                          <p className="text-xs text-gray-600">
                            Click en "Establecer" para crear una nueva meta mayor.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-3xl mb-2">🎯</div>
                          <p className="text-sm text-gray-700 font-semibold mb-1">
                            No tienes una meta de racha activa
                          </p>
                          <p className="text-xs text-gray-600">
                            Establece una meta de días consecutivos y gana XP al completarla.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section - Solo para usuarios locales */}
        {user?.authProvider === 'local' && (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 px-1 sm:px-2">
              <span className="text-xl sm:text-2xl">🔒</span>
              Seguridad
            </h3>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-red-200">
              {!changingPassword ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-800">
                        Contraseña
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Cambia tu contraseña de acceso
                      </p>
                    </div>
                    <button
                      onClick={() => setChangingPassword(true)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs sm:text-sm font-semibold"
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-gray-400 mb-1">••••••••</div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                    Cambiar Contraseña
                  </h4>

                  {/* Contraseña Actual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={handleCancelPasswordChange}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                      disabled={savingPassword}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
                    >
                      {savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 sm:space-y-4">
          {/* Install PWA Button */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
            >
              <span className="text-xl sm:text-2xl">📱</span>
              Instalar Aplicación
            </button>
          )}

          {/* Tutorial Help Button */}
          <button
            onClick={() => setShowTutorialMenu(!showTutorialMenu)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
          >
            <span className="text-xl sm:text-2xl">❓</span>
            Ayuda y Tutoriales
          </button>

          {/* Tutorial Menu */}
          {showTutorialMenu && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 border-2 border-purple-200 space-y-3">
              <h3 className="font-bold text-lg text-purple-900 mb-3">Tutoriales Disponibles</h3>

              <div className="w-full bg-purple-100 hover:bg-purple-200 text-purple-900 py-3 px-4 rounded-lg font-semibold transition flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-bold">Tutorial de Bienvenida</div>
                    <div className="text-sm text-purple-700">Aprende lo básico de la app</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await resetTutorial('onboarding');
                    setShowTutorialMenu(false);
                    navigate('/');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                >
                  Iniciar
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>

              <div className="text-center text-sm text-gray-500 mt-3 pt-3 border-t">
                Más tutoriales próximamente...
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        type="danger"
      />
      </>
      )}
    </div>
  );
}
