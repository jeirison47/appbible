import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readingApi } from '../services/api';
import Navbar from '../components/Navbar';
import { useReadingTimer } from '../hooks/useReadingTimer';

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

  // Timer de lectura
  const { formattedTime, seconds } = useReadingTimer();

  useEffect(() => {
    loadBooks();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-white mb-8 text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-4xl font-bold mb-4">Explora la Biblia</h2>
          <p className="text-xl opacity-90">
            Lee cualquier libro, capítulo o versículo de manera libre
          </p>
        </div>

        {/* Reading Timer Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl">
                ⏱️
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Tiempo de Lectura Hoy</h3>
                <p className="text-sm text-gray-600">Acumula tiempo y gana XP por cada 10 minutos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-orange-600">{formattedTime}</p>
              <p className="text-sm text-gray-500 mt-1">
                {seconds >= 600
                  ? `${Math.floor(seconds / 600)} bloques completados (${Math.floor(seconds / 600) * 10} XP)`
                  : 'Sigue leyendo para ganar XP'}
              </p>
            </div>
          </div>
          {seconds >= 60 && seconds < 600 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progreso al próximo bloque de 10 min</span>
                <span>{Math.floor((seconds % 600) / 60)} / 10 minutos</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((seconds % 600) / 600) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Testament Filter */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedTestament('ALL')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedTestament === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todos ({books.length})
          </button>
          <button
            onClick={() => setSelectedTestament('OLD')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedTestament === 'OLD'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📜 Antiguo Testamento ({books.filter(b => b.testament === 'OLD').length})
          </button>
          <button
            onClick={() => setSelectedTestament('NEW')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              selectedTestament === 'NEW'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ✝️ Nuevo Testamento ({books.filter(b => b.testament === 'NEW').length})
          </button>
        </div>

        {/* Books Grid by Category */}
        <div className="space-y-8">
          {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-600 rounded"></span>
                {category}
                <span className="text-sm font-normal text-gray-500">
                  ({categoryBooks.length} {categoryBooks.length === 1 ? 'libro' : 'libros'})
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryBooks.map((book) => (
                  <Link
                    key={book.id}
                    to={`/lectura-libre/${book.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 h-full transform group-hover:scale-105 group-hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition">
                            {book.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {book.totalChapters} {book.totalChapters === 1 ? 'capítulo' : 'capítulos'}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          book.testament === 'OLD'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {book.testament === 'OLD' ? '📜' : '✝️'}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-indigo-600 font-semibold mt-4">
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
    </div>
  );
}
