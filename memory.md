# 🧠 MEMORY.MD — Memoria del Agente IA
> Auto-escrito por Claude Sonnet | AppMicroGastos
> **Propósito**: Registrar errores, correcciones y aprendizajes para NO repetir los mismos errores.

---

## 📋 Formato de Entradas

```
## [FECHA] — [CATEGORÍA] — [Título corto]
**Contexto**: Qué se estaba haciendo
**Error**: Qué salió mal
**Causa raíz**: Por qué ocurrió
**Corrección**: Cómo se resolvió
**Aprendizaje**: Regla que aplicar en el futuro
**Tags**: #tailwind #firebase #typescript #react #owasp
```

---

## 📚 Registro de Errores y Aprendizajes

---

### [2026-05-04] — SISTEMA — Inicialización de memoria

**Contexto**: Primera sesión de análisis del proyecto AppMicroGastos. Se crea este archivo para establecer el sistema de memoria del agente.

**Observaciones del proyecto**:
- El proyecto es un template de Figma exportado a React/Vite
- Usa Tailwind CSS v4 (diferente a v3 en configuración)
- El paquete de animaciones es `motion` (no `framer-motion`)
- El package manager primario es `pnpm`
- La autenticación es mock/local (sin Firebase real aún)
- El estado se maneja localmente en `App.tsx` (sin Context API ni Zustand)

**Reglas establecidas desde el inicio**:
1. Leer este archivo ANTES de cualquier tarea
2. Actualizar este archivo DESPUÉS de cada corrección

**Tags**: #inicio #sistema #memoria

---

### [2026-05-04] — HERRAMIENTAS — Error al usar view_file en directorio

**Contexto**: Durante el análisis inicial del proyecto, se intentó usar `view_file` pasando una ruta de directorio (`src/styles`) en lugar de un archivo.

**Error**: `failed to read file: read d:/proyectosAnti/.../src/styles: Incorrect function.`

**Causa raíz**: `view_file` solo acepta rutas a ARCHIVOS, no directorios. Para listar directorios se debe usar `list_dir`.

**Corrección**: Usar `list_dir` para directorios, luego `view_file` para archivos específicos.

**Aprendizaje**:
> ✅ `list_dir` → para explorar estructura de carpetas
> ✅ `view_file` → para leer el contenido de archivos específicos
> ❌ Nunca pasar una ruta de directorio a `view_file`

**Tags**: #herramientas #error #workflow

---

### [2026-05-04] — FIREBASE — Instalación en directorio incorrecto

**Contexto**: El usuario corrió `npm install firebase` en `d:\proyectosAnti\appMicroGastos\` (la raíz), pero el `package.json` real está en `Mobile App Template Design\`.

**Error**: Firebase se instaló en el `node_modules` del directorio raíz, no en el del proyecto Vite. El proyecto no podía resolver el módulo.

**Causa raíz**: El usuario estaba parado en el directorio padre al ejecutar el comando. El raíz tiene un `package.json` vacío generado accidentalmente.

**Corrección**: Instalar de nuevo con `npm install firebase` dentro de `Mobile App Template Design\`.

**Aprendizaje**:
> ✅ SIEMPRE verificar que el CWD apunta a `Mobile App Template Design\` antes de instalar paquetes
> ✅ El `package.json` real del proyecto está en el subdirectorio, NO en la raíz
> ❌ No ejecutar comandos npm/pnpm desde `d:\proyectosAnti\appMicroGastos\` directamente

**Tags**: #firebase #npm #instalacion #directorio

---

### [2026-05-04] — FIREBASE — Patrón de inicialización correcto

**Contexto**: Integración de Firebase SDK en el proyecto Vite/React.

**Decisiones tomadas**:
1. Crear `src/lib/firebase.ts` como módulo central (fuente de verdad de servicios)
2. Usar `import.meta.env.VITE_*` para leer las credenciales (OWASP A02)
3. Usar `getApps().length === 0 ? initializeApp() : getApp()` para evitar doble init en hot-reload de Vite
4. `isSupported()` antes de `getAnalytics()` para compatibilidad con entornos sin browser
5. Importar en `main.tsx` como side-effect (`import "./lib/firebase"`) para garantizar init antes de render

**Aprendizaje**:
> ✅ Firebase config en `.env` con prefijo `VITE_` (Vite no expone env vars sin ese prefijo)
> ✅ Exportar `auth`, `db`, `storage` desde `firebase.ts` — todos los componentes importan de ahí
> ✅ `getApps().length` evita el error "Firebase already initialized" en HMR
> ✅ Agregar `.env` al `.gitignore` inmediatamente tras crearlo
> ❌ NUNCA importar directamente `firebase/app` en componentes — siempre usar `src/lib/firebase`

**Tags**: #firebase #vite #owasp #inicializacion

---

### [2026-05-05] — BUG CRÍTICO — onSnapshot dispara todos los docs existentes como "added" al suscribirse

**Contexto**: Al registrar un gasto, aparecían múltiples alertas de Antigravity IA con textos como "Más de la mitad gastada / No se pudo analizar". El usuario NO había hecho nada nuevo.

**Causa raíz**: `onSnapshot` de Firestore funciona así — al suscribirse por primera vez, dispara TODOS los documentos que coinciden con la query como eventos `docChanges()` con `type === "added"`, aunque sean documentos viejos. Los gastos simulados anteriores que quedaron con `procesado: false` se disparaban todos al inicio como si fueran nuevos.

**Solución implementada**:
```typescript
const isInitialLoad = useRef(true);
// Dentro del callback:
if (isInitialLoad.current) {
  // Silenciosamente marcar como procesado — NO mostrar alerta
  await updateDoc(docRef, { procesado: true });
  return;
}
// Después del primer snapshot:
isInitialLoad.current = false;
```

**Regla aprendida**:
> ✅ SIEMPRE usar `isInitialLoad` flag en hooks con `onSnapshot` que procesan `docChanges()`
> ✅ El primer snapshot = estado actual de la BD (docs existentes), NO eventos nuevos
> ❌ NUNCA asumir que `type === "added"` en el primer snapshot significa "recién creado"

**Tags**: #bug #firestore #onSnapshot #isInitialLoad #alertas

---

### [2026-05-05] — BUG — IA no procesaba gastos por nombre de campo incorrecto

**Contexto**: Las notificaciones de IA no aparecían a pesar de que los gastos se registraban en la colección correcta.

**Causa raíz**: En `App.tsx` guardábamos el gasto con el campo `date`, pero en `useTransaccionesMonitor.ts` el monitor intentaba leer `datos.fecha`. Esto causaba un error silencioso al intentar convertir un campo inexistente a marca de tiempo de JS.

**Solución**: Se sincronizaron ambos archivos para usar el estándar `date`.

**Regla aprendida**:
> ✅ Siempre verificar la consistencia de los nombres de campos entre la función de escritura (`addDoc`) y la función de escucha (`onSnapshot`).

**Tags**: #firestore #bug #sync

---

### [2026-05-05] — BUG — Notificaciones de IA desaparecieron tras quitar el Simulador

**Contexto**: Al eliminar el "Simulador de Banco IA", las notificaciones automáticas de Antigravity dejaron de aparecer al registrar gastos.

**Causa raíz**: El hook `useTransaccionesMonitor` estaba configurado para escuchar la colección `transacciones` (que solo usaba el simulador). Al registrar gastos manualmente, estos se guardan en la colección `expenses`. Al no haber datos nuevos en `transacciones`, el monitor nunca se activaba.

**Solución**:
1. Se actualizó `App.tsx` para incluir `procesado: false` en cada nuevo gasto manual.
2. Se redirigió `useTransaccionesMonitor` para que escuche la colección `expenses`.
3. Se mapearon los campos correctamente (`amount` -> `monto`, `note` -> `comercio`).

**Regla aprendida**:
> ✅ Si se elimina una fuente de datos (simulador), verificar si hay otros procesos (IA, analíticas) que dependan de esa colección y redirigirlos a la fuente de datos real.

**Tags**: #firebase #ia #monitor #notificaciones

---

### [2026-05-05] — BUG — Chatbot Gemini falla si el historial no empieza con 'user'

**Contexto**: El chatbot siempre respondía con el mensaje de error "Lo siento, mi conexión se interrumpió..." a pesar de tener conexión y API Key válida.

**Causa raíz**: La API de Google Generative AI (`startChat`) tiene una validación estricta de roles. El historial de mensajes:
1. **DEBE** empezar con un mensaje del rol `user`.
2. **DEBE** alternar estrictamente entre `user` y `model`.
Como mi estado inicial de `messages` incluía un saludo del bot como primer elemento, el `history` enviado empezaba con `model`, lo que invalidaba toda la petición.

**Solución**:
En `antigravity.ts`, se añadió un filtro que remueve el primer mensaje si es de tipo `model` antes de pasarlo a `startChat`:
```typescript
const historialValido = historial[0]?.role === 'model' ? historial.slice(1) : historial;
```

**Regla aprendida**:
> ✅ Al usar `startChat` de Gemini, el array `history` debe empezar siempre por un mensaje del usuario.
> ✅ Si la interfaz muestra un saludo inicial del bot, este debe excluirse del historial enviado a la API.

**Tags**: #gemini #chatbot #api #error-roles

---

### [2026-05-05] — MALA PRÁCTICA — Código muerto acumulado tras eliminar UI

**Contexto**: Al eliminar el "Simulador de Banco IA" de SettingsScreen, quedaron en `App.tsx` funciones y imports sin usar: `handleSimularGasto`, `detectarGastoPrueba`, `simularGastoEntrante`, `analizarGastoConIA`.

**Causa**: Se eliminó el bloque JSX pero no se limpió el código que lo alimentaba.

**Consecuencia**: Build warnings, código confuso, posibles side-effects en tests.

**Protocolo correcto al eliminar UI**:
1. Eliminar el componente/sección JSX
2. Buscar con grep todas las props, funciones e imports que alimentaban ese bloque
3. Eliminarlos todos en la misma operación
4. Correr `tsc --noEmit` para confirmar 0 errores

**Comandos de diagnóstico**:
```bash
# Detectar imports no usados y errores
node_modules/typescript/bin/tsc --noEmit

# Buscar referencias huérfanas
grep -r "nombreFuncion" src/
```

**Tags**: #malaprāctica #deadcode #cleanup #imports

---

### [2026-05-05] — BUG — creationTime===lastSignInTime no es confiable para detectar usuarios nuevos

**Contexto**: Los usuarios existentes veían las pantallas de Welcome/Onboarding al iniciar sesión nuevamente.

**Causa**: `user.metadata.creationTime === user.metadata.lastSignInTime` tiene casos borde:
- Con Google Sign-In: Firebase puede actualizar `lastSignInTime` antes de que el callback ejecute
- Al hacer logout + login rápido: los timestamps pueden coincidir aunque no sea usuario nuevo

**Solución implementada**:
1. Al terminar onboarding → `setDoc(profileRef, { onboardingCompleted: true }, { merge: true })`
2. En `onAuthStateChanged` → `getDoc(profileRef)` y leer `onboardingCompleted`
3. Si `true` → home directamente; si `false` o no existe → onboarding

**Ventajas**:
- Funciona en todos los dispositivos (no depende del device)
- Funciona con cualquier proveedor de auth (Email, Google)
- Es el estado canónico: si el usuario completa onboarding, el flag queda en Firestore para siempre

**Estructura Firestore**:
```
users/{uid}/config/profile.onboardingCompleted = true  (se escribe al terminar onboarding)
```

**Tags**: #bug #auth #onboarding #routing #firestore

---

### [2026-05-05] — CRÍTICO — Auth completamente mock: datos nunca llegaban a Firestore

**Contexto**: El usuario reportó que el registro de gastos y perfil no se guardaban en Firebase aunque el código de Firestore estaba correcto.

**Causa raíz**: `LoginScreen` y `RegisterScreen` eran 100% UI sin lógica real. El botón de "Iniciar sesión" solo llamaba `onLogin()` (callback de navegación) sin invocar Firebase Auth. Como `onAuthStateChanged` nunca detectaba un usuario autenticado, `userId` siempre era `null`, haciendo que todo el bloque de Firestore fuera letra muerta.

**Lo que PARECÍA funcionar pero no lo hacía**:
- `handleAddExpense` tenía la lógica correcta de Firestore
- `onSnapshot` estaba bien configurado
- El problema era que ningún usuario real existía en Firebase Auth

**Corrección**:
1. `LoginScreen.tsx` → `signInWithEmailAndPassword` + `signInWithPopup` (Google)
2. `RegisterScreen.tsx` → `createUserWithEmailAndPassword` + `updateProfile` + `setDoc` para guardar perfil
3. `App.tsx` → mejorado `onAuthStateChanged` para distinguir usuario nuevo (→ onboarding) de existente (→ home) con `metadata.creationTime === metadata.lastSignInTime`

**Estructura Firestore que ahora se crea al registrarse**:
```
users/{uid}/
├── config/
│   ├── profile    → { name, email, createdAt, maxLimit, isLocked, emergencyMode }
│   └── settings   → (se actualiza desde SettingsScreen)
└── expenses/      → (documentos al registrar gastos)
```

**Aprendizaje**:
> ✅ SIEMPRE verificar si el auth es real o mock ANTES de integrar Firestore
> ✅ Si `userId` es null, NADA en Firestore funciona — es el primer punto a diagnosticar
> ✅ `user.metadata.creationTime === user.metadata.lastSignInTime` detecta usuarios recién creados
> ✅ Guardar el perfil completo (incluyendo config defaults) al momento del registro
> ❌ No asumir que la pantalla de Login/Register llama a Firebase Auth — verificar el código

**Tags**: #critico #auth #firebase #mock #firestore #perfil

---

### [2026-05-05] — CRÍTICO — App.tsx corrompido: imports eliminados + JSX duplicado

**Contexto**: Tras múltiples ediciones parciales con `replace_file_content`, el archivo `App.tsx` quedó en estado inválido.

**Errores encontrados**:
1. **Imports faltantes**: Se eliminaron accidentalmente `OnboardingScreen`, `LoginScreen`, `RegisterScreen`, `BudgetScreen`, `EmptyStateScreen`, `AddExpenseModal` — solo quedaron `WelcomeScreen` y `SettingsScreen`. El archivo compilaba con error invisible porque Vite solo transpila lo que se renderiza.
2. **JSX duplicado**: Quedaron las líneas `</div></div>}` duplicadas al final (líneas 159-162), lo que generaba un error de sintaxis JSX silencioso en algunos parsers.
3. **SVG mal anidado** en `HomeScreen.tsx`: El `div` wrapper del círculo SVG tenía un nivel de indentación roto, causando que el tag de cierre no correspondiera.

**Causa raíz**: Usar `replace_file_content` en bloques que contenían el final del componente mezcló el cierre original con el nuevo cierre, duplicándolo. Las ediciones sucesivas de la sesión anterior eliminaron los imports al hacer un replace del bloque de imports sin incluir todos.

**Corrección**: Reescritura completa de `App.tsx` con `write_to_file` en modo overwrite.

**Aprendizaje**:
> ✅ Para refactorizaciones grandes de `App.tsx`, usar `write_to_file` con `Overwrite: true` en lugar de múltiples `replace_file_content`
> ✅ Siempre verificar el archivo completo con `view_file` antes de editar para detectar duplicaciones
> ✅ Correr `tsc --noEmit` después de CADA edición para detectar problemas inmediatamente
> ❌ No encadenar múltiples `replace_file_content` en el mismo archivo en una sola sesión sin verificación intermedia

**Tags**: #critico #apptsx #imports #jsx #corrupcion

---

### [2026-05-05] — FIREBASE — Integración Firestore con tiempo real

**Contexto**: Se conectó Firestore como base de datos para persistir gastos y configuración del usuario.

**Arquitectura implementada** (OWASP compliant):
- `onAuthStateChanged` para detectar sesión activa (OWASP A07)
- `users/{userId}/expenses` — colección con `userId` en la ruta (OWASP A01)
- `users/{userId}/config/settings` — configuración persistente del bloqueo
- `onSnapshot` para suscripción en tiempo real
- `setDoc` con `{ merge: true }` para no sobreescribir configuración completa
- Fallback local si el usuario no tiene sesión activa

**Security Rules** (archivo `firestore.rules`):
```
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Aprendizaje**:
> ✅ `onSnapshot` retorna una función de cleanup — siempre retornarla en el useEffect
> ✅ Usar `Timestamp.now()` de Firestore, no `new Date()`, para consistencia entre zonas horarias
> ✅ `setDoc` con `merge: true` es idempotente — seguro de llamar múltiples veces
> ✅ Recalcular `spent` desde los gastos reales del snapshot, no acumulando localmente

**Tags**: #firebase #firestore #realtime #owasp #auth

---

### [2026-05-04] — FEATURE — Sistema de Bloqueo de Gastos y Configuración

**Contexto**: El usuario solicitó un sistema que impida gastar dinero una vez alcanzado un límite ("gasto hormiga") y un apartado para configurar este bloqueo.

**Cambios realizados**:
1.  **Lógica de Bloqueo**: Se añadió validación en `handleAddExpense` que compara `totalSpent + nuevoGasto` contra `maxLimit`.
2.  **Notificaciones**: Integración con `sonner` para mostrar alertas visuales cuando se alcanza el límite.
3.  **SettingsScreen.tsx**: Nueva pantalla con:
    - Switch para activar/desactivar el bloqueo maestro.
    - Slider para configurar el monto límite quincenal ($100 - $5000).
    - Switch de **Modo Emergencia** para bypass temporal (OWASP A01 - Control de acceso con excepción segura).
4.  **UI Fix**: Se corrigió el posicionamiento del `AddExpenseModal` envolviéndolo en un div con `z-[100]` y asegurando que use `absolute inset-0` respecto al contenedor responsivo.

**Aprendizaje**:
> ✅ Separar la lógica de "Modo Emergencia" del "Bloqueo Maestro" permite mayor flexibilidad al usuario sin comprometer la configuración de largo plazo.
> ✅ Usar `import('sonner').then()` permite cargar la librería de notificaciones solo cuando es necesaria, optimizando el bundle.
> ✅ Los componentes absolutos dentro de contenedores flexibles (`h-full` vs `h-[90vh]`) necesitan una capa de envoltura para asegurar el correcto apilamiento (z-index).

**Tags**: #feature #budget #settings #ux #notification #fix

---

### [2026-05-04] — UI/UX — Diseño Responsivo (Móvil y Tablet)

**Contexto**: El usuario solicitó que la app se adaptara a todos los dispositivos móviles y tablets.

**Cambios realizados**:
1.  **App.tsx**: Se reemplazaron las dimensiones fijas (`390x844px`) por clases fluidas de Tailwind.
    - `w-full sm:max-w-[440px] md:max-w-[600px]`: Define el ancho según el dispositivo.
    - `h-full sm:h-[844px] md:h-[90vh]`: Ajusta la altura para no desbordar en tablets.
    - `sm:rounded-[3rem]`: Agrega bordes redondeados tipo iPhone premium solo en pantallas más grandes que un móvil pequeño.
2.  **HomeScreen.tsx**: Se ajustó el grid de categorías para ser más flexible en tablets (`md:gap-4`).

**Aprendizaje**:
> ✅ Usar `min-h-screen` en el wrapper principal para asegurar que el fondo cubra todo.
> ✅ Las clases `sm:` y `md:` de Tailwind son esenciales para separar la experiencia "full-screen" de móvil de la experiencia "app-frame" de tablet.
> ✅ Mantener un `max-w` en tablets ayuda a que la UI no se vea estirada y mantenga la ergonomía.

**Tags**: #ui #responsive #tablet #mobile #tailwind

---

### [2026-05-04] — TYPESCRIPT — "Could not find declaration file for module 'react-dom/client'"

**Contexto**: El IDE marcaba error en `import { createRoot } from "react-dom/client"` en `main.tsx`.

**Error exacto**: `Could not find a declaration file for module 'react-dom/client'. implicitly has an 'any' type.`

**Causa raíz**: Los paquetes `react` y `react-dom` en npm **solo tienen el código JavaScript** — sus tipos de TypeScript viven en paquetes separados (`@types/react` y `@types/react-dom`). Sin ellos, TypeScript no sabe qué exporta el módulo y asigna `any` implícito.

> 💡 Esto pasa con cualquier librería que no incluya tipos nativos (DefinitelyTyped). Las que SÍ incluyen tipos (como Firebase v9+) no necesitan `@types/`.

**Corrección**: `npm install --save-dev @types/react @types/react-dom`

**Aprendizaje**:
> ✅ TODO proyecto React+TypeScript necesita `@types/react` y `@types/react-dom` como devDeps
> ✅ Instalar ambos juntos siempre — si falta uno el otro puede dar errores
> ✅ Firebase v9+ ya incluye sus propios tipos, no necesita `@types/firebase`
> ❌ NO instalar como dependency normal (va en `--save-dev`)

**Tags**: #typescript #react #types #definitelytyped #errors

---

### [2026-05-04] — TYPESCRIPT — IDE muestra errores pero build funciona

**Contexto**: Después de crear `src/lib/firebase.ts`, el IDE marcaba errores rojos en `import.meta.env` y en los imports de Firebase aunque `npm run build` pasaba sin problemas.

**Error**: El IDE no reconocía `import.meta.env` (subrayado rojo) y quizás los módulos de Firebase.

**Causa raíz**: El proyecto NO tenía `tsconfig.json`. Sin él, el Language Server de TypeScript no sabe que:
1. El proyecto usa Vite (y por tanto `import.meta.env` existe)
2. El módulo resolution debe ser `Bundler`
3. El tipo JSX es `react-jsx`
4. Los alias `@/*` → `./src/*` existen

Además, `typescript` no estaba instalado como `devDependency`, lo que impedía correr `tsc --noEmit`.

**Corrección**:
1. Crear `tsconfig.json` con `"types": ["vite/client"]` y `"moduleResolution": "Bundler"`
2. Crear `src/vite-env.d.ts` con la interfaz `ImportMetaEnv` tipando cada `VITE_*`
3. Instalar `typescript` como devDependency: `npm install --save-dev typescript`

**Aprendizaje**:
> ✅ TODO proyecto Vite+React+TS necesita `tsconfig.json` — sin él el IDE da falsos positivos
> ✅ `"types": ["vite/client"]` en tsconfig es lo que habilita `import.meta.env`
> ✅ `"moduleResolution": "Bundler"` es el modo correcto para proyectos con Vite
> ✅ Crear `src/vite-env.d.ts` tipando las `VITE_*` para autocompletado y seguridad de tipos
> ✅ Instalar `typescript` como devDep para poder correr `tsc --noEmit` y validar tipos
> ❌ No confundir "el build funciona" con "el IDE está contento" — necesitan tsconfig

**Tags**: #typescript #vite #tsconfig #ide #errors

---

### [2026-05-04] — HERRAMIENTAS — Error de token limit en write_to_file

**Contexto**: Se intentó crear `agents.md` con contenido muy extenso (más de 64,000 tokens en una sola llamada).

**Error**: `generation exceeded max tokens limit. Please generate a message within the token limit (64000)`

**Causa raíz**: El contenido del archivo era demasiado largo para generarlo en un solo token de respuesta.

**Corrección**: Dividir el contenido en secciones más concisas. Reescribir el documento manteniendo la información esencial pero con menor verbosidad.

**Aprendizaje**:
> ✅ Ser conciso y usar tablas en lugar de párrafos donde sea posible
> ✅ Preferir listas y código sobre explicaciones largas en prosa
> ✅ Si el contenido es muy largo, dividirlo en múltiples archivos
> ❌ No generar documentos excesivamente verbosos en una sola llamada

**Tags**: #herramientas #error #documentacion #tokens

---

## 🔖 Índice Rápido de Aprendizajes

| Fecha | Categoría | Error | Regla aprendida |
|---|---|---|---|
| 2026-05-04 | Herramientas | `view_file` en directorio | Usar `list_dir` para dirs, `view_file` para archivos |
| 2026-05-04 | Herramientas | Token limit excedido | Ser conciso, usar tablas, dividir en archivos si es necesario |

---

## 🏷️ Tags Disponibles

- `#tailwind` — Errores relacionados con Tailwind CSS
- `#tailwindv4` — Específico de Tailwind v4
- `#firebase` — Auth, Firestore, Storage
- `#typescript` — Errores de tipado
- `#react` — Componentes, hooks, state
- `#owasp` — Seguridad
- `#herramientas` — Errores al usar las herramientas del agente
- `#workflow` — Proceso de desarrollo
- `#documentacion` — Archivos de documentación
- `#tokens` — Límites de tokens del modelo
- `#inicio` — Entradas de inicialización
- `#motion` — Librería de animaciones
- `#pnpm` — Package manager
- `#vite` — Build tool

---

## 📌 Notas Permanentes (No borrar)

### Sobre Tailwind CSS v4
```
❌ NO existe tailwind.config.js
✅ Config va en CSS con @theme inline {}
✅ Dark mode: @custom-variant dark (&:is(.dark *))
✅ Importar: @import "tailwindcss"
```

### Sobre Motion (animaciones)
```
❌ import { motion } from 'framer-motion'  // INCORRECTO
✅ import { motion } from 'motion/react'   // CORRECTO
```

### Sobre Firebase Security Rules
```
❌ allow read, write: if true;  // NUNCA en producción
✅ allow read, write: if request.auth.uid == userId;
```

### Sobre el Stack actual
```
React 18.3.1 + Vite 6.3.5 + TypeScript + Tailwind 4.1.12
Radix UI + Lucide + Motion 12.23.24
React Hook Form 7.55.0 + Recharts + Sonner
Package manager: pnpm
Backend: Firebase (pendiente de integrar)
```

---

*Este archivo es autoescrito por el agente. Se actualiza con cada corrección para crear un bucle de mejora continua.*
