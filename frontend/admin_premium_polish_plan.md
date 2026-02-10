# 💎 Plan de Pulido Premium - Admin EcoTrack

Este plan detalla las mejoras estéticas y de usabilidad para elevar el panel administrativo a un nivel profesional y "state-of-the-art", utilizando únicamente los datos y la base de datos existente.

## 🛠 Fase 1: Componentes Base & Utilidades
Componentes reutilizables que se aplicarán en todos los módulos administrativos.

- [ ] **EmptyState Component**: Crear un componente para estados vacíos con iconos de `react-icons` y mensajes motivadores.
- [ ] **LiveStatus Component**: Implementar un indicador circular con animación "pulse" para elementos activos (usuarios, misiones, tips).
- [ ] **Tooltip System**: Asegurar que todos los botones de acción (`IconButton`) tengan Tooltips descriptivos.
- [ ] **Common Transitions**: Configurar variantes de animación con `framer-motion` para transiciones suaves de tablas y tarjetas.

## 👤 Fase 2: Módulo de Usuarios & Expediente
Mejorar la visualización de la información de los ciudadanos.

- [ ] **UserTable Enhancements**:
    - [ ] Añadir animación de entrada para filas.
    - [ ] Implementar `LiveStatus` en la columna de estado.
    - [ ] Tooltips en las acciones de gestión.
- [ ] **UserDetails Modal (Expediente)**:
    - [ ] **Timeline de Impacto**: Convertir la lista plana de `logs` en una línea de tiempo vertical visual.
    - [ ] **Progress Rings**: Sustituir indicadores numéricos en el expediente por anillos de progreso circular para el nivel y racha.

## 📊 Fase 3: Dashboard & Navegación Global
Mejorar la orientación y el acceso rápido.

- [ ] **Breadcrumbs**: Implementar migas de pan dinámicas en la `AdminNavbar` para mejorar la orientación.
- [ ] **Quick Action Cards**: Añadir una fila de accesos rápidos en el Dashboard (ej: "Nuevo Reto", "Gestionar Consejos").
- [ ] **Activity Pulse**: Añadir un indicador de "En Vivo" al panel de "Latido de Impacto".

## 🎯 Fase 4: Pulido de Módulos (Misiones, Retos, Niveles, Consejos)
Homogeneizar y dar el toque final.

- [ ] **Transiciones de Búsqueda**: Añadir animaciones de entrada/salida cuando se filtran elementos.
- [ ] **Skeleton Loaders**: Implementar carga mediante esqueletos para las tablas mientras se espera la respuesta de la API.
- [ ] **Consistent Action Bars**: Asegurar que todas las barras de filtros usen los nuevos estilos de inputs borderless y botones premium.

---

## 📅 Roadmap de Ejecución Sugerido

| Día | Tarea | Prioridad |
| :--- | :--- | :--- |
| 1 | Fase 1: Componentes de Base (EmptyStates, LiveStatus) | Alta |
| 1 | Fase 2: Mejoras en Tabla de Usuarios y Expediente | Alta |
| 2 | Fase 3: Navegación Global y Quick Actions | Media |
| 2 | Fase 4: Micro-animaciones y Skeletons en el resto de módulos | Media |

---
**Nota:** Todas las mejoras son puramente de Frontend y no requieren cambios en la base de datos ni en el backend.
