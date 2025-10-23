import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { progressApi } from '../services/api';
import Navbar from '../components/Navbar';

interface Chapter {
  id: string;
  number: number;
  title: string;
  verseCount: number;
  isRead: boolean;
  isUnlocked: boolean;
  completedAt?: Date;
}

interface BookProgressData {
  book: {
    id: string;
    name: string;
    slug: string;
    totalChapters: number;
    testament: string;
    category: string;
  };
  progress: {
    chaptersCompleted: number;
    totalChapters: number;
    isCompleted: boolean;
    lastChapterRead: number;
    percentage: number;
  };
  chapters: Chapter[];
}

export default function BookPathPage() {
  const { bookSlug } = useParams<{ bookSlug: string }>();
  const [data, setData] = useState<BookProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookSlug) {
      loadBookProgress();
    }
  }, [bookSlug]);

  const loadBookProgress = async () => {
    try {
      const response = await progressApi.getBookProgress(bookSlug!);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load book progress:', error);
      setLoading(false);
    }
  };

  // Función para determinar la posición horizontal del nodo (1 por fila)
  // Patrón: izquierda → centro → derecha → centro → izquierda...
  const getNodePosition = (index: number): 'left' | 'center' | 'right' => {
    const pattern = index % 4;
    if (pattern === 0) return 'left';
    if (pattern === 1) return 'center';
    if (pattern === 2) return 'right';
    return 'center'; // pattern === 3
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-green-50 pt-32 pb-28">
      {/* Navbar */}
      <Navbar />

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando camino...</p>
          </div>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8">
            <p className="text-gray-600 text-lg mb-4">No se pudo cargar el libro</p>
            <Link to="/camino" className="text-indigo-600 hover:underline font-semibold">
              ← Volver al Camino
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Fixed Header */}
          <nav className="fixed top-16 left-0 right-0 bg-white shadow-md z-40 border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/camino"
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-semibold"
            >
              <span className="text-2xl">←</span>
              <span>Volver</span>
            </Link>
            <div className="text-center">
              <p className="text-sm text-gray-500">{data.book.category}</p>
              <h1 className="text-xl font-bold text-gray-800">{data.book.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progreso</p>
              <p className="text-xl font-bold text-indigo-600">{data.progress.percentage}%</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Título del libro */}
            <h2 className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">
              {data.book.name}
            </h2>

            {/* Barra de progreso con porcentaje dentro */}
            <div className="flex-1 relative">
              <div className="w-full bg-gray-200 rounded-full h-6 sm:h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out relative flex items-center justify-center"
                  style={{ width: `${data.progress.percentage}%`, minWidth: '50px' }}
                >
                  <span className="text-xs sm:text-sm font-bold text-white z-10">
                    {data.progress.percentage}%
                  </span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Capítulos completados */}
            <div className="text-sm sm:text-base font-bold text-gray-700 whitespace-nowrap">
              {data.progress.chaptersCompleted} / {data.progress.totalChapters}
            </div>
          </div>
        </div>
      </div>

      {/* Path Content */}
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12 relative">
        {/* Title Section */}
        <div className="text-center mb-16">
          <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg mb-4 ${
            data.book.testament === 'OLD'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : 'bg-gradient-to-r from-purple-500 to-purple-600'
          }`}>
            {data.book.testament === 'OLD' ? '📜' : '✝️'} {data.book.name}
          </div>
          <p className="text-gray-600 text-lg">
            {data.book.totalChapters} capítulos en tu camino
          </p>
        </div>

        {/* Chapter Path - Duolingo Style */}
        <div className="relative">
          {data.chapters.map((chapter, index) => {
            const position = getNodePosition(index);
            const isNext = !chapter.isRead && chapter.isUnlocked;
            const isCompleted = chapter.isRead;
            const isLocked = !chapter.isUnlocked;

            return (
              <div key={chapter.id} className="relative mb-4">
                {/* Grid with 3 columns */}
                <div className="grid grid-cols-3 items-center mx-auto" style={{ maxWidth: '600px' }}>
                  {/* Left column */}
                  <div className="flex justify-center">
                    {position === 'left' && (
                      <Link
                        to={chapter.isUnlocked ? `/camino/${data.book.slug}/${chapter.number}` : '#'}
                        className={`block ${!chapter.isUnlocked && 'cursor-not-allowed'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        <div className="relative group">
                      {/* Glow effect for next chapter */}
                      {isNext && (
                        <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-60 animate-pulse"></div>
                      )}

                      {/* Main circle */}
                      <div
                        className={`relative w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 transform group-hover:scale-110 ${
                          isCompleted
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                            : isNext
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl ring-4 ring-yellow-300 animate-bounce'
                            : isLocked
                            ? 'bg-gray-300 text-gray-500 shadow'
                            : 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg'
                        }`}
                      >
                        {isCompleted ? (
                          <span className="text-3xl">✓</span>
                        ) : isLocked ? (
                          <span className="text-2xl">🔒</span>
                        ) : (
                          <span>{chapter.number}</span>
                        )}

                        {/* Star decoration for completed */}
                        {isCompleted && (
                          <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse">
                            ⭐
                          </div>
                        )}

                        {/* Next indicator */}
                        {isNext && (
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              ¡SIGUIENTE!
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Chapter Info */}
                      <div className="mt-3 text-center">
                        <p className={`font-bold text-sm ${
                          isCompleted ? 'text-green-700' : isNext ? 'text-orange-700' : 'text-gray-700'
                        }`}>
                          Cap. {chapter.number}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {chapter.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {chapter.verseCount} vs
                        </p>
                      </div>

                      {/* Hover tooltip */}
                      {!isLocked && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                            {isCompleted ? 'Releer capítulo' : 'Leer capítulo'}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                          </div>
                        </div>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Center column */}
                  <div className="flex justify-center">
                    {position === 'center' && (
                      <Link
                        to={chapter.isUnlocked ? `/camino/${data.book.slug}/${chapter.number}` : '#'}
                        className={`block ${!chapter.isUnlocked && 'cursor-not-allowed'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        <div className="relative group">
                          {/* Glow effect for next chapter */}
                          {isNext && (
                            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-60 animate-pulse"></div>
                          )}

                          {/* Main circle */}
                          <div
                            className={`relative w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 transform group-hover:scale-110 ${
                              isCompleted
                                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                                : isNext
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl ring-4 ring-yellow-300 animate-bounce'
                                : isLocked
                                ? 'bg-gray-300 text-gray-500 shadow'
                                : 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg'
                            }`}
                          >
                            {isCompleted ? (
                              <span className="text-3xl">✓</span>
                            ) : isLocked ? (
                              <span className="text-2xl">🔒</span>
                            ) : (
                              <span>{chapter.number}</span>
                            )}

                            {/* Star decoration for completed */}
                            {isCompleted && (
                              <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse">
                                ⭐
                              </div>
                            )}

                            {/* Next indicator */}
                            {isNext && (
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                  ¡SIGUIENTE!
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chapter Info */}
                          <div className="mt-3 text-center">
                            <p className={`font-bold text-sm ${
                              isCompleted ? 'text-green-700' : isNext ? 'text-orange-700' : 'text-gray-700'
                            }`}>
                              Cap. {chapter.number}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {chapter.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {chapter.verseCount} vs
                            </p>
                          </div>

                          {/* Hover tooltip */}
                          {!isLocked && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                {isCompleted ? 'Releer capítulo' : 'Leer capítulo'}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="flex justify-center">
                    {position === 'right' && (
                      <Link
                        to={chapter.isUnlocked ? `/camino/${data.book.slug}/${chapter.number}` : '#'}
                        className={`block ${!chapter.isUnlocked && 'cursor-not-allowed'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        <div className="relative group">
                          {/* Glow effect for next chapter */}
                          {isNext && (
                            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-60 animate-pulse"></div>
                          )}

                          {/* Main circle */}
                          <div
                            className={`relative w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 transform group-hover:scale-110 ${
                              isCompleted
                                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                                : isNext
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl ring-4 ring-yellow-300 animate-bounce'
                                : isLocked
                                ? 'bg-gray-300 text-gray-500 shadow'
                                : 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg'
                            }`}
                          >
                            {isCompleted ? (
                              <span className="text-3xl">✓</span>
                            ) : isLocked ? (
                              <span className="text-2xl">🔒</span>
                            ) : (
                              <span>{chapter.number}</span>
                            )}

                            {/* Star decoration for completed */}
                            {isCompleted && (
                              <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-pulse">
                                ⭐
                              </div>
                            )}

                            {/* Next indicator */}
                            {isNext && (
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                  ¡SIGUIENTE!
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chapter Info */}
                          <div className="mt-3 text-center">
                            <p className={`font-bold text-sm ${
                              isCompleted ? 'text-green-700' : isNext ? 'text-orange-700' : 'text-gray-700'
                            }`}>
                              Cap. {chapter.number}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {chapter.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {chapter.verseCount} vs
                            </p>
                          </div>

                          {/* Hover tooltip */}
                          {!isLocked && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                {isCompleted ? 'Releer capítulo' : 'Leer capítulo'}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completion Celebration */}
          {data.progress.isCompleted && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl shadow-2xl p-12 transform hover:scale-105 transition-transform">
                <div className="text-8xl mb-6 animate-bounce">🎉</div>
                <h3 className="text-4xl font-bold text-white mb-4">
                  ¡Felicidades!
                </h3>
                <p className="text-xl text-white opacity-90 mb-6">
                  Completaste todo el libro de {data.book.name}
                </p>
                <div className="flex gap-4 justify-center">
                  <div className="bg-white/20 rounded-xl px-6 py-3 backdrop-blur">
                    <p className="text-white font-bold text-lg">
                      {data.progress.chaptersCompleted} capítulos
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-6 py-3 backdrop-blur">
                    <p className="text-white font-bold text-lg">
                      100% completado
                    </p>
                  </div>
                </div>
                <Link
                  to="/camino"
                  className="inline-block mt-8 bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                >
                  Volver al Camino
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
