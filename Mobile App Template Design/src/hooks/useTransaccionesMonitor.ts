// src/hooks/useTransaccionesMonitor.ts
// Escucha SOLO transacciones NUEVAS en Firestore (ignora las existentes al inicio).
// Usa analizarGastoConIA (Antigravity) para generar el mensaje de alerta.

import { useEffect, useRef } from 'react';
import {
  collection, query, where, onSnapshot,
  updateDoc, doc, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { analizarGastoConIA } from '@/services/antigravity';

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
  // Flag: mientras es true, los docs son "existentes" (carga inicial) — no mostrar alertas
  const isInitialLoad = useRef(true);

  // ── Solicitar permisos al cargar ──────────────────────────────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const enviarNotificacionNativa = (titulo: string, cuerpo: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, {
        body: cuerpo,
        icon: '/logo.png', // Ajustar ruta si existe un logo
      });
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Ahora escuchamos la colección real de gastos
    const expensesRef = collection(db, 'users', userId, 'expenses');
    const q = query(
      expensesRef,
      where('procesado', '==', false),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type !== 'added') return;

        const docId = change.doc.id;

        // Evitar doble procesamiento en la misma sesión
        if (procesadosRef.current.has(docId)) return;
        procesadosRef.current.add(docId);

        // ── Carga inicial: silenciosamente marcar como procesado ──────────
        // onSnapshot dispara todos los docs existentes como "added" al suscribirse.
        // isInitialLoad evita mostrar alertas por transacciones viejas.
        if (isInitialLoad.current) {
          try {
            await updateDoc(
              doc(db, 'users', userId, 'expenses', docId),
              { procesado: true }
            );
          } catch { /* silencioso */ }
          return; // No mostrar alerta
        }

        // ── Transacción NUEVA (después de la carga inicial) ───────────────
        const datos = change.doc.data();
        const monto: number    = datos.amount ?? 0;
        const comercio: string = datos.note   ?? datos.category ?? 'Gasto';
        const saldoRestante    = Math.max(limiteActual - totalGastado, 0);

        try {
          // Llamar a Antigravity IA
          const respuestaIA = await analizarGastoConIA(monto, comercio, saldoRestante);
          
          // Emitir alerta tipada al panel visual
          const porcentaje = ((totalGastado + monto) / limiteActual) * 100;
          const nivel: AlertaCybercore['nivel'] =
            porcentaje > 90 ? 'critico' : porcentaje > 60 ? 'alerta' : 'info';

          const tituloAlerta = nivel === 'critico'
            ? '⚠️ Límite casi alcanzado'
            : nivel === 'alerta'
            ? '👀 Más de la mitad gastada'
            : '✅ Gasto detectado';

          // Enviar notificación nativa para niveles importantes
          if (nivel !== 'info') {
            enviarNotificacionNativa(`Antigravity: ${tituloAlerta}`, respuestaIA);
          }

          // Mostrar banner de texto
          mostrarAlertaEnInterfaz?.(respuestaIA);

          onAlerta({
            id: docId,
            titulo: tituloAlerta,
            mensaje: respuestaIA,
            nivel,
            monto,
            comercio,
            timestamp: (datos.fecha as Timestamp)?.toDate() ?? new Date(),
          });

          // Marcar como procesado para no repetir
          await updateDoc(
            doc(db, 'users', userId, 'expenses', docId),
            { procesado: true }
          );
        } catch {
          console.warn('[Monitor] Error procesando transacción:', docId);
        }
      });

      // Después del primer snapshot, ya no es carga inicial
      isInitialLoad.current = false;
    });

    return () => {
      unsubscribe();
      procesadosRef.current.clear();
      isInitialLoad.current = true;
    };
  }, [userId, totalGastado, limiteActual, onAlerta, mostrarAlertaEnInterfaz]);
}
