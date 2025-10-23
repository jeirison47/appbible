# 📋 BibliaQuest - Configuración General del Proyecto

## 🎯 DESCRIPCIÓN DEL PROYECTO

**BibliaQuest** es una aplicación web progresiva (PWA) para lectura diaria de la Biblia con sistema de gamificación, diseñada para fomentar el hábito de lectura bíblica.

**Tipo:** PWA (Progressive Web App)  
**Plataformas:** Web (PC + Móvil) - Instalable como app nativa  
**Audiencia:** Usuarios de habla hispana interesados en lectura bíblica  
**Modelo:** Freemium (MVP será 100% gratuito)

---

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────┐
│      FRONTEND (PWA)                 │
│  React + Vite + TypeScript          │
│  - UI Components                    │
│  - State Management (Zustand)       │
│  - API Client (Fetch)               │
│  - Service Worker (Offline)         │
└──────────────┬──────────────────────┘
               │ REST API (HTTPS)
               │ JSON + JWT Auth
               ↓
┌─────────────────────────────────────┐
│      BACKEND API                    │
│  Node.js + Hono + TypeScript        │
│  - Authentication & Authorization   │
│  - Business Logic                   │
│  - Data Access Layer (Prisma)       │
│  - Role-Based Access Control        │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      DATABASE                       │
│  PostgreSQL (Neon Serverless)       │
│  - User Data                        │
│  - Biblical Content (4 versions)    │
│  - Progress Tracking                │
│  - Roles & Permissions              │
└─────────────────────────────────────┘
```

---

## 📦 STACK TECNOLÓGICO COMPLETO

### Frontend (Cliente)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18+ | UI Library - Componentes reutilizables |
| **Vite** | 5+ | Build tool - HMR ultra rápido |
| **TypeScript** | 5+ | Type safety - Menos bugs |
| **Tailwind CSS** | 3+ | Utility-first CSS - Estilos rápidos |
| **React Router** | 6+ | Client-side routing |
| **Zustand** | 4+ | State management (1KB) |
| **TanStack Query** | 5+ | Server state + caching |
| **Fetch API** | Native | HTTP client (0KB) |
| **Vite PWA Plugin** | Latest | Service Workers + Manifest |
| **Workbox** | 7+ | PWA offline strategy |

### Backend (Servidor)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Hono** | 4+ | Web framework (14KB, ultra rápido) |
| **TypeScript** | 5+ | Type safety |
| **Prisma** | 5+ | ORM + Database migrations |
| **PostgreSQL** | 15+ | Base de datos relacional |
| **bcrypt** | 5+ | Password hashing |
| **jsonwebtoken** | 9+ | JWT authentication |
| **Zod** | 3+ | Schema validation |
| **tsx** | Latest | TypeScript execution |

### Base de Datos

| Tecnología | Plan | Propósito |
|------------|------|-----------|
| **PostgreSQL** | 15+ | Database engine |
| **Neon** | Free Tier | Serverless PostgreSQL hosting |
| **Prisma** | - | ORM + Migrations |

### DevOps & Tools

| Herramienta | Propósito |
|-------------|-----------|
| **Git** | Version control |
| **GitHub** | Repository hosting |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Prisma Studio** | Database GUI |

---

## 📂 ESTRUCTURA DEL PROYECTO

```
bibliaquest/
├── backend/                      # API Backend
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── books.controller.ts
│   │   │   ├── chapters.controller.ts
│   │   │   ├── reading.controller.ts
│   │   │   ├── roles.controller.ts
│   │   │   └── permissions.controller.ts
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── books.routes.ts
│   │   │   ├── reading.routes.ts
│   │   │   └── admin.routes.ts
│   │   │
│   │   ├── middleware/           # Middleware functions
│   │   │   ├── auth.middleware.ts
│   │   │   ├── permission.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   │
│   │   ├── services/             # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── xp.service.ts
│   │   │   ├── level.service.ts
│   │   │   ├── streak.service.ts
│   │   │   ├── reading.service.ts
│   │   │   ├── rbac.service.ts   # Role-Based Access Control
│   │   │   └── import.service.ts # Bible import
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── jwt.ts
│   │   │   ├── bcrypt.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/                # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   ├── config/               # Configuration
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   │
│   │   └── index.ts              # Entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── migrations/           # Database migrations
│   │   └── seed.ts              # Seed data
│   │
│   ├── scripts/
│   │   └── importBible.ts       # Import Bible from API
│   │
│   ├── .env                      # Environment variables
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── frontend/                     # React PWA Frontend
    ├── public/
    │   ├── pwa-192x192.png
    │   ├── pwa-512x512.png
    │   └── favicon.ico
    │
    ├── src/
    │   ├── components/           # Reusable components
    │   │   ├── ui/              # Basic UI components
    │   │   │   ├── Button.tsx
    │   │   │   ├── Input.tsx
    │   │   │   ├── Card.tsx
    │   │   │   ├── Modal.tsx
    │   │   │   └── Spinner.tsx
    │   │   │
    │   │   ├── layout/          # Layout components
    │   │   │   ├── Header.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── Footer.tsx
    │   │   │
    │   │   └── reading/         # Reading components
    │   │       ├── VerseCard.tsx
    │   │       ├── ChapterReader.tsx
    │   │       └── BookSelector.tsx
    │   │
    │   ├── pages/               # Page components
    │   │   ├── LoginPage.tsx
    │   │   ├── HomePage.tsx
    │   │   ├── ReadingPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   └── AdminPage.tsx
    │   │
    │   ├── stores/              # Zustand stores
    │   │   ├── authStore.ts
    │   │   ├── userStore.ts
    │   │   ├── readingStore.ts
    │   │   └── uiStore.ts
    │   │
    │   ├── services/            # API services
    │   │   ├── api.ts           # Base API client
    │   │   ├── auth.service.ts
    │   │   ├── reading.service.ts
    │   │   └── admin.service.ts
    │   │
    │   ├── hooks/               # Custom hooks
    │   │   ├── useAuth.ts
    │   │   ├── usePermission.ts
    │   │   └── useReading.ts
    │   │
    │   ├── utils/               # Utility functions
    │   │   ├── formatters.ts
    │   │   ├── validators.ts
    │   │   └── constants.ts
    │   │
    │   ├── types/               # TypeScript types
    │   │   └── index.ts
    │   │
    │   ├── App.tsx              # Root component
    │   ├── main.tsx             # Entry point
    │   └── index.css            # Global styles
    │
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── README.md
```

---

## 🗄️ MODELO DE BASE DE DATOS

### Tablas Principales

#### **Users**
- Información del usuario
- Credenciales (email, password hash)
- Gamificación (XP, nivel, racha)

#### **Roles**
- Definición de roles (Admin, User, Moderator, etc.)
- Sistema jerárquico de permisos

#### **Permissions**
- Permisos granulares (read_chapter, edit_user, manage_roles, etc.)
- Definición de acciones permitidas

#### **RolePermissions**
- Tabla pivot: Roles ↔ Permissions
- Many-to-many relationship

#### **UserRoles**
- Tabla pivot: Users ↔ Roles
- Un usuario puede tener múltiples roles

#### **Books**
- 66 libros de la Biblia
- Metadata (testamento, categoría, orden)

#### **Chapters**
- Capítulos de cada libro
- Contenido en 4 versiones (RV1960, NVI, TLA, NTV)
- Versículos parseados

#### **BookProgress**
- Progreso de lectura por libro
- Capítulos completados

#### **ChapterReads**
- Historial de capítulos leídos
- Timestamp de lectura

#### **DailyProgress**
- Progreso diario del usuario
- XP ganado, capítulos leídos

---

## 📖 FUENTE DE DATOS BÍBLICOS

### Estrategia de Contenido

**Fuente Principal:** API.Bible (https://scripture.api.bible)

**Versiones a Implementar:**
1. **Reina Valera 1960** (RVR1960) - Español clásico
2. **Nueva Versión Internacional** (NVI) - Español moderno
3. **Traducción en Lenguaje Actual** (TLA) - Español simplificado
4. **Nueva Traducción Viviente** (NTV) - Español contemporáneo

### Proceso de Importación

```
1. Registro en API.Bible (gratuito)
   └─> Obtener API Key

2. Script de Importación (correr UNA VEZ)
   └─> Descargar:
       ├─ 66 libros
       ├─ ~1,189 capítulos
       ├─ ~31,102 versículos
       └─ 4 versiones = ~124,408 versículos totales

3. Guardar en PostgreSQL
   └─> Almacenamiento local permanente
   
4. App siempre usa base de datos propia
   └─> Sin dependencia de APIs externas
```

### Ventajas de este Enfoque

- ✅ **Offline-first:** App funciona sin internet
- ✅ **Sin rate limits:** No hay límites de consultas
- ✅ **Velocidad:** Queries locales ultra rápidos
- ✅ **Control total:** Datos propios para siempre
- ✅ **Legal:** API.Bible permite cachear contenido
- ✅ **Resiliente:** Si API.Bible se cae, no afecta

### Estructura de Almacenamiento

```prisma
model Chapter {
  id             String @id @default(cuid())
  bookId         String
  number         Int
  title          String?
  
  // 4 versiones en columnas separadas
  contentRV1960  String @db.Text
  contentNVI     String @db.Text
  contentTLA     String @db.Text
  contentNTV     String @db.Text
  
  verseCount     Int
  
  // Versículos parseados (JSON)
  versesRV1960   Json
  versesNVI      Json
  versesTLA      Json
  versesNTV      Json
}
```

---

## 🔐 SISTEMA DE ROLES Y PERMISOS (RBAC)

### Roles por Defecto

| Rol | Descripción | Permisos Base |
|-----|-------------|---------------|
| **user** | Usuario estándar | Lectura, progreso propio |
| **premium** | Usuario premium | Todo de user + features premium |
| **moderator** | Moderador | Gestionar contenido, usuarios |
| **admin** | Administrador | Control total del sistema |
| **super_admin** | Super Admin | Gestionar admins, roles, permisos |

### Permisos Granulares

**Lectura:**
- `read:chapters` - Leer capítulos
- `read:all_versions` - Acceso a todas las versiones
- `read:stats` - Ver estadísticas propias

**Usuario:**
- `manage:own_profile` - Editar perfil propio
- `manage:users` - Gestionar otros usuarios
- `view:user_stats` - Ver estadísticas de usuarios

**Administración:**
- `manage:roles` - Crear/editar roles
- `manage:permissions` - Asignar permisos
- `manage:content` - Editar contenido bíblico
- `view:analytics` - Ver analytics del sistema

**Sistema:**
- `system:admin` - Acceso al panel admin
- `system:backup` - Realizar backups
- `system:config` - Configurar sistema

### Implementación

```typescript
// Middleware de verificación de permisos
async function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId');
    
    const hasPermission = await checkUserPermission(userId, permission);
    
    if (!hasPermission) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    
    await next();
  };
}

// Uso en rutas
app.get('/admin/users', 
  authMiddleware,
  requirePermission('manage:users'),
  AdminController.listUsers
);
```

---

## 🔄 FLUJO DE AUTENTICACIÓN

```
1. Usuario se registra/login
   └─> Backend valida credenciales
       └─> Genera JWT token
           └─> Incluye: userId, roles[], permissions[]

2. Cliente guarda token en localStorage
   
3. Cada request incluye token en header:
   Authorization: Bearer {token}

4. Backend verifica token + permisos
   └─> Si válido → Procesa request
   └─> Si no → 401 Unauthorized / 403 Forbidden
```

---

## 📊 FLUJO DE DATOS

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       ↓ Login
┌──────────────┐
│   Frontend   │ → Guarda JWT token
└──────┬───────┘
       │
       ↓ Request + Token
┌──────────────┐
│   Backend    │ → Verifica token + permisos
└──────┬───────┘
       │
       ↓ Query
┌──────────────┐
│  PostgreSQL  │ → Retorna datos
└──────┬───────┘
       │
       ↓ Response
┌──────────────┐
│   Frontend   │ → Muestra UI
└──────────────┘
```

---

## 💰 COSTOS

### Desarrollo (Actual)
```
Base de Datos: Neon Free Tier      $0/mes
Backend:       Local                 $0/mes
Frontend:      Local                 $0/mes
APIs:          API.Bible (gratis)   $0/mes
────────────────────────────────────────
TOTAL:                               $0/mes
```

### Producción (Futuro)
```
Base de Datos: Neon Free/Scale      $0-19/mes
Backend:       Railway/Render        $5-10/mes
CDN:           Cloudflare            $0/mes
Storage:       Cloudflare R2         $1-5/mes
────────────────────────────────────────────
TOTAL:                               $6-34/mes
```

---

## 🚀 ROADMAP DE DESARROLLO

### Fase 1: Setup & Auth (Semana 1-2)
- ✅ Setup de proyecto (frontend + backend)
- ✅ Base de datos con Prisma
- ✅ Sistema de autenticación
- ✅ Sistema de roles y permisos
- ✅ Panel de login/registro

### Fase 2: Contenido Bíblico (Semana 3)
- ✅ Script de importación desde API.Bible
- ✅ Importar 4 versiones completas
- ✅ Endpoints de lectura
- ✅ Pantalla de lectura básica

### Fase 3: Core Features (Semana 4-8)
- Sistema de XP y niveles
- Sistema de rachas
- Metas diarias
- Dashboard de progreso
- Lectura estructurada (Camino)
- Lectura libre

### Fase 4: Polish & Deploy (Semana 9-10)
- PWA completa (offline mode)
- Optimizaciones de performance
- Testing completo
- Deploy a producción

---

## 🎯 CRITERIOS DE ÉXITO

### MVP (Versión 1.0)
- ✅ Usuario puede registrarse/login
- ✅ Usuario puede leer cualquier capítulo
- ✅ 4 versiones disponibles
- ✅ Sistema de XP funcional
- ✅ Rachas diarias funcionando
- ✅ PWA instalable
- ✅ Sistema de permisos activo

### Métricas de Éxito
- 100+ usuarios activos en primer mes
- 70%+ retención a 7 días
- 50%+ retención a 30 días
- <2s tiempo de carga
- 0 downtime crítico

---

## 📝 NOTAS TÉCNICAS

### Consideraciones de Performance
- Lazy loading de capítulos
- Virtual scrolling para listas largas
- Caching agresivo de contenido bíblico
- Service Worker para offline-first

### Seguridad
- Passwords hasheados con bcrypt (10 rounds)
- JWT tokens con expiración (7 días)
- HTTPS obligatorio en producción
- Rate limiting en endpoints sensibles
- Validación de datos con Zod

### Escalabilidad
- PostgreSQL puede manejar millones de usuarios
- Backend stateless (horizontal scaling)
- CDN para assets estáticos
- Cache layer (Redis) cuando sea necesario

---

## 📞 CONTACTO Y SOPORTE

**Desarrollador:** [Tu Nombre]  
**Email:** [Tu Email]  
**GitHub:** [Tu GitHub]

**Documentación Adicional:**
- `SETUP-DEFINITIVO.md` - Guía de instalación
- `IMPLEMENTACION-INICIAL.md` - Primera implementación
- `API-DOCS.md` - Documentación de API

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Estado:** En Desarrollo

---

# 🎉 ¡BibliaQuest - Lee la Biblia Diariamente!
