import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { readingApi, progressApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { BIBLE_VERSIONS, normalizeVersion, DEFAULT_VERSION } from '../utils/bibleVersions';
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
  isCompleted?: boolean;
  nextChapter?: {
    number: number;
    title: string;
  };
}

export default function ChapterReaderPage() {
  const { bookSlug, chapterNumber } = useParams<{ bookSlug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [version, setVersion] = useState<string>(normalizeVersion(user?.settings?.bibleVersion || DEFAULT_VERSION));
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<any>(null);
  const [showVersionPicker, setShowVersionPicker] = useState(false);

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      loadChapter();
    }
  }, [bookSlug, chapterNumber, version]);

  useEffect(() => {
    if (showRewards) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
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
        readingMode: 'PATH',
      });

      setRewards(result.rewards);
      setShowRewards(true);
      toast.success('¡Capítulo completado exitosamente!');
    } catch (error: any) {
      console.error('Failed to complete chapter:', error);
      if (error.message === 'Este capítulo ya fue completado') {
        toast.error('Este capítulo ya fue completado', {
          icon: '✓',
          style: { background: '#10B981', color: '#fff' },
        });
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
    handleCloseModal();
    if (chapter.chapter.number < chapter.book.totalChapters) {
      navigate(`/camino/${bookSlug}/${chapter.chapter.number + 1}`);
    } else {
      navigate(`/camino`);
    }
  };

  const rewardsModal = showRewards && rewards && chapter && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={handleCloseModal}></div>

      <div className="relative bg-manah-card rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl border border-manah-gold/30">
        <div className="text-center">
          {/* Celebration Icon */}
          <div className="flex justify-center mb-1">
            <svg className="w-12 h-12 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-manah-cream mb-0.5">
            ¡Completado!
          </h2>
          <p className="text-xs sm:text-sm text-manah-muted mb-2">
            {chapter.book.name} {chapter.chapter.number}
          </p>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            {/* XP Reward */}
            <div className="bg-manah-deep border border-manah-gold/20 rounded-xl p-2.5 md:col-span-2">
              <p className="text-xs text-manah-muted mb-0.5">Experiencia Ganada</p>
              <p className="text-xl sm:text-2xl font-bold text-manah-gold mb-1.5">
                +{rewards.xp.totalXp} XP
              </p>
              {rewards.xp.leveledUp && (
                <div className="bg-manah-gold text-manah-bg py-1 px-2.5 rounded-xl font-bold text-xs">
                  ¡Subiste al Nivel {rewards.xp.newLevel}!
                </div>
              )}
              {rewards.xp.bonuses.length > 0 && (
                <div className="mt-1.5 text-xs text-manah-muted space-y-0.5">
                  {rewards.xp.bonuses.map((bonus: string, idx: number) => (
                    <p key={idx}>+ {bonus}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Progress */}
            {rewards.streak && (
              <div className="bg-manah-deep border border-manah-gold/10 rounded-xl p-2.5 flex flex-col justify-center text-center">
                <p className="text-xs text-manah-muted mb-1">Progreso de Racha de Hoy</p>
                <div className="w-full bg-manah-bg h-1.5 mb-1">
                  <div
                    className="bg-manah-gold h-1.5 transition-all duration-300"
                    style={{ width: `${Math.min((rewards.streak.xpToday / rewards.streak.xpRequired) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-manah-muted">
                  {rewards.streak.xpToday} / {rewards.streak.xpRequired} XP para mantener racha
                </p>
              </div>
            )}

            {/* Daily Goal */}
            <div className="bg-manah-deep border border-manah-gold/10 rounded-xl p-2.5 flex flex-col justify-center text-center">
              <p className="text-xs text-manah-muted mb-1">Meta Diaria</p>
              <p className="text-sm sm:text-base font-bold text-manah-gold mb-1">
                {rewards.dailyGoal.progress} / {rewards.dailyGoal.goal} capítulos
              </p>
              <div className="w-full bg-manah-bg h-1.5 mb-1">
                <div
                  className="bg-manah-gold h-1.5 transition-all duration-300"
                  style={{ width: `${rewards.dailyGoal.percentage}%` }}
                ></div>
              </div>
              {rewards.dailyGoal.completed ? (
                <p className="text-manah-gold font-semibold text-xs">✓ ¡Meta diaria completada!</p>
              ) : (
                <p className="text-manah-muted text-xs">
                  {rewards.dailyGoal.chaptersRemaining} capítulos restantes
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExit}
              className="bg-manah-deep text-manah-cream py-2 px-3 rounded-xl font-semibold hover:bg-manah-deep/80 transition text-sm cursor-pointer"
            >
              Salir
            </button>
            <button
              onClick={handleContinueToNext}
              className="bg-manah-gold text-manah-bg py-2 px-3 rounded-xl font-semibold hover:bg-manah-bronze transition text-sm cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-manah-bg font-manrope relative">
      {rewardsModal}

      <AppHeader
        variant="reader"
        contextBar={chapter ? {
          left: (
            <Link to={`/camino/${bookSlug}`} className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-manah-deep flex items-center justify-center">
                <svg className="w-5 h-5 text-manah-cream" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                </svg>
              </div>
              <span className="hidden sm:inline text-manah-muted font-semibold text-sm">Volver</span>
            </Link>
          ),
          center: (
            <div className="text-center">
              <h1 className="text-xl font-bold text-manah-cream leading-tight">
                {chapter.book.name} · Cap. {chapter.chapter.number}
              </h1>
              <p className="text-xs text-manah-muted mt-0.5">{chapter.book.category}</p>
            </div>
          ),
          right: (
            <div className="relative">
              <button
                onClick={() => setShowVersionPicker(!showVersionPicker)}
                className="w-9 h-9 rounded-xl bg-manah-deep flex items-center justify-center hover:opacity-80 transition cursor-pointer"
              >
                <svg className="w-5 h-5 text-manah-cream" fill="currentColor" viewBox="0 0 24 24">
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
        <LoadingScreen fullScreen={false} text="Cargando capítulo..." />
      ) : !chapter ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] pt-32">
          <div className="text-center bg-manah-card rounded-xl shadow-xl p-8">
            <p className="text-manah-muted text-lg mb-4">No se pudo cargar el capítulo</p>
            <Link to="/camino" className="text-manah-gold hover:underline font-semibold">
              ← <span className="hidden sm:inline">Volver al Camino</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Chapter Content */}
          <div className="max-w-6xl mx-auto px-2 sm:px-4 pt-20 sm:pt-28 pb-12">
            {/* Verses */}
            <div className="space-y-6 mb-16">
              {chapter.chapter.verses.map((v) => (
                <div key={v.number} className="flex gap-2 sm:gap-4 group">
                  <span className="flex-shrink-0 w-7 sm:w-10 text-right text-base font-bold text-manah-gold group-hover:text-manah-cream transition">
                    {v.number}
                  </span>
                  <p className="flex-1 text-lg text-manah-cream leading-relaxed">
                    {v.text}
                  </p>
                </div>
              ))}
            </div>

            {/* End of Chapter Separator */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex-1 h-px bg-manah-gold/20"></div>
              <div className="mx-4 text-manah-muted text-sm font-semibold">FIN DEL CAPÍTULO</div>
              <div className="flex-1 h-px bg-manah-gold/20"></div>
            </div>

            {/* Complete Chapter Button */}
            <div className="max-w-2xl mx-auto mb-12">
              {chapter.isCompleted ? (
                <>
                  {chapter.nextChapter && chapter.chapter.number < chapter.book.totalChapters ? (
                    <button
                      onClick={() => navigate(`/camino/${bookSlug}/${chapter.nextChapter!.number}`)}
                      className="w-full bg-manah-gold text-manah-bg py-5 px-8 rounded-xl font-bold text-xl hover:bg-manah-bronze hover:shadow-2xl transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span>Siguiente Capítulo</span>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/camino')}
                      className="w-full bg-manah-deep text-manah-cream py-5 px-8 rounded-xl font-bold text-xl hover:bg-manah-deep/80 hover:shadow-2xl transition-all transform hover:scale-105 shadow-lg cursor-pointer border border-manah-gold/20"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span>Volver al Camino</span>
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        </svg>
                      </div>
                    </button>
                  )}
                  <p className="text-center text-sm text-manah-gold mt-4 font-semibold">
                    ✓ Ya completaste este capítulo
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCompleteChapter}
                    disabled={completing}
                    className="w-full bg-manah-gold text-manah-bg py-5 px-8 rounded-xl font-bold text-xl hover:bg-manah-bronze hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg cursor-pointer"
                  >
                    {completing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-manah-bg"></div>
                        <span>Guardando progreso...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <span>✓</span>
                        <span>Completar Capítulo</span>
                      </div>
                    )}
                  </button>

                  <p className="text-center text-sm text-manah-muted mt-4">
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



