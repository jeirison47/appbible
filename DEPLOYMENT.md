# 📦 Guía de Deployment - Manah

Esta guía te ayudará a desplegar **Manah** (frontend + backend) en **Vercel** y **Render** para tenerlo funcionando online.

---

## 🎯 Resumen Rápido

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Hono + Prisma)
- **Base de Datos**: Neon PostgreSQL (ya configurado)

---

## 📋 Pre-requisitos

1. Cuenta en [GitHub](https://github.com) (ya tienes el repo)
2. Cuenta en [Vercel](https://vercel.com)
3. Cuenta en [Render](https://render.com)
4. Tu base de datos Neon ya está funcionando

---

## 🚀 PARTE 1: Desplegar Backend en Render

### Paso 1: Crear Web Service en Render

1. Ve a [render.com](https://render.com) y haz login con GitHub
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub si no lo has hecho
4. Busca y selecciona: `jeirison47/appbible`
5. Click en **"Connect"**

### Paso 2: Configurar el servicio

En la configuración del Web Service:

- **Name**: `manah-backend` (o el nombre que prefieras)
- **Region**: Elige la más cercana (ej: Oregon - US West)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Paso 3: Agregar variables de entorno

Antes de desplegar, scroll hacia abajo hasta **"Environment Variables"** y agrega:

```
DATABASE_URL=postgresql://neondb_owner:npg_XxrgLnFd8uc2@ep-empty-surf-a8btsglp-pooler.eastus2.azure.neon.tech/appbible_db?sslmode=require&connect_timeout=30

JWT_SECRET=tu-super-secreto-cambiar-en-produccion-min-32-caracteres-123456789

NODE_ENV=production

PORT=3000
```

**IMPORTANTE**: Agrega también (déjala vacía por ahora):
```
FRONTEND_URL=
```

### Paso 4: Desplegar

1. Click en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu backend
3. Espera 3-5 minutos (el primer deploy es más lento)

### Paso 5: Obtener la URL del backend

1. Una vez desplegado, verás la URL en la parte superior:
   ```
   https://manah-backend.onrender.com
   ```
2. **Copia esta URL** (la necesitarás para el frontend)

### Paso 6: Verificar que funciona

Abre en el navegador:
```
https://TU-URL-RENDER.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-10-23T...",
  "service": "Manah API"
}
```

✅ **Backend funcionando!**

---

## 🎨 PARTE 2: Desplegar Frontend en Vercel

### Paso 1: Crear proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login con GitHub
2. Click en **"Add New..."** → **"Project"**
3. Busca y selecciona tu repositorio: `jeirison47/appbible`
4. Click en **"Import"**

### Paso 2: Configurar el proyecto

En la configuración del proyecto:

- **Project Name**: `manah-app` (o el nombre que prefieras)
- **Framework Preset**: `Vite`
- **Root Directory**: Click en **"Edit"** → Selecciona `frontend`
- **Build Command**: `npm run build` (Vercel lo detecta automáticamente)
- **Output Directory**: `dist` (Vercel lo detecta automáticamente)
- **Install Command**: `npm install`

### Paso 3: Agregar variable de entorno

En la sección **"Environment Variables"**, agrega:

**Name**: `VITE_API_URL`  
**Value**: `https://TU-URL-RENDER.onrender.com/api`

**IMPORTANTE**: Agrega `/api` al final de la URL de Render

Ejemplo:
```
VITE_API_URL=https://manah-backend.onrender.com/api
```

### Paso 4: Desplegar

1. Click en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye y despliega
3. Una vez completado, Vercel te dará una URL como:
   ```
   https://manah-app.vercel.app
   ```

---

## 🔧 PARTE 3: Conectar Frontend y Backend (CORS)

### Paso 1: Actualizar CORS en Render

1. Vuelve a **Render**
2. Ve a tu servicio `manah-backend`
3. Click en **"Environment"** en el menú lateral
4. Encuentra la variable `FRONTEND_URL` y edítala:
   ```
   FRONTEND_URL=https://manah-app.vercel.app
   ```
5. Click en **"Save Changes"**

### Paso 2: Esperar re-despliegue

Render automáticamente re-desplegará el backend (1-2 minutos).

---

## ✅ PARTE 4: Verificar que Todo Funciona

### Prueba 1: Backend funcionando

Abre:
```
https://TU-URL-RENDER.onrender.com/health
```

Deberías ver el mensaje de salud.

### Prueba 2: Frontend funcionando

Abre:
```
https://TU-URL-VERCEL.vercel.app
```

Deberías ver la página de login/registro de Manah.

### Prueba 3: Registrarse

1. Intenta registrarte con un nuevo usuario
2. Si todo funciona, ¡ya está listo! 🎉

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios al código:

1. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```

2. **Vercel** y **Render** detectarán automáticamente los cambios y re-desplegarán

---

## 🐛 Solución de Problemas Comunes

### Error de CORS

**Problema**: "Access to fetch at '...' has been blocked by CORS policy"

**Solución**:
1. Verifica que `FRONTEND_URL` en Render tenga la URL correcta de Vercel
2. Asegúrate de que no tenga `/` al final
3. Re-despliega el backend en Render (Manual Deploy)

### Error "Cannot connect to API"

**Problema**: El frontend no puede conectarse al backend

**Solución**:
1. Verifica que `VITE_API_URL` en Vercel esté correcta
2. Debe terminar en `/api`
3. Ve a Settings → Environment Variables en Vercel
4. Si la cambias, debes re-desplegar: Deployments → Redeploy

### Error de base de datos

**Problema**: "Error connecting to database"

**Solución**:
1. Verifica que `DATABASE_URL` en Render sea correcta
2. Asegúrate de que Neon permita conexiones desde Render
3. Verifica que la base de datos tenga las tablas (migraciones)

### Backend se duerme (Render Free)

**Problema**: La primera carga es lenta después de inactividad

**Explicación**: El plan gratuito de Render pone el servicio en sleep después de 15 minutos de inactividad.

**Solución**: 
- Es normal en el plan gratuito
- Espera 30-60 segundos en la primera carga
- Para evitarlo, actualiza al plan de pago

---

## 📝 URLs de Referencia

- **GitHub Repo**: https://github.com/jeirison47/appbible
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Database**: https://neon.tech/

---

## 🎉 ¡Listo!

Tu aplicación **Manah** ahora está funcionando online y accesible desde cualquier lugar.

URLs finales:
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-backend.onrender.com`

---

**Creado con ❤️ para Manah - Descubre la Biblia de forma interactiva**
