import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { progressApi } from '../services/api';
import AppHeader from '../components/AppHeader';
import LoadingScreen from '../components/LoadingScreen';
import PathProgressBar from '../components/PathProgressBar';

interface Chapter {
  id: string;
  number: number;
  verseCount: number;
  isRead: boolean;
  isUnlocked: boolean;
  completedAt?: Date;
}

interface BookProgressData {
  book: {
    id: string;
    name: string;
    slug: string;
    totalChapters: number;
    testament: string;
    category: string;
  };
  progress: {
    chaptersCompleted: number;
    totalChapters: number;
    isCompleted: boolean;
    lastChapterRead: number;
    percentage: number;
  };
  chapters: Chapter[];
}

const COL_POSITIONS = ['12%', '37%', '63%', '88%'];

function getColIndex(i: number): number {
  const period = 6;
  const pos = i % period;
  return pos <= 3 ? pos : 6 - pos;
}

export default function BookPathPage() {
  const { bookSlug } = useParams<{ bookSlug: string }>();
  const [data, setData] = useState<BookProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterNumber, setCurrentChapterNumber] = useState<number | null>(null);
  const currentChapterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bookSlug) loadBookProgress();
  }, [bookSlug]);

  const loadBookProgress = async () => {
    try {
      const response = await progressApi.getBookProgress(bookSlug!);
      setData(response.data);
      const currentChapter = response.data.chapters.find((ch: Chapter) => !ch.isRead);
      if (currentChapter) setCurrentChapterNumber(currentChapter.number);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load book progress:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && currentChapterRef.current) {
      setTimeout(() => {
        currentChapterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, currentChapterNumber]);

  return (
    <div className="min-h-screen bg-manah-bg font-manrope pt-14 sm:pt-28 pb-16">
      <AppHeader
        variant="reader"
        contextBar={data ? {
          left: (
            <Link to="/camino" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
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
              <h1 className="text-xl font-bold text-manah-cream leading-tight">{data.book.name}</h1>
              <p className="text-xs text-manah-muted mt-0.5">{data.book.category}</p>
            </div>
          ),
          right: (
            <button className="w-9 h-9 rounded-xl bg-manah-deep flex items-center justify-center hover:opacity-80 transition cursor-pointer">
              <svg className="w-5 h-5 text-manah-cream" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          ),
        } : undefined}
        subBar={data ? (
          <div className="max-w-sm mx-auto">
            <PathProgressBar
              label={data.book.name}
              completed={data.progress.chaptersCompleted}
              total={data.progress.totalChapters}
              percentage={data.progress.percentage}
            />
          </div>
        ) : undefined}
      />

      {loading ? (
        <LoadingScreen fullScreen={false} text="Cargando camino..." />
      ) : !data ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center bg-manah-card rounded-xl shadow-xl p-8">
            <p className="text-manah-muted text-lg mb-4">No se pudo cargar el libro</p>
            <Link to="/camino" className="text-manah-gold hover:underline font-semibold cursor-pointer">
              ← Volver al Camino
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Path Content */}
          <div className="max-w-sm mx-auto px-4 pt-8 pb-24">
            <div className="text-center mb-8">
              <p className="text-manah-muted text-sm font-semibold">
                {data.book.totalChapters} capítulos en tu camino
              </p>
            </div>

            {/* Zigzag path */}
            <div className="relative">
              {data.chapters.map((chapter, index) => {
                const colIdx = getColIndex(index);
                const nextColIdx = getColIndex(index + 1);
                const colCenter = COL_POSITIONS[colIdx];
                const nextColCenter = COL_POSITIONS[nextColIdx];
                const isNext = !chapter.isRead && chapter.isUnlocked;
                const isCompleted = chapter.isRead;
                const isLocked = !chapter.isUnlocked;
                const isLast = index === data.chapters.length - 1;

                const nodeStyle = isCompleted
                  ? 'bg-manah-gold text-manah-bg'
                  : isNext
                  ? 'bg-manah-card border-2 border-manah-gold text-manah-gold'
                  : isLocked
                  ? 'bg-manah-deep text-manah-muted/40'
                  : 'bg-manah-card border border-manah-gold/20 text-manah-cream';

                const labelStyle = isCompleted || isNext ? 'text-manah-gold' : 'text-manah-muted';

                return (
                  <div key={chapter.id} className="relative h-20">
                    {/* Connector — from bottom edge of current node to top edge of next */}
                    {!isLast && (
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        <line
                          x1={colCenter}
                          y1="50%"
                          x2={nextColCenter}
                          y2="150%"
                          stroke="rgb(var(--manah-gold))"
                          strokeWidth="2"
                          strokeDasharray="6 5"
                          opacity="0.35"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}

                    {/* Node */}
                    <div
                      ref={chapter.number === currentChapterNumber ? currentChapterRef : null}
                      className="absolute"
                      style={{
                        top: '50%',
                        transform: 'translateY(-50%)',
                        left: `calc(${colCenter} - 32px)`,
                      }}
                    >
                      {/* Glow */}
                      {isNext && (
                        <div className="absolute inset-0 rounded-3xl bg-manah-gold/25 blur-lg animate-pulse" />
                      )}

                      <Link
                        to={chapter.isUnlocked ? `/camino/${data.book.slug}/${chapter.number}` : '#'}
                        className={`block relative ${!chapter.isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        {isNext && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                            <span className="bg-manah-card border border-manah-gold/40 text-manah-gold text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              {chapter.number === 1 ? '¡Comienza!' : '¡Continúa!'}
                            </span>
                          </div>
                        )}

                        <div className={`relative w-16 h-16 rounded-3xl flex items-center justify-center shadow-md transition-transform hover:scale-105 ${nodeStyle}`}>
                          {isCompleted ? (
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          ) : isNext ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          ) : isLocked ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                            </svg>
                          ) : (
                            <span className="text-sm font-bold">{chapter.number}</span>
                          )}
                        </div>
                        <p className={`text-xs font-bold text-center mt-1 ${labelStyle}`}>
                          Cap. {chapter.number}
                        </p>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Completion */}
              {data.progress.isCompleted && (
                <div className="mt-16 text-center">
                  <div className="bg-manah-card border border-manah-gold/30 rounded-xl shadow-2xl p-10">
                    <div className="flex justify-center mb-5">
                      <svg className="w-16 h-16 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-manah-cream mb-3">¡Felicidades!</h3>
                    <p className="text-manah-muted mb-6">Completaste todo el libro de {data.book.name}</p>
                    <div className="flex gap-4 justify-center mb-6">
                      <div className="bg-manah-deep px-5 py-2 rounded-xl">
                        <p className="text-manah-cream font-bold">{data.progress.chaptersCompleted} capítulos</p>
                      </div>
                      <div className="bg-manah-deep px-5 py-2 rounded-xl">
                        <p className="text-manah-cream font-bold">100% completado</p>
                      </div>
                    </div>
                    <Link
                      to="/camino"
                      className="inline-block bg-manah-gold hover:bg-manah-bronze text-manah-bg px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg cursor-pointer"
                    >
                      Volver al Camino
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}



