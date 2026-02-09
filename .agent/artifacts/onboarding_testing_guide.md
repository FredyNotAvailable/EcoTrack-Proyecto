# 🧪 Guía de Testing - Mejoras del Onboarding

**Versión:** 1.0  
**Fecha:** 2026-02-09

---

## 🎯 Objetivo

Verificar que todas las mejoras del onboarding funcionan correctamente y que los errores se manejan de forma apropiada.

---

## ✅ Pre-requisitos

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Base de datos Supabase accesible
- [ ] Consola del navegador abierta (F12)
- [ ] Terminal del backend visible para ver logs

---

## 📋 Tests a Realizar

### TEST 1: Validación de Username en Tiempo Real ⏱️ 2 min

**Objetivo:** Verificar que la validación funciona antes de enviar el formulario.

**Pasos:**
1. Ir a `/onboarding`
2. En el campo "¿Cómo quieres llamarte?", escribir:
   - `ab` → Debe mostrar: "Mínimo 3 caracteres"
   - `mi usuario` → Debe mostrar: "Solo letras, números y guiones bajos (_)"
   - `este_username_es_demasiado_largo_para_ser_valido` → Debe mostrar: "Máximo 30 caracteres"
   - `eco_warrior_2025` → ✅ No debe mostrar error

**Resultado esperado:**
- ✅ Mensajes de error aparecen inmediatamente al escribir
- ✅ Botón "Comenzar mi Aventura" está deshabilitado cuando hay errores
- ✅ Botón se habilita cuando todo es válido

**Logs esperados en consola:**
```
Ninguno (validación en cliente)
```

---

### TEST 2: Username Duplicado 🔄 ⏱️ 3 min

**Objetivo:** Verificar que el error de username duplicado muestra mensaje claro.

**Pasos:**
1. Crear un perfil con username `test_user_123`
2. Cerrar sesión
3. Intentar crear otro perfil con el mismo username `test_user_123`

**Resultado esperado:**
- ❌ Toast de error con:
  - **Título:** "Nombre de usuario no disponible"
  - **Descripción:** "Este nombre ya está en uso. Intenta con otro."
  - **Sugerencia:** "💡 Prueba agregando números o tu año favorito"

**Logs esperados en backend:**
```
[ProfileService] Creating profile for abc123 { username: 'test_user_123', ... }
[ProfileService] Error creating profile: { userId: 'abc123', errorCode: '23505', ... }
[ProfileController] Error in createMe: { userId: 'abc123', error: 'El nombre de usuario ya está en uso...', code: 'DUPLICATE_USERNAME' }
```

**Logs esperados en frontend:**
```
[Onboarding] Creating profile with data: { username: 'test_user_123', ... }
[ProfileError] { errorMessage: '...', errorCode: 'DUPLICATE_USERNAME', ... }
```

---

### TEST 3: Caracteres Inválidos en Username ⚠️ ⏱️ 2 min

**Objetivo:** Verificar que caracteres especiales son rechazados.

**Pasos:**
1. Ir a `/onboarding`
2. Escribir username: `eco@warrior!`
3. Intentar continuar

**Resultado esperado:**
- ❌ Mensaje de error: "Solo letras, números y guiones bajos (_)"
- ❌ Botón deshabilitado

---

### TEST 4: Biografía Muy Larga 📝 ⏱️ 2 min

**Objetivo:** Verificar límite de 300 caracteres en bio.

**Pasos:**
1. Ir a `/onboarding`
2. En "Tu Manifiesto Personal", pegar un texto de >300 caracteres
3. Observar el contador

**Resultado esperado:**
- ✅ Contador muestra: `350/300` (en color naranja/rojo)
- ❌ Botón deshabilitado
- ✅ Al borrar hasta <300, botón se habilita

---

### TEST 5: Flujo Completo con Email/Password ✉️ ⏱️ 5 min

**Objetivo:** Verificar creación exitosa de perfil.

**Pasos:**
1. Ir a `/register`
2. Registrarse con email nuevo: `test_${Date.now()}@test.com`
3. Completar onboarding:
   - Username: `eco_tester_2026`
   - Bio: "Amante de la naturaleza"
   - Avatar: (opcional) subir imagen
4. Aceptar términos
5. Click en "Comenzar mi Aventura"

**Resultado esperado:**
- ✅ Toast de éxito: "¡Bienvenido a bordo!"
- ✅ Redirección a `/app/inicio`
- ✅ Perfil visible en la app

**Logs esperados en backend:**
```
[ProfileService] Creating profile for abc123 { username: 'eco_tester_2026', bioLength: 24, hasAvatar: false }
[ProfileRepository] Inserting profile data: { id: 'abc123', username: 'eco_tester_2026', ... }
[ProfileService] Profile created successfully for abc123
[ProfileController] Profile created successfully for userId: abc123
```

**Logs esperados en frontend:**
```
[Onboarding] Processing deferred registration
[Onboarding] Creating profile with data: { username: 'eco_tester_2026', hasBio: true, hasAvatar: false }
ProfileAPIService.create called with: { username: 'eco_tester_2026', bio: '...', avatar_url: undefined }
ProfileAPIService: Success { id: 'abc123', ... }
```

---

### TEST 6: Flujo con Google OAuth 🔐 ⏱️ 5 min

**Objetivo:** Verificar que datos de onboarding se preservan durante OAuth.

**Pasos:**
1. Ir a `/onboarding` (sin estar autenticado)
2. Llenar formulario:
   - Username: `google_user_test`
   - Bio: "Usuario de Google"
3. Click en "Comenzar mi Aventura"
4. Completar login con Google
5. Verificar que el perfil se crea con los datos del formulario

**Resultado esperado:**
- ✅ Redirección a Google OAuth
- ✅ Después de autenticar, redirección a `/auth/callback`
- ✅ Perfil creado automáticamente con datos guardados
- ✅ Toast: "¡Bienvenido a EcoTrack!"
- ✅ Redirección a `/app/inicio`

**Logs esperados en frontend:**
```
[Onboarding] Guest user, saving data for OAuth callback
AuthCallbackPage: Checking onboarding_data: {"username":"google_user_test",...,"timestamp":1707512345678}
AuthCallbackPage: Starting registration flow
AuthCallbackPage: Calling ProfileAPIService.create with: { username: 'google_user_test', ... }
AuthCallbackPage: Profile created successfully
```

---

### TEST 7: Datos de Onboarding Expirados ⏰ ⏱️ 3 min

**Objetivo:** Verificar que datos antiguos en localStorage son rechazados.

**Pasos:**
1. Abrir DevTools → Application → Local Storage
2. Crear entrada manual:
   ```json
   Key: onboarding_data
   Value: {"username":"old_user","bio":"test","timestamp":1000000000}
   ```
3. Ir a `/auth/callback` (simular callback de OAuth)

**Resultado esperado:**
- ⚠️ Toast: "Sesión expirada"
- ⚠️ Descripción: "Los datos del formulario expiraron. Por favor completa el registro nuevamente."
- ✅ Redirección a `/onboarding`
- ✅ localStorage limpiado

**Logs esperados:**
```
AuthCallbackPage: Onboarding data expired
```

---

### TEST 8: Error de Red (Simulado) 🌐 ⏱️ 4 min

**Objetivo:** Verificar retry automático en errores de red.

**Pasos:**
1. Abrir DevTools → Network
2. Activar "Offline" mode
3. Ir a `/onboarding` (ya autenticado)
4. Completar formulario y enviar
5. Observar comportamiento

**Resultado esperado:**
- ⚠️ Toast: "Problema de conexión"
- ⚠️ Descripción: "No pudimos conectar con el servidor. Reintentando en 1s..."
- ✅ Después de 1s, reintenta automáticamente
- ⚠️ Si sigue offline, reintenta en 2s, luego 4s
- ❌ Después de 3 intentos, muestra error final

**Nota:** Reactiva la red antes del 3er intento para ver el éxito.

---

### TEST 9: Avatar Grande 🖼️ ⏱️ 3 min

**Objetivo:** Verificar manejo de imágenes grandes.

**Pasos:**
1. Ir a `/onboarding`
2. Subir imagen de >5MB
3. Completar formulario y enviar

**Resultado esperado:**
- ⏳ Proceso de upload puede tardar
- ✅ Si tarda mucho, debería mostrar loading state
- ✅ Si falla, muestra error específico de imagen

**Nota:** Este test depende de la implementación de compresión (opcional).

---

### TEST 10: Perfil Ya Existente 🔁 ⏱️ 2 min

**Objetivo:** Verificar que no se puede crear perfil duplicado para el mismo usuario.

**Pasos:**
1. Crear un perfil exitosamente
2. Sin cerrar sesión, ir manualmente a `/onboarding`
3. Intentar crear otro perfil

**Resultado esperado:**
- ❌ Toast de error: "Perfil ya creado"
- ❌ Descripción: "Ya tienes un perfil registrado"
- 💡 Sugerencia: "Intenta iniciar sesión en lugar de crear uno nuevo"

**Logs esperados en backend:**
```
[ProfileService] Creating profile for abc123 ...
[ProfileService] Profile already exists for abc123
[ProfileController] Error in createMe: { error: 'El perfil ya existe', code: undefined }
```

---

## 📊 Checklist de Validación

### Validación de Campos
- [ ] Username muy corto rechazado
- [ ] Username muy largo rechazado
- [ ] Username con espacios rechazado
- [ ] Username con caracteres especiales rechazado
- [ ] Username válido aceptado
- [ ] Bio >300 caracteres rechazada
- [ ] Bio ≤300 caracteres aceptada

### Manejo de Errores
- [ ] Username duplicado → Mensaje específico
- [ ] Error de red → Retry automático
- [ ] Perfil ya existe → Mensaje claro
- [ ] Datos expirados → Limpieza y redirección
- [ ] Avatar falla → Continúa sin avatar

### Flujos Completos
- [ ] Registro con email/password → Éxito
- [ ] Registro con Google OAuth → Éxito
- [ ] Login con Google (usuario existente) → Éxito
- [ ] Onboarding con avatar → Éxito
- [ ] Onboarding sin avatar → Éxito

### Logging
- [ ] Logs estructurados en backend
- [ ] Logs con contexto en frontend
- [ ] Errores logueados correctamente
- [ ] Timestamps presentes

---

## 🐛 Problemas Comunes y Soluciones

### Problema: Botón siempre deshabilitado
**Causa:** Validación muy estricta  
**Solución:** Verificar que username cumple regex: `^[a-zA-Z0-9_]+$`

### Problema: No aparecen mensajes de error
**Causa:** Imports faltantes  
**Solución:** Verificar que se importaron las utilidades de validación

### Problema: Retry infinito
**Causa:** Error no recuperable detectado como recuperable  
**Solución:** Revisar lógica en `isRecoverableError()`

### Problema: LocalStorage no se limpia
**Causa:** Error en catch no ejecuta cleanup  
**Solución:** Verificar que `localStorage.removeItem()` está en el catch

---

## 📝 Reporte de Resultados

Después de completar los tests, llena esta tabla:

| Test | Estado | Notas |
|------|--------|-------|
| 1. Validación en tiempo real | ⬜ | |
| 2. Username duplicado | ⬜ | |
| 3. Caracteres inválidos | ⬜ | |
| 4. Bio muy larga | ⬜ | |
| 5. Flujo email/password | ⬜ | |
| 6. Flujo Google OAuth | ⬜ | |
| 7. Datos expirados | ⬜ | |
| 8. Error de red | ⬜ | |
| 9. Avatar grande | ⬜ | |
| 10. Perfil duplicado | ⬜ | |

**Leyenda:**
- ✅ Pasó
- ❌ Falló
- ⚠️ Pasó con observaciones
- ⬜ No probado

---

## 🎯 Criterios de Aceptación

Para considerar la implementación exitosa:

- ✅ Al menos 8/10 tests pasan
- ✅ Todos los errores muestran mensajes específicos
- ✅ Logs son claros y útiles para debugging
- ✅ No hay errores de compilación
- ✅ UX es fluida y clara

---

**¡Buena suerte con el testing!** 🚀
