import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-manah-bg font-manrope">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-manah-bg/90 backdrop-blur-md border-b border-manah-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo-header-manah.png"
                alt="Manah Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-manah-gold" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah
              </h1>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-manah-deep transition cursor-pointer rounded-xl"
                aria-label="Toggle theme"
              >
                ☀️
              </button>
              <Link
                to="/login"
                className="hidden sm:block text-manah-muted hover:text-manah-gold font-medium text-sm sm:text-base transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="hidden sm:block bg-manah-gold text-manah-bg px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-manah-bronze transition shadow-md"
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-manah-cream mb-6 leading-tight">
                Fortalece tu{' '}
                <span className="text-manah-gold">
                  Vida Espiritual
                </span>
                {' '}Cada Día
              </h1>
              <p className="text-lg sm:text-xl text-manah-muted mb-8 leading-relaxed">
                Cultiva el hábito de leer la Biblia con una herramienta diseñada para mantenerte motivado y constante.
                Completa tu lectura de los 66 libros mientras creces en tu fe.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/register"
                  className="bg-manah-gold text-manah-bg px-8 py-4 rounded-xl font-bold text-lg hover:bg-manah-bronze transition shadow-lg cursor-pointer"
                >
                  Comenzar Gratis
                </Link>
                <Link
                  to="/login"
                  className="bg-manah-card text-manah-cream px-8 py-4 rounded-xl font-bold text-lg hover:bg-manah-deep transition shadow-md border border-manah-gold/20 cursor-pointer"
                >
                  Ya tengo cuenta
                </Link>
              </div>

              <p className="text-sm text-manah-muted/60">
                Sin costo, sin tarjeta de crédito, comienza en segundos
              </p>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-manah-card rounded-xl shadow-xl p-4 sm:p-6 border border-manah-gold/20">
                <div className="bg-manah-deep rounded-xl p-8 text-manah-cream">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✝️</div>
                    <h3 className="text-2xl font-bold mb-2">Mi Camino Bíblico</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-manah-bg rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Libros Completados</span>
                        <span className="text-sm text-manah-muted">12 de 66</span>
                      </div>
                      <div className="w-full bg-manah-bg h-3 overflow-hidden border border-manah-gold/10">
                        <div className="bg-manah-gold h-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-manah-bg rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold">📅 7</div>
                        <div className="text-sm text-manah-muted">Días consecutivos</div>
                      </div>
                      <div className="bg-manah-bg rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold">📖 145</div>
                        <div className="text-sm text-manah-muted">Capítulos leídos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features: Modos de Lectura */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-manah-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-manah-cream mb-4">
              Dos formas de leer la Biblia
            </h2>
            <p className="text-lg text-manah-muted max-w-2xl mx-auto">
              Elige el modo que mejor se adapte a tu ritmo y necesidades espirituales
            </p>
          </div>

          {/* Modo Camino */}
          <div className="mb-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-block bg-manah-gold/10 text-manah-gold border border-manah-gold/20 px-4 py-2 rounded-xl text-sm font-semibold mb-4">
                  MODO ESTRUCTURADO
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-manah-cream mb-4">
                  Modo Camino
                </h3>
                <p className="text-lg text-manah-muted mb-6">
                  Lectura guiada libro por libro. Sigue un orden estructurado desde Génesis hasta Apocalipsis.
                  Desbloquea capítulos progresivamente y completa la Biblia entera con un plan diseñado para mantenerte motivado.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-manah-muted">Lectura secuencial libro por libro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-manah-muted">Capítulos desbloqueables progresivamente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-manah-muted">Progreso visual de tu camino completo</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative bg-manah-deep rounded-xl p-6 shadow-xl border border-manah-gold/10">
                  {/* Progress Bar */}
                  <div className="bg-manah-card rounded-xl p-4 mb-4 shadow-md border border-manah-gold/10">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-manah-cream whitespace-nowrap">
                        Tu Camino Bíblico
                      </h4>
                      <div className="flex-1 relative">
                        <div className="w-full bg-manah-bg h-6 overflow-hidden">
                          <div
                            className="bg-manah-gold h-full flex items-center justify-center"
                            style={{ width: '18%' }}
                          >
                            <span className="text-xs font-bold text-manah-bg">18%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-manah-muted whitespace-nowrap">
                        12 / 66
                      </div>
                    </div>
                  </div>

                  {/* Timeline with book cards */}
                  <div className="relative">
                    {/* Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-manah-gold/20 transform -translate-x-1/2"></div>

                    {/* Génesis - Completado (LEFT) */}
                    <div className="relative mb-3 pr-[52%]">
                      <div className="absolute top-6 right-[50%] transform translate-x-1/2 w-3 h-3 rounded-full bg-manah-gold border-2 border-manah-bg shadow-lg z-10"></div>
                      <div className="rounded-xl shadow-md p-3 text-manah-cream bg-manah-bg border border-manah-gold/20 min-h-[140px] flex flex-col justify-between">
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="mb-2 flex justify-center">
                            <svg className="w-8 h-8 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                            </svg>
                          </div>
                          <h3 className="text-base font-bold mb-2 text-center">Génesis</h3>
                          <div className="bg-manah-deep rounded-xl py-1.5 px-2 mb-2">
                            <p className="text-xs font-semibold text-center text-manah-muted">50 Capítulos</p>
                          </div>
                          <div className="bg-manah-gold text-manah-bg px-2 py-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                            <span>✓</span>
                            <span>COMPLETADO</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Éxodo - En progreso (RIGHT) */}
                    <div className="relative mb-3 pl-[52%]">
                      <div className="absolute top-6 left-[50%] transform -translate-x-1/2 w-3 h-3 rounded-full bg-manah-gold border-2 border-manah-bg shadow-lg z-10"></div>
                      <div className="rounded-xl shadow-md p-3 text-manah-cream bg-manah-bg border border-manah-gold/20 min-h-[140px] flex flex-col justify-between">
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="mb-2 flex justify-center">
                            <svg className="w-8 h-8 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                            </svg>
                          </div>
                          <h3 className="text-base font-bold mb-2 text-center">Éxodo</h3>
                          <div className="bg-manah-deep rounded-xl py-1.5 px-2">
                            <p className="text-xs font-semibold text-center text-manah-muted">Capítulo 15/40</p>
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
                <div className="relative bg-manah-deep rounded-xl p-6 shadow-xl border border-manah-gold/10">
                  {/* Testament Filters */}
                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 bg-manah-gold text-manah-bg px-3 py-2 rounded-xl font-bold text-xs shadow-md cursor-pointer">
                      Todos (66)
                    </button>
                    <button className="flex-1 bg-manah-card text-manah-cream/70 border border-manah-gold/20 px-3 py-2 rounded-xl font-bold text-xs cursor-pointer">
                      📜 AT (39)
                    </button>
                    <button className="flex-1 bg-manah-card text-manah-cream/70 border border-manah-gold/20 px-3 py-2 rounded-xl font-bold text-xs cursor-pointer">
                      ✝️ NT (27)
                    </button>
                  </div>

                  {/* Category Header */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-manah-cream flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-manah-gold"></span>
                      Evangelios
                      <span className="text-xs font-normal text-manah-muted">(4 libros)</span>
                    </h4>
                  </div>

                  {/* Books Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {['Mateo', 'Juan', 'Marcos', 'Lucas'].map((book, i) => (
                      <div key={book} className="bg-manah-card rounded-xl shadow-sm p-3 border border-manah-gold/15">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-manah-cream">{book}</h5>
                            <p className="text-xs text-manah-muted">
                              {[28, 21, 16, 24][i]} capítulos
                            </p>
                          </div>
                          <div className="w-7 h-7 rounded-xl bg-manah-gold/10 flex items-center justify-center text-sm">
                            ✝️
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-manah-gold font-semibold mt-2">
                          <span>Abrir libro</span>
                          <span className="ml-1">→</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Category Header */}
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-manah-cream flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-manah-gold"></span>
                      Escritos
                      <span className="text-xs font-normal text-manah-muted">(2 libros)</span>
                    </h4>
                  </div>

                  {/* Second Category Books */}
                  <div className="grid grid-cols-2 gap-2">
                    {['Salmos', 'Proverbios'].map((book, i) => (
                      <div key={book} className="bg-manah-card rounded-xl shadow-sm p-3 border border-manah-gold/15">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-manah-cream">{book}</h5>
                            <p className="text-xs text-manah-muted">
                              {[150, 31][i]} capítulos
                            </p>
                          </div>
                          <div className="w-7 h-7 rounded-xl bg-manah-gold/10 flex items-center justify-center text-sm">
                            📜
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-manah-gold font-semibold mt-2">
                          <span>Abrir libro</span>
                          <span className="ml-1">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-block bg-manah-deep text-manah-muted border border-manah-gold/20 px-4 py-2 rounded-xl text-sm font-semibold mb-4">
                  MODO FLEXIBLE
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-manah-cream mb-4">
                  Lectura Libre
                </h3>
                <p className="text-lg text-manah-muted mb-6">
                  Explora cualquier libro o capítulo sin restricciones. Perfecto para estudios temáticos,
                  devocionales diarios o cuando quieres profundizar en pasajes específicos que hablan a tu corazón.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-manah-muted">Acceso total a los 66 libros</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-manah-muted">Lee versículo por versículo o capítulos completos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-manah-muted">Perfecto para estudios bíblicos temáticos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-manah-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-manah-cream mb-4">
              Características adicionales
            </h2>
            <p className="text-manah-muted">
              Herramientas que te ayudan a mantener la constancia
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-manah-card p-6 rounded-xl shadow-sm border border-manah-gold/15 hover:border-manah-gold/40 transition text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-bold text-manah-cream mb-2">Puntos XP</h3>
              <p className="text-sm text-manah-muted">
                Gana puntos por cada minuto de lectura
              </p>
            </div>
            <div className="bg-manah-card p-6 rounded-xl shadow-sm border border-manah-gold/15 hover:border-manah-gold/40 transition text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="text-lg font-bold text-manah-cream mb-2">Racha Diaria</h3>
              <p className="text-sm text-manah-muted">
                Mantén tu hábito de lectura constante
              </p>
            </div>
            <div className="bg-manah-card p-6 rounded-xl shadow-sm border border-manah-gold/15 hover:border-manah-gold/40 transition text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-manah-cream mb-2">Estadísticas</h3>
              <p className="text-sm text-manah-muted">
                Visualiza tu progreso completo
              </p>
            </div>
            <div className="bg-manah-card p-6 rounded-xl shadow-sm border border-manah-gold/15 hover:border-manah-gold/40 transition text-center">
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="text-lg font-bold text-manah-cream mb-2">Modo Oscuro</h3>
              <p className="text-sm text-manah-muted">
                Lectura cómoda en cualquier momento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-manah-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-manah-cream mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-manah-muted">
              Comienza tu camino bíblico en 4 simples pasos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="relative">
              <div className="bg-manah-deep p-6 sm:p-8 rounded-xl shadow-md border border-manah-gold/20">
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-manah-gold rounded-full flex items-center justify-center text-manah-bg font-bold text-lg shadow-md">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-manah-cream mb-3 mt-2">Regístrate Gratis</h3>
                <p className="text-manah-muted">
                  Crea tu cuenta en segundos. Sin costos ocultos, sin tarjeta de crédito necesaria.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-manah-deep p-6 sm:p-8 rounded-xl shadow-md border border-manah-gold/20">
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-manah-gold rounded-full flex items-center justify-center text-manah-bg font-bold text-lg shadow-md">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-manah-cream mb-3 mt-2">Elige tu Modo</h3>
                <p className="text-manah-muted">
                  Selecciona entre Modo Camino (guiado) o Lectura Libre (explora libremente).
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-manah-deep p-6 sm:p-8 rounded-xl shadow-md border border-manah-gold/20">
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-manah-gold rounded-full flex items-center justify-center text-manah-bg font-bold text-lg shadow-md">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-manah-cream mb-3 mt-2">Lee y Gana XP</h3>
                <p className="text-manah-muted">
                  Cada minuto cuenta. Gana XP automáticamente mientras lees y completas capítulos.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-manah-deep p-6 sm:p-8 rounded-xl shadow-md border border-manah-gold/20">
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-manah-gold rounded-full flex items-center justify-center text-manah-bg font-bold text-lg shadow-md">
                  4
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-manah-cream mb-3 mt-2">Completa tu Camino</h3>
                <p className="text-manah-muted">
                  Sigue tu progreso, mantén tu racha y completa los 66 libros de la Biblia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-manah-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-manah-cream mb-6">
            ¿Listo para comenzar tu camino bíblico?
          </h2>
          <p className="text-xl text-manah-muted mb-8">
            Únete a miles de personas que están descubriendo la Biblia de una forma más motivadora
          </p>
          <Link
            to="/register"
            className="inline-block bg-manah-gold text-manah-bg px-10 py-5 rounded-xl font-bold text-xl hover:bg-manah-bronze transition shadow-xl cursor-pointer"
          >
            Comenzar Ahora — Es Gratis
          </Link>
          <p className="mt-6 text-manah-muted/60 text-sm">
            No se requiere tarjeta de crédito · Comienza en menos de 1 minuto
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-manah-card border-t border-manah-gold/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo-header-manah.png"
                  alt="Manah Logo"
                  className="h-8 w-auto"
                />
                <h3 className="text-xl font-bold text-manah-gold" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                  manah
                </h3>
              </div>
              <p className="text-manah-muted text-sm">
                Fortalece tu vida espiritual cada día. Lee, aprende y crece en tu fe mientras cultivas el hábito de leer la Biblia.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-manah-cream mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-manah-muted hover:text-manah-gold text-sm transition">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-manah-muted hover:text-manah-gold text-sm transition">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-manah-cream mb-4">Información</h4>
              <p className="text-manah-muted text-sm">
                Una aplicación web progresiva diseñada para ayudarte a completar la lectura de los 66 libros de la Biblia de forma constante y motivadora.
              </p>
            </div>
          </div>

          <div className="border-t border-manah-gold/20 mt-8 pt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/legal" className="text-xs text-manah-muted/60 hover:text-manah-gold transition">
                Política de Privacidad
              </Link>
              <span className="text-manah-gold/30">·</span>
              <Link to="/legal" className="text-xs text-manah-muted/60 hover:text-manah-gold transition">
                Términos de Uso
              </Link>
              <span className="text-manah-gold/30">·</span>
              <Link to="/legal" className="text-xs text-manah-muted/60 hover:text-manah-gold transition">
                Atribución Bíblica
              </Link>
            </div>
            <p className="text-manah-muted/60 text-sm">
              © {new Date().getFullYear()} Manah. Hecho con ❤️ para la gloria de Dios.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



