import { Context } from 'hono';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RBACService } from '../services/rbac.service';
import { Auth0Service } from '../services/auth0.service';

const prisma = new PrismaClient();

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

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName,
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
          avatarUrl: user.avatarUrl,
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
          avatarUrl: user.avatarUrl,
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
          avatarUrl: user.avatarUrl,
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
