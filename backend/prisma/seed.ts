import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Crear Permisos
  const permissions = await Promise.all([
    // Reading permissions
    prisma.permission.create({
      data: {
        name: 'read:chapters',
        displayName: 'Leer Capítulos',
        description: 'Permite leer capítulos de la Biblia',
        category: 'reading',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'read:all_versions',
        displayName: 'Leer Todas las Versiones',
        description: 'Acceso a las 4 versiones de la Biblia',
        category: 'reading',
      },
    }),

    // User permissions
    prisma.permission.create({
      data: {
        name: 'manage:own_profile',
        displayName: 'Gestionar Perfil Propio',
        description: 'Editar su propio perfil y configuración',
        category: 'user',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'view:own_stats',
        displayName: 'Ver Estadísticas Propias',
        description: 'Ver sus propias estadísticas de progreso',
        category: 'user',
      },
    }),

    // Admin permissions
    prisma.permission.create({
      data: {
        name: 'manage:users',
        displayName: 'Gestionar Usuarios',
        description: 'Crear, editar y eliminar usuarios',
        category: 'admin',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'manage:roles',
        displayName: 'Gestionar Roles',
        description: 'Crear y asignar roles',
        category: 'admin',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'manage:permissions',
        displayName: 'Gestionar Permisos',
        description: 'Asignar permisos a roles',
        category: 'admin',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'view:analytics',
        displayName: 'Ver Analytics',
        description: 'Ver estadísticas del sistema',
        category: 'admin',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'manage:content',
        displayName: 'Gestionar Contenido',
        description: 'Editar contenido bíblico',
        category: 'admin',
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // 2. Crear Roles
  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      displayName: 'Usuario',
      description: 'Usuario estándar de la aplicación',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      displayName: 'Administrador',
      description: 'Administrador con acceso total',
      isSystem: true,
    },
  });

  console.log('✅ Created roles: user, admin');

  // 3. Asignar Permisos a Roles

  // User role permissions
  const userPermissions = permissions.filter((p) =>
    ['read:chapters', 'read:all_versions', 'manage:own_profile', 'view:own_stats'].includes(p.name)
  );

  await Promise.all(
    userPermissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Admin role permissions (todos)
  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  console.log('✅ Assigned permissions to roles');

  // 4. Crear Usuario Admin de Prueba
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bibliaquest.com',
      passwordHash: adminPassword,
      displayName: 'Admin',
      settings: {
        create: {},
      },
    },
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Created admin user: admin@bibliaquest.com / admin123');

  // 5. Crear Usuario Normal de Prueba
  const userPassword = await bcrypt.hash('user123', 10);
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@bibliaquest.com',
      passwordHash: userPassword,
      displayName: 'Usuario Demo',
      settings: {
        create: {},
      },
    },
  });

  await prisma.userRole.create({
    data: {
      userId: normalUser.id,
      roleId: userRole.id,
    },
  });

  console.log('✅ Created normal user: user@bibliaquest.com / user123');

  // 6. Crear configuración inicial de la app (Manah)
  const appConfigData = [
    { key: 'app_name', value: 'Manah', type: 'string' },
    { key: 'app_short_name', value: 'Manah', type: 'string' },
    { key: 'app_description', value: 'Descubre la Biblia de forma interactiva con gamificación. Gana XP, mantén rachas diarias y completa tu camino de lectura.', type: 'string' },
    { key: 'theme_color', value: '#4F46E5', type: 'string' },
    { key: 'background_color', value: '#ffffff', type: 'string' },
    { key: 'default_bible_version', value: 'RV1960', type: 'string' },
    { key: 'xp_per_chapter', value: '100', type: 'number' },
    { key: 'xp_per_minute_free_reading', value: '10', type: 'number' },
    { key: 'bonus_streak_multiplier', value: '1.5', type: 'number' },
  ];

  for (const config of appConfigData) {
    await prisma.appConfig.create({
      data: config,
    });
  }

  console.log('✅ Created app configuration (Manah)');

  console.log('\n🎉 Seeding completed!\n');
  console.log('Test Users:');
  console.log('  Admin: admin@bibliaquest.com / admin123');
  console.log('  User:  user@bibliaquest.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
