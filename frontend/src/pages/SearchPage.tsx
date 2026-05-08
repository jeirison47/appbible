import { useState } from 'react';
import { Link } from 'react-router-dom';
import { readingApi } from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';

interface SearchResult {
  book: string;
  bookSlug: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'reference' | 'keyword' | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Por favor ingresa una búsqueda');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await readingApi.searchVerses(query.trim());

      if (data.success) {
        setResults(data.results);
        setSearchType(data.type);

        if (data.results.length === 0) {
          toast('No se encontraron resultados', { icon: '🔍' });
        } else {
          toast.success(`${data.results.length} resultado${data.results.length > 1 ? 's' : ''} encontrado${data.results.length > 1 ? 's' : ''}`);
        }
      } else {
        setResults([]);
        toast.error(data.message || 'No se encontraron resultados');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Error al buscar versículos');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-manah-bg font-manrope pt-16 sm:pt-32 pb-24">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Hero Section */}
        <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 text-center border border-manah-gold/20">
          <div className="flex justify-center mb-2 sm:mb-3">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-manah-cream">Buscar en la Biblia</h2>
          <p className="text-xs sm:text-sm text-manah-muted">
            Busca por referencia (ej: "Juan 3:16") o por palabra clave
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Ej: "Juan 3:16" o "amor"'
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-manah-gold/30 bg-manah-bg text-manah-cream placeholder-manah-muted/50 rounded-xl focus:ring-2 focus:ring-manah-gold/50 focus:border-manah-gold text-base sm:text-lg outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-manah-gold text-manah-bg rounded-xl font-bold text-base sm:text-lg hover:bg-manah-bronze transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-manah-bg"></div>
                    <span className="hidden sm:inline">Buscando...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  'Buscar'
                )}
              </button>
            </div>
          </form>

          {/* Examples */}
          <div className="mt-6 pt-6 border-t border-manah-gold/20">
            <p className="text-sm text-manah-muted font-semibold mb-3">Ejemplos de búsqueda:</p>
            <div className="flex flex-wrap gap-2">
              {['Juan 3:16', 'Salmos 23', 'amor', 'fe'].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-4 py-2 bg-manah-deep text-manah-gold rounded-xl text-sm font-medium hover:bg-manah-gold/10 transition border border-manah-gold/20 cursor-pointer"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="bg-manah-card rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-manah-cream">
                Resultados
                {results.length > 0 && (
                  <span className="ml-2 sm:ml-3 text-base sm:text-lg text-manah-muted font-normal">
                    ({results.length} encontrado{results.length > 1 ? 's' : ''})
                  </span>
                )}
              </h3>
              {searchType && (
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-manah-gold/10 text-manah-gold rounded-xl text-xs sm:text-sm font-semibold w-fit border border-manah-gold/20">
                  {searchType === 'reference' ? 'Referencia' : 'Palabra clave'}
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <svg className="w-16 h-16 text-manah-muted/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <p className="text-lg sm:text-xl text-manah-cream font-semibold mb-2">No se encontraron resultados</p>
                <p className="text-sm sm:text-base text-manah-muted">Intenta con otra búsqueda</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    to={`/lectura-libre/${result.bookSlug}/${result.chapter}`}
                    className="block group"
                  >
                    <div className="bg-manah-deep rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all border-l-4 border-manah-gold">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h4 className="text-base sm:text-lg font-bold text-manah-gold group-hover:text-manah-cream transition">
                          {result.reference}
                        </h4>
                        <svg className="w-5 h-5 text-manah-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                        </svg>
                      </div>
                      <p className="text-manah-cream leading-relaxed text-sm sm:text-base lg:text-lg">
                        {result.text}
                      </p>
                      <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-manah-gold/70 font-semibold group-hover:text-manah-gold transition">
                        <span>Ir al capítulo completo</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!hasSearched && (
          <div className="bg-manah-card rounded-xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-manah-cream mb-6">¿Cómo buscar?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference Search */}
              <div className="border-2 border-manah-gold/30 rounded-xl p-6 bg-manah-deep">
                <div className="flex justify-center mb-3">
                  <svg className="w-10 h-10 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-manah-gold mb-3">Búsqueda por Referencia</h4>
                <p className="text-manah-muted mb-4">
                  Escribe el nombre del libro, capítulo y versículo:
                </p>
                <ul className="space-y-2 text-manah-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-manah-gold font-bold">•</span>
                    <span><strong className="text-manah-cream">Juan 3:16</strong> - Un versículo específico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-manah-gold font-bold">•</span>
                    <span><strong className="text-manah-cream">Salmos 23</strong> - Un capítulo completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-manah-gold font-bold">•</span>
                    <span><strong className="text-manah-cream">Genesis 1:1</strong> - También funciona sin tilde</span>
                  </li>
                </ul>
              </div>

              {/* Keyword Search */}
              <div className="border-2 border-manah-gold/10 rounded-xl p-6 bg-manah-deep">
                <div className="flex justify-center mb-3">
                  <svg className="w-10 h-10 text-manah-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-manah-cream mb-3">Búsqueda por Palabra</h4>
                <p className="text-manah-muted mb-4">
                  Escribe una palabra o frase para encontrar versículos:
                </p>
                <ul className="space-y-2 text-manah-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-manah-muted font-bold">•</span>
                    <span><strong className="text-manah-cream">amor</strong> - Encuentra versículos sobre el amor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-manah-muted font-bold">•</span>
                    <span><strong className="text-manah-cream">fe</strong> - Versículos que hablan de fe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-manah-muted font-bold">•</span>
                    <span><strong className="text-manah-cream">salvación</strong> - Cualquier palabra clave</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



