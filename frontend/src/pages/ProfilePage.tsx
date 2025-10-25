import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { progressApi } from '../services/api';
import { useInstallPWA } from '../hooks/useInstallPWA';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

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
  };
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<number>(1);
  const [savingGoal, setSavingGoal] = useState(false);

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
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancelEdit = () => {
    setNewGoal(profile?.user.dailyGoal || 1);
    setEditingGoal(false);
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                {user?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>

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
              <span className="text-xl sm:text-2xl">🚪</span>
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>

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
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
                  >
                    {role.displayName}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Member Since */}
          {profile?.user?.createdAt && (
            <div className="border-t border-gray-200 pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Miembro desde {formatDate(profile.user.createdAt)}
              </p>
            </div>
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

        {/* Daily Goal Section */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 px-1 sm:px-2">
            <span className="text-xl sm:text-2xl">🎯</span>
            Meta Diaria
          </h3>

          {/* Meta Diaria Card - Editable */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>⭐</span>
                Tu Meta
              </h4>
              {!editingGoal && (
                <button
                  onClick={() => {
                    setNewGoal(profile?.user.dailyGoal || 1);
                    setEditingGoal(true);
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-xs sm:text-sm font-semibold"
                >
                  ✏️ Editar
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
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-1">
                  {profile?.user.dailyGoal}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {profile?.user.dailyGoal === 1 ? 'capítulo' : 'capítulos'} por día
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Esta es tu meta diaria. Click en Editar para cambiarla.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3"
          >
            <span className="text-xl sm:text-2xl">🚪</span>
            Cerrar Sesión
          </button>

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
