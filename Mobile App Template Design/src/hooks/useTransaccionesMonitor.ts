// src/hooks/useTransaccionesMonitor.ts
// Monitor de gastos estático (sin IA).
// Avisa al usuario cuando se registra un gasto y cuando se acerca a su límite.

import { useEffect, useRef } from 'react';
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  mostrarAlertaEnInterfaz?: (mensaje: string) => void;
};

export function useTransaccionesMonitor({
  userId,
  totalGastado,
  limiteActual,
  onAlerta,
  mostrarAlertaEnInterfaz,
}: Props) {
  const procesadosRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const enviarNotificacionNativa = (titulo: string, cuerpo: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, {
        body: cuerpo,
        icon: '/logo.png',
      });
    }
  };

  useEffect(() => {
    if (!userId) return;

    const expensesRef = collection(db, 'users', userId, 'expenses');
    // Consulta simple sin ordenamiento para evitar necesidad de índices compuestos
    const q = query(expensesRef, where('procesado', '==', false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type !== 'added') return;

        const docId = change.doc.id;
        if (procesadosRef.current.has(docId)) return;
        procesadosRef.current.add(docId);

        // Carga inicial: marcar como procesado sin avisar
        if (isInitialLoad.current) {
          try {
            await updateDoc(doc(db, 'users', userId, 'expenses', docId), { procesado: true });
          } catch { /* silencioso */ }
          return;
        }

        // --- Gasto NUEVO detectado ---
        const datos = change.doc.data();
        const monto: number = datos.amount ?? 0;
        const comercio: string = datos.note ?? datos.category ?? 'Gasto';
        const nuevoTotal = totalGastado + monto;
        const porcentaje = (nuevoTotal / limiteActual) * 100;

        // Determinar nivel y mensaje estático
        let nivel: AlertaCybercore['nivel'] = 'info';
        let tituloAlerta = 'Gasto registrado';
        let mensajeAlerta = `Has gastado $${monto} en ${comercio}.`;

        if (porcentaje > 90) {
          nivel = 'critico';
          tituloAlerta = '⚠️ ¡Límite casi alcanzado!';
          mensajeAlerta = `Atención: Has gastado el ${porcentaje.toFixed(0)}% de tu presupuesto quincenal.`;
        } else if (porcentaje > 65) {
          nivel = 'alerta';
          tituloAlerta = '👀 Cuidado con tus gastos';
          mensajeAlerta = `Has superado el 65% de tu límite ($${nuevoTotal.toFixed(0)} / $${limiteActual}).`;
        }

        // Notificar
        enviarNotificacionNativa(tituloAlerta, mensajeAlerta);
        mostrarAlertaEnInterfaz?.(mensajeAlerta);

        onAlerta({
          id: docId,
          titulo: tituloAlerta,
          mensaje: mensajeAlerta,
          nivel,
          monto,
          comercio,
          timestamp: (datos.date as Timestamp)?.toDate() ?? new Date(),
        });

        // Marcar como procesado
        try {
          await updateDoc(doc(db, 'users', userId, 'expenses', docId), { procesado: true });
        } catch {
          console.warn('[Monitor] Error al marcar procesado:', docId);
        }
      });

      isInitialLoad.current = false;
    });

    return () => {
      unsubscribe();
      procesadosRef.current.clear();
      isInitialLoad.current = true;
    };
  }, [userId, totalGastado, limiteActual, onAlerta, mostrarAlertaEnInterfaz]);
}
