# 📦 Guía de Deployment - Manah

Esta guía te ayudará a desplegar **Manah** (frontend + backend) en **Vercel** y **Railway** para tenerlo funcionando online.

---

## 🎯 Resumen Rápido

- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Node.js + Hono + Prisma)
- **Base de Datos**: Neon PostgreSQL (ya configurado)

---

## 📋 Pre-requisitos

1. Cuenta en [GitHub](https://github.com) (ya tienes el repo)
2. Cuenta en [Vercel](https://vercel.com)
3. Cuenta en [Railway](https://railway.app)
4. Tu base de datos Neon ya está funcionando

---

## 🚀 PARTE 1: Desplegar Backend en Railway

### Paso 1: Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app) y haz login con GitHub
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Busca y selecciona: `jeirison47/appbible`
5. Railway comenzará a detectar el proyecto

### Paso 2: Configurar el servicio

1. Railway detectará automáticamente que es un proyecto Node.js
2. En la configuración del servicio:
   - **Name**: `manah-backend` (o el nombre que prefieras)
   - **Root Directory**: `backend`
   - **Build Command**: Railway usará `npm run build` automáticamente
   - **Start Command**: Railway usará `npm start` automáticamente

### Paso 3: Agregar variables de entorno

En Railway, ve a la pestaña **"Variables"** y agrega estas variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_XxrgLnFd8uc2@ep-empty-surf-a8btsglp-pooler.eastus2.azure.neon.tech/appbible_db?sslmode=require&connect_timeout=30

JWT_SECRET=tu-super-secreto-cambiar-en-produccion-min-32-caracteres-123456789

NODE_ENV=production

PORT=3000
```

**IMPORTANTE**: Después de agregar las variables, agrega también:

```env
FRONTEND_URL=
```

(Dejarás este vacío por ahora, lo llenarás después con la URL de Vercel)

### Paso 4: Desplegar

1. Click en **"Deploy"**
2. Railway comenzará a construir y desplegar tu backend
3. Espera 2-3 minutos

### Paso 5: Obtener la URL del backend

1. Una vez desplegado, ve a **"Settings"** → **"Domains"**
2. Railway habrá generado una URL como:
   ```
   https://manah-backend-production.up.railway.app
   ```
3. **Copia esta URL** (la necesitarás para el frontend)

### Paso 6: Verificar que funciona

Abre en el navegador:
```
https://TU-URL-DE-RAILWAY.up.railway.app/health
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
**Value**: `https://TU-URL-DE-RAILWAY.up.railway.app/api`

**IMPORTANTE**: Agrega `/api` al final de la URL de Railway

Ejemplo:
```
VITE_API_URL=https://manah-backend-production.up.railway.app/api
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

### Paso 1: Actualizar CORS en Railway

1. Vuelve a **Railway**
2. Ve a **"Variables"**
3. Edita la variable `FRONTEND_URL` y pon tu URL de Vercel:
   ```
   FRONTEND_URL=https://manah-app.vercel.app
   ```
4. Railway automáticamente re-desplegará el backend

### Paso 2: Esperar re-despliegue

Espera 1-2 minutos a que Railway termine de re-desplegar.

---

## ✅ PARTE 4: Verificar que Todo Funciona

### Prueba 1: Backend funcionando

Abre:
```
https://TU-URL-DE-RAILWAY.up.railway.app/health
```

Deberías ver el mensaje de salud.

### Prueba 2: Frontend funcionando

Abre:
```
https://TU-URL-DE-VERCEL.vercel.app
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

2. **Vercel** y **Railway** detectarán automáticamente los cambios y re-desplegarán

---

## 🐛 Solución de Problemas Comunes

### Error de CORS

**Problema**: "Access to fetch at '...' has been blocked by CORS policy"

**Solución**:
1. Verifica que `FRONTEND_URL` en Railway tenga la URL correcta de Vercel
2. Asegúrate de que no tenga `/` al final
3. Re-despliega el backend en Railway

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
1. Verifica que `DATABASE_URL` en Railway sea correcta
2. Asegúrate de que Neon permita conexiones desde Railway
3. Verifica que la base de datos tenga las tablas (migraciones)

---

## 📝 URLs de Referencia

- **GitHub Repo**: https://github.com/jeirison47/appbible
- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Database**: https://neon.tech/

---

## 🎉 ¡Listo!

Tu aplicación **Manah** ahora está funcionando online y accesible desde cualquier lugar.

URLs finales:
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-backend.up.railway.app`

---

**Creado con ❤️ para Manah - Descubre la Biblia de forma interactiva**
