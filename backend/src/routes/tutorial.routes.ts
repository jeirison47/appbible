import { Hono } from 'hono';
import { TutorialController } from '../controllers/tutorial.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const tutorialRoutes = new Hono();

// Aplicar middleware de autenticación a todas las rutas
tutorialRoutes.use('*', authMiddleware);

// GET /api/tutorials/me - Obtener progreso de todos los tutoriales
tutorialRoutes.get('/me', TutorialController.getMyTutorials);

// GET /api/tutorials/should-show-onboarding - Verificar si mostrar onboarding
tutorialRoutes.get('/should-show-onboarding', TutorialController.shouldShowOnboarding);

// PUT /api/tutorials/:tutorialId/progress - Actualizar progreso
tutorialRoutes.put('/:tutorialId/progress', TutorialController.updateProgress);

// POST /api/tutorials/:tutorialId/complete - Completar tutorial
tutorialRoutes.post('/:tutorialId/complete', TutorialController.completeTutorial);

// POST /api/tutorials/:tutorialId/skip - Saltar tutorial
tutorialRoutes.post('/:tutorialId/skip', TutorialController.skipTutorial);

// POST /api/tutorials/:tutorialId/reset - Reiniciar tutorial
tutorialRoutes.post('/:tutorialId/reset', TutorialController.resetTutorial);

export { tutorialRoutes };
