import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown,
  Utensils, 
  Car, 
  Cookie, 
  PartyPopper, 
  CreditCard, 
  ShoppingBag 
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Expense, Category } from '../App';

const CATEGORY_ICONS: Record<string, any> = {
  'utensils': Utensils,
  'car': Car,
  'cookie': Cookie,
  'party-popper': PartyPopper,
  'credit-card': CreditCard,
  'shopping-bag': ShoppingBag,
};

type HistoryScreenProps = {
  expenses: Expense[];
  categories: Category[];
  onBack: () => void;
};

export default function HistoryScreen({ expenses, categories, onBack }: HistoryScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ─── Lógica de Filtrado y Ordenamiento ─────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Búsqueda por nota
    if (searchTerm) {
      result = result.filter(exp => 
        exp.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory) {
      result = result.filter(exp => exp.category === selectedCategory);
    }

    // Ordenamiento
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    return result;
  }, [expenses, searchTerm, selectedCategory, sortBy, sortOrder]);

  const toggleSort = (type: 'date' | 'amount') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 space-y-6 bg-slate-900/40 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">Historial de Gastos</h2>
          <div className="w-9" />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar gasto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-slate-800 transition-all"
            />
          </div>
          <button className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-purple-500/50 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === null 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.name 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Sort Controls */}
      <div className="px-6 py-4 flex items-center justify-between text-xs text-slate-500 bg-slate-950/80 sticky top-[180px] z-10 backdrop-blur-sm">
        <span>Mostrando {filteredExpenses.length} resultados</span>
        <div className="flex gap-4">
          <button 
            onClick={() => toggleSort('date')}
            className={`flex items-center gap-1 transition-colors ${sortBy === 'date' ? 'text-purple-400 font-bold' : ''}`}
          >
            Fecha <ArrowUpDown className="w-3 h-3" />
          </button>
          <button 
            onClick={() => toggleSort('amount')}
            className={`flex items-center gap-1 transition-colors ${sortBy === 'amount' ? 'text-purple-400 font-bold' : ''}`}
          >
            Monto <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">No se encontraron gastos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense, index) => {
              const category = categories.find(c => c.name === expense.category);
              const Icon = category ? CATEGORY_ICONS[category.icon] : ShoppingBag;
              
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800/50 flex items-center gap-4 hover:bg-slate-900 transition-colors"
                >
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${category?.color || 'from-slate-700 to-slate-800'} text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{expense.note}</p>
                      <p className="font-bold text-sm text-white">${expense.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <span className="font-medium text-slate-400">{expense.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(expense.date), "d 'de' MMM, HH:mm", { locale: es })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
