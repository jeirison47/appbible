import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { studyApi } from '../services/api';
import Navbar from '../components/Navbar';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center pt-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { book, chapters } = data;
  const completed = chapters.filter(c => c.isCompleted).length;
  const pct = Math.round((completed / chapters.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-28 sm:pt-32 max-w-2xl mx-auto px-4 pb-12">
        {/* Header */}
        <div className="mb-6">
          <Link to="/aprender" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-3">
            ← Todos los libros
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{book.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{book.category} · {book.totalChapters} lecciones</p>

          {/* Overall progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{completed} completadas</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapters list */}
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} bookSlug={book.slug} bookName={book.name} />
          ))}
        </div>
      </div>
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
        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
        : chapter.isCompleted
        ? 'bg-white dark:bg-gray-800 border-green-300 dark:border-green-700 hover:shadow-md'
        : isNext
        ? 'bg-white dark:bg-gray-800 border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-800 hover:shadow-lg'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
    }`}>
      {/* Circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
        chapter.isLocked ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' :
        chapter.isCompleted ? 'bg-green-500 text-white' :
        isNext ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' :
        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {chapter.isLocked ? '🔒' : chapter.isCompleted ? '✓' : chapter.number}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${
          chapter.isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
        }`}>
          {isNext && <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full mr-2 font-bold">SIGUIENTE</span>}
          Lección {chapter.number}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {chapter.verseCount} versículos
          {scorePct != null && ` · Puntuación: ${scorePct}%`}
        </p>
      </div>

      {/* Right arrow or stars */}
      {!chapter.isLocked && (
        <div className="text-gray-400 dark:text-gray-500 flex-shrink-0">
          {chapter.isCompleted && scorePct != null ? (
            <span className={`text-sm font-bold ${scorePct === 100 ? 'text-yellow-500' : 'text-green-500'}`}>
              {scorePct === 100 ? '⭐ 100%' : `✓ ${scorePct}%`}
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
