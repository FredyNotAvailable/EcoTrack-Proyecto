# 🚀 Plan de Implementación - Corrección de Errores en Onboarding

**Fecha:** 2026-02-09  
**Objetivo:** Resolver todos los problemas identificados en el flujo de creación de perfiles durante el onboarding  
**Prioridad:** Alta  
**Tiempo estimado:** 2-3 horas

---

## 📊 Resumen Ejecutivo

Se han identificado **7 problemas críticos** en el sistema de onboarding que pueden causar fallos al crear perfiles:

1. ✅ Discrepancia entre campos esperados (Frontend vs Backend)
2. ✅ Manejo de errores genérico e insuficiente
3. ✅ Race conditions en flujo OAuth
4. ✅ Validación de username incompleta en frontend
5. ✅ Falta de logging detallado
6. ✅ Timeout de Supabase en uploads pesados
7. ✅ Mensajes de error poco informativos

---

## 🎯 Fases de Implementación

### **FASE 1: Validación y Normalización de Datos** ⏱️ 30 min

#### 1.1. Mejorar Validación de Username en Frontend
**Archivo:** `frontend/src/modules/onboarding/pages/OnboardingPage.tsx`

**Cambios:**
- Agregar validación de regex en tiempo real
- Mostrar feedback visual cuando el username es inválido
- Normalizar username (trim, lowercase)

**Validaciones a agregar:**
```typescript
const validateUsername = (username: string): { valid: boolean; error?: string } => {
    const trimmed = username.trim();
    
    if (trimmed.length < 3) {
        return { valid: false, error: 'Mínimo 3 caracteres' };
    }
    
    if (trimmed.length > 30) {
        return { valid: false, error: 'Máximo 30 caracteres' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return { valid: false, error: 'Solo letras, números y guiones bajos' };
    }
    
    return { valid: true };
};
```

---

#### 1.2. Eliminar Campo `nombre_completo` del Schema (o hacerlo consistente)
**Archivo:** `backend/src/utils/validators.ts`

**Opción A - Eliminar (Recomendado):**
- Remover `nombre_completo` del schema si no se usa
- Simplificar el modelo de datos

**Opción B - Implementar:**
- Agregar campo en el frontend
- Actualizar repository para incluirlo en SELECT

**Decisión:** Opción A (eliminar), ya que no se usa en ningún lado del frontend

---

### **FASE 2: Mejora de Manejo de Errores** ⏱️ 45 min

#### 2.1. Crear Utilidad de Mapeo de Errores
**Archivo nuevo:** `frontend/src/modules/profile/utils/profileErrors.ts`

**Funcionalidad:**
```typescript
export const getProfileErrorMessage = (error: any): string => {
    // Mapear códigos de error de Supabase a mensajes amigables
    // Manejar errores de red
    // Manejar errores de validación
    // Manejar timeouts
}
```

---

#### 2.2. Mejorar Error Handling en Backend
**Archivos:**
- `backend/src/modules/profile/profile.controller.ts`
- `backend/src/modules/profile/profile.service.ts`

**Cambios:**
- Capturar errores específicos de Supabase
- Transformar códigos de error en mensajes descriptivos
- Agregar logging estructurado con contexto

---

#### 2.3. Actualizar Frontend para Mostrar Errores Específicos
**Archivo:** `frontend/src/modules/onboarding/pages/OnboardingPage.tsx`

**Cambios:**
- Usar la nueva utilidad de errores
- Mostrar mensajes específicos según el tipo de error
- Agregar retry logic para errores de red

---

### **FASE 3: Optimización de Upload de Avatar** ⏱️ 30 min

#### 3.1. Agregar Compresión y Validación de Imágenes
**Archivo:** `frontend/src/utils/ImageConverter.ts`

**Mejoras:**
- Validar tamaño máximo (2MB)
- Comprimir imágenes grandes automáticamente
- Mostrar preview de calidad
- Agregar loading state durante conversión

---

#### 3.2. Implementar Upload con Progress
**Archivo:** `frontend/src/modules/shared/services/storage.service.ts`

**Cambios:**
- Agregar callback de progreso
- Implementar retry en caso de fallo
- Timeout configurable por tamaño de archivo

---

### **FASE 4: Prevención de Race Conditions** ⏱️ 20 min

#### 4.1. Limpiar LocalStorage en Casos de Error
**Archivo:** `frontend/src/modules/onboarding/pages/OnboardingPage.tsx`

**Cambios:**
- Limpiar `onboarding_data` en catch
- Agregar timestamp de expiración
- Validar datos antes de usar

---

#### 4.2. Mejorar Flujo de OAuth
**Archivo:** `frontend/src/modules/auth/pages/AuthCallbackPage.tsx`

**Cambios:**
- Validar que los datos de localStorage sean recientes
- Manejar caso donde el usuario cancela OAuth
- Agregar estado de "procesando" para evitar múltiples intentos

---

### **FASE 5: Logging y Debugging** ⏱️ 15 min

#### 5.1. Agregar Logging Estructurado
**Archivos:**
- `backend/src/modules/profile/profile.repository.ts`
- `backend/src/modules/profile/profile.service.ts`
- `backend/src/modules/profile/profile.controller.ts`

**Formato de logs:**
```typescript
console.log(`[ProfileService] Creating profile`, {
    userId,
    hasAvatar: !!data.avatar_url,
    usernameLength: data.username?.length,
    timestamp: new Date().toISOString()
});
```

---

#### 5.2. Agregar Telemetría en Frontend
**Archivo:** `frontend/src/modules/onboarding/pages/OnboardingPage.tsx`

**Cambios:**
- Log de cada paso del proceso
- Captura de errores con contexto
- Métricas de tiempo de cada operación

---

### **FASE 6: Testing y Validación** ⏱️ 30 min

#### 6.1. Casos de Prueba
- [ ] Username válido (solo letras y números)
- [ ] Username con espacios (debe fallar con mensaje claro)
- [ ] Username duplicado (debe mostrar error específico)
- [ ] Avatar grande (>5MB) - debe comprimir
- [ ] Sin conexión a internet (debe mostrar error de red)
- [ ] Timeout de Supabase (debe reintentar)
- [ ] Flujo completo con Google OAuth
- [ ] Flujo completo con Email/Password
- [ ] Cancelar OAuth en medio del proceso

---

## 📝 Checklist de Implementación

### Backend
- [ ] Eliminar campo `nombre_completo` del validator (o implementarlo)
- [ ] Mejorar error handling en ProfileController
- [ ] Mejorar error handling en ProfileService
- [ ] Agregar logging estructurado en Repository
- [ ] Agregar transformación de errores de Supabase
- [ ] Actualizar tests unitarios

### Frontend
- [ ] Crear utilidad de validación de username
- [ ] Crear utilidad de mapeo de errores
- [ ] Actualizar OnboardingPage con validación mejorada
- [ ] Mejorar manejo de errores en OnboardingPage
- [ ] Agregar compresión de imágenes
- [ ] Implementar upload con progress
- [ ] Limpiar localStorage en errores
- [ ] Mejorar flujo de OAuth en AuthCallbackPage
- [ ] Agregar logging en frontend
- [ ] Actualizar tests e2e

### Database
- [ ] Verificar estructura de tabla `profiles`
- [ ] Confirmar constraints y índices
- [ ] Verificar que `username` tiene UNIQUE constraint
- [ ] Documentar schema actual

---

## 🔧 Archivos a Modificar

### Backend (6 archivos)
1. `backend/src/utils/validators.ts` - Limpiar schema
2. `backend/src/modules/profile/profile.controller.ts` - Error handling
3. `backend/src/modules/profile/profile.service.ts` - Error handling
4. `backend/src/modules/profile/profile.repository.ts` - Logging
5. `backend/src/middlewares/error.handler.ts` - Mejorar respuestas
6. `backend/src/utils/ApiError.ts` - Agregar códigos de error

### Frontend (7 archivos)
1. `frontend/src/modules/onboarding/pages/OnboardingPage.tsx` - Validación y errores
2. `frontend/src/modules/auth/pages/AuthCallbackPage.tsx` - OAuth flow
3. `frontend/src/modules/profile/utils/profileErrors.ts` - **NUEVO** - Mapeo de errores
4. `frontend/src/modules/profile/utils/profileValidation.ts` - **NUEVO** - Validaciones
5. `frontend/src/utils/ImageConverter.ts` - Compresión
6. `frontend/src/modules/shared/services/storage.service.ts` - Upload mejorado
7. `frontend/src/modules/profile/services/profile.service.ts` - Error handling

---

## 🎨 Mejoras de UX Incluidas

1. **Validación en Tiempo Real**
   - Feedback inmediato al escribir username
   - Indicador visual de username válido/inválido
   - Contador de caracteres con colores

2. **Mensajes de Error Claros**
   - "Este nombre de usuario ya existe. Intenta con: ecowarrior2025"
   - "La imagen es muy grande. Comprimiendo automáticamente..."
   - "Conexión perdida. Reintentando en 3 segundos..."

3. **Loading States Informativos**
   - "Subiendo avatar... 45%"
   - "Creando tu perfil..."
   - "Verificando disponibilidad del nombre..."

4. **Prevención de Errores**
   - Deshabilitar botón hasta que todo sea válido
   - Comprimir imágenes automáticamente
   - Normalizar username automáticamente

---

## 📈 Métricas de Éxito

- ✅ Reducción de errores en creación de perfil: **>90%**
- ✅ Tiempo promedio de onboarding: **<2 minutos**
- ✅ Tasa de abandono en onboarding: **<5%**
- ✅ Usuarios que completan onboarding al primer intento: **>95%**

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Breaking changes en API | Media | Alto | Mantener retrocompatibilidad |
| Usuarios con perfiles a medias | Baja | Medio | Script de limpieza de datos |
| Problemas con OAuth providers | Baja | Alto | Fallback a email/password |
| Timeout en uploads grandes | Media | Medio | Compresión automática |

---

## 📚 Documentación Adicional

Después de la implementación, crear:
- [ ] Guía de troubleshooting para usuarios
- [ ] Documentación técnica del flujo de onboarding
- [ ] Runbook para errores comunes
- [ ] Diagrama de flujo actualizado

---

## 🔄 Rollback Plan

Si algo sale mal:
1. Revertir commits con `git revert`
2. Restaurar validators anteriores
3. Verificar que usuarios existentes no se vean afectados
4. Comunicar a usuarios activos si es necesario

---

## 📞 Puntos de Contacto

- **Backend Lead:** Revisar cambios en validators y error handling
- **Frontend Lead:** Revisar cambios en UX y validaciones
- **QA:** Ejecutar suite completa de tests
- **DevOps:** Monitorear logs después del deploy

---

## ✅ Criterios de Aceptación

### Must Have
- [x] Usuario puede crear perfil con username válido
- [x] Errores muestran mensajes específicos y útiles
- [x] Username duplicado muestra error claro
- [x] Imágenes grandes se comprimen automáticamente
- [x] Validación de username en tiempo real

### Should Have
- [x] Progress bar en upload de avatar
- [x] Retry automático en errores de red
- [x] Logging estructurado para debugging
- [x] Timeout configurable según tamaño de archivo

### Nice to Have
- [ ] Sugerencias de username disponibles
- [ ] Preview de perfil antes de crear
- [ ] Onboarding analytics dashboard
- [ ] A/B testing de mensajes de error

---

## 🎯 Próximos Pasos

1. **Revisar y aprobar este plan** ✋ (Esperando tu confirmación)
2. **Comenzar implementación por fases**
3. **Testing en ambiente de desarrollo**
4. **Code review**
5. **Deploy a staging**
6. **Testing QA completo**
7. **Deploy a producción**
8. **Monitoreo post-deploy**

---

**¿Listo para comenzar la implementación?** 🚀
