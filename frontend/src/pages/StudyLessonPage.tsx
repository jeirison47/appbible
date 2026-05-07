import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { normalizeVersion, DEFAULT_VERSION } from '../utils/bibleVersions';

interface Exercise {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'WHICH_VERSE';
  question: string;
  options: string[];
  correctIndex: number;
  verseNumber: number;
}

interface LessonData {
  book: { name: string; slug: string };
  chapter: { id: string; number: number };
  exercises: Exercise[];
  totalExercises: number;
}

type Phase = 'lesson' | 'results';

export default function StudyLessonPage() {
  const { bookSlug, chapterNumber } = useParams<{ bookSlug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('lesson');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const version = normalizeVersion(user?.settings?.bibleVersion || DEFAULT_VERSION);

  useEffect(() => {
    if (bookSlug && chapterNumber) {
      studyApi.getLesson(bookSlug, parseInt(chapterNumber), version)
        .then(setLesson)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [bookSlug, chapterNumber, version]);

  const exercises = lesson?.exercises ?? [];
  const current = exercises[currentIdx];
  const isLast = currentIdx === exercises.length - 1;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === current.correctIndex) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleContinue = async () => {
    if (!answered) return;

    if (isLast) {
      // Save results
      const finalCorrect = selected === current.correctIndex
        ? correctCount
        : correctCount;

      setSaving(true);
      try {
        const res = await studyApi.completeLesson({
          chapterId: lesson!.chapter.id,
          score: finalCorrect,
          maxScore: exercises.length,
        });
        setXpEarned(res.xpEarned);
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
        setPhase('results');
      }
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Preparando lección...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">No se pudo cargar la lección.</p>
      </div>
    );
  }

  if (phase === 'results') {
    const pct = Math.round((correctCount / exercises.length) * 100);
    const perfect = correctCount === exercises.length;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-3">{perfect ? '🏆' : pct >= 70 ? '🎉' : '📚'}</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {perfect ? '¡Perfecto!' : pct >= 70 ? '¡Bien hecho!' : 'Sigue practicando'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {lesson.book.name} · Capítulo {lesson.chapter.number}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Correctas" value={`${correctCount}/${exercises.length}`} color="text-green-600 dark:text-green-400" />
            <StatCard label="Precisión" value={`${pct}%`} color={pct === 100 ? 'text-yellow-500' : pct >= 70 ? 'text-indigo-600 dark:text-indigo-400' : 'text-orange-500'} />
            <StatCard label="XP Ganado" value={`+${xpEarned}`} color="text-purple-600 dark:text-purple-400" />
          </div>

          {/* Score bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
            <div
              className={`h-3 rounded-full transition-all ${perfect ? 'bg-yellow-400' : pct >= 70 ? 'bg-green-500' : 'bg-orange-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-col gap-3">
            {pct < 100 && (
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setSelected(null);
                  setAnswered(false);
                  setCorrectCount(0);
                  setPhase('lesson');
                  setLoading(true);
                  studyApi.getLesson(bookSlug!, parseInt(chapterNumber!), version)
                    .then(setLesson)
                    .catch(console.error)
                    .finally(() => setLoading(false));
                }}
                className="w-full py-3 bg-white dark:bg-gray-700 border-2 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
              >
                Intentar de nuevo
              </button>
            )}
            <button
              onClick={() => navigate(`/aprender/${bookSlug}`)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              {perfect ? 'Continuar' : 'Volver a lecciones'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lesson phase
  const progress = ((currentIdx) / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(`/aprender/${bookSlug}`)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-xl font-bold flex-shrink-0"
          >
            ✕
          </button>
          <div className="flex-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
            {currentIdx + 1}/{exercises.length}
          </span>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-6">
        {/* Type badge */}
        <div className="mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            current.type === 'FILL_IN_BLANK'
              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
              : current.type === 'WHICH_VERSE'
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          }`}>
            {current.type === 'FILL_IN_BLANK' ? 'Completar versículo' :
             current.type === 'WHICH_VERSE' ? 'Identificar versículo' :
             'Selección múltiple'}
          </span>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-6">
          {current.question.split('\n').map((line, i) => (
            <p key={i} className={`${i === 0 ? 'font-bold text-gray-800 dark:text-gray-100 text-base' : 'mt-2 text-gray-700 dark:text-gray-200 text-sm leading-relaxed italic'}`}>
              {line}
            </p>
          ))}
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {current.options.map((option, idx) => {
            let style = 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20';

            if (answered) {
              if (idx === current.correctIndex) {
                style = 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
              } else if (idx === selected && idx !== current.correctIndex) {
                style = 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
              } else {
                style = 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60';
              }
            } else if (selected === idx) {
              style = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all ${style} cursor-pointer disabled:cursor-default`}
              >
                <span className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    answered && idx === current.correctIndex ? 'border-green-500 bg-green-500 text-white' :
                    answered && idx === selected ? 'border-red-500 bg-red-500 text-white' :
                    'border-current'
                  }`}>
                    {answered && idx === current.correctIndex ? '✓' :
                     answered && idx === selected ? '✕' :
                     String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback + Continue */}
        {answered && (
          <div className="mt-6">
            <div className={`p-3 rounded-xl mb-4 text-sm font-semibold ${
              selected === current.correctIndex
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {selected === current.correctIndex
                ? '¡Correcto! 🎉'
                : `Incorrecto. La respuesta correcta era la opción ${String.fromCharCode(65 + current.correctIndex)}.`}
            </div>
            <button
              onClick={handleContinue}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-60"
            >
              {saving ? 'Guardando...' : isLast ? 'Ver resultados' : 'Continuar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
