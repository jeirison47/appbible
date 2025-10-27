import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TutorialService {
  /**
   * Obtiene el progreso de todos los tutoriales de un usuario
   */
  static async getUserTutorials(userId: string) {
    const tutorials = await prisma.userTutorialProgress.findMany({
      where: { userId },
      select: {
        tutorialId: true,
        completed: true,
        currentStep: true,
        skipped: true,
        completedAt: true,
      },
    });

    // Mapear a objeto para fácil acceso
    const tutorialsMap: Record<string, any> = {};
    tutorials.forEach((t) => {
      tutorialsMap[t.tutorialId] = t;
    });

    return {
      onboarding: tutorialsMap['onboarding'] || { completed: false, currentStep: 0, skipped: false },
      streak: tutorialsMap['streak'] || { completed: false, currentStep: 0, skipped: false },
      freeReading: tutorialsMap['free-reading'] || { completed: false, currentStep: 0, skipped: false },
      path: tutorialsMap['path'] || { completed: false, currentStep: 0, skipped: false },
    };
  }

  /**
   * Actualiza el progreso de un tutorial
   */
  static async updateTutorialProgress(
    userId: string,
    tutorialId: string,
    data: {
      completed?: boolean;
      currentStep?: number;
      skipped?: boolean;
    }
  ) {
    const tutorial = await prisma.userTutorialProgress.upsert({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId,
        },
      },
      create: {
        userId,
        tutorialId,
        completed: data.completed ?? false,
        currentStep: data.currentStep ?? 0,
        skipped: data.skipped ?? false,
        completedAt: data.completed ? new Date() : null,
      },
      update: {
        completed: data.completed,
        currentStep: data.currentStep,
        skipped: data.skipped,
        completedAt: data.completed ? new Date() : undefined,
      },
    });

    return tutorial;
  }

  /**
   * Marca un tutorial como completado
   */
  static async completeTutorial(userId: string, tutorialId: string) {
    return this.updateTutorialProgress(userId, tutorialId, {
      completed: true,
      currentStep: 0,
    });
  }

  /**
   * Marca un tutorial como saltado
   */
  static async skipTutorial(userId: string, tutorialId: string) {
    return this.updateTutorialProgress(userId, tutorialId, {
      skipped: true,
      completed: false,
    });
  }

  /**
   * Reinicia un tutorial (para poder verlo de nuevo)
   */
  static async resetTutorial(userId: string, tutorialId: string) {
    return this.updateTutorialProgress(userId, tutorialId, {
      completed: false,
      currentStep: 0,
      skipped: false,
    });
  }

  /**
   * Verifica si el usuario debe ver el tutorial de onboarding
   */
  static async shouldShowOnboarding(userId: string): Promise<boolean> {
    const tutorial = await prisma.userTutorialProgress.findUnique({
      where: {
        userId_tutorialId: {
          userId,
          tutorialId: 'onboarding',
        },
      },
    });

    // Mostrar si no existe o si no está completado ni saltado
    return !tutorial || (!tutorial.completed && !tutorial.skipped);
  }
}
