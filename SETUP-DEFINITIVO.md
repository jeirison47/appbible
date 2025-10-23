# ⚡ BibliaQuest - Setup Definitivo

## Stack
```
Frontend: React + Vite + TypeScript + Tailwind + PWA
Backend:  Node.js + Hono + Prisma + PostgreSQL (Neon)
Costo:    $0
```

---

## 🚀 SETUP COMPLETO

### 1️⃣ BASE DE DATOS (Neon)

1. Ir a https://neon.tech → Sign up
2. Create Project → `bibliaquest`
3. Copiar **Connection String**

```
postgresql://user:pass@host.neon.tech/bibliaquest?sslmode=require
```

---

### 2️⃣ BACKEND

```bash
# Crear proyecto
mkdir bibliaquest && cd bibliaquest
mkdir backend && cd backend
npm init -y

# Instalar deps
npm install hono @hono/node-server prisma @prisma/client bcrypt jsonwebtoken zod
npm install -D typescript @types/node @types/bcrypt @types/jsonwebtoken tsx

# TypeScript config
npx tsc --init
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**Prisma:**
```bash
npx prisma init
```

**.env:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="tu-super-secreto-min-32-caracteres"
PORT=3000
```

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  displayName   String
  avatarUrl     String?
  
  totalXp       Int      @default(0)
  currentLevel  Int      @default(1)
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  
  settings      UserSettings?
  bookProgress  BookProgress[]
  chapterReads  ChapterRead[]
  dailyProgress DailyProgress[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
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

model Book {
  id                String   @id @default(cuid())
  testament         String
  category          String
  name              String
  slug              String   @unique
  order             Int      @unique
  totalChapters     Int
  isAvailableInPath Boolean  @default(false)
  
  chapters    Chapter[]
  progress    BookProgress[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@map("books")
}

model Chapter {
  id         String   @id @default(cuid())
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  number     Int
  title      String?
  content    String   @db.Text
  verseCount Int
  
  reads ChapterRead[]
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([bookId, number])
  @@map("chapters")
}

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
  @@map("book_progress")
}

model ChapterRead {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapterId String
  chapter   Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  readType  String
  xpEarned  Int
  timeSpent Int?
  readAt    DateTime @default(now())
  
  @@unique([userId, chapterId])
  @@map("chapter_reads")
}

model DailyProgress {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime @db.Date
  
  xpEarned                Int     @default(0)
  chaptersRead            Int     @default(0)
  timeReading             Int     @default(0)
  systemGoalCompleted     Boolean @default(false)
  personalGoalCompleted   Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, date])
  @@map("daily_progress")
}
```

**Migrar DB:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Estructura:**
```bash
mkdir -p src/{routes,controllers,middleware,utils}
```

**src/index.ts:**
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import authRoutes from './routes/auth.routes';

const app = new Hono();

app.use('*', cors());
app.get('/health', (c) => c.json({ status: 'ok' }));
app.route('/api/auth', authRoutes);

const port = parseInt(process.env.PORT || '3000');
console.log(`🚀 Server: http://localhost:${port}`);

serve({ fetch: app.fetch, port });
```

**src/routes/auth.routes.ts:**
```typescript
import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const auth = new Hono();

auth.post('/register', AuthController.register);
auth.post('/login', AuthController.login);
auth.get('/me', authMiddleware, AuthController.me);

export default auth;
```

**src/controllers/auth.controller.ts:**
```typescript
import { Context } from 'hono';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthController {
  static async register(c: Context) {
    try {
      const { email, password, displayName } = await c.req.json();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return c.json({ error: 'Email exists' }, 400);

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          settings: { create: {} }
        },
        include: { settings: true }
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      return c.json({ user, token }, 201);
    } catch (error) {
      return c.json({ error: 'Registration failed' }, 500);
    }
  }

  static async login(c: Context) {
    try {
      const { email, password } = await c.req.json();

      const user = await prisma.user.findUnique({
        where: { email },
        include: { settings: true }
      });

      if (!user || !user.passwordHash) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return c.json({ error: 'Invalid credentials' }, 401);

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

      return c.json({ user, token });
    } catch (error) {
      return c.json({ error: 'Login failed' }, 500);
    }
  }

  static async me(c: Context) {
    const userId = c.get('userId');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true }
    });

    if (!user) return c.json({ error: 'User not found' }, 404);

    return c.json({ user });
  }
}
```

**src/middleware/auth.middleware.ts:**
```typescript
import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    c.set('userId', decoded.userId);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Correr:**
```bash
npm run dev
```

✅ Backend en http://localhost:3000

---

### 3️⃣ FRONTEND

```bash
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend

# Instalar deps
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom zustand @tanstack/react-query
npm install vite-plugin-pwa workbox-window

# Tailwind
npx tailwindcss init -p
```

**tailwind.config.js:**
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BibliaQuest',
        short_name: 'BibliaQuest',
        theme_color: '#4F46E5',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
```

**Estructura:**
```bash
mkdir -p src/{pages,stores,services}
```

**src/services/api.ts:**
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

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export const authApi = {
  register: (data: any) => fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: any) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  me: () => fetchAPI('/auth/me'),
};
```

**src/stores/authStore.ts:**
```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  displayName: string;
  totalXp: number;
  currentLevel: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

**src/pages/LoginPage.tsx:**
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
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = isRegister
        ? await authApi.register({ email, password, displayName })
        : await authApi.login({ email, password });
      
      setAuth(data.user, data.token);
      navigate('/');
    } catch (error) {
      alert(isRegister ? 'Registration failed' : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            BibliaQuest
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Lee la Biblia diariamente
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Nombre"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
            </button>
          </form>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full mt-4 text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**src/pages/HomePage.tsx:**
```typescript
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">BibliaQuest</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-3xl font-bold mb-2">
            ¡Hola {user?.displayName}! 👋
          </h2>
          
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">XP Total</p>
              <p className="text-2xl font-bold text-indigo-600">{user?.totalXp}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Nivel</p>
              <p className="text-2xl font-bold text-purple-600">{user?.currentLevel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**src/App.tsx:**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**Correr:**
```bash
npm run dev
```

✅ Frontend en http://localhost:5173

---

## ✅ TESTING

### Backend:
```bash
curl http://localhost:3000/health
```

### Crear usuario:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","displayName":"Test"}'
```

### Frontend:
1. Abrir http://localhost:5173
2. Registrarse o login
3. Ver HomePage ✅

---

## 📱 INSTALAR COMO PWA

**PC:** Click ícono de instalación en barra URL  
**Móvil:** Menú → "Agregar a pantalla de inicio"

---

## 🎯 COMANDOS

```bash
# Backend
cd backend
npm run dev              # Desarrollo
npx prisma studio        # Ver DB

# Frontend
cd frontend
npm run dev              # Desarrollo
npm run build            # Production
```

---

## ✅ DONE

- ✅ Backend funcionando
- ✅ Frontend funcionando
- ✅ Auth completo
- ✅ PWA instalable
- ✅ Costo: $0

**¡A desarrollar!** 🚀
