# Patrón de Arquitectura Fullstack — Guía Reutilizable

> Documento de referencia para replicar la arquitectura, tecnologías y despliegue
> usados en este proyecto en cualquier aplicación web moderna.

---

## 1. Tipo de Proyecto

**PWA Fullstack (Progressive Web App)**

- Monorepo con dos proyectos independientes: `frontend/` y `backend/`
- Cliente SPA (Single Page Application) instalable como app nativa
- API REST stateless con autenticación JWT
- Base de datos relacional en la nube

---

## 2. Estructura del Monorepo

```
mi-proyecto/
├── frontend/          # Cliente React
├── backend/           # API REST Node.js
├── render.yaml        # Configuración de despliegue
├── package.json       # Raíz (puede ser solo workspace manager)
└── .gitignore
```

---

## 3. Stack Tecnológico

### 3.1 Frontend

| Tecnología | Versión | Rol |
|---|---|---|
| **React** | 18+ | UI library principal |
| **TypeScript** | 5+ | Tipado estático |
| **Vite** | 5+ | Build tool, HMR, bundler |
| **Tailwind CSS** | 3+ | Estilos utility-first |
| **React Router v6** | 6+ | Enrutamiento SPA |
| **Zustand** | 4+ | Estado global del cliente (auth, UI) |
| **TanStack Query** | 5+ | Estado de servidor, caché de datos |
| **Auth0** (`@auth0/auth0-react`) | 2+ | Autenticación OAuth/OIDC |
| **vite-plugin-pwa** | 0.17+ | Generación de Service Worker y manifest |
| **Workbox** | 7+ | Estrategias de caché offline |
| **react-hot-toast** | 2+ | Notificaciones / feedback al usuario |

#### Estructura de carpetas frontend

```
frontend/src/
├── components/        # Componentes reutilizables (Navbar, Modal, ProtectedRoute...)
├── pages/             # Una carpeta por vista/página
├── contexts/          # React Contexts (Theme, Color, etc.)
├── stores/            # Zustand stores (authStore, uiStore...)
├── hooks/             # Custom hooks reutilizables
├── services/          # Clientes HTTP (api.ts, wrappers de fetch)
├── App.tsx            # Router principal + providers
└── main.tsx           # Entry point (Auth0Provider, QueryClient, SW register)
```

#### Reglas de estado frontend

- **Zustand** → estado local del cliente que no viene del servidor (auth, tema, UI global)
- **TanStack Query** → cualquier dato que venga de la API (listas, detalle, paginación)
- **React Context** → preferencias visuales o estado de sesión ligero (tema, color)
- No mezclar estos tres: cada uno tiene su responsabilidad

---

### 3.2 Backend

| Tecnología | Versión | Rol |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **Hono** | 4+ | Framework web ultra-ligero (~14KB) |
| **TypeScript** | 5+ | Tipado estático |
| **Prisma ORM** | 5+ | Abstracción de base de datos |
| **PostgreSQL** | 15+ | Base de datos relacional |
| **bcrypt** | 5+ | Hash de contraseñas |
| **jsonwebtoken** | 9+ | Firma y verificación de tokens JWT |
| **jwks-rsa** | 3+ | Verificación de tokens Auth0 (JWKS) |
| **Zod** | 3+ | Validación de esquemas de entrada |
| **date-fns** | 4+ | Utilidades de fechas |
| **tsx** | 4+ | Ejecución directa de TypeScript en dev |

#### Estructura de carpetas backend

```
backend/src/
├── controllers/       # Handlers de peticiones HTTP (lógica de entrada/salida)
├── routes/            # Definición de rutas y aplicación de middleware
├── middleware/        # Auth JWT, permisos, logging, etc.
├── services/          # Lógica de negocio pura (sin HTTP)
└── index.ts           # Entry point: Hono app, CORS, registro de rutas

backend/prisma/
├── schema.prisma      # Modelos de base de datos
├── migrations/        # Historial de migraciones
└── seed.ts            # Datos iniciales
```

#### Capas del backend (flujo de una petición)

```
Request → Route → Middleware → Controller → Service → Prisma → DB
                                                ↓
Response ←──────────────────────────────── Controller
```

- **Route:** define URL, método HTTP y qué middlewares aplica
- **Middleware:** verifica auth, permisos, validaciones globales
- **Controller:** recibe `req`, llama al service, devuelve `res`
- **Service:** contiene la lógica de negocio, no conoce HTTP
- **Prisma:** única capa que toca la base de datos

---

## 4. Autenticación y Autorización

### 4.1 Autenticación Dual

El sistema soporta dos mecanismos de autenticación simultáneos:

**A) Autenticación local (email + password):**
```
POST /api/auth/register  → bcrypt hash + JWT
POST /api/auth/login     → verificar bcrypt + JWT
```

**B) Autenticación OAuth con Auth0:**
```
POST /api/auth/auth0-login  → verificar JWKS + crear/buscar usuario + JWT propio
```

Ambos flujos terminan emitiendo un **JWT propio** (no el de Auth0), lo que desacopla
la sesión del cliente de cualquier proveedor externo.

### 4.2 JWT

- **Duración:** 7 días
- **Payload mínimo:** `{ userId, iat, exp }`
- **Almacenamiento:** `localStorage` en el cliente (o `sessionStorage` para mayor seguridad)
- **Envío:** Header `Authorization: Bearer <token>`
- **Verificación:** Middleware en cada ruta protegida

```typescript
// Middleware de auth (backend)
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  c.set('userId', payload.userId)
  await next()
}
```

### 4.3 RBAC (Role-Based Access Control)

Modelo de roles y permisos almacenado en base de datos:

```
User ──── UserRole ──── Role ──── RolePermission ──── Permission
```

- Los permisos se cargan al hacer login y se adjuntan al JWT o se consultan en cada request
- El middleware de permisos recibe la permission requerida como argumento:
  ```typescript
  requirePermission('manage:users')
  ```
- Roles de ejemplo: `user`, `admin`, `moderator`
- Permisos de ejemplo: `read:content`, `write:content`, `manage:users`, `view:admin`

---

## 5. Base de Datos

### 5.1 Tecnología

- **PostgreSQL 15+** como motor relacional
- **Prisma ORM** para acceso tipado y gestión de migraciones
- **Neon** como proveedor de PostgreSQL serverless en la nube (free tier disponible)

### 5.2 Flujo de trabajo con Prisma

```bash
# Desarrollo: crear migración al cambiar el schema
npx prisma migrate dev --name nombre_descripcion

# Producción: aplicar migraciones existentes
npx prisma migrate deploy

# Generar cliente TypeScript
npx prisma generate

# GUI visual de la BD
npx prisma studio

# Poblar datos iniciales
npx tsx prisma/seed.ts
```

### 5.3 Modelos base recomendados

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?
  displayName  String
  auth0Id      String?  @unique
  authProvider String   @default("local")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  userRoles    UserRole[]
  settings     UserSettings?
}

model UserSettings {
  id     String @id @default(cuid())
  userId String @unique
  theme  String @default("system")
  // ... otras preferencias
  user   User   @relation(fields: [userId], references: [id])
}

model Role {
  id          String           @id @default(cuid())
  name        String           @unique
  displayName String
  isSystem    Boolean          @default(false)
  userRoles   UserRole[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(cuid())
  name        String           @unique  // e.g. "read:content"
  description String?
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id])
  role   Role   @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}

model AppConfig {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}
```

---

## 6. API Design

### 6.1 Convenciones de endpoints

```
GET    /api/resource           → listar
GET    /api/resource/:id       → detalle
POST   /api/resource           → crear
PUT    /api/resource/:id       → actualizar (completo)
PATCH  /api/resource/:id       → actualizar (parcial)
DELETE /api/resource/:id       → eliminar
```

### 6.2 Respuestas estándar

```typescript
// Éxito
{ data: T, message?: string }

// Error
{ error: string, details?: unknown }

// Lista paginada
{ data: T[], total: number, page: number, limit: number }
```

### 6.3 Códigos HTTP usados

| Código | Cuándo |
|---|---|
| 200 | Éxito general |
| 201 | Recurso creado |
| 400 | Datos inválidos (Zod error) |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 500 | Error interno |

### 6.4 Cliente HTTP en frontend

Centralizar todas las llamadas en un único archivo `services/api.ts`:

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Namespaces por dominio
export const authApi = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
}

export const resourceApi = {
  list: () => request('/resource'),
  get: (id: string) => request(`/resource/${id}`),
}
```

---

## 7. PWA (Progressive Web App)

### 7.1 Configuración en Vite

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Mi App',
        short_name: 'MiApp',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'es',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // Caché de Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            // API: red primero, fallback a caché
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
})
```

### 7.2 Registro del Service Worker

```typescript
// main.tsx
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() { /* notificar al usuario que hay actualización */ },
  onOfflineReady() { console.log('App lista para uso offline') },
})
```

### 7.3 Iconos requeridos

Generar con herramientas como [Favicon.io](https://favicon.io) o [RealFaviconGenerator](https://realfavicongenerator.net):
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/apple-touch-icon.png` (180x180)
- `public/favicon.png`

---

## 8. Theming (Light / Dark Mode)

### 8.1 Configuración Tailwind

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // activado por clase CSS, no por preferencia del sistema
  content: ['./index.html', './src/**/*.{ts,tsx}'],
}
```

### 8.2 ThemeContext

```typescript
// contexts/ThemeContext.tsx
const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

---

## 9. Rutas Protegidas

```typescript
// components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// App.tsx
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

Para RBAC en frontend (solo visual, la seguridad real está en el backend):
```typescript
// hooks/usePermission.ts
const usePermission = (permission: string) => {
  const { permissions } = useAuthStore()
  return permissions.includes(permission)
}
```

---

## 10. Variables de Entorno

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=tu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
```

> Las variables de Vite DEBEN empezar con `VITE_` para ser accesibles en el cliente.

### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="clave-secreta-minimo-32-caracteres-aqui"
PORT=3000
NODE_ENV=development
FRONTEND_URL=https://mi-frontend.vercel.app
```

---

## 11. Despliegue

### 11.1 Backend → Render

Crear `render.yaml` en la raíz del repositorio:

```yaml
services:
  - type: web
    name: mi-app-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        sync: false          # se define manualmente en el dashboard de Render
      - key: JWT_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false
```

> `sync: false` significa que el valor se ingresa manualmente en el panel de Render (no queda en el repo).

**Binding del servidor (importante para contenedores):**
```typescript
// backend/src/index.ts
serve({ fetch: app.fetch, port: Number(process.env.PORT) ?? 3000, hostname: '0.0.0.0' })
//                                                                           ^^^^^^^^^^^
//                                              Sin esto, Render no puede enrutar tráfico
```

### 11.2 Base de datos → Neon

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto → obtener `DATABASE_URL` con `?sslmode=require`
3. Pegar la URL en la variable de entorno `DATABASE_URL` de Render
4. Las migraciones se ejecutan en el `buildCommand` automáticamente

### 11.3 Frontend → Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy
vercel --prod
```

O conectar el repositorio directamente desde [vercel.com](https://vercel.com):
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Variables de entorno:** agregar `VITE_API_URL`, `VITE_AUTH0_DOMAIN`, etc.

### 11.4 Resumen de servicios usados

| Servicio | Capa | Tier gratuito |
|---|---|---|
| [Render](https://render.com) | Backend (Node.js) | Sí (con sleep) |
| [Neon](https://neon.tech) | PostgreSQL | Sí |
| [Vercel](https://vercel.com) | Frontend (React/Vite) | Sí |
| [Auth0](https://auth0.com) | Autenticación OAuth | Sí (7000 MAU) |

---

## 12. Scripts de Desarrollo

### Frontend
```bash
npm run dev       # Servidor de desarrollo en :5173
npm run build     # Build de producción (tsc + vite build)
npm run preview   # Preview del build de producción
npm run lint      # ESLint
```

### Backend
```bash
npm run dev              # tsx watch (hot reload)
npm run build            # Prisma generate + migrate deploy
npm start                # tsx src/index.ts

npm run db:migrate       # Crear y aplicar migración nueva
npm run db:migrate:deploy # Solo aplicar migraciones existentes (CI/CD)
npm run db:generate      # Generar cliente Prisma
npm run db:seed          # Poblar datos iniciales
npm run db:studio        # Abrir GUI de Prisma
```

---

## 13. Checklist para Nuevo Proyecto

### Setup inicial
- [ ] Crear monorepo con carpetas `frontend/` y `backend/`
- [ ] Inicializar frontend con `npm create vite@latest frontend -- --template react-ts`
- [ ] Inicializar backend con `npm init -y` en `backend/`
- [ ] Instalar dependencias de frontend y backend según tablas del §3
- [ ] Configurar `tailwind.config.js` con `darkMode: 'class'`
- [ ] Configurar `vite.config.ts` con `vite-plugin-pwa`
- [ ] Configurar ESLint en frontend

### Auth y base de datos
- [ ] Definir `schema.prisma` con modelos `User`, `Role`, `Permission`, `AppConfig`
- [ ] Ejecutar `prisma migrate dev --name init`
- [ ] Implementar middleware JWT
- [ ] Implementar RBAC service y permission middleware
- [ ] Crear endpoints `/auth/register`, `/auth/login`, `/auth/me`
- [ ] Crear `authStore.ts` con Zustand
- [ ] Crear `ProtectedRoute.tsx`

### Frontend
- [ ] Crear `services/api.ts` centralizado
- [ ] Configurar Auth0Provider en `main.tsx`
- [ ] Configurar QueryClient (TanStack Query)
- [ ] Configurar ThemeContext + toggle de dark mode
- [ ] Crear estructura de páginas y rutas en `App.tsx`
- [ ] Registrar Service Worker en `main.tsx`

### Despliegue
- [ ] Crear cuenta en Neon → obtener DATABASE_URL
- [ ] Crear cuenta en Auth0 → obtener domain y client_id
- [ ] Crear `render.yaml` con buildCommand y envVars
- [ ] Deploy backend en Render → configurar variables de entorno
- [ ] Deploy frontend en Vercel → configurar variables de entorno con URL del backend
- [ ] Actualizar `FRONTEND_URL` en Render con URL de Vercel
- [ ] Actualizar CORS en backend con URL de producción del frontend

---

*Última actualización: basado en el proyecto Manah / AppBiblia*
