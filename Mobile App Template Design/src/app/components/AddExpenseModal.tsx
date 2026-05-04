import { useState } from 'react';
import { X, Utensils, Car, Cookie, PartyPopper, CreditCard, ShoppingBag, AlertCircle } from 'lucide-react';
import { Category } from '../App';

type AddExpenseModalProps = {
  categories: Category[];
  onClose: () => void;
  onAdd: (expense: { amount: number; category: string; note: string; isImpulsive?: boolean }) => void;
};

const iconMap: Record<string, any> = {
  utensils: Utensils,
  car: Car,
  cookie: Cookie,
  'party-popper': PartyPopper,
  'credit-card': CreditCard,
  'shopping-bag': ShoppingBag,
};

export default function AddExpenseModal({ categories, onClose, onAdd }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [showReflection, setShowReflection] = useState(false);
  const [isImpulsive, setIsImpulsive] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (!showReflection && numAmount > 100) {
      setShowReflection(true);
      return;
    }

    onAdd({
      amount: numAmount,
      category: selectedCategory,
      note: note || 'Sin descripción',
      isImpulsive: isImpulsive || undefined,
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl text-white">Registrar gasto</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {!showReflection ? (
          <div className="p-6 space-y-6">
            <div>
              <label className="text-slate-400 text-sm block mb-3">Monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-2xl">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-4 text-white text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-3">Categoría</label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon];
                  const isSelected = selectedCategory === category.name;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                      </div>
                      <p className="text-white text-xs text-center">{category.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-3">Nota (opcional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="¿En qué gastaste?"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!amount || !selectedCategory}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              Registrar
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl text-white">Pausa reflexiva</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Antes de registrar este gasto de ${amount}, tómate un momento para reflexionar.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-white text-center">¿Este gasto es...?</p>

              <button
                onClick={() => {
                  setIsImpulsive(true);
                  handleSubmit();
                }}
                className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-left hover:border-purple-500 transition-all"
              >
                <p className="text-white">Un "me lo merezco"</p>
                <p className="text-slate-400 text-sm mt-1">Un antojo o gasto impulsivo del momento</p>
              </button>

              <button
                onClick={() => {
                  setIsImpulsive(false);
                  handleSubmit();
                }}
                className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-left hover:border-purple-500 transition-all"
              >
                <p className="text-white">Algo que necesito</p>
                <p className="text-slate-400 text-sm mt-1">Me acerca a mis metas o es necesario</p>
              </button>
            </div>

            <button
              onClick={() => setShowReflection(false)}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
