import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Registrar Service Worker con auto-actualización
const updateSW = registerSW({
  onNeedRefresh() {
    // Mostrar notificación al usuario que hay una nueva versión
    if (confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('La aplicación está lista para funcionar sin conexión')
  },
  immediate: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
