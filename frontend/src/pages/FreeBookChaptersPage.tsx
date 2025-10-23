import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { readingApi } from '../services/api';
import Navbar from '../components/Navbar';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
      {/* Navbar */}
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando capítulos...</p>
          </div>
        </div>
      ) : !book ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8">
            <p className="text-gray-600 text-lg mb-4">No se pudo cargar el libro</p>
            <Link to="/lectura-libre" className="text-indigo-600 hover:underline font-semibold">
              ← Volver a Lectura Libre
            </Link>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/lectura-libre"
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-indigo-600 transition font-semibold text-sm sm:text-base"
            >
              <span className="text-xl sm:text-2xl">←</span>
              <span className="hidden sm:inline">Biblioteca</span>
            </Link>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">{book.category}</p>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{book.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">Capítulos</p>
              <p className="text-lg sm:text-xl font-bold text-indigo-600">{book.totalChapters}</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        {/* Book Header */}
        <div className={`rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-white mb-6 sm:mb-8 lg:mb-12 text-center ${
          book.testament === 'OLD'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700'
            : 'bg-gradient-to-r from-purple-600 to-purple-700'
        }`}>
          <div className="mb-3 sm:mb-4 flex justify-center">
            {book.testament === 'OLD' ? (
              <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
              </svg>
            ) : (
              <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{book.name}</h2>
          <p className="text-base sm:text-lg lg:text-xl opacity-90">{book.category}</p>
          <p className="text-sm sm:text-base lg:text-lg opacity-80 mt-2">
            {book.totalChapters} {book.totalChapters === 1 ? 'capítulo' : 'capítulos'} para explorar
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {book.chapters.map((chapter) => (
            <Link
              key={chapter.number}
              to={`/lectura-libre/${book.slug}/${chapter.number}`}
              className="group"
            >
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-3 sm:p-4 text-center transform group-hover:scale-110 group-hover:-translate-y-2 h-24 sm:h-28 md:h-32 flex flex-col justify-center items-center gap-1 sm:gap-2">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-600 group-hover:scale-125 transition-transform">
                  {chapter.number}
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
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
