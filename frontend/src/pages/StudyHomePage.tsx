import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studyApi } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';

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
    <div className="min-h-screen bg-manah-bg font-manrope">
      <Navbar />
      <div className="pt-16 sm:pt-32 max-w-4xl mx-auto px-4 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-manah-cream">Aprender</h1>
          <p className="text-manah-muted text-sm mt-1">
            Estudia la Biblia con ejercicios interactivos. Completa un libro para desbloquear el siguiente.
          </p>
        </div>

        {loading ? (
          <LoadingScreen fullScreen={false} />
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
      <h2 className="text-lg font-bold text-manah-muted mb-3 flex items-center gap-2">
        <span className="w-8 h-0.5 bg-manah-gold"></span>
        {title}
        <span className="w-8 h-0.5 bg-manah-gold"></span>
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
        ? 'bg-manah-card border-manah-deep opacity-60'
        : book.isCompleted
        ? 'bg-manah-card border-green-700 hover:shadow-lg'
        : 'bg-manah-card border-manah-gold/30 hover:border-manah-gold hover:shadow-lg'
    }`}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
        book.isLocked ? 'bg-manah-deep' :
        book.isCompleted ? 'bg-manah-gold/20' :
        'bg-manah-gold/10'
      }`}>
        {book.isLocked ? (
          <svg className="w-5 h-5 text-manah-muted/60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        ) : book.isCompleted ? (
          <svg className="w-5 h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
          </svg>
        )}
      </div>

      <p className="font-bold text-sm text-manah-cream leading-tight mb-1">{book.name}</p>
      <p className="text-xs text-manah-muted mb-2">{book.totalChapters} lecciones</p>

      {!book.isLocked && (
        <div>
          <div className="w-full bg-manah-bg h-1.5">
            <div
              className={`h-1.5 transition-all ${book.isCompleted ? 'bg-manah-gold' : 'bg-manah-gold'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-manah-muted/60 mt-1">{book.completedChapters}/{book.totalChapters}</p>
        </div>
      )}

      {book.isLocked && (
        <p className="text-xs text-manah-muted/60">Completa el libro anterior</p>
      )}
    </div>
  );

  if (book.isLocked) return <div className="cursor-not-allowed">{content}</div>;
  return <Link to={`/aprender/${book.slug}`}>{content}</Link>;
}




