import { Context } from 'hono';
import { ProgressService } from '../services/progress.service';
import { DailyGoalService } from '../services/dailyGoal.service';

export class ProgressController {
  /**
   * POST /api/progress/complete-chapter
   * Marca un capítulo como completado
   */
  static async completeChapter(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();

      const { chapterId, readingTimeSeconds, version = 'RV1960', readingMode = 'FREE' } = body;

      if (!chapterId || !readingTimeSeconds) {
        return c.json(
          {
            success: false,
            message: 'chapterId y readingTimeSeconds son requeridos',
          },
          400
        );
      }

      // Validar readingMode
      if (!['PATH', 'FREE'].includes(readingMode)) {
        return c.json(
          {
            success: false,
            message: 'readingMode debe ser PATH o FREE',
          },
          400
        );
      }

      const result = await ProgressService.completeChapter(
        userId,
        chapterId,
        readingTimeSeconds,
        version,
        readingMode
      );

      return c.json(result);
    } catch (error: any) {
      console.error('Error completing chapter:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al completar capítulo',
        },
        400
      );
    }
  }

  /**
   * GET /api/progress/me
   * Obtiene el progreso completo del usuario autenticado
   */
  static async getMyProgress(c: Context) {
    try {
      const userId = c.get('userId');

      const progress = await ProgressService.getUserProgress(userId);

      return c.json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      console.error('Error getting progress:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener progreso',
        },
        500
      );
    }
  }

  /**
   * GET /api/progress/book/:bookSlug
   * Obtiene el progreso de un libro específico
   */
  static async getBookProgress(c: Context) {
    try {
      const userId = c.get('userId');
      const bookSlug = c.req.param('bookSlug');

      const progress = await ProgressService.getBookProgress(userId, bookSlug);

      return c.json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      console.error('Error getting book progress:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener progreso del libro',
        },
        500
      );
    }
  }

  /**
   * PUT /api/progress/daily-goal
   * Actualiza la meta diaria del usuario
   */
  static async updateDailyGoal(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();

      const { goal } = body;

      if (!goal || typeof goal !== 'number') {
        return c.json(
          {
            success: false,
            message: 'goal debe ser un número',
          },
          400
        );
      }

      await DailyGoalService.updateDailyGoal(userId, goal);

      const updatedProgress = await DailyGoalService.getTodayProgress(userId);

      return c.json({
        success: true,
        message: `Meta diaria actualizada a ${goal} capítulos`,
        data: updatedProgress,
      });
    } catch (error: any) {
      console.error('Error updating daily goal:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al actualizar meta diaria',
        },
        400
      );
    }
  }

  /**
   * GET /api/progress/daily-goal/stats
   * Obtiene estadísticas de la meta diaria
   */
  static async getDailyGoalStats(c: Context) {
    try {
      const userId = c.get('userId');

      const stats = await DailyGoalService.getGoalStats(userId);

      return c.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error getting daily goal stats:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener estadísticas de meta diaria',
        },
        500
      );
    }
  }

  /**
   * GET /api/progress/leaderboard
   * Obtiene el leaderboard global
   */
  static async getLeaderboard(c: Context) {
    try {
      const userId = c.get('userId');

      const leaderboard = await ProgressService.getLeaderboard(userId);

      return c.json({
        success: true,
        leaderboard,
      });
    } catch (error: any) {
      console.error('Error getting leaderboard:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener leaderboard',
        },
        500
      );
    }
  }

  /**
   * POST /api/progress/track-visit
   * Registra la visita a un capítulo en modo FREE (sin otorgar XP ni recompensas)
   */
  static async trackChapterVisit(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();

      const { chapterId } = body;

      if (!chapterId) {
        return c.json(
          {
            success: false,
            message: 'chapterId es requerido',
          },
          400
        );
      }

      await ProgressService.trackChapterVisit(userId, chapterId);

      return c.json({
        success: true,
        message: 'Visita registrada',
      });
    } catch (error: any) {
      console.error('Error tracking chapter visit:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al registrar visita',
        },
        400
      );
    }
  }

  /**
   * POST /api/progress/reading-time
   * Registra tiempo de lectura del usuario (para actualizar minutesRead del día)
   */
  static async recordReadingTime(c: Context) {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();

      const { seconds } = body;

      if (typeof seconds !== 'number' || seconds < 0) {
        return c.json(
          {
            success: false,
            message: 'seconds debe ser un número positivo',
          },
          400
        );
      }

      await DailyGoalService.recordReadingTime(userId, seconds);

      return c.json({
        success: true,
        message: 'Tiempo registrado',
      });
    } catch (error: any) {
      console.error('Error recording reading time:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al registrar tiempo',
        },
        400
      );
    }
  }
}
