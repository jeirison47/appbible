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
    <>
      {/* Navbar fijo arriba */}
      <nav className={`fixed top-0 left-0 right-0 shadow-md z-50 ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Primera fila: Logo izquierda + Perfil derecha */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">📖</span>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">
                  Manah {isAdmin && 'Admin'}
                </h1>
                <p className="text-[10px] sm:text-xs text-white/80 hidden sm:block">{user?.displayName}</p>
              </div>
            </Link>

            {/* Botón Perfil */}
            <Link
              to="/perfil"
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              <span className="text-xl sm:text-2xl">👤</span>
              <span className="hidden sm:inline font-medium">Perfil</span>
            </Link>
          </div>

          {/* Segunda fila: Navegación */}
          <div className="border-t border-white/10">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center gap-2 px-4 py-2">
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
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              {!isAdmin ? (
                <div className="flex items-center justify-around px-2 py-1.5">
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
                <div className="flex items-center justify-around px-2 py-1.5">
                  <Link to="/" className={mobileNavLinkClass('/')}>
                    <span className="text-2xl">🏠</span>
                    <span className="text-[10px] font-medium">Inicio</span>
                  </Link>
                  <Link to="/admin/config" className={mobileNavLinkClass('/admin/config')}>
                    <span className="text-2xl">⚙️</span>
                    <span className="text-[10px] font-medium">Config</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
