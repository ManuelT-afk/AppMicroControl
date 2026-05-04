import { Plus, Wallet } from 'lucide-react';

type EmptyStateScreenProps = {
  onAddExpense: () => void;
};

export default function EmptyStateScreen({ onAddExpense }: EmptyStateScreenProps) {
  return (
    <div className="size-full bg-slate-950 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-5 blur-3xl" />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 z-10">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center">
          <Wallet className="w-16 h-16 text-slate-600" strokeWidth={1.5} />
        </div>

        <div className="text-center space-y-3 px-4">
          <h2 className="text-2xl text-white">
            Comienza a registrar
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Aún no tienes gastos registrados. Empieza a controlar tus microgastos hoy.
          </p>
        </div>
      </div>

      <button
        onClick={onAddExpense}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all z-10"
      >
        <Plus className="w-5 h-5" />
        <span>Registrar primer gasto</span>
      </button>
    </div>
  );
}
