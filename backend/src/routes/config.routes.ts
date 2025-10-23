import { Hono } from 'hono';
import { ConfigController } from '../controllers/config.controller';

const config = new Hono();

/**
 * GET /config - Obtener todas las configuraciones de la app (público)
 */
config.get('/', ConfigController.getAllConfig);

/**
 * GET /config/:key - Obtener configuración específica (público)
 */
config.get('/:key', ConfigController.getConfigByKey);

export default config;
