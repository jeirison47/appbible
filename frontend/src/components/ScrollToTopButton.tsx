import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Detectar si estamos en una página de Camino (donde hay barra de progreso)
  const isCaminoPage = location.pathname.startsWith('/camino/') && location.pathname.split('/').length >= 3;

  // Mostrar botón cuando el usuario hace scroll hacia abajo
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll suave hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Ajustar posición según la página:
  // - En páginas de Camino (con barra de progreso): más arriba (bottom-32 sm:bottom-24)
  // - En otras páginas: más abajo (bottom-8 sm:bottom-8)
  const bottomPosition = isCaminoPage ? 'bottom-32 sm:bottom-24' : 'bottom-8 sm:bottom-8';

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`fixed ${bottomPosition} right-4 sm:right-8 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group`}
          aria-label="Volver arriba"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 group-hover:animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
}
