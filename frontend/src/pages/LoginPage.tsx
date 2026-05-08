import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useInstallPWA } from '../hooks/useInstallPWA';
import toast from 'react-hot-toast';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingScreen from '../components/LoadingScreen';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isInstallable, installApp } = useInstallPWA();
  const { loginWithRedirect, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [syncingAuth0, setSyncingAuth0] = useState(false);

  useEffect(() => {
    const syncAuth0WithBackend = async () => {
      if (isAuthenticated && !isLoading) {
        setSyncingAuth0(true);
        try {
          const accessToken = await getAccessTokenSilently();

          const baseUrl = import.meta.env.VITE_API_URL || 'https://appbible.onrender.com';
          const apiUrl = baseUrl.replace(/\/api$/, '');
          const response = await fetch(`${apiUrl}/api/auth/auth0-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync with backend');
          }

          const data = await response.json();

          setAuth(data.user, data.roles, data.permissions, data.token);
          toast.success(`¡Bienvenido, ${data.user.displayName}!`);

          setTimeout(() => {
            navigate('/inicio', { replace: true });
          }, 100);
        } catch (error: any) {
          console.error('Error syncing Auth0:', error);
          toast.error('Error al sincronizar con el servidor');
          setSyncingAuth0(false);
        }
      }
    };

    syncAuth0WithBackend();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, setAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.roles, data.permissions, data.token);
      toast.success(`¡Bienvenido de vuelta, ${data.user.displayName}!`);
      navigate('/inicio');
    } catch (err: any) {
      setError(err.message || 'Autenticación fallida');
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || syncingAuth0) {
    return <LoadingScreen text={syncingAuth0 ? 'Sincronizando con el servidor...' : 'Cargando...'} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-manah-bg font-manrope">
      <div className="max-w-md w-full mx-4">
        <div className="bg-manah-card rounded-xl shadow-xl border border-manah-gold/20 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="flex items-center justify-center gap-3 hover:opacity-80 transition cursor-pointer">
              <img
                src="/logo-header-manah.png"
                alt="Manah Logo"
                className="h-16 w-auto"
              />
              <h1 className="text-4xl font-bold text-manah-gold" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah
              </h1>
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-manah-muted mb-1">
                Correo
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-manah-gold/30 bg-manah-bg text-manah-cream rounded-xl focus:border-manah-gold focus:outline-none placeholder-manah-muted/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-manah-muted mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-manah-gold/30 bg-manah-bg text-manah-cream rounded-xl focus:border-manah-gold focus:outline-none placeholder-manah-muted/50"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-manah-gold text-manah-bg py-3 rounded-xl hover:bg-manah-bronze transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-manah-gold/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-manah-card text-manah-muted font-medium">O continuar con</span>
            </div>
          </div>

          {/* Auth0 Google Login Button */}
          <button
            onClick={() => loginWithRedirect({
              authorizationParams: {
                connection: 'google-oauth2'
              }
            })}
            className="w-full bg-manah-deep border border-manah-gold/20 text-manah-cream py-3 rounded-xl hover:bg-manah-deep/80 transition font-semibold shadow-md flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Link to register */}
          <div className="mt-6 text-center">
            <p className="text-manah-muted text-sm mb-3">
              ¿No tienes cuenta?
            </p>
            <Link
              to="/register"
              className="block w-full bg-manah-deep text-manah-cream py-3 rounded-xl hover:bg-manah-deep/80 transition font-semibold shadow-md cursor-pointer"
            >
              Crear Cuenta Nueva
            </Link>
          </div>

          {/* Legal Links */}
          <div className="mt-4 text-center">
            <Link to="/legal" className="text-xs text-manah-muted/60 hover:text-manah-muted transition">
              Política de Privacidad · Términos de Uso · Atribución
            </Link>
          </div>

          {/* Install PWA Button */}
          {isInstallable && (
            <div className="mt-4">
              <button
                onClick={installApp}
                className="w-full bg-manah-gold text-manah-bg py-3 rounded-xl hover:bg-manah-bronze transition font-semibold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-xl">📱</span>
                Instalar Aplicación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



