import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { PrismaClient } from '@prisma/client';
import { ConfigController } from '../controllers/config.controller';

const prisma = new PrismaClient();
const admin = new Hono();

// Todas las rutas requieren autenticación
admin.use('*', authMiddleware);

/**
 * GET /users - Listar usuarios (requiere manage:users)
 */
admin.get(
  '/users',
  requirePermission('manage:users'),
  async (c) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          isActive: true,
          totalXp: true,
          currentLevel: true,
          currentStreak: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return c.json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      return c.json({ error: 'Failed to get users' }, 500);
    }
  }
);

/**
 * GET /analytics - Ver estadísticas del sistema (requiere view:analytics)
 */
admin.get(
  '/analytics',
  requirePermission('view:analytics'),
  async (c) => {
    try {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { isActive: true } });
      const totalBooks = await prisma.book.count();
      const totalChapters = await prisma.chapter.count();
      const totalReads = await prisma.chapterRead.count();

      // Usuarios registrados en los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      return c.json({
        totalUsers,
        activeUsers,
        recentUsers,
        totalBooks,
        totalChapters,
        totalReads,
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      return c.json({ error: 'Failed to get analytics' }, 500);
    }
  }
);

/**
 * GET /roles - Listar roles (requiere manage:roles)
 */
admin.get(
  '/roles',
  requirePermission('manage:roles'),
  async (c) => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      return c.json({ roles });
    } catch (error) {
      console.error('Get roles error:', error);
      return c.json({ error: 'Failed to get roles' }, 500);
    }
  }
);

/**
 * GET /permissions - Listar permisos (requiere manage:permissions)
 */
admin.get(
  '/permissions',
  requirePermission('manage:permissions'),
  async (c) => {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
      });
      return c.json({ permissions });
    } catch (error) {
      console.error('Get permissions error:', error);
      return c.json({ error: 'Failed to get permissions' }, 500);
    }
  }
);

/**
 * GET /system-stats - Estadísticas generales del sistema
 */
admin.get(
  '/system-stats',
  requirePermission('view:analytics'),
  async (c) => {
    try {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { isActive: true } });

      // Contar todos los capítulos leídos
      const totalChaptersRead = await prisma.chapterRead.count();

      // Sumar todo el XP ganado
      const totalXpResult = await prisma.user.aggregate({
        _sum: {
          totalXp: true,
        },
      });

      // Obtener la meta diaria por defecto desde AppConfig
      const defaultGoalConfig = await prisma.appConfig.findUnique({
        where: { key: 'default_daily_goal' },
      });

      return c.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalChaptersRead,
          totalXpEarned: totalXpResult._sum.totalXp || 0,
          defaultDailyGoal: parseInt(defaultGoalConfig?.value || '1'),
        },
      });
    } catch (error) {
      console.error('Get system stats error:', error);
      return c.json({ error: 'Failed to get system stats' }, 500);
    }
  }
);

/**
 * GET /user-stats - Estadísticas de todos los usuarios
 */
admin.get(
  '/user-stats',
  requirePermission('view:analytics'),
  async (c) => {
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          displayName: true,
          email: true,
          totalXp: true,
          currentLevel: true,
          currentStreak: true,
        },
        orderBy: { totalXp: 'desc' },
      });

      // Para cada usuario, obtener capítulos leídos y libros completados
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const totalChaptersRead = await prisma.chapterRead.count({
            where: { userId: user.id },
          });

          const booksCompleted = await prisma.bookProgress.count({
            where: {
              userId: user.id,
              completedAt: { not: null },
            },
          });

          return {
            ...user,
            totalChaptersRead,
            booksCompleted,
          };
        })
      );

      return c.json({
        success: true,
        users: usersWithStats,
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      return c.json({ error: 'Failed to get user stats' }, 500);
    }
  }
);

/**
 * PUT /default-daily-goal - Actualizar meta diaria por defecto para nuevos usuarios
 */
admin.put(
  '/default-daily-goal',
  requirePermission('view:analytics'),
  async (c) => {
    try {
      const body = await c.req.json();
      const { goal } = body;

      if (!goal || typeof goal !== 'number' || goal < 1 || goal > 10) {
        return c.json(
          {
            success: false,
            message: 'La meta debe ser un número entre 1 y 10',
          },
          400
        );
      }

      // Actualizar la configuración de meta diaria por defecto en AppConfig
      await prisma.appConfig.upsert({
        where: { key: 'default_daily_goal' },
        update: { value: goal.toString() },
        create: {
          key: 'default_daily_goal',
          value: goal.toString(),
          type: 'number',
        },
      });

      return c.json({
        success: true,
        message: 'Meta diaria por defecto actualizada exitosamente',
      });
    } catch (error) {
      console.error('Update default daily goal error:', error);
      return c.json({ error: 'Failed to update default daily goal' }, 500);
    }
  }
);

/**
 * GET /users/:userId/roles - Obtener roles de un usuario
 */
admin.get(
  '/users/:userId/roles',
  requirePermission('manage:roles'),
  async (c) => {
    try {
      const { userId } = c.req.param();

      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      return c.json({
        success: true,
        roles: userRoles.map((ur) => ur.role),
      });
    } catch (error) {
      console.error('Get user roles error:', error);
      return c.json({ error: 'Failed to get user roles' }, 500);
    }
  }
);

/**
 * POST /users/:userId/roles - Asignar rol a usuario
 */
admin.post(
  '/users/:userId/roles',
  requirePermission('manage:roles'),
  async (c) => {
    try {
      const { userId } = c.req.param();
      const body = await c.req.json();
      const { roleId } = body;

      if (!roleId) {
        return c.json(
          { success: false, message: 'roleId es requerido' },
          400
        );
      }

      // Verificar que el rol existe
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return c.json(
          { success: false, message: 'Rol no encontrado' },
          404
        );
      }

      // Verificar que el usuario no tiene ya este rol
      const existingUserRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (existingUserRole) {
        return c.json(
          { success: false, message: 'El usuario ya tiene este rol' },
          400
        );
      }

      // Asignar rol
      await prisma.userRole.create({
        data: {
          userId,
          roleId,
        },
      });

      return c.json({
        success: true,
        message: 'Rol asignado exitosamente',
      });
    } catch (error) {
      console.error('Assign role error:', error);
      return c.json({ error: 'Failed to assign role' }, 500);
    }
  }
);

/**
 * DELETE /users/:userId/roles/:roleId - Remover rol de usuario
 */
admin.delete(
  '/users/:userId/roles/:roleId',
  requirePermission('manage:roles'),
  async (c) => {
    try {
      const { userId, roleId } = c.req.param();

      // Verificar que el usuario tiene este rol
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (!userRole) {
        return c.json(
          { success: false, message: 'El usuario no tiene este rol' },
          404
        );
      }

      // Remover rol
      await prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      return c.json({
        success: true,
        message: 'Rol removido exitosamente',
      });
    } catch (error) {
      console.error('Remove role error:', error);
      return c.json({ error: 'Failed to remove role' }, 500);
    }
  }
);

/**
 * GET /config - Obtener todas las configuraciones de la app
 */
admin.get('/config', requirePermission('view:analytics'), ConfigController.getAllConfig);

/**
 * PUT /config - Actualizar múltiples configuraciones
 */
admin.put('/config', requirePermission('view:analytics'), ConfigController.updateMultipleConfig);

/**
 * PUT /config/:key - Actualizar una configuración específica
 */
admin.put('/config/:key', requirePermission('view:analytics'), ConfigController.updateConfig);

/**
 * DELETE /config/:key - Eliminar una configuración específica
 */
admin.delete('/config/:key', requirePermission('view:analytics'), ConfigController.deleteConfig);

export default admin;
