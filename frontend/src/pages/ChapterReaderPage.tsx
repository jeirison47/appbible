import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { readingApi, progressApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface ChapterData {
  book: {
    id: string;
    name: string;
    slug: string;
    testament: string;
    category: string;
    totalChapters: number;
  };
  chapter: {
    id: string;
    number: number;
    title: string;
    content: string;
    verses: Record<string, string>;
    verseCount: number;
  };
  version: string;
  isCompleted?: boolean;
  nextChapter?: {
    number: number;
    title: string;
  };
}

export default function ChapterReaderPage() {
  const { bookSlug, chapterNumber } = useParams<{ bookSlug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [version, setVersion] = useState<'RV1960' | 'KJV'>('RV1960');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<any>(null);

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      loadChapter();
    }
  }, [bookSlug, chapterNumber, version]);

  // Prevenir scroll en la página cuando el modal está abierto
  useEffect(() => {
    if (showRewards) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRewards]);

  const loadChapter = async () => {
    try {
      const data = await readingApi.getChapter(bookSlug!, parseInt(chapterNumber!), version);
      setChapter(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load chapter:', error);
      setLoading(false);
    }
  };

  const handleCompleteChapter = async () => {
    if (!chapter || completing) return;

    setCompleting(true);
    const readingTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await progressApi.completeChapter({
        chapterId: chapter.chapter.id,
        readingTimeSeconds,
        version,
        readingMode: 'PATH', // Modo Camino
      });

      setRewards(result.rewards);
      setShowRewards(true);
      toast.success('¡Capítulo completado exitosamente!');
    } catch (error: any) {
      console.error('Failed to complete chapter:', error);
      if (error.message === 'Este capítulo ya fue completado') {
        toast.error('Este capítulo ya fue completado', {
          icon: '✓',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        // Recargar para actualizar el estado
        loadChapter();
      } else {
        toast.error(error.message || 'Error al completar el capítulo');
      }
      setCompleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowRewards(false);
    setRewards(null);
    setCompleting(false);
  };

  const handleExit = () => {
    handleCloseModal();
    navigate(`/camino`);
  };

  const handleContinueToNext = () => {
    if (!chapter) return;

    // Cerrar el modal primero
    handleCloseModal();

    // Si hay siguiente capítulo en el mismo libro
    if (chapter.chapter.number < chapter.book.totalChapters) {
      const nextChapterNum = chapter.chapter.number + 1;
      navigate(`/camino/${bookSlug}/${nextChapterNum}`);
    } else {
      // Es el último capítulo, volver a camino
      navigate(`/camino`);
    }
  };

  // Rewards Modal - mostrar por encima de todo
  // Rewards Modal Overlay
  const rewardsModal = showRewards && rewards && chapter && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop difuminado */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>

      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 sm:p-4 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <div className="text-center">
            {/* Celebration Icon */}
            <div className="text-4xl sm:text-5xl mb-1">🎉</div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-0.5">
              ¡Completado!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
              {chapter.book.name} {chapter.chapter.number}
            </p>

            {/* Rewards Grid - 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {/* XP Reward - Full width on top */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-2.5 md:col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-0.5">Experiencia Ganada</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                  +{rewards.xp.totalXp} XP
                </p>
                {rewards.xp.leveledUp && (
                  <div className="bg-yellow-400 text-yellow-900 py-1 px-2.5 rounded-lg font-bold text-xs">
                    🎊 ¡Subiste al Nivel {rewards.xp.newLevel}!
                  </div>
                )}
                {rewards.xp.bonuses.length > 0 && (
                  <div className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                    {rewards.xp.bonuses.map((bonus: string, idx: number) => (
                      <p key={idx}>✨ {bonus}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Streak Progress Bar - Bottom left */}
              {rewards.streak && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-2.5 flex flex-col justify-center text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Progreso de Racha de Hoy</p>
                  <div className="w-full bg-white dark:bg-gray-800 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((rewards.streak.xpToday + rewards.xp.totalXp) / rewards.streak.xpRequired) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {rewards.streak.xpToday + rewards.xp.totalXp} / {rewards.streak.xpRequired} XP para mantener racha
                  </p>
                </div>
              )}

              {/* Daily Goal Progress - Bottom right */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2.5 flex flex-col justify-center text-center">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Meta Diaria</p>
                <p className="text-sm sm:text-base font-bold text-green-600 dark:text-green-400 mb-1">
                  {rewards.dailyGoal.progress} / {rewards.dailyGoal.goal} capítulos
                </p>
                <div className="w-full bg-white dark:bg-gray-800 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${rewards.dailyGoal.percentage}%` }}
                  ></div>
                </div>
                {rewards.dailyGoal.completed ? (
                  <p className="text-green-700 font-semibold text-xs">
                    ✓ ¡Meta diaria completada!
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    {rewards.dailyGoal.chaptersRemaining} capítulos restantes
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExit}
                className="bg-gray-200 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-xl font-semibold hover:bg-gray-300 transition text-sm"
              >
                Salir
              </button>
              <button
                onClick={handleContinueToNext}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-3 rounded-xl font-semibold hover:shadow-lg transition text-sm"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      {/* Render modal overlay if rewards are shown */}
      {rewardsModal}
      {/* Simple Header - Only Logo and Profile - Siempre visible */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo-header-manah.png"
                alt="Manah Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah {isAdmin && 'Admin'}
              </h1>
            </Link>

            {/* Botón Perfil */}
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
      </nav>

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg font-semibold">Cargando capítulo...</p>
          </div>
        </div>
      ) : !chapter ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-32">
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">No se pudo cargar el capítulo</p>
            <Link to="/camino" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              ← Volver al Camino
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Secondary Header - Back Button, Title, Version Selector */}
          <div className="fixed top-12 sm:top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40 border-b-4 border-indigo-500">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <Link
                  to={`/camino/${bookSlug}`}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-semibold text-sm sm:text-base"
                >
                  <span className="text-xl sm:text-2xl">←</span>
                  <span>Volver</span>
                </Link>
                <div className="text-center">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                    {chapter.book.name} - Capítulo {chapter.chapter.number}
                  </h1>
                </div>

                {/* Version Selector */}
                <div className="text-right">
                  <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as any)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm font-semibold"
                  >
                    <option value="RV1960">ES RV1960</option>
                    <option value="KJV">EN KJV</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

      {/* Chapter Content */}
      <div className="max-w-6xl mx-auto px-4 pt-48 sm:pt-52 pb-12">

        {/* Verses */}
        <div className="space-y-6 mb-16">
          {Object.entries(chapter.chapter.verses).map(([verseNum, verseText]) => (
            <div key={verseNum} className="flex gap-4 group">
              <span className="flex-shrink-0 w-10 text-right text-base font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 transition">
                {verseNum}
              </span>
              <p className="flex-1 text-lg text-gray-800 dark:text-gray-100 leading-relaxed">
                {verseText}
              </p>
            </div>
          ))}
        </div>

        {/* End of Chapter Separator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="mx-4 text-gray-400 text-sm font-semibold">FIN DEL CAPÍTULO</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Complete Chapter Button - Only at the end */}
        <div className="max-w-2xl mx-auto mb-12">
          {chapter.isCompleted ? (
            <>
              {chapter.nextChapter && chapter.chapter.number < chapter.book.totalChapters ? (
                <button
                  onClick={() => navigate(`/camino/${bookSlug}/${chapter.nextChapter!.number}`)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Siguiente Capítulo</span>
                    <span className="text-2xl">→</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/camino')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Volver al Camino</span>
                    <span className="text-2xl">🏠</span>
                  </div>
                </button>
              )}
              <p className="text-center text-sm text-green-600 dark:text-green-400 mt-4 font-semibold">
                ✓ Ya completaste este capítulo
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleCompleteChapter}
                disabled={completing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {completing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Guardando progreso...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">✓</span>
                    <span>Completar Capítulo</span>
                  </div>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Al completar este capítulo ganarás XP y avanzarás en tu racha
              </p>
            </>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
