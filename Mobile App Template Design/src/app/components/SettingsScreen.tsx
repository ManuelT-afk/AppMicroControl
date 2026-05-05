import { ChevronLeft, ShieldCheck, ShieldAlert, DollarSign, Zap } from 'lucide-react';
import { motion } from 'motion/react';

type SettingsScreenProps = {
  maxLimit: number;
  isLocked: boolean;
  emergencyMode: boolean;
  onUpdateLimit: (limit: number) => void;
  onToggleLock: (locked: boolean) => void;
  onToggleEmergency: (emergency: boolean) => void;
  onBack: () => void;
};

export default function SettingsScreen({
  maxLimit,
  isLocked,
  emergencyMode,
  onUpdateLimit,
  onToggleLock,
  onToggleEmergency,
  onBack,
}: SettingsScreenProps) {
  return (
    <div className="size-full bg-slate-950 flex flex-col overflow-hidden">
      <div className="p-6 flex items-center gap-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-400" />
        </button>
        <h1 className="text-xl text-white font-semibold">Configuración de Control</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Bloqueo Maestro */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isLocked ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-400'}`}>
                {isLocked ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-white font-medium">Bloqueo de Gastos</h3>
                <p className="text-slate-500 text-xs">Impedir gastos tras superar el límite</p>
              </div>
            </div>
            <button
              onClick={() => onToggleLock(!isLocked)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${isLocked ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <motion.div
                animate={{ x: isLocked ? 24 : 4 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </section>

        {/* Límite de Gasto */}
        <section className="space-y-4">
          <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 text-purple-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="text-white font-medium">Límite de Gasto Hormiga</h3>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl text-white font-bold">${maxLimit}</span>
                <p className="text-slate-500 text-xs mt-2">Monto máximo permitido por quincena</p>
              </div>

              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={maxLimit}
                onChange={(e) => onUpdateLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <span>$100</span>
                <span>$2500</span>
                <span>$5000</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modo Emergencia */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <div className="bg-rose-500/10 rounded-3xl p-6 border border-rose-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-500">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Modo Emergencia</h3>
                  <p className="text-rose-500/70 text-xs italic">Omitir bloqueo temporalmente</p>
                </div>
              </div>
              <button
                onClick={() => onToggleEmergency(!emergencyMode)}
                className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${emergencyMode ? 'bg-rose-600' : 'bg-slate-700'}`}
              >
                <motion.div
                  animate={{ x: emergencyMode ? 24 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed">
              * El modo emergencia te permite registrar gastos vitales incluso si has superado tu límite. Úsalo con responsabilidad para no afectar tu salud financiera.
            </p>
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-all"
        >
          Guardar y volver
        </button>
      </div>
    </div>
  );
}
