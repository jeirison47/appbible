import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={theme === 'dark' ? '/logo-header-manah.png' : '/logo-color-manah.png'}
                alt="Manah Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah
              </h1>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm sm:text-base transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Fortalece tu{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Vida Espiritual
                </span>
                {' '}Cada Día
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Cultiva el hábito de leer la Biblia con una herramienta diseñada para mantenerte motivado y constante.
                Completa tu lectura de los 66 libros mientras creces en tu fe.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  🚀 Comenzar Gratis
                </Link>
                <Link
                  to="/login"
                  className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-lg border-2 border-indigo-200 dark:border-indigo-800"
                >
                  Ya tengo cuenta
                </Link>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                ✨ Sin costo, sin tarjeta de crédito, comienza en segundos
              </p>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✝️</div>
                    <h3 className="text-2xl font-bold mb-2">Mi Camino Bíblico</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Libros Completados</span>
                        <span className="text-sm">12 de 66</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <div className="bg-white h-full rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">📅 7</div>
                        <div className="text-sm">Días consecutivos</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">📖 145</div>
                        <div className="text-sm">Capítulos leídos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-50 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features: Modos de Lectura */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Dos formas de leer la Biblia
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Elige el modo que mejor se adapte a tu ritmo y necesidades espirituales
            </p>
          </div>

          {/* Modo Camino */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  MODO ESTRUCTURADO
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  🎯 Modo Camino
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Lectura guiada libro por libro. Sigue un orden estructurado desde Génesis hasta Apocalipsis.
                  Desbloquea capítulos progresivamente y completa la Biblia entera con un plan diseñado para mantenerte motivado.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Lectura secuencial libro por libro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Capítulos desbloqueables progresivamente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Progreso visual de tu camino completo</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative bg-gradient-to-b from-purple-100 via-blue-50 to-green-50 dark:from-purple-950 dark:via-blue-950 dark:to-green-950 rounded-2xl p-6 shadow-2xl">
                  {/* Progress Bar */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                        Tu Camino Bíblico
                      </h4>
                      <div className="flex-1 relative">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full rounded-full flex items-center justify-center"
                            style={{ width: '18%' }}
                          >
                            <span className="text-xs font-bold text-white">18%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                        12 / 66
                      </div>
                    </div>
                  </div>

                  {/* Timeline with book cards */}
                  <div className="relative">
                    {/* Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-300 transform -translate-x-1/2"></div>

                    {/* Génesis - Completado (LEFT) */}
                    <div className="relative mb-3 pr-[52%]">
                      <div className="absolute top-6 right-[50%] transform translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10"></div>
                      <div className="rounded-xl shadow-lg p-3 text-white bg-gradient-to-br from-blue-500 to-blue-700 min-h-[140px] flex flex-col justify-between">
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="mb-2 flex justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                            </svg>
                          </div>
                          <h3 className="text-base font-bold mb-2 text-center">Génesis</h3>
                          <div className="bg-white/20 rounded-lg py-1.5 px-2 backdrop-blur mb-2">
                            <p className="text-xs font-semibold text-center">50 Capítulos</p>
                          </div>
                          <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1">
                            <span>✓</span>
                            <span>COMPLETADO</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Éxodo - En progreso (RIGHT) */}
                    <div className="relative mb-3 pl-[52%]">
                      <div className="absolute top-6 left-[50%] transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10"></div>
                      <div className="rounded-xl shadow-lg p-3 text-white bg-gradient-to-br from-blue-500 to-blue-700 min-h-[140px] flex flex-col justify-between">
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="mb-2 flex justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                            </svg>
                          </div>
                          <h3 className="text-base font-bold mb-2 text-center">Éxodo</h3>
                          <div className="bg-white/20 rounded-lg py-1.5 px-2 backdrop-blur">
                            <p className="text-xs font-semibold text-center">Capítulo 15/40</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lectura Libre */}
          <div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-6 shadow-2xl">
                  {/* Testament Filters */}
                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-xs shadow-lg">
                      Todos (66)
                    </button>
                    <button className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-bold text-xs">
                      📜 AT (39)
                    </button>
                    <button className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-bold text-xs">
                      ✝️ NT (27)
                    </button>
                  </div>

                  {/* Category Header */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-indigo-600 rounded"></span>
                      Evangelios
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(4 libros)</span>
                    </h4>
                  </div>

                  {/* Books Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {/* Mateo */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                            Mateo
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            28 capítulos
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm">
                          ✝️
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                        <span>Abrir libro</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>

                    {/* Juan */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                            Juan
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            21 capítulos
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm">
                          ✝️
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                        <span>Abrir libro</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>

                    {/* Marcos */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                            Marcos
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            16 capítulos
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm">
                          ✝️
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                        <span>Abrir libro</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>

                    {/* Lucas */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                            Lucas
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            24 capítulos
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm">
                          ✝️
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                        <span>Abrir libro</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Header */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-indigo-600 rounded"></span>
                      Escritos
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(2 libros)</span>
                    </h4>
                  </div>

                  {/* Second Category Books */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Salmos */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                            Salmos
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            150 capítulos
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm">
                          📜
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                        <span>Abrir libro</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>

                    {/* Proverbios */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                            Proverbios
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            31 capítulos
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm">
                          📜
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                        <span>Abrir libro</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  MODO FLEXIBLE
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  📖 Lectura Libre
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Explora cualquier libro o capítulo sin restricciones. Perfecto para estudios temáticos,
                  devocionales diarios o cuando quieres profundizar en pasajes específicos que hablan a tu corazón.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Acceso total a los 66 libros</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Lee versículo por versículo o capítulos completos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-600 dark:text-gray-300">Perfecto para estudios bíblicos temáticos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Características adicionales
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Herramientas que te ayudan a mantener la constancia
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Puntos XP</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gana puntos por cada minuto de lectura
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Racha Diaria</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mantén tu hábito de lectura constante
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Estadísticas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Visualiza tu progreso completo
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition text-center">
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Dark Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Lectura cómoda en cualquier momento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comienza tu camino bíblico en 4 simples pasos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border-4 border-indigo-500">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-2">Regístrate Gratis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Crea tu cuenta en segundos. Sin costos ocultos, sin tarjeta de crédito necesaria.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border-4 border-purple-500">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-2">Elige tu Modo</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Selecciona entre Modo Camino (guiado) o Lectura Libre (explora libremente).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border-4 border-pink-500">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-2">Lee y Gana XP</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Cada minuto cuenta. Gana XP automáticamente mientras lees y completas capítulos.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border-4 border-green-500">
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  4
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-2">Completa tu Camino</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sigue tu progreso, mantén tu racha y completa los 66 libros de la Biblia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar tu camino bíblico?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a miles de personas que están descubriendo la Biblia de una forma más motivadora
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-indigo-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition shadow-2xl transform hover:scale-105"
          >
            🚀 Comenzar Ahora - Es Gratis
          </Link>
          <p className="mt-6 text-indigo-200 text-sm">
            No se requiere tarjeta de crédito • Comienza en menos de 1 minuto
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo-header-manah.png"
                  alt="Manah Logo"
                  className="h-8 w-auto"
                />
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                  manah
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Fortalece tu vida espiritual cada día. Lee, aprende y crece en tu fe mientras cultivas el hábito de leer la Biblia.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Información</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Una aplicación web progresiva diseñada para ayudarte a completar la lectura de los 66 libros de la Biblia de forma constante y motivadora.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Manah. Hecho con ❤️ para la gloria de Dios.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
