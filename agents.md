# 🤖 AGENTS.MD — Constitución de los Agentes IA
> **AppMicroGastos** · v1.0 · Actualizado: 2026-05-04
> Agentes: **Claude Sonnet** & **Gemini**

---

## 📱 Descripción del Proyecto

**AppMicroGastos** es una app móvil de control de micro-gastos para el mercado latinoamericano. Permite registrar, categorizar y visualizar gastos quincenales de forma intuitiva.

- **Viewport objetivo**: 390×844px (iPhone 14 Pro)
- **Idioma**: Español (es-MX)
- **Fase actual**: Diseño UI → Desarrollo Full-Stack

### Pantallas implementadas
| Pantalla | Archivo | Estado |
|---|---|---|
| Welcome | `WelcomeScreen.tsx` | ✅ |
| Login | `LoginScreen.tsx` | ✅ |
| Register | `RegisterScreen.tsx` | ✅ |
| Onboarding | `OnboardingScreen.tsx` | ✅ |
| Home | `HomeScreen.tsx` | ✅ |
| Empty State | `EmptyStateScreen.tsx` | ✅ |
| Budget | `BudgetScreen.tsx` | ✅ |
| Add Expense Modal | `AddExpenseModal.tsx` | ✅ |

---

## 🤖 Agentes IA

### Claude Sonnet (Principal)
- **Rol**: Arquitecto de código, features, seguridad OWASP, refactoring
- **Debe hacer**: Leer `agents.md` + `memory.md` ANTES de toda tarea. Actualizar `memory.md` después de cada corrección.

### Gemini (Soporte)
- **Rol**: Diseño UI/UX, generación de assets, análisis visual
- **Debe hacer**: Validar resultados visualmente, research de librerías.

### Protocolo
```
1. Leer agents.md y memory.md
2. Entender el contexto actual
3. Implementar siguiendo la Constitución
4. Validar OWASP compliance
5. Documentar en memory.md
```

---

## ⚙️ CONSTITUCIÓN DEL STACK

> **REGLA DE ORO**: Esta Constitución es la fuente de verdad. No cambiar versiones sin actualizarla.

### Frontend Core
| Tecnología | Versión | Notas críticas |
|---|---|---|
| React | **18.3.1** | peerDependency |
| Vite | **6.3.5** | Build tool |
| TypeScript | `.tsx` implícito | Tipado estático |
| Tailwind CSS | **4.1.12** | v4 ≠ v3, ver abajo |

> ⚠️ **Tailwind v4**: NO usar `tailwind.config.js`. Config va en CSS via `@theme inline {}`. Dark mode: `@custom-variant dark (&:is(.dark *))`.

### UI Components
| Librería | Versión | Uso |
|---|---|---|
| Radix UI | múltiple | Componentes accesibles headless |
| Lucide React | `0.487.0` | Íconos SVG |
| Motion (ex Framer) | `12.23.24` | Animaciones |

> ⚠️ **Motion**: Import es `import { motion } from 'motion/react'`, NO `framer-motion`.

### Utilidades
| Librería | Versión | Uso |
|---|---|---|
| React Hook Form | `7.55.0` | Formularios |
| Class Variance Authority | `0.7.1` | Variantes CSS |
| Date-fns | `3.6.0` | Fechas |
| Clsx | `2.1.1` | CSS condicional |
| Tailwind Merge | `3.2.0` | Merge clases |
| Sonner | `2.0.3` | Toasts |

### Extras Instalados
| Librería | Versión | Uso |
|---|---|---|
| MUI + Emotion | `7.3.5` / `11.x` | Sistema diseño secundario |
| Recharts | `2.15.2` | Gráficas |
| React DnD | `16.0.1` | Drag and drop |
| Embla Carousel | `8.6.0` | Carruseles |
| React Router | `7.13.0` | Navegación (a escalar) |
| Canvas Confetti | `1.9.4` | Celebraciones |

### Backend Firebase (Pendiente de integrar)
| Servicio | Propósito | Estado |
|---|---|---|
| Firebase Auth | Autenticación | 🔲 Pendiente |
| Google Sign-In | OAuth | 🔲 Pendiente |
| Cloud Firestore | DB NoSQL tiempo real | 🔲 Pendiente |
| Firebase Storage | Fotos recibos/perfil | 🔲 Pendiente |
| Firebase Hosting | Deploy producción | 🔲 Pendiente |

### Package Manager
- **Principal**: `pnpm` (pnpm-workspace.yaml presente)
- **NUNCA** mezclar lockfiles npm/yarn/pnpm

---

## 🏗️ Arquitectura

```
d:\proyectosAnti\appMicroGastos\
├── agents.md          ← Esta Constitución
├── memory.md          ← Memoria del agente
└── Mobile App Template Design\
    ├── package.json
    ├── vite.config.ts
    └── src\
        ├── main.tsx
        ├── imports\
        ├── styles\
        │   ├── theme.css     ← CSS Variables sistema diseño
        │   ├── globals.css
        │   ├── fonts.css
        │   └── tailwind.css
        └── app\
            ├── App.tsx       ← Router de pantallas (estado local)
            └── components\
                ├── ui\       ← Componentes base Radix/Shadcn
                ├── figma\    ← Componentes de Figma
                └── [Screens].tsx
```

### Tipos Core (App.tsx — fuente de verdad)
```typescript
type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: Date;
  isImpulsive?: boolean;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  color: string; // Tailwind gradient class
};
```

### Flujo de Pantallas
```
Welcome → Login ──────┐
        → Register ───┴→ Onboarding → EmptyState → Home → Budget
                                                       ↑
                                               AddExpenseModal
```

---

## 🎯 Features & Objetivos

### MVP v1.0 (Actual)
- [x] Pantallas de auth mock (Welcome, Login, Register)
- [x] Onboarding
- [x] Dashboard con balance quincenal
- [x] Categorías con presupuesto y progreso visual
- [x] Modal agregar gastos
- [x] Vista gastos recientes
- [x] Gestión de presupuestos

### v2.0 — Próximo Sprint
- [ ] Auth real con Firebase (Google + Email/Password)
- [ ] Persistencia en Cloud Firestore
- [ ] Historial completo de gastos con filtros
- [ ] Gráficas con Recharts (pie/bar)
- [ ] Modo impulso (gastos impulsivos con análisis)
- [ ] Notificaciones de límite presupuestal
- [ ] Foto de recibo (Firebase Storage)

### v3.0 — Futuro
- [ ] Metas de ahorro
- [ ] Análisis con IA
- [ ] Gastos compartidos
- [ ] PWA + instalable
- [ ] Widgets de pantalla de inicio

---

## 🛡️ OWASP Top 10 — Reglas Aplicadas

| # | Vulnerabilidad | Regla para este proyecto |
|---|---|---|
| A01 | Control de Acceso Roto | Cada doc Firestore lleva `userId`. Security Rules obligatorias. |
| A02 | Fallos Criptográficos | Credenciales solo via Firebase Auth. Variables en `.env`. HTTPS siempre. |
| A03 | Inyección | Usar Firestore SDK (queries parametrizadas). Validar inputs con RHF+Zod. |
| A04 | Diseño Inseguro | Security Rules antes de deploy. Mínimo privilegio en Cloud Functions. |
| A05 | Config Incorrecta | NUNCA `allow read, write: if true` en producción. |
| A06 | Componentes Vulnerables | `pnpm audit` antes de cada release. No paquetes abandonados. |
| A07 | Auth Fallida | Firebase maneja sessions. Logout limpia localStorage. Redirigir si token expirado. |
| A08 | Integridad de Datos | Validar en cliente (Zod) Y en servidor (Security Rules). TypeScript siempre. |
| A09 | Logging Insuficiente | Firebase Analytics + Crashlytics. NO loguear passwords/tokens. |
| A10 | SSRF | Whitelist de dominios. Usar Firebase SDK, no fetch directo. |

---

## 📝 Convenciones de Código

```typescript
// ✅ Tipos explícitos siempre
type Props = { amount: number; category: string };

// ❌ any sin justificación
const handle = (data: any) => {};

// ✅ Optional chaining
const color = category?.color ?? 'default';

// ✅ Firestore con userId
const ref = collection(db, 'users', userId, 'expenses');

// ❌ Colección global sin protección
const ref = collection(db, 'expenses');
```

---

## 🚫 Reglas Absolutas (Sin Excepciones)

1. **NO** cambiar versiones del stack sin actualizar esta Constitución
2. **NO** usar `any` en TypeScript sin comentario justificativo
3. **NO** hardcodear credenciales Firebase o API keys
4. **NO** hacer deploy sin Firestore Security Rules configuradas
5. **NO** skipear validación de formularios
6. **SIEMPRE** leer `memory.md` antes de comenzar
7. **SIEMPRE** actualizar `memory.md` tras corregir un error
8. **SIEMPRE** usar `motion/react` (no `framer-motion`)
9. **SIEMPRE** aplicar principios OWASP en features con datos de usuario
10. **SIEMPRE** documentar cambios significativos aquí

---
*Este archivo es la fuente de verdad. Cualquier decisión que lo contradiga debe justificarse y actualizarse aquí primero.*
