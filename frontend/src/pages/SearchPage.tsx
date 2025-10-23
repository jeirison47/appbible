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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-white mb-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-4xl font-bold mb-4">Buscar en la Biblia</h2>
          <p className="text-xl opacity-90">
            Busca por referencia (ej: "Juan 3:16") o por palabra clave
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Ej: "Juan 3:16" o "amor"'
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Buscando...
                  </div>
                ) : (
                  'Buscar'
                )}
              </button>
            </div>
          </form>

          {/* Examples */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-semibold mb-3">Ejemplos de búsqueda:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuery('Juan 3:16')}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
              >
                Juan 3:16
              </button>
              <button
                onClick={() => setQuery('Salmos 23')}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
              >
                Salmos 23
              </button>
              <button
                onClick={() => setQuery('amor')}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
              >
                amor
              </button>
              <button
                onClick={() => setQuery('fe')}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
              >
                fe
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Resultados
                {results.length > 0 && (
                  <span className="ml-3 text-lg text-gray-500 font-normal">
                    ({results.length} encontrado{results.length > 1 ? 's' : ''})
                  </span>
                )}
              </h3>
              {searchType && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                  {searchType === 'reference' ? '📖 Referencia' : '🔎 Palabra clave'}
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-600 font-semibold mb-2">No se encontraron resultados</p>
                <p className="text-gray-500">Intenta con otra búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    to={`/lectura-libre/${result.bookSlug}/${result.chapter}`}
                    className="block group"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-bold text-blue-700 group-hover:text-blue-800 transition">
                          {result.reference}
                        </h4>
                        <span className="text-2xl">📖</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {result.text}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-semibold">
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

        {/* Instructions (when no search has been made) */}
        {!hasSearched && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">¿Cómo buscar?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reference Search */}
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                <div className="text-4xl mb-3">📖</div>
                <h4 className="text-xl font-bold text-blue-800 mb-3">Búsqueda por Referencia</h4>
                <p className="text-gray-700 mb-4">
                  Escribe el nombre del libro, capítulo y versículo:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Juan 3:16</strong> - Un versículo específico</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Salmos 23</strong> - Un capítulo completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Genesis 1:1</strong> - También funciona sin tilde</span>
                  </li>
                </ul>
              </div>

              {/* Keyword Search */}
              <div className="border-2 border-indigo-200 rounded-xl p-6 bg-indigo-50">
                <div className="text-4xl mb-3">🔎</div>
                <h4 className="text-xl font-bold text-indigo-800 mb-3">Búsqueda por Palabra</h4>
                <p className="text-gray-700 mb-4">
                  Escribe una palabra o frase para encontrar versículos:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong>amor</strong> - Encuentra versículos sobre el amor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong>fe</strong> - Versículos que hablan de fe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong>salvación</strong> - Cualquier palabra clave</span>
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
