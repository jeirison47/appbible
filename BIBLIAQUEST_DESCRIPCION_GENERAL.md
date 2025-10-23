# BibliaQuest - Descripción General Completa del Proyecto

## 📱 Concepto Principal

**BibliaQuest** es una aplicación móvil de gamificación del estudio bíblico que utiliza mecánicas similares a Duolingo para hacer el aprendizaje de la Biblia interactivo, divertido y formador de hábitos. Los usuarios avanzan a través de lecciones diarias estructuradas, mantienen rachas de estudio, ganan recompensas y progresan en su conocimiento bíblico de manera sistemática.

---

## 🎯 Objetivo del Proyecto

Ayudar a millones de personas a:
- Desarrollar el hábito del estudio bíblico diario
- Mejorar su conocimiento de las Escrituras de forma progresiva
- Aplicar principios bíblicos a su vida diaria
- Conectar con una comunidad de creyentes
- Crecer espiritualmente de manera constante y medible

---

## 🏗️ Arquitectura y Estructura Completa

### 1. SISTEMA DE CONTENIDO

#### 1.1 Organización Bíblica

**Estructura jerárquica completa:**
```
Testamento (Antiguo/Nuevo)
  └─ Libro (66 libros totales)
      └─ Unidad (agrupación de capítulos)
          └─ Lección (5-10 minutos cada una)
              └─ Ejercicios (5-7 por lección)
```

**66 Libros de la Biblia divididos en:**

**Antiguo Testamento (39 libros):**
- Pentateuco (5): Génesis, Éxodo, Levítico, Números, Deuteronomio
- Históricos (12): Josué, Jueces, Rut, 1 Samuel, 2 Samuel, 1 Reyes, 2 Reyes, 1 Crónicas, 2 Crónicas, Esdras, Nehemías, Ester
- Poéticos (5): Job, Salmos, Proverbios, Eclesiastés, Cantares
- Profetas Mayores (5): Isaías, Jeremías, Lamentaciones, Ezequiel, Daniel
- Profetas Menores (12): Oseas, Joel, Amós, Abdías, Jonás, Miqueas, Nahúm, Habacuc, Sofonías, Hageo, Zacarías, Malaquías

**Nuevo Testamento (27 libros):**
- Evangelios (4): Mateo, Marcos, Lucas, Juan
- Histórico (1): Hechos
- Epístolas Paulinas (13): Romanos, 1 Corintios, 2 Corintios, Gálatas, Efesios, Filipenses, Colosenses, 1 Tesalonicenses, 2 Tesalonicenses, 1 Timoteo, 2 Timoteo, Tito, Filemón
- Epístolas Generales (8): Hebreos, Santiago, 1 Pedro, 2 Pedro, 1 Juan, 2 Juan, 3 Juan, Judas
- Profético (1): Apocalipsis

#### 1.2 Tipos de Lecciones Interactivas

**Lecciones Narrativas:**
- Historias y eventos bíblicos principales
- Contexto histórico y cultural
- Personajes principales y secundarios
- Línea de tiempo de eventos

**Lecciones de Personajes:**
- Abraham, Isaac, Jacob, José
- Moisés, Josué, Gedeón, Sansón
- Saúl, David, Salomón
- Elías, Eliseo, Isaías, Jeremías, Daniel
- Pedro, Pablo, Juan
- Mujeres de la Biblia: Eva, Sara, Rut, Ester, María, etc.

**Lecciones Temáticas:**
- Fe y confianza en Dios
- Amor y compasión
- Perdón y reconciliación
- Oración y adoración
- Santidad y obediencia
- Justicia y misericordia
- Esperanza y perseverancia
- Familia y relaciones
- Trabajo y mayordomía
- Sufrimiento y pruebas

**Lecciones de Versículos Clave:**
- Memorización de pasajes importantes
- Juan 3:16, Romanos 8:28, Filipenses 4:13
- Salmos 23, 91, 103
- Proverbios seleccionados
- Las Bienaventuranzas (Mateo 5)
- El Padre Nuestro (Mateo 6)

**Lecciones Doctrinales:**
- La Trinidad
- La salvación por gracia
- El Espíritu Santo
- La iglesia y el cuerpo de Cristo
- El bautismo y la cena del Señor
- La segunda venida de Cristo
- El cielo y la eternidad

**Lecciones de Aplicación:**
- Cómo vivir los principios bíblicos hoy
- Toma de decisiones según la Biblia
- Resolución de conflictos
- Relaciones saludables
- Finanzas y generosidad
- Trabajo y vocación
- Tiempo y prioridades

#### 1.3 Rutas de Aprendizaje Planificadas

**Ruta Cronológica:**
- Sigue el orden bíblico tradicional
- Desde Génesis hasta Apocalipsis
- Ideal para lectura completa sistemática

**Ruta Temática:**
- Salvación y Redención (20 lecciones)
- El Amor de Dios (10 lecciones)
- La Oración (8 lecciones)
- Fe y Confianza (12 lecciones)
- El Espíritu Santo (12 lecciones)
- Santidad y Obediencia (15 lecciones)
- Promesas de Dios (18 lecciones)
- Perdón y Restauración (10 lecciones)

**Ruta de Personajes:**
- Patriarcas: Abraham, Isaac, Jacob, José (4 lecciones)
- Libertadores: Moisés, Josué, Gedeón, Sansón (4 lecciones)
- Reyes: Saúl, David, Salomón (3 lecciones)
- Profetas: Elías, Eliseo, Isaías, Jeremías, Daniel (5 lecciones)
- Apóstoles: Pedro, Pablo, Juan (3 lecciones)
- Mujeres de Fe: Sara, Rut, Ester, María, etc. (8 lecciones)

**Ruta para Nuevos Creyentes:**
- Lo esencial de la fe cristiana (15 lecciones)
- ¿Quién es Dios? (3 lecciones)
- ¿Quién es Jesús? (5 lecciones)
- ¿Qué es la salvación? (3 lecciones)
- La vida cristiana (4 lecciones)

**Ruta del Evangelio:**
- Enfocada en los 4 evangelios
- Vida de Jesús cronológica (30 lecciones)
- Milagros de Jesús (15 lecciones)
- Parábolas de Jesús (20 lecciones)
- Enseñanzas de Jesús (25 lecciones)

**Rutas Especiales:**
- Los Salmos (30 lecciones, 1 por día)
- Proverbios (31 lecciones, 1 por día del mes)
- Profecías Mesiánicas (20 lecciones)
- Los Diez Mandamientos (10 lecciones)
- El Sermón del Monte (8 lecciones)

---

### 2. TIPOS DE EJERCICIOS INTERACTIVOS

#### 2.1 Ejercicios de Comprensión

**Completar Versículos:**
- Llenar palabras o frases faltantes
- Ejemplo: "Porque de tal manera amó Dios al ___, que ha dado a su Hijo..."
- Dificultad variable: 1 palabra, 2-3 palabras, frase completa

**Ordenar Palabras:**
- Reconstruir versículos con palabras mezcladas
- Versículos cortos (5-8 palabras) a largos (15-20 palabras)
- Drag & drop o selección en orden

**Selección Múltiple:**
- Preguntas sobre contenido con 4 opciones
- Sobre eventos, personajes, lugares, enseñanzas
- Dificultad escalable

**Verdadero/Falso:**
- Verificar conocimiento de hechos bíblicos
- Con explicación de por qué es V/F
- Referencias bíblicas incluidas

**Relacionar/Emparejar:**
- Conectar personajes con eventos
- Conectar lugares con historias
- Conectar versículos con referencias
- Conectar conceptos con definiciones

**Respuesta Corta:**
- Escribir respuestas breves (1-3 palabras)
- Sin opciones, del conocimiento propio
- Validación flexible (sinónimos aceptados)

#### 2.2 Ejercicios de Memorización

**Tarjetas de Memoria (Flashcards):**
- Versículos clave para memorizar
- Sistema de repetición espaciada
- Progreso de memorización trackeable

**Recitación:**
- Completar versículos de memoria
- Sin opciones, escribir de memoria
- Pistas disponibles (costo en gemas)

**Referencias Bíblicas:**
- Asociar versículos con sus citas
- Ejemplo: "Porque de tal manera..." → Juan 3:16
- O viceversa: Juan 3:16 → seleccionar el texto correcto

**Contrarreloj:**
- Memorizar versículo en tiempo limitado
- Después recitar sin ver
- Puntos extra por velocidad

#### 2.3 Ejercicios Multimedia

**Audio:**
- Escuchar y transcribir versículos
- Práctica de pronunciación
- Útil para aprender mientras conduces

**Visual:**
- Identificar escenas bíblicas en ilustraciones
- Mapas interactivos de viajes bíblicos
- Infografías de eventos cronológicos

**Video (opcional, fase futura):**
- Micro-videos explicativos (1-2 min)
- Animaciones de historias bíblicas
- Contexto histórico visual

**Mapas Interactivos:**
- Ubicar lugares bíblicos en mapas
- Viajes de Pablo, éxodo de Egipto
- Geografía de Israel en tiempos bíblicos

#### 2.4 Ejercicios de Aplicación

**Reflexión Personal:**
- Aplicar enseñanzas a situaciones modernas
- Preguntas abiertas de reflexión
- Journal/notas opcionales

**Escenarios:**
- Elegir respuestas basadas en principios bíblicos
- Situaciones de la vida real
- Múltiples caminos, todas basadas en sabiduría bíblica

**Interpretación:**
- Explicar el significado de pasajes
- ¿Qué significa esto para ti hoy?
- Compartir insights (opcional, social)

**Casos de Estudio:**
- Resolver dilemas con sabiduría bíblica
- Aplicar versículos específicos a problemas
- Decisiones éticas y morales

---

### 3. SISTEMA DE GAMIFICACIÓN COMPLETO

#### 3.1 Sistema de Experiencia (XP) y Niveles

**Tabla de XP por Actividad:**

| Actividad | XP Base | Bonus Posibles | Total Máximo |
|-----------|---------|----------------|--------------|
| Leer 1 capítulo (Camino) | 20 XP | - | 20 XP |
| Leer 10 min continuo (Libre) | 10 XP | - | 10 XP |
| Completar lección | 50 XP | +25 XP (100% precisión) | 75 XP |
| Completar sección de lecciones | - | +100 XP | 100 XP |
| Completar ruta completa | - | +500 XP | 500 XP |
| Trivia diaria | 50 XP | +10 XP (10/10) | 60 XP |
| Completar meta del sistema | - | +25 XP | 25 XP |
| Completar meta personal | - | +50 XP | 50 XP |
| Crear nota vinculada | 5 XP | - | 5 XP |
| Marcar versículo favorito | 2 XP | - | 2 XP |
| Racha mantenida (diaria) | 10 XP | - | 10 XP |
| Login diario | 5 XP | - | 5 XP |
| Subir de nivel | - | +50 XP | 50 XP |

**Sistema de Niveles (30 niveles):**

| Nivel | XP Requerido | Título | Recompensa |
|-------|--------------|--------|------------|
| 1 | 0 | Novato | - |
| 2 | 100 | Aprendiz | +50 XP |
| 3 | 250 | Lector | +50 XP |
| 4 | 450 | Estudiante | +50 XP |
| 5 | 700 | Conocedor | +50 XP + Desbloqueo contenido |
| 6 | 1,000 | Devoto | +50 XP |
| 7 | 1,350 | Discípulo | +50 XP |
| 8 | 1,750 | Sabio | +50 XP |
| 9 | 2,200 | Maestro | +50 XP |
| 10 | 2,700 | Erudito | +100 XP + Desbloqueo especial |
| 11 | 3,250 | Predicador | +100 XP |
| 12 | 3,850 | Profeta | +100 XP |
| 13 | 4,500 | Apóstol | +100 XP |
| 14 | 5,200 | Evangelista | +100 XP |
| 15 | 5,950 | Pastor | +150 XP + Contenido premium |
| ... | ... | ... | ... |
| 30 | 25,000+ | Leyenda | +500 XP + Badge especial |

**Fórmula de cálculo:**
```
XP para nivel N = 100 * N + 50 * (N - 1)
```

#### 3.2 Sistema de Rachas (Streaks)

**Mecánica de Rachas:**
- Completa la meta del sistema (50 XP) = mantiene racha
- No completar = pierde racha (vuelve a 0)
- Tiene hasta las 23:59:59 para completar
- Bonus diario: +10 XP por racha activa

**Hitos de Racha y Recompensas:**

| Días Consecutivos | Insignia | Bonus XP | Recompensa Extra |
|-------------------|----------|----------|------------------|
| 3 días | "Comienzo Fiel" | +25 XP | - |
| 7 días | "Semana de Fe" | +50 XP | +20 gemas |
| 14 días | "Dos Semanas" | +100 XP | +30 gemas |
| 30 días | "Mes Devocional" | +200 XP | +50 gemas |
| 60 días | "Perseverante" | +350 XP | +75 gemas |
| 90 días | "Trimestre Fiel" | +500 XP | +100 gemas |
| 100 días | "Centurión" | +750 XP | +150 gemas + Badge especial |
| 180 días | "Medio Año" | +1000 XP | +200 gemas |
| 365 días | "Año de Bendición" | +2000 XP | +500 gemas + Badge oro |

**Protector de Racha:**
- Comprable con 25 gemas
- Permite fallar 1 día sin perder racha
- Se usa automáticamente si olvidas un día
- Máximo 2 por mes

**Recuperación de Racha:**
- Disponible dentro de las 24 horas siguientes
- Costo: 50 gemas
- Solo si racha era de 7+ días

#### 3.3 Sistema de Vidas (Hearts)

**Mecánica:**
- 5 vidas iniciales por lección
- Pierdes 1 vida por cada error
- Sin vidas = debes repetir lección desde inicio

**Regeneración:**
- 1 vida cada 4 horas (automático)
- Máximo 5 vidas

**Formas de obtener vidas:**
- Esperar regeneración (4 horas/vida)
- Comprar con 10 gemas (5 vidas)
- Ver anuncio (1 vida)
- Bonus por subir nivel (5 vidas)
- Premium = vidas ilimitadas

#### 3.4 Sistema de Gemas/Monedas

**Formas de Ganar Gemas:**

| Actividad | Gemas |
|-----------|-------|
| Completar lección | 5 gemas |
| Lección perfecta (100%) | 10 gemas |
| Completar sección | 25 gemas |
| Completar ruta completa | 100 gemas |
| Trivia diaria perfecta | 10 gemas |
| Desafío semanal | 100 gemas |
| Invitar amigo activo | 50 gemas |
| Login 7 días consecutivos | 20 gemas |
| Completar libro de la Biblia | 50 gemas |
| Subir de nivel | 15 gemas |
| Logros especiales | 50-200 gemas |

**Uso de Gemas:**

| Item | Costo |
|------|-------|
| 5 Vidas extra | 10 gemas |
| Protector de racha | 25 gemas |
| Recuperar racha | 50 gemas |
| Pista en ejercicio | 5 gemas |
| Desbloquear lección premium | 50-100 gemas |
| Avatar especial | 100 gemas |
| Tema visual premium | 150 gemas |
| Marco de perfil | 75 gemas |
| Efecto de partículas | 200 gemas |

**Paquetes de Gemas (IAP):**
- 100 gemas: $0.99 USD
- 500 gemas: $3.99 USD (ahorro 20%)
- 1,200 gemas: $7.99 USD (ahorro 33%)
- 3,000 gemas: $14.99 USD (ahorro 50%)

#### 3.5 Sistema de Insignias y Logros

**Categorías de Insignias:**

**Por Progreso:**
- "Primera Lección" - Completa tu primera lección
- "10 Lecciones" - Completa 10 lecciones
- "50 Lecciones" - Completa 50 lecciones
- "100 Lecciones" - Completa 100 lecciones
- "Libro Completo" - Una por cada libro (66 insignias)
- "Testamento Completo" - AT y NT (2 insignias)
- "Biblia Completa" - Leer toda la Biblia (insignia máxima)

**Por Rachas:**
- "Primer Día" - Completa tu primer día
- "3 Días" - Racha de 3 días
- "Semana de Fe" - 7 días consecutivos
- "Dos Semanas" - 14 días consecutivos
- "Mes Devocional" - 30 días consecutivos
- "Trimestre Fiel" - 90 días consecutivos
- "Centurión" - 100 días consecutivos
- "Medio Año" - 180 días consecutivos
- "Año de Bendición" - 365 días consecutivos

**Por Conocimiento (una por libro destacado):**
- "Maestro del Génesis"
- "Conocedor del Éxodo"
- "Experto en Salmos"
- "Sabio en Proverbios"
- "Profeta como Isaías"
- "Conocedor del Evangelio" (Mateo, Marcos, Lucas, Juan)
- "Seguidor de Pablo" (Romanos, Corintios, etc.)
- "Visionario" (Apocalipsis)

**Por Desempeño:**
- "Perfeccionista" - 10 lecciones con 100% precisión
- "Super Perfeccionista" - 50 lecciones perfectas
- "Maestro Perfecto" - 100 lecciones perfectas
- "Veloz" - Completar lección en menos de 5 minutos
- "Rayo" - Completar 5 lecciones en un día
- "Maratonista" - Completar 10 lecciones en un día
- "Memorizador" - Memorizar 50 versículos
- "Gran Memorizador" - Memorizar 100 versículos
- "Maestro de la Memoria" - Memorizar 500 versículos
- "Estudioso" - 100 ejercicios completados
- "Gran Estudioso" - 500 ejercicios
- "Erudito Total" - 1000 ejercicios

**Por Comunidad:**
- "Amigable" - Agregar 5 amigos
- "Popular" - Agregar 25 amigos
- "Mentor" - Invitar 5 amigos que completen 10 lecciones
- "Gran Mentor" - Invitar 10 amigos activos
- "Líder de Grupo" - Crear grupo de estudio
- "Gran Líder" - Grupo con 10+ miembros activos
- "Top 10 Local" - Estar en top 10 de tu ciudad
- "Top 100 Global" - Estar en top 100 mundial
- "Campeón Mensual" - #1 en ranking del mes

**Por Tiempo:**
- "Madrugador" - Estudiar antes de las 6 AM (10 veces)
- "Nocturno" - Estudiar después de las 10 PM (10 veces)
- "Dedicado" - 50 horas totales de estudio
- "Muy Dedicado" - 100 horas totales
- "Súper Dedicado" - 500 horas totales

**Especiales/Temáticas (por temporada):**
- "Espíritu Navideño" - Actividad durante diciembre
- "Resurrección" - Actividad durante Semana Santa
- "Año Nuevo, Nueva Vida" - Comenzar en enero
- "Pentecostés" - Completar estudio del Espíritu Santo
- "Día de Acción de Gracias" - Estudiar Salmos de gratitud

**Insignias Secretas:**
- "Curioso" - Explorar todas las secciones
- "Explorador" - Leer versículos de todos los libros
- "Consistente" - No fallar meta en 30 días seguidos
- "Generoso" - Compartir 50 versículos
- "Reflexivo" - Crear 25 notas
- "Easter Egg Hunter" - Encontrar contenidos ocultos

#### 3.6 Desafíos y Eventos

**Desafío Semanal:**
- Tema especial cada semana
- Ejemplo: "Semana del Amor" - leer pasajes sobre amor
- Recompensa: 100 gemas + XP bonus
- Se renueva cada lunes

**Temas Semanales (rotación):**
1. Semana del Amor
2. Semana de Fe
3. Semana de Oración
4. Semana de Esperanza
5. Semana de Perdón
6. Semana de Gratitud
7. Semana de Sabiduría
8. Semana de Servicio

**Eventos Mensuales:**
- Competencia entre todos los usuarios
- Tabla de clasificación especial del mes
- Premios: Top 10 reciben insignia especial + gemas

**Temporadas (cada 3 meses):**
- Tabla de clasificación que se reinicia
- Temas estacionales (Primavera, Verano, Otoño, Invierno)
- Recompensas exclusivas por temporada
- Top 100 recibe badge único de la temporada

**Desafíos de Grupo:**
- Grupos compiten por completar objetivos juntos
- Ejemplo: "Leer 100 capítulos como grupo esta semana"
- Recompensa compartida para todos los miembros

**Maratones Bíblicos:**
- Evento especial (fin de semana)
- "Lee lo más que puedas en 48 horas"
- XP doble durante el evento
- Ranking especial con premios

**Eventos Especiales:**
- Navidad: Completar lectura del nacimiento de Jesús
- Semana Santa: Ruta de la Pasión y Resurrección
- Pentecostés: Hechos 2 y estudio del Espíritu Santo
- Día de la Biblia: Eventos especiales en septiembre

---

### 4. SISTEMA DE PROGRESIÓN Y METAS

#### 4.1 Sistema Dual de Metas Diarias

**Meta del Sistema (Fija, No Editable):**
- 50 XP diarios obligatorios
- Completarla = mantiene racha
- Completarla = +25 XP bonus
- No completarla = pierde racha

**Meta Personal (Opcional, Editable):**
- Usuario la establece (ej: 100 XP, 150 XP, 200 XP)
- Es adicional a la meta del sistema
- Completarla = +50 XP bonus
- No completarla = no pasa nada (no afecta racha)
- Puede cambiarla cuando quiera

**Niveles de Meta Personal Sugeridos:**
- Casual: 75 XP/día (1-2 capítulos)
- Regular: 150 XP/día (3-4 capítulos o 1-2 lecciones)
- Serio: 200 XP/día (4-5 capítulos)
- Intensivo: 300 XP/día (6+ capítulos o 3-4 lecciones)
- Extremo: 500+ XP/día (maratón)

**Visualización en UI:**
```
🎯 META DEL DÍA

Meta BibliaQuest (Oficial):
████████████░░░░ 35/50 XP
¡Te faltan 15 XP! 💪

─────────────────────────

Tu Meta Personal:
██████░░░░░░░░░ 35/100 XP
¡Sigue así! 🔥
```

#### 4.2 Estadísticas Detalladas

**Panel de Estadísticas Personales:**
- Total de días activos
- Total de lecciones completadas
- Tiempo total estudiado (horas:minutos)
- Promedio diario (tiempo y XP)
- Precisión general (%)
- Mejor racha histórica
- Racha actual
- Libros completados / en progreso
- Versículos memorizados
- Insignias obtenidas
- Ranking actual (local/global)
- XP total ganado
- Nivel actual y progreso
- Gemas totales obtenidas

**Estadísticas por Libro:**
- Capítulos leídos / totales
- Porcentaje de completitud
- Tiempo total en el libro
- Promedio por capítulo
- XP ganados en el libro
- Fecha de inicio
- Fecha de finalización (si completó)

**Estadísticas por Ruta de Aprendizaje:**
- Lecciones completadas / totales
- Porcentaje de completitud
- Precisión promedio
- Tiempo total en la ruta
- XP ganados en la ruta
- Fecha de inicio
- Fecha de finalización (si completó)

#### 4.3 Gráficos y Visualizaciones

**Calendario de Actividad:**
- Estilo GitHub contributions
- Cada día con color según XP ganado
- Verde claro = 1-50 XP
- Verde medio = 51-100 XP
- Verde oscuro = 101-200 XP
- Verde intenso = 200+ XP
- Gris = día sin actividad

**Gráfico de XP:**
- Línea de tiempo semanal/mensual
- Muestra XP por día
- Promedio visible
- Metas marcadas

**Distribución de Estudio:**
- Gráfico de pastel (pie chart)
- % Antiguo Testamento vs Nuevo Testamento
- % por tipo de actividad (Lectura, Lecciones, Trivia)

**Progreso por Libro:**
- Barra horizontal por cada libro
- % de completitud visual
- Ordenado por testamento

**Evolución de Nivel:**
- Gráfico de línea en el tiempo
- Muestra cuándo subió cada nivel
- Proyección a siguiente nivel

**Heatmap de Horarios:**
- Muestra a qué horas sueles estudiar más
- Útil para optimizar recordatorios

#### 4.4 Sistema de Desbloqueo Progresivo

**En Lectura (Camino):**
- Desbloqueo estrictamente secuencial
- Debes completar capítulo actual para desbloquear siguiente
- Debes completar libro para desbloquear siguiente (opcional)
- Puedes elegir AT o NT para empezar

**En Lecciones:**
- Desbloqueo secuencial por ruta
- Algunas rutas requieren nivel mínimo
- Algunas rutas requieren completar otra ruta primero
- Contenido premium requiere gemas o suscripción

**Niveles de Desbloqueo:**
- Nivel 1: Todo el contenido básico
- Nivel 5: Rutas intermedias
- Nivel 10: Rutas avanzadas
- Nivel 15: Contenido premium selecto
- Nivel 20: Contenido experto
- Nivel 30: Todo desbloqueado

**Sistema de Llaves:**
- Algunas lecciones especiales requieren "llaves"
- Llaves se ganan con logros específicos
- Ejemplo: "Llave de Sabiduría" al completar Proverbios
- Desbloquea contenido especial relacionado

---

### 5. FUNCIONES SOCIALES Y COMUNIDAD

#### 5.1 Sistema de Amigos

**Agregar Amigos:**
- Por código único personal
- Por email
- Por contactos del teléfono
- Por redes sociales (Facebook, Google)
- Sugerencias de amigos cercanos (ubicación)

**Perfil de Amigo:**
- Ver su nivel y título
- Ver su racha actual
- Ver libros completados
- Ver insignias obtenidas
- Ver estadísticas públicas
- Comparar progreso

**Interacciones:**
- Enviar mensaje de ánimo (predefinidos)
- Compartir versículos favoritos
- Desafiar a competencias privadas
- Ver su actividad reciente

**Mensajes de Ánimo Predefinidos:**
- "¡Sigue así! 💪"
- "¡Increíble racha! 🔥"
- "Te estoy alcanzando 😄"
- "Orando por ti 🙏"
- "¡Gran progreso! ⭐"

#### 5.2 Tablas de Clasificación (Leaderboards)

**Tipos de Rankings:**

**Global:**
- Todos los usuarios del mundo
- Actualización en tiempo real
- Top 100 visible
- Tu posición siempre visible

**Por País:**
- Usuarios de tu país
- Top 50 visible

**Local (Ciudad):**
- Usuarios en tu ciudad (50km radio)
- Top 20 visible
- Fomenta comunidad local

**Amigos:**
- Solo tu círculo de amigos
- Todos visibles
- Competencia amistosa

**Iglesia/Grupo:**
- Rankings privados por grupo
- Administrador puede ver todos
- Miembros solo ven su posición y top 10

**Por Temporada (cada 3 meses):**
- Se reinicia cada temporada
- Recompensas exclusivas de temporada
- Top 100 recibe insignia única

**Criterios de Ranking:**
- Por XP total (ranking general)
- Por XP de la semana/mes
- Por racha actual
- Por capítulos leídos
- Por lecciones completadas
- Por precisión promedio

**Visualización:**
```
🏆 RANKING GLOBAL

🥇 María García - 15,230 XP
🥈 Pedro López - 14,890 XP  
🥉 TÚ - 12,450 XP (#3 de 50,127)
4️⃣ Ana Martínez - 12,100 XP
5️⃣ José Rodríguez - 11,850 XP
...
```

#### 5.3 Grupos de Estudio

**Crear Grupo:**
- Nombre del grupo
- Descripción
- Imagen/icono
- Privacidad (público/privado)
- Máximo de miembros (ilimitado o limitado)

**Tipos de Grupos:**
- Familia
- Amigos
- Célula/Grupo pequeño de iglesia
- Iglesia completa
- Escuela/Universidad
- Compañeros de trabajo
- Grupo temático (jóvenes, mujeres, hombres, etc.)

**Funcionalidades de Grupo:**

**Objetivos Grupales:**
- "Leer 100 capítulos como grupo esta semana"
- "Completar 50 lecciones entre todos"
- "Mantener racha grupal de 30 días"
- Progreso visible para todos

**Chat Grupal (opcional):**
- Mensajes entre miembros
- Compartir versículos
- Compartir notas
- Animar y orar unos por otros

**Estadísticas de Grupo:**
- XP total del grupo
- Promedio de XP por miembro
- Capítulos leídos totales
- Racha grupal
- Top 5 miembros del grupo

**Roles en Grupo:**
- Administrador (crea y gestiona)
- Moderador (ayuda a gestionar)
- Miembro regular

**Desafíos Internos:**
- Admin puede crear desafíos privados
- Ejemplo: "Esta semana lean Filipenses"
- Tracking de quién lo completó
- Reconocimiento dentro del grupo

**Eventos de Grupo:**
- Programar estudios bíblicos juntos
- Recordatorios de reuniones
- Compartir recursos

#### 5.4 Compartir en Redes Sociales

**Qué se Puede Compartir:**
- Logros e insignias desbloqueadas
- Racha actual
- Nuevo nivel alcanzado
- Capítulo o libro completado
- Versículos favoritos (con diseño bonito)
- Invitación a unirse a la app
- Progreso personal (screenshot)
- Desafíos completados

**Plataformas:**
- Facebook
- Instagram (imagen optimizada)
- Twitter
- WhatsApp
- Telegram
- Email

**Diseños Prediseñados:**
- Plantillas bonitas para versículos
- Gráficos de logros atractivos
- Imágenes de insignias con fondo
- Stats cards personalizadas

**Incentivos por Compartir:**
- +10 XP por compartir logro
- +50 gemas por cada amigo que se une vía tu link
- Insignia "Evangelizador" por invitar 10 amigos

---

### 6. CONTENIDO ADICIONAL Y FEATURES AVANZADAS

#### 6.1 Modo Devocional

**Lectura del Día:**
- Un versículo diario seleccionado
- Reflexión corta (2-3 párrafos)
- Pensamiento para meditar
- Notificación matutina

**Oración del Día:**
- Guía de oración relacionada al versículo del día
- Puntos de oración específicos
- Espacio para oración personal

**Reflexión Personal:**
- Journal/diario espiritual
- Espacio para escribir pensamientos
- Privado (solo el usuario lo ve)
- Exportable a PDF

**Tema del Mes:**
- Cada mes un tema diferente
- 30 devocionales relacionados
- Tracking de completitud
- Insignia al completar el mes

**Temas Mensuales (ejemplos):**
- Enero: Nuevos comienzos
- Febrero: El amor de Dios
- Marzo: Preparación espiritual (cuaresma)
- Abril: Resurrección y vida nueva
- Mayo: Familia y relaciones
- Junio: Servicio y generosidad
- Julio: Fe y confianza
- Agosto: Identidad en Cristo
- Septiembre: Sabiduría y discernimiento
- Octubre: Gratitud
- Noviembre: Adoración y alabanza
- Diciembre: El regalo de Jesús

#### 6.2 Biblioteca de Recursos

**Versiones de la Biblia:**
- Reina Valera 1960 (default)
- Nueva Versión Internacional (NVI)
- Traducción Lenguaje Actual (TLA)
- Dios Habla Hoy (DHH)
- Biblia de las Américas (LBLA)
- Reina Valera 1995
- Nueva Traducción Viviente (NTV)
- [Premium] Biblia de Jerusalén
- [Premium] Biblia Peshitta
- [Premium] Biblia Textual

**Diccionario Bíblico:**
- Definiciones de términos teológicos
- Explicación de nombres propios
- Contexto cultural de palabras
- Referencias cruzadas
- Pronunciación de nombres hebreos/griegos

**Mapas Interactivos:**
- Geografía de Israel antiguo
- Viajes de Abraham
- Éxodo de Egipto
- Conquista de Canaán
- Reino Unido (David/Salomón)
- Reinos divididos (Israel/Judá)
- Imperio Asirio y Babilonio
- Imperio Persa
- Imperio Griego
- Imperio Romano
- Viajes misioneros de Pablo (1, 2, 3)
- Viaje a Roma

**Línea de Tiempo:**
- Cronología de eventos bíblicos
- Desde Creación hasta Apocalipsis
- Interactiva y visual
- Filtros por período, personaje, tema
- Conexiones entre eventos

**Comentarios Bíblicos:**
- Explicaciones de pasajes complejos
- Contexto histórico
- Interpretaciones teológicas
- Referencias de eruditos
- [Premium] Comentarios detallados verso por verso

**Videos Explicativos:**
- Resúmenes de libros (5-10 min c/u)
- Series de BibleProject (con permiso)
- Contexto histórico visual
- Mapas animados
- [Premium] Curso completo de panorama bíblico

#### 6.3 Herramientas de Estudio Avanzadas

**Búsqueda de Versículos:**
- Por palabra clave
- Por referencia (libro cap:vers)
- Por tema (con tags)
- Por personaje
- Búsqueda avanzada (AND, OR, NOT)
- Búsqueda en versiones específicas
- Búsqueda en AT o NT solamente

**Marcadores y Favoritos:**
- Marcar versículos importantes
- Organizados por categorías
- Etiquetas personalizables
- Colores diferenciados
- Exportar lista de favoritos

**Notas Personales (sistema completo):**
- Agregar notas a versículos específicos
- Notas en capítulos
- Notas generales (journal)
- Vincular notas entre sí
- Tags y categorías
- Búsqueda en notas
- Exportar todas las notas (PDF, texto)
- [Premium] Notas de voz
- [Premium] Imágenes en notas

**Planes de Lectura Estructurados:**
- Plan de 90 días (NT)
- Plan de 180 días (Biblia completa)
- Plan de 1 año (Biblia completa con descansos)
- Plan cronológico (eventos en orden histórico)
- Plan temático (por temas específicos)
- Crear plan personalizado
- Tracking de progreso del plan
- Notificaciones de recordatorio

**Modo de Estudio Profundo:**
- Vista paralela (2 versiones lado a lado)
- Referencias cruzadas automáticas
- Concordancia fuerte (números Strong)
- Palabras originales (hebreo/griego)
- Herramientas de análisis léxico
- [Premium] Acceso a manuscritos originales

#### 6.4 Modo Offline

**Funcionalidad Offline:**
- Descargar libros completos para uso sin internet
- Descargar lecciones para uso offline
- Sincronización automática al conectarse
- Progreso guardado localmente primero
- Notificaciones funcionan offline
- Cache inteligente de contenido usado frecuentemente

**Gestión de Descargas:**
- Elegir qué libros descargar
- Ver espacio usado
- Eliminar descargas
- Actualizar contenido
- Auto-descarga de siguiente capítulo

**Sincronización:**
- Sync automática al conectar WiFi
- Opción de sync por datos móviles
- Indicador de contenido sin sincronizar
- Resolución de conflictos inteligente

#### 6.5 Personalización

**Temas Visuales:**
- Claro (default)
- Oscuro
- Sepia (para lectura prolongada)
- Alto contraste (accesibilidad)
- [Premium] Temas personalizados
- [Premium] Temas estacionales (navidad, pascua, etc.)

**Fuentes:**
- Sans-serif (Inter, Roboto) - moderna, limpia
- Serif (Merriweather, Georgia) - tradicional, lectura larga
- Dyslexic (OpenDyslexic) - accesibilidad
- Tamaños: Pequeño, Mediano, Grande, Muy Grande

**Avatares y Perfiles:**
- Subir foto personal
- Galería de avatares prediseñados (50+)
- [Premium] Avatares exclusivos
- Marcos de avatar especiales (ganados por logros)
- Efectos de partículas en avatar (premium)

**Configuración de Idioma:**
- Español (default)
- Inglés
- Portugués
- Francés
- [Futuro] Más idiomas según demanda

**Preferencias de Notificaciones:**
- Horario de recordatorio diario
- Alerta de racha en riesgo (on/off)
- Celebración de logros (on/off)
- Nuevos niveles (on/off)
- Desafíos y eventos (on/off)
- Actividad de amigos (on/off)
- Mensajes de grupo (on/off)
- Frecuencia de notificaciones

**Accesibilidad:**
- Tamaño de fuente ajustable
- Alto contraste
- Lector de pantalla compatible
- Navegación por teclado (tablets)
- Reducir animaciones
- Subtítulos en videos

---

### 7. SISTEMA DE MONETIZACIÓN

#### 7.1 Modelo Freemium

**Versión Gratuita (Completa pero con Limitaciones):**
- ✅ Acceso a todo el contenido base (66 libros)
- ✅ Todas las funciones de lectura (Camino y Libre)
- ✅ Sistema completo de XP, niveles y rachas
- ✅ Todas las rutas de aprendizaje básicas
- ✅ Trivia diaria
- ✅ Funciones sociales básicas
- ✅ 3 versiones de la Biblia (RV1960, NVI, TLA)
- ✅ Notas básicas (texto solamente)
- ⚠️ Anuncios no intrusivos (entre actividades, no durante lectura)
- ⚠️ Límite de 5 vidas (regeneran cada 4 horas)
- ⚠️ Máximo 3 grupos
- ⚠️ Descargas offline limitadas (5 libros)

**Versión Premium - BibliaQuest Pro ($4.99/mes o $39.99/año):**

**Beneficios Premium:**
- ❌ Sin anuncios (experiencia limpia)
- ❤️ Vidas ilimitadas (nunca te detienes)
- 💎 200 gemas gratis cada mes
- 📚 Acceso a todas las versiones de la Biblia (15+)
- 📖 Contenido exclusivo premium:
  - Rutas avanzadas especiales
  - Lecciones profundas de teología
  - Cursos estructurados (ej: "Doctrinas Cristianas", "Apologética")
  - Material de estudio de seminarios
- 🎨 Todos los temas visuales desbloqueados
- 👥 Crear grupos ilimitados
- 📥 Descargas offline ilimitadas
- 📊 Estadísticas avanzadas y analytics
- 🎯 Prioridad en soporte técnico
- 🏆 Insignias exclusivas de premium
- 📝 Notas avanzadas (voz, imágenes, organización avanzada)
- 💾 Backup automático en la nube
- 📱 Sincronización en múltiples dispositivos sin límite
- 🎁 Acceso anticipado a nuevas funciones
- 🌟 Badge "Premium" en perfil

**Precios por Región:**
- USA/Europa: $4.99/mes - $39.99/año
- Latinoamérica: $2.99/mes - $24.99/año (ajuste regional)
- Prueba gratuita: 14 días (sin tarjeta de crédito)

#### 7.2 Compras In-App (IAP) Opcionales

**Paquetes de Gemas:**
- 100 gemas: $0.99
- 500 gemas + 50 bonus: $3.99 (mejor valor)
- 1,200 gemas + 200 bonus: $7.99 (⭐ más popular)
- 3,000 gemas + 700 bonus: $14.99 (mejor ahorro)

**Items Especiales de Una Vez:**
- Protector de Racha Permanente: $9.99
  - Nunca pierdas tu racha por olvidar un día
  - Se activa automáticamente
  - 2 usos por mes
- Desbloqueo Permanente de Libro Específico: $1.99 c/u
  - Acceso a contenido premium de un libro
  - Comentarios detallados
  - Lecciones avanzadas del libro
- Curso Temático Premium: $2.99-$9.99 c/u
  - Cursos estructurados profesionales
  - Ejemplos: "Profecías Mesiánicas", "Teología Sistemática", "Apologética Cristiana"
  - Certificado digital al completar

**Bundles/Paquetes:**
- "Paquete de Inicio": $4.99
  - 500 gemas
  - Protector de racha por 1 mes
  - 10 vidas extra
  - 3 temas premium
- "Paquete de Estudiante Serio": $9.99
  - 1000 gemas
  - Desbloqueo de 3 cursos premium
  - 1 mes de Pro gratis
- "Paquete Anual": $49.99
  - Suscripción anual Pro
  - 2500 gemas bonus
  - Todos los cursos premium incluidos
  - Protector de racha permanente

#### 7.3 Modelo de Anuncios (Versión Gratuita)

**Estrategia de Anuncios No Intrusiva:**
- ❌ NUNCA anuncios durante la lectura
- ❌ NUNCA anuncios en medio de lecciones
- ✅ Banner pequeño en Home (no molesta)
- ✅ Anuncio interstitial después de completar 3-4 actividades
- ✅ Anuncios opcionales para beneficios:
  - Ver anuncio → ganar 1 vida
  - Ver anuncio → 5 gemas
  - Ver anuncio → desbloquear lección premium por 24h

**Frecuencia:**
- Máximo 3-4 anuncios por sesión
- Nunca más de 1 anuncio cada 10 minutos
- Usuario puede comprar "No Ads" por 7 días ($1.99) si molestan

**Tipos de Anuncios:**
- Banner ads (menos intrusivos)
- Interstitials (entre actividades)
- Rewarded videos (opcionales, para beneficios)
- Native ads (integrados en UI)

**Partners Publicitarios:**
- Google AdMob (principal)
- Facebook Audience Network (secundario)
- Unity Ads (para rewarded videos)

---

### 8. NOTIFICACIONES Y ENGAGEMENT

#### 8.1 Push Notifications Inteligentes

**Tipos de Notificaciones:**

**Recordatorio Diario:**
- Hora configurada por usuario
- Mensaje personalizado según estado:
  - "¡Buenos días! Tu versículo del día te espera ☀️"
  - "Es hora de tu estudio bíblico 📖"
  - "¡No olvides tu meta de hoy! 🎯"
  - "Tu racha de [X] días necesita atención 🔥"

**Racha en Riesgo:**
- Enviada 4 horas antes del deadline (8 PM si deadline es 12 AM)
- "⚠️ ¡Tu racha de 15 días está en riesgo!"
- "Te faltan 30 XP. Solo 10 minutos más 💪"
- Botón directo: [Completar ahora]

**Celebración de Logros:**
- "🎉 ¡Meta del sistema completada! +25 XP bonus"
- "🏆 ¡Nueva insignia desbloqueada: [Nombre]!"
- "⭐ ¡Nivel 8 alcanzado! Ahora eres un Sabio"
- "🔥 ¡7 días consecutivos! +50 XP bonus"

**Hitos Especiales:**
- "🎊 ¡100 capítulos leídos! Eres increíble"
- "📖 ¡Génesis completado! +100 XP + Insignia"
- "👑 ¡Primer lugar en tu grupo esta semana!"

**Actividad Social:**
- "[Amigo] te ha superado en el ranking 😮"
- "[Amigo] completó su meta de 30 días. ¡Felicítalo! 🎉"
- "Tu grupo necesita 20 XP más para el objetivo semanal"
- "3 amigos están estudiando ahora. ¡Únete! 👥"

**Eventos y Desafíos:**
- "🎯 Nuevo desafío semanal disponible: [Tema]"
- "🏆 Maratón Bíblico este fin de semana. XP x2"
- "✨ Evento especial de Navidad comenzó"

**Contenido Nuevo:**
- "📚 Nueva ruta disponible: [Nombre de ruta]"
- "🎬 Nuevo video: Resumen de Romanos"
- "📖 Nuevos devocionales del mes de [Mes]"

**Motivacionales (Ocasionales):**
- Versículo inspirador del día
- "Has leído [X] capítulos este mes 📈"
- "Estás en el top 10% de lectores 🌟"
- "Solo [X] capítulos para completar [Libro]"

#### 8.2 Notificaciones In-App

**Toasts (mensajes pequeños durante uso):**
```
╔════════════════════════╗
║ +20 XP                 ║
║ Capítulo leído ✓       ║
╚════════════════════════╝
```

**Alertas de Progreso:**
- "🎯 Meta del sistema completada. +25 XP bonus"
- "⏱️ +10 XP por 10 minutos de lectura"
- "🔥 Racha mantenida. +10 XP. 8 días"
- "💎 +5 gemas ganadas"

**Badges (insignias en iconos):**
- Número rojo en ícono de notificaciones
- Badge en tab de Perfil si nuevo logro
- Badge en Amigos si actividad nueva

#### 8.3 Engagement Strategies

**Recompensas Diarias (Login Streak):**
- Día 1: 5 gemas
- Día 2: 10 gemas
- Día 3: 15 gemas
- Día 4: 20 gemas
- Día 5: 25 gemas
- Día 6: 30 gemas
- Día 7: 50 gemas + Cofre sorpresa
- Reinicia o continúa con bonos

**Cofres Sorpresa (Día 7):**
- Contenido aleatorio:
  - 50-200 gemas
  - 1 vida extra permanente (hasta máx 10)
  - 1 tema premium
  - 1 avatar especial
  - XP bonus (100-500)

**Retos Personalizados:**
- Sistema identifica patrones del usuario
- Sugiere retos adaptados:
  - "Completa 3 días seguidos" (si suele fallar)
  - "Lee 5 capítulos esta semana" (si le gusta lectura)
  - "Completa 2 lecciones" (si prefiere lecciones)

**Sistema de Reengagement:**
- Si usuario inactivo 3 días → notificación suave
- Si inactivo 7 días → notificación con incentivo (50 gemas gratis)
- Si inactivo 14 días → email con versículo inspirador
- Si inactivo 30 días → última notificación con oferta especial

**Gamificación Social:**
- Mostrar actividad de amigos en Home
- "3 de tus amigos completaron su meta hoy"
- Sugerir competencias amistosas
- Highlights de logros de la comunidad

---

### 9. ONBOARDING Y EXPERIENCIA DE USUARIO

#### 9.1 Tutorial Interactivo (Primera Vez)

**Pantalla 1: Bienvenida**
```
🎉 ¡Bienvenido a BibliaQuest!

Aprende la Biblia de forma
divertida e interactiva

[Ilustración animada de libro y persona]

[COMENZAR] →
```

**Pantalla 2: Explicación Rápida**
```
📖 LEE
Avanza por la Biblia capítulo
a capítulo

🎓 APRENDE
Lecciones interactivas con
ejercicios divertidos

🏆 CRECE
Gana XP, sube niveles,
mantén rachas

[CONTINUAR] →
```

**Pantalla 3: Configuración Básica**
```
¿Cómo te llamas?
[Input: Nombre]

¿Cuánto sabes de la Biblia?
○ Principiante
● Intermedio
○ Avanzado

[CONTINUAR] →
```

**Pantalla 4: Meta Diaria**
```
🎯 TU META DIARIA

Debes ganar 50 XP cada día
para mantener tu racha 🔥

¿Quieres establecer una meta
personal adicional?

[75 XP]  [150 XP]  [200 XP]
   ○        ●         ○

[Lo decido después]

[CONTINUAR] →
```

**Pantalla 5: Notificaciones**
```
📱 RECORDATORIOS

¿A qué hora quieres estudiar?

[Selector de hora: 8:00 PM]

☑ Recibir recordatorios diarios
☑ Alertas de racha en riesgo

[CONTINUAR] →
```

**Pantalla 6: Primera Actividad Guiada**
```
✨ ¡Perfecto! Hagamos tu
primera lectura juntos

Vamos a leer Génesis 1

[Botón grande: COMENZAR] →

[Saltar tutorial] (pequeño abajo)
```

**Durante Primera Lectura:**
- Tooltips explicando cada elemento
- "Aquí está el texto del capítulo"
- "Desliza hacia abajo para leer"
- "Cuando termines, presiona aquí"
- [Al terminar] "¡Excelente! +20 XP ganados"

**Pantalla Final de Onboarding:**
```
🎊 ¡FELICIDADES!

Completaste tu primer capítulo

20 XP ganados
Racha: 1 día 🔥
Nivel 1 - Novato

¿Listo para continuar?

[IR AL HOME] →
[Explorar más]
```

#### 9.2 Primeros Pasos (Misiones de Inicio)

**Lista de Tareas para Nuevos Usuarios:**

```
✅ MISIONES DE INICIO

□ Completa tu primera lectura
  Recompensa: +50 XP

□ Completa tu perfil
  Recompensa: +25 XP

□ Personaliza tu avatar
  Recompensa: +10 XP

□ Lee 3 capítulos
  Recompensa: +75 XP

□ Completa tu primera lección
  Recompensa: +100 XP

□ Alcanza tu meta diaria
  Recompensa: +75 XP + 20 gemas

□ Mantén racha de 3 días
  Recompensa: +100 XP + Insignia

□ Agrega tu primer amigo
  Recompensa: +50 XP + 10 gemas

□ Completa una unidad
  Recompensa: +100 XP + 25 gemas

□ Sube al nivel 2
  Recompensa: +50 XP bonus
```

**Progreso de Misiones:**
- Visible en Home (widget pequeño)
- Notificación al completar cada una
- Recompensas instantáneas
- Badge especial: "Buen Comienzo" al completar todas

#### 9.3 Personalización Inicial Extendida

Después del onboarding básico, el usuario puede:

**Elegir Versión de la Biblia Preferida:**
- RV1960 (más tradicional)
- NVI (moderna, fácil lectura)
- TLA (lenguaje actual, jóvenes)

**Establecer Preferencias:**
- Tema visual (claro/oscuro/sepia)
- Tamaño de fuente
- Recordatorios adicionales

**Seleccionar Intereses:**
- ¿Qué temas te interesan más?
  - ☑ Fe y confianza
  - ☑ Oración
  - ☐ Profecías
  - ☑ Vida de Jesús
  - ☐ Historias del AT
- Usamos esto para sugerencias personalizadas

---

### 10. ARQUITECTURA TÉCNICA

#### 10.1 Stack Tecnológico

**Frontend:**
```
- React Native (Framework principal)
- Expo (Plataforma de desarrollo)
- TypeScript (Type safety)
- React Navigation 6 (Navegación)
- Zustand o Redux Toolkit (Estado global)
- React Query (Data fetching y cache)
- Reanimated 3 (Animaciones)
- NativeWind o Styled Components (Estilos)
```

**Backend:**
```
- Firebase o Supabase
  * Authentication
  * Firestore/PostgreSQL (Base de datos)
  * Cloud Functions (Lógica serverless)
  * Cloud Storage (Imágenes, audio, assets)
  * Analytics
  * Push Notifications (FCM)
```

**Librerías Adicionales:**
```
- Expo Notifications (Notificaciones locales y push)
- AsyncStorage (Almacenamiento local)
- NetInfo (Detectar conexión)
- Expo SQLite (Modo offline avanzado)
- RevenueCat (Gestión de suscripciones IAP)
- Sentry (Error tracking y monitoring)
- date-fns (Manejo de fechas)
- react-hook-form (Formularios)
```

#### 10.2 Estructura de Base de Datos (Firestore)

**Colecciones Principales:**

```javascript
// ========== users ==========
users/{userId} {
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  
  // Progreso
  totalXP: number,
  currentLevel: number,
  xpForNextLevel: number,
  
  // Metas
  systemDailyGoal: 50,
  personalDailyGoal: number | null,
  
  // Rachas
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string,
  
  // Estadísticas
  stats: {
    totalTimeReading: number,
    chaptersReadInPath: number,
    chaptersReadFree: number,
    lessonsCompleted: number,
    triviasCompleted: number,
    booksStarted: number,
    booksCompleted: number,
    versesMemorized: number,
    notesCreated: number,
    friendsCount: number,
  },
  
  // Configuración
  settings: {
    notificationsEnabled: boolean,
    notificationTime: string,
    bibleVersion: string,
    fontSize: string,
    theme: string,
    language: string,
  },
  
  // Premium
  isPremium: boolean,
  premiumExpiry: timestamp | null,
  
  // Gemas
  gems: number,
  
  // Inventario
  inventory: {
    streakProtectors: number,
    extraLives: number,
    unlockedThemes: string[],
    unlockedAvatars: string[],
  }
}

// ========== dailyProgress ==========
dailyProgress/{userId}_{date} {
  userId: string,
  date: string,
  xpEarned: number,
  systemGoalCompleted: boolean,
  personalGoalCompleted: boolean,
  
  activities: [
    {
      type: "chapter_read" | "lesson" | "trivia" | "free_reading",
      xp: number,
      timestamp: timestamp,
      metadata: object
    }
  ],
  
  chaptersRead: number,
  lessonsCompleted: number,
  triviaCompleted: boolean,
  minutesRead: number,
  
  createdAt: timestamp,
  updatedAt: timestamp
}

// ========== readingProgress ==========
readingProgress/{userId}_{bookId} {
  userId: string,
  bookId: string,
  bookName: string,
  
  totalChapters: number,
  chaptersCompleted: number,
  percentComplete: number,
  
  completedChapters: number[],
  lastChapterRead: number,
  lastReadAt: timestamp,
  
  status: "not_started" | "in_progress" | "completed",
  completedAt: timestamp | null,
  
  totalTimeReading: number,
  totalXPEarned: number,
  
  createdAt: timestamp,
  updatedAt: timestamp
}

// ========== chapterReads ==========
chapterReads/{userId}_{bookId}_{chapter} {
  userId: string,
  bookId: string,
  chapter: number,
  
  readType: "path" | "free",
  readAt: timestamp,
  xpEarned: number | null,
  timeSpent: number | null,
}

// ========== lessonProgress ==========
lessonProgress/{userId}_{routeId}_{lessonId} {
  userId: string,
  routeId: string,
  lessonId: string,
  
  completed: boolean,
  completedAt: timestamp,
  
  score: number,
  accuracy: number,
  attempts: number,
  timeSpent: number,
  
  exercisesCompleted: number,
  exercisesTotal: number,
  
  xpEarned: number,
}

// ========== achievements ==========
userAchievements/{userId} {
  userId: string,
  achievements: [
    {
      id: string,
      unlockedAt: timestamp,
      seen: boolean
    }
  ]
}

// ========== friends ==========
friends/{userId} {
  userId: string,
  friendsList: [
    {
      friendId: string,
      friendUsername: string,
      friendAvatar: string,
      addedAt: timestamp
    }
  ]
}

// ========== groups ==========
groups/{groupId} {
  id: string,
  name: string,
  description: string,
  imageURL: string,
  
  adminId: string,
  moderators: string[],
  members: string[],
  
  privacy: "public" | "private",
  maxMembers: number | null,
  
  totalXP: number,
  groupGoals: [
    {
      type: string,
      target: number,
      current: number,
      deadline: timestamp
    }
  ],
  
  createdAt: timestamp,
  updatedAt: timestamp
}

// ========== notes ==========
notes/{noteId} {
  id: string,
  userId: string,
  
  type: "reading" | "lesson" | "devotional" | "personal",
  title: string,
  content: string,
  
  linkedVerses: [
    {
      bookId: string,
      chapter: number,
      verse: number,
      text: string
    }
  ],
  
  tags: string[],
  isFavorite: boolean,
  color: string,
  
  createdAt: timestamp,
  updatedAt: timestamp
}

// ========== bibleContent ========== (Pre-poblado)
bibleContent/{bookId} {
  id: string,
  name: string,
  testament: "old" | "new",
  order: number,
  category: string,
  
  totalChapters: number,
  totalVerses: number,
  
  chapters: [
    {
      number: number,
      verses: [
        {
          number: number,
          text: string,
          textRV1960: string,
          textNVI: string,
          textTLA: string,
        }
      ]
    }
  ]
}

// ========== learningRoutes ========== (Pre-poblado)
learningRoutes/{routeId} {
  id: string,
  name: string,
  description: string,
  imageURL: string,
  
  category: "theme" | "character" | "story" | "beginner",
  difficulty: "beginner" | "intermediate" | "advanced",
  
  totalLessons: number,
  estimatedTime: number,
  
  isPremium: boolean,
  requiredLevel: number,
  
  sections: [
    {
      id: string,
      title: string,
      lessons: [lessonId]
    }
  ]
}

// ========== lessons ========== (Pre-poblado)
lessons/{lessonId} {
  id: string,
  routeId: string,
  title: string,
  description: string,
  
  order: number,
  duration: number,
  xpReward: number,
  gemsReward: number,
  
  isPremium: boolean,
  
  exercises: [
    {
      id: string,
      type: "complete" | "order" | "multiple" | "match" | "audio" | "reflection",
      question: string,
      correctAnswer: string | string[],
      options: string[],
      explanation: string,
      verse: {
        bookId: string,
        chapter: number,
        verse: number,
        text: string
      },
      order: number
    }
  ]
}

// ========== trivias ========== (Pre-poblado)
dailyTrivias/{date} {
  date: string,
  questions: [
    {
      id: string,
      question: string,
      options: string[],
      correctAnswer: string,
      explanation: string,
      difficulty: "easy" | "medium" | "hard",
      category: string,
      reference: {
        bookId: string,
        chapter: number,
        verse: number
      }
    }
  ]
}

// ========== levels ========== (Pre-poblado)
levels/{levelNumber} {
  level: number,
  xpRequired: number,
  title: string,
  rewardXP: number,
  rewardGems: number,
  unlocks: string[]
}

// ========== achievements ========== (Pre-poblado)
achievementDefinitions/{achievementId} {
  id: string,
  title: string,
  description: string,
  icon: string,
  category: string,
  xpReward: number,
  gemsReward: number,
  
  requirement: {
    type: string,
    value: number,
    ...
  },
  
  isSecret: boolean,
  isPremium: boolean
}
```

#### 10.3 APIs y Servicios Externos

**Contenido Bíblico:**
- API.Bible (principal)
- Bible Gateway API (backup)
- Contenido pre-descargado en JSON (offline)

**Notificaciones:**
- Firebase Cloud Messaging (push notifications)
- Expo Notifications (local notifications)

**Analytics:**
- Firebase Analytics
- Mixpanel (eventos custom)

**Error Tracking:**
- Sentry

**Pagos:**
- RevenueCat (gestión unificada IAP)
- Stripe (suscripciones web, futuro)

**Almacenamiento:**
- Firebase Storage (imágenes, audio, assets)
- Cloudinary (optimización de imágenes)

**Email:**
- SendGrid (emails transaccionales)
- Mailchimp (newsletters opcionales)

---

## 11. MÉTRICAS DE ÉXITO (KPIs)

### Métricas de Usuario:
- DAU (Daily Active Users)
- MAU (Monthly Active Users)
- Tasa de retención D1, D7, D30
- Session duration
- Sessions per user
- New user registrations

### Métricas de Engagement:
- Lecciones completadas por día
- Capítulos leídos por día
- Tasa de finalización de lecciones
- % usuarios con racha activa (7+ días)
- % usuarios que alcanzan meta diaria
- Tiempo promedio en app
- % usuarios que regresan al día siguiente

### Métricas de Progreso:
- Libros completados promedio por usuario
- Niveles promedio alcanzados
- XP promedio por usuario
- Rachas promedio
- % usuarios nivel 5+
- % usuarios nivel 10+

### Métricas de Monetización:
- Conversion rate (free → premium)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)
- Churn rate (tasa de cancelación premium)
- IAP revenue
- Ad revenue (versión free)

### Métricas de Contenido:
- Libros más populares
- Rutas más completadas
- Tipos de ejercicios con mejor engagement
- Tasa de error promedio por tipo
- Lecciones con mayor abandono
- Versículos más marcados como favoritos

### Métricas Sociales:
- Usuarios con amigos activos (%)
- Usuarios en grupos (%)
- Shares en redes sociales
- Invitaciones enviadas
- Tasa de conversión de invitaciones

---

## 12. DIFERENCIADORES CLAVE

### ¿Por qué BibliaQuest es único?

1. **Gamificación Real y Efectiva**
   - No es solo leer, es interactuar activamente
   - Sistema de recompensas psicológicamente diseñado
   - Motivación intrínseca y extrínseca balanceadas

2. **Formación de Hábitos Científica**
   - Sistema de rachas comprobado (Duolingo style)
   - Recordatorios inteligentes personalizados
   - Meta diaria adaptable

3. **Aprendizaje Progresivo Estructurado**
   - Dificultad adaptativa según desempeño
   - Contenido desbloqueado secuencialmente
   - Rutas de aprendizaje variadas

4. **Multi-Formato y Multi-Sensorial**
   - Combina lectura, audio, visual, práctica
   - Se adapta a diferentes estilos de aprendizaje
   - Contenido interactivo vs pasivo

5. **Comunidad y Elemento Social**
   - Estudiar con amigos motiva más que solo
   - Competencia amistosa sana
   - Grupos de estudio virtuales

6. **Accesible para Todos**
   - Lecciones cortas (5-10 min) para personas ocupadas
   - Contenido para principiantes hasta expertos
   - Múltiples versiones de la Biblia

7. **Método Científico de Memorización**
   - Repetición espaciada integrada
   - Múltiples formas de repasar mismo contenido
   - Tracking de versículos memorizados

8. **Enfoque Práctico, No Solo Teórico**
   - Aplicación a la vida real
   - Reflexiones personales
   - Escenarios modernos

9. **Transparencia en Progreso**
   - Estadísticas detalladas
   - Visualización de crecimiento
   - Sensación de logro constante

10. **Multiplataforma y Siempre Disponible**
    - iOS y Android
    - Modo offline completo
    - Sincronización en la nube

---

## 13. VISIÓN A LARGO PLAZO

### Fase 1 (Año 1): Establecimiento
- Lanzar MVP con funciones core
- Alcanzar 10,000 usuarios activos
- Iterar según feedback
- Estabilizar producto

### Fase 2 (Año 2): Crecimiento
- Agregar todas las rutas de aprendizaje
- Implementar funciones sociales completas
- Expandir a más idiomas (inglés, portugués)
- 100,000 usuarios activos

### Fase 3 (Año 3): Expansión
- Versión web (PWA)
- Integración con iglesias y ministerios
- API para desarrolladores
- Planes de lectura personalizados con IA
- 1,000,000 usuarios activos

### Fase 4 (Año 4+): Ecosistema
- Plataforma de cursos completos
- Certificaciones en estudios bíblicos
- Contenido de seminarios y universidades
- App para niños (BibliaQuest Kids)
- Comunidad global masiva

---

## 14. IMPACTO ESPERADO

### Impacto Espiritual:
- Millones de personas leyendo la Biblia regularmente
- Conocimiento bíblico mejorado globalmente
- Hábito de estudio bíblico arraigado
- Crecimiento espiritual medible

### Impacto Social:
- Comunidades de fe más conectadas
- Grupos de estudio facilitados
- Familias estudiando juntas
- Generaciones jóvenes enganchadas con la Biblia

### Impacto Educativo:
- Método de enseñanza bíblica moderno
- Accesibilidad para todos los niveles
- Recursos de calidad democratizados
- Alternativa a métodos tradicionales aburridos

---

## 15. RIESGOS Y MITIGACIÓN

### Riesgos Identificados:

**Técnicos:**
- Bugs en lanzamiento → Testing exhaustivo, beta cerrada
- Problemas de escalabilidad → Arquitectura cloud nativa
- Pérdida de datos → Backups automáticos, redundancia

**De Negocio:**
- Baja adopción inicial → Marketing pre-lanzamiento, evangelistas
- Churn alto → Engagement loops, notificaciones, contenido constante
- Competencia → Diferenciación clara, features únicas

**De Contenido:**
- Errores teológicos → Revisión por expertos teólogos
- Contenido ofensivo → Moderación, reportes
- Copyright de versiones → Uso de versiones públicas

**Financieros:**
- No alcanzar break-even → Plan freemium, múltiples revenue streams
- Dependencia de ads → Modelo premium atractivo

**Reputacionales:**
- Críticas de sectores religiosos → Diálogo abierto, transparencia
- Mal uso de la plataforma → Términos claros, moderación

---

## CONCLUSIÓN

BibliaQuest representa una innovación significativa en la forma en que las personas pueden interactuar con la Biblia en la era digital. Al combinar principios probados de gamificación, psicología del hábito, y tecnología moderna, creamos una experiencia que es tanto efectiva como disfrutable.

El proyecto está diseñado para crecer orgánicamente desde un MVP funcional hasta un ecosistema completo de aprendizaje bíblico, manteniendo siempre el enfoque en:
- ✅ Experiencia de usuario excepcional
- ✅ Contenido de calidad teológica
- ✅ Formación de hábitos duraderos
- ✅ Comunidad y conexión
- ✅ Accesibilidad para todos

Con un modelo de negocio sostenible, métricas claras de éxito, y una visión a largo plazo definida, BibliaQuest está posicionada para convertirse en la aplicación líder mundial de estudio bíblico gamificado.

---

**Fecha de Documento:** Octubre 2025  
**Versión:** 1.0  
**Estado:** Plan General Completo

---
