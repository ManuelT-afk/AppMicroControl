import { Plus, Utensils, Car, Cookie, PartyPopper, CreditCard, ShoppingBag, ChevronRight, Settings, LogOut, Search, PieChart as PieChartIcon } from 'lucide-react';
import { Category, Expense } from '../App';

type HomeScreenProps = {
  categories: Category[];
  expenses: Expense[];
  totalBudget: number;
  totalSpent: number;
  userName: string;
  onAddExpense: () => void;
  onViewBudget: () => void;
  onOpenSettings: () => void;
  onOpenCharts: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
};

const iconMap: Record<string, any> = {
  utensils: Utensils,
  car: Car,
  cookie: Cookie,
  'party-popper': PartyPopper,
  'credit-card': CreditCard,
  'shopping-bag': ShoppingBag,
};

export default function HomeScreen({
  categories, expenses, totalBudget, totalSpent, userName,
  onAddExpense, onViewBudget, onOpenSettings, onOpenCharts, onOpenHistory, onLogout,
}: HomeScreenProps) {
  const remaining = totalBudget - totalSpent;
  const progress = (totalSpent / totalBudget) * 100;

  const recentExpenses = expenses.slice(-3).reverse();

  return (
    <div className="size-full bg-slate-950 flex flex-col overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

        <div className="relative z-10 p-6 space-y-4">
          {/* Fila 1: Saludo + botones de acción */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Hola, {userName ? userName.split(' ')[0] : 'bienvenido'} 👋</p>
              <p className="text-slate-500 text-xs">Quincenal disponible</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenHistory}
                className="p-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Historial"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenCharts}
                className="p-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Estadísticas"
              >
                <PieChartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-xl bg-slate-900/50 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white transition-all"
                title="Ajustes"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fila 2: Balance + Ring de progreso */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl text-white font-bold">
                ${remaining.toLocaleString()}
              </h1>
              <p className="text-slate-500 text-xs mt-1">{Math.round(progress)}% del presupuesto usado</p>
            </div>

            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-slate-800" />
                <circle
                  cx="40" cy="40" r="32"
                  stroke="url(#gradient)" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(progress, 100) / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Fila 3: Stats */}
          <div className="flex gap-3 text-sm">
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-slate-800/50">
              <p className="text-slate-500">Presupuesto</p>
              <p className="text-white mt-0.5">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-slate-800/50">
              <p className="text-slate-500">Gastado</p>
              <p className="text-white mt-0.5">${totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Categorías</h3>
            <button
              onClick={onViewBudget}
              className="text-purple-400 text-sm flex items-center gap-1 hover:text-purple-300 transition-colors"
            >
              Ver todo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:gap-4 gap-3">
            {categories.slice(0, 4).map((category) => {
              const Icon = iconMap[category.icon];
              const categoryProgress = (category.spent / category.budget) * 100;

              return (
                <div
                  key={category.id}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-800/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">{category.name}</p>
                      <p className="text-white text-sm mt-0.5">${category.spent}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(categoryProgress, 100)}%` }}
                      />
                    </div>
                    <p className="text-slate-500 text-xs">
                      ${category.budget - category.spent} restante
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {recentExpenses.length > 0 && (
          <div>
            <h3 className="text-white mb-4">Últimos gastos</h3>
            <div className="space-y-2">
              {recentExpenses.map((expense) => {
                const category = categories.find(c => c.name === expense.category);
                const Icon = category ? iconMap[category.icon] : ShoppingBag;

                return (
                  <div
                    key={expense.id}
                    className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800/50 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category?.color || 'from-slate-600 to-slate-700'} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{expense.note || expense.category}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{expense.category}</p>
                    </div>
                    <p className="text-white">-${expense.amount}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <button
          onClick={onAddExpense}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar gasto</span>
        </button>
      </div>
    </div>
  );
}
