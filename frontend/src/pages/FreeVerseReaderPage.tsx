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
  const [showVersionPicker, setShowVersionPicker] = useState(false);

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
    if (user && seconds > 0 && seconds % 60 === 0 && seconds !== lastRecordedSecondsRef.current) {
      const incrementalSeconds = seconds - lastRecordedSecondsRef.current;
      lastRecordedSecondsRef.current = seconds;
      progressApi.recordReadingTime(incrementalSeconds).catch(() => {});
    }
  }, [seconds]);

  useEffect(() => {
    return () => {
      if (!user) return;
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

      if (user) {
        try {
          await progressApi.trackChapterVisit(data.chapter.id);
        } catch (error) {
          console.log('No se pudo registrar la visita al capítulo');
        }
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
            <Link to={`/lectura-libre/${bookSlug}`} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-manah-gold flex items-center justify-center">
                <svg className="w-5 h-5 text-manah-bg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                </svg>
              </div>
              <span className="hidden sm:inline text-manah-muted font-semibold text-sm">Volver</span>
            </Link>
          ),
          center: chapter ? (
            <div className="text-center">
              <h1 className="text-xl font-bold text-manah-cream leading-tight">
                {chapter.book.name} · Cap. {chapter.chapter.number}
              </h1>
              <p className="text-xs text-manah-muted mt-0.5">{chapter.book.category}</p>
            </div>
          ) : null,
          right: (
            <div className="relative">
              <button
                onClick={() => setShowVersionPicker(!showVersionPicker)}
                className="w-9 h-9 rounded-xl bg-manah-gold flex items-center justify-center hover:opacity-80 transition cursor-pointer"
              >
                <svg className="w-5 h-5 text-manah-bg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              {showVersionPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowVersionPicker(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-manah-card border border-manah-gold/20 rounded-xl shadow-xl z-50 min-w-[200px] overflow-hidden">
                    <p className="text-xs font-bold text-manah-muted px-4 pt-3 pb-1 uppercase tracking-widest">Versión</p>
                    {BIBLE_VERSIONS.map((v) => (
                      <button
                        key={v.code}
                        onClick={() => { setVersion(v.code); setShowVersionPicker(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-manah-deep cursor-pointer ${version === v.code ? 'text-manah-gold font-bold' : 'text-manah-cream'}`}
                      >
                        {v.label} <span className="text-manah-muted text-xs">({v.lang})</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ),
        } : undefined}
      />

      {loading ? (
        <LoadingScreen fullScreen={false} />
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
          <div className="max-w-6xl mx-auto px-2 sm:px-4 pt-20 sm:pt-36 md:pt-52 pb-12">
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
                <div className="space-y-3 mb-16">
                  {verses.map((v) => (
                    <div
                      key={v.number}
                      className="flex gap-2 sm:gap-4 group cursor-pointer hover:bg-manah-deep rounded-xl transition"
                      onClick={() => {
                        setCurrentVerse(v.number);
                        setViewMode('verse');
                        navigate(`/lectura-libre/${bookSlug}/${chapterNumber}/${v.number}`, {
                          replace: true,
                        });
                      }}
                    >
                      <span className="flex-shrink-0 w-7 sm:w-10 text-right text-base font-bold text-manah-gold group-hover:text-manah-cream transition">
                        {v.number}
                      </span>
                      <p className="flex-1 text-lg text-manah-cream leading-relaxed">{v.text}</p>
                    </div>
                  ))}
                </div>

                {/* End of Chapter Separator */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex-1 h-px bg-manah-gold/20"></div>
                  <div className="mx-4 text-manah-muted text-sm font-semibold">FIN DEL CAPÍTULO</div>
                  <div className="flex-1 h-px bg-manah-gold/20"></div>
                </div>

                {/* Chapter Navigation */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-24 sm:mb-16">
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



