import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readingApi, progressApi } from '../services/api';
import AppHeader from '../components/AppHeader';
import LoadingScreen from '../components/LoadingScreen';
import PathProgressBar from '../components/PathProgressBar';

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

      const [progressRes, booksRes] = await Promise.all([
        progressApi.getMyProgress(),
        readingApi.getBooksWithCompletion(),
      ]);

      const { stats } = progressRes.data;
      const totalBooks = 66;
      const booksCompleted = stats.booksCompleted || 0;
      const globalProgress = Math.round((booksCompleted / totalBooks) * 100);

      setTotalProgress({
        completed: booksCompleted,
        total: totalBooks,
        percentage: globalProgress,
      });

      setBooks(booksRes.books);
    } catch (error) {
      console.error('Failed to load camino data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-manah-bg pt-24 sm:pt-40 pb-24 overflow-x-hidden font-manrope">
      <AppHeader
        variant="global"
        subBar={!loading ? (
          <div className="max-w-4xl mx-auto">
            <PathProgressBar
              label="Tu Camino"
              completed={totalProgress.completed}
              total={totalProgress.total}
              percentage={totalProgress.percentage}
            />
          </div>
        ) : undefined}
      />

      {loading ? (
        <LoadingScreen fullScreen={false} text="Cargando tu camino..." />
      ) : (
        <>

          {/* Hero Section */}
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center">
            <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 border border-manah-gold/20">
              <div className="mb-2 sm:mb-3 flex justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-manah-cream">Tu Aventura Bíblica</h2>
              <p className="text-xs sm:text-sm text-manah-muted mb-1">
                Un camino continuo a través de la Palabra de Dios
              </p>
              <p className="text-[10px] sm:text-xs text-manah-muted/60">
                Haz click en cualquier libro para ver sus capítulos.
              </p>
            </div>
          </div>

          {/* Books Timeline - Grouped by Category */}
          <div className="max-w-3xl mx-auto px-3 sm:px-4 overflow-x-hidden">
            {Object.entries(groupBooksByCategory()).map(([category, categoryBooks], categoryIndex) => {
              let bookCounter = 0;
              Object.entries(groupBooksByCategory()).slice(0, categoryIndex).forEach(([_, prevBooks]) => {
                bookCounter += prevBooks.length;
              });

              return (
                <div key={category} className="mb-8">
                  {/* Category Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-manah-cream mb-2">{category}</h2>
                    <div className="w-24 h-px bg-manah-gold/50 mx-auto"></div>
                  </div>

                  {/* Books in this category */}
                  <div className="relative">
                    {/* Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-manah-gold/20 transform -translate-x-1/2"></div>

                    {categoryBooks.map((book, index) => {
                      const globalIndex = bookCounter + index;
                      const isLeft = globalIndex % 2 === 0;

                      return (
                        <div key={book.id} className={`relative mb-4 sm:mb-6 ${isLeft ? 'pr-[52%] md:pr-[60%]' : 'pl-[52%] md:pl-[60%]'}`}>
                          {/* Center Dot */}
                          <div className={`absolute top-12 ${isLeft ? 'right-[50%]' : 'left-[50%]'} transform ${isLeft ? 'translate-x-1/2' : '-translate-x-1/2'} w-3 h-3 bg-manah-gold border-2 border-manah-bg shadow-md z-10`}></div>

                          <Link to={`/camino/${book.slug}`} className="group block">
                            <div className={`rounded-xl shadow-xl p-4 sm:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[240px] sm:min-h-[280px] flex flex-col justify-between border ${
                              book.completed ? 'bg-manah-deep border-manah-gold/30' : 'bg-manah-card border-manah-gold/15'
                            }`}>
                              <div className="flex-1 flex flex-col justify-center">
                                {/* Book Icon */}
                                <div className="mb-3 flex justify-center">
                                  <svg className="w-12 h-12 sm:w-14 sm:h-14 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                                  </svg>
                                </div>

                                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center text-manah-cream">{book.name}</h3>

                                <div className="bg-manah-bg/50 rounded-xl py-3 px-4 mb-3">
                                  <p className="text-xs font-semibold mb-1 text-center text-manah-muted">Capítulos</p>
                                  <p className="text-2xl sm:text-3xl font-bold text-center text-manah-gold">
                                    {book.totalChapters}
                                  </p>
                                </div>

                                {book.completed && (
                                  <div className="bg-manah-gold text-manah-bg px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                    <span>✓</span>
                                    <span>COMPLETADO</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-auto pt-3 text-center">
                                <p className="text-sm font-semibold text-manah-gold/70 group-hover:text-manah-gold transition-all">Ver capítulos →</p>
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



