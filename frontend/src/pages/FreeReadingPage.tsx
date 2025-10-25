import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readingApi, progressApi } from '../services/api';
import Navbar from '../components/Navbar';

interface Book {
  id: string;
  name: string;
  slug: string;
  testament: string;
  category: string;
  totalChapters: number;
  order: number;
}

export default function FreeReadingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestament, setSelectedTestament] = useState<'ALL' | 'OLD' | 'NEW'>('ALL');
  const [todayReadingTime, setTodayReadingTime] = useState(0); // Tiempo acumulado en segundos

  useEffect(() => {
    loadBooks();
    loadTodayReadingTime();
  }, []);

  const loadTodayReadingTime = async () => {
    try {
      const data = await progressApi.getMyProgress();
      if (data.data?.dailyGoal?.minutesRead) {
        setTodayReadingTime(data.data.dailyGoal.minutesRead); // Viene en segundos
      }
    } catch (error) {
      console.log('No se pudo cargar el tiempo de lectura');
    }
  };

  const loadBooks = async () => {
    try {
      const data = await readingApi.getBooks();
      setBooks(data.books.sort((a: Book, b: Book) => a.order - b.order));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load books:', error);
      setLoading(false);
    }
  };

  // Formatear tiempo acumulado
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}min ${secs}seg`;
  };

  const filteredBooks = books.filter(book => {
    if (selectedTestament === 'ALL') return true;
    return book.testament === selectedTestament;
  });

  const groupedBooks = filteredBooks.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = [];
    }
    acc[book.category].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-32">
      {/* Navbar */}
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando biblioteca...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 text-white mb-4 sm:mb-6 text-center">
          <div className="mb-2 sm:mb-3 flex justify-center">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Explora la Biblia</h2>
          <p className="text-xs sm:text-sm opacity-90">
            Lee cualquier libro, capítulo o versículo de manera libre
          </p>
        </div>

        {/* Testament Filter */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => setSelectedTestament('ALL')}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
              selectedTestament === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todos ({books.length})
          </button>
          <button
            onClick={() => setSelectedTestament('OLD')}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
              selectedTestament === 'OLD'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📜 Antiguo Testamento ({books.filter(b => b.testament === 'OLD').length})
          </button>
          <button
            onClick={() => setSelectedTestament('NEW')}
            className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all ${
              selectedTestament === 'NEW'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ✝️ Nuevo Testamento ({books.filter(b => b.testament === 'NEW').length})
          </button>
        </div>

        {/* Books Grid by Category */}
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
            <div key={category}>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-indigo-600 rounded"></span>
                {category}
                <span className="text-xs sm:text-sm font-normal text-gray-500">
                  ({categoryBooks.length} {categoryBooks.length === 1 ? 'libro' : 'libros'})
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {categoryBooks.map((book) => (
                  <Link
                    key={book.id}
                    to={`/lectura-libre/${book.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 h-full transform group-hover:scale-105 group-hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-base sm:text-lg text-gray-800 group-hover:text-indigo-600 transition">
                            {book.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {book.totalChapters} {book.totalChapters === 1 ? 'capítulo' : 'capítulos'}
                          </p>
                        </div>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl ${
                          book.testament === 'OLD'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {book.testament === 'OLD' ? '📜' : '✝️'}
                        </div>
                      </div>

                      <div className="flex items-center text-xs sm:text-sm text-indigo-600 font-semibold mt-3 sm:mt-4">
                        <span>Abrir libro</span>
                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
