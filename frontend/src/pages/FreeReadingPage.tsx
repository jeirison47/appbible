import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readingApi, progressApi } from '../services/api';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';

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

  return (
    <div className="min-h-screen bg-manah-bg font-manrope pt-16 sm:pt-32 pb-24">
      <Navbar />

      {loading ? (
        <LoadingScreen fullScreen={false} />
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
            {/* Hero Section */}
            <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 text-center mb-4 sm:mb-6 border border-manah-gold/20">
              <div className="mb-2 sm:mb-3 flex justify-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-manah-cream">Explora la Biblia</h2>
              <p className="text-xs sm:text-sm text-manah-muted">
                Lee cualquier libro, capítulo o versículo de manera libre
              </p>
            </div>

            {/* Testament Filter */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
              {[
                { key: 'ALL', label: `Todos (${books.length})` },
                { key: 'OLD', label: `Antiguo Testamento (${books.filter(b => b.testament === 'OLD').length})` },
                { key: 'NEW', label: `Nuevo Testamento (${books.filter(b => b.testament === 'NEW').length})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedTestament(key as 'ALL' | 'OLD' | 'NEW')}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
                    selectedTestament === key
                      ? 'bg-manah-gold text-manah-bg shadow-lg'
                      : 'bg-manah-card text-manah-cream/70 hover:bg-manah-deep hover:text-manah-cream border border-manah-gold/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Books Grid by Category */}
            <div className="space-y-6 sm:space-y-8">
              {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
                <div key={category}>
                  <h3 className="text-xl sm:text-2xl font-bold text-manah-cream mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="w-1.5 sm:w-2 h-6 sm:h-8 bg-manah-gold"></span>
                    {category}
                    <span className="text-xs sm:text-sm font-normal text-manah-muted/60">
                      ({categoryBooks.length} {categoryBooks.length === 1 ? 'libro' : 'libros'})
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {categoryBooks.map((book) => (
                      <Link
                        key={book.id}
                        to={`/lectura-libre/${book.slug}`}
                        className="group"
                      >
                        <div className="bg-manah-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 h-full border border-manah-gold/15 group-hover:border-manah-gold/50">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-base sm:text-lg text-manah-cream group-hover:text-manah-gold transition">
                                {book.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-manah-muted/60 mt-1">
                                {book.totalChapters} {book.totalChapters === 1 ? 'capítulo' : 'capítulos'}
                              </p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-manah-gold/10 rounded-xl">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                              </svg>
                            </div>
                          </div>

                          <div className="flex items-center text-xs sm:text-sm text-manah-gold/70 font-semibold mt-3 sm:mt-4 group-hover:text-manah-gold transition">
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




