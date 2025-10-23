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
    const base = "px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200";
    const active = "bg-white text-indigo-600 shadow-md";
    const inactive = "text-white hover:bg-white/10";
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  const mobileNavLinkClass = (path: string) => {
    const base = "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 min-w-[60px]";
    const active = "bg-white/20 text-white";
    const inactive = "text-white/70 hover:text-white hover:bg-white/10";
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  return (
    <nav className={`shadow-md ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header principal */}
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* Logo y título */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">📖</span>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Manah {isAdmin && 'Admin'}
              </h1>
              <p className="text-xs text-white/80">{user?.displayName}</p>
            </div>
          </Link>

          {/* Enlaces de navegación - Desktop */}
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
                <Link to="/estadisticas" className={navLinkClass('/estadisticas')}>
                  📊 Estadísticas
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

          {/* Botón perfil móvil - solo visible en SM */}
          <Link
            to="/perfil"
            className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            <span className="text-xl">👤</span>
          </Link>
        </div>
      </div>

      {/* Navegación móvil - Fixed bottom bar (solo iconos) */}
      <div className="md:hidden fixed bottom-0 left-0 w-screen bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg border-t border-white/10 z-50 m-0">
        {!isAdmin ? (
          <div className="flex items-center justify-around py-4">
            <Link to="/" className={mobileNavLinkClass('/')}>
              <span className="text-2xl">🏠</span>
              <span className="text-[10px] font-medium">Inicio</span>
            </Link>
            <Link to="/camino" className={mobileNavLinkClass('/camino')}>
              <span className="text-2xl">📖</span>
              <span className="text-[10px] font-medium">Camino</span>
            </Link>
            <Link to="/lectura-libre" className={mobileNavLinkClass('/lectura-libre')}>
              <span className="text-2xl">🗺️</span>
              <span className="text-[10px] font-medium">Libre</span>
            </Link>
            <Link to="/buscar" className={mobileNavLinkClass('/buscar')}>
              <span className="text-2xl">🔍</span>
              <span className="text-[10px] font-medium">Buscar</span>
            </Link>
            <Link to="/estadisticas" className={mobileNavLinkClass('/estadisticas')}>
              <span className="text-2xl">📊</span>
              <span className="text-[10px] font-medium">Stats</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-around py-4">
            <Link to="/" className={mobileNavLinkClass('/')}>
              <span className="text-2xl">🏠</span>
              <span className="text-[10px] font-medium">Inicio</span>
            </Link>
            <Link to="/admin/config" className={mobileNavLinkClass('/admin/config')}>
              <span className="text-2xl">⚙️</span>
              <span className="text-[10px] font-medium">Config</span>
            </Link>
            <Link to="/perfil" className={mobileNavLinkClass('/perfil')}>
              <span className="text-2xl">👤</span>
              <span className="text-[10px] font-medium">Perfil</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
