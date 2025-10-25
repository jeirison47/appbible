import { Hono } from 'hono';
import { ProgressController } from '../controllers/progress.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const progress = new Hono();

// Todas las rutas requieren autenticación
progress.use('/*', authMiddleware);

// Completar capítulo
progress.post('/complete-chapter', ProgressController.completeChapter);

// Registrar visita a capítulo (modo FREE)
progress.post('/track-visit', ProgressController.trackChapterVisit);

// Obtener progreso del usuario
progress.get('/me', ProgressController.getMyProgress);

// Obtener progreso de un libro
progress.get('/book/:bookSlug', ProgressController.getBookProgress);

// Meta diaria
progress.put('/daily-goal', ProgressController.updateDailyGoal);
progress.get('/daily-goal/stats', ProgressController.getDailyGoalStats);

// Meta de racha
progress.put('/streak-goal', ProgressController.setStreakGoal);

// Leaderboard
progress.get('/leaderboard', ProgressController.getLeaderboard);

// Tiempo de lectura
progress.post('/reading-time', ProgressController.recordReadingTime);

export default progress;
