import { Context } from 'hono';
import { TutorialService } from '../services/tutorial.service';

export class TutorialController {
  /**
   * GET /api/tutorials/me
   * Obtiene el progreso de todos los tutoriales del usuario autenticado
   */
  static async getMyTutorials(c: Context) {
    try {
      const userId = c.get('userId');

      const tutorials = await TutorialService.getUserTutorials(userId);

      return c.json({
        success: true,
        data: tutorials,
      });
    } catch (error: any) {
      console.error('Error getting tutorials:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener tutoriales',
        },
        500
      );
    }
  }

  /**
   * PUT /api/tutorials/:tutorialId/progress
   * Actualiza el progreso de un tutorial
   */
  static async updateProgress(c: Context) {
    try {
      const userId = c.get('userId');
      const tutorialId = c.req.param('tutorialId');
      const body = await c.req.json();

      const { completed, currentStep, skipped } = body;

      const tutorial = await TutorialService.updateTutorialProgress(
        userId,
        tutorialId,
        {
          completed,
          currentStep,
          skipped,
        }
      );

      return c.json({
        success: true,
        data: tutorial,
        message: 'Progreso de tutorial actualizado',
      });
    } catch (error: any) {
      console.error('Error updating tutorial progress:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al actualizar progreso',
        },
        400
      );
    }
  }

  /**
   * POST /api/tutorials/:tutorialId/complete
   * Marca un tutorial como completado
   */
  static async completeTutorial(c: Context) {
    try {
      const userId = c.get('userId');
      const tutorialId = c.req.param('tutorialId');

      const tutorial = await TutorialService.completeTutorial(userId, tutorialId);

      return c.json({
        success: true,
        data: tutorial,
        message: 'Tutorial completado',
      });
    } catch (error: any) {
      console.error('Error completing tutorial:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al completar tutorial',
        },
        400
      );
    }
  }

  /**
   * POST /api/tutorials/:tutorialId/skip
   * Marca un tutorial como saltado
   */
  static async skipTutorial(c: Context) {
    try {
      const userId = c.get('userId');
      const tutorialId = c.req.param('tutorialId');

      const tutorial = await TutorialService.skipTutorial(userId, tutorialId);

      return c.json({
        success: true,
        data: tutorial,
        message: 'Tutorial saltado',
      });
    } catch (error: any) {
      console.error('Error skipping tutorial:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al saltar tutorial',
        },
        400
      );
    }
  }

  /**
   * POST /api/tutorials/:tutorialId/reset
   * Reinicia un tutorial para poder verlo de nuevo
   */
  static async resetTutorial(c: Context) {
    try {
      const userId = c.get('userId');
      const tutorialId = c.req.param('tutorialId');

      const tutorial = await TutorialService.resetTutorial(userId, tutorialId);

      return c.json({
        success: true,
        data: tutorial,
        message: 'Tutorial reiniciado',
      });
    } catch (error: any) {
      console.error('Error resetting tutorial:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al reiniciar tutorial',
        },
        400
      );
    }
  }

  /**
   * GET /api/tutorials/should-show-onboarding
   * Verifica si se debe mostrar el tutorial de onboarding
   */
  static async shouldShowOnboarding(c: Context) {
    try {
      const userId = c.get('userId');

      const shouldShow = await TutorialService.shouldShowOnboarding(userId);

      return c.json({
        success: true,
        data: { shouldShow },
      });
    } catch (error: any) {
      console.error('Error checking onboarding:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al verificar onboarding',
        },
        500
      );
    }
  }
}
