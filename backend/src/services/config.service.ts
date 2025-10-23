import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AppConfigItem {
  key: string;
  value: string;
  type: string;
}

export interface AppConfigResponse {
  success: boolean;
  data?: Record<string, string>;
  message?: string;
}

export class ConfigService {
  /**
   * Obtener todas las configuraciones de la app
   */
  static async getAllConfig(): Promise<AppConfigResponse> {
    try {
      const configs = await prisma.appConfig.findMany();

      const configObject: Record<string, string> = {};
      configs.forEach((config) => {
        configObject[config.key] = config.value;
      });

      return {
        success: true,
        data: configObject,
      };
    } catch (error: any) {
      console.error('Error getting app config:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener configuración',
      };
    }
  }

  /**
   * Obtener configuración específica por clave
   */
  static async getConfigByKey(key: string): Promise<string | null> {
    try {
      const config = await prisma.appConfig.findUnique({
        where: { key },
      });

      return config ? config.value : null;
    } catch (error: any) {
      console.error(`Error getting config key ${key}:`, error);
      return null;
    }
  }

  /**
   * Actualizar una configuración (solo admin)
   */
  static async updateConfig(
    key: string,
    value: string,
    type: string = 'string'
  ): Promise<AppConfigResponse> {
    try {
      await prisma.appConfig.upsert({
        where: { key },
        update: { value, type },
        create: { key, value, type },
      });

      return {
        success: true,
        message: 'Configuración actualizada exitosamente',
      };
    } catch (error: any) {
      console.error('Error updating config:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar configuración',
      };
    }
  }

  /**
   * Actualizar múltiples configuraciones a la vez (solo admin)
   */
  static async updateMultipleConfig(
    configs: AppConfigItem[]
  ): Promise<AppConfigResponse> {
    try {
      for (const config of configs) {
        await prisma.appConfig.upsert({
          where: { key: config.key },
          update: { value: config.value, type: config.type },
          create: config,
        });
      }

      return {
        success: true,
        message: 'Configuraciones actualizadas exitosamente',
      };
    } catch (error: any) {
      console.error('Error updating multiple configs:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar configuraciones',
      };
    }
  }

  /**
   * Eliminar una configuración (solo admin)
   */
  static async deleteConfig(key: string): Promise<AppConfigResponse> {
    try {
      await prisma.appConfig.delete({
        where: { key },
      });

      return {
        success: true,
        message: 'Configuración eliminada exitosamente',
      };
    } catch (error: any) {
      console.error('Error deleting config:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar configuración',
      };
    }
  }
}
