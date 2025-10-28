import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { readingApi, progressApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useReadingTimer } from '../hooks/useReadingTimer';
import ThemeToggle from '../components/ThemeToggle';

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
}

export default function FreeVerseReaderPage() {
  const { bookSlug, chapterNumber, verseNumber } = useParams<{
    bookSlug: string;
    chapterNumber: string;
    verseNumber?: string;
  }>();
  const navigate = useNavigate();
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [version, setVersion] = useState<'RV1960' | 'KJV'>('RV1960');
  const [loading, setLoading] = useState(true);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'verse' | 'chapter'>('verse');

  // Timer de lectura - inicia automáticamente cuando se carga la página
  const { seconds, formattedTime, start, reset } = useReadingTimer();
  const lastRecordedSecondsRef = useRef(0);
  const currentSecondsRef = useRef(0);

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      // Resetear el timer antes de cargar un nuevo capítulo
      reset();
      lastRecordedSecondsRef.current = 0;
      loadChapter();
      // Iniciar timer cuando se carga el capítulo
      start();
    }
  }, [bookSlug, chapterNumber, version]);

  // Actualizar ref con el valor actual de seconds
  useEffect(() => {
    currentSecondsRef.current = seconds;
  }, [seconds]);

  // Enviar tiempo de lectura al backend cada minuto
  useEffect(() => {
    if (seconds > 0 && seconds % 60 === 0 && seconds !== lastRecordedSecondsRef.current) {
      const incrementalSeconds = seconds - lastRecordedSecondsRef.current;
      lastRecordedSecondsRef.current = seconds;
      console.log(`📤 Enviando tiempo (cada 60s): ${incrementalSeconds}s`);
      progressApi.recordReadingTime(incrementalSeconds).catch((error) => {
        console.log('No se pudo registrar el tiempo de lectura');
      });
    }
  }, [seconds]);

  // Enviar tiempo cuando se desmonte el componente
  useEffect(() => {
    return () => {
      const incrementalSeconds = currentSecondsRef.current - lastRecordedSecondsRef.current;
      if (incrementalSeconds > 0) {
        console.log(`📤 Enviando tiempo (al salir): ${incrementalSeconds}s (total: ${currentSecondsRef.current}s, last: ${lastRecordedSecondsRef.current}s)`);
        progressApi.recordReadingTime(incrementalSeconds).catch((error) => {
          console.log('No se pudo registrar el tiempo de lectura al salir');
        });
      }
    };
  }, []); // Sin dependencias - solo se ejecuta al desmontar el componente

  useEffect(() => {
    if (verseNumber) {
      setCurrentVerse(parseInt(verseNumber));
      setViewMode('verse');
    } else {
      setViewMode('chapter');
    }
  }, [verseNumber]);

  const loadChapter = async () => {
    try {
      const data = await readingApi.getChapter(bookSlug!, parseInt(chapterNumber!), version);
      setChapter(data);
      setLoading(false);
      // Scroll to top after chapter is loaded
      window.scrollTo(0, 0);

      // Registrar visita al capítulo en modo FREE (sin otorgar XP)
      try {
        await progressApi.trackChapterVisit(data.chapter.id);
      } catch (error) {
        // No mostrar error al usuario, solo logging
        console.log('No se pudo registrar la visita al capítulo');
      }
    } catch (error) {
      console.error('Failed to load chapter:', error);
      setLoading(false);
    }
  };

  const goToPreviousVerse = () => {
    if (currentVerse > 1) {
      const newVerse = currentVerse - 1;
      setCurrentVerse(newVerse);
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${newVerse}`, { replace: true });
    } else if (chapter && parseInt(chapterNumber!) > 1) {
      // Ir al último versículo del capítulo anterior
      navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) - 1}`);
    }
  };

  const goToNextVerse = () => {
    if (chapter && currentVerse < chapter.chapter.verseCount) {
      const newVerse = currentVerse + 1;
      setCurrentVerse(newVerse);
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${newVerse}`, { replace: true });
    } else if (chapter && parseInt(chapterNumber!) < chapter.book.totalChapters) {
      // Ir al primer versículo del siguiente capítulo
      navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) + 1}/1`);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === 'verse') {
      setViewMode('chapter');
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}`, { replace: true });
    } else {
      setViewMode('verse');
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/1`, { replace: true });
    }
  };

  const verses = chapter ? Object.entries(chapter.chapter.verses) : [];
  const currentVerseText = chapter ? chapter.chapter.verses[currentVerse.toString()] : '';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Simple Header - Only Logo and Profile */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            {/* Logo */}
            <Link to="/inicio" className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo-header-manah.png"
                alt="Manah Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah {isAdmin && 'Admin'}
              </h1>
            </Link>

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
        </div>
      </nav>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-lg font-semibold">Cargando capítulos...</p>
          </div>
        </div>
      ) : !chapter ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">No se pudo cargar el capítulo</p>
            <Link
              to={`/lectura-libre/${bookSlug}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              ← <span className="hidden sm:inline">Volver al libro</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Secondary Header */}
          <div className="fixed top-12 sm:top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40 border-b-4 border-indigo-500">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <Link
                  to={`/lectura-libre/${bookSlug}`}
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-semibold text-sm sm:text-base"
                >
                  <span className="text-xl sm:text-2xl">←</span>
                  <span className="hidden sm:inline">Volver</span>
                </Link>
                <div className="text-center flex-1">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                    {chapter.book.name} - Capítulo {chapter.chapter.number}
                  </h1>
                </div>

                {/* Version Selector */}
                <div className="text-right">
                  <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value as any)}
                    className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm font-semibold"
                  >
                    <option value="RV1960">ES RV1960</option>
                    <option value="KJV">EN KJV</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pt-32 sm:pt-36 pb-12">
        {/* View Mode Toggle Button */}
        <div className="text-center mb-6">
          <button
            onClick={toggleViewMode}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition text-sm sm:text-base font-semibold shadow-md"
          >
            {viewMode === 'verse' ? '📖 Ver capítulo completo' : '🔍 Vista por versículo'}
          </button>
        </div>

        {viewMode === 'verse' ? (
          <>
            {/* Single Verse View */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12">
                <div className="text-center mb-4 sm:mb-6">
                  <span className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-full font-bold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                    Versículo {currentVerse}
                  </span>
                  <h2 className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {chapter.book.name} {chapter.chapter.number}:{currentVerse}
                  </h2>
                </div>

                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-800 dark:text-gray-100 leading-relaxed text-center font-serif">
                  "{currentVerseText}"
                </p>

                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {chapter.chapter.title && (
                    <p className="italic">{chapter.chapter.title}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
              <button
                onClick={goToPreviousVerse}
                disabled={currentVerse === 1 && parseInt(chapterNumber!) === 1}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-xl lg:text-2xl">←</span>
                  <span className="hidden sm:inline">Anterior</span>
                </div>
              </button>

              <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                {currentVerse} / {chapter.chapter.verseCount}
              </div>

              <button
                onClick={goToNextVerse}
                disabled={
                  currentVerse === chapter.chapter.verseCount &&
                  parseInt(chapterNumber!) === chapter.book.totalChapters
                }
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">Siguiente</span>
                  <span className="text-lg sm:text-xl lg:text-2xl">→</span>
                </div>
              </button>
            </div>

            {/* Quick Verse Selector */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3 text-center">
                Saltar a versículo:
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2">
                {verses.map(([verseNum]) => (
                  <button
                    key={verseNum}
                    onClick={() => {
                      const num = parseInt(verseNum);
                      setCurrentVerse(num);
                      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${num}`, {
                        replace: true,
                      });
                    }}
                    className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      parseInt(verseNum) === currentVerse
                        ? 'bg-indigo-600 text-white shadow-lg scale-110'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    {verseNum}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Verses */}
            <div className="space-y-6 mb-16">
              {verses.map(([verseNum, verseText]) => (
                <div
                  key={verseNum}
                  className="flex gap-4 group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-lg transition"
                  onClick={() => {
                    const num = parseInt(verseNum);
                    setCurrentVerse(num);
                    setViewMode('verse');
                    navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${num}`, {
                      replace: true,
                    });
                  }}
                >
                  <span className="flex-shrink-0 w-10 text-right text-base font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition">
                    {verseNum}
                  </span>
                  <p className="flex-1 text-lg text-gray-800 dark:text-gray-100 leading-relaxed">{verseText}</p>
                </div>
              ))}
            </div>

            {/* Chapter Navigation */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-8 sm:mb-12 lg:mb-16">
              <button
                onClick={() => navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) - 1}`)}
                disabled={parseInt(chapterNumber!) === 1}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-xl lg:text-2xl">←</span>
                  <span className="hidden sm:inline">Capítulo Anterior</span>
                  <span className="sm:hidden">Anterior</span>
                </div>
              </button>

              <button
                onClick={() => navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) + 1}`)}
                disabled={parseInt(chapterNumber!) === chapter.book.totalChapters}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">Capítulo Siguiente</span>
                  <span className="sm:hidden">Siguiente</span>
                  <span className="text-lg sm:text-xl lg:text-2xl">→</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
}
