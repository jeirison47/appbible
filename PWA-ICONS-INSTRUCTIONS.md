# Instrucciones para Iconos PWA - BibliaQuest

## Iconos Necesarios

La aplicación PWA requiere los siguientes iconos en la carpeta `frontend/public/`:

1. **pwa-192x192.png** - Icono de 192x192 píxeles
2. **pwa-512x512.png** - Icono de 512x512 píxeles

## Diseño del Icono

El icono debe representar BibliaQuest con los siguientes elementos:

- **Color principal**: Índigo/Morado (#4F46E5)
- **Elemento visual**: Libro/Biblia abierta con un símbolo de quest/aventura
- **Estilo**: Moderno, limpio, minimalista
- **Fondo**: Puede ser transparente o con gradiente índigo-morado

## Opciones para Generar los Iconos

### Opción 1: Usar un Servicio Online

1. **Realfavicongenerator** (https://realfavicongenerator.net/)
   - Sube un icono base de al menos 512x512px
   - Genera todos los tamaños automáticamente
   - Descarga los archivos y colócalos en `frontend/public/`

2. **PWA Asset Generator** (https://www.pwabuilder.com/imageGenerator)
   - Sube una imagen de alta calidad
   - Descarga el paquete de iconos
   - Extrae solo pwa-192x192.png y pwa-512x512.png

### Opción 2: Crear con Software de Diseño

#### Usando Figma/Canva:

1. Crea un diseño cuadrado de 512x512px
2. Diseña un icono con:
   - Fondo gradiente índigo (#4F46E5) a morado (#7C3AED)
   - Emoji o icono de libro: 📖
   - Texto opcional: "BQ" o icono de quest
3. Exporta como PNG en dos tamaños:
   - 192x192px → `pwa-192x192.png`
   - 512x512px → `pwa-512x512.png`

### Opción 3: Placeholder Temporal (SVG a PNG)

Crear un icono SVG simple y convertirlo a PNG:

```svg
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#grad)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" fill="white" text-anchor="middle">📖</text>
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">BibliaQuest</text>
</svg>
```

**Conversión de SVG a PNG:**
- Usa herramientas online como: https://cloudconvert.com/svg-to-png
- O usa GIMP/Inkscape para exportar en los tamaños necesarios

## Ubicación Final

Coloca los archivos en:
```
frontend/
  public/
    pwa-192x192.png
    pwa-512x512.png
```

## Verificación

Una vez creados los iconos:

1. Construye la aplicación: `npm run build` (en frontend)
2. Sirve la build: `npm run preview`
3. Abre DevTools → Application → Manifest
4. Verifica que los iconos se muestren correctamente

## Configuración PWA Actual

El archivo `vite.config.ts` ya está configurado con:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'BibliaQuest',
    short_name: 'BibliaQuest',
    description: 'Lee la Biblia diariamente con gamificación',
    theme_color: '#4F46E5',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
})
```

## Instalación de la PWA

Una vez que los iconos estén en su lugar:

1. **En Chrome/Edge (Escritorio)**:
   - Ícono de instalación aparecerá en la barra de direcciones
   - O usa el menú → "Instalar BibliaQuest"

2. **En Chrome (Android)**:
   - Menú → "Agregar a pantalla de inicio"
   - O banner de instalación aparecerá automáticamente

3. **En Safari (iOS)**:
   - Botón Compartir → "Agregar a pantalla de inicio"

## Notas

- Los iconos deben ser cuadrados
- PNG con fondo sólido o transparente
- Resolución mínima: 192x192px
- Resolución recomendada para calidad: 512x512px
