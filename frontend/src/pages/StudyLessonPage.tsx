import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studyApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { normalizeVersion, DEFAULT_VERSION } from '../utils/bibleVersions';
import LoadingScreen from '../components/LoadingScreen';

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
    return <LoadingScreen />;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-manah-bg font-manrope flex items-center justify-center">
        <p className="text-manah-muted">No se pudo cargar la lección.</p>
      </div>
    );
  }

  if (phase === 'results') {
    const pct = Math.round((correctCount / exercises.length) * 100);
    const perfect = correctCount === exercises.length;

    return (
      <div className="min-h-screen bg-manah-bg font-manrope flex items-center justify-center p-4">
        <div className="bg-manah-card rounded-xl shadow-2xl border border-manah-gold/20 p-6 sm:p-8 w-full max-w-md text-center">
          <div className="flex justify-center mb-3">
            {perfect ? (
              <svg className="w-14 h-14 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            ) : pct >= 70 ? (
              <svg className="w-14 h-14 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            ) : (
              <svg className="w-14 h-14 text-manah-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h6v16z"/>
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-manah-cream mb-1">
            {perfect ? '¡Perfecto!' : pct >= 70 ? '¡Bien hecho!' : 'Sigue practicando'}
          </h2>
          <p className="text-manah-muted text-sm mb-6">
            {lesson.book.name} · Capítulo {lesson.chapter.number}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Correctas" value={`${correctCount}/${exercises.length}`} color="text-green-400" />
            <StatCard label="Precisión" value={`${pct}%`} color={pct === 100 ? 'text-manah-gold' : pct >= 70 ? 'text-manah-gold' : 'text-orange-400'} />
            <StatCard label="XP Ganado" value={`+${xpEarned}`} color="text-manah-gold" />
          </div>

          {/* Score bar */}
          <div className="w-full bg-manah-bg h-3 mb-6 rounded-full overflow-hidden">
            <div
              className={`h-3 transition-all ${perfect ? 'bg-manah-gold' : pct >= 70 ? 'bg-green-500' : 'bg-orange-400'}`}
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
                className="w-full py-3 bg-manah-deep border border-manah-gold/20 text-manah-cream rounded-xl font-semibold hover:bg-manah-deep/80 transition cursor-pointer"
              >
                Intentar de nuevo
              </button>
            )}
            <button
              onClick={() => navigate(`/aprender/${bookSlug}`)}
              className="w-full py-3 bg-manah-gold hover:bg-manah-bronze text-manah-bg rounded-xl font-semibold hover:shadow-lg transition cursor-pointer"
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
    <div className="min-h-screen bg-manah-bg font-manrope flex flex-col">
      {/* Header */}
      <div className="bg-manah-card border-b border-manah-gold/10 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(`/aprender/${bookSlug}`)}
            className="text-manah-muted hover:text-manah-cream transition text-xl font-bold flex-shrink-0 cursor-pointer"
          >
            ✕
          </button>
          <div className="flex-1">
            <div className="w-full bg-manah-deep h-3 rounded-full overflow-hidden">
              <div
                className="bg-manah-gold h-3 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-manah-muted flex-shrink-0">
            {currentIdx + 1}/{exercises.length}
          </span>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-6">
        {/* Type badge */}
        <div className="mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
            current.type === 'FILL_IN_BLANK'
              ? 'bg-manah-gold/10 text-manah-gold border-manah-gold/20'
              : current.type === 'WHICH_VERSE'
              ? 'bg-manah-deep text-manah-muted border-manah-gold/10'
              : 'bg-manah-gold/10 text-manah-gold border-manah-gold/20'
          }`}>
            {current.type === 'FILL_IN_BLANK' ? 'Completar versículo' :
             current.type === 'WHICH_VERSE' ? 'Identificar versículo' :
             'Selección múltiple'}
          </span>
        </div>

        {/* Question */}
        <div className="bg-manah-card rounded-xl border border-manah-gold/10 p-5 mb-6">
          {current.question.split('\n').map((line, i) => (
            <p key={i} className={`${i === 0 ? 'font-bold text-manah-cream text-base' : 'mt-2 text-manah-muted text-sm leading-relaxed italic'}`}>
              {line}
            </p>
          ))}
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {current.options.map((option, idx) => {
            let style = 'border-manah-gold/20 bg-manah-deep text-manah-cream hover:border-manah-gold/60';

            if (answered) {
              if (idx === current.correctIndex) {
                style = 'border-green-500 bg-green-900/30 text-green-200';
              } else if (idx === selected && idx !== current.correctIndex) {
                style = 'border-red-500 bg-red-900/30 text-red-200';
              } else {
                style = 'border-manah-deep bg-manah-card text-manah-muted/40 opacity-60';
              }
            } else if (selected === idx) {
              style = 'border-manah-gold bg-manah-gold/10 text-manah-gold';
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
                ? 'bg-green-900/30 text-green-300 border border-green-700/30'
                : 'bg-red-900/30 text-red-300 border border-red-700/30'
            }`}>
              {selected === current.correctIndex
                ? '¡Correcto!'
                : `Incorrecto. La respuesta correcta era la opción ${String.fromCharCode(65 + current.correctIndex)}.`}
            </div>
            <button
              onClick={handleContinue}
              disabled={saving}
              className="w-full py-4 bg-manah-gold hover:bg-manah-bronze text-manah-bg rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-60 cursor-pointer"
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
    <div className="bg-manah-deep rounded-xl p-3 border border-manah-gold/10">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-manah-muted mt-0.5">{label}</p>
    </div>
  );
}



