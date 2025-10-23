import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { readingApi } from '../services/api';

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

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [version, setVersion] = useState<'RV1960' | 'KJV'>('RV1960');
  const [loading, setLoading] = useState(true);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'verse' | 'chapter'>('verse');

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      loadChapter();
    }
  }, [bookSlug, chapterNumber, version]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No se pudo cargar el capítulo</p>
          <Link
            to={`/lectura-libre/${bookSlug}`}
            className="text-indigo-600 hover:underline mt-4 inline-block"
          >
            Volver al libro
          </Link>
        </div>
      </div>
    );
  }

  const verses = Object.entries(chapter.chapter.verses);
  const currentVerseText = chapter.chapter.verses[currentVerse.toString()];

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-0">
      {/* Fixed Header */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Link
              to={`/lectura-libre/${bookSlug}`}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              ← <span className="hidden sm:inline">Volver</span>
            </Link>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">{chapter.book.category}</p>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                {chapter.book.name} {chapter.chapter.number}
                {viewMode === 'verse' && `:${currentVerse}`}
              </h1>
            </div>

            {/* Version Selector */}
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as any)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
            >
              <option value="RV1960">🇪🇸 RV1960</option>
              <option value="KJV">🇬🇧 KJV</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center">
            <button
              onClick={toggleViewMode}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-xs sm:text-sm font-semibold"
            >
              <span className="hidden sm:inline">{viewMode === 'verse' ? '📖 Ver capítulo completo' : '🔍 Vista por versículo'}</span>
              <span className="sm:hidden">{viewMode === 'verse' ? '📖 Capítulo' : '🔍 Versículo'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        {viewMode === 'verse' ? (
          <>
            {/* Single Verse View */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12">
                <div className="text-center mb-4 sm:mb-6">
                  <span className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-full font-bold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                    Versículo {currentVerse}
                  </span>
                  <h2 className="text-xs sm:text-sm text-gray-600 mb-2">
                    {chapter.book.name} {chapter.chapter.number}:{currentVerse}
                  </h2>
                </div>

                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-800 leading-relaxed text-center font-serif">
                  "{currentVerseText}"
                </p>

                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
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

              <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-indigo-100 text-indigo-800 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
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
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 text-center">
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
                        : 'bg-white text-gray-700 hover:bg-indigo-100 hover:text-indigo-600'
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
            {/* Full Chapter View */}
            <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                {chapter.chapter.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {chapter.book.name} - Capítulo {chapter.chapter.number}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {chapter.chapter.verseCount} versículos • {version}
              </p>
            </div>

            {/* Verses */}
            <div className="space-y-4 sm:space-y-6 mb-8">
              {verses.map(([verseNum, verseText]) => (
                <div
                  key={verseNum}
                  className="flex gap-2 sm:gap-3 lg:gap-4 group cursor-pointer hover:bg-indigo-50 p-2 sm:p-3 rounded-lg transition"
                  onClick={() => {
                    const num = parseInt(verseNum);
                    setCurrentVerse(num);
                    setViewMode('verse');
                    navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${num}`, {
                      replace: true,
                    });
                  }}
                >
                  <span className="flex-shrink-0 w-8 sm:w-10 text-right text-sm sm:text-base font-bold text-indigo-600 group-hover:text-indigo-700 transition">
                    {verseNum}
                  </span>
                  <p className="flex-1 text-sm sm:text-base lg:text-lg text-gray-800 leading-relaxed">{verseText}</p>
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
    </div>
  );
}
