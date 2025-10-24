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
  completed: boolean;
}

export default function CaminoPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    loadBooksData();
  }, []);

  const loadBooksData = async () => {
    try {
      setLoading(true);

      // Hacer solo 2 llamadas API en paralelo
      const [progressRes, booksRes] = await Promise.all([
        progressApi.getMyProgress(),
        readingApi.getBooksWithCompletion(),
      ]);

      // Configurar progreso total (de los stats del progreso del usuario)
      const { stats } = progressRes.data;
      const totalBooks = 66;
      const booksCompleted = stats.booksCompleted || 0;
      const globalProgress = Math.round((booksCompleted / totalBooks) * 100);

      setTotalProgress({
        completed: booksCompleted,
        total: totalBooks,
        percentage: globalProgress,
      });

      // Configurar libros (ya vienen con el campo completed)
      setBooks(booksRes.books);
    } catch (error) {
      console.error('Failed to load camino data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar libros por categoría
  const groupBooksByCategory = () => {
    const grouped: { [key: string]: Book[] } = {};
    books.forEach((book) => {
      if (!grouped[book.category]) {
        grouped[book.category] = [];
      }
      grouped[book.category].push(book);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-green-50 pt-32 pb-28">
      {/* Navbar */}
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando tu camino...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Progress Bar - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t-4 border-indigo-500">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Título */}
            <h1 className="text-base sm:text-xl font-bold text-gray-800 whitespace-nowrap">
              Tu Camino Bíblico
            </h1>

            {/* Barra de progreso con porcentaje dentro */}
            <div className="flex-1 relative">
              <div className="w-full bg-gray-200 rounded-full h-6 sm:h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out relative flex items-center justify-center"
                  style={{ width: `${totalProgress.percentage}%`, minWidth: '50px' }}
                >
                  <span className="text-xs sm:text-sm font-bold text-white z-10">
                    {totalProgress.percentage}%
                  </span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Libros completados */}
            <div className="text-sm sm:text-base font-bold text-gray-700 whitespace-nowrap">
              {totalProgress.completed} / {totalProgress.total}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 text-white mb-4 sm:mb-6">
          <div className="mb-2 sm:mb-3 flex justify-center">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">Tu Aventura Bíblica</h2>
          <p className="text-xs sm:text-sm opacity-90 mb-1">
            Un camino continuo a través de la Palabra de Dios
          </p>
          <p className="text-[10px] sm:text-xs opacity-80">
            Haz click en cualquier libro para ver sus capítulos.
          </p>
        </div>
      </div>

      {/* Books Timeline - Grouped by Category */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        {Object.entries(groupBooksByCategory()).map(([category, categoryBooks], categoryIndex) => {
          let bookCounter = 0;
          // Contar los libros en las categorías anteriores para mantener el patrón alternado
          Object.entries(groupBooksByCategory()).slice(0, categoryIndex).forEach(([_, prevBooks]) => {
            bookCounter += prevBooks.length;
          });

          return (
            <div key={category} className="mb-8">
              {/* Category Header */}
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-800 mb-2">{category}</h2>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full"></div>
              </div>

              {/* Books in this category */}
              <div className="relative">
                {/* Center Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-300 transform -translate-x-1/2"></div>

                {categoryBooks.map((book, index) => {
                  const globalIndex = bookCounter + index;
                  const isLeft = globalIndex % 2 === 0;

                  return (
                    <div key={book.id} className={`relative mb-4 sm:mb-6 ${isLeft ? 'md:pr-[60%]' : 'md:pl-[60%]'}`}>
                      {/* Center Dot */}
                      <div className={`hidden md:block absolute top-12 ${isLeft ? 'right-[50%]' : 'left-[50%]'} transform ${isLeft ? 'translate-x-1/2' : '-translate-x-1/2'} w-3 h-3 rounded-full ${book.testament === 'OLD' ? 'bg-blue-500' : 'bg-purple-500'} border-3 border-white shadow-lg z-10`}></div>

                      <Link to={`/camino/${book.slug}`} className="group block">
                        <div
                          className={`rounded-2xl shadow-xl p-4 sm:p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[240px] sm:min-h-[280px] flex flex-col justify-between ${
                            book.testament === 'OLD'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                              : 'bg-gradient-to-br from-purple-500 to-purple-700'
                          }`}
                        >
                          <div className="flex-1 flex flex-col justify-center">
                            {/* Testament Icon */}
                            <div className="mb-3 flex justify-center">
                              {book.testament === 'OLD' ? (
                                <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                                </svg>
                              ) : (
                                <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                              )}
                            </div>

                            {/* Book Name */}
                            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center">{book.name}</h3>
                            <p className="text-xs sm:text-sm opacity-90 mb-4 text-center">{book.category}</p>

                            {/* Total Chapters */}
                            <div className="bg-white/20 rounded-lg py-3 px-4 backdrop-blur mb-3">
                              <p className="text-xs font-semibold mb-1 text-center">Capítulos</p>
                              <p className="text-2xl sm:text-3xl font-bold text-center">
                                {book.totalChapters}
                              </p>
                            </div>

                            {/* Completion badge */}
                            {book.completed && (
                              <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-2">
                                <span>✓</span>
                                <span>COMPLETADO</span>
                              </div>
                            )}
                          </div>

                          {/* Ver detalles indicator */}
                          <div className="mt-auto pt-3 text-center">
                            <p className="text-sm font-semibold group-hover:underline transition-all">Ver capítulos →</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
