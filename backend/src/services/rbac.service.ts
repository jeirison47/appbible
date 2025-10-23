import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RBACService {
  /**
   * Verificar si un usuario tiene un permiso específico
   */
  static async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
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

    // Verificar si alguno de los roles del usuario tiene el permiso
    return userRoles.some((userRole) =>
      userRole.role.rolePermissions.some((rp) => rp.permission.name === permissionName)
    );
  }

  /**
   * Obtener todos los permisos de un usuario
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
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

    const permissions = new Set<string>();

    userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Obtener roles de un usuario
   */
  static async getUserRoles(userId: string) {
    return await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  }

  /**
   * Asignar rol a usuario
   */
  static async assignRoleToUser(userId: string, roleName: string) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    return await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });
  }

  /**
   * Remover rol de usuario
   */
  static async removeRoleFromUser(userId: string, roleName: string) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    return await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    });
  }

  /**
   * Verificar si usuario tiene alguno de los permisos especificados
   */
  static async userHasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    const checks = await Promise.all(
      permissionNames.map((perm) => this.userHasPermission(userId, perm))
    );
    return checks.some((check) => check === true);
  }

  /**
   * Verificar si usuario tiene todos los permisos especificados
   */
  static async userHasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    const checks = await Promise.all(
      permissionNames.map((perm) => this.userHasPermission(userId, perm))
    );
    return checks.every((check) => check === true);
  }
}
