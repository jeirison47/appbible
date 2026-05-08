import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { progressApi, authApi } from '../services/api';
import { BIBLE_VERSIONS, normalizeVersion, DEFAULT_VERSION } from '../utils/bibleVersions';
import { useInstallPWA } from '../hooks/useInstallPWA';
import ConfirmModal from '../components/ConfirmModal';
import LoadingScreen from '../components/LoadingScreen';
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
    minutesRead?: number;
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

  const [editingStreakGoal, setEditingStreakGoal] = useState(false);
  const [newStreakGoal, setNewStreakGoal] = useState<number>(10);
  const [savingStreakGoal, setSavingStreakGoal] = useState(false);

  const [seconds, setSeconds] = useState(0);

  const [editingProfile, setEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const rawBibleVersion = normalizeVersion(user?.settings?.bibleVersion || DEFAULT_VERSION);
  const [selectedBibleVersion, setSelectedBibleVersion] = useState(rawBibleVersion);
  const [savingBibleVersion, setSavingBibleVersion] = useState(false);

  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const { resetTutorial } = useTutorial();

  const isAdmin = roles.some((r) => r.name === 'admin');
  const { isInstallable, installApp } = useInstallPWA();

  useEffect(() => {
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
      if (data.data.dailyGoal?.minutesRead) {
        setSeconds(data.data.dailyGoal.minutesRead);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const formattedTime = formatTime(seconds);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    logout();
    if (isAuthenticated) {
      auth0Logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
    } else {
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

    if (isLocal) {
      if (!newDisplayName.trim()) { toast.error('El nombre no puede estar vacío'); return; }
      updateData.displayName = newDisplayName.trim();
    }

    if (!newNickname.trim()) { toast.error('El nickname no puede estar vacío'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(newNickname)) {
      toast.error('El nickname solo puede contener letras, números, guiones y guiones bajos'); return;
    }
    if (newNickname.length < 3 || newNickname.length > 20) {
      toast.error('El nickname debe tener entre 3 y 20 caracteres'); return;
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
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setChangingPassword(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos los campos son requeridos'); return;
    }
    if (newPassword.length < 6) { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }

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

  const handleSaveBibleVersion = async () => {
    setSavingBibleVersion(true);
    try {
      await authApi.updateSettings({ bibleVersion: selectedBibleVersion });
      updateUser({ settings: { ...(user?.settings as any), bibleVersion: selectedBibleVersion } });
      toast.success('Versión bíblica actualizada');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la versión');
    } finally {
      setSavingBibleVersion(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Vista de Admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-manah-bg font-manrope pt-16 sm:pt-32 pb-24">
        <Navbar />

        {loading ? (
          <LoadingScreen fullScreen={false} text="Cargando perfil..." />
        ) : (
          <>
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
              {/* Profile Header Card */}
              <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg object-cover border-4 border-manah-gold"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-manah-deep rounded-full flex items-center justify-center text-manah-cream text-3xl sm:text-4xl font-bold shadow-lg border-2 border-manah-gold/30">
                      {user?.displayName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-manah-cream mb-2">
                      {user?.displayName}
                    </h2>
                    <p className="text-sm sm:text-base text-manah-muted mb-2">{user?.email}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {roles.map((role) => (
                        <span key={role.name} className="px-3 py-1 bg-manah-gold/20 text-manah-gold rounded-xl text-sm font-semibold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                          </svg>
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-manah-gold/10 pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm text-manah-muted/60 text-center sm:text-left">
                    Administrador desde {formatDate(user?.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>

              {/* Admin Info Card */}
              <div className="bg-manah-deep rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 border border-manah-gold/20">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <svg className="w-12 h-12 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                  </svg>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-manah-cream">Panel de Administración</h3>
                    <p className="text-sm sm:text-base text-manah-muted">Tienes acceso completo al sistema</p>
                  </div>
                </div>
                <div className="bg-manah-bg/50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-manah-muted">
                    Como administrador, puedes gestionar usuarios, ver estadísticas del sistema y configurar parámetros globales desde el panel principal.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Cerrar Sesión
                </button>

                <Link to="/" className="block w-full bg-manah-deep text-manah-cream py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-manah-deep/80 transition-all shadow-md hover:shadow-lg text-center border border-manah-gold/20">
                  Volver al Panel
                </Link>

                {isInstallable && (
                  <button onClick={installApp}
                    className="w-full bg-manah-gold text-manah-bg py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-manah-bronze transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l3.2-3.2-3.2-3.2v1.75H9v3h3.8z"/>
                    </svg>
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
    <div className="min-h-screen bg-manah-bg font-manrope pt-16 sm:pt-32 pb-24">
      <Navbar />

      {loading ? (
        <LoadingScreen fullScreen={false} text="Cargando perfil..." />
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
            {/* Profile Header Card */}
            <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 relative">
              {!editingProfile ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-manah-cream flex items-center gap-2">
                      <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                      Información Personal
                    </h3>
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex justify-center lg:justify-start">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg object-cover border-4 border-manah-gold"
                        />
                      ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-manah-deep rounded-full flex items-center justify-center text-manah-cream text-4xl sm:text-5xl font-bold shadow-lg border-2 border-manah-gold/30">
                          {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-manah-muted/60 mb-1">Nombre</p>
                        <p className="text-lg sm:text-xl font-bold text-manah-cream">{user?.displayName}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-manah-muted/60 mb-1">Nickname</p>
                        <p className="text-lg sm:text-xl font-bold text-manah-gold">@{user?.nickname || 'sin_nickname'}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-manah-muted/60 mb-1">Email</p>
                        <p className="text-sm sm:text-base text-manah-muted">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-manah-muted/60 mb-1">Rol</p>
                        <div className="flex flex-wrap gap-2">
                          {roles.map((role) => (
                            <span key={role.name} className="px-3 py-1 bg-manah-gold/20 text-manah-gold rounded-xl text-sm font-semibold">
                              {role.displayName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {profile?.user?.createdAt && (
                    <div className="mt-6 pt-4 border-t border-manah-gold/10">
                      <p className="text-xs sm:text-sm text-manah-muted/60 text-center sm:text-left">
                        Miembro desde {formatDate(profile.user.createdAt)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-manah-cream mb-4">Editar Perfil</h3>

                  {user?.authProvider === 'local' && (
                    <div>
                      <label className="block text-sm font-medium text-manah-muted mb-2">Nombre Completo</label>
                      <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-manah-gold/30 bg-manah-bg text-manah-cream placeholder-manah-muted/50 rounded-xl focus:border-manah-gold focus:outline-none"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  )}

                  {user?.authProvider === 'auth0' && (
                    <div className="bg-manah-deep border border-manah-gold/20 rounded-xl p-3">
                      <p className="text-sm text-manah-muted">
                        <strong className="text-manah-gold">Nota:</strong> No puedes cambiar tu nombre porque te registraste con Google. Solo puedes actualizar tu nickname.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-manah-muted mb-2">Nickname</label>
                    <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-manah-gold/30 bg-manah-bg text-manah-cream placeholder-manah-muted/50 rounded-xl focus:border-manah-gold focus:outline-none"
                      placeholder="tu_nickname" maxLength={20}
                    />
                    <p className="text-xs text-manah-muted/60 mt-1">
                      3-20 caracteres. Solo letras, números, guiones (-) y guiones bajos (_)
                    </p>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button onClick={handleCancelProfileEdit} disabled={savingProfile}
                      className="flex-1 px-4 py-2 bg-manah-deep text-manah-cream rounded-xl hover:bg-manah-deep/80 transition font-semibold cursor-pointer"
                    >Cancelar</button>
                    <button onClick={handleSaveProfile} disabled={savingProfile}
                      className="flex-1 px-4 py-2 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold disabled:opacity-50 cursor-pointer"
                    >{savingProfile ? 'Guardando...' : 'Guardar Cambios'}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* XP & Level */}
              <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  Experiencia y Nivel
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-manah-muted">Nivel Actual</span>
                    <span className="text-xl sm:text-2xl font-bold text-manah-gold">
                      {profile?.user.currentLevel || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-manah-muted">Experiencia Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-manah-gold">
                      {profile?.user.totalXp || 0} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Streaks */}
              <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
                  </svg>
                  Rachas de Lectura
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-manah-muted">Racha Actual</span>
                    <span className="text-xl sm:text-2xl font-bold text-manah-gold">
                      {profile?.user.currentStreak || 0} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-manah-muted">Racha Más Larga</span>
                    <span className="text-xl sm:text-2xl font-bold text-manah-cream">
                      {profile?.user.longestStreak || 0} días
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reading Timer */}
            <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 border-t-4 border-manah-gold">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-manah-cream">Tiempo de Lectura Hoy</h3>
                  <p className="text-xs sm:text-sm text-manah-muted">Acumula tiempo y gana XP cada 10 minutos</p>
                </div>
                <svg className="w-9 h-9 sm:w-10 sm:h-10 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                </svg>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-manah-gold text-center">
                {formattedTime}
              </p>
              <p className="text-xs sm:text-sm text-manah-muted/60 mt-2 text-center">
                Sigue leyendo para ganar más XP
              </p>
            </div>

            {/* Goals */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-manah-cream flex items-center gap-2 px-1 sm:px-2">
                <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.53-11.03L10 14.5l-1.53-1.53-1.06 1.06L10 16.62l6.59-6.59-1.06-1.06z"/>
                </svg>
                Metas
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Meta Diaria */}
                <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-manah-gold/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base sm:text-lg font-bold text-manah-cream flex items-center gap-2">
                      <svg className="w-5 h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      Meta Diaria
                    </h4>
                    {!editingGoal && (
                      <button onClick={() => { setNewGoal(profile?.user.dailyGoal || 1); setEditingGoal(true); }}
                        className="px-4 py-2 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold text-sm flex items-center gap-2 cursor-pointer"
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
                        <div className="text-4xl sm:text-5xl font-bold text-manah-gold mb-1">{newGoal}</div>
                        <p className="text-xs sm:text-sm text-manah-muted">{newGoal === 1 ? 'capítulo' : 'capítulos'} por día</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3 sm:gap-4">
                          <button onClick={() => setNewGoal(Math.max(1, newGoal - 1))} disabled={newGoal <= 1}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-manah-deep rounded-full hover:bg-manah-deep/80 transition font-bold text-lg sm:text-xl disabled:opacity-50 text-manah-cream cursor-pointer"
                          >−</button>
                          <input type="number" min="1" value={newGoal}
                            onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setNewGoal(v); }}
                            className="w-20 sm:w-24 text-center text-2xl sm:text-3xl font-bold border-2 border-manah-gold/30 bg-manah-bg text-manah-cream rounded-xl px-2 py-1 focus:border-manah-gold focus:outline-none"
                          />
                          <button onClick={() => setNewGoal(newGoal + 1)}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-manah-deep rounded-full hover:bg-manah-deep/80 transition font-bold text-lg sm:text-xl text-manah-cream cursor-pointer"
                          >+</button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 5, 10].map((goal) => (
                            <button key={goal} onClick={() => setNewGoal(goal)}
                              className={`py-2 px-2 sm:px-3 rounded-xl font-semibold text-sm sm:text-base transition cursor-pointer ${newGoal === goal ? 'bg-manah-gold text-manah-bg' : 'bg-manah-deep text-manah-cream hover:bg-manah-gold/10'}`}
                            >{goal}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
                        <button onClick={handleCancelEdit} disabled={savingGoal}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-manah-deep text-manah-cream rounded-xl hover:bg-manah-deep/80 transition font-semibold text-sm sm:text-base cursor-pointer"
                        >Cancelar</button>
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
                            } finally { setSavingGoal(false); }
                          }}
                          disabled={savingGoal}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold text-sm sm:text-base disabled:opacity-50 cursor-pointer"
                        >{savingGoal ? 'Guardando...' : 'Guardar'}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-4xl sm:text-5xl font-bold text-manah-gold mb-2">
                          {profile?.user.dailyGoal} {profile?.user.dailyGoal === 1 ? 'Capítulo' : 'Capítulos'}
                        </div>
                        <p className="text-xs sm:text-sm text-manah-muted">Meta diaria en progreso</p>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-manah-muted mb-1">
                          <span>{profile?.dailyGoal?.progress || 0} {(profile?.dailyGoal?.progress || 0) === 1 ? 'capítulo' : 'capítulos'}</span>
                          <span>{Math.floor(((profile?.dailyGoal?.progress || 0) / (profile?.user.dailyGoal || 1)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-manah-bg h-3">
                          <div className="bg-manah-gold h-3 transition-all duration-300"
                            style={{ width: `${Math.min(Math.floor(((profile?.dailyGoal?.progress || 0) / (profile?.user.dailyGoal || 1)) * 100), 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-manah-muted/60 mt-2 text-center">
                          {profile?.dailyGoal?.completed ? '¡Meta del día cumplida!'
                            : `Te faltan ${(profile?.user.dailyGoal || 1) - (profile?.dailyGoal?.progress || 0)} ${((profile?.user.dailyGoal || 1) - (profile?.dailyGoal?.progress || 0)) === 1 ? 'capítulo' : 'capítulos'} para completar tu meta`}
                        </p>
                      </div>
                      {!profile?.dailyGoal?.completed && (
                        <div className="bg-manah-deep border border-manah-gold/20 rounded-xl p-3 text-center">
                          <p className="text-sm text-manah-gold font-semibold">Recompensa: 100 XP</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Meta de Racha */}
                <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-900/40">
                  {profile?.streakGoal?.current && !profile.streakGoal.canSetNew ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base sm:text-lg font-bold text-manah-cream flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67z"/>
                          </svg>
                          Meta Activa
                        </h4>
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-4xl sm:text-5xl font-bold text-manah-gold mb-2">{profile.streakGoal.current} días</div>
                        <p className="text-xs sm:text-sm text-manah-muted">Meta de racha en progreso</p>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-manah-muted mb-1">
                          <span>{profile.user.currentStreak} días</span>
                          <span>{profile.streakGoal.progress}%</span>
                        </div>
                        <div className="w-full bg-manah-bg h-3">
                          <div className="bg-manah-gold h-3 transition-all duration-300"
                            style={{ width: `${Math.min(profile.streakGoal.progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-manah-muted/60 mt-2 text-center">
                          {profile.user.currentStreak >= profile.streakGoal.current
                            ? '¡Meta cumplida! Puedes establecer una nueva meta.'
                            : `Te faltan ${profile.streakGoal.current - profile.user.currentStreak} días para completar tu meta`}
                        </p>
                      </div>
                      {profile.user.currentStreak < profile.streakGoal.current && (
                        <div className="bg-manah-deep border border-manah-gold/20 rounded-xl p-3 text-center">
                          <p className="text-sm text-manah-gold font-semibold">
                            Recompensa: {profile.streakGoal.current * (profile.streakGoal.xpPerDay || 50)} XP
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base sm:text-lg font-bold text-manah-cream flex items-center gap-2">
                          <svg className="w-5 h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.53-11.03L10 14.5l-1.53-1.53-1.06 1.06L10 16.62l6.59-6.59-1.06-1.06z"/>
                          </svg>
                          Meta de Racha
                        </h4>
                        {!editingStreakGoal && profile?.streakGoal?.canSetNew && (
                          <button
                            onClick={() => {
                              const minGoal = Math.max((profile?.user.currentStreak || 0) + 1, (profile?.streakGoal?.lastCompleted || 0) + 1, 10);
                              setNewStreakGoal(minGoal);
                              setEditingStreakGoal(true);
                            }}
                            className="px-4 py-2 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold text-sm flex items-center gap-2 cursor-pointer"
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
                          <div className="bg-manah-deep border border-manah-gold/10 rounded-xl p-3 mb-3">
                            <p className="text-xs sm:text-sm text-manah-muted">
                              <strong className="text-manah-cream">Racha actual:</strong> {profile?.user.currentStreak || 0} días
                              {profile?.streakGoal?.lastCompleted && (<> · <strong className="text-manah-cream">Última meta cumplida:</strong> {profile.streakGoal.lastCompleted} días</>)}
                            </p>
                            <p className="text-xs text-manah-muted/60 mt-1">Tu nueva meta debe ser mayor a tu racha actual y a tu última meta cumplida.</p>
                          </div>
                          <div className="text-center mb-3 sm:mb-4">
                            <div className="text-4xl sm:text-5xl font-bold text-manah-gold mb-1">{newStreakGoal}</div>
                            <p className="text-xs sm:text-sm text-manah-muted">días de racha</p>
                            <p className="text-xs text-manah-gold font-semibold mt-1">
                              Recompensa: {newStreakGoal * (profile?.streakGoal?.xpPerDay || 50)} XP
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-3 sm:gap-4">
                              <button
                                onClick={() => { const min = Math.max((profile?.user.currentStreak || 0) + 1, (profile?.streakGoal?.lastCompleted || 0) + 1, 10); setNewStreakGoal(Math.max(min, newStreakGoal - 5)); }}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-manah-deep rounded-full hover:bg-manah-deep/80 transition font-bold text-lg sm:text-xl text-manah-cream cursor-pointer"
                              >−</button>
                              <input type="number" min="10" value={newStreakGoal}
                                onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 10) setNewStreakGoal(v); }}
                                className="w-20 sm:w-24 text-center text-2xl sm:text-3xl font-bold border-2 border-manah-gold/30 bg-manah-bg text-manah-cream rounded-xl px-2 py-1 focus:border-manah-gold focus:outline-none"
                              />
                              <button onClick={() => setNewStreakGoal(newStreakGoal + 5)}
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-manah-deep rounded-full hover:bg-manah-deep/80 transition font-bold text-lg sm:text-xl text-manah-cream cursor-pointer"
                              >+</button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              {[10, 20, 30, 50, 100].map((goal) => (
                                <button key={goal} onClick={() => setNewStreakGoal(goal)}
                                  className={`py-2 px-2 sm:px-3 rounded-xl font-semibold text-sm sm:text-base transition cursor-pointer ${newStreakGoal === goal ? 'bg-manah-gold text-manah-bg' : 'bg-manah-deep text-manah-cream hover:bg-manah-deep/80'}`}
                                >{goal}</button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
                            <button onClick={() => setEditingStreakGoal(false)} disabled={savingStreakGoal}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-manah-deep text-manah-cream rounded-xl hover:bg-manah-deep/80 transition font-semibold text-sm sm:text-base cursor-pointer"
                            >Cancelar</button>
                            <button
                              onClick={async () => {
                                const minGoal = Math.max((profile?.user.currentStreak || 0) + 1, (profile?.streakGoal?.lastCompleted || 0) + 1);
                                if (newStreakGoal < minGoal) { toast.error(`La meta debe ser mayor a ${minGoal - 1} días`); return; }
                                setSavingStreakGoal(true);
                                try {
                                  await progressApi.setStreakGoal(newStreakGoal);
                                  toast.success('Meta de racha establecida exitosamente');
                                  setEditingStreakGoal(false);
                                  await loadProfile();
                                } catch (error: any) {
                                  toast.error(error.message || 'Error al establecer meta de racha');
                                } finally { setSavingStreakGoal(false); }
                              }}
                              disabled={savingStreakGoal}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold text-sm sm:text-base disabled:opacity-50 cursor-pointer"
                            >{savingStreakGoal ? 'Guardando...' : 'Establecer Meta'}</button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          {profile?.streakGoal?.lastCompleted ? (
                            <>
                              <div className="flex justify-center mb-2">
                                <svg className="w-10 h-10 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                              </div>
                              <p className="text-sm text-manah-cream font-semibold mb-1">
                                ¡Última meta completada: {profile.streakGoal.lastCompleted} días!
                              </p>
                              <p className="text-xs text-manah-muted">Click en "Establecer" para crear una nueva meta mayor.</p>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-center mb-2">
                                <svg className="w-10 h-10 text-manah-muted/40" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.53-11.03L10 14.5l-1.53-1.53-1.06 1.06L10 16.62l6.59-6.59-1.06-1.06z"/>
                                </svg>
                              </div>
                              <p className="text-sm text-manah-cream font-semibold mb-1">No tienes una meta de racha activa</p>
                              <p className="text-xs text-manah-muted">Establece una meta de días consecutivos y gana XP al completarla.</p>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Seguridad - Solo local */}
            {user?.authProvider === 'local' && (
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-manah-cream flex items-center gap-2 px-1 sm:px-2">
                  <svg className="w-6 h-6 text-manah-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  Seguridad
                </h3>
                <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-manah-gold/10">
                  {!changingPassword ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-manah-cream">Contraseña</h4>
                          <p className="text-xs sm:text-sm text-manah-muted">Cambia tu contraseña de acceso</p>
                        </div>
                        <button onClick={() => setChangingPassword(true)}
                          className="px-3 py-1 bg-manah-deep text-manah-cream rounded-xl hover:bg-manah-deep/80 transition text-xs sm:text-sm font-semibold cursor-pointer"
                        >Cambiar</button>
                      </div>
                      <div className="text-center"><div className="text-2xl text-manah-muted/40">••••••••</div></div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-base sm:text-lg font-bold text-manah-cream mb-3">Cambiar Contraseña</h4>
                      {[
                        { label: 'Contraseña Actual', value: currentPassword, setter: setCurrentPassword },
                        { label: 'Nueva Contraseña', value: newPassword, setter: setNewPassword, hint: 'Mínimo 6 caracteres' },
                        { label: 'Confirmar Nueva Contraseña', value: confirmPassword, setter: setConfirmPassword },
                      ].map(({ label, value, setter, hint }) => (
                        <div key={label}>
                          <label className="block text-sm font-medium text-manah-muted mb-2">{label}</label>
                          <input type="password" value={value} onChange={(e) => setter(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-manah-gold/30 bg-manah-bg text-manah-cream placeholder-manah-muted/50 rounded-xl focus:border-manah-gold focus:outline-none"
                            placeholder="••••••••"
                          />
                          {hint && <p className="text-xs text-manah-muted/60 mt-1">{hint}</p>}
                        </div>
                      ))}
                      <div className="flex gap-3 pt-3">
                        <button onClick={handleCancelPasswordChange} disabled={savingPassword}
                          className="flex-1 px-4 py-2 bg-manah-deep text-manah-cream rounded-xl hover:bg-manah-deep/80 transition font-semibold cursor-pointer"
                        >Cancelar</button>
                        <button onClick={handleChangePassword} disabled={savingPassword}
                          className="flex-1 px-4 py-2 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold disabled:opacity-50 cursor-pointer"
                        >{savingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferencias de Lectura */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-manah-cream flex items-center gap-2 px-1 sm:px-2">
                <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                </svg>
                Preferencias de Lectura
              </h3>
              <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 border-2 border-manah-gold/30">
                <h4 className="text-base sm:text-lg font-bold text-manah-cream mb-1">Versión Bíblica por Defecto</h4>
                <p className="text-xs sm:text-sm text-manah-muted/60 mb-4">La versión que se usará al abrir un capítulo por primera vez</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {BIBLE_VERSIONS.map((v) => (
                    <button key={v.code} onClick={() => setSelectedBibleVersion(v.code)}
                      className={`py-2 px-3 rounded-xl border-2 font-semibold text-sm transition-all cursor-pointer ${
                        selectedBibleVersion === v.code
                          ? 'border-manah-gold bg-manah-gold/10 text-manah-gold'
                          : 'border-manah-gold/20 text-manah-muted hover:border-manah-gold/50 hover:text-manah-cream'
                      }`}
                    >
                      <div className="font-bold">{v.label}</div>
                      <div className="text-xs font-normal opacity-70">{v.lang}</div>
                    </button>
                  ))}
                </div>
                <button onClick={handleSaveBibleVersion}
                  disabled={savingBibleVersion || selectedBibleVersion === rawBibleVersion}
                  className="w-full py-2 px-4 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >{savingBibleVersion ? 'Guardando...' : 'Guardar Preferencia'}</button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 sm:space-y-4">
              {isInstallable && (
                <button onClick={installApp}
                  className="w-full bg-manah-gold text-manah-bg py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-manah-bronze transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-4.2-5.78v1.75l3.2-3.2-3.2-3.2v1.75H9v3h3.8z"/>
                  </svg>
                  Instalar Aplicación
                </button>
              )}

              <button onClick={() => setShowTutorialMenu(!showTutorialMenu)}
                className="w-full bg-manah-deep text-manah-cream py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-manah-deep/80 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 border border-manah-gold/20 cursor-pointer"
              >
                <svg className="w-6 h-6 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
                Ayuda y Tutoriales
              </button>

              {showTutorialMenu && (
                <div className="bg-manah-card rounded-xl shadow-lg p-4 sm:p-5 border-2 border-manah-gold/10 space-y-3">
                  <h3 className="font-bold text-lg text-manah-cream mb-3">Tutoriales Disponibles</h3>
                  <div className="w-full bg-manah-deep hover:bg-manah-deep/80 text-manah-cream py-3 px-4 rounded-xl font-semibold transition flex items-center justify-between gap-3 border border-manah-gold/10">
                    <div className="flex items-center gap-3 flex-1">
                      <svg className="w-8 h-8 text-manah-gold flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <div>
                        <div className="font-bold">Tutorial de Bienvenida</div>
                        <div className="text-sm text-manah-muted">Aprende lo básico de la app</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowTutorialMenu(false); navigate('/inicio', { state: { showTutorial: true } }); }}
                      className="bg-manah-gold hover:bg-manah-bronze text-manah-bg px-4 py-2 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      Iniciar
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                  <div className="text-center text-sm text-manah-muted/60 mt-3 pt-3 border-t border-manah-gold/10">
                    Más tutoriales próximamente...
                  </div>
                </div>
              )}

              <div className="text-center py-2">
                <Link to="/legal" className="text-xs text-manah-muted/40 hover:text-manah-muted transition">
                  Política de Privacidad · Términos de Uso · Atribución
                </Link>
              </div>

              <button onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
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




