import { Context, Next } from 'hono';
import { RBACService } from '../services/rbac.service';

/**
 * Middleware para requerir un permiso específico
 */
export function requirePermission(permissionName: string) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const hasPermission = await RBACService.userHasPermission(userId, permissionName);

    if (!hasPermission) {
      return c.json({
        error: 'Forbidden',
        message: `Required permission: ${permissionName}`,
      }, 403);
    }

    await next();
  };
}

/**
 * Middleware para requerir al menos uno de los permisos especificados
 */
export function requireAnyPermission(permissionNames: string[]) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const hasAnyPermission = await RBACService.userHasAnyPermission(userId, permissionNames);

    if (!hasAnyPermission) {
      return c.json({
        error: 'Forbidden',
        message: `Required one of: ${permissionNames.join(', ')}`,
      }, 403);
    }

    await next();
  };
}

/**
 * Middleware para requerir todos los permisos especificados
 */
export function requireAllPermissions(permissionNames: string[]) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const hasAllPermissions = await RBACService.userHasAllPermissions(userId, permissionNames);

    if (!hasAllPermissions) {
      return c.json({
        error: 'Forbidden',
        message: `Required all: ${permissionNames.join(', ')}`,
      }, 403);
    }

    await next();
  };
}
