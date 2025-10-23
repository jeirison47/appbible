import { Context } from 'hono';
import { ConfigService, AppConfigItem } from '../services/config.service';

export class ConfigController {
  /**
   * Obtener todas las configuraciones (público)
   * GET /api/config
   */
  static async getAllConfig(c: Context) {
    try {
      const result = await ConfigService.getAllConfig();
      return c.json(result);
    } catch (error: any) {
      console.error('Error in getAllConfig:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener configuración',
        },
        500
      );
    }
  }

  /**
   * Obtener configuración por clave (público)
   * GET /api/config/:key
   */
  static async getConfigByKey(c: Context) {
    try {
      const key = c.req.param('key');

      if (!key) {
        return c.json(
          {
            success: false,
            message: 'Se requiere la clave de configuración',
          },
          400
        );
      }

      const value = await ConfigService.getConfigByKey(key);

      if (value === null) {
        return c.json(
          {
            success: false,
            message: 'Configuración no encontrada',
          },
          404
        );
      }

      return c.json({
        success: true,
        data: { key, value },
      });
    } catch (error: any) {
      console.error('Error in getConfigByKey:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al obtener configuración',
        },
        500
      );
    }
  }

  /**
   * Actualizar una configuración (solo admin)
   * PUT /api/admin/config/:key
   */
  static async updateConfig(c: Context) {
    try {
      const key = c.req.param('key');
      const body = await c.req.json();
      const { value, type = 'string' } = body;

      if (!key || !value) {
        return c.json(
          {
            success: false,
            message: 'Se requieren key y value',
          },
          400
        );
      }

      const result = await ConfigService.updateConfig(key, value, type);
      return c.json(result);
    } catch (error: any) {
      console.error('Error in updateConfig:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al actualizar configuración',
        },
        500
      );
    }
  }

  /**
   * Actualizar múltiples configuraciones (solo admin)
   * PUT /api/admin/config
   */
  static async updateMultipleConfig(c: Context) {
    try {
      const body = await c.req.json();
      const { configs } = body;

      if (!configs || !Array.isArray(configs)) {
        return c.json(
          {
            success: false,
            message: 'Se requiere un array de configuraciones',
          },
          400
        );
      }

      const result = await ConfigService.updateMultipleConfig(
        configs as AppConfigItem[]
      );
      return c.json(result);
    } catch (error: any) {
      console.error('Error in updateMultipleConfig:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al actualizar configuraciones',
        },
        500
      );
    }
  }

  /**
   * Eliminar una configuración (solo admin)
   * DELETE /api/admin/config/:key
   */
  static async deleteConfig(c: Context) {
    try {
      const key = c.req.param('key');

      if (!key) {
        return c.json(
          {
            success: false,
            message: 'Se requiere la clave de configuración',
          },
          400
        );
      }

      const result = await ConfigService.deleteConfig(key);
      return c.json(result);
    } catch (error: any) {
      console.error('Error in deleteConfig:', error);
      return c.json(
        {
          success: false,
          message: error.message || 'Error al eliminar configuración',
        },
        500
      );
    }
  }
}
