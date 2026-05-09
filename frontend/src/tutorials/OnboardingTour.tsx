import React from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useTutorial } from '../contexts/TutorialContext';
import { useTheme } from '../contexts/ThemeContext';

interface OnboardingTourProps {
  run: boolean;
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onComplete }) => {
  const { completeTutorial, skipTutorial } = useTutorial();
  const { theme } = useTheme();

  // Tooltip invertido: dark → fondo claro, light → fondo oscuro
  const tooltipBg    = theme === 'dark' ? '#ffffff' : '#112e28';
  const tooltipText  = theme === 'dark' ? '#0e1f1a' : '#ede4c4';
  const tooltipMuted = theme === 'dark' ? '#163831' : '#b5a98f';

  const isMobile = window.innerWidth < 768;
  const navSuffix = isMobile ? '-mobile' : '';
  const navPlacement = (isMobile ? 'top' : 'bottom') as 'top' | 'bottom';

  const title = (text: string) => (
    <h3 style={{ fontWeight: 700, marginBottom: '4px', color: tooltipText }}>{text}</h3>
  );
  const body = (text: string, mt = false) => (
    <p style={{ fontSize: '0.875rem', color: tooltipMuted, marginTop: mt ? '4px' : undefined }}>{text}</p>
  );

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div style={{ padding: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: tooltipText, fontFamily: 'Delius Swash Caps, cursive' }}>
            ¡Bienvenido a manah! 🎉
          </h2>
          {body('Tu compañero para leer la Biblia y crecer espiritualmente.')}
          {body('Te voy a mostrar todas las funcionalidades en solo unos pasos. ¡Vamos a empezar!', true)}
        </div>
      ),
      placement: 'center' as const,
      disableBeacon: true,
    },
    {
      target: isMobile ? '[data-tutorial="mobile-nav"]' : 'nav',
      content: (
        <div>
          {title('Menú de Navegación 🧭')}
          {body('Aquí encuentras todas las secciones: Inicio, Camino, Aprender, Lectura Libre, Buscar y Estadísticas.')}
          {body('Usa estos botones para moverte por la app.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: `[data-tutorial="nav-inicio${navSuffix}"]`,
      content: (
        <div>
          {title('Inicio 🏠')}
          {body('Tu página principal donde ves tu progreso diario.')}
          {body('Aquí verás tu racha, XP, metas del día y el versículo diario.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: '[data-tutorial="racha-card"]',
      content: (
        <div>
          {title('Tu Racha 🔥')}
          {body('Mantén tu racha leyendo todos los días.')}
          {body('Alcanza tu meta diaria de XP para mantenerla activa. ¡Rompe tu récord personal!', true)}
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '[data-tutorial="xp-card"]',
      content: (
        <div>
          {title('Puntos de Experiencia (XP) ⭐')}
          {body('Ganas XP completando capítulos y lecciones de estudio.')}
          {body('¡Sube de nivel acumulando XP y mantén tu racha activa!', true)}
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '[data-tutorial="meta-card"]',
      content: (
        <div>
          {title('Metas Diarias 🎯')}
          {body('Tu objetivo personal de capítulos para leer hoy.')}
          {body('Puedes personalizar tu meta en tu perfil.', true)}
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '[data-tutorial="tiempo-card"]',
      content: (
        <div>
          {title('Tiempo de Lectura ⏱️')}
          {body('Acumula tiempo leyendo la Biblia cada día.')}
          {body('Cada minuto que lees suma a tu progreso diario.', true)}
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: `[data-tutorial="nav-camino${navSuffix}"]`,
      content: (
        <div>
          {title('Modo Camino 📖')}
          {body('Lee la Biblia en orden cronológico.')}
          {body('Sigue un recorrido guiado por toda la historia bíblica. Perfecto para leer la Biblia completa de forma ordenada.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: `[data-tutorial="nav-aprender${navSuffix}"]`,
      content: (
        <div>
          {title('Modo Aprender 🎓')}
          {body('Practica lo que lees con ejercicios interactivos.')}
          {body('Completa lecciones por capítulo, gana XP y refuerza tu conocimiento bíblico.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: `[data-tutorial="nav-lectura-libre${navSuffix}"]`,
      content: (
        <div>
          {title('Lectura Libre 📚')}
          {body('Explora cualquier libro o capítulo que quieras.')}
          {body('Elige tu propio camino de lectura. Ideal para estudios específicos o devocionales.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: `[data-tutorial="nav-buscar${navSuffix}"]`,
      content: (
        <div>
          {title('Buscar 🔍')}
          {body('Encuentra versículos, palabras o temas específicos.')}
          {body('Busca en toda la Biblia de forma rápida. Perfecto para estudios bíblicos profundos.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: `[data-tutorial="nav-estadisticas${navSuffix}"]`,
      content: (
        <div>
          {title('Estadísticas 📊')}
          {body('Visualiza todo tu progreso y logros.')}
          {body('Ve cuántos capítulos has leído, tu racha más larga, niveles y más.', true)}
        </div>
      ),
      placement: navPlacement,
    },
    {
      target: 'a[href="/perfil"]',
      content: (
        <div>
          {title('Tu Perfil 👤')}
          {body('Personaliza tu información y configuración.')}
          {body('Ajusta tu meta diaria, versión bíblica y preferencias. Puedes volver a ver este tutorial cuando quieras.', true)}
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: '[data-tutorial="theme-toggle"]',
      content: (
        <div>
          {title('Modo claro / oscuro 🌙')}
          {body('Cambia entre el tema claro y oscuro según tu preferencia.')}
          {body('Puedes cambiarlo en cualquier momento desde aquí.', true)}
        </div>
      ),
      placement: 'bottom' as const,
    },
    {
      target: 'body',
      content: (
        <div style={{ padding: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: tooltipText, fontFamily: 'Delius Swash Caps, cursive' }}>
            ¡Todo listo para empezar! 🚀
          </h2>
          {body('Ya conoces todas las funcionalidades de manah.')}
          {body('Comienza a leer, gana XP y mantén tu racha activa. ¡Que Dios bendiga tu tiempo de lectura!', true)}
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
          backgroundColor: tooltipBg,
          textColor: tooltipText,
          arrowColor: tooltipBg,
        },
        buttonNext: {
          backgroundColor: '#d6a449',
          color: '#0e1f1a',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
        },
        buttonBack: {
          color: tooltipMuted,
          marginRight: '0.5rem',
        },
        buttonSkip: {
          color: tooltipMuted,
        },
        tooltip: {
          borderRadius: '1rem',
          padding: '1.5rem',
          backgroundColor: tooltipBg,
        },
        tooltipContent: {
          padding: '0.5rem 0',
          color: tooltipText,
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
