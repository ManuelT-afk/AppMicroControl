import { ChevronLeft, Utensils, Car, Cookie, PartyPopper, CreditCard, ShoppingBag } from 'lucide-react';
import { Category } from '../App';

type BudgetScreenProps = {
  categories: Category[];
  onBack: () => void;
};

const iconMap: Record<string, any> = {
  utensils: Utensils,
  car: Car,
  cookie: Cookie,
  'party-popper': PartyPopper,
  'credit-card': CreditCard,
  'shopping-bag': ShoppingBag,
};

export default function BudgetScreen({ categories, onBack }: BudgetScreenProps) {
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="size-full bg-slate-950 flex flex-col">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

        <div className="relative z-10 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 flex items-center justify-center hover:bg-slate-800/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl text-white">Presupuesto Quincenal</h1>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total disponible</p>
                <p className="text-3xl text-white mt-1">${remaining.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Presupuesto</p>
                <p className="text-white mt-1">${totalBudget.toLocaleString()}</p>
              </div>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-400">Gastado: ${totalSpent.toLocaleString()}</p>
              <p className="text-purple-400">{Math.round((totalSpent / totalBudget) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {categories.map((category) => {
          const Icon = iconMap[category.icon];
          const progress = (category.spent / category.budget) * 100;
          const remaining = category.budget - category.spent;

          return (
            <div
              key={category.id}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-800/50 space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white">{category.name}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">
                    ${category.spent} de ${category.budget}
                  </p>
                </div>

                <div className="text-right">
                  <p className={`${remaining >= 0 ? 'text-white' : 'text-red-400'}`}>
                    ${Math.abs(remaining)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {remaining >= 0 ? 'restante' : 'excedido'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-slate-500 text-xs text-right">{Math.round(progress)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
