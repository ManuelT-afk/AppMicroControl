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
