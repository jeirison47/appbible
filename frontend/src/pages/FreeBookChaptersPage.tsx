import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { readingApi } from '../services/api';
import AppHeader from '../components/AppHeader';
import LoadingScreen from '../components/LoadingScreen';

interface Chapter {
  number: number;
  title: string;
  verseCount: number;
}

interface BookData {
  id: string;
  name: string;
  slug: string;
  testament: string;
  category: string;
  totalChapters: number;
  chapters: Chapter[];
}

export default function FreeBookChaptersPage() {
  const { bookSlug } = useParams<{ bookSlug: string }>();
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookSlug) {
      loadBook();
    }
  }, [bookSlug]);

  const loadBook = async () => {
    try {
      const data = await readingApi.getBook(bookSlug!);
      setBook(data.book);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load book:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-manah-bg font-manrope">
      <AppHeader
        variant="reader"
        contextBar={book ? {
          left: (
            <Link to="/lectura-libre" className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-manah-gold flex items-center justify-center">
                <svg className="w-5 h-5 text-manah-bg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
                </svg>
              </div>
              <span className="hidden sm:inline text-manah-muted font-semibold text-sm">Biblioteca</span>
            </Link>
          ),
          center: (
            <div className="text-center">
              <p className="text-xs text-manah-muted">{book.category}</p>
              <h1 className="text-lg sm:text-xl font-bold text-manah-cream leading-tight">{book.name}</h1>
            </div>
          ),
          right: (
            <div className="w-9 h-9 rounded-xl bg-manah-gold flex items-center justify-center">
              <svg className="w-5 h-5 text-manah-bg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
          ),
        } : undefined}
      />

      {loading ? (
        <LoadingScreen fullScreen={false} />
      ) : !book ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-manah-card rounded-xl shadow-xl p-8">
            <p className="text-manah-muted text-lg mb-4">No se pudo cargar el libro</p>
            <Link to="/lectura-libre" className="text-manah-gold hover:underline font-semibold">
              ← <span className="hidden sm:inline">Volver a Lectura Libre</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Content */}
          <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-20 sm:pt-36 md:pt-52 pb-24">
            {/* Chapters Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
              {book.chapters.map((chapter) => (
                <Link
                  key={chapter.number}
                  to={`/lectura-libre/${book.slug}/${chapter.number}`}
                  className="group cursor-pointer"
                >
                  <div className="bg-manah-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-2 sm:p-4 text-center transform group-hover:scale-110 group-hover:-translate-y-2 h-16 sm:h-28 md:h-32 flex flex-col justify-center items-center gap-1 sm:gap-2 border border-manah-gold/15 group-hover:border-manah-gold/50">
                    <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-manah-gold group-hover:scale-125 transition-transform">
                      {chapter.number}
                    </div>
                    <p className="text-xs sm:text-sm text-manah-muted/60">
                      {chapter.verseCount} vs
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}



