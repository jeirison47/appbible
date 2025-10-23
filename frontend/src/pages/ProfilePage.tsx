import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { progressApi } from '../services/api';
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
    systemDailyGoal: number;
    personalDailyGoal: number | null;
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
  const [newGoal, setNewGoal] = useState<number | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [useSystemGoal, setUseSystemGoal] = useState(true);

  const isAdmin = roles.some((r) => r.name === 'admin');

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
      // Inicializar con la meta personal si existe, sino con la del sistema
      const hasPersonalGoal = data.data.user.personalDailyGoal !== null;
      setUseSystemGoal(!hasPersonalGoal);
      setNewGoal(hasPersonalGoal ? data.data.user.personalDailyGoal : data.data.user.systemDailyGoal);
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

  const handleSaveGoal = async () => {
    // Si usa meta del sistema, guardar null; sino guardar el valor seleccionado
    const goalToSave = useSystemGoal ? null : newGoal;

    if (!useSystemGoal && (newGoal! < 1 || newGoal! > 10)) {
      toast.error('La meta debe estar entre 1 y 10 capítulos');
      return;
    }

    setSavingGoal(true);
    try {
      await progressApi.updateDailyGoal(goalToSave!);
      toast.success(useSystemGoal
        ? 'Usando meta del sistema'
        : 'Meta personal actualizada exitosamente');
      setEditingGoal(false);
      // Recargar perfil para obtener datos actualizados
      await loadProfile();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar meta diaria');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleCancelEdit = () => {
    const hasPersonalGoal = profile?.user.personalDailyGoal !== null;
    setUseSystemGoal(!hasPersonalGoal);
    setNewGoal(hasPersonalGoal ? profile.user.personalDailyGoal : profile?.user.systemDailyGoal || 1);
    setEditingGoal(false);
  };

  const handleToggleGoalType = (useSystem: boolean) => {
    setUseSystemGoal(useSystem);
    if (useSystem) {
      setNewGoal(profile?.user.systemDailyGoal || 1);
    } else {
      setNewGoal(profile?.user.personalDailyGoal || 1);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Vista de Admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-6 mb-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {user?.displayName}
                </h2>
                <p className="text-gray-600 mb-2">{user?.email}</p>
                <div className="flex flex-wrap gap-2">
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
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Administrador desde {formatDate(user?.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Admin Info Card */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 mb-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">👑</span>
              <div>
                <h3 className="text-2xl font-bold">Panel de Administración</h3>
                <p className="opacity-90">Tienes acceso completo al sistema</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90">
                Como administrador, puedes gestionar usuarios, ver estadísticas del sistema y configurar parámetros globales desde el panel principal.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🚪</span>
              Cerrar Sesión
            </button>

            {/* Back to Home */}
            <Link
              to="/"
              className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg text-center"
            >
              Volver al Panel
            </Link>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
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
      </div>
    );
  }

  // Vista de Usuario Regular
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.displayName}
              </h2>
              <p className="text-gray-600 mb-2">{user?.email}</p>
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

          {/* Member Since */}
          {profile?.user?.createdAt && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Miembro desde {formatDate(profile.user.createdAt)}
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* XP & Level Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Experiencia y Nivel
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nivel Actual</span>
                <span className="text-2xl font-bold text-purple-600">
                  {profile?.user.currentLevel || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Experiencia Total</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {profile?.user.totalXp || 0} XP
                </span>
              </div>
            </div>
          </div>

          {/* Streaks Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Rachas de Lectura
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Racha Actual</span>
                <span className="text-2xl font-bold text-orange-600">
                  {profile?.user.currentStreak || 0} días
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Racha Más Larga</span>
                <span className="text-2xl font-bold text-red-600">
                  {profile?.user.longestStreak || 0} días
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Estadísticas de Lectura
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">Capítulos Leídos</p>
              <p className="text-4xl font-bold text-blue-600">
                {profile?.stats.totalChaptersRead || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">Libros Completados</p>
              <p className="text-4xl font-bold text-green-600">
                {profile?.stats.booksCompleted || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 font-medium mb-1">Libros en Progreso</p>
              <p className="text-4xl font-bold text-purple-600">
                {profile?.stats.booksInProgress || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Goals Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-2">
            <span className="text-2xl">🎯</span>
            Metas Diarias
          </h3>

          {/* Meta del Sistema Card - Solo Lectura */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>🎯</span>
                Meta del Sistema
              </h4>
              {profile?.user.personalDailyGoal === null && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  En uso
                </span>
              )}
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-1">
                {profile?.user.systemDailyGoal}
              </div>
              <p className="text-sm text-gray-600">
                {profile?.user.systemDailyGoal === 1 ? 'capítulo' : 'capítulos'} por día
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Configurado por el administrador. Aplica a todos los usuarios que no tengan meta personal.
              </p>
            </div>
          </div>

          {/* Meta Personal Card - Editable */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>⭐</span>
                Meta Personal
              </h4>
              <div className="flex items-center gap-2">
                {profile?.user.personalDailyGoal !== null && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    En uso
                  </span>
                )}
                {!editingGoal && (
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-semibold"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
            </div>

            {editingGoal ? (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-green-600 mb-1">
                    {newGoal || 1}
                  </div>
                  <p className="text-sm text-gray-600">
                    {(newGoal || 1) === 1 ? 'capítulo' : 'capítulos'} por día
                  </p>
                </div>

                {/* Controles para ajustar meta personal */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setNewGoal(Math.max(1, (newGoal || 1) - 1))}
                      className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-xl"
                      disabled={(newGoal || 1) <= 1}
                    >
                      −
                    </button>
                    <button
                      onClick={() => setNewGoal(Math.min(10, (newGoal || 1) + 1))}
                      className="w-12 h-12 bg-gray-200 rounded-full hover:bg-gray-300 transition font-bold text-xl"
                      disabled={(newGoal || 1) >= 10}
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
                        className={`py-2 px-3 rounded-lg font-semibold transition ${
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
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                    disabled={savingGoal}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      setSavingGoal(true);
                      try {
                        await progressApi.updateDailyGoal(newGoal || 1);
                        toast.success('Meta personal actualizada exitosamente');
                        setEditingGoal(false);
                        await loadProfile();
                      } catch (error: any) {
                        toast.error(error.message || 'Error al actualizar meta');
                      } finally {
                        setSavingGoal(false);
                      }
                    }}
                    disabled={savingGoal}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold disabled:opacity-50"
                  >
                    {savingGoal ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {profile?.user.personalDailyGoal !== null ? (
                  <>
                    <div className="text-5xl font-bold text-green-600 mb-1">
                      {profile.user.personalDailyGoal}
                    </div>
                    <p className="text-sm text-gray-600">
                      {profile.user.personalDailyGoal === 1 ? 'capítulo' : 'capítulos'} por día
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Esta es tu meta personalizada. Click en Editar para cambiarla.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl text-gray-400 mb-2">-</div>
                    <p className="text-sm text-gray-600 mb-2">No configurada</p>
                    <p className="text-xs text-gray-500">
                      Estás usando la meta del sistema. Click en Editar para establecer tu meta personal.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🚪</span>
            Cerrar Sesión
          </button>

          {/* Back to Home */}
          <Link
            to="/"
            className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg text-center"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
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
    </div>
  );
}
