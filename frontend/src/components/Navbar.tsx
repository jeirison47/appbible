import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200";
    const active = "bg-white text-indigo-600 shadow-md";
    const inactive = "text-white hover:bg-white/10";
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  return (
    <nav className={`shadow-md ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <Link to="/" className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <h1 className="text-xl font-bold text-white">
                Manah {isAdmin && 'Admin'}
              </h1>
              <p className="text-xs text-white/80">{user?.displayName}</p>
            </div>
          </Link>

          {/* Enlaces de navegación */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={navLinkClass('/')}>
              🏠 Inicio
            </Link>

            {!isAdmin && (
              <>
                <Link to="/camino" className={navLinkClass('/camino')}>
                  📖 Camino
                </Link>
                <Link to="/lectura-libre" className={navLinkClass('/lectura-libre')}>
                  🗺️ Lectura Libre
                </Link>
                <Link to="/buscar" className={navLinkClass('/buscar')}>
                  🔍 Buscar
                </Link>
              </>
            )}

            {isAdmin && (
              <Link to="/admin/config" className={navLinkClass('/admin/config')}>
                ⚙️ Configuración
              </Link>
            )}

            <Link to="/perfil" className={navLinkClass('/perfil')}>
              👤 Perfil
            </Link>
          </div>

          {/* Menú móvil (botón perfil) */}
          <div className="md:hidden">
            <Link
              to="/perfil"
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              <span className="text-xl">👤</span>
            </Link>
          </div>
        </div>

        {/* Navegación móvil - Enlaces principales */}
        {!isAdmin && (
          <div className="md:hidden flex items-center gap-2 mt-3 pb-2 overflow-x-auto">
            <Link to="/" className={`${navLinkClass('/')} whitespace-nowrap text-sm`}>
              🏠 Inicio
            </Link>
            <Link to="/camino" className={`${navLinkClass('/camino')} whitespace-nowrap text-sm`}>
              📖 Camino
            </Link>
            <Link to="/lectura-libre" className={`${navLinkClass('/lectura-libre')} whitespace-nowrap text-sm`}>
              🗺️ Lectura Libre
            </Link>
            <Link to="/buscar" className={`${navLinkClass('/buscar')} whitespace-nowrap text-sm`}>
              🔍 Buscar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
