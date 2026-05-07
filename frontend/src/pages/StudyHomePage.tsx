import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studyApi } from '../services/api';
import Navbar from '../components/Navbar';

interface StudyBook {
  id: string;
  name: string;
  slug: string;
  testament: string;
  category: string;
  order: number;
  totalChapters: number;
  completedChapters: number;
  isLocked: boolean;
  isCompleted: boolean;
}

export default function StudyHomePage() {
  const [books, setBooks] = useState<StudyBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studyApi.getBooks().then(setBooks).catch(console.error).finally(() => setLoading(false));
  }, []);

  const oldBooks = books.filter(b => b.testament === 'OLD');
  const newBooks = books.filter(b => b.testament === 'NEW');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-28 sm:pt-32 max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Aprender</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Estudia la Biblia con ejercicios interactivos. Completa un libro para desbloquear el siguiente.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <Section title="Antiguo Testamento" books={oldBooks} />
            <Section title="Nuevo Testamento" books={newBooks} />
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, books }: { title: string; books: StudyBook[] }) {
  if (books.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        <span className="w-8 h-0.5 bg-indigo-500 rounded"></span>
        {title}
        <span className="w-8 h-0.5 bg-indigo-500 rounded"></span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

function BookCard({ book }: { book: StudyBook }) {
  const pct = book.totalChapters > 0
    ? Math.round((book.completedChapters / book.totalChapters) * 100)
    : 0;

  const content = (
    <div className={`relative rounded-xl p-3 border-2 transition-all ${
      book.isLocked
        ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
        : book.isCompleted
        ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 hover:shadow-lg'
        : 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-700 hover:border-indigo-400 hover:shadow-lg'
    }`}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${
        book.isLocked ? 'bg-gray-200 dark:bg-gray-700' :
        book.isCompleted ? 'bg-green-100 dark:bg-green-900/50' :
        'bg-indigo-100 dark:bg-indigo-900/50'
      }`}>
        {book.isLocked ? '🔒' : book.isCompleted ? '✅' : '📖'}
      </div>

      <p className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight mb-1">{book.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{book.totalChapters} lecciones</p>

      {/* Progress bar */}
      {!book.isLocked && (
        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${book.isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{book.completedChapters}/{book.totalChapters}</p>
        </div>
      )}

      {book.isLocked && (
        <p className="text-xs text-gray-400 dark:text-gray-500">Completa el libro anterior</p>
      )}
    </div>
  );

  if (book.isLocked) return <div className="cursor-not-allowed">{content}</div>;
  return <Link to={`/aprender/${book.slug}`}>{content}</Link>;
}
