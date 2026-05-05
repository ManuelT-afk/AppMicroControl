import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

type Props = {
  onSwitchToLogin: () => void;
  onRegister: () => void;
};

export default function RegisterScreen({ onSwitchToLogin, onRegister }: Props) {
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms]     = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  // ── Guardar perfil en Firestore ──────────────────────────────────────────
  const saveUserProfile = async (uid: string, displayName: string, userEmail: string) => {
    const profileRef = doc(db, 'users', uid, 'config', 'profile');
    await setDoc(profileRef, {
      name: displayName,
      email: userEmail,
      createdAt: Timestamp.now(),
      maxLimit: 500,
      isLocked: true,
      emergencyMode: false,
    });
  };

  // ── Registro con Email / Password ────────────────────────────────────────
  const handleRegister = async () => {
    setError('');

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    setLoading(true);
    try {
      // 1. Crear usuario en Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2. Guardar nombre en el perfil de Auth
      await updateProfile(user, { displayName: name.trim() });

      // 3. Guardar perfil en Firestore (OWASP A01: userId en la ruta)
      await saveUserProfile(user.uid, name.trim(), email.trim());

      onRegister();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else if (code === 'auth/invalid-email') {
        setError('Correo electrónico inválido.');
      } else if (code === 'auth/weak-password') {
        setError('La contraseña es muy débil. Usa al menos 8 caracteres.');
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign Up ───────────────────────────────────────────────────────
  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Guardar perfil si es usuario nuevo
      if (user.metadata.creationTime === user.metadata.lastSignInTime) {
        await saveUserProfile(
          user.uid,
          user.displayName ?? 'Usuario',
          user.email ?? ''
        );
      }

      onRegister();
    } catch {
      setError('Error al registrarse con Google. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-6 overflow-y-auto">
      <div className="w-full max-w-md py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-gray-500 opacity-60">Únete y comienza tu experiencia</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogleRegister}
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

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-60" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
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
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-60" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <p className="text-xs text-gray-500 opacity-50 mt-1.5">Mínimo 8 caracteres</p>
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 opacity-60" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 opacity-60 hover:opacity-100 transition-opacity"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 accent-purple-600"
            />
            <span className="text-sm text-gray-600 opacity-60">
              Acepto los{' '}
              <button className="text-purple-600 opacity-80 hover:opacity-100 transition-opacity">
                términos y condiciones
              </button>
              {' '}y la{' '}
              <button className="text-purple-600 opacity-80 hover:opacity-100 transition-opacity">
                política de privacidad
              </button>
            </span>
          </label>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all mb-6 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Crear cuenta'
          )}
        </button>

        {/* Switch */}
        <p className="text-center text-gray-600 opacity-60">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-purple-600 font-medium opacity-90 hover:opacity-100 transition-opacity"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
