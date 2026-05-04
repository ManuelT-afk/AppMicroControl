import { useState } from 'react';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import EmptyStateScreen from './components/EmptyStateScreen';
import AddExpenseModal from './components/AddExpenseModal';
import BudgetScreen from './components/BudgetScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import WelcomeScreen from './components/WelcomeScreen';

export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: Date;
  isImpulsive?: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  color: string;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'onboarding' | 'home' | 'empty' | 'budget'>('welcome');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Comida', icon: 'utensils', budget: 1500, spent: 0, color: 'from-pink-500 to-rose-500' },
    { id: '2', name: 'Transporte', icon: 'car', budget: 800, spent: 0, color: 'from-blue-500 to-cyan-500' },
    { id: '3', name: 'Antojos', icon: 'cookie', budget: 500, spent: 0, color: 'from-purple-500 to-pink-500' },
    { id: '4', name: 'Salidas', icon: 'party-popper', budget: 1000, spent: 0, color: 'from-violet-500 to-purple-500' },
    { id: '5', name: 'Suscripciones', icon: 'credit-card', budget: 300, spent: 0, color: 'from-indigo-500 to-blue-500' },
    { id: '6', name: 'Otros', icon: 'shopping-bag', budget: 400, spent: 0, color: 'from-fuchsia-500 to-pink-500' },
  ]);

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date(),
    };

    setExpenses([...expenses, newExpense]);

    setCategories(cats => cats.map(cat =>
      cat.name === expense.category
        ? { ...cat, spent: cat.spent + expense.amount }
        : cat
    ));

    setShowAddExpense(false);

    if (currentScreen === 'empty') {
      setCurrentScreen('home');
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('empty');
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="w-full max-w-[390px] h-full max-h-[844px] bg-slate-950 relative overflow-hidden shadow-2xl">
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onLogin={() => setCurrentScreen('login')}
            onRegister={() => setCurrentScreen('register')}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onSwitchToRegister={() => setCurrentScreen('register')}
            onLogin={() => setCurrentScreen('onboarding')}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterScreen
            onSwitchToLogin={() => setCurrentScreen('login')}
            onRegister={() => setCurrentScreen('onboarding')}
          />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {currentScreen === 'empty' && (
          <EmptyStateScreen onAddExpense={() => setShowAddExpense(true)} />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            categories={categories}
            expenses={expenses}
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            onAddExpense={() => setShowAddExpense(true)}
            onViewBudget={() => setCurrentScreen('budget')}
          />
        )}

        {currentScreen === 'budget' && (
          <BudgetScreen
            categories={categories}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {showAddExpense && (
          <AddExpenseModal
            categories={categories}
            onClose={() => setShowAddExpense(false)}
            onAdd={handleAddExpense}
          />
        )}
      </div>
    </div>
  );
}
