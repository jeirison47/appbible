import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { readingApi, progressApi } from '../services/api';

interface ChapterData {
  book: {
    id: string;
    name: string;
    slug: string;
    testament: string;
    category: string;
    totalChapters: number;
  };
  chapter: {
    id: string;
    number: number;
    title: string;
    content: string;
    verses: Record<string, string>;
    verseCount: number;
  };
  version: string;
  isCompleted?: boolean;
  nextChapter?: {
    number: number;
    title: string;
  };
}

export default function ChapterReaderPage() {
  const { bookSlug, chapterNumber } = useParams<{ bookSlug: string; chapterNumber: string }>();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [version, setVersion] = useState<'RV1960' | 'KJV'>('RV1960');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<any>(null);

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      loadChapter();
    }
  }, [bookSlug, chapterNumber, version]);

  const loadChapter = async () => {
    try {
      const data = await readingApi.getChapter(bookSlug!, parseInt(chapterNumber!), version);
      setChapter(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load chapter:', error);
      setLoading(false);
    }
  };

  const handleCompleteChapter = async () => {
    if (!chapter || completing) return;

    setCompleting(true);
    const readingTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await progressApi.completeChapter({
        chapterId: chapter.chapter.id,
        readingTimeSeconds,
        version,
        readingMode: 'PATH', // Modo Camino
      });

      setRewards(result.rewards);
      setShowRewards(true);
      toast.success('¡Capítulo completado exitosamente!');
    } catch (error: any) {
      console.error('Failed to complete chapter:', error);
      if (error.message === 'Este capítulo ya fue completado') {
        toast.error('Este capítulo ya fue completado', {
          icon: '✓',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
        // Recargar para actualizar el estado
        loadChapter();
      } else {
        toast.error(error.message || 'Error al completar el capítulo');
      }
      setCompleting(false);
    }
  };

  const handleContinue = () => {
    if (rewards && rewards.xp) {
      // Navegar de vuelta al camino del libro
      navigate(`/camino/${bookSlug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No se pudo cargar el capítulo</p>
          <Link to="/camino" className="text-indigo-600 hover:underline mt-4 inline-block">
            Volver al Camino
          </Link>
        </div>
      </div>
    );
  }

  // Rewards Modal
  if (showRewards && rewards) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            {/* Celebration Icon */}
            <div className="text-8xl mb-4">🎉</div>

            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              ¡Capítulo Completado!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {chapter.book.name} {chapter.chapter.number}
            </p>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* XP Reward */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-1">Experiencia Ganada</p>
                <p className="text-4xl font-bold text-indigo-600 mb-2">
                  +{rewards.xp.totalXp} XP
                </p>
                {rewards.xp.leveledUp && (
                  <div className="bg-yellow-400 text-yellow-900 py-2 px-4 rounded-lg font-bold">
                    🎊 ¡Subiste al Nivel {rewards.xp.newLevel}!
                  </div>
                )}
                {rewards.xp.bonuses.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    {rewards.xp.bonuses.map((bonus: string, idx: number) => (
                      <p key={idx}>✨ {bonus}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Streak Reward */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-1">Racha</p>
                <p className="text-4xl font-bold text-orange-600 mb-2">
                  🔥 {rewards.streak.currentStreak} días
                </p>
                {rewards.streak.streakExtended && (
                  <p className="text-sm text-green-600 font-semibold">
                    ✓ Racha extendida
                  </p>
                )}
                {rewards.streak.streakStarted && !rewards.streak.streakExtended && (
                  <p className="text-sm text-blue-600 font-semibold">
                    ⚡ Nueva racha iniciada
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Récord: {rewards.streak.longestStreak} días
                </p>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Meta Diaria</p>
              <p className="text-2xl font-bold text-green-600 mb-3">
                {rewards.dailyGoal.progress} / {rewards.dailyGoal.goal} capítulos
              </p>
              <div className="w-full bg-white rounded-full h-3 mb-2">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${rewards.dailyGoal.percentage}%` }}
                ></div>
              </div>
              {rewards.dailyGoal.completed ? (
                <p className="text-green-700 font-semibold">
                  ✓ ¡Meta diaria completada!
                </p>
              ) : (
                <p className="text-gray-600 text-sm">
                  {rewards.dailyGoal.chaptersRemaining} capítulos restantes
                </p>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Continuar al Camino
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/camino/${bookSlug}`}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Volver
              </Link>
              <div>
                <p className="text-sm text-gray-500">{chapter.book.category}</p>
                <h1 className="text-xl font-bold text-gray-800">
                  {chapter.book.name} {chapter.chapter.number}
                </h1>
              </div>
            </div>

            {/* Version Selector */}
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="RV1960">🇪🇸 RV1960 (Español)</option>
              <option value="KJV">🇬🇧 KJV (English)</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Chapter Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Chapter Title */}
        <div className="mb-12 text-center">
          {chapter.isCompleted && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span className="text-lg">✓</span>
              Capítulo Completado
            </div>
          )}
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {chapter.chapter.title}
          </h2>
          <p className="text-gray-600">
            {chapter.book.name} - Capítulo {chapter.chapter.number}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {chapter.chapter.verseCount} versículos • {version}
          </p>
        </div>

        {/* Verses */}
        <div className="space-y-6 mb-16">
          {Object.entries(chapter.chapter.verses).map(([verseNum, verseText]) => (
            <div key={verseNum} className="flex gap-4 group">
              <span className="flex-shrink-0 w-10 text-right text-base font-bold text-indigo-600 group-hover:text-indigo-700 transition">
                {verseNum}
              </span>
              <p className="flex-1 text-lg text-gray-800 leading-relaxed">
                {verseText}
              </p>
            </div>
          ))}
        </div>

        {/* End of Chapter Separator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="mx-4 text-gray-400 text-sm font-semibold">FIN DEL CAPÍTULO</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Complete Chapter Button - Only at the end */}
        <div className="max-w-2xl mx-auto mb-12">
          {chapter.isCompleted ? (
            <>
              {chapter.nextChapter && chapter.chapter.number < chapter.book.totalChapters ? (
                <button
                  onClick={() => navigate(`/camino/${bookSlug}/${chapter.nextChapter!.number}`)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Siguiente Capítulo</span>
                    <span className="text-2xl">→</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/camino')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Volver al Camino</span>
                    <span className="text-2xl">🏠</span>
                  </div>
                </button>
              )}
              <p className="text-center text-sm text-green-600 mt-4 font-semibold">
                ✓ Ya completaste este capítulo
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleCompleteChapter}
                disabled={completing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:shadow-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {completing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Guardando progreso...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">✓</span>
                    <span>Completar Capítulo</span>
                  </div>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Al completar este capítulo ganarás XP y avanzarás en tu racha
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
