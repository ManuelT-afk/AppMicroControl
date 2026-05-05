import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  Timestamp, doc, setDoc, getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import EmptyStateScreen from './components/EmptyStateScreen';
import AddExpenseModal from './components/AddExpenseModal';
import BudgetScreen from './components/BudgetScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsScreen from './components/SettingsScreen';

// ─── Tipos Core (fuente de verdad) ──────────────────────────────────────────
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

type Screen = 'welcome' | 'login' | 'register' | 'onboarding' | 'home' | 'empty' | 'budget' | 'settings';

// ─── Categorías por defecto ──────────────────────────────────────────────────
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Comida',         icon: 'utensils',      budget: 1500, spent: 0, color: 'from-pink-500 to-rose-500' },
  { id: '2', name: 'Transporte',     icon: 'car',           budget: 800,  spent: 0, color: 'from-blue-500 to-cyan-500' },
  { id: '3', name: 'Antojos',        icon: 'cookie',        budget: 500,  spent: 0, color: 'from-purple-500 to-pink-500' },
  { id: '4', name: 'Salidas',        icon: 'party-popper',  budget: 1000, spent: 0, color: 'from-violet-500 to-purple-500' },
  { id: '5', name: 'Suscripciones',  icon: 'credit-card',   budget: 300,  spent: 0, color: 'from-indigo-500 to-blue-500' },
  { id: '6', name: 'Otros',          icon: 'shopping-bag',  budget: 400,  spent: 0, color: 'from-fuchsia-500 to-pink-500' },
];

// ─── Componente Principal ────────────────────────────────────────────────────
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // Control de gastos hormiga
  const [maxLimit, setMaxLimit] = useState(500);
  const [isLocked, setIsLocked] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  // ── Detectar usuario autenticado ────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName ?? user.email?.split('@')[0] ?? 'Usuario');

        // Verificar en Firestore si ya completó el onboarding (100% confiable)
        // Esto evita mostrar pantallas introductorias a usuarios existentes
        try {
          const profileRef = doc(db, 'users', user.uid, 'config', 'profile');
          const profileSnap = await getDoc(profileRef);
          const onboardingCompleted = profileSnap.data()?.onboardingCompleted === true;
          setCurrentScreen(onboardingCompleted ? 'home' : 'onboarding');
        } catch {
          // Si falla Firestore, asumimos usuario existente (menos intrusivo)
          setCurrentScreen('home');
        }
      } else {
        setUserId(null);
        setUserName('');
        setCurrentScreen('welcome');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Cerrar sesión ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Limpiar estado local (OWASP A07: logout limpia todo)
      setExpenses([]);
      setCategories(DEFAULT_CATEGORIES);
      setMaxLimit(500);
      setIsLocked(true);
      setEmergencyMode(false);
      setShowAddExpense(false);
      // onAuthStateChanged detecta el logout y navega a 'welcome'
    } catch {
      toast.error('Error al cerrar sesión. Intenta de nuevo.');
    }
  };

  // ── Cargar configuración del usuario desde Firestore ────────────────────
  useEffect(() => {
    if (!userId) return;
    const configRef = doc(db, 'users', userId, 'config', 'settings');
    getDoc(configRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.maxLimit)      setMaxLimit(data.maxLimit);
        if (data.isLocked !== undefined) setIsLocked(data.isLocked);
        if (data.emergencyMode !== undefined) setEmergencyMode(data.emergencyMode);
        if (data.categories)    setCategories(data.categories);
      }
    });
  }, [userId]);

  // ── Escuchar gastos en tiempo real desde Firestore ──────────────────────
  useEffect(() => {
    if (!userId) return;
    const expensesRef = collection(db, 'users', userId, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched: Expense[] = snapshot.docs.map((d) => ({
        id: d.id,
        amount: d.data().amount,
        category: d.data().category,
        note: d.data().note,
        isImpulsive: d.data().isImpulsive,
        date: (d.data().date as Timestamp).toDate(),
      }));
      setExpenses(fetched);

      // Recalcular spent en categorías desde los gastos reales
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          spent: fetched
            .filter((e) => e.category === cat.name)
            .reduce((sum, e) => sum + e.amount, 0),
        }))
      );
    });
    return () => unsub();
  }, [userId]);

  // ── Guardar configuración en Firestore ──────────────────────────────────
  const saveConfig = async (patch: Partial<{
    maxLimit: number; isLocked: boolean; emergencyMode: boolean; categories: Category[];
  }>) => {
    if (!userId) return;
    const configRef = doc(db, 'users', userId, 'config', 'settings');
    await setDoc(configRef, patch, { merge: true });
  };

  // ── Agregar gasto ────────────────────────────────────────────────────────
  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
    if (isLocked && !emergencyMode && totalSpent + expense.amount > maxLimit) {
      toast.error('¡Límite alcanzado!', {
        description: `Has superado tu límite de $${maxLimit.toLocaleString()}. Tu dinero está protegido.`,
        duration: 5000,
      });
      setShowAddExpense(false);
      return;
    }

    try {
      if (userId) {
        // Guardar en Firestore (OWASP A01: siempre con userId)
        await addDoc(collection(db, 'users', userId, 'expenses'), {
          amount: expense.amount,
          category: expense.category,
          note: expense.note || 'Sin descripción',
          isImpulsive: expense.isImpulsive ?? false,
          date: Timestamp.now(),
        });
      } else {
        // Sin sesión → solo local
        const newExpense: Expense = {
          ...expense,
          id: Date.now().toString(),
          date: new Date(),
          note: expense.note || 'Sin descripción',
        };
        setExpenses((prev) => [newExpense, ...prev]);
        setCategories((cats) =>
          cats.map((cat) =>
            cat.name === expense.category
              ? { ...cat, spent: cat.spent + expense.amount }
              : cat
          )
        );
      }

      setShowAddExpense(false);
      if (currentScreen === 'empty') setCurrentScreen('home');
      toast.success('¡Gasto registrado!', { duration: 2000 });
    } catch {
      toast.error('Error al guardar el gasto. Intenta de nuevo.');
    }
  };

  const handleOnboardingComplete = async () => {
    // Marcar onboarding como completado en Firestore para no volver a mostrarlo
    if (userId) {
      try {
        const profileRef = doc(db, 'users', userId, 'config', 'profile');
        await setDoc(profileRef, { onboardingCompleted: true }, { merge: true });
      } catch {
        // No bloquear la navegación si falla la escritura
      }
    }
    setCurrentScreen(expenses.length > 0 ? 'home' : 'empty');
  };

  const handleUpdateLimit = (val: number) => {
    setMaxLimit(val);
    saveConfig({ maxLimit: val });
  };

  const handleToggleLock = (val: boolean) => {
    setIsLocked(val);
    saveConfig({ isLocked: val });
  };

  const handleToggleEmergency = (val: boolean) => {
    setEmergencyMode(val);
    saveConfig({ emergencyMode: val });
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
        }}
      />
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-0 sm:p-4 md:p-8">
        <div className="w-full sm:max-w-[440px] md:max-w-[600px] min-h-screen sm:min-h-0 sm:h-[844px] md:h-[90vh] sm:rounded-[3rem] bg-slate-950 relative overflow-hidden shadow-2xl border-0 sm:border border-slate-800/50 transition-all duration-300">

          {currentScreen === 'welcome' && (
            <WelcomeScreen
              onLogin={() => setCurrentScreen('login')}
              onRegister={() => setCurrentScreen('register')}
            />
          )}

          {currentScreen === 'login' && (
            <LoginScreen
              onSwitchToRegister={() => setCurrentScreen('register')}
              onLogin={() => { /* onAuthStateChanged maneja la navegación */ }}
            />
          )}

          {currentScreen === 'register' && (
            <RegisterScreen
              onSwitchToLogin={() => setCurrentScreen('login')}
              onRegister={() => { /* onAuthStateChanged maneja la navegación */ }}
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
              userName={userName}
              onAddExpense={() => setShowAddExpense(true)}
              onViewBudget={() => setCurrentScreen('budget')}
              onOpenSettings={() => setCurrentScreen('settings')}
              onLogout={handleLogout}
            />
          )}

          {currentScreen === 'budget' && (
            <BudgetScreen
              categories={categories}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              maxLimit={maxLimit}
              isLocked={isLocked}
              emergencyMode={emergencyMode}
              userName={userName}
              onUpdateLimit={handleUpdateLimit}
              onToggleLock={handleToggleLock}
              onToggleEmergency={handleToggleEmergency}
              onLogout={handleLogout}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {showAddExpense && (
            <div className="absolute inset-0 z-[100]">
              <AddExpenseModal
                categories={categories}
                onClose={() => setShowAddExpense(false)}
                onAdd={handleAddExpense}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
