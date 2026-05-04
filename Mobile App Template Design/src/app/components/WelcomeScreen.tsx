import logoImg from '../../imports/logoFigmaApp.jpg';

export default function WelcomeScreen({
  onLogin,
  onRegister
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex flex-col items-center justify-between px-6 py-12">
      {/* Logo/Brand Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Mi Billetera</h1>
          <p className="text-white/80 opacity-70 text-lg">
            Controla tus gastos inteligentemente
          </p>
        </div>
      </div>

      {/* Illustration/Feature Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 max-w-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-white/90 opacity-70 text-xs">Estadísticas</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-white/90 opacity-70 text-xs">Objetivos</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-white/90 opacity-70 text-xs">Presupuesto</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-white/90 opacity-70 text-xs">Progreso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={onRegister}
          className="w-full h-14 bg-white text-purple-600 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Crear cuenta
        </button>
        <button
          onClick={onLogin}
          className="w-full h-14 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-2xl font-semibold hover:bg-white/20 transition-all"
        >
          Iniciar sesión
        </button>
        <p className="text-center text-white/70 opacity-60 text-xs pt-2">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}
