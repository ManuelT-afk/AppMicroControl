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
