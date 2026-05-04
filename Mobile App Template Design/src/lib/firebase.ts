// src/lib/firebase.ts
// Inicialización central de Firebase — fuente de verdad para todos los servicios.
// Las credenciales se leen desde variables de entorno Vite (OWASP A02).

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Evita inicializar más de una vez (útil en hot-reload con Vite)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth — Firebase maneja sessions y tokens (OWASP A07)
export const auth = getAuth(app);

// Firestore — Siempre usar con userId en las queries (OWASP A01)
export const db = getFirestore(app);

// Storage — Para fotos de recibos y perfil de usuario
export const storage = getStorage(app);

// Analytics — Solo se inicializa si el browser lo soporta (no en SSR/tests)
export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);

export default app;
