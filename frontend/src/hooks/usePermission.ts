import { useAuthStore } from '../stores/authStore';

/**
 * Hook para verificar permisos del usuario actual
 */
export function usePermission() {
  const permissions = useAuthStore((state) => state.permissions);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => permissions.includes(p));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
