import { useState } from 'react';
import { ChevronLeft, ShieldCheck, ShieldAlert, DollarSign, Zap, LogOut, User, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SettingsScreenProps = {
  maxLimit: number;
  isLocked: boolean;
  emergencyMode: boolean;
  userName: string;
  onUpdateLimit: (limit: number) => void;
  onToggleLock: (locked: boolean) => void;
  onToggleEmergency: (emergency: boolean) => void;
  onLogout: () => void;
  onSimularGasto: () => void;
  onBack: () => void;
};

export default function SettingsScreen({
  maxLimit, isLocked, emergencyMode, userName,
  onUpdateLimit, onToggleLock, onToggleEmergency, onLogout, onSimularGasto, onBack,
}: SettingsScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="size-full bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-400" />
        </button>
        <h1 className="text-xl text-white font-semibold">Configuración</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Perfil del usuario */}
        <section className="bg-slate-900/50 rounded-3xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{userName || 'Usuario'}</p>
            <p className="text-slate-500 text-xs mt-0.5">Sesión activa</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        </section>

        {/* Bloqueo Maestro */}
        <section>
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
        <section className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 text-purple-400">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-white font-medium">Límite de Gasto Hormiga</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl text-white font-bold">${maxLimit.toLocaleString()}</span>
              <p className="text-slate-500 text-xs mt-2">Monto máximo permitido por quincena</p>
            </div>
            <input
              type="range" min="100" max="5000" step="100" value={maxLimit}
              onChange={(e) => onUpdateLimit(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-slate-500 px-1">
              <span>$100</span><span>$2,500</span><span>$5,000</span>
            </div>
          </div>
        </section>

        {/* Modo Emergencia */}
        <section className="pt-2 border-t border-slate-800">
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
              * Permite registrar gastos vitales incluso superando el límite. Úsalo con responsabilidad.
            </p>
          </div>
        </section>

        {/* Simulador IA — para pruebas */}
        <section className="pt-2 border-t border-slate-800">
          <div className="bg-purple-500/10 rounded-3xl p-5 border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Simulador de Banco IA</h3>
                <p className="text-purple-400/70 text-xs">Prueba el monitor Gemini en tiempo real</p>
              </div>
            </div>
            <button
              onClick={onSimularGasto}
              className="w-full py-3 rounded-2xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 active:scale-95 transition-all"
            >
              🏦 Simular gasto bancario
            </button>
          </div>
        </section>

        {/* Cerrar Sesión */}
        <section className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
          >
            <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium group-hover:text-red-300 transition-colors">Cerrar sesión</p>
              <p className="text-slate-500 text-xs">Tus datos quedan guardados en la nube</p>
            </div>
          </button>
        </section>

      </div>

      {/* Footer: Volver */}
      <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-all"
        >
          Guardar y volver
        </button>
      </div>

      {/* Modal confirmación de logout */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-slate-900 rounded-t-3xl p-8 border-t border-slate-800 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                  <LogOut className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl text-white font-semibold mt-4">¿Cerrar sesión?</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Todos tus gastos y configuración están guardados en la nube. Al volver a iniciar sesión los recuperarás automáticamente.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={onLogout}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                >
                  Sí, cerrar sesión
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 rounded-2xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
