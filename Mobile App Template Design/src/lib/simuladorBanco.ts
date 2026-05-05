// src/lib/simuladorBanco.ts
// Simula gastos entrantes de un banco para probar el monitor IA.
// Escribe en users/{userId}/transacciones con procesado: false.

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const COMERCIOS = ['Oxxo', '7-Eleven', 'Amazon', 'Uber', 'Starbucks', 'Steam', 'Netflix', 'Rappi'];

/**
 * Simula un gasto bancario entrante para el usuario autenticado.
 * @param userId UID del usuario actual (OWASP A01: siempre con userId)
 */
export const simularGastoEntrante = async (userId: string): Promise<void> => {
  if (!userId) throw new Error('userId requerido');

  const gastoAleatorio = {
    comercio: COMERCIOS[Math.floor(Math.random() * COMERCIOS.length)],
    monto: Math.floor(Math.random() * 500) + 50, // Gastos entre $50 y $550
    fecha: serverTimestamp(),
    procesado: false,
  };

  await addDoc(collection(db, 'users', userId, 'transacciones'), gastoAleatorio);
  console.log('🏦 Banco: Nuevo gasto detectado →', gastoAleatorio.comercio, '$' + gastoAleatorio.monto);
};
