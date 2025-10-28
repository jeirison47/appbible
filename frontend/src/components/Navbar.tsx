import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');

  const isActive = (path: string) => {
    if (path === '/inicio') {
      return location.pathname === '/inicio';
    }
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) => {
    const base = "px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center";
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
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Primera fila: Logo izquierda + Perfil derecha */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo-header-manah.png"
                alt="Manah Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah {isAdmin && 'Admin'}
              </h1>
            </div>

            {/* Botones de Tema y Perfil */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/perfil"
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span className="hidden sm:inline font-medium">Perfil</span>
              </Link>
            </div>
          </div>

          {/* Segunda fila: Navegación */}
          <div className="border-t border-white/10">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center gap-2 px-4 py-2">
              <Link to="/inicio" className={navLinkClass('/inicio')} data-tutorial="nav-inicio">
                <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Inicio
              </Link>

              {!isAdmin && (
                <>
                  <Link to="/camino" className={navLinkClass('/camino')} data-tutorial="nav-camino">
                    <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                    </svg>
                    Camino
                  </Link>
                  <Link to="/lectura-libre" className={navLinkClass('/lectura-libre')} data-tutorial="nav-lectura-libre">
                    <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                    </svg>
                    Lectura Libre
                  </Link>
                  <Link to="/buscar" className={navLinkClass('/buscar')} data-tutorial="nav-buscar">
                    <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    Buscar
                  </Link>
                  <Link to="/estadisticas" className={navLinkClass('/estadisticas')} data-tutorial="nav-estadisticas">
                    <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                    Estadísticas
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin/config" className={navLinkClass('/admin/config')}>
                  <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                  Configuración
                </Link>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden" id="mobile-navigation">
              {!isAdmin ? (
                <div className="flex items-center justify-around px-2 py-2">
                  <Link to="/inicio" className={mobileNavLinkClass('/inicio')} data-tutorial="nav-inicio-mobile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span className="text-[10px] font-medium">Inicio</span>
                  </Link>
                  <Link to="/camino" className={mobileNavLinkClass('/camino')} data-tutorial="nav-camino-mobile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                    </svg>
                    <span className="text-[10px] font-medium">Camino</span>
                  </Link>
                  <Link to="/lectura-libre" className={mobileNavLinkClass('/lectura-libre')} data-tutorial="nav-lectura-libre-mobile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                    </svg>
                    <span className="text-[10px] font-medium">Libre</span>
                  </Link>
                  <Link to="/buscar" className={mobileNavLinkClass('/buscar')} data-tutorial="nav-buscar-mobile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <span className="text-[10px] font-medium">Buscar</span>
                  </Link>
                  <Link to="/estadisticas" className={mobileNavLinkClass('/estadisticas')} data-tutorial="nav-estadisticas-mobile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                    <span className="text-[10px] font-medium">Stats</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-around px-2 py-2">
                  <Link to="/inicio" className={mobileNavLinkClass('/inicio')}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span className="text-[10px] font-medium">Inicio</span>
                  </Link>
                  <Link to="/admin/config" className={mobileNavLinkClass('/admin/config')}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
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
