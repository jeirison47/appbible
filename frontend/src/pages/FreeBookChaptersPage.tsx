import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { readingApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

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
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.some((r) => r.name === 'admin');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Simple Header - Only Logo and Profile */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isAdmin ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo-header-manah.png"
                alt="Manah Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
                manah {isAdmin && 'Admin'}
              </h1>
            </Link>

            {/* Botón Perfil */}
            <Link
              to="/perfil"
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              <span className="hidden sm:inline font-medium">Perfil</span>
            </Link>
          </div>
        </div>
      </nav>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando capítulos...</p>
          </div>
        </div>
      ) : !book ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8">
            <p className="text-gray-600 text-lg mb-4">No se pudo cargar el libro</p>
            <Link to="/lectura-libre" className="text-indigo-600 hover:underline font-semibold">
              ← Volver a Lectura Libre
            </Link>
          </div>
        </div>
      ) : (
        <>
      {/* Secondary Header */}
      <nav className="fixed top-12 sm:top-16 left-0 right-0 bg-white shadow-md z-40 border-b-4 border-indigo-500">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-36 sm:pt-40 pb-6">
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
