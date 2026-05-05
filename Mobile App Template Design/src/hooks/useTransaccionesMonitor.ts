// src/hooks/useTransaccionesMonitor.ts
// Escucha transacciones no procesadas en Firestore en tiempo real.
// Al detectar una nueva, llama a Gemini IA y muestra alerta Cybercore.

import { useEffect, useRef } from 'react';
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { obtenerAdvertenciaIA } from '../lib/aiConfig';

export type AlertaCybercore = {
  id: string;
  titulo: string;
  mensaje: string;
  nivel: 'info' | 'alerta' | 'critico';
  monto: number;
  comercio: string;
  timestamp: Date;
};

type Props = {
  userId: string | null;
  totalGastado: number;
  limiteActual: number;
  onAlerta: (alerta: AlertaCybercore) => void;
};

export function useTransaccionesMonitor({
  userId, totalGastado, limiteActual, onAlerta,
}: Props) {
  // Ref para evitar procesar la misma transacción dos veces
  const procesadosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Solo escuchar si hay sesión activa (OWASP A01)
    if (!userId) return;

    // Escuchar transacciones no procesadas del usuario
    const transaccionesRef = collection(db, 'users', userId, 'transacciones');
    const q = query(transaccionesRef, where('procesado', '==', false));

    const unsub = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type !== 'added') return;

        const docId = change.doc.id;

        // Evitar doble procesamiento (hot reload / multiple renders)
        if (procesadosRef.current.has(docId)) return;
        procesadosRef.current.add(docId);

        const datos = change.doc.data();
        const monto: number = datos.monto ?? 0;
        const comercio: string = datos.comercio ?? 'Comercio';

        try {
          // 1. Llamar a Gemini IA para análisis del gasto
          const advertencia = await obtenerAdvertenciaIA(
            monto,
            comercio,
            limiteActual,
            totalGastado
          );

          // 2. Emitir alerta Cybercore a la UI
          onAlerta({
            id: docId,
            ...advertencia,
            monto,
            comercio,
            timestamp: (datos.fecha as Timestamp)?.toDate() ?? new Date(),
          });

          // 3. Marcar como procesado en Firestore para no repetir
          await updateDoc(
            doc(db, 'users', userId, 'transacciones', docId),
            { procesado: true }
          );
        } catch {
          // Silencioso: no interrumpir la app si falla el análisis IA
          console.warn('[Monitor] Error procesando transacción:', docId);
        }
      });
    });

    return () => {
      unsub();
      procesadosRef.current.clear();
    };
  }, [userId, totalGastado, limiteActual, onAlerta]);
}
