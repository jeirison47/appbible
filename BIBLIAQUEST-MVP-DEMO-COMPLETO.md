# 📱 BibliaQuest - Documento Completo del MVP/Demo

## 📋 Índice

1. [Definición del MVP](#definición-del-mvp)
2. [Alcance y Limitaciones](#alcance-y-limitaciones)
3. [Especificaciones Funcionales](#especificaciones-funcionales)
4. [Diseño de Pantallas](#diseño-de-pantallas)
5. [Casos de Uso Detallados](#casos-de-uso-detallados)
6. [Criterios de Aceptación](#criterios-de-aceptación)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [Reglas de Negocio](#reglas-de-negocio)
9. [Testing Checklist](#testing-checklist)
10. [Roadmap de Implementación](#roadmap-de-implementación)

---

## 1. DEFINICIÓN DEL MVP

### 🎯 Objetivo Principal

Crear una **aplicación móvil funcional** que permita a los usuarios **leer la Biblia** de dos formas:
1. **Camino estructurado** (lectura secuencial con gamificación)
2. **Lectura libre** (acceso completo sin restricciones)

Con un **sistema de gamificación básico** que:
- Motive el hábito diario de lectura
- Recompense el progreso con XP y niveles
- Mantenga rachas de días consecutivos
- Ofrezca metas personalizables

### 📊 Alcance del MVP

**Versión:** 1.0 MVP  
**Plataformas:** iOS y Android  
**Duración desarrollo:** 6-8 semanas tiempo completo  
**Usuarios objetivo:** 100-500 usuarios iniciales  
**Costo operación:** $0/mes (Firebase plan gratuito)

### 🎮 Características Core

#### ✅ Incluidas en MVP
1. Sistema de autenticación (Email + Google)
2. Onboarding personalizado
3. Sistema de XP y niveles
4. Sistema de rachas diarias
5. Metas duales (sistema + personal)
6. Lectura estructurada (Camino) - 2 libros
7. Lectura libre - 66 libros completos
8. Dashboard (Home)
9. Perfil y estadísticas
10. Notificaciones push
11. Configuración básica

#### ❌ Excluidas del MVP
1. Lecciones interactivas
2. Trivia diaria
3. Sistema de notas
4. Funciones sociales
5. Insignias/logros específicos
6. Gemas/monedas
7. Tienda
8. Premium/Suscripción
9. Modo offline completo
10. Marcadores en versículos
11. Audio TTS
12. Mapas bíblicos
13. Planes de lectura

---

## 2. ALCANCE Y LIMITACIONES

### 📖 Contenido Bíblico

#### Libros Disponibles en Camino (Lectura Estructurada)
```
✅ Génesis (50 capítulos) - Antiguo Testamento
✅ Juan (21 capítulos) - Nuevo Testamento
🔒 Resto de libros: "Próximamente disponible"
```

**Razón:** Permite validar el concepto con ambos testamentos sin crear todo el contenido.

#### Libros Disponibles en Lectura Libre
```
✅ Todos los 66 libros de la Biblia
   - Antiguo Testamento: 39 libros
   - Nuevo Testamento: 27 libros
```

#### Versiones de la Biblia
```
✅ Reina Valera 1960 (RV1960) - Principal
✅ Nueva Versión Internacional (NVI)
✅ Traducción Lenguaje Actual (TLA)
```

### 🚫 Limitaciones Técnicas

#### Funcionalidad Offline
- ❌ No hay modo offline completo en MVP
- ✅ Solo cache básico de React Native/Firebase
- 🔮 Fase 2: Descarga de libros para uso offline

#### Notificaciones
- ✅ Push notifications básicas (recordatorios, metas)
- ❌ No hay notificaciones in-app complejas
- ❌ No hay centro de notificaciones

#### Analytics
- ✅ Firebase Analytics básico
- ❌ No hay analytics avanzados ni dashboards
- 🔮 Fase 2: Analytics detallados

---

## 3. ESPECIFICACIONES FUNCIONALES

### 🔐 Módulo 1: Autenticación

#### 3.1.1 Registro de Usuario

**Descripción:**  
Usuario puede crear una cuenta nueva con email/contraseña o Google.

**Campos:**
- Email (requerido, validación de formato)
- Contraseña (requerido, mínimo 6 caracteres)
- Nombre (requerido, mínimo 2 caracteres)

**Validaciones:**
```javascript
email: {
  - Formato válido: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  - No vacío
  - Único en el sistema
}

password: {
  - Mínimo 6 caracteres
  - No vacío
}

displayName: {
  - Mínimo 2 caracteres
  - Máximo 50 caracteres
  - No vacío
}
```

**Flujo:**
1. Usuario ingresa datos en formulario
2. App valida datos en frontend
3. Si válido → Firebase Auth createUserWithEmailAndPassword
4. Si exitoso → Crear documento en Firestore `users/{uid}`
5. Redirigir a Onboarding

**Errores a manejar:**
- `auth/email-already-in-use`: "Este email ya está registrado"
- `auth/invalid-email`: "Email inválido"
- `auth/weak-password`: "Contraseña debe tener al menos 6 caracteres"
- `auth/network-request-failed`: "Error de conexión"

**Datos iniciales del usuario:**
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: null,
  createdAt: timestamp,
  totalXP: 0,
  currentLevel: 1,
  xpForNextLevel: 100,
  systemDailyGoal: 50,
  personalDailyGoal: null,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  settings: {
    notificationsEnabled: true,
    notificationTime: "20:00",
    bibleVersion: "RV1960",
    fontSize: "medium",
    theme: "auto"
  },
  stats: {
    totalTimeReading: 0,
    chaptersReadInPath: 0,
    chaptersReadFree: 0,
    booksStarted: 0,
    booksCompleted: 0,
    systemGoalCompletedDays: 0,
    personalGoalCompletedDays: 0
  }
}
```

#### 3.1.2 Login

**Descripción:**  
Usuario puede iniciar sesión con credenciales existentes.

**Métodos:**
1. Email/Contraseña
2. Google Sign-In

**Flujo Email/Password:**
1. Usuario ingresa email y contraseña
2. Validar que no estén vacíos
3. Firebase Auth signInWithEmailAndPassword
4. Si exitoso → Cargar datos del usuario desde Firestore
5. Redirigir a Home

**Flujo Google:**
1. Usuario toca botón "Continuar con Google"
2. Se abre popup/pantalla de Google
3. Usuario selecciona cuenta
4. Firebase Auth signInWithPopup/signInWithRedirect
5. Si es primera vez → Crear documento en Firestore
6. Redirigir a Onboarding (primera vez) o Home

**Errores a manejar:**
- `auth/user-not-found`: "Usuario no encontrado"
- `auth/wrong-password`: "Contraseña incorrecta"
- `auth/too-many-requests`: "Demasiados intentos, intenta más tarde"
- `auth/user-disabled`: "Esta cuenta ha sido deshabilitada"

#### 3.1.3 Recuperar Contraseña

**Descripción:**  
Usuario puede restablecer su contraseña si la olvidó.

**Flujo:**
1. Usuario toca "¿Olvidaste tu contraseña?"
2. Ingresa email
3. Validar formato de email
4. Firebase Auth sendPasswordResetEmail
5. Mostrar mensaje: "Revisa tu email para restablecer contraseña"
6. Usuario recibe email de Firebase
7. Usuario hace clic en link del email
8. Firebase redirige a página de cambio de contraseña
9. Usuario ingresa nueva contraseña
10. Puede iniciar sesión con nueva contraseña

**Errores a manejar:**
- `auth/user-not-found`: "No existe cuenta con este email"
- `auth/invalid-email`: "Email inválido"

#### 3.1.4 Onboarding

**Descripción:**  
Proceso de configuración inicial para nuevos usuarios.

**Pantallas:**

**Pantalla 1: Bienvenida**
- Título: "Bienvenido a BibliaQuest"
- Subtítulo: "Lee la Biblia diariamente y forma un hábito"
- Ilustración
- Botón: "COMENZAR"

**Pantalla 2: Nombre**
- Pregunta: "¿Cuál es tu nombre?"
- Input: Nombre (prellenado si viene de Google)
- Botón: "CONTINUAR"

**Pantalla 3: Notificaciones**
- Pregunta: "¿A qué hora quieres estudiar?"
- Time picker: Default 20:00 (8:00 PM)
- Checkbox: ☑ "Recibir recordatorios diarios"
- Texto: "Te enviaremos un recordatorio para mantener tu racha"
- Botón: "CONTINUAR"

**Pantalla 4: Meta Personal (Opcional)**
- Título: "Meta Personal"
- Texto: "Ya tienes una meta diaria de 50 XP (oficial)"
- Pregunta: "¿Quieres establecer una meta personal adicional?"
- Input numérico: ___ XP (placeholder: "100")
- Texto pequeño: "Puedes cambiarlo después en configuración"
- Link: "Omitir por ahora"
- Botón: "COMENZAR MI VIAJE"

**Datos guardados después del onboarding:**
```javascript
{
  displayName: "Nombre actualizado",
  settings: {
    notificationsEnabled: true/false,
    notificationTime: "HH:mm"
  },
  personalDailyGoal: number | null
}
```

**Flujo post-onboarding:**
1. Guardar preferencias en Firestore
2. Si notificaciones habilitadas → Solicitar permisos del sistema
3. Si permisos concedidos → Registrar token FCM
4. Mostrar tutorial breve (opcional)
5. Redirigir a Home

---

### 📊 Módulo 2: Sistema de Progreso (XP, Niveles, Rachas)

#### 3.2.1 Sistema de XP

**Descripción:**  
Sistema de puntos de experiencia que recompensa actividades del usuario.

**Tabla de XP:**

| Actividad | XP Base | Bonus | Total Posible |
|-----------|---------|-------|---------------|
| Marcar capítulo como leído (Camino) | 20 XP | - | 20 XP |
| Leer 10 minutos continuos (Libre) | 10 XP | - | 10 XP (max 30/día) |
| Login diario (primera vez del día) | 5 XP | - | 5 XP |
| Completar meta del sistema | - | +25 XP | 25 XP |
| Completar meta personal | - | +50 XP | 50 XP |
| Mantener racha (bonus diario) | 10 XP | - | 10 XP |
| Subir de nivel | - | +50 XP | 50 XP |
| Racha 7 días | - | +50 XP | 50 XP |
| Racha 30 días | - | +200 XP | 200 XP |
| Racha 100 días | - | +500 XP | 500 XP |

**Reglas:**
1. XP se acumula para siempre (no expira)
2. XP determina el nivel del usuario
3. Solo actividades del día actual cuentan para meta diaria
4. Releer un capítulo NO da XP adicional
5. Máximo 3 bonos de lectura libre por día (30 XP)

**Cálculo de ejemplo:**
```
Día típico de usuario:
- Login: +5 XP
- Lee Cap 1 (Camino): +20 XP
- Lee Cap 2 (Camino): +20 XP
- Lee 10 min (Libre): +10 XP
Total: 55 XP

Meta del sistema (50 XP): ✅ +25 XP bonus
Meta personal (100 XP): ❌ No completada
Racha activa: +10 XP

XP final del día: 90 XP
```

#### 3.2.2 Sistema de Niveles

**Descripción:**  
Niveles que reflejan el progreso acumulado del usuario.

**Tabla de Niveles (MVP - Primeros 20):**

| Nivel | XP Requerido | Título | Bonus Subida |
|-------|--------------|--------|--------------|
| 1 | 0 | Novato | - |
| 2 | 100 | Aprendiz | 50 XP |
| 3 | 250 | Lector | 50 XP |
| 4 | 450 | Estudiante | 50 XP |
| 5 | 700 | Conocedor | 50 XP |
| 6 | 1,000 | Devoto | 50 XP |
| 7 | 1,350 | Discípulo | 50 XP |
| 8 | 1,750 | Sabio | 50 XP |
| 9 | 2,200 | Maestro | 50 XP |
| 10 | 2,700 | Erudito | 50 XP |
| 11 | 3,250 | Predicador | 50 XP |
| 12 | 3,850 | Teólogo | 50 XP |
| 13 | 4,500 | Doctor | 50 XP |
| 14 | 5,200 | Profeta | 50 XP |
| 15 | 5,950 | Apóstol | 50 XP |
| 16 | 6,750 | Patriarca | 50 XP |
| 17 | 7,600 | Visionario | 50 XP |
| 18 | 8,500 | Iluminado | 50 XP |
| 19 | 9,450 | Leyenda | 50 XP |
| 20 | 10,450 | Campeón | 50 XP |

**Fórmula de cálculo (para programar):**
```javascript
function getXPForLevel(level) {
  if (level === 1) return 0;
  return 100 * level + 50 * (level - 1) - 50;
}

// Ejemplos:
getXPForLevel(1) = 0
getXPForLevel(2) = 100
getXPForLevel(3) = 250
getXPForLevel(5) = 700
```

**Mecánica de subida:**
1. Usuario gana XP
2. Sistema verifica si `totalXP >= xpForNextLevel`
3. Si sí → Actualizar `currentLevel++`
4. Dar bonus de 50 XP
5. Actualizar `xpForNextLevel` al siguiente nivel
6. Mostrar animación de celebración
7. Enviar notificación push

**UI de nivel:**
```
Nivel 5 - "Conocedor"
──────────────────────
450/700 XP (64%)
```

#### 3.2.3 Sistema de Rachas

**Descripción:**  
Contador de días consecutivos completando la meta del sistema.

**Definición de "Día Completado":**
```
Meta del sistema completada = 50+ XP en el día
```

**Reglas:**
1. La racha se cuenta en días calendario (00:00 a 23:59)
2. Tienes hasta las 23:59:59 del día para completar tu meta
3. Si no completas meta en un día → Racha vuelve a 0
4. La racha se verifica automáticamente a las 00:01 (Cloud Function)
5. Hitos de racha dan bonus de XP automáticamente

**Estados de racha:**
```javascript
{
  currentStreak: 15,      // Días consecutivos actuales
  longestStreak: 24,      // Mejor racha histórica
  lastActivityDate: "2025-10-22",  // Último día activo
  streakSafeUntil: "2025-10-23T23:59:59Z"  // Hasta cuándo es válido
}
```

**Hitos de racha:**
- 7 días: "¡Una semana completa!" → +50 XP
- 30 días: "¡Un mes de fidelidad!" → +200 XP
- 100 días: "¡Centurión de la fe!" → +500 XP
- 365 días: "¡Un año de bendición!" → +1,000 XP

**Notificaciones relacionadas:**
1. Recordatorio diario (hora configurada)
2. Racha en riesgo (si a las 20:00 no ha completado meta)
3. Racha perdida (al día siguiente si no completó)
4. Nuevo hito de racha alcanzado

**UI de racha:**
```
🔥 Racha: 15 días
Mejor: 24 días

[Progreso visual: llama más grande cada 7 días]
```

#### 3.2.4 Sistema de Metas Duales

**Descripción:**  
Dos tipos de metas diarias independientes:
1. Meta del sistema (oficial) - 50 XP fijos
2. Meta personal (opcional) - Definida por usuario

**Meta del Sistema:**
```javascript
{
  value: 50,           // Siempre 50 XP
  editable: false,     // Usuario NO puede cambiar
  completionBonus: 25, // XP bonus al completar
  affectsStreak: true  // Afecta la racha
}
```

**Meta Personal:**
```javascript
{
  value: null | number,  // null = no establecida
  editable: true,        // Usuario SÍ puede cambiar
  completionBonus: 50,   // XP bonus al completar
  affectsStreak: false   // NO afecta la racha
}
```

**Reglas de negocio:**
1. Meta del sistema es OBLIGATORIA para mantener racha
2. Meta personal es OPCIONAL y no afecta racha
3. Ambas metas se pueden completar el mismo día
4. Cada meta da su propio bonus
5. Los bonus no cuentan para la siguiente meta

**Ejemplo de día completo:**
```
Usuario con meta personal de 100 XP:

08:00 - Lee cap 1: +20 XP (total: 20)
08:15 - Lee cap 2: +20 XP (total: 40)
08:30 - Lee cap 3: +20 XP (total: 60)
        → ✅ Meta del sistema completada (50/50)
        → +25 XP bonus (total: 85)
09:00 - Lee 10 min libre: +10 XP (total: 95)
09:30 - Lee cap 4: +20 XP (total: 115)
        → ✅ Meta personal completada (100/100)
        → +50 XP bonus (total: 165)

Resultado:
- XP del día: 165 XP
- Meta sistema: ✅ Completada
- Meta personal: ✅ Completada
- Racha: Continúa
```

**UI de metas:**
```
┌────────────────────────────────┐
│  🎯 META DEL DÍA               │
├────────────────────────────────┤
│                                │
│  Meta BibliaQuest (Oficial):   │
│  ████████████████ 50/50 XP ✅  │
│  ¡Meta completada! +25 XP      │
│                                │
│  ─────────────────────────     │
│                                │
│  Tu Meta Personal:             │
│  ██████░░░░░░░░░ 60/100 XP     │
│  ¡Te faltan 40 XP! 💪          │
│                                │
│  ─────────────────────────     │
│                                │
│  🔥 Racha: 15 días             │
│  Nivel: 5 - Conocedor          │
│                                │
└────────────────────────────────┘
```

**Editar meta personal:**
1. Usuario va a Perfil → Configuración → Meta personal
2. Puede ingresar número entre 50-500 XP
3. Puede eliminar meta personal (dejar en null)
4. Cambios toman efecto al día siguiente

---

### 📖 Módulo 3: Lectura - Camino de Capítulos

#### 3.3.1 Vista de Lista de Libros

**Descripción:**  
Pantalla que muestra todos los libros de la Biblia organizados por testamento.

**Estructura:**
```
Antiguo Testamento (39 libros)
├─ Pentateuco (5)
│  ├─ ✅ Génesis [12% - 6/50]
│  └─ 🔒 Éxodo [Próximamente]
├─ Históricos (12)
│  └─ 🔒 Todos bloqueados
├─ Poéticos (5)
│  └─ 🔒 Todos bloqueados
├─ Profetas Mayores (5)
│  └─ 🔒 Todos bloqueados
└─ Profetas Menores (12)
   └─ 🔒 Todos bloqueados

Nuevo Testamento (27 libros)
├─ Evangelios (4)
│  ├─ 🔒 Mateo [Próximamente]
│  ├─ 🔒 Marcos [Próximamente]
│  ├─ 🔒 Lucas [Próximamente]
│  └─ ✅ Juan [0% - 0/21]
└─ Resto...
   └─ 🔒 Todos bloqueados
```

**Estados de libro:**
1. ✅ **Disponible** - Se puede acceder
2. 🔵 **En progreso** - Al menos 1 capítulo leído
3. 🏆 **Completado** - Todos los capítulos leídos
4. 🔒 **Bloqueado** - No disponible en MVP

**Información mostrada por libro:**
- Nombre del libro
- Número de capítulos totales
- Progreso: % y fracción (ej: 12% - 6/50)
- Barra de progreso visual
- Estado (icono)
- Botón de acción ("Ver capítulos" / "Comenzar" / "Próximamente")

**Interacciones:**
- Tap en libro disponible → Va a Camino de Capítulos
- Tap en libro bloqueado → Toast: "Próximamente disponible"
- Búsqueda de libros (opcional)

#### 3.3.2 Vista de Camino de Capítulos

**Descripción:**  
Vista vertical con camino visual de todos los capítulos del libro.

**Layout:**
```
        🎯 INICIO
         │
         ●  Cap 1: La Creación
         │  ✅ Leído (+20 XP)
         │  21 Oct • 8:30 PM
         │
         ●  Cap 2: El Edén
         │  ✅ Leído (+20 XP)
         │  21 Oct • 8:45 PM
         │
         ●  Cap 3: La Caída
         │  ✅ Leído (+20 XP)
         │  22 Oct • 8:15 PM
         │
         ●  Cap 4: Caín y Abel
         │  🔵 SIGUIENTE
         │  [LEER AHORA] →
         │
         ●  Cap 5: Genealogía
         │  🔒 Completa Cap 4
         │
         ...
         │
         ●  Cap 50: Muerte de José
         │  🔒 Bloqueado
         │
        🏁 FIN
```

**Estados de capítulo:**
1. ✅ **Completado** - Ya leído, muestra fecha y hora
2. 🔵 **Siguiente** - Disponible para leer ahora
3. 🔒 **Bloqueado** - Aún no disponible

**Información por capítulo:**
- Número de capítulo
- Título descriptivo (ej: "La Creación", "El Edén")
- Estado con icono
- Si completado: Fecha/hora + XP ganados
- Si siguiente: Botón "LEER AHORA"
- Si bloqueado: Texto "Completa Cap X"

**Reglas de desbloqueo:**
```javascript
function isChapterUnlocked(bookId, chapter) {
  if (chapter === 1) return true; // Cap 1 siempre disponible
  
  const previousChapter = chapter - 1;
  const isCompleted = await isChapterCompleted(bookId, previousChapter);
  
  return isCompleted;
}
```

**Header de la vista:**
- Nombre del libro
- Barra de progreso general
- Estadísticas:
  - Capítulos completados / Total
  - % completado
  - Tiempo total leyendo
  - XP ganado en el libro

**Interacciones:**
- Tap en capítulo completado → Ver capítulo (solo lectura)
- Tap en siguiente capítulo → Lector de capítulo
- Tap en capítulo bloqueado → Toast: "Completa el capítulo anterior primero"
- Pull to refresh → Actualizar progreso

#### 3.3.3 Lector de Capítulo

**Descripción:**  
Vista para leer el contenido completo de un capítulo.

**Elementos de UI:**

**Header:**
```
[← Atrás]    Génesis 1    [📝] [⚙️]
         La Creación
     31 versículos • ~12 min
```

**Toolbar (debajo del header):**
```
[▶️ Escuchar] [Aa Tamaño] [RV1960 ▼]
```

**Contenido:**
```
1 En el principio creó Dios los cielos y 
  la tierra.

2 Y la tierra estaba desordenada y vacía, 
  y las tinieblas estaban sobre la faz del 
  abismo, y el Espíritu de Dios se movía 
  sobre la faz de las aguas.

3 Y dijo Dios: Sea la luz; y fue la luz.

[... continúa hasta el versículo 31]
```

**Footer:**
```
┌────────────────────────────────┐
│ ✅ MARCAR COMO LEÍDO           │
│    +20 XP                      │
└────────────────────────────────┘

[← Cap 1]  [Lista]  [Cap 3 →]
```

**Funcionalidades:**

1. **Números de versículos:**
   - Visibles a la izquierda
   - Color secundario
   - No seleccionables

2. **Texto de versículos:**
   - Seleccionable
   - Copiable al portapapeles
   - Compartible (long press → menú)

3. **Cambiar tamaño de fuente:**
   - Pequeño (14px)
   - Mediano (16px) - Default
   - Grande (18px)

4. **Cambiar versión:**
   - RV1960 (default)
   - NVI
   - TLA

5. **Escuchar audio (opcional - Fase 2):**
   - Text-to-speech del capítulo
   - Play/Pause
   - Velocidad ajustable

6. **Navegación:**
   - Botón "Atrás" → Volver al camino
   - "← Cap anterior" → Si existe
   - "Cap siguiente →" → Si está desbloqueado
   - "Lista" → Volver al camino

7. **Marcar como leído:**
   - Solo si es el siguiente capítulo
   - Si ya está leído → Botón deshabilitado
   - Al marcar → Animación + Pantalla de confirmación

**Pantalla de Confirmación:**
```
┌──────────────────────────────────┐
│                                  │
│     ✅ ¡CAPÍTULO LEÍDO!          │
│                                  │
│    Génesis 1 - La Creación       │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                  │
│  🎉 +20 XP                       │
│                                  │
│  📊 Progreso del día:            │
│  ████████████░░░░ 40/50 XP       │
│  ¡Solo 10 XP para tu meta! 💪    │
│                                  │
│  📖 Progreso en Génesis:         │
│  ▓░░░░░░░░░░░░░░ 2% (1/50)      │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                  │
│  [CONTINUAR CON CAP 2] →         │
│  [VOLVER AL CAMINO]              │
│  [IR AL HOME]                    │
│                                  │
└──────────────────────────────────┘
```

**Lógica al marcar como leído:**
```javascript
async function markChapterAsRead(userId, bookId, chapter) {
  const batch = writeBatch(db);
  
  // 1. Crear registro de lectura
  batch.set(doc(db, `chapterReads/${userId}_${bookId}_${chapter}`), {
    userId,
    bookId,
    chapter,
    readType: "path",
    xpEarned: 20,
    readAt: serverTimestamp()
  });
  
  // 2. Actualizar progreso del libro
  batch.update(doc(db, `readingProgress/${userId}_${bookId}`), {
    chaptersCompleted: increment(1),
    completedChapters: arrayUnion(chapter),
    lastChapterRead: chapter,
    totalXPEarned: increment(20)
  });
  
  // 3. Actualizar progreso diario
  batch.update(doc(db, `dailyProgress/${userId}_${today}`), {
    xpEarned: increment(20),
    chaptersRead: increment(1)
  });
  
  // 4. Actualizar usuario
  batch.update(doc(db, `users/${userId}`), {
    totalXP: increment(20)
  });
  
  await batch.commit();
  
  // 5. Verificar metas y niveles
  await checkGoalCompletion(userId);
  await checkLevelUp(userId);
}
```

---

### 📚 Módulo 4: Lectura Libre

#### 3.4.1 Vista Principal

**Descripción:**  
Lector de la Biblia completa sin restricciones ni gamificación obligatoria.

**Diferencias con Camino:**
- ✅ Acceso a todos los 66 libros
- ✅ Sin desbloqueo progresivo
- ✅ Sin "marcar como leído"
- ✅ Timer de lectura opcional
- ✅ XP por tiempo (10 min = 10 XP)

**Layout:**
```
┌──────────────────────────────────┐
│ [← Atrás]  Juan 3  [📚 Libro▼]  │
├──────────────────────────────────┤
│ [🔍 Buscar] [▶️] [Aa] [🌙] [⚙️] │
├──────────────────────────────────┤
│                                  │
│  1 Había un hombre de los        │
│    fariseos que se llamaba       │
│    Nicodemo, un principal        │
│    entre los judíos.             │
│                                  │
│  2 Este vino a Jesús de noche... │
│                                  │
│  ... [contenido del capítulo]    │
│                                  │
├──────────────────────────────────┤
│  ⏱️ 08:45 | +10 XP en 1:15      │
├──────────────────────────────────┤
│ [← Cap 2] [Lista] [Cap 4 →]     │
└──────────────────────────────────┘
```

**Timer de lectura:**
- Cuenta tiempo automáticamente
- Se pausa si sales de la app
- Cada 10 minutos → +10 XP
- Máximo 3 bonos por día (30 XP)
- Widget flotante muestra tiempo y próximo bonus

**Ejemplo de sesión:**
```
00:00 - Inicia lectura Juan 3
10:00 - ¡10 minutos! +10 XP
20:00 - ¡20 minutos! +10 XP
30:00 - ¡30 minutos! +10 XP
40:00 - Continúa leyendo (sin más XP hoy)
```

#### 3.4.2 Selector de Libro/Capítulo

**Descripción:**  
Menú para navegar a cualquier libro y capítulo.

**Estructura:**
```
┌──────────────────────────────────┐
│  ← 🧭 SELECCIONAR PASAJE         │
├──────────────────────────────────┤
│  [🔍 Buscar libro o versículo...]│
├──────────────────────────────────┤
│  ANTIGUO TESTAMENTO              │
│                                  │
│  📜 Pentateuco (5) [▼]           │
│  ├─ Génesis (50 caps)            │
│  ├─ Éxodo (40 caps)              │
│  ├─ Levítico (27 caps)           │
│  ├─ Números (36 caps)            │
│  └─ Deuteronomio (34 caps)       │
│                                  │
│  📖 Históricos (12) [▼]          │
│  ... [expandible]                │
│                                  │
│  🎵 Poéticos (5) [▼]             │
│  📣 Profetas Mayores (5) [▼]     │
│  📜 Profetas Menores (12) [▼]    │
│                                  │
│  NUEVO TESTAMENTO                │
│                                  │
│  ✝️ Evangelios (4) [▼]           │
│  ├─ Mateo (28 caps)              │
│  ├─ Marcos (16 caps)             │
│  ├─ Lucas (24 caps)              │
│  └─ Juan (21 caps) ✓             │
│                                  │
│  ... [resto de categorías]       │
│                                  │
└──────────────────────────────────┘
```

**Al seleccionar libro:**
```
┌──────────────────────────────────┐
│  ← JUAN (21 capítulos)           │
├──────────────────────────────────┤
│  Selecciona un capítulo:         │
│                                  │
│  ┌───┬───┬───┬───┬───┐          │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │          │
│  └───┴───┴───┴───┴───┘          │
│  ┌───┬───┬───┬───┬───┐          │
│  │ 6 │ 7 │ 8 │ 9 │10 │          │
│  └───┴───┴───┴───┴───┘          │
│  ... [hasta 21]                  │
│                                  │
│  ─────────────────────────       │
│                                  │
│  O ingresa directamente:         │
│  [Libro ▼] [Cap] [Vers] [IR]    │
│  Juan       3     16      →      │
│                                  │
└──────────────────────────────────┘
```

#### 3.4.3 Sistema de Búsqueda

**Tipos de búsqueda:**

1. **Por referencia exacta:**
   - "Juan 3:16" → Va directo al versículo
   - "Génesis 1" → Va al capítulo completo
   - "Salmos" → Muestra lista de capítulos

2. **Por palabra/frase:**
   - "amor" → Busca en toda la Biblia
   - "reino de Dios" → Frase exacta
   - Resultados limitados a 100

**Vista de búsqueda:**
```
┌──────────────────────────────────┐
│  ← 🔍 BUSCAR EN LA BIBLIA        │
├──────────────────────────────────┤
│  [Buscar palabra o versículo...] │
│                                  │
│  Ejemplos:                       │
│  • "Juan 3:16"                   │
│  • "amor"                        │
│  • "reino de Dios"               │
│                                  │
│  ━━━ BÚSQUEDAS RECIENTES ━━━━━  │
│  • "amor"                        │
│  • "Juan 3:16"                   │
│  • "fe"                          │
│                                  │
│  ━━━ VERSÍCULOS POPULARES ━━━━  │
│  • Juan 3:16                     │
│  • Salmos 23:1                   │
│  • Filipenses 4:13               │
│  • Jeremías 29:11                │
│                                  │
└──────────────────────────────────┘
```

**Resultados de búsqueda:**
```
┌──────────────────────────────────┐
│  ← Resultados: "amor"            │
├──────────────────────────────────┤
│  348 resultados                  │
│  Filtros: [Todos▼] [Relevancia▼]│
│                                  │
│  📖 Juan 3:16                    │
│  "Porque de tal manera amó Dios  │
│   al mundo..."                   │
│  [Leer capítulo] →               │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                  │
│  📖 1 Juan 4:8                   │
│  "...porque Dios es amor."       │
│  [Leer capítulo] →               │
│                                  │
│  ... [más resultados]            │
│                                  │
└──────────────────────────────────┘
```

---

### 🏠 Módulo 5: Home (Dashboard)

#### 3.5.1 Estructura del Dashboard

**Descripción:**  
Pantalla principal que muestra resumen de todo el progreso.

**Layout completo:**
```
┌──────────────────────────────────────┐
│  👤 [Avatar]    🔔 [2]    ⚙️         │
├──────────────────────────────────────┤
│  👋 ¡Buen día, Juan!                 │
│  Miércoles, 22 de Octubre            │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  🎯 META DEL DÍA               │ │
│  │                                │ │
│  │  Meta BibliaQuest:             │ │
│  │  ████████████████ 50/50 XP ✅  │ │
│  │  ¡Meta completada! +25 XP      │ │
│  │                                │ │
│  │  Tu Meta Personal:             │ │
│  │  ██████░░░░░░░░░ 60/100 XP     │ │
│  │  ¡Te faltan 40 XP! 💪          │ │
│  │                                │ │
│  │  🔥 Racha: 15 días             │ │
│  │  Nivel 5 - "Conocedor"         │ │
│  │  ▓▓▓▓▓░░░░░ 450/700 XP         │ │
│  └────────────────────────────────┘ │
│                                      │
│  ━━━ CONTINÚA DONDE LO DEJASTE ━━━  │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📖 LECTURA (Camino)            │ │
│  │ Génesis 12                     │ │
│  │ "El llamado de Abraham"        │ │
│  │ ▓▓▓▓▓▓░░░░ 24% (12/50)         │ │
│  │ [CONTINUAR] →                  │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📚 ÚLTIMA LECTURA LIBRE        │ │
│  │ Juan 3:16                      │ │
│  │ "Porque de tal manera amó      │ │
│  │  Dios al mundo..."             │ │
│  │ [CONTINUAR LEYENDO] →          │ │
│  └────────────────────────────────┘ │
│                                      │
│  ━━━━━━━ ACCESOS RÁPIDOS ━━━━━━━━  │
│                                      │
│  ┌──────────────┐  ┌──────────────┐│
│  │ 📖 LECTURA   │  │ 📚 BIBLIA    ││
│  │ Camino       │  │ Libre        ││
│  └──────────────┘  └──────────────┘│
│                                      │
│  ━━━━━━━━ RESUMEN SEMANAL ━━━━━━━  │
│                                      │
│  📊 Esta semana:                    │
│  • 5 días activo                    │
│  • 425 XP ganados                   │
│  • 18 capítulos leídos              │
│  • 2.5 horas de lectura             │
│                                      │
│  [Ver estadísticas completas] →     │
│                                      │
└──────────────────────────────────────┘
```

**Secciones del Home:**

1. **Header con Usuario**
   - Avatar
   - Notificaciones pendientes
   - Configuración

2. **Saludo Personalizado**
   - Hora del día: "¡Buen día!" / "¡Buenas tardes!" / "¡Buenas noches!"
   - Nombre del usuario
   - Fecha actual

3. **Widget de Meta Diaria**
   - Progreso de meta del sistema
   - Progreso de meta personal (si existe)
   - Racha actual
   - Nivel y progreso al siguiente

4. **Continuar Donde Lo Dejaste**
   - Última lectura del Camino
   - Última lectura Libre
   - Botones para continuar

5. **Accesos Rápidos**
   - Lectura (Camino)
   - Biblia (Libre)

6. **Resumen Semanal**
   - Días activos
   - XP ganados
   - Capítulos leídos
   - Tiempo de lectura

**Interacciones:**
- Pull to refresh → Actualizar todo
- Tap en meta → Ver detalles de progreso diario
- Tap en racha → Ver historial de racha
- Tap en nivel → Ver tabla de niveles
- Tap en continuar → Ir a lector respectivo
- Tap en accesos rápidos → Navegar a sección
- Tap en resumen → Ver estadísticas completas

#### 3.5.2 Estados del Dashboard

**Estado inicial (nuevo usuario):**
```
🎯 META DEL DÍA
Meta BibliaQuest: ░░░░░░░░░░░░ 0/50 XP
Tu Meta Personal: No establecida
[+ Establecer meta personal]
🔥 Racha: 0 días
Nivel 1 - "Novato"

━━━ EMPIEZA TU VIAJE ━━━
📖 Comienza con Génesis
   [LEER CAP 1] →
```

**Estado con progreso:**
```
🎯 META DEL DÍA
Meta BibliaQuest: ████████░░░░ 40/50 XP
Tu Meta Personal: ██████░░░░░░ 60/100 XP
🔥 Racha: 15 días
Nivel 5 - "Conocedor"

━━━ CONTINÚA DONDE LO DEJASTE ━━━
📖 Génesis 12 [24% completado]
   [CONTINUAR] →
```

**Estado meta completada:**
```
🎯 META DEL DÍA
Meta BibliaQuest: ████████████ 75/50 XP ✅
¡Meta completada! +25 XP
Tu Meta Personal: ████████████ 115/100 XP ✅
¡Meta personal alcanzada! +50 XP
🔥 Racha: 15 días
Nivel 5 - "Conocedor"

━━━ ¡EXCELENTE TRABAJO HOY! ━━━
Ganaste 165 XP hoy 🎉
[Ver progreso] →
```

---

### 👤 Módulo 6: Perfil y Configuración

#### 3.6.1 Pantalla de Perfil

**Layout:**
```
┌──────────────────────────────────────┐
│  ← 👤 PERFIL                    ⚙️   │
├──────────────────────────────────────┤
│                                      │
│       [🎭 Avatar]                    │
│       [Cambiar foto]                 │
│                                      │
│      Juan Pérez                      │
│   Nivel 5 - "Conocedor"              │
│   ────────────────────────           │
│   450 / 700 XP (64%)                 │
│                                      │
│  🔥 Racha actual: 15 días            │
│  🏆 Mejor racha: 24 días             │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  📊 ESTADÍSTICAS GENERALES           │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 📅 Miembro desde: 15 Oct 2025  │ │
│  │ ⏱️ Tiempo total: 8h 45min      │ │
│  │ 📖 Capítulos leídos: 42        │ │
│  │    • Camino: 36                │ │
│  │    • Libre: 6                  │ │
│  │ 📚 Libros iniciados: 2         │ │
│  │ 💯 Libros completos: 0         │ │
│  │ 🎯 XP total: 940 XP            │ │
│  │ ⭐ Promedio diario: 67 XP      │ │
│  │ ✅ Días meta completada: 12/14 │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Ver estadísticas detalladas] →     │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  🎯 METAS                            │
│                                      │
│  Meta del sistema: 50 XP/día         │
│  ✅ Completada 12 de 14 días         │
│                                      │
│  Tu meta personal: 100 XP/día        │
│  ✅ Completada 8 de 14 días          │
│  [Editar] →                          │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  📖 PROGRESO POR LIBRO               │
│                                      │
│  Génesis:                            │
│  ▓▓▓▓▓▓░░░░░░░░ 24% (12/50)         │
│                                      │
│  Juan:                               │
│  ░░░░░░░░░░░░░░ 0% (0/21)           │
│                                      │
│  [Ver todos los libros] →            │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  ⚙️ CONFIGURACIÓN                    │
│  🔔 NOTIFICACIONES                   │
│  ℹ️ AYUDA Y SOPORTE                  │
│  📤 COMPARTIR LA APP                 │
│  🚪 CERRAR SESIÓN                    │
│                                      │
└──────────────────────────────────────┘
```

#### 3.6.2 Pantalla de Configuración

**Layout:**
```
┌──────────────────────────────────────┐
│  ← ⚙️ CONFIGURACIÓN                  │
├──────────────────────────────────────┤
│                                      │
│  👤 PERFIL                           │
│  • Nombre: Juan Pérez                │
│  • Email: juan@example.com           │
│  • Foto de perfil                    │
│  [Editar perfil] →                   │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  🔔 NOTIFICACIONES                   │
│                                      │
│  ☑ Recordatorio diario               │
│     Hora: [20:00 ▼]                  │
│                                      │
│  ☑ Alerta de racha en riesgo         │
│  ☑ Celebración de logros             │
│  ☑ Nuevos niveles                    │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  📖 PREFERENCIAS DE LECTURA          │
│                                      │
│  Versión de la Biblia:               │
│  ○ Reina Valera 1960 ●               │
│  ○ Nueva Versión Internacional       │
│  ○ Traducción Lenguaje Actual       │
│                                      │
│  Tamaño de fuente:                   │
│  [━━━━━●━━━━━]                      │
│  Pequeño  Mediano  Grande            │
│                                      │
│  Tema:                               │
│  ○ Claro                             │
│  ● Oscuro                            │
│  ○ Sepia                             │
│  ○ Auto (según sistema)              │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  🎯 META PERSONAL                    │
│                                      │
│  Meta actual: 100 XP/día             │
│  [Editar meta] →                     │
│  [Eliminar meta personal]            │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  🔐 SEGURIDAD                        │
│  • Cambiar contraseña                │
│  • Eliminar cuenta                   │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  ℹ️ INFORMACIÓN                      │
│  • Acerca de BibliaQuest             │
│  • Versión: 1.0.0 (MVP)              │
│  • Términos y condiciones            │
│  • Política de privacidad            │
│                                      │
└──────────────────────────────────────┘
```

#### 3.6.3 Editar Meta Personal

**Layout:**
```
┌──────────────────────────────────────┐
│  ← ⚙️ EDITAR META PERSONAL           │
├──────────────────────────────────────┤
│                                      │
│  La meta del sistema es 50 XP/día    │
│  (esto no se puede cambiar)          │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  ¿Cuál es tu meta personal?          │
│                                      │
│  Nueva meta (XP/día):                │
│                                      │
│  ┌────────────────────────────────┐ │
│  │   [    100    ] XP             │ │
│  └────────────────────────────────┘ │
│                                      │
│  Sugerencias:                        │
│  • 75 XP  = Casual (1-2 cap)         │
│  • 100 XP = Regular (2-3 cap)        │
│  • 150 XP = Comprometido (3-4 cap)   │
│  • 200 XP = Intensivo (4-5 cap)      │
│  • 300 XP = Muy intensivo (6+ cap)   │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  📊 Con 100 XP/día:                  │
│  • 2-3 capítulos en Camino           │
│  • o 1 capítulo + 30 min lectura     │
│  • o 50 minutos de lectura libre     │
│                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                      │
│  [GUARDAR]                           │
│  [Eliminar meta personal]            │
│                                      │
└──────────────────────────────────────┘
```

**Validaciones:**
- Mínimo: 50 XP (igual a meta del sistema)
- Máximo: 500 XP (10 capítulos)
- Solo números enteros
- Múltiplos de 5

---

### 🔔 Módulo 7: Notificaciones

#### 3.7.1 Tipos de Notificaciones Push

**1. Recordatorio Diario**
```
Título: 🔥 ¡Es hora de leer!
Cuerpo: Tu racha de 15 días te espera.
Hora: Configurada por usuario (default 20:00)
Frecuencia: Diaria
Condición: Solo si no ha completado meta del día
```

**2. Racha en Riesgo**
```
Título: ⚠️ ¡Tu racha está en riesgo!
Cuerpo: Te faltan 30 XP para mantener tus 15 días.
Hora: 22:00 (2 horas antes de medianoche)
Frecuencia: Solo si no ha completado meta a las 22:00
Condición: Tiene racha > 0 y meta no completada
```

**3. Meta del Sistema Completada**
```
Título: 🎉 ¡Meta del sistema completada!
Cuerpo: Ganaste 50 XP + 25 XP bonus. ¡Sigue así!
Frecuencia: Al completar meta (una vez por día)
```

**4. Meta Personal Completada**
```
Título: 🏆 ¡Meta personal alcanzada!
Cuerpo: Completaste 100 XP hoy. ¡Increíble!
Frecuencia: Al completar meta personal (una vez por día)
```

**5. Nuevo Nivel Alcanzado**
```
Título: ⭐ ¡Nivel 6 desbloqueado!
Cuerpo: Ahora eres un "Devoto". +50 XP bonus
Frecuencia: Al subir de nivel
```

**6. Hito de Racha**
```
Título: 🔥 ¡7 días consecutivos!
Cuerpo: +50 XP bonus por tu dedicación.
Frecuencia: En hitos (7, 30, 100, 365 días)
```

**7. Racha Perdida**
```
Título: 😔 Racha perdida
Cuerpo: Tenías 15 días. ¡Empieza de nuevo hoy!
Frecuencia: Al día siguiente si no completó meta
Hora: 08:00 AM
```

#### 3.7.2 Notificaciones In-App (Toasts)

**Formato:**
```
┌────────────────────────────┐
│ Mensaje                    │
└────────────────────────────┘
```

**Ejemplos:**
- "+20 XP - Capítulo leído"
- "🎯 Meta del sistema ✓ +25 XP"
- "⏱️ +10 XP - 10 minutos de lectura"
- "🔥 Racha mantenida +10 XP - 16 días"
- "Error: No hay conexión a internet"
- "Guardado correctamente"

**Duración:** 3-5 segundos  
**Posición:** Parte superior o inferior según contexto  
**Animación:** Slide in/out

#### 3.7.3 Permisos de Notificaciones

**Flujo:**
1. Durante onboarding, preguntar si quiere notificaciones
2. Si acepta → Solicitar permiso del sistema
3. Si concede → Registrar token FCM en Firebase
4. Si rechaza → Guardar preferencia, puede activar después

**iOS:**
- Pedir permiso en momento apropiado
- Explicar beneficio antes de pedir

**Android:**
- Desde Android 13+, requiere permiso explícito
- Antes de Android 13, permitido por default

---

## 4. DISEÑO DE PANTALLAS

### 📱 Wireframes Principales

#### 4.1 Login Screen
```
┌──────────────────────────────────┐
│                                  │
│          [LOGO GRANDE]           │
│          BibliaQuest             │
│                                  │
│      Lee la Biblia diariamente   │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Email                      │ │
│  └────────────────────────────┘ │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Contraseña      [👁️]       │ │
│  └────────────────────────────┘ │
│                                  │
│      ¿Olvidaste tu contraseña?   │
│                                  │
│  ┌────────────────────────────┐ │
│  │    INICIAR SESIÓN          │ │
│  └────────────────────────────┘ │
│                                  │
│          ─── o ───               │
│                                  │
│  ┌────────────────────────────┐ │
│  │ 🔵 Continuar con Google    │ │
│  └────────────────────────────┘ │
│                                  │
│   ¿No tienes cuenta? Regístrate  │
│                                  │
└──────────────────────────────────┘
```

#### 4.2 Home Screen
```
┌──────────────────────────────────┐
│  👤        🔔(2)        ⚙️        │
├──────────────────────────────────┤
│  👋 ¡Hola Juan!                  │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 🎯 META 40/50 XP         │   │
│  │ ████████░░░░              │   │
│  │ 🔥 15 días | Nivel 5     │   │
│  └──────────────────────────┘   │
│                                  │
│  CONTINÚA DONDE LO DEJASTE       │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 📖 Génesis 12            │   │
│  │ 24% ▓▓▓░░░░░             │   │
│  │ [CONTINUAR] →            │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ 📚 Juan 3:16             │   │
│  │ "Porque de tal manera..."│   │
│  │ [LEER] →                 │   │
│  └──────────────────────────┘   │
│                                  │
│  ACCESOS RÁPIDOS                 │
│  [📖 Lectura] [📚 Biblia]       │
│                                  │
└──────────────────────────────────┘
  [🏠] [📖] [👤]
```

#### 4.3 Chapter Reader
```
┌──────────────────────────────────┐
│  [←] Génesis 1          [📝][⚙️]│
├──────────────────────────────────┤
│  [▶️] [Aa] [RV1960 ▼]            │
├──────────────────────────────────┤
│                                  │
│  1 En el principio creó Dios los│
│    cielos y la tierra.          │
│                                  │
│  2 Y la tierra estaba           │
│    desordenada y vacía...       │
│                                  │
│  3 Y dijo Dios: Sea la luz; y   │
│    fue la luz.                  │
│                                  │
│  ...                            │
│                                  │
├──────────────────────────────────┤
│  ┌──────────────────────────┐   │
│  │ ✅ MARCAR COMO LEÍDO     │   │
│  │    +20 XP                │   │
│  └──────────────────────────┘   │
│                                  │
│  [← Cap ant.] [Cap sig. →]      │
└──────────────────────────────────┘
```

#### 4.4 Profile Screen
```
┌──────────────────────────────────┐
│  ← PERFIL                    ⚙️  │
├──────────────────────────────────┤
│                                  │
│          [AVATAR]                │
│         Juan Pérez               │
│     Nivel 5 - "Conocedor"        │
│     450/700 XP (64%)             │
│                                  │
│  🔥 Racha: 15 días               │
│  🏆 Mejor: 24 días               │
│                                  │
│  ESTADÍSTICAS                    │
│  📅 Miembro desde: 15 Oct        │
│  ⏱️ Tiempo: 8h 45min             │
│  📖 Capítulos: 42                │
│  🎯 XP total: 940                │
│                                  │
│  PROGRESO POR LIBRO              │
│  Génesis  ▓▓▓▓░░░░ 24%          │
│  Juan     ░░░░░░░░  0%          │
│                                  │
│  [⚙️ Configuración]              │
│  [🔔 Notificaciones]             │
│  [🚪 Cerrar sesión]              │
│                                  │
└──────────────────────────────────┘
  [🏠] [📖] [👤]
```

---

## 5. CASOS DE USO DETALLADOS

### Caso de Uso 1: Usuario Nuevo Se Registra

**Actor:** Usuario nuevo  
**Precondiciones:** Ninguna  
**Flujo Principal:**

1. Usuario abre la app por primera vez
2. Sistema muestra pantalla de bienvenida
3. Usuario toca "Crear cuenta"
4. Sistema muestra formulario de registro
5. Usuario ingresa email, contraseña y nombre
6. Usuario toca "Registrarse"
7. Sistema valida datos
8. Sistema crea cuenta en Firebase Auth
9. Sistema crea documento de usuario en Firestore
10. Sistema muestra onboarding
11. Usuario configura preferencias (nombre, hora, meta)
12. Sistema guarda preferencias
13. Sistema solicita permisos de notificaciones
14. Usuario concede permisos
15. Sistema registra token FCM
16. Sistema muestra tutorial breve (opcional)
17. Sistema redirige a Home

**Flujos Alternativos:**

**7a. Email ya registrado:**
- Sistema muestra error "Este email ya está registrado"
- Usuario puede intentar de nuevo o ir a login

**7b. Contraseña débil:**
- Sistema muestra error "Contraseña debe tener al menos 6 caracteres"
- Usuario ingresa contraseña más fuerte

**14a. Usuario rechaza permisos:**
- Sistema guarda preferencia
- Usuario puede activar después en configuración

**Postcondiciones:**
- Usuario tiene cuenta creada
- Usuario tiene documento en Firestore
- Usuario está en Home
- Usuario puede empezar a usar la app

### Caso de Uso 2: Usuario Lee Capítulo en Camino

**Actor:** Usuario autenticado  
**Precondiciones:** Usuario tiene al menos un libro disponible  
**Flujo Principal:**

1. Usuario está en Home
2. Usuario toca "Continuar" en widget de Lectura
3. Sistema muestra camino de capítulos del libro
4. Sistema muestra próximo capítulo disponible destacado
5. Usuario toca "Leer ahora" en siguiente capítulo
6. Sistema carga contenido del capítulo
7. Sistema muestra lector con el texto completo
8. Usuario lee el capítulo (scroll vertical)
9. Usuario llega al final del capítulo
10. Usuario toca "Marcar como leído"
11. Sistema valida que sea el siguiente capítulo
12. Sistema crea registro de lectura en Firestore
13. Sistema actualiza progreso del libro
14. Sistema actualiza progreso diario
15. Sistema calcula XP ganado (+20 XP)
16. Sistema actualiza XP total del usuario
17. Sistema verifica si completó meta del sistema
18. Sistema verifica si completó meta personal
19. Sistema verifica si subió de nivel
20. Sistema muestra pantalla de confirmación con:
    - XP ganado
    - Progreso del día
    - Progreso del libro
    - Opciones de navegación
21. Usuario toca "Continuar con siguiente capítulo"
22. Sistema muestra siguiente capítulo

**Flujos Alternativos:**

**17a. Completó meta del sistema:**
- Sistema otorga +25 XP bonus
- Sistema actualiza racha
- Sistema envía notificación "¡Meta completada!"

**18a. Completó meta personal:**
- Sistema otorga +50 XP bonus
- Sistema envía notificación "¡Meta personal alcanzada!"

**19a. Subió de nivel:**
- Sistema otorga +50 XP bonus
- Sistema actualiza nivel
- Sistema muestra animación de celebración
- Sistema envía notificación "¡Nuevo nivel!"

**Postcondiciones:**
- Capítulo marcado como leído
- Progreso actualizado
- XP otorgado
- Siguiente capítulo desbloqueado

### Caso de Uso 3: Usuario Pierde Racha

**Actor:** Sistema (Cloud Function)  
**Precondiciones:** Es 00:01 del nuevo día  
**Flujo Principal:**

1. Cloud Function se ejecuta a las 00:01
2. Sistema obtiene lista de todos los usuarios
3. Para cada usuario:
   4. Sistema obtiene progreso del día anterior
   5. Sistema verifica si completó meta del sistema
   6. Si NO completó:
      7. Sistema verifica si tiene racha activa (> 0)
      8. Si tiene racha:
         9. Sistema guarda racha actual como última
         10. Sistema resetea racha a 0
         11. Sistema envía notificación "Racha perdida"
   12. Si SÍ completó:
       13. Sistema incrementa racha
       14. Sistema verifica si alcanzó hito (7, 30, 100, 365)
       15. Si alcanzó hito:
           16. Sistema otorga XP bonus correspondiente
           17. Sistema envía notificación de hito

**Postcondiciones:**
- Rachas actualizadas para todos los usuarios
- Notificaciones enviadas
- Bonus de hitos otorgados

### Caso de Uso 4: Usuario Busca Versículo Específico

**Actor:** Usuario autenticado  
**Precondiciones:** Usuario está en Lectura Libre  
**Flujo Principal:**

1. Usuario está en lector de Biblia Libre
2. Usuario toca ícono de búsqueda 🔍
3. Sistema muestra pantalla de búsqueda
4. Sistema muestra búsquedas recientes y sugerencias
5. Usuario ingresa "Juan 3:16" en el campo
6. Sistema detecta que es referencia exacta
7. Sistema valida formato (Libro Cap:Vers)
8. Sistema busca en base de datos
9. Sistema encuentra el versículo
10. Sistema navega directamente a Juan capítulo 3
11. Sistema hace scroll al versículo 16
12. Sistema resalta el versículo temporalmente

**Flujos Alternativos:**

**6a. Usuario busca por palabra:**
- Usuario ingresa "amor"
- Sistema busca en toda la Biblia
- Sistema muestra lista de resultados (max 100)
- Usuario toca un resultado
- Sistema navega al capítulo correspondiente

**9a. Versículo no encontrado:**
- Sistema muestra error "No se encontró este versículo"
- Sistema sugiere verificar la referencia

**Postcondiciones:**
- Usuario ve el versículo buscado
- Búsqueda se guarda en historial

### Caso de Uso 5: Usuario Edita Meta Personal

**Actor:** Usuario autenticado  
**Precondiciones:** Usuario está en Perfil  
**Flujo Principal:**

1. Usuario está en pantalla de Perfil
2. Usuario toca "Configuración"
3. Sistema muestra pantalla de configuración
4. Usuario toca "Meta personal"
5. Sistema muestra pantalla de edición de meta
6. Sistema muestra meta actual (ej: 100 XP)
7. Usuario cambia valor a 150 XP
8. Usuario toca "Guardar"
9. Sistema valida que esté entre 50-500
10. Sistema actualiza documento de usuario en Firestore
11. Sistema muestra mensaje "Meta actualizada"
12. Sistema regresa a configuración

**Flujos Alternativos:**

**9a. Valor inválido:**
- Sistema muestra error "Meta debe estar entre 50 y 500 XP"
- Usuario corrige valor

**7a. Usuario elimina meta:**
- Usuario toca "Eliminar meta personal"
- Sistema muestra confirmación
- Usuario confirma
- Sistema establece meta personal en null
- Sistema muestra mensaje "Meta personal eliminada"

**Postcondiciones:**
- Meta personal actualizada
- Cambios reflejados en Home desde el siguiente día

---

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Autenticación

#### Registro
- [ ] Usuario puede registrarse con email y contraseña
- [ ] Email debe ser único en el sistema
- [ ] Contraseña debe tener mínimo 6 caracteres
- [ ] Nombre debe tener mínimo 2 caracteres
- [ ] Muestra errores claros de validación
- [ ] Usuario puede registrarse con Google
- [ ] Después de registro exitoso, redirige a onboarding
- [ ] Crea documento de usuario en Firestore con todos los campos

#### Login
- [ ] Usuario puede iniciar sesión con email/contraseña
- [ ] Usuario puede iniciar sesión con Google
- [ ] Muestra errores claros si credenciales incorrectas
- [ ] Después de login exitoso, redirige a Home
- [ ] Carga datos del usuario desde Firestore
- [ ] Persiste sesión (no pide login cada vez)

#### Onboarding
- [ ] Muestra 4 pantallas de onboarding
- [ ] Permite configurar nombre
- [ ] Permite configurar hora de notificaciones
- [ ] Permite activar/desactivar notificaciones
- [ ] Permite establecer meta personal (opcional)
- [ ] Permite omitir meta personal
- [ ] Guarda preferencias en Firestore
- [ ] Después de completar, redirige a Home

### 6.2 Sistema de Progreso

#### XP
- [ ] Otorga 20 XP por capítulo leído en Camino
- [ ] Otorga 10 XP por cada 10 minutos en Lectura Libre
- [ ] Otorga 5 XP por login diario (primera vez del día)
- [ ] Otorga 25 XP bonus al completar meta del sistema
- [ ] Otorga 50 XP bonus al completar meta personal
- [ ] Otorga 10 XP bonus diario por racha activa
- [ ] Otorga 50 XP bonus al subir de nivel
- [ ] No otorga XP por releer capítulos
- [ ] Límite de 30 XP por día en Lectura Libre
- [ ] Muestra XP ganado en toasts/notificaciones

#### Niveles
- [ ] Usuario empieza en nivel 1
- [ ] XP acumulado determina el nivel
- [ ] Sube de nivel automáticamente al alcanzar XP necesario
- [ ] Muestra animación al subir de nivel
- [ ] Envía notificación al subir de nivel
- [ ] Muestra progreso al siguiente nivel en UI
- [ ] Título de nivel se actualiza correctamente

#### Rachas
- [ ] Racha se incrementa al completar meta del sistema
- [ ] Racha se resetea a 0 si no completa meta en un día
- [ ] Muestra racha actual en Home y Perfil
- [ ] Guarda mejor racha histórica
- [ ] Envía notificación de racha en riesgo a las 22:00
- [ ] Envía notificación de racha perdida al día siguiente
- [ ] Otorga bonus de XP en hitos (7, 30, 100, 365 días)
- [ ] Cloud Function verifica rachas a las 00:01

#### Metas
- [ ] Meta del sistema es siempre 50 XP
- [ ] Meta del sistema no es editable
- [ ] Meta personal es opcional (puede ser null)
- [ ] Meta personal es editable por el usuario
- [ ] Meta personal debe estar entre 50-500 XP
- [ ] Ambas metas pueden completarse el mismo día
- [ ] Muestra progreso de ambas metas en Home
- [ ] Bonus de metas no cuentan para la siguiente meta

### 6.3 Lectura - Camino

#### Lista de Libros
- [ ] Muestra Génesis y Juan disponibles
- [ ] Muestra resto de libros como "Próximamente"
- [ ] Muestra progreso de cada libro disponible
- [ ] Permite acceder a libros disponibles
- [ ] Bloquea acceso a libros no disponibles
- [ ] Organiza libros por testamento y categoría

#### Camino de Capítulos
- [ ] Muestra camino visual de todos los capítulos
- [ ] Capítulo 1 siempre está disponible
- [ ] Capítulos se desbloquean secuencialmente
- [ ] No se pueden saltar capítulos
- [ ] Muestra estado de cada capítulo (completado/siguiente/bloqueado)
- [ ] Muestra fecha/hora de capítulos completados
- [ ] Permite acceder a siguiente capítulo
- [ ] Bloquea capítulos no desbloqueados
- [ ] Permite releer capítulos completados (sin XP)

#### Lector de Capítulo
- [ ] Muestra contenido completo del capítulo
- [ ] Muestra números de versículos
- [ ] Texto es seleccionable y copiable
- [ ] Permite cambiar tamaño de fuente (3 tamaños)
- [ ] Permite cambiar versión de la Biblia (3 versiones)
- [ ] Muestra botón "Marcar como leído" al final
- [ ] Botón solo funciona si es el siguiente capítulo
- [ ] Navega al capítulo anterior/siguiente
- [ ] Muestra pantalla de confirmación al marcar como leído
- [ ] Actualiza progreso en Firestore
- [ ] Actualiza UI de camino después de completar

### 6.4 Lectura Libre

#### Lector
- [ ] Permite acceder a todos los 66 libros
- [ ] No requiere desbloqueo progresivo
- [ ] Muestra selector de libro/capítulo
- [ ] Permite cambiar versión de la Biblia
- [ ] Permite cambiar tamaño de fuente
- [ ] Timer de lectura funciona correctamente
- [ ] Timer se pausa al salir de la app
- [ ] Otorga 10 XP cada 10 minutos
- [ ] Máximo 3 bonos de XP por día
- [ ] Muestra widget de tiempo y próximo bonus
- [ ] Guarda última posición de lectura

#### Búsqueda
- [ ] Permite buscar por referencia exacta (Libro Cap:Vers)
- [ ] Navega directo al versículo buscado
- [ ] Permite buscar por palabra o frase
- [ ] Muestra lista de resultados (max 100)
- [ ] Permite navegar a resultado seleccionado
- [ ] Guarda búsquedas recientes
- [ ] Muestra sugerencias de versículos populares

### 6.5 Home

#### Dashboard
- [ ] Muestra saludo personalizado con nombre
- [ ] Muestra widget de meta del día
- [ ] Muestra progreso de meta del sistema
- [ ] Muestra progreso de meta personal (si existe)
- [ ] Muestra racha actual
- [ ] Muestra nivel y progreso
- [ ] Muestra última lectura del Camino
- [ ] Muestra última lectura Libre
- [ ] Permite continuar lecturas desde Home
- [ ] Muestra accesos rápidos
- [ ] Muestra resumen semanal
- [ ] Se actualiza en tiempo real
- [ ] Funciona pull-to-refresh

### 6.6 Perfil

#### Información
- [ ] Muestra avatar del usuario
- [ ] Permite cambiar avatar
- [ ] Muestra nombre del usuario
- [ ] Muestra nivel y título
- [ ] Muestra progreso al siguiente nivel
- [ ] Muestra racha actual y mejor racha
- [ ] Muestra todas las estadísticas correctamente
- [ ] Muestra progreso por libro
- [ ] Permite acceder a configuración

#### Configuración
- [ ] Permite editar nombre
- [ ] Permite activar/desactivar notificaciones
- [ ] Permite cambiar hora de notificaciones
- [ ] Permite cambiar versión de la Biblia
- [ ] Permite cambiar tamaño de fuente
- [ ] Permite cambiar tema (claro/oscuro/sepia/auto)
- [ ] Permite editar meta personal
- [ ] Permite eliminar meta personal
- [ ] Permite cambiar contraseña
- [ ] Permite cerrar sesión
- [ ] Guarda cambios en Firestore

### 6.7 Notificaciones

#### Push Notifications
- [ ] Envía recordatorio diario a la hora configurada
- [ ] Envía alerta de racha en riesgo a las 22:00
- [ ] Envía notificación de meta completada
- [ ] Envía notificación de meta personal completada
- [ ] Envía notificación de nuevo nivel
- [ ] Envía notificación de hito de racha
- [ ] Envía notificación de racha perdida
- [ ] Notificaciones se pueden desactivar
- [ ] Notificaciones funcionan en iOS y Android

#### In-App
- [ ] Muestra toast al ganar XP
- [ ] Muestra toast al completar meta
- [ ] Muestra toast al subir de nivel
- [ ] Muestra toast de errores
- [ ] Toasts desaparecen automáticamente
- [ ] Toasts no bloquean interacción

---

## 7. FLUJOS DE USUARIO

### Flujo A: Primera Experiencia (Día 1)

```
[Descargar app] →
[Abrir app] →
[Ver bienvenida] →
[Tocar "Crear cuenta"] →
[Ingresar datos] →
[Registrarse] →
[Onboarding paso 1: Nombre] →
[Onboarding paso 2: Notificaciones] →
[Onboarding paso 3: Meta personal] →
[Conceder permisos] →
[Ver tutorial breve] →
[Llegar a Home] →
[Ver sugerencia "Empieza con Génesis"] →
[Tocar "Leer Cap 1"] →
[Leer Génesis 1] →
[Marcar como leído] →
[Ver "+20 XP"] →
[Ver confirmación] →
[Tocar "Continuar con Cap 2"] →
[Leer Génesis 2] →
[Marcar como leído] →
[Ver "+20 XP"] →
[Ver "Meta del sistema completada! +25 XP"] →
[Total del día: 65 XP] →
[Racha: 1 día] →
[Cerrar app]
```

### Flujo B: Usuario Regular (Día 15)

```
[Recibir notificación a las 20:00] →
[Abrir app desde notificación] →
[Ver Home] →
[Ver meta: 0/50 XP del día] →
[Ver "Continuar Génesis 12"] →
[Tocar continuar] →
[Ver camino de capítulos] →
[Tocar "Leer Cap 12"] →
[Leer capítulo] →
[Marcar como leído] →
[+20 XP] →
[Volver a Home] →
[Ver 20/50 XP] →
[Tocar "Biblia Libre"] →
[Seleccionar Juan 3] →
[Leer por 10 minutos] →
[Ver "+10 XP - 10 minutos"] →
[Volver a Home] →
[Ver 30/50 XP] →
[Tocar "Lectura"] →
[Tocar "Leer Cap 13"] →
[Leer capítulo] →
[Marcar como leído] →
[+20 XP] →
[Ver "Meta completada! +25 XP bonus"] →
[Ver "Racha mantenida: 15 días +10 XP"] →
[Total: 75 XP] →
[Ver animación de celebración] →
[Cerrar app satisfecho]
```

### Flujo C: Usuario Pierde Racha

```
[Día ocupado, no abre app] →
[00:01 - Cloud Function se ejecuta] →
[Sistema verifica progreso de ayer] →
[Meta NO completada: 35/50 XP] →
[Sistema resetea racha a 0] →
[08:00 AM - Recibe notificación] →
["😔 Racha perdida - Tenías 15 días"] →
[Usuario abre app] →
[Ve Home con Racha: 0 días] →
[Se motiva a empezar de nuevo] →
[Lee capítulo] →
[Nueva racha: 1 día] →
[Establece alarma para no olvidar]
```

### Flujo D: Usuario Busca Versículo

```
[Está en Home] →
[Tocar "Biblia Libre"] →
[Tocar ícono de búsqueda 🔍] →
[Ingresar "Juan 3:16"] →
[Sistema detecta referencia] →
[Navega a Juan 3] →
[Hace scroll a versículo 16] →
[Versículo resaltado] →
[Usuario lee contexto] →
[Usuario toca y mantiene presionado] →
[Aparece menú: Copiar/Compartir] →
[Usuario copia versículo] →
[Toast: "Versículo copiado"] →
[Usuario cierra app]
```

### Flujo E: Usuario Completa Libro

```
[Leyendo Génesis Cap 50] →
[Último capítulo del libro] →
[Marcar como leído] →
[+20 XP] →
[Ver confirmación especial] →
["🎉 ¡Libro Completado!"] →
[Animación de fuegos artificiales] →
["Has completado Génesis"] →
["+100 XP Bonus por libro completo"] →
[Pantalla de estadísticas del libro]:
  - Tiempo total: 12h 30min
  - XP ganado: 1,100 XP
  - Fecha inicio: 15 Oct
  - Fecha fin: 22 Oct
  - Capítulos: 50/50
[Sugerencia: "Continúa con Éxodo"] →
[Mensaje: "Próximamente disponible"] →
[O: "Prueba con Juan"] →
[Usuario va a Juan Cap 1] →
[Empieza nuevo libro]
```

---

## 8. REGLAS DE NEGOCIO

### 8.1 Reglas de XP

1. **No hay XP negativo** - Errores no quitan XP
2. **XP se acumula para siempre** - No expira
3. **Solo actividades del día cuentan para meta** - XP de ayer no cuenta hoy
4. **Releer no da XP** - Solo primera lectura de capítulo
5. **Bonus no cuentan para siguiente meta** - Los 25 XP de meta completada no cuentan para meta personal
6. **Máximo 30 XP por día en Lectura Libre** - 3 bonos de 10 XP

### 8.2 Reglas de Niveles

1. **Nivel se basa en XP total acumulado** - No en actividad diaria
2. **No se puede bajar de nivel** - Niveles son permanentes
3. **Bonus de nivel es instantáneo** - Se otorga inmediatamente al subir
4. **Nivel máximo es 20 en MVP** - Después se puede expandir

### 8.3 Reglas de Rachas

1. **Solo meta del sistema afecta racha** - Meta personal no cuenta
2. **Racha se cuenta en días calendario** - 00:00 a 23:59
3. **Tienes hasta 23:59:59 para completar** - Después de medianoche se pierde
4. **Racha perdida vuelve a 0** - No hay recuperación automática
5. **Mejor racha se guarda siempre** - Nunca se borra
6. **Hitos dan bonus solo una vez** - No se repiten

### 8.4 Reglas de Metas

1. **Meta del sistema es inmutable** - Siempre 50 XP
2. **Meta personal es opcional** - Puede ser null
3. **Meta personal mínima es 50 XP** - Igual a meta del sistema
4. **Meta personal máxima es 500 XP** - Equivale a ~10 capítulos
5. **Cambios de meta aplican al día siguiente** - No retroactivo
6. **Ambas metas independientes** - Se pueden completar ambas

### 8.5 Reglas de Lectura

1. **Camino es secuencial** - No puedes saltar capítulos
2. **Capítulo 1 siempre disponible** - Primer capítulo desbloqueado
3. **Lectura Libre no tiene restricciones** - Todos los libros disponibles
4. **Solo 2 libros en Camino para MVP** - Génesis y Juan
5. **Timer de Lectura Libre se pausa** - Si sales de la app
6. **Última posición se guarda** - En ambos modos

### 8.6 Reglas de Notificaciones

1. **Máximo 1 notificación de recordatorio por día** - A la hora configurada
2. **Racha en riesgo solo si racha > 0** - No notifica si racha es 0
3. **Usuario puede desactivar todas** - En configuración
4. **iOS requiere permiso explícito** - Android 13+ también
5. **Notificaciones persisten configuración** - Incluso si desinstala

---

## 9. TESTING CHECKLIST

### 9.1 Testing Funcional

#### Autenticación
- [ ] Registro con email/password funciona
- [ ] Registro con Google funciona
- [ ] Login con email/password funciona
- [ ] Login con Google funciona
- [ ] Recuperar contraseña funciona
- [ ] Validaciones muestran errores correctos
- [ ] Sesión persiste después de cerrar app
- [ ] Logout funciona correctamente

#### Onboarding
- [ ] Todas las pantallas se muestran
- [ ] Configuración de nombre funciona
- [ ] Configuración de notificaciones funciona
- [ ] Configuración de meta personal funciona
- [ ] Puede omitir meta personal
- [ ] Datos se guardan en Firestore
- [ ] Redirige correctamente al Home

#### Sistema de Progreso
- [ ] XP se otorga correctamente por cada actividad
- [ ] Niveles suben automáticamente
- [ ] Rachas se incrementan/resetean correctamente
- [ ] Metas se calculan correctamente
- [ ] Bonus se otorgan cuando corresponde
- [ ] UI se actualiza en tiempo real

#### Lectura - Camino
- [ ] Lista de libros se muestra correctamente
- [ ] Camino de capítulos funciona
- [ ] Desbloqueo progresivo funciona
- [ ] Lector de capítulo muestra contenido
- [ ] Marcar como leído funciona
- [ ] Progreso se actualiza en Firestore
- [ ] No se puede saltar capítulos
- [ ] Puede releer capítulos completados

#### Lectura Libre
- [ ] Todos los 66 libros accesibles
- [ ] Selector de libro/capítulo funciona
- [ ] Timer de lectura funciona
- [ ] XP por tiempo se otorga correctamente
- [ ] Búsqueda de versículos funciona
- [ ] Navega correctamente a resultados
- [ ] Última posición se guarda

#### Home
- [ ] Muestra datos correctos del usuario
- [ ] Widget de meta actualiza en tiempo real
- [ ] Enlaces de continuación funcionan
- [ ] Accesos rápidos navegan correctamente
- [ ] Pull-to-refresh actualiza datos

#### Perfil
- [ ] Muestra estadísticas correctas
- [ ] Permite editar configuración
- [ ] Cambios se guardan en Firestore
- [ ] Cambiar avatar funciona
- [ ] Editar meta personal funciona
- [ ] Cerrar sesión funciona

### 9.2 Testing de Integración

- [ ] Firebase Auth y Firestore se comunican correctamente
- [ ] Cambios en Firestore se reflejan en UI
- [ ] Notificaciones push funcionan
- [ ] Cloud Functions se ejecutan correctamente
- [ ] Datos persisten correctamente
- [ ] Sincronización funciona sin conflictos

### 9.3 Testing de UI/UX

- [ ] App se ve bien en iPhone (varios tamaños)
- [ ] App se ve bien en Android (varios tamaños)
- [ ] Todas las animaciones funcionan suavemente
- [ ] Transiciones entre pantallas son fluidas
- [ ] Toasts se muestran correctamente
- [ ] Loading states son claros
- [ ] Error states son informativos
- [ ] Temas (claro/oscuro) funcionan correctamente

### 9.4 Testing de Performance

- [ ] App carga en menos de 3 segundos
- [ ] Lectores de capítulos cargan rápido
- [ ] Búsqueda responde en menos de 1 segundo
- [ ] No hay lag al hacer scroll
- [ ] Imágenes y assets cargan correctamente
- [ ] App no consume batería excesivamente

### 9.5 Testing de Seguridad

- [ ] Reglas de Firestore bloquean acceso no autorizado
- [ ] Usuario solo puede ver/editar sus propios datos
- [ ] Contenido bíblico es read-only desde app
- [ ] Tokens de autenticación expiran correctamente
- [ ] Datos sensibles no se exponen en logs

### 9.6 Testing de Edge Cases

- [ ] App funciona sin internet (muestra error apropiado)
- [ ] App maneja pérdida de conexión durante operación
- [ ] App maneja datos corruptos
- [ ] App maneja límites de Firebase
- [ ] App maneja usuario con mucho progreso (100+ capítulos)
- [ ] App maneja cambio de zona horaria
- [ ] App maneja cambio de fecha del sistema

### 9.7 Testing de Dispositivos

- [ ] iPhone 12 mini (pantalla pequeña)
- [ ] iPhone 14 Pro (pantalla grande)
- [ ] iPhone SE (pantalla pequeña antigua)
- [ ] Samsung Galaxy S21 (Android)
- [ ] Google Pixel 6 (Android)
- [ ] OnePlus (Android)
- [ ] iOS 15+
- [ ] Android 10+

---

## 10. ROADMAP DE IMPLEMENTACIÓN

### Semana 1: Setup y Autenticación

**Días 1-2: Setup Inicial**
- [ ] Crear proyecto Expo con TypeScript
- [ ] Configurar Firebase (Auth, Firestore, FCM)
- [ ] Instalar todas las dependencias
- [ ] Crear estructura de carpetas
- [ ] Configurar ESLint y Prettier
- [ ] Crear repositorio Git
- [ ] Setup Sentry para error tracking

**Días 3-5: Autenticación**
- [ ] Crear LoginScreen
- [ ] Crear RegisterScreen
- [ ] Crear ForgotPasswordScreen
- [ ] Implementar authService
- [ ] Implementar Google Sign-In
- [ ] Agregar validaciones de formularios
- [ ] Crear AuthNavigator

**Días 6-7: Onboarding**
- [ ] Crear 4 pantallas de onboarding
- [ ] Implementar navegación entre pantallas
- [ ] Guardar preferencias en Firestore
- [ ] Solicitar permisos de notificaciones
- [ ] Testing de flujo completo

### Semana 2: Base de Datos y Sistema Core

**Días 1-2: Estructura de Firestore**
- [ ] Definir colecciones y documentos
- [ ] Configurar reglas de seguridad
- [ ] Crear funciones helper para Firestore
- [ ] Implementar servicios CRUD básicos
- [ ] Testing de lectura/escritura

**Días 3-4: Sistema de XP**
- [ ] Implementar xpService
- [ ] Crear funciones de cálculo de XP
- [ ] Crear funciones de otorgamiento de XP
- [ ] Implementar verificación de metas
- [ ] Testing de XP

**Días 5-7: Niveles y Rachas**
- [ ] Implementar levelService
- [ ] Poblar colección de niveles en Firestore
- [ ] Implementar verificación de nivel
- [ ] Implementar streakService
- [ ] Crear Cloud Function para verificar rachas
- [ ] Testing de niveles y rachas

### Semana 3: Estado Global y UI Base

**Días 1-3: Estado Global (Zustand)**
- [ ] Crear userStore
- [ ] Crear readingStore
- [ ] Crear uiStore
- [ ] Implementar custom hooks
- [ ] Testing de stores

**Días 4-7: Componentes Base**
- [ ] Crear Button component
- [ ] Crear Input component
- [ ] Crear Card component
- [ ] Crear ProgressBar component
- [ ] Crear Toast component
- [ ] Crear Loading component
- [ ] Crear Error component
- [ ] Definir theme (colors, fonts, spacing)

### Semana 4: Contenido Bíblico

**Días 1-3: Obtener Contenido**
- [ ] Decidir fuente de contenido (API o JSON)
- [ ] Obtener texto de Génesis (50 caps)
- [ ] Obtener texto de Juan (21 caps)
- [ ] Formatear en estructura correcta
- [ ] Validar estructura de datos

**Días 4-7: Subir a Firebase**
- [ ] Crear script de upload
- [ ] Subir Génesis a Firestore
- [ ] Subir Juan a Firestore
- [ ] Subir información de todos los libros (metadata)
- [ ] Verificar datos en Firestore
- [ ] Testing de lectura de contenido

### Semana 5: Lectura - Camino (Parte 1)

**Días 1-2: Lista de Libros**
- [ ] Crear BookListScreen
- [ ] Crear BookCard component
- [ ] Obtener libros de Firestore
- [ ] Mostrar progreso de cada libro
- [ ] Implementar navegación a camino
- [ ] Testing

**Días 3-5: Camino de Capítulos**
- [ ] Crear ChapterPathScreen
- [ ] Crear ChapterNode component
- [ ] Implementar lógica de desbloqueo
- [ ] Mostrar estado de cada capítulo
- [ ] Implementar navegación a lector
- [ ] Testing de desbloqueo progresivo

**Días 6-7: Progreso de Lectura**
- [ ] Implementar readingService
- [ ] Crear funciones de inicializar libro
- [ ] Crear funciones de obtener progreso
- [ ] Crear funciones de actualizar progreso
- [ ] Testing de servicio

### Semana 6: Lectura - Camino (Parte 2)

**Días 1-4: Lector de Capítulo**
- [ ] Crear ChapterReaderScreen
- [ ] Implementar scroll de versículos
- [ ] Implementar cambio de tamaño de fuente
- [ ] Implementar cambio de versión
- [ ] Crear toolbar con controles
- [ ] Testing de lector

**Días 5-7: Marcar como Leído**
- [ ] Implementar botón "Marcar como leído"
- [ ] Implementar validación de siguiente capítulo
- [ ] Crear pantalla de confirmación
- [ ] Implementar función de guardar lectura
- [ ] Actualizar progreso en Firestore
- [ ] Actualizar progreso diario
- [ ] Verificar y otorgar bonus
- [ ] Testing completo del flujo

### Semana 7: Lectura Libre

**Días 1-3: Lector Libre**
- [ ] Crear FreeReadingScreen
- [ ] Reutilizar componentes del lector de Camino
- [ ] Implementar selector de libro/capítulo
- [ ] Crear BookSelectorScreen
- [ ] Implementar navegación entre capítulos
- [ ] Testing

**Días 4-5: Timer de Lectura**
- [ ] Implementar useReadingTimer hook
- [ ] Crear widget de timer flotante
- [ ] Implementar otorgamiento de XP por tiempo
- [ ] Implementar límite de 3 bonos por día
- [ ] Testing de timer

**Días 6-7: Búsqueda**
- [ ] Crear SearchScreen
- [ ] Implementar búsqueda por referencia
- [ ] Implementar búsqueda por palabra
- [ ] Mostrar resultados
- [ ] Implementar navegación a resultados
- [ ] Guardar búsquedas recientes
- [ ] Testing

### Semana 8: Home, Perfil y Navegación

**Días 1-3: Home Screen**
- [ ] Crear HomeScreen
- [ ] Crear XPWidget component
- [ ] Crear StreakWidget component
- [ ] Crear ContinueReadingCard component
- [ ] Implementar accesos rápidos
- [ ] Implementar resumen semanal
- [ ] Implementar pull-to-refresh
- [ ] Testing

**Días 4-5: Perfil Screen**
- [ ] Crear ProfileScreen
- [ ] Mostrar estadísticas
- [ ] Crear StatsScreen detallada
- [ ] Mostrar progreso por libro
- [ ] Implementar navegación a configuración
- [ ] Testing

**Días 6-7: Navegación Principal**
- [ ] Crear MainNavigator con bottom tabs
- [ ] Implementar navegación entre secciones
- [ ] Agregar iconos a tabs
- [ ] Testing de navegación completa

### Semana 9: Configuración y Notificaciones

**Días 1-3: Configuración**
- [ ] Crear SettingsScreen
- [ ] Implementar edición de perfil
- [ ] Implementar configuración de notificaciones
- [ ] Implementar preferencias de lectura
- [ ] Implementar edición de meta personal
- [ ] Implementar cambio de contraseña
- [ ] Guardar cambios en Firestore
- [ ] Testing

**Días 4-7: Notificaciones**
- [ ] Configurar Firebase Cloud Messaging
- [ ] Implementar notificationService
- [ ] Implementar recordatorio diario
- [ ] Implementar notificación de racha en riesgo
- [ ] Implementar notificaciones de logros
- [ ] Implementar Cloud Function de verificación diaria
- [ ] Testing en iOS y Android

### Semana 10: Polish, Testing y Lanzamiento

**Días 1-3: Polish**
- [ ] Agregar todas las animaciones
- [ ] Mejorar transiciones
- [ ] Implementar todos los loading states
- [ ] Implementar todos los error states
- [ ] Mejorar UX general
- [ ] Optimizar rendimiento

**Días 4-5: Testing Exhaustivo**
- [ ] Testing funcional completo
- [ ] Testing de integración
- [ ] Testing en múltiples dispositivos
- [ ] Testing de performance
- [ ] Corrección de bugs encontrados

**Días 6-7: Preparación de Lanzamiento**
- [ ] Crear screenshots para stores
- [ ] Escribir descripción de app
- [ ] Crear ícono final
- [ ] Configurar privacidad y términos
- [ ] Build para producción
- [ ] Submit a App Store
- [ ] Submit a Google Play

### Post-Lanzamiento (Semanas 11-12)

**Beta Testing**
- [ ] Reclutar 10-20 beta testers
- [ ] Recopilar feedback
- [ ] Monitorear analytics
- [ ] Monitorear crashes
- [ ] Iterar basado en feedback

**Correcciones**
- [ ] Corregir bugs críticos
- [ ] Optimizar según métricas
- [ ] Mejorar UX según feedback

**Marketing Inicial**
- [ ] Landing page simple
- [ ] Redes sociales
- [ ] Comunicar a iglesias/grupos
- [ ] Preparar Fase 2

---

## ✅ CHECKLIST FINAL DE ENTREGA

### Pre-Lanzamiento
- [ ] Todas las funciones core funcionan
- [ ] Testing completo realizado
- [ ] Sin bugs críticos
- [ ] Performance óptimo
- [ ] Funciona en iOS y Android
- [ ] Reglas de Firestore configuradas
- [ ] Cloud Functions desplegadas
- [ ] Notificaciones funcionando
- [ ] Analytics configurado
- [ ] Sentry configurado

### Contenido
- [ ] Génesis completo (50 caps)
- [ ] Juan completo (21 caps)
- [ ] Metadata de 66 libros
- [ ] 3 versiones de la Biblia
- [ ] Todos los niveles configurados

### Documentación
- [ ] README.md
- [ ] Documentación de API
- [ ] Guía de deployment
- [ ] Política de privacidad
- [ ] Términos y condiciones

### Stores
- [ ] Assets preparados (iconos, screenshots)
- [ ] Descripción escrita
- [ ] Keywords definidos
- [ ] Categoría seleccionada
- [ ] Información de contacto
- [ ] Build de producción generado
- [ ] Submitted a App Store
- [ ] Submitted a Google Play

### Post-Lanzamiento
- [ ] Monitoreo de métricas activo
- [ ] Sistema de feedback implementado
- [ ] Plan de iteración definido
- [ ] Roadmap de Fase 2 preparado

---

**Fecha de creación:** Octubre 2025  
**Versión:** 1.0 MVP/Demo  
**Estado:** Listo para Desarrollo

---

## 📞 Soporte y Contacto

Para preguntas sobre este documento:
- Revisar documentos complementarios
- Consultar documentación técnica
- Verificar casos de uso y criterios de aceptación

**¡Éxito en el desarrollo de BibliaQuest MVP!** 🚀📖
