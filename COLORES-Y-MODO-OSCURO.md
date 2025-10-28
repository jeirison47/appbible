# 🎨 Guía de Colores y Modo Oscuro - Manah App

## 📍 Ubicaciones de Colores Actuales

### 1. **PWA Manifest (vite.config.ts)**
**Archivo:** `frontend/vite.config.ts`

```typescript
manifest: {
  name: 'Manah - Alimenta tu Espíritu',
  short_name: 'Manah',
  description: 'Descubre la Biblia de forma interactiva con gamificación...',
  theme_color: '#4F46E5',       // 🔵 Color principal (Indigo-600)
  background_color: '#ffffff',   // ⚪ Color de fondo
  // ...
}
```

**Uso:** Se aplica al:
- 🌐 Barra de navegación del navegador móvil
- 📱 Splash screen de la PWA
- 🏠 Icono en la pantalla de inicio

---

### 2. **Colores Principales de la App**

#### **Sistema de Colores Actual:**

| Rol | Color | Hex | Uso |
|-----|-------|-----|-----|
| **Principal** | Indigo | `#4F46E5` (indigo-600) | Botones primarios, enlaces |
| **Admin** | Naranja-Rojo | `#EA580C` (orange-600) | Panel de administración |
| **Énfasis** | Púrpura | `#9333EA` (purple-600) | Configuración avanzada |
| **Éxito** | Verde | `#10B981` (green-500) | Notificaciones de éxito |
| **Error** | Rojo | `#EF4444` (red-500) | Notificaciones de error |
| **Fondo Claro** | Gradiente | `from-indigo-50 via-purple-50 to-pink-50` | Fondo general |
| **Fondo Admin** | Gradiente | `from-orange-50 via-yellow-50 to-red-50` | Panel admin |

---

### 3. **Archivos Donde se Usan Colores**

#### **A. Página de Login** (`frontend/src/pages/LoginPage.tsx`)
```tsx
// Fondo
className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"

// Botón principal
className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
```

#### **B. Navbar** (`frontend/src/components/Navbar.tsx`)
```tsx
// Navbar regular
className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"

// Navbar admin
className="bg-gradient-to-r from-orange-600 to-red-600"
```

#### **C. HomePage** (`frontend/src/pages/HomePage.tsx`)
```tsx
// Fondo regular
className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"

// Fondo admin
className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50"
```

#### **D. AppConfigPage** (`frontend/src/pages/AppConfigPage.tsx`)
```tsx
// Fondo
className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50"

// Bordes de sección
className="border-l-4 border-orange-600"

// Sección de configuración avanzada
className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200"
```

#### **E. Toasts (Notificaciones)** (`frontend/src/App.tsx`)
```tsx
<Toaster
  toastOptions={{
    style: {
      background: '#1F2937',  // gray-800
      color: '#fff',
    },
    success: {
      iconTheme: {
        primary: '#10B981',   // green-500
        secondary: '#fff',
      },
    },
    error: {
      iconTheme: {
        primary: '#EF4444',   // red-500
        secondary: '#fff',
      },
    },
  }}
/>
```

---

## 🌓 Implementación de Modo Oscuro

### **Opción 1: Tailwind Dark Mode (Recomendado)**

#### **Paso 1: Configurar Tailwind**

**Archivo:** `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // ← Habilitar modo oscuro con clase
  theme: {
    extend: {
      colors: {
        // Colores personalizados
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // ← Color principal actual
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C', // ← Color admin actual
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
    },
  },
  plugins: [],
}
```

#### **Paso 2: Crear Context para Tema**

**Archivo:** `frontend/src/contexts/ThemeContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Leer tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Aplicar o remover clase 'dark' del HTML
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

#### **Paso 3: Envolver App con ThemeProvider**

**Archivo:** `frontend/src/App.tsx`

```typescript
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  // ... código existente

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>  {/* ← Agregar aquí */}
        <TutorialProvider>
          <BrowserRouter>
            {/* ... resto del código */}
          </BrowserRouter>
        </TutorialProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

#### **Paso 4: Crear Componente Toggle**

**Archivo:** `frontend/src/components/ThemeToggle.tsx`

```typescript
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        // Ícono de luna (modo oscuro)
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        // Ícono de sol (modo claro)
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
```

#### **Paso 5: Agregar Toggle al Navbar**

**Archivo:** `frontend/src/components/Navbar.tsx`

```typescript
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      {/* ... contenido existente */}

      <div className="flex items-center gap-4">
        <ThemeToggle />  {/* ← Agregar aquí */}
        {/* ... otros botones */}
      </div>
    </nav>
  );
}
```

#### **Paso 6: Actualizar Estilos con Dark Mode**

**Ejemplo de conversión de componente:**

```tsx
// ANTES (solo modo claro)
<div className="bg-white text-gray-800">
  <h1 className="text-gray-900">Título</h1>
  <p className="text-gray-600">Texto</p>
</div>

// DESPUÉS (con modo oscuro)
<div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
  <h1 className="text-gray-900 dark:text-white">Título</h1>
  <p className="text-gray-600 dark:text-gray-300">Texto</p>
</div>
```

---

### **Paso 7: Paleta de Colores para Modo Oscuro**

#### **Colores Recomendados:**

| Elemento | Modo Claro | Modo Oscuro |
|----------|------------|-------------|
| **Fondo Principal** | `bg-white` | `dark:bg-gray-900` |
| **Fondo Secundario** | `bg-gray-50` | `dark:bg-gray-800` |
| **Fondo Tarjeta** | `bg-white` | `dark:bg-gray-800` |
| **Texto Principal** | `text-gray-900` | `dark:text-gray-100` |
| **Texto Secundario** | `text-gray-600` | `dark:text-gray-300` |
| **Texto Deshabilitado** | `text-gray-400` | `dark:text-gray-500` |
| **Bordes** | `border-gray-300` | `dark:border-gray-600` |
| **Inputs** | `bg-white border-gray-300` | `dark:bg-gray-700 dark:border-gray-600` |
| **Botones Primarios** | `bg-indigo-600` | `dark:bg-indigo-500` |
| **Hover Botones** | `hover:bg-indigo-700` | `dark:hover:bg-indigo-600` |

---

### **Paso 8: Actualizar Archivos Principales**

#### **LoginPage.tsx**
```tsx
<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h2>
    <input
      type="email"
      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
    />
  </div>
</div>
```

#### **HomePage.tsx**
```tsx
<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tu Progreso</h3>
    <p className="text-gray-600 dark:text-gray-300">Nivel {level} • {xp} XP</p>
  </div>
</div>
```

---

## 📝 Resumen de Implementación

### **Archivos a Crear:**
1. ✅ `frontend/src/contexts/ThemeContext.tsx`
2. ✅ `frontend/src/components/ThemeToggle.tsx`

### **Archivos a Modificar:**
1. ✅ `frontend/tailwind.config.js` - Agregar `darkMode: 'class'`
2. ✅ `frontend/src/App.tsx` - Envolver con `ThemeProvider`
3. ✅ `frontend/src/components/Navbar.tsx` - Agregar `ThemeToggle`
4. ✅ Todos los componentes de páginas - Agregar clases `dark:`

### **Clases Tailwind a Usar:**
- `dark:bg-gray-900` - Fondo oscuro principal
- `dark:bg-gray-800` - Fondo oscuro secundario
- `dark:text-white` - Texto claro en fondo oscuro
- `dark:text-gray-300` - Texto secundario en fondo oscuro
- `dark:border-gray-600` - Bordes en modo oscuro

---

## 🎯 Próximos Pasos

1. ✅ Crear `ThemeContext` y `ThemeProvider`
2. ✅ Crear componente `ThemeToggle`
3. ✅ Agregar `ThemeToggle` al Navbar
4. ✅ Actualizar cada página con clases `dark:`
5. ✅ Probar en navegador
6. ✅ Ajustar colores según necesidades

---

## 🔧 Comandos Útiles

```bash
# Instalar dependencias (si es necesario)
cd frontend
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 💡 Tips Adicionales

1. **Colores Personalizados:** Puedes agregar más colores en `tailwind.config.js`
2. **Persistencia:** El tema se guarda en `localStorage`
3. **Preferencia del Sistema:** Puedes detectar la preferencia del usuario con `window.matchMedia('(prefers-color-scheme: dark)')`
4. **Gradientes Oscuros:** Los gradientes en modo oscuro deben ser más sutiles
5. **Contraste:** Asegúrate de mantener buen contraste en ambos modos

---

## 📚 Recursos

- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [React Context API](https://react.dev/reference/react/useContext)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

---

**Fecha de creación:** 2025-10-27
**Versión:** 1.0
**Proyecto:** Manah - Alimenta tu Espíritu
