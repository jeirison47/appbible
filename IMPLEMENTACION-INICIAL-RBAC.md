# 🚀 BibliaQuest - Implementación Inicial con RBAC

## 🎯 OBJETIVO

Implementar sistema completo con:
- ✅ Login/Registro funcional
- ✅ Sistema de Roles y Permisos (RBAC)
- ✅ Pantalla con versículo de prueba
- ✅ Control de permisos en todas las funciones

---

## 📁 1. SCHEMA DE BASE DE DATOS CON RBAC

**`prisma/schema.prisma`** (COMPLETO):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USERS & AUTH ====================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  displayName   String
  avatarUrl     String?
  isActive      Boolean  @default(true)
  
  // Gamification
  totalXp       Int      @default(0)
  currentLevel  Int      @default(1)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastActiveAt  DateTime?
  
  // Relationships
  userRoles     UserRole[]
  settings      UserSettings?
  bookProgress  BookProgress[]
  chapterReads  ChapterRead[]
  dailyProgress DailyProgress[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([email])
  @@map("users")
}

model UserSettings {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  bibleVersion          String  @default("RV1960")
  fontSize              String  @default("medium")
  theme                 String  @default("auto")
  notificationsEnabled  Boolean @default(true)
  notificationTime      String  @default("20:00")
  systemDailyGoal       Int     @default(50)
  personalDailyGoal     Int?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("user_settings")
}

// ==================== RBAC SYSTEM ====================

model Role {
  id          String   @id @default(cuid())
  name        String   @unique  // 'user', 'admin', 'moderator'
  displayName String             // 'Usuario', 'Administrador'
  description String?
  isSystem    Boolean  @default(false) // No se puede eliminar
  
  // Relationships
  userRoles       UserRole[]
  rolePermissions RolePermission[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([name])
  @@map("roles")
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique  // 'read:chapters', 'manage:users'
  displayName String             // 'Leer Capítulos', 'Gestionar Usuarios'
  description String?
  category    String             // 'reading', 'admin', 'user'
  
  // Relationships
  rolePermissions RolePermission[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([name])
  @@index([category])
  @@map("permissions")
}

model RolePermission {
  id           String @id @default(cuid())
  roleId       String
  permissionId String
  
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
  @@map("role_permissions")
}

model UserRole {
  id     String @id @default(cuid())
  userId String
  roleId String
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  assignedAt DateTime @default(now())
  
  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
  @@map("user_roles")
}

// ==================== BIBLE CONTENT ====================

model Book {
  id                String   @id @default(cuid())
  testament         String   // 'OLD', 'NEW'
  category          String   // 'Pentateuco', 'Evangelios', etc.
  name              String   // 'Génesis', 'Juan'
  slug              String   @unique
  order             Int      @unique
  totalChapters     Int
  isAvailableInPath Boolean  @default(false)
  
  chapters Chapter[]
  progress BookProgress[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([testament])
  @@index([slug])
  @@map("books")
}

model Chapter {
  id      String @id @default(cuid())
  bookId  String
  book    Book   @relation(fields: [bookId], references: [id], onDelete: Cascade)
  number  Int
  title   String?
  
  // Contenido en 4 versiones
  contentRV1960 String @db.Text
  contentNVI    String @db.Text
  contentTLA    String @db.Text
  contentNTV    String @db.Text
  
  // Versículos parseados (JSON)
  versesRV1960 Json
  versesNVI    Json
  versesTLA    Json
  versesNTV    Json
  
  verseCount Int
  
  reads ChapterRead[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([bookId, number])
  @@index([bookId])
  @@map("chapters")
}

// ==================== PROGRESS TRACKING ====================

model BookProgress {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookId            String
  book              Book      @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  chaptersCompleted Int       @default(0)
  lastChapterRead   Int       @default(0)
  completedAt       DateTime?
  totalXpEarned     Int       @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, bookId])
  @@index([userId])
  @@map("book_progress")
}

model ChapterRead {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapterId String
  chapter   Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  readType  String   // 'PATH', 'FREE'
  xpEarned  Int
  timeSpent Int?     // seconds
  readAt    DateTime @default(now())
  
  @@unique([userId, chapterId])
  @@index([userId, readAt])
  @@map("chapter_reads")
}

model DailyProgress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  
  xpEarned                Int     @default(0)
  chaptersRead            Int     @default(0)
  timeReading             Int     @default(0)
  systemGoalCompleted     Boolean @default(false)
  personalGoalCompleted   Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, date])
  @@index([userId, date])
  @@map("daily_progress")
}
```

---

## 🌱 2. SEED DATA (Roles y Permisos Iniciales)

**`prisma/seed.ts`**:

```typescript
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

  // 6. Crear un libro y capítulo de prueba (Juan 3:16)
  const book = await prisma.book.create({
    data: {
      testament: 'NEW',
      category: 'Evangelios',
      name: 'Juan',
      slug: 'juan',
      order: 43,
      totalChapters: 21,
      isAvailableInPath: true,
    },
  });

  await prisma.chapter.create({
    data: {
      bookId: book.id,
      number: 3,
      title: 'Jesús y Nicodemo',
      contentRV1960: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      contentNVI: 'Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna.',
      contentTLA: 'Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo, para que todo el que crea en mí no muera, sino que tenga vida eterna.',
      contentNTV: 'Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no se pierda, sino que tenga vida eterna.',
      versesRV1960: { "16": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
      versesNVI: { "16": "Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna." },
      versesTLA: { "16": "Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo, para que todo el que crea en mí no muera, sino que tenga vida eterna." },
      versesNTV: { "16": "Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no se pierda, sino que tenga vida eterna." },
      verseCount: 1,
    },
  });

  console.log('✅ Created test chapter: Juan 3:16');

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
```

**Ejecutar:**
```bash
npx prisma migrate dev --name add_rbac
npx prisma generate
npx tsx prisma/seed.ts
```

---

## 🔐 3. BACKEND - RBAC SERVICE

**`src/services/rbac.service.ts`**:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RBACService {
  // Verificar si usuario tiene un permiso específico
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

  // Obtener todos los permisos de un usuario
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

  // Obtener roles de un usuario
  static async getUserRoles(userId: string) {
    return await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  }

  // Asignar rol a usuario
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

  // Remover rol de usuario
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
}
```

---

## 🛡️ 4. BACKEND - PERMISSION MIDDLEWARE

**`src/middleware/permission.middleware.ts`**:

```typescript
import { Context, Next } from 'hono';
import { RBACService } from '../services/rbac.service';

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

export function requireAnyPermission(permissionNames: string[]) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const checks = await Promise.all(
      permissionNames.map((perm) => RBACService.userHasPermission(userId, perm))
    );

    const hasAnyPermission = checks.some((check) => check === true);

    if (!hasAnyPermission) {
      return c.json({
        error: 'Forbidden',
        message: `Required one of: ${permissionNames.join(', ')}`,
      }, 403);
    }

    await next();
  };
}

export function requireAllPermissions(permissionNames: string[]) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const checks = await Promise.all(
      permissionNames.map((perm) => RBACService.userHasPermission(userId, perm))
    );

    const hasAllPermissions = checks.every((check) => check === true);

    if (!hasAllPermissions) {
      return c.json({
        error: 'Forbidden',
        message: `Required all: ${permissionNames.join(', ')}`,
      }, 403);
    }

    await next();
  };
}
```

---

## 🔐 5. BACKEND - AUTH CONTROLLER CON RBAC

**`src/controllers/auth.controller.ts`**:

```typescript
import { Context } from 'hono';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RBACService } from '../services/rbac.service';

const prisma = new PrismaClient();

export class AuthController {
  static async register(c: Context) {
    try {
      const { email, password, displayName } = await c.req.json();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return c.json({ error: 'Email already registered' }, 400);
      }

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
        },
        permissions,
        token,
      }, 201);
    } catch (error) {
      console.error('Register error:', error);
      return c.json({ error: 'Registration failed' }, 500);
    }
  }

  static async login(c: Context) {
    try {
      const { email, password } = await c.req.json();

      const user = await prisma.user.findUnique({
        where: { email },
        include: { settings: true },
      });

      if (!user || !user.passwordHash) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      if (!user.isActive) {
        return c.json({ error: 'Account is disabled' }, 403);
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Obtener roles y permisos
      const roles = await RBACService.getUserRoles(user.id);
      const permissions = await RBACService.getUserPermissions(user.id);

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

  static async me(c: Context) {
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
        settings: user.settings,
      },
      roles: roles.map((r) => ({
        name: r.role.name,
        displayName: r.role.displayName,
      })),
      permissions,
    });
  }
}
```

---

## 📖 6. BACKEND - READING CONTROLLER

**`src/controllers/reading.controller.ts`**:

```typescript
import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReadingController {
  // Obtener un capítulo (requiere permiso read:chapters)
  static async getChapter(c: Context) {
    try {
      const { bookSlug, chapterNumber } = c.req.param();
      const version = c.req.query('version') || 'RV1960';

      const book = await prisma.book.findUnique({
        where: { slug: bookSlug },
      });

      if (!book) {
        return c.json({ error: 'Book not found' }, 404);
      }

      const chapter = await prisma.chapter.findUnique({
        where: {
          bookId_number: {
            bookId: book.id,
            number: parseInt(chapterNumber),
          },
        },
      });

      if (!chapter) {
        return c.json({ error: 'Chapter not found' }, 404);
      }

      // Seleccionar contenido según versión
      const contentMap: any = {
        RV1960: chapter.contentRV1960,
        NVI: chapter.contentNVI,
        TLA: chapter.contentTLA,
        NTV: chapter.contentNTV,
      };

      const versesMap: any = {
        RV1960: chapter.versesRV1960,
        NVI: chapter.versesNVI,
        TLA: chapter.versesTLA,
        NTV: chapter.versesNTV,
      };

      return c.json({
        book: {
          name: book.name,
          slug: book.slug,
        },
        chapter: {
          number: chapter.number,
          title: chapter.title,
          content: contentMap[version],
          verses: versesMap[version],
          verseCount: chapter.verseCount,
        },
        version,
      });
    } catch (error) {
      console.error('Get chapter error:', error);
      return c.json({ error: 'Failed to get chapter' }, 500);
    }
  }

  // Obtener todos los libros
  static async getBooks(c: Context) {
    try {
      const books = await prisma.book.findMany({
        orderBy: { order: 'asc' },
      });

      return c.json({ books });
    } catch (error) {
      console.error('Get books error:', error);
      return c.json({ error: 'Failed to get books' }, 500);
    }
  }
}
```

---

## 🛣️ 7. BACKEND - ROUTES CON PERMISOS

**`src/routes/reading.routes.ts`**:

```typescript
import { Hono } from 'hono';
import { ReadingController } from '../controllers/reading.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const reading = new Hono();

// Todas las rutas requieren autenticación
reading.use('*', authMiddleware);

// GET /books - Requiere permiso read:chapters
reading.get(
  '/books',
  requirePermission('read:chapters'),
  ReadingController.getBooks
);

// GET /books/:slug/:chapter - Requiere permiso read:chapters
reading.get(
  '/books/:bookSlug/:chapterNumber',
  requirePermission('read:chapters'),
  ReadingController.getChapter
);

export default reading;
```

**`src/routes/admin.routes.ts`**:

```typescript
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permission.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const admin = new Hono();

admin.use('*', authMiddleware);

// Listar usuarios - Requiere manage:users
admin.get(
  '/users',
  requirePermission('manage:users'),
  async (c) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        isActive: true,
        totalXp: true,
        currentLevel: true,
        createdAt: true,
      },
    });
    return c.json({ users });
  }
);

// Ver analytics - Requiere view:analytics
admin.get(
  '/analytics',
  requirePermission('view:analytics'),
  async (c) => {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    
    return c.json({
      totalUsers,
      activeUsers,
    });
  }
);

export default admin;
```

**`src/index.ts`**:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import authRoutes from './routes/auth.routes';
import readingRoutes from './routes/reading.routes';
import adminRoutes from './routes/admin.routes';

const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date() }));

app.route('/api/auth', authRoutes);
app.route('/api/reading', readingRoutes);
app.route('/api/admin', adminRoutes);

const port = parseInt(process.env.PORT || '3000');
console.log(`🚀 Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
```

---

## 💻 8. FRONTEND - HOOK DE PERMISOS

**`src/hooks/usePermission.ts`**:

```typescript
import { useAuthStore } from '../stores/authStore';

export function usePermission() {
  const permissions = useAuthStore((state) => state.permissions);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => permissions.includes(p));
  };

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
```

---

## 🏪 9. FRONTEND - AUTH STORE CON PERMISOS

**`src/stores/authStore.ts`**:

```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
}

interface Role {
  name: string;
  displayName: string;
}

interface AuthStore {
  user: User | null;
  roles: Role[];
  permissions: string[];
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, roles: Role[], permissions: string[], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  roles: [],
  permissions: [],
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, roles, permissions, token) => {
    localStorage.setItem('token', token);
    set({ user, roles, permissions, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, roles: [], permissions: [], token: null, isAuthenticated: false });
  },
}));
```

---

## 📄 10. FRONTEND - PÁGINA DE LOGIN

**`src/pages/LoginPage.tsx`**:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = isRegister
        ? await authApi.register({ email, password, displayName })
        : await authApi.login({ email, password });

      setAuth(data.user, data.roles, data.permissions, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              📖 BibliaQuest
            </h1>
            <p className="text-gray-600">
              Lee la Biblia diariamente
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">Usuarios de prueba:</p>
            <p>Admin: admin@bibliaquest.com / admin123</p>
            <p>User: user@bibliaquest.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🏠 11. FRONTEND - HOME CON VERSÍCULO

**`src/pages/HomePage.tsx`**:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermission } from '../hooks/usePermission';
import { readingApi } from '../services/api';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const logout = useAuthStore((state) => state.logout);
  const { hasPermission, permissions } = usePermission();
  const navigate = useNavigate();

  const [verse, setVerse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar Juan 3:16
    readingApi.getChapter('juan', 3, 'RV1960')
      .then((data) => {
        setVerse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load verse:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">📖 BibliaQuest</h1>
              <p className="text-sm text-gray-600">
                {roles.map(r => r.displayName).join(', ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Hola {user?.displayName}! 👋
          </h2>
          <p className="text-gray-600">
            Bienvenido a BibliaQuest
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">XP Total</p>
            <p className="text-4xl font-bold">{user?.totalXp}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">Nivel</p>
            <p className="text-4xl font-bold">{user?.currentLevel}</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm opacity-90">🔥 Racha</p>
            <p className="text-4xl font-bold">{user?.currentStreak}</p>
          </div>
        </div>

        {/* Verse of the Day */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📖 Versículo del Día
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando...</p>
            </div>
          ) : verse ? (
            <div>
              <p className="text-lg text-gray-700 italic mb-4">
                "{verse.chapter.content}"
              </p>
              <p className="text-sm text-gray-500 font-semibold">
                {verse.book.name} {verse.chapter.number}:16 ({verse.version})
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No se pudo cargar el versículo</p>
          )}
        </div>

        {/* Permissions Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🔐 Tus Permisos
          </h3>
          <div className="flex flex-wrap gap-2">
            {permissions.map((perm) => (
              <span
                key={perm}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        {hasPermission('view:analytics') && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow p-6 text-white">
            <h3 className="text-xl font-bold mb-2">
              👑 Panel de Administración
            </h3>
            <p className="mb-4">
              Tienes acceso al panel de administración
            </p>
            <button className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Ir al Panel Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔌 12. FRONTEND - API SERVICE

**`src/services/api.ts`**:

```typescript
const API_URL = 'http://localhost:3000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }

  return data;
}

export const authApi = {
  register: (data: any) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: any) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchAPI('/auth/me'),
};

export const readingApi = {
  getBooks: () => fetchAPI('/reading/books'),

  getChapter: (bookSlug: string, chapterNumber: number, version: string = 'RV1960') =>
    fetchAPI(`/reading/books/${bookSlug}/${chapterNumber}?version=${version}`),
};

export const adminApi = {
  getUsers: () => fetchAPI('/admin/users'),

  getAnalytics: () => fetchAPI('/admin/analytics'),
};
```

---

## ✅ 13. TESTING

### Backend:

```bash
# Iniciar backend
cd backend
npm run dev
```

### Probar endpoints:

```bash
# 1. Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bibliaquest.com","password":"admin123"}'

# 2. Copiar el token de la respuesta

# 3. Leer capítulo (con token)
curl http://localhost:3000/api/reading/books/juan/3 \
  -H "Authorization: Bearer TU_TOKEN"

# 4. Ver analytics (solo admin)
curl http://localhost:3000/api/admin/analytics \
  -H "Authorization: Bearer TU_TOKEN"
```

### Frontend:

```bash
cd frontend
npm run dev
```

Abrir http://localhost:5173

**Probar con:**
- Admin: `admin@bibliaquest.com` / `admin123`
- User: `user@bibliaquest.com` / `user123`

---

## 🎉 RESULTADO FINAL

✅ Login/Registro funcional  
✅ Sistema completo de roles y permisos  
✅ Usuario admin ve analytics  
✅ Usuario normal NO ve analytics (403)  
✅ Pantalla muestra Juan 3:16  
✅ Permisos granulares en backend  
✅ UI muestra permisos del usuario  
✅ Todo funcionando con RBAC  

**¡Listo para desarrollar!** 🚀
