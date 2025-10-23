# 🚀 Guía de Prueba PWA - BibliaQuest

## ✅ Estado de Configuración

**Configuración PWA Completada:**
- ✅ Iconos instalados (`pwa-192x192.png` y `pwa-512x512.png`)
- ✅ Metadatos HTML configurados
- ✅ Manifest configurado con opciones completas
- ✅ Service Worker registrado con auto-actualización
- ✅ Caché configurado (fuentes, API, assets)
- ✅ Soporte offline básico
- ✅ Habilitado en modo desarrollo

---

## 🧪 Cómo Probar el PWA

### Opción 1: Modo Desarrollo (Más Rápido)

El PWA ya está habilitado en desarrollo para pruebas rápidas:

1. **Abrir la aplicación en el navegador**
   ```
   http://localhost:5174 (o el puerto que esté usando)
   ```

2. **Verificar el Service Worker**
   - Abre DevTools (F12)
   - Ve a la pestaña **Application** (o **Aplicación**)
   - Busca "Service Workers" en el panel izquierdo
   - Deberías ver un service worker registrado y activo

3. **Verificar el Manifest**
   - En DevTools → **Application** → **Manifest**
   - Verifica que aparezca:
     - Nombre: BibliaQuest
     - Iconos: 192x192 y 512x512
     - Theme color: #4F46E5
     - Display: standalone

### Opción 2: Modo Producción (Prueba Completa)

Para probar la versión completa del PWA como sería en producción:

1. **Construir la aplicación**
   ```bash
   cd frontend
   npm run build
   ```

2. **Servir la build**
   ```bash
   npm run preview
   ```

   Esto iniciará un servidor en: `http://localhost:4173`

3. **Verificar la instalación**
   - Abre Chrome/Edge
   - Ve a `http://localhost:4173`
   - Busca el ícono de instalación en la barra de direcciones (➕ o icono de computadora)

---

## 📱 Instalar el PWA

### En Windows (Chrome/Edge)

**Método 1: Desde la barra de direcciones**
1. Haz clic en el ícono de instalación (➕) en la barra de direcciones
2. Confirma "Instalar"

**Método 2: Desde el menú**
1. Haz clic en ⋮ (tres puntos) en la esquina superior derecha
2. Selecciona "Instalar BibliaQuest"
3. Confirma la instalación

**Resultado:**
- Se creará un acceso directo en tu escritorio
- La app aparecerá en el menú Inicio
- Se abrirá como una app independiente (sin barra del navegador)

### En Android

1. Abre Chrome
2. Ve a la URL de la aplicación
3. Toca el menú (⋮)
4. Selecciona "Agregar a pantalla de inicio"
5. Confirma el nombre y toca "Agregar"

**Resultado:**
- Ícono de BibliaQuest en tu pantalla de inicio
- Se abre como app nativa

### En iOS (iPhone/iPad)

1. Abre Safari
2. Ve a la URL de la aplicación
3. Toca el botón de compartir (□↑)
4. Desplázate y toca "Agregar a pantalla de inicio"
5. Confirma el nombre y toca "Añadir"

**Resultado:**
- Ícono de BibliaQuest en tu pantalla de inicio

---

## 🔍 Verificación de Características PWA

### 1. Service Worker Activo

**Chrome DevTools:**
```
F12 → Application → Service Workers
```

**Debe mostrar:**
- ✅ Estado: "activated and is running"
- ✅ Source: sw.js o similar
- ✅ Scope: /

### 2. Manifest Válido

**Chrome DevTools:**
```
F12 → Application → Manifest
```

**Debe mostrar:**
- ✅ Nombre completo y corto
- ✅ Dos iconos (192x192 y 512x512)
- ✅ Theme color: #4F46E5
- ✅ Display mode: standalone
- ✅ Start URL: /

### 3. Instalabilidad

**Chrome DevTools:**
```
F12 → Application → Manifest → "Add to homescreen"
```

Si ves errores, el PWA no es instalable. Revisa:
- ¿Los iconos existen?
- ¿El manifest está bien formado?
- ¿El service worker está registrado?
- ¿Estás usando HTTPS o localhost?

### 4. Caché Funcionando

**Prueba offline:**
1. Con la app abierta, desconecta internet
2. Actualiza la página (F5)
3. La página debería cargar desde el caché

**Verificar en DevTools:**
```
F12 → Application → Cache Storage
```

Deberías ver:
- workbox-precache (assets estáticos)
- api-cache (llamadas API recientes)
- google-fonts-cache (fuentes)

### 5. Actualización Automática

1. Haz un cambio en el código
2. Construye de nuevo: `npm run build`
3. Sirve la nueva versión: `npm run preview`
4. Abre la app (si ya estaba abierta, espera unos segundos)
5. Debería aparecer un diálogo: "Hay una nueva versión disponible"

---

## 📊 Auditoría Lighthouse

Google Lighthouse puede auditar tu PWA:

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Lighthouse**
3. Selecciona:
   - ☑️ Progressive Web App
   - ☑️ Performance
   - ☑️ Best Practices
4. Haz clic en "Analyze page load"

**Puntuación esperada para PWA:**
- 🟢 90-100: Excelente
- 🟡 50-89: Necesita mejoras
- 🔴 0-49: Fallos críticos

**Checklist PWA de Lighthouse:**
- ✅ Instala un Service Worker
- ✅ Es accesible offline
- ✅ Tiene un manifest válido
- ✅ Usa HTTPS (en producción)
- ✅ Tiene iconos apropiados
- ✅ Configura viewport correctamente
- ✅ Tiene un theme-color

---

## 🛠️ Solución de Problemas

### Problema: No aparece el botón de instalación

**Solución:**
1. Verifica que estés en localhost o HTTPS
2. Revisa que los iconos existan en `/public`
3. Verifica el manifest en DevTools
4. Asegúrate de que el service worker esté activo

### Problema: Service Worker no se registra

**Solución:**
1. Limpia el caché del navegador
2. En DevTools → Application → Service Workers → "Unregister"
3. Recarga la página con Ctrl+Shift+R
4. Verifica la consola en busca de errores

### Problema: Los cambios no se reflejan

**Solución:**
1. El service worker cachea la app
2. Desregistra el service worker en DevTools
3. Limpia el caché: Application → Clear storage → Clear site data
4. Recarga con Ctrl+Shift+R

### Problema: No funciona offline

**Solución:**
1. Verifica que el service worker esté activo
2. Navega primero online (para cachear)
3. Revisa Cache Storage en DevTools
4. Verifica los patrones en `vite.config.ts`

---

## 🎯 Características Implementadas

### ✅ Instalación
- Prompt de instalación automático
- Instalable desde el navegador
- Acceso directo en escritorio/inicio

### ✅ Offline
- Funciona sin conexión (después de primera carga)
- Caché de assets estáticos (JS, CSS, imágenes)
- Caché de llamadas API (5 minutos)
- Caché de fuentes (1 año)

### ✅ Actualizaciones
- Detección automática de nuevas versiones
- Prompt al usuario para actualizar
- Actualización instantánea

### ✅ Experiencia Nativa
- Se abre como app independiente
- Sin barra del navegador
- Ícono personalizado
- Splash screen (en Android)
- Orientación portrait forzada

### ✅ Performance
- Caché inteligente (CacheFirst para assets, NetworkFirst para API)
- Precarga de assets críticos
- Service Worker optimizado con Workbox

---

## 📱 URLs de Prueba

**Desarrollo:**
```
http://localhost:5174
```

**Preview (después de build):**
```
http://localhost:4173
```

**Producción (cuando despliegues):**
```
https://tu-dominio.com
```

---

## 🚀 Despliegue en Producción

Cuando despliegues a producción (Vercel, Netlify, etc.):

1. **Asegúrate de usar HTTPS** (obligatorio para PWA)
2. El build de producción ya incluye todo el PWA
3. Los usuarios verán el prompt de instalación automáticamente
4. El service worker se registrará automáticamente

**Comando de build:**
```bash
npm run build
```

**La carpeta `dist` contendrá:**
- Todos los archivos optimizados
- Service Worker generado (`sw.js`)
- Manifest generado (`manifest.webmanifest`)
- Assets pre-cacheados

---

## 📝 Notas Importantes

1. **HTTPS es obligatorio** en producción (localhost funciona sin HTTPS)
2. **Primera visita**: Requiere conexión para cachear
3. **Actualizaciones**: Se detectan automáticamente en segundo plano
4. **Caché API**: 5 minutos (ajustable en `vite.config.ts`)
5. **Tamaño del caché**: Limitado a 50 entradas por defecto

---

## ✅ Checklist de Verificación Final

Antes de considerar el PWA completo, verifica:

- [ ] Los iconos aparecen correctamente
- [ ] El manifest es válido (DevTools → Application → Manifest)
- [ ] El service worker está activo
- [ ] La app es instalable (aparece el botón)
- [ ] Funciona offline después de la primera carga
- [ ] Las actualizaciones se detectan automáticamente
- [ ] Lighthouse PWA score > 90
- [ ] Se abre como app standalone (sin barra del navegador)
- [ ] El theme color (#4F46E5) se aplica correctamente
- [ ] Los metadatos (nombre, descripción) son correctos

---

## 🎉 ¡Tu PWA está listo!

BibliaQuest ahora es una **Progressive Web App completa** que:

✅ Se puede instalar como app nativa
✅ Funciona offline
✅ Se actualiza automáticamente
✅ Tiene iconos personalizados
✅ Ofrece experiencia de app nativa
✅ Está optimizada para móviles

**Próximos pasos sugeridos:**
- Probar en diferentes dispositivos (Android, iOS, Desktop)
- Hacer auditoría con Lighthouse
- Desplegar a producción
- Monitorear el uso del service worker
