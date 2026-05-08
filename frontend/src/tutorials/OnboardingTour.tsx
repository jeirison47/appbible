import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useTutorial } from '../contexts/TutorialContext';

interface OnboardingTourProps {
  run: boolean;
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onComplete }) => {
  const { completeTutorial, skipTutorial } = useTutorial();

  // Detectar si estamos en móvil (< 768px es el breakpoint md de Tailwind)
  const isMobile = window.innerWidth < 768;
  const navSuffix = isMobile ? '-mobile' : '';

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="p-2">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
            ¡Bienvenido a manah! 🎉
          </h2>
          <p className="text-manah-muted">
            Tu compañero para leer la Biblia y crecer espiritualmente.
          </p>
          <p className="text-manah-muted mt-2">
            Te voy a mostrar todas las funcionalidades en solo unos pasos. ¡Vamos a empezar!
          </p>
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: 'nav, header, [class*="nav"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">Menú de Navegación 🧭</h3>
          <p className="text-sm text-manah-muted">
            Aquí encuentras todas las secciones: Inicio, Camino, Lectura Libre, Buscar y Estadísticas.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Usa estos botones para moverte por la app.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: `[data-tutorial="nav-inicio${navSuffix}"]`,
      content: (
        <div>
          <h3 className="font-bold mb-1">Inicio 🏠</h3>
          <p className="text-sm text-manah-muted">
            Tu página principal donde ves tu progreso diario.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Aquí verás tu XP, racha actual y metas del día.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '.border-indigo-500',
      content: (
        <div>
          <h3 className="font-bold mb-1">Puntos de Experiencia (XP) ⭐</h3>
          <p className="text-sm text-manah-muted">
            Ganas XP completando capítulos y por cada minuto que pasas leyendo.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            ¡Sube de nivel acumulando XP y mantén tu racha activa!
                        Cada 10 minutos de lectura = XP adicional. ¡Sube de nivel acumulando XP!

          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '.border-green-500',
      content: (
        <div>
          <h3 className="font-bold mb-1">Metas Diarias 🎯</h3>
          <p className="text-sm text-manah-muted">
            Tu objetivo personal de capítulos para leer hoy.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Puedes personalizar tu meta en tu perfil. Es una meta personal que no afecta tu racha.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '.border-orange-500',
      content: (
        <div>
          <h3 className="font-bold mb-1">Tu Racha 🔥</h3>
          <p className="text-sm text-manah-muted">
            Mantén tu racha leyendo todos los días.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Alcanza tu meta diaria de XP para mantenerla activa. ¡Rompe tu récord personal!
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '.border-purple-500',
      content: (
        <div>
          <h3 className="font-bold mb-1">Tiempo de Lectura Hoy ⏱️</h3>
          <p className="text-sm text-manah-muted">
            Acumula tiempo leyendo la Biblia cada día.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Cada 10 minutos de lectura te da XP adicional. ¡Mientras más leas, más XP ganas!
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: `[data-tutorial="nav-camino${navSuffix}"]`,
      content: (
        <div>
          <h3 className="font-bold mb-1">Modo Camino 📖</h3>
          <p className="text-sm text-manah-muted">
            Lee la Biblia en orden cronológico.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Sigue un recorrido guiado por toda la historia bíblica. Perfecto para leer la Biblia completa de forma ordenada.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: `[data-tutorial="nav-lectura-libre${navSuffix}"]`,
      content: (
        <div>
          <h3 className="font-bold mb-1">Lectura Libre 📚</h3>
          <p className="text-sm text-manah-muted">
            Explora cualquier libro o capítulo que quieras.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Elige tu propio camino de lectura. Ideal para estudios específicos o devocionales.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: `[data-tutorial="nav-buscar${navSuffix}"]`,
      content: (
        <div>
          <h3 className="font-bold mb-1">Buscar 🔍</h3>
          <p className="text-sm text-manah-muted">
            Encuentra versículos, palabras o temas específicos.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Busca en toda la Biblia de forma rápida. Perfecto para estudios bíblicos profundos.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: `[data-tutorial="nav-estadisticas${navSuffix}"]`,
      content: (
        <div>
          <h3 className="font-bold mb-1">Estadísticas 📊</h3>
          <p className="text-sm text-manah-muted">
            Visualiza todo tu progreso y logros.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Ve cuántos capítulos has leído, tu racha más larga, niveles y más. Monitorea tu crecimiento espiritual.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: 'a[href="/perfil"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">Tu Perfil 👤</h3>
          <p className="text-sm text-manah-muted">
            Personaliza tu información y configuración.
          </p>
          <p className="text-sm text-manah-muted mt-1">
            Ajusta tu meta diaria aquí. Puedes volver a ver estos tutoriales cuando quieras.
          </p>
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: 'body',
      content: (
        <div className="p-2">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Delius Swash Caps, cursive' }}>
            ¡Todo listo para empezar! 🚀
          </h2>
          <p className="text-manah-muted">
            Ya conoces todas las funcionalidades de manah.
          </p>
          <p className="text-manah-muted mt-2">
            Comienza a leer, gana XP y mantén tu racha activa. ¡Que Dios bendiga tu tiempo de lectura!
          </p>
        </div>
      ),
      placement: 'center' as const,
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (status === STATUS.FINISHED) {
        completeTutorial('onboarding');
      } else if (status === STATUS.SKIPPED) {
        skipTutorial('onboarding');
      }
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#d6a449',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#d6a449',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
        },
        buttonBack: {
          color: '#b5a98f',
          marginRight: '0.5rem',
        },
        buttonSkip: {
          color: '#b5a98f',
        },
        tooltip: {
          borderRadius: '1rem',
          padding: '1.5rem',
        },
        tooltipContent: {
          padding: '0.5rem 0',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tutorial',
      }}
    />
  );
};
