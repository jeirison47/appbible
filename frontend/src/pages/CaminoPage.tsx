import { useEffect, useState, useRef, useCallback } from 'react';
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

interface ChapterNode {
  type: 'chapter';
  bookId: string;
  bookName: string;
  bookSlug: string;
  chapterNumber: number;
  chapterId: string;
  chapterTitle: string;
  isRead: boolean;
  isUnlocked: boolean;
  isNext: boolean;
  globalIndex: number;
}

interface BookMarker {
  type: 'book-marker';
  book: Book;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  globalIndex: number;
}

type PathNode = ChapterNode | BookMarker;

const BOOKS_PER_LOAD = 3; // Cargar 3 libros a la vez

export default function CaminoPage() {
  const [pathNodes, setPathNodes] = useState<PathNode[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loadedBooksCount, setLoadedBooksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProgress, setTotalProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadBooksRange = useCallback(async (books: Book[], startIndex: number, endIndex: number) => {
    try {
      // Validar que no estamos cargando algo que ya está cargado
      if (startIndex < 0 || endIndex > books.length || startIndex >= endIndex) {
        console.warn('Invalid range:', { startIndex, endIndex, booksLength: books.length });
        return;
      }

      const newNodes: PathNode[] = [];
      let globalIndex = pathNodes.length;

      console.log(`📚 Cargando libros ${startIndex} a ${endIndex - 1}`);

      for (let i = startIndex; i < endIndex; i++) {
        const book = books[i];

        // Obtener progreso del libro
        const bookProgressData = await progressApi.getBookProgress(book.slug);
        const { chapters, progress } = bookProgressData.data;

        // Agregar marcador de libro
        newNodes.push({
          type: 'book-marker',
          book,
          progress: {
            completed: progress.chaptersCompleted,
            total: progress.totalChapters,
            percentage: progress.percentage,
          },
          globalIndex: globalIndex++,
        });

        // Agregar todos los capítulos del libro al camino
        chapters.forEach((ch: any) => {
          newNodes.push({
            type: 'chapter',
            bookId: book.id,
            bookName: book.name,
            bookSlug: book.slug,
            chapterNumber: ch.number,
            chapterId: ch.id,
            chapterTitle: ch.title,
            isRead: ch.isRead,
            isUnlocked: ch.isUnlocked,
            isNext: !ch.isRead && ch.isUnlocked,
            globalIndex: globalIndex++,
          });
        });
      }

      setPathNodes((prev) => {
        // Evitar añadir nodos duplicados si ya existen
        const existingBookIds = new Set(
          prev.filter(n => n.type === 'book-marker').map(n => (n as BookMarker).book.id)
        );
        const existingChapterIds = new Set(
          prev.filter(n => n.type === 'chapter').map(n => (n as ChapterNode).chapterId)
        );

        const filteredNewNodes = newNodes.filter(node => {
          if (node.type === 'book-marker') {
            return !existingBookIds.has((node as BookMarker).book.id);
          } else {
            return !existingChapterIds.has((node as ChapterNode).chapterId);
          }
        });

        if (filteredNewNodes.length < newNodes.length) {
          console.warn(`⚠️ Filtrados ${newNodes.length - filteredNewNodes.length} nodos duplicados`);
        }

        console.log(`✅ Añadiendo ${filteredNewNodes.length} nodos nuevos`);
        return [...prev, ...filteredNewNodes];
      });
    } catch (error) {
      console.error('Failed to load books range:', error);
    }
  }, []); // Sin dependencias porque usa setters funcionales

  const loadMoreBooks = useCallback(async () => {
    // Prevenir cargas duplicadas usando ref
    if (isLoadingRef.current || loadedBooksCount >= allBooks.length) return;

    isLoadingRef.current = true;
    setLoadingMore(true);

    try {
      const nextCount = Math.min(loadedBooksCount + BOOKS_PER_LOAD, allBooks.length);
      await loadBooksRange(allBooks, loadedBooksCount, nextCount);
      setLoadedBooksCount(nextCount);
    } catch (error) {
      console.error('Error loading more books:', error);
    } finally {
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [allBooks, loadedBooksCount, loadBooksRange]);

  const loadInitialBooks = async () => {
    try {
      // Cargar progreso global del usuario
      const userProgressData = await progressApi.getMyProgress();
      const { stats } = userProgressData.data;

      // Establecer progreso total (libros completados de 66)
      setTotalProgress({
        completed: stats.booksCompleted,
        total: stats.totalBooks,
        percentage: Math.round((stats.booksCompleted / stats.totalBooks) * 100),
      });

      // Cargar lista de todos los libros
      const booksData = await readingApi.getBooks();
      const availableBooks = booksData.books
        .filter((b: any) => b.isAvailableInPath)
        .sort((a: Book, b: Book) => a.order - b.order);

      setAllBooks(availableBooks);

      // Cargar los primeros libros
      await loadBooksRange(availableBooks, 0, BOOKS_PER_LOAD);
      setLoadedBooksCount(BOOKS_PER_LOAD);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load initial books:', error);
      setLoading(false);
    }
  };

  // Cargar lista de libros inicial
  useEffect(() => {
    loadInitialBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerTarget.current || allBooks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreBooks();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [loadMoreBooks, allBooks.length]);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-green-50 pt-32">
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

      {/* Progress Header */}
      <div className="sticky top-0 bg-white shadow-md z-40 border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
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
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 text-center">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-white mb-6 sm:mb-8 lg:mb-12">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Tu Aventura Bíblica</h2>
          <p className="text-sm sm:text-base lg:text-xl opacity-90 mb-2">
            Un camino continuo a través de la Palabra de Dios
          </p>
          <p className="text-xs sm:text-sm lg:text-lg opacity-80">
            Cada punto es un capítulo. Lee para desbloquear el siguiente.
          </p>
        </div>
      </div>

      {/* Single Continuous Path */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-8">
        <div className="relative">
          {pathNodes.map((node, index) => {
            const prevNode = index > 0 ? pathNodes[index - 1] : null;

            // BOOK MARKER
            if (node.type === 'book-marker') {
              return (
                <div key={`book-${node.book.id}`} className="relative mb-12">
                  {/* Connecting line from previous node */}
                  {prevNode && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 h-8 w-1">
                      <div className="h-full w-full bg-gradient-to-b from-gray-300 to-transparent"></div>
                    </div>
                  )}

                  {/* Book Header Card */}
                  <div className="relative z-10">
                    <div
                      className={`mx-auto w-56 rounded-3xl shadow-2xl p-6 text-white text-center transform transition-all hover:scale-105 ${
                        node.book.testament === 'OLD'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                          : 'bg-gradient-to-br from-purple-500 to-purple-700'
                      }`}
                    >
                      {/* Testament Icon */}
                      <div className="mb-3 flex justify-center">
                        {node.book.testament === 'OLD' ? (
                          <svg className="w-16 h-16 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                          </svg>
                        ) : (
                          <svg className="w-16 h-16 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                          </svg>
                        )}
                      </div>

                      {/* Book Name */}
                      <h3 className="text-2xl font-bold mb-2">{node.book.name}</h3>
                      <p className="text-sm opacity-90 mb-4">{node.book.category}</p>

                      {/* Progress Stats */}
                      <div className="bg-white/20 rounded-xl py-3 px-4 backdrop-blur mb-3">
                        <p className="text-xs font-semibold mb-1">Progreso del Libro</p>
                        <p className="text-2xl font-bold">
                          {node.progress.completed} / {node.progress.total}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden mb-3">
                        <div
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${node.progress.percentage}%` }}
                        ></div>
                      </div>

                      {/* Completion badge */}
                      {node.progress.percentage === 100 && (
                        <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold inline-block">
                          ✓ COMPLETADO
                        </div>
                      )}
                    </div>

                    {/* "Ver todos los capítulos" button */}
                    <div className="text-center mt-4">
                      <Link
                        to={`/camino/${node.book.slug}`}
                        className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg text-sm"
                      >
                        Ver detalles del libro →
                      </Link>
                    </div>

                    {/* Decorative divider */}
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-indigo-300"></div>
                      <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-indigo-300"></div>
                    </div>
                  </div>
                </div>
              );
            }

            // CHAPTER NODE
            const chapter = node as ChapterNode;
            const position = getNodePosition(chapter.chapterNumber - 1);

            return (
              <div key={`chapter-${chapter.chapterId}`} className="relative mb-4">
                {/* Grid with 3 columns */}
                <div className="grid grid-cols-3 items-center mx-auto" style={{ maxWidth: '600px' }}>
                  {/* Left column */}
                  <div className="flex justify-center">
                    {position === 'left' && (
                      <Link
                        to={chapter.isUnlocked ? `/camino/${chapter.bookSlug}/${chapter.chapterNumber}` : '#'}
                        className={`block ${!chapter.isUnlocked && 'cursor-not-allowed'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        <div className="relative group">
                      {/* Glow effect for next chapter */}
                      {chapter.isNext && (
                        <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-60 animate-pulse"></div>
                      )}

                      {/* Main circle */}
                      <div
                        className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 transform group-hover:scale-110 ${
                          chapter.isRead
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                            : chapter.isNext
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl ring-4 ring-yellow-300 animate-bounce'
                            : chapter.isUnlocked
                            ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-300 text-gray-500 shadow'
                        }`}
                      >
                        {chapter.isRead ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        ) : chapter.isUnlocked ? (
                          <span>{chapter.chapterNumber}</span>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                          </svg>
                        )}

                        {/* Star decoration for completed */}
                        {chapter.isRead && (
                          <div className="absolute -top-1 -right-1 animate-pulse">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          </div>
                        )}

                        {/* Next indicator */}
                        {chapter.isNext && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              ¡AHORA!
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Chapter Info */}
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-gray-700">
                          {chapter.bookName} {chapter.chapterNumber}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">{chapter.chapterTitle}</p>
                      </div>

                          {/* Hover tooltip */}
                          {chapter.isUnlocked && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                {chapter.isRead ? 'Releer' : 'Leer'}
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
                        to={chapter.isUnlocked ? `/camino/${chapter.bookSlug}/${chapter.chapterNumber}` : '#'}
                        className={`block ${!chapter.isUnlocked && 'cursor-not-allowed'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        <div className="relative group">
                          {/* Glow effect for next chapter */}
                          {chapter.isNext && (
                            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-60 animate-pulse"></div>
                          )}

                          {/* Main circle */}
                          <div
                            className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 transform group-hover:scale-110 ${
                              chapter.isRead
                                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                                : chapter.isNext
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl ring-4 ring-yellow-300 animate-bounce'
                                : chapter.isUnlocked
                                ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg'
                                : 'bg-gray-300 text-gray-500 shadow'
                            }`}
                          >
                            {chapter.isRead ? (
                              <span className="text-2xl">✓</span>
                            ) : chapter.isUnlocked ? (
                              <span>{chapter.chapterNumber}</span>
                            ) : (
                              <span className="text-xl">🔒</span>
                            )}

                            {/* Star decoration for completed */}
                            {chapter.isRead && (
                              <div className="absolute -top-1 -right-1 text-yellow-400 text-sm animate-pulse">
                                ⭐
                              </div>
                            )}

                            {/* Next indicator */}
                            {chapter.isNext && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                  ¡AHORA!
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chapter Info */}
                          <div className="mt-2 text-center">
                            <p className="text-xs font-bold text-gray-700">
                              {chapter.bookName} {chapter.chapterNumber}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">{chapter.chapterTitle}</p>
                          </div>

                          {/* Hover tooltip */}
                          {chapter.isUnlocked && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                {chapter.isRead ? 'Releer' : 'Leer'}
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
                        to={chapter.isUnlocked ? `/camino/${chapter.bookSlug}/${chapter.chapterNumber}` : '#'}
                        className={`block ${!chapter.isUnlocked && 'cursor-not-allowed'}`}
                        onClick={(e) => !chapter.isUnlocked && e.preventDefault()}
                      >
                        <div className="relative group">
                          {/* Glow effect for next chapter */}
                          {chapter.isNext && (
                            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-60 animate-pulse"></div>
                          )}

                          {/* Main circle */}
                          <div
                            className={`relative w-16 h-16 mx-auto rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 transform group-hover:scale-110 ${
                              chapter.isRead
                                ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg'
                                : chapter.isNext
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl ring-4 ring-yellow-300 animate-bounce'
                                : chapter.isUnlocked
                                ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg'
                                : 'bg-gray-300 text-gray-500 shadow'
                            }`}
                          >
                            {chapter.isRead ? (
                              <span className="text-2xl">✓</span>
                            ) : chapter.isUnlocked ? (
                              <span>{chapter.chapterNumber}</span>
                            ) : (
                              <span className="text-xl">🔒</span>
                            )}

                            {/* Star decoration for completed */}
                            {chapter.isRead && (
                              <div className="absolute -top-1 -right-1 text-yellow-400 text-sm animate-pulse">
                                ⭐
                              </div>
                            )}

                            {/* Next indicator */}
                            {chapter.isNext && (
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                  ¡AHORA!
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Chapter Info */}
                          <div className="mt-2 text-center">
                            <p className="text-xs font-bold text-gray-700">
                              {chapter.bookName} {chapter.chapterNumber}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">{chapter.chapterTitle}</p>
                          </div>

                          {/* Hover tooltip */}
                          {chapter.isUnlocked && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                                {chapter.isRead ? 'Releer' : 'Leer'}
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

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-3 font-semibold">Cargando más libros...</p>
            </div>
          )}

          {/* Intersection Observer Target */}
          {loadedBooksCount < allBooks.length && (
            <div ref={observerTarget} className="h-20"></div>
          )}

          {/* End of path celebration */}
          {loadedBooksCount >= allBooks.length && (
            <div className="text-center py-16 mt-12">
              <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  ¡Has llegado al final!
                </h3>
                <p className="text-gray-600 mb-6">
                  Este es el final de tu camino bíblico. Sigue leyendo para completar todos los capítulos.
                </p>
                <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-indigo-800 font-semibold mb-2">Progreso Total</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {totalProgress.completed} / {totalProgress.total}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">capítulos completados</p>
                </div>
                <Link
                  to="/"
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition"
                >
                  Volver al Inicio
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
