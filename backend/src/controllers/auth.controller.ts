import { Context } from 'hono';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RBACService } from '../services/rbac.service';
import { Auth0Service } from '../services/auth0.service';

const prisma = new PrismaClient();

/**
 * Genera un nickname único a partir de un email
 */
async function generateUniqueNickname(email: string): Promise<string> {
  // Extraer la parte antes del @
  const baseNickname = email.split('@')[0];

  // Verificar si ya existe
  const existing = await prisma.user.findUnique({
    where: { nickname: baseNickname }
  });

  // Si no existe, retornar el nickname base
  if (!existing) {
    return baseNickname;
  }

  // Si existe, agregar número al final
  let counter = 1;
  let nicknameWithNumber = `${baseNickname}${counter}`;

  while (await prisma.user.findUnique({ where: { nickname: nicknameWithNumber } })) {
    counter++;
    nicknameWithNumber = `${baseNickname}${counter}`;
  }

  return nicknameWithNumber;
}

export class AuthController {
  /**
   * Registrar nuevo usuario
   */
  static async register(c: Context) {
    try {
      const { email, password, displayName } = await c.req.json();

      // Validaciones básicas
      if (!email || !password || !displayName) {
        return c.json({ error: 'Missing required fields' }, 400);
      }

      if (password.length < 6) {
        return c.json({ error: 'Password must be at least 6 characters' }, 400);
      }

      // Verificar si el email ya existe
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return c.json({ error: 'Email already registered' }, 400);
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      // Generar nickname único desde el email
      const nickname = await generateUniqueNickname(email);

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          nickname,
          settings: { create: {} },
        },
      });

      // Asignar rol 'user' por defecto
      await RBACService.assignRoleToUser(user.id, 'user');

      // Obtener permisos
      const permissions = await RBACService.getUserPermissions(user.id);
      const roles = await RBACService.getUserRoles(user.id);

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          permissions,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return c.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
        },
        roles: roles.map((r) => ({
          name: r.role.name,
          displayName: r.role.displayName,
        })),
        permissions,
        token,
      }, 201);
    } catch (error) {
      console.error('Register error:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(c: Context) {
    try {
      const { email, password } = await c.req.json();

      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email },
        include: { settings: true },
      });

      if (!user || !user.passwordHash) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Verificar si la cuenta está activa
      if (!user.isActive) {
        return c.json({ error: 'Account is disabled' }, 403);
      }

      // Verificar contraseña
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Obtener roles y permisos
      const roles = await RBACService.getUserRoles(user.id);
      const permissions = await RBACService.getUserPermissions(user.id);

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          permissions,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return c.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
          settings: user.settings,
        },
        roles: roles.map((r) => ({
          name: r.role.name,
          displayName: r.role.displayName,
        })),
        permissions,
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Login failed' }, 500);
    }
  }

  /**
   * Obtener usuario actual (requiere autenticación)
   */
  static async me(c: Context) {
    try {
      const userId = c.get('userId');

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true },
      });

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      const roles = await RBACService.getUserRoles(userId);
      const permissions = await RBACService.getUserPermissions(userId);

      return c.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          settings: user.settings,
        },
        roles: roles.map((r) => ({
          name: r.role.name,
          displayName: r.role.displayName,
        })),
        permissions,
      });
    } catch (error) {
      console.error('Me error:', error);
      return c.json({ error: 'Failed to get user info' }, 500);
    }
  }

  /**
   * Actualizar perfil del usuario (displayName, nickname)
   */
  static async updateProfile(c: Context) {
    try {
      const userId = c.get('userId');
      const { displayName, nickname } = await c.req.json();

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      const updateData: any = {};

      // Validar y actualizar displayName si se proporciona
      if (displayName !== undefined) {
        if (user.authProvider === 'auth0') {
          return c.json({ error: 'No puedes cambiar el nombre si te registraste con Google' }, 400);
        }
        if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
          return c.json({ error: 'Nombre no puede estar vacío' }, 400);
        }
        updateData.displayName = displayName.trim();
      }

      // Validar y actualizar nickname si se proporciona
      if (nickname !== undefined) {
        if (!nickname || typeof nickname !== 'string') {
          return c.json({ error: 'Nickname no puede estar vacío' }, 400);
        }

        // Validar formato (solo letras, números, guiones y guiones bajos)
        if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
          return c.json({
            error: 'Nickname solo puede contener letras, números, guiones y guiones bajos'
          }, 400);
        }

        // Validar longitud
        if (nickname.length < 3 || nickname.length > 20) {
          return c.json({
            error: 'Nickname debe tener entre 3 y 20 caracteres'
          }, 400);
        }

        // Verificar si el nickname ya está en uso
        const existing = await prisma.user.findUnique({
          where: { nickname }
        });

        if (existing && existing.id !== userId) {
          return c.json({ error: 'Este nickname ya está en uso' }, 400);
        }

        updateData.nickname = nickname;
      }

      // Actualizar usuario
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      return c.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: {
          displayName: updatedUser.displayName,
          nickname: updatedUser.nickname
        }
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return c.json({ error: 'Failed to update profile' }, 500);
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  static async changePassword(c: Context) {
    try {
      const userId = c.get('userId');
      const { currentPassword, newPassword } = await c.req.json();

      // Validaciones
      if (!currentPassword || !newPassword) {
        return c.json({ error: 'Contraseña actual y nueva son requeridas' }, 400);
      }

      if (newPassword.length < 6) {
        return c.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, 400);
      }

      // Obtener usuario
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return c.json({ error: 'Usuario no encontrado' }, 404);
      }

      // Verificar que el usuario use autenticación local
      if (user.authProvider !== 'local' || !user.passwordHash) {
        return c.json({ error: 'No puedes cambiar la contraseña si te registraste con Google' }, 400);
      }

      // Verificar contraseña actual
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return c.json({ error: 'Contraseña actual incorrecta' }, 401);
      }

      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });

      return c.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      return c.json({ error: 'Failed to change password' }, 500);
    }
  }

  /**
   * Login con Auth0 (Google, Facebook, etc.)
   */
  static async auth0Login(c: Context) {
    try {
      const { accessToken } = await c.req.json();

      if (!accessToken) {
        return c.json({ error: 'Access token is required' }, 400);
      }

      // Procesar login con Auth0
      const user = await Auth0Service.processAuth0Login(accessToken);

      // Obtener roles y permisos
      const roles = await RBACService.getUserRoles(user.id);
      const permissions = await RBACService.getUserPermissions(user.id);

      // Generar token JWT propio
      const token = jwt.sign(
        {
          userId: user.id,
          permissions,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return c.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          currentStreak: user.currentStreak,
        },
        roles: roles.map((r) => ({
          name: r.role.name,
          displayName: r.role.displayName,
        })),
        permissions,
        token,
      });
    } catch (error: any) {
      console.error('Auth0 login error:', error);
      return c.json({ error: error.message || 'Auth0 login failed' }, 500);
    }
  }
}
