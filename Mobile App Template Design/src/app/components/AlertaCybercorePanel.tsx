// src/app/components/AlertaCybercorePanel.tsx
// Panel de notificaciones IA en tiempo real — diseño consistente con la app.

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import { AlertaCybercore } from '../../hooks/useTransaccionesMonitor';

type Props = {
  alertas: AlertaCybercore[];
  onDismiss: (id: string) => void;
};

// ─── Paleta consistente con el sistema de diseño de la app ──────────────────
const CONFIG_NIVEL = {
  info: {
    accent:   'from-blue-500 via-purple-500 to-pink-500', // Gradiente principal de la app
    iconBg:   'bg-blue-500/15 text-blue-400',
    dot:      'bg-blue-400',
    label:    'Análisis IA',
    Icon:     CheckCircle,
    bar:      'from-blue-500 via-purple-500 to-pink-500',
    autoDismiss: true,
  },
  alerta: {
    accent:   'from-violet-500 to-purple-600',
    iconBg:   'bg-violet-500/15 text-violet-400',
    dot:      'bg-violet-400',
    label:    'Atención',
    Icon:     AlertTriangle,
    bar:      'from-violet-500 to-purple-500',
    autoDismiss: false,
  },
  critico: {
    accent:   'from-pink-500 to-rose-600',
    iconBg:   'bg-rose-500/15 text-rose-400',
    dot:      'bg-rose-400',
    label:    'Límite próximo',
    Icon:     ShieldAlert,
    bar:      'from-pink-500 to-rose-500',
    autoDismiss: false,
  },
} as const;

// ─── Tarjeta individual ──────────────────────────────────────────────────────
function AlertaCard({
  alerta,
  onDismiss,
}: {
  alerta: AlertaCybercore;
  onDismiss: () => void;
}) {
  const cfg = CONFIG_NIVEL[alerta.nivel];
  const { Icon } = cfg;

  // Auto-dismiss para nivel info (igual que los toasts de la app)
  useEffect(() => {
    if (!cfg.autoDismiss) return;
    const t = setTimeout(onDismiss, 7000);
    return () => clearTimeout(t);
  }, [cfg.autoDismiss, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      className="relative w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden"
    >
      {/* Línea de acento superior — usa el gradiente del nivel */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${cfg.accent}`} />

      <div className="p-4">
        {/* Encabezado: badge + Gemini + cerrar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Indicador de nivel */}
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className="text-slate-400 text-[11px] font-medium">{cfg.label}</span>

            {/* Badge Gemini IA — igual al estilo de pills de la app */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
              <Zap className="w-2.5 h-2.5 text-purple-400" />
              <span className="text-[10px] text-purple-400 font-medium">Gemini</span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${cfg.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-snug">
              {alerta.titulo}
            </p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              {alerta.mensaje}
            </p>

            {/* Meta: monto y comercio — igual que los gastos recientes en HomeScreen */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-white text-xs font-bold">
                ${alerta.monto.toLocaleString()}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-slate-500 text-xs">{alerta.comercio}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso auto-dismiss (solo info) */}
      {cfg.autoDismiss && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 7, ease: 'linear' }}
          className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${cfg.bar} origin-left`}
        />
      )}
    </motion.div>
  );
}

// ─── Panel contenedor ────────────────────────────────────────────────────────
export default function AlertaCybercorePanel({ alertas, onDismiss }: Props) {
  return (
    <div className="absolute top-4 right-0 left-0 z-[200] px-4 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alertas.slice(0, 3).map((alerta) => (
          <div key={alerta.id} className="pointer-events-auto">
            <AlertaCard
              alerta={alerta}
              onDismiss={() => onDismiss(alerta.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
