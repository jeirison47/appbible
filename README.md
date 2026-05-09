# Manah — Aplicación de Lectura Bíblica Gamificada

Manah es una Progressive Web App (PWA) fullstack para el estudio y lectura de la Biblia. Combina gamificación estilo Duolingo con múltiples modos de lectura, seguimiento de progreso, sistema de XP y rachas, modo estudio con ejercicios interactivos, y soporte para múltiples versiones bíblicas.

---

## Tabla de Contenidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitectura General](#arquitectura-general)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
5. [Base de Datos](#base-de-datos)
6. [API REST — Endpoints](#api-rest--endpoints)
7. [Frontend — Páginas y Rutas](#frontend--páginas-y-rutas)
8. [Autenticación y Control de Acceso (RBAC)](#autenticación-y-control-de-acceso-rbac)
9. [Sistema de Gamificación](#sistema-de-gamificación)
10. [Modo Invitado](#modo-invitado)
11. [PWA](#pwa)
12. [Variables de Entorno](#variables-de-entorno)
13. [Configuración y Setup](#configuración-y-setup)
14. [Deployment](#deployment)

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI Library |
| TypeScript | 5.3 | Tipado estático |
| Vite | 5 | Build tool |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| React Router DOM | 6 | Routing SPA |
| Zustand | 4.4 | State management global |
| TanStack Query | 5 | Server state y caché |
| React Hot Toast | 2.6 | Notificaciones |
| React Joyride | 2.9 | Tours guiados (onboarding) |
| Auth0 React SDK | 2.8 | Autenticación OAuth2 |
| vite-plugin-pwa | 0.17 | Soporte PWA + Service Worker |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20 | Runtime |
| Hono | 4 | Web framework ultraligero (14KB) |
| TypeScript | 5.3 | Tipado estático |
| Prisma ORM | 5.20 | Acceso a base de datos |
| PostgreSQL | — | Base de datos relacional |
| Neon | — | PostgreSQL serverless (cloud) |
| JWT (jsonwebtoken) | 9 | Tokens de autenticación |
| bcrypt | 5.1 | Hash de contraseñas |
| Zod | 3.23 | Validación de esquemas |
| tsx | 4.7 | Ejecución TypeScript con hot reload |

---

## Arquitectura General

```
┌────────────────────────────────────────────────────────┐
│                     CLIENTE (PWA)                      │
│  React + Vite + Tailwind + Zustand + TanStack Query    │
│  Instalable en dispositivos móviles y escritorio       │
└────────────────────┬───────────────────────────────────┘
                     │ HTTP REST (JWT Bearer)
                     │
┌────────────────────▼───────────────────────────────────┐
│                  BACKEND API (Hono)                     │
│  Node.js + TypeScript + Hono                           │
│  7 routers → 59 endpoints                              │
│  Middleware: authMiddleware, optionalAuthMiddleware     │
│  RBAC: roles y permisos granulares                     │
└────────────────────┬───────────────────────────────────┘
                     │ Prisma ORM
                     │
┌────────────────────▼───────────────────────────────────┐
│             BASE DE DATOS (PostgreSQL / Neon)           │
│  16 modelos: usuarios, contenido bíblico, progreso,    │
│  gamificación, roles, permisos, tutoriales             │
└────────────────────────────────────────────────────────┘

Autenticación externa:
┌──────────────┐
│    Auth0     │  OAuth2 / Google Login
└──────────────┘
```

---

## Estructura del Proyecto

```
AppBiblia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de BD (16 modelos)
│   │   └── seed.ts                # Datos iniciales
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio por módulo
│   │   │   ├── auth.controller.ts
│   │   │   ├── reading.controller.ts
│   │   │   ├── progress.controller.ts
│   │   │   ├── study.controller.ts
│   │   │   ├── tutorial.controller.ts
│   │   │   └── config.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts         # JWT obligatorio
│   │   │   └── permission.middleware.ts   # Verificación RBAC
│   │   ├── routes/                # Definición de endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── reading.routes.ts
│   │   │   ├── progress.routes.ts
│   │   │   ├── study.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── tutorial.routes.ts
│   │   │   └── config.routes.ts
│   │   ├── services/              # Servicios reutilizables
│   │   │   ├── auth0.service.ts
│   │   │   ├── config.service.ts
│   │   │   ├── dailyGoal.service.ts
│   │   │   ├── progress.service.ts
│   │   │   ├── rbac.service.ts
│   │   │   ├── streak.service.ts
│   │   │   ├── tutorial.service.ts
│   │   │   └── xp.service.ts
│   │   └── index.ts               # Punto de entrada del servidor
│   ├── .env                       # Variables de entorno (no commitear)
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── logo-color-manah.png
    │   └── manifest.webmanifest   # Manifiesto PWA
    ├── src/
    │   ├── pages/                 # 18 páginas
    │   ├── components/            # 9 componentes reutilizables
    │   ├── contexts/              # ThemeContext, ColorContext, TutorialContext
    │   ├── hooks/                 # 3 hooks personalizados
    │   ├── stores/
    │   │   └── authStore.ts       # Estado global de autenticación (Zustand)
    │   ├── services/
    │   │   └── api.ts             # Cliente HTTP con 6 grupos de APIs
    │   ├── tutorials/             # Contenido de tours guiados
    │   ├── utils/
    │   │   └── bibleVersions.ts   # Utilidades de versiones bíblicas
    │   └── App.tsx                # Rutas principales
    ├── .env.local                 # Variables de entorno locales
    └── package.json
```

---

## Módulos y Funcionalidades

### 1. Autenticación
- Registro con email y contraseña
- Login con email y contraseña
- Login con Google (Auth0 OAuth2)
- JWT guardado en `localStorage`
- Revalidación automática de sesión al cargar la app
- Modo invitado: acceso sin cuenta a contenido público

### 2. Lectura Bíblica — Modo Camino
- Ruta guiada secuencial por los 66 libros de la Biblia
- Seguimiento de capítulos completados por libro
- Barra de progreso visual por libro
- Navegación entre capítulos con registros de XP
- Versión bíblica configurable (RV1960, NVI, TLA, DHH, LBLA, RVR1960)

### 3. Lectura Bíblica — Modo Libre
- Acceso libre a cualquier libro, capítulo o versículo
- Disponible también para usuarios invitados (sin cuenta)
- Vista por versículo o por capítulo completo
- Navegación entre capítulos (anterior / siguiente)
- Indicador "FIN DEL CAPÍTULO" al terminar

### 4. Modo Estudio
- Lecciones interactivas por capítulo
- Tres tipos de ejercicios:
  - **Selección múltiple** (MULTIPLE_CHOICE)
  - **Completar versículo** (FILL_IN_BLANK)
  - **Identificar versículo** (WHICH_VERSE)
- Puntuación al finalizar (correctas / total)
- XP ganado por lección completada
- Opción de reintentar si el resultado es menor al 100%

### 5. Búsqueda Bíblica
- Búsqueda por palabras clave en versículos
- Búsqueda por referencia directa (ej: "Juan 3:16")
- Filtro por versión bíblica
- Disponible para invitados

### 6. Sistema de Progreso y Estadísticas
- Progreso total por libro y capítulo
- Versículo del día en el dashboard
- Estadísticas detalladas: capítulos leídos, libros completados, tiempo de lectura
- Meta diaria de capítulos (configurable por usuario o por el sistema)
- Historial de actividad

### 7. Gamificación
- **XP (Maná):** ganado al completar capítulos y lecciones
- **Niveles:** basados en XP acumulado
- **Racha:** días consecutivos de lectura
- **Meta de racha:** XP mínimo diario para mantenerla
- **Calendario semanal:** visualización de días con actividad
- **Leaderboard:** tabla de clasificación de usuarios

### 8. Perfil de Usuario
- Edición de nombre y apodo
- Cambio de contraseña
- Selección de versión bíblica preferida
- Meta diaria personal
- Estadísticas de logros

### 9. Panel de Administración (solo rol `admin`)
- Gestión de usuarios (ver, eliminar, resetear progreso/contraseña)
- Asignación de roles y permisos
- Estadísticas del sistema
- Configuración global de la app (meta diaria por defecto, colores de acento)

### 10. Configuración de la App
- Modo claro / oscuro
- Color de acento personalizable
- Versión bíblica preferida
- Meta diaria

### 11. Tutorial / Onboarding
- Tour interactivo para nuevos usuarios (React Joyride)
- Progreso de tutorial guardado en BD
- Se muestra solo en el primer acceso o bajo demanda
- No se muestra en modo invitado

---

## Base de Datos

### Diagrama de modelos

```
User ──────── UserSettings
  │
  ├── UserRole ──── Role ──── RolePermission ──── Permission
  │
  ├── ChapterRead ──── Chapter ──── Book
  │
  ├── BookProgress ──── Book
  │
  ├── DailyProgress
  │
  ├── StudyProgress ──── Chapter
  │
  └── UserTutorialProgress

Book ──── Chapter ──── ChapterVersion ──── BibleVersion

DailyVerse (versículo del día generado automáticamente)
AppConfig (configuración dinámica clave-valor)
```

### Modelos principales

#### User
| Campo | Tipo | Descripción |
|---|---|---|
| id | String (cuid) | ID único |
| email | String (unique) | Correo electrónico |
| passwordHash | String? | Hash bcrypt (null si usa Auth0) |
| displayName | String | Nombre visible |
| nickname | String? | Apodo |
| totalXp | Int | XP acumulado total |
| currentLevel | Int | Nivel actual |
| currentStreak | Int | Racha actual (días) |
| longestStreak | Int | Mejor racha histórica |
| lastReadAt | DateTime? | Última vez que leyó |
| auth0Id | String? | ID de Auth0 |
| createdAt | DateTime | Fecha de registro |

#### Book
| Campo | Tipo | Descripción |
|---|---|---|
| id | String | ID único |
| name | String | Nombre del libro |
| slug | String (unique) | URL amigable |
| testament | String | OLD / NEW |
| category | String | Categoría (Ley, Historia, etc.) |
| order | Int | Orden canónico (1-66) |
| totalChapters | Int | Total de capítulos |
| isAvailableInPath | Boolean | Disponible en Modo Camino |

#### ChapterRead
Registra cada vez que un usuario completa un capítulo. Incluye XP ganado y fecha.

#### DailyProgress
Seguimiento diario por usuario: XP del día, capítulos leídos, tiempo de lectura, si se cumplió la meta.

#### AppConfig
Tabla clave-valor para configuración dinámica del sistema (meta diaria por defecto, colores de acento, etc.).

---

## API REST — Endpoints

Base URL: `http://localhost:3000/api` (desarrollo) / `https://appbible.onrender.com/api` (producción)

### Autenticación — `/api/auth`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | No | Registro con email y contraseña |
| POST | `/login` | No | Login local |
| POST | `/auth0-login` | No | Login con token de Auth0 |
| GET | `/me` | JWT | Obtener usuario actual |
| PUT | `/profile` | JWT | Actualizar nombre/apodo |
| PUT | `/settings` | JWT | Actualizar configuración (versión, meta, etc.) |
| PUT | `/password` | JWT | Cambiar contraseña |

### Lectura — `/api/reading`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/books` | Opcional | Lista de los 66 libros |
| GET | `/books/with-completion` | JWT | Libros con progreso del usuario |
| GET | `/books/:bookSlug` | Opcional | Detalles de un libro |
| GET | `/books/:bookSlug/:chapterNumber` | Opcional | Contenido de un capítulo |
| GET | `/verse-of-the-day` | Opcional | Versículo del día |
| GET | `/search` | Opcional | Búsqueda de versículos |
| GET | `/versions` | Opcional | Versiones bíblicas disponibles |

> Las rutas marcadas como "Opcional" funcionan sin token (modo invitado).

### Progreso — `/api/progress`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/me` | JWT | Progreso completo del usuario |
| POST | `/complete-chapter` | JWT | Marcar capítulo como completado + XP |
| POST | `/track-visit` | JWT | Registrar visita (modo libre, sin XP) |
| POST | `/reading-time` | JWT | Registrar tiempo de lectura |
| GET | `/book/:bookSlug` | JWT | Progreso de un libro específico |
| PUT | `/daily-goal` | JWT | Actualizar meta diaria personal |
| GET | `/daily-goal/stats` | JWT | Estadísticas de meta diaria |
| PUT | `/streak-goal` | JWT | Configurar meta de racha |
| GET | `/leaderboard` | JWT | Tabla de clasificación |

### Estudio — `/api/study`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/books` | JWT | Libros disponibles para estudio |
| GET | `/books/:bookSlug` | JWT | Capítulos disponibles en un libro |
| GET | `/books/:bookSlug/:chapterNumber/lesson` | JWT | Lección con ejercicios |
| POST | `/complete-lesson` | JWT | Guardar resultado de lección |

### Tutoriales — `/api/tutorials`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/me` | JWT | Progreso en todos los tutoriales |
| GET | `/should-show-onboarding` | JWT | Si debe mostrarse el tour |
| PUT | `/:tutorialId/progress` | JWT | Actualizar progreso del tutorial |
| POST | `/:tutorialId/complete` | JWT | Completar tutorial |
| POST | `/:tutorialId/skip` | JWT | Saltar tutorial |
| POST | `/:tutorialId/reset` | JWT | Reiniciar tutorial |

### Administración — `/api/admin`
> Todos requieren JWT + permiso específico

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/system-stats` | `view:analytics` | Stats globales del sistema |
| GET | `/user-stats` | `view:analytics` | Stats por usuario |
| GET | `/users` | `manage:users` | Listar usuarios |
| DELETE | `/users/:userId` | `manage:users` | Eliminar usuario |
| POST | `/users/:userId/reset-progress` | `manage:users` | Resetear progreso |
| POST | `/users/:userId/reset-password` | `manage:users` | Resetear contraseña |
| GET | `/users/:userId/roles` | `manage:roles` | Roles del usuario |
| POST | `/users/:userId/roles` | `manage:roles` | Asignar rol |
| DELETE | `/users/:userId/roles/:roleId` | `manage:roles` | Quitar rol |
| GET | `/config` | `manage:config` | Ver configuraciones |
| PUT | `/config` | `manage:config` | Actualizar múltiples configs |
| PUT | `/config/:key` | `manage:config` | Actualizar una config |
| DELETE | `/config/:key` | `manage:config` | Eliminar una config |
| PUT | `/default-daily-goal` | `manage:config` | Cambiar meta diaria global |

### Configuración Pública — `/api/config`
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | No | Todas las configuraciones activas |
| GET | `/:key` | No | Una configuración específica |

---

## Frontend — Páginas y Rutas

### Rutas públicas (accesibles sin cuenta)
| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `LandingPage` | Página de bienvenida |
| `/login` | `LoginPage` | Iniciar sesión |
| `/register` | `RegisterPage` | Crear cuenta |
| `/inicio` | `HomePage` | Dashboard (versículo del día + CTA para invitados) |
| `/lectura-libre` | `FreeReadingPage` | Lista de libros en modo libre |
| `/lectura-libre/:bookSlug` | `FreeBookChaptersPage` | Capítulos de un libro |
| `/lectura-libre/:bookSlug/:chapterNumber` | `FreeVerseReaderPage` | Lector de capítulo |
| `/lectura-libre/:bookSlug/:chapterNumber/:verseNumber` | `FreeVerseReaderPage` | Versículo específico |
| `/buscar` | `SearchPage` | Búsqueda de versículos |
| `/legal` | `LegalPage` | Privacidad, términos y atribución |

### Rutas protegidas (requieren cuenta)
| Ruta | Componente | Descripción |
|---|---|---|
| `/perfil` | `ProfilePage` | Perfil y configuración personal |
| `/estadisticas` | `StatsPage` | Estadísticas detalladas |
| `/camino` | `CaminoPage` | Selección de libro en Modo Camino |
| `/camino/:bookSlug` | `BookPathPage` | Capítulos del libro en Camino |
| `/camino/:bookSlug/:chapterNumber` | `ChapterReaderPage` | Lector con XP |
| `/aprender` | `StudyHomePage` | Inicio del Modo Estudio |
| `/aprender/:bookSlug` | `StudyBookPage` | Lecciones de un libro |
| `/aprender/:bookSlug/:chapterNumber` | `StudyLessonPage` | Lección interactiva |
| `/admin/config` | `AppConfigPage` | Panel de administración |

---

## Autenticación y Control de Acceso (RBAC)

### Flujo de autenticación
1. El usuario se registra o hace login → el backend devuelve un JWT
2. El JWT se guarda en `localStorage`
3. En cada request, el frontend agrega `Authorization: Bearer <token>`
4. El `authMiddleware` valida el JWT y extrae `userId` y `permissions`
5. Al cargar la app, se revalida el token con `GET /api/auth/me`

### Middlewares disponibles
- **`authMiddleware`**: rechaza con 401 si no hay token válido
- **`optionalAuthMiddleware`**: extrae el usuario si hay token, pero permite continuar sin él
- **`requirePermission(name)`**: rechaza con 403 si el usuario no tiene el permiso

### Roles del sistema
| Rol | Descripción |
|---|---|
| `user` | Usuario estándar con acceso a lectura, progreso y estudio |
| `admin` | Acceso completo incluyendo panel de administración |
| `moderator` | Permisos intermedios (configurables) |

### Permisos principales
| Permiso | Descripción |
|---|---|
| `read:chapters` | Leer capítulos y contenido bíblico |
| `manage:users` | Gestionar usuarios (admin) |
| `manage:roles` | Asignar y quitar roles (admin) |
| `manage:permissions` | Gestionar permisos (admin) |
| `manage:config` | Modificar configuración del sistema |
| `view:analytics` | Ver estadísticas del sistema |

---

## Sistema de Gamificación

### XP (Maná)
- Se gana al completar capítulos en Modo Camino
- Se gana al completar lecciones en Modo Estudio (proporcional al puntaje)
- El XP acumula y sube de nivel al usuario

### Niveles
- Basados en XP total acumulado
- Se muestran en el perfil y dashboard

### Racha
- Días consecutivos en que el usuario cumple la meta diaria de XP
- La racha se rompe si no se alcanza el XP mínimo en un día
- Visualización semanal en el dashboard (últimos 7 días)
- Meta de racha: XP mínimo diario configurable por usuario

### Meta Diaria
- Número de capítulos a leer por día
- Puede ser la meta del sistema (por defecto) o una personal
- Se rastrea con `DailyProgress`
- Porcentaje de avance visible en el dashboard

### Leaderboard
- Ranking de usuarios por XP total
- Accesible desde el perfil o estadísticas

---

## Modo Invitado

Los usuarios no registrados pueden acceder sin cuenta a:

| Funcionalidad | Disponible |
|---|---|
| Ver el versículo del día | ✅ |
| Ver la fecha en el dashboard | ✅ |
| Lectura libre (todos los libros y capítulos) | ✅ |
| Búsqueda de versículos | ✅ |
| Racha, progreso, XP, estadísticas | ❌ |
| Modo Camino | ❌ |
| Modo Estudio | ❌ |
| Perfil | ❌ |
| Tutorial de onboarding | ❌ |

El dashboard muestra un CTA invitando a crear cuenta cuando el usuario no está autenticado. El tiempo de lectura y las visitas a capítulos no se registran para invitados.

---

## PWA

La app es instalable como Progressive Web App en Android, iOS, Windows y macOS.

- **Service Worker**: caché de assets y recursos estáticos con Workbox
- **Manifest**: configurado en `public/manifest.webmanifest`
- **Instalación**: botón "Instalar Aplicación" visible en el login cuando el dispositivo lo soporta (`useInstallPWA` hook)
- **Offline**: las páginas ya visitadas quedan disponibles sin conexión

---

## Variables de Entorno

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=tu-dominio.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id-de-auth0
```

### Backend (`.env`)
```env
DATABASE_URL="postgresql://usuario:password@host/db?sslmode=require"
JWT_SECRET="string-secreto-min-32-caracteres"
PORT=3000
NODE_ENV=development
AUTH0_DOMAIN=tu-dominio.us.auth0.com
AUTH0_CLIENT_ID=tu-client-id-de-auth0
FRONTEND_URL=https://tu-app.vercel.app   # Para CORS en producción
```

---

## Configuración y Setup

### Requisitos previos
- Node.js 20+
- npm o pnpm
- Base de datos PostgreSQL (o cuenta en Neon)
- Cuenta en Auth0 (para login con Google)

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd AppBiblia
```

### 2. Configurar el Backend
```bash
cd backend
npm install

# Copiar y completar variables de entorno
cp .env.example .env

# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones a la base de datos
npx prisma db push

# Cargar datos iniciales (libros, roles, permisos, versiones bíblicas)
npx tsx prisma/seed.ts

# Iniciar servidor en desarrollo (hot reload)
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

### 3. Configurar el Frontend
```bash
cd frontend
npm install

# Copiar y completar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173`.

### 4. Build para producción
```bash
# Frontend
cd frontend
npm run build      # Genera dist/

# Backend
cd backend
npm start          # tsx src/index.ts (sin hot reload)
```

---

## Deployment

### Frontend — Vercel
1. Conectar el repositorio en Vercel
2. Configurar el directorio raíz como `frontend/`
3. Agregar las variables de entorno en el panel de Vercel:
   - `VITE_API_URL`
   - `VITE_AUTH0_DOMAIN`
   - `VITE_AUTH0_CLIENT_ID`

### Backend — Render
1. Crear un nuevo Web Service en Render
2. Directorio raíz: `backend/`
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm start`
5. Agregar variables de entorno:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `AUTH0_DOMAIN`
   - `AUTH0_CLIENT_ID`
   - `FRONTEND_URL` (URL de Vercel para CORS)
   - `NODE_ENV=production`

### Base de Datos — Neon
1. Crear proyecto en [neon.tech](https://neon.tech)
2. Copiar la connection string en `DATABASE_URL`
3. Ejecutar `npx prisma db push` para crear las tablas
4. Ejecutar el seed para cargar el contenido bíblico

---

## Versiones Bíblicas Soportadas

| Código | Nombre completo |
|---|---|
| RVR1960 | Reina Valera 1960 |
| RV1960 | Reina Valera 1960 (alias) |
| NVI | Nueva Versión Internacional |
| TLA | Traducción en Lenguaje Actual |
| DHH | Dios Habla Hoy |
| LBLA | La Biblia de las Américas |

---

## Convenciones del Código

- **Nombres de rutas frontend**: español (`/inicio`, `/camino`, `/aprender`, `/buscar`)
- **Nombres de variables/funciones**: camelCase en TypeScript
- **Nombres de tablas Prisma**: PascalCase
- **Estilos**: clases Tailwind utilitarias; colores personalizados con prefijo `manah-` (`manah-gold`, `manah-bg`, `manah-card`, `manah-deep`, `manah-cream`, `manah-muted`, `manah-bronze`)
- **API responses**: `{ data, error, message }` según corresponda
- **Autenticación en cliente**: `useAuthStore` (Zustand) como fuente de verdad global
