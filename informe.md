# EcoTrack – Plataforma de Gamificación Ambiental y Compromiso Sostenible

**Integrantes:**
*   Freddy Guaman
*   Manuel Pacheco
*   Franco Quezada

---

## 1. Identificación de la Problemática Abordada
EcoTrack aborda la **falta de compromiso y motivación constante** en la adopción de hábitos sostenibles, enfocándose en los siguientes puntos críticos:
*   **Aburrimiento y Monotonía:** La sostenibilidad suele percibirse como una serie de restricciones tediosas sin recompensa inmediata.
*   **Falta de Constancia:** Los usuarios tienden a abandonar sus hábitos ecológicos por falta de seguimiento y estímulos externos.
*   **Aislamiento Social:** La conciencia ambiental se vive individualmente, perdiendo el motor de motivación que genera la pertenencia a una comunidad con objetivos comunes.
*   **Falta de Guía Diaria:** El usuario promedio sabe que "debe ayudar", pero no tiene recordatorios o sugerencias prácticas para aplicar día a día.

---

## 2. Necesidad Resuelta y Enfoque en los ODS
La plataforma se posiciona como un ecosistema de **motivación diaria**, resolviendo necesidades específicas alineadas con los ODS:

*   **Necesidad Concreta:** Transformar la acción ambiental de una carga a un juego (gamificación), proporcionando metas diarias y reconocimiento social.
*   **ODS 13 (Acción por el Clima):** Moviliza a los usuarios mediante retos prácticos que impactan directamente en la reducción de residuos y ahorro energético.
*   **ODS 12 (Producción y Consumo Responsables):** A través de misiones diarias, se educa sobre el consumo consciente y la gestión de desechos.
*   **ODS 4 (Educación de Calidad):** Provee una fuente constante de conocimiento práctico mediante "Consejos Diarios" (Daily Tips) y educación proactiva.
*   **ODS 17 (Alianzas):** Construye una red social donde el impacto se visualiza colectivamente, fortaleciendo el tejido social orientado a la sostenibilidad.

---

## 3. Defensa Técnica del Proyecto
EcoTrack se fundamenta en un stack tecnológico de alto rendimiento seleccionado para soportar mecánicas de tiempo real y alta interactividad.

*   **Motor de Gamificación en Tiempo Real:**
    *   **Frontend (React + TS):** Uso de **TanStack Query** para la sincronización inmediata del estado (XP, Niveles, Misiones) sin necesidad de recargar la página.
    *   **Arquitectura de UI:** Implementación de **Chakra UI** y **Framer Motion** para crear micro-animaciones que refuerzan la sensación de "logro" al completar retos.
*   **Infraestructura y Backend de Escala:**
    *   **Backend (Node.js + Express):** Diseño modular de APIs enfocado en la gestión eficiente de rachas (streaks), puntos y rankings globales.
    *   **Supabase (PostgreSQL + Auth):** Gestión robusta de perfiles de usuario y persistencia de progresos mediante una base de datos relacional de nivel corporativo.
*   **Optimización de Carga:**
    *   **Code Splitting:** Uso de `lazy loading` y `Suspense` para garantizar que la plataforma sea rápida incluso en conexiones móviles, cargando solo los módulos necesarios (Misiones, Retos, Comunidad).
    *   **Middlewares de Eficiencia:** Implementación de compresión Gzip y ETags para minimizar el consumo de datos.

---

## 4. Funcionalidades del Ecosistema Actual
El proyecto se centra exclusivamente en la experiencia interactiva del usuario:
*   **Misiones Diarias y Retos:** Sistema de objetivos a corto plazo que premia al usuario con XP y puntos al completar acciones sostenibles certificadas.
*   **Sistema de Rachas (Streaks):** Mecánica de retención que incentiva la entrada diaria y la constancia en el compromiso ambiental.
*   **Ranking y Competitividad:** Leaderboard global que fomenta la competencia amistosa basada en el nivel de actividad y puntos acumulados.
*   **Comunidad y Feed Social:** Muro interactivo donde los usuarios comparten sus progresos, fotos y motivan a otros miembros.
*   **Consejos Inteligentes:** Módulo de "Eco-tips" diarios que ofrecen educación rápida y aplicable para el día a día.
*   **Perfil y Progresión:** Visualización clara de la evolución del usuario, subida de niveles y estadísticas de participación.

---

## 5. Conclusiones y Resultados
EcoTrack ha demostrado que la gamificación es el vehículo más efectivo para:
1.  **Aumentar la retención:** Los usuarios regresan diariamente para mantener sus rachas y completar misiones.
2.  **Educar de forma lúdica:** Se aprende sobre sostenibilidad sin necesidad de manuales complejos.
3.  **Fomentar la acción colectiva:** El feed social y el ranking crean una presión positiva que impulsa a mejores hábitos de forma natural y divertida.
