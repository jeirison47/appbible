import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { studyApi } from '../services/api';
import AppHeader from '../components/AppHeader';
import PathProgressBar from '../components/PathProgressBar';
import LoadingScreen from '../components/LoadingScreen';

interface ChapterData {
  id: string;
  number: number;
  verseCount: number;
  isCompleted: boolean;
  isLocked: boolean;
  score: number | null;
  maxScore: number | null;
}

interface BookData {
  id: string;
  name: string;
  slug: string;
  testament: string;
  category: string;
  totalChapters: number;
}

export default function StudyBookPage() {
  const { bookSlug } = useParams<{ bookSlug: string }>();
  const [data, setData] = useState<{ book: BookData; chapters: ChapterData[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookSlug) {
      studyApi.getBook(bookSlug).then(setData).catch(console.error).finally(() => setLoading(false));
    }
  }, [bookSlug]);

  const completed = data ? data.chapters.filter(c => c.isCompleted).length : 0;
  const pct = data ? Math.round((completed / data.chapters.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-manah-bg font-manrope pt-32 sm:pt-60 pb-28">
      <AppHeader
        variant="reader"
        contextBar={data ? {
          left: (
            <Link to="/aprender" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-manah-gold flex items-center justify-center">
                <svg className="w-5 h-5 text-manah-bg" fill="currentColor" viewBox="0 0 24 24">
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
        } : undefined}
        subBar={data ? (
          <PathProgressBar
            label={data.book.name}
            completed={completed}
            total={data.chapters.length}
            percentage={pct}
          />
        ) : undefined}
      />

      {loading ? (
        <LoadingScreen fullScreen={false} />
      ) : !data ? null : (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-2">
            {data.chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} bookSlug={data.book.slug} bookName={data.book.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterCard({ chapter, bookSlug, bookName }: { chapter: ChapterData; bookSlug: string; bookName: string }) {
  const isNext = !chapter.isCompleted && !chapter.isLocked;
  const scorePct = chapter.score != null && chapter.maxScore
    ? Math.round((chapter.score / chapter.maxScore) * 100)
    : null;

  const content = (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
      chapter.isLocked
        ? 'bg-manah-card border-manah-deep opacity-60'
        : chapter.isCompleted
        ? 'bg-manah-card border-green-700 hover:shadow-md'
        : isNext
        ? 'bg-manah-card border-manah-gold shadow-md ring-2 ring-manah-gold/20 hover:shadow-lg'
        : 'bg-manah-card border-manah-gold/20 hover:border-manah-gold/40 hover:shadow-md'
    }`}>
      {/* Circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
        chapter.isLocked ? 'bg-manah-deep text-manah-muted/60' :
        chapter.isCompleted ? 'bg-manah-gold text-manah-bg' :
        isNext ? 'bg-manah-gold text-manah-bg shadow-lg' :
        'bg-manah-deep text-manah-cream'
      }`}>
        {chapter.isLocked ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        ) : chapter.isCompleted ? '✓' : chapter.number}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${
          chapter.isLocked ? 'text-manah-muted/60' : 'text-manah-cream'
        }`}>
          {isNext && <span className="text-xs bg-manah-gold/20 text-manah-gold px-2 py-0.5 rounded-xl mr-2 font-bold">SIGUIENTE</span>}
          Lección {chapter.number}
        </p>
        <p className="text-xs text-manah-muted">
          {chapter.verseCount} versículos
          {scorePct != null && ` · Puntuación: ${scorePct}%`}
        </p>
      </div>

      {/* Right arrow or score */}
      {!chapter.isLocked && (
        <div className="text-manah-muted flex-shrink-0">
          {chapter.isCompleted && scorePct != null ? (
            <span className={`text-sm font-bold ${scorePct === 100 ? 'text-manah-gold' : 'text-green-400'}`}>
              {scorePct === 100 ? '★ 100%' : `✓ ${scorePct}%`}
            </span>
          ) : (
            <span className="text-xl">→</span>
          )}
        </div>
      )}
    </div>
  );

  if (chapter.isLocked) return <div className="cursor-not-allowed">{content}</div>;
  return <Link to={`/aprender/${bookSlug}/${chapter.number}`}>{content}</Link>;
}
