import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

type Props = {
  onSwitchToRegister: () => void;
  onLogin: () => void;
};

export default function LoginScreen({ onSwitchToRegister, onLogin }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // ── Email / Password ─────────────────────────────────────────────────────
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin(); // onAuthStateChanged en App detectará el cambio
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google ───────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch {
      setError('Error al iniciar con Google. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-6 overflow-y-auto">
      <div className="w-full max-w-md py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-500 opacity-60">Inicia sesión para continuar</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 mb-6 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.8055 10.2292C19.8055 9.55156 19.7501 8.86719 19.6323 8.19531H10.2002V12.0492H15.6016C15.3771 13.2911 14.6568 14.3898 13.6102 15.0875V17.5867H16.8251C18.7177 15.8449 19.8055 13.2725 19.8055 10.2292Z" fill="#4285F4"/>
            <path d="M10.2002 20.0008C12.9519 20.0008 15.2724 19.1053 16.8293 17.5867L13.6144 15.0875C12.7375 15.6979 11.6032 16.0435 10.2044 16.0435C7.54385 16.0435 5.28174 14.2828 4.51092 11.9102H1.18359V14.4819C2.78053 17.6602 6.30949 20.0008 10.2002 20.0008Z" fill="#34A853"/>
            <path d="M4.50676 11.9102C4.03811 10.6683 4.03811 9.33677 4.50676 8.09482V5.52312H1.1836C-0.400236 8.66677 -0.400236 12.3382 1.1836 15.4819L4.50676 11.9102Z" fill="#FBBC04"/>
            <path d="M10.2002 3.95821C11.6824 3.93587 13.1115 4.47384 14.1897 5.47384L17.0294 2.6342C15.1785 0.904552 12.731 -0.0324741 10.2002 0.000552127C6.30949 0.000552127 2.78053 2.34113 1.18359 5.52309L4.50676 8.09479C5.27341 5.71592 7.53968 3.95821 10.2002 3.95821Z" fill="#EA4335"/>
          </svg>
          <span className="font-medium text-gray-700">Continuar con Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 opacity-50 text-sm">o</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-60" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
              className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-60" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-60 hover:opacity-100 transition-opacity"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right mb-6">
          <button className="text-purple-600 opacity-70 hover:opacity-100 text-sm transition-opacity">
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all mb-6 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Iniciar sesión'
          )}
        </button>

        {/* Switch */}
        <p className="text-center text-gray-600 opacity-60">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-purple-600 font-medium opacity-90 hover:opacity-100 transition-opacity"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}
