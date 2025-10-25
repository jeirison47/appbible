import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { useAuth0 } from '@auth0/auth0-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { loginWithRedirect, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [syncingAuth0, setSyncingAuth0] = useState(false);

  // Sincronizar con backend cuando Auth0 autentica
  useEffect(() => {
    const syncAuth0WithBackend = async () => {
      if (isAuthenticated && !isLoading) {
        setSyncingAuth0(true);
        try {
          // Obtener token de Auth0
          const accessToken = await getAccessTokenSilently();

          // Enviar a backend
          const apiUrl = import.meta.env.VITE_API_URL || 'https://manah-backend.onrender.com';
          const response = await fetch(`${apiUrl}/api/auth/auth0-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync with backend');
          }

          const data = await response.json();

          // Guardar en store local
          setAuth(data.user, data.roles, data.permissions, data.token);
          toast.success(`¡Bienvenido, ${data.user.displayName}!`);

          // Redirigir a home
          navigate('/');
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

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({ email, password, displayName });
      setAuth(data.user, data.roles, data.permissions, data.token);
      toast.success('¡Registro exitoso! Bienvenido a Manah');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading si Auth0 está procesando o sincronizando
  if (isLoading || syncingAuth0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg font-semibold">
            {syncingAuth0 ? 'Sincronizando con el servidor...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img
                src="/logo-color-manah.png"
                alt="Manah Logo"
                className="h-16 w-auto"
              />
              <h1 className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah
              </h1>
            </div>
            <p className="text-gray-500 text-sm">
              Únete y comienza tu aventura bíblica
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                minLength={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">O regístrate con</span>
            </div>
          </div>

          {/* Auth0 Google Login Button */}
          <button
            onClick={() => loginWithRedirect({
              authorizationParams: {
                connection: 'google-oauth2',
                screen_hint: 'signup'
              }
            })}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold shadow-md flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Link to login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2 text-sm">Al registrarte obtendrás:</p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Acceso completo a toda la Biblia
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Sistema de progreso y logros
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Lectura guiada por capítulos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Versículo diario personalizado
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
