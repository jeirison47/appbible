import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { readingApi, progressApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { BIBLE_VERSIONS, normalizeVersion, DEFAULT_VERSION } from '../utils/bibleVersions';
import { useReadingTimer } from '../hooks/useReadingTimer';
import AppHeader from '../components/AppHeader';
import LoadingScreen from '../components/LoadingScreen';

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
    content: string;
    verses: Array<{ number: number; text: string }>;
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
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [version, setVersion] = useState<string>(normalizeVersion(user?.settings?.bibleVersion || DEFAULT_VERSION));
  const [loading, setLoading] = useState(true);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'verse' | 'chapter'>('verse');

  const { seconds, formattedTime, start, reset } = useReadingTimer();
  const lastRecordedSecondsRef = useRef(0);
  const currentSecondsRef = useRef(0);

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      reset();
      lastRecordedSecondsRef.current = 0;
      loadChapter();
      start();
    }
  }, [bookSlug, chapterNumber, version]);

  useEffect(() => {
    currentSecondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    if (seconds > 0 && seconds % 60 === 0 && seconds !== lastRecordedSecondsRef.current) {
      const incrementalSeconds = seconds - lastRecordedSecondsRef.current;
      lastRecordedSecondsRef.current = seconds;
      progressApi.recordReadingTime(incrementalSeconds).catch(() => {});
    }
  }, [seconds]);

  useEffect(() => {
    return () => {
      const incrementalSeconds = currentSecondsRef.current - lastRecordedSecondsRef.current;
      if (incrementalSeconds > 0) {
        progressApi.recordReadingTime(incrementalSeconds).catch(() => {});
      }
    };
  }, []);

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
      window.scrollTo(0, 0);

      try {
        await progressApi.trackChapterVisit(data.chapter.id);
      } catch (error) {
        console.log('No se pudo registrar la visita al capítulo');
      }
    } catch (error) {
      console.error('Failed to load chapter:', error);
      setLoading(false);
    }
  };

  const verses = chapter ? chapter.chapter.verses : [];

  useEffect(() => {
    if (chapter && viewMode === 'verse' && verses.length > 0) {
      const exists = verses.some((v) => v.number === currentVerse);
      if (!exists) {
        const firstVerse = verses[0].number;
        setCurrentVerse(firstVerse);
        navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${firstVerse}`, { replace: true });
      }
    }
  }, [chapter]);

  const goToPreviousVerse = () => {
    const idx = verses.findIndex((v) => v.number === currentVerse);
    if (idx > 0) {
      const newVerse = verses[idx - 1].number;
      setCurrentVerse(newVerse);
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${newVerse}`, { replace: true });
    } else if (chapter && parseInt(chapterNumber!) > 1) {
      navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) - 1}`);
    }
  };

  const goToNextVerse = () => {
    const idx = verses.findIndex((v) => v.number === currentVerse);
    if (idx >= 0 && idx < verses.length - 1) {
      const newVerse = verses[idx + 1].number;
      setCurrentVerse(newVerse);
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${newVerse}`, { replace: true });
    } else if (chapter && parseInt(chapterNumber!) < chapter.book.totalChapters) {
      navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) + 1}`);
    }
  };

  const toggleViewMode = () => {
    if (viewMode === 'verse') {
      setViewMode('chapter');
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}`, { replace: true });
    } else {
      setViewMode('verse');
      const firstVerse = verses[0]?.number ?? 1;
      navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${firstVerse}`, { replace: true });
    }
  };

  const currentVerseText = chapter
    ? (verses.find((v) => v.number === currentVerse)?.text ?? '')
    : '';
  const currentVerseIndex = verses.findIndex((v) => v.number === currentVerse);

  return (
    <div className="min-h-screen bg-manah-bg font-manrope">
      <AppHeader
        variant="reader"
        contextBar={chapter ? {
          left: (
            <Link to={`/lectura-libre/${bookSlug}`} className="flex items-center gap-1 sm:gap-2 text-manah-muted hover:text-manah-gold transition font-semibold text-sm sm:text-base cursor-pointer">
              <span className="text-xl sm:text-2xl">←</span>
              <span className="hidden sm:inline">Volver</span>
            </Link>
          ),
          center: (
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-manah-cream truncate">
              {chapter.book.name} - Capítulo {chapter.chapter.number}
            </h1>
          ),
          right: (
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="px-2 sm:px-3 py-1 sm:py-2 border border-manah-gold/30 bg-manah-deep text-manah-cream rounded-xl focus:ring-2 focus:ring-manah-gold/50 focus:border-manah-gold text-xs sm:text-sm font-semibold cursor-pointer"
            >
              {BIBLE_VERSIONS.map((v) => (
                <option key={v.code} value={v.code}>{v.label} ({v.lang})</option>
              ))}
            </select>
          ),
        } : undefined}
      />

      {loading ? (
        <LoadingScreen fullScreen={false} text="Cargando..." />
      ) : !chapter ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-manah-card rounded-xl shadow-xl p-8">
            <p className="text-manah-muted text-lg mb-4">No se pudo cargar el capítulo</p>
            <Link
              to={`/lectura-libre/${bookSlug}`}
              className="text-manah-gold hover:underline font-semibold cursor-pointer"
            >
              ← <span className="hidden sm:inline">Volver al libro</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Content */}
          <div className="max-w-6xl mx-auto px-4 pt-14 sm:pt-28 pb-12">
            {/* View Mode Toggle Button */}
            <div className="text-center mb-6">
              <button
                onClick={toggleViewMode}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-manah-gold text-manah-bg rounded-xl hover:bg-manah-bronze transition text-sm sm:text-base font-semibold shadow-md cursor-pointer"
              >
                {viewMode === 'verse' ? 'Ver capítulo completo' : 'Vista por versículo'}
              </button>
            </div>

            {viewMode === 'verse' ? (
              <>
                {/* Single Verse View */}
                <div className="mb-6 sm:mb-8 lg:mb-12">
                  <div className="bg-manah-deep rounded-xl shadow-xl p-6 sm:p-8 lg:p-12 border border-manah-gold/20">
                    <div className="text-center mb-4 sm:mb-6">
                      <span className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-manah-gold text-manah-bg rounded-xl font-bold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
                        Versículo {currentVerse}
                      </span>
                      <h2 className="text-xs sm:text-sm text-manah-muted mb-2">
                        {chapter.book.name} {chapter.chapter.number}:{currentVerse}
                      </h2>
                    </div>

                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-manah-cream leading-relaxed text-center font-serif">
                      "{currentVerseText}"
                    </p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                  <button
                    onClick={goToPreviousVerse}
                    disabled={currentVerseIndex <= 0 && parseInt(chapterNumber!) === 1}
                    className="flex-1 bg-manah-deep hover:bg-manah-deep/80 disabled:opacity-50 disabled:cursor-not-allowed text-manah-cream py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md cursor-pointer border border-manah-gold/20"
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="text-lg sm:text-xl lg:text-2xl">←</span>
                      <span className="hidden sm:inline">Anterior</span>
                    </div>
                  </button>

                  <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-manah-gold/10 text-manah-gold rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap border border-manah-gold/20">
                    {currentVerseIndex + 1} / {verses.length}
                  </div>

                  <button
                    onClick={goToNextVerse}
                    disabled={
                      currentVerseIndex === verses.length - 1 &&
                      parseInt(chapterNumber!) === chapter.book.totalChapters
                    }
                    className="flex-1 bg-manah-gold hover:bg-manah-bronze disabled:opacity-50 disabled:cursor-not-allowed text-manah-bg py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <span className="hidden sm:inline">Siguiente</span>
                      <span className="text-lg sm:text-xl lg:text-2xl">→</span>
                    </div>
                  </button>
                </div>

                {/* Quick Verse Selector */}
                <div className="bg-manah-card rounded-xl p-4 sm:p-6 shadow border border-manah-gold/10">
                  <p className="text-xs sm:text-sm font-semibold text-manah-muted mb-2 sm:mb-3 text-center">
                    Saltar a versículo:
                  </p>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2">
                    {verses.map((v) => (
                      <button
                        key={v.number}
                        onClick={() => {
                          setCurrentVerse(v.number);
                          navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${v.number}`, {
                            replace: true,
                          });
                        }}
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                          v.number === currentVerse
                            ? 'bg-manah-gold text-manah-bg shadow-lg scale-110'
                            : 'bg-manah-deep text-manah-cream hover:bg-manah-gold/10 hover:text-manah-gold'
                        }`}
                      >
                        {v.number}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Verses */}
                <div className="space-y-6 mb-16">
                  {verses.map((v) => (
                    <div
                      key={v.number}
                      className="flex gap-4 group cursor-pointer hover:bg-manah-deep p-2 rounded-xl transition"
                      onClick={() => {
                        setCurrentVerse(v.number);
                        setViewMode('verse');
                        navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${v.number}`, {
                          replace: true,
                        });
                      }}
                    >
                      <span className="flex-shrink-0 w-10 text-right text-base font-bold text-manah-gold group-hover:text-manah-cream transition">
                        {v.number}
                      </span>
                      <p className="flex-1 text-lg text-manah-cream leading-relaxed">{v.text}</p>
                    </div>
                  ))}
                </div>

                {/* Chapter Navigation */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-8 sm:mb-12 lg:mb-16">
                  <button
                    onClick={() => navigate(`/lectura-libre/${bookSlug}/${parseInt(chapterNumber!) - 1}`)}
                    disabled={parseInt(chapterNumber!) === 1}
                    className="flex-1 bg-manah-deep hover:bg-manah-deep/80 disabled:opacity-50 disabled:cursor-not-allowed text-manah-cream py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md cursor-pointer border border-manah-gold/20"
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
                    className="flex-1 bg-manah-gold hover:bg-manah-bronze disabled:opacity-50 disabled:cursor-not-allowed text-manah-bg py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md cursor-pointer"
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



