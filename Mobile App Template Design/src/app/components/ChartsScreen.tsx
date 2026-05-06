import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Expense, Category } from '../App';

type ChartsScreenProps = {
  expenses: Expense[];
  categories: Category[];
  onBack: () => void;
};

export default function ChartsScreen({ expenses, categories, onBack }: ChartsScreenProps) {
  // ─── Preparar datos para Gráfica de Pastel (Categorías) ──────────────────────
  const pieData = useMemo(() => {
    return categories
      .filter(cat => cat.spent > 0)
      .map(cat => ({
        name: cat.name,
        value: cat.spent,
        color: cat.color.split(' ')[0].replace('from-', '').replace('-500', '')
      }));
  }, [categories]);

  // ─── Preparar datos para Gráfica de Área (Tendencia 7 días) ──────────────────
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    
    return last7Days.map(day => {
      const dailyTotal = expenses
        .filter(exp => isSameDay(new Date(exp.date), day))
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        date: format(day, 'EEE', { locale: es }),
        amount: dailyTotal
      };
    });
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgDaily = totalSpent / 7;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Análisis de Gastos
        </h2>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-24">
        {/* Resumen Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Total Quincena</span>
            </div>
            <p className="text-xl font-bold">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Promedio Diario</span>
            </div>
            <p className="text-xl font-bold">${avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </motion.div>

        {/* Distribución por Categoría */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <PieChartIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-300">Distribución por Categoría</h3>
          </div>
          
          <div className="h-64 w-full bg-slate-900/30 rounded-[2rem] border border-slate-800/30 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.color})`} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Tendencia Semanal */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-300">Tendencia últimos 7 días</h3>
          </div>
          
          <div className="h-64 w-full bg-slate-900/30 rounded-[2rem] border border-slate-800/30 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Insights Card */}
        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm">Resumen Inteligente</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Categoría Mayor</span>
              <span className="text-xs font-bold text-white">
                {pieData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Variación Semanal</span>
              <div className="flex items-center gap-1 text-emerald-400">
                <ArrowDownRight className="w-3 h-3" />
                <span className="text-xs font-bold">-12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Definición de colores para las gráficas en CSS inline (usando variables de Tailwind que existen en theme.css) */}
      <style>{`
        :root {
          --color-pink: #ec4899;
          --color-rose: #f43f5e;
          --color-blue: #3b82f6;
          --color-cyan: #06b6d4;
          --color-purple: #a855f7;
          --color-violet: #8b5cf6;
          --color-indigo: #6366f1;
          --color-fuchsia: #d946ef;
        }
      `}</style>
    </div>
  );
}
