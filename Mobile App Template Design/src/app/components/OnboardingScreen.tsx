import { useState } from 'react';
import { Wallet, TrendingDown, Target, Sparkles, ChevronRight } from 'lucide-react';

type OnboardingScreenProps = {
  onComplete: () => void;
};

const slides = [
  {
    icon: Wallet,
    title: 'Bienvenido a MicroControl',
    description: 'La app que te ayuda a controlar tus microgastos y alcanzar tus metas financieras.',
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
  },
  {
    icon: TrendingDown,
    title: 'Evita los microgastos',
    description: 'Esos pequeños gastos diarios que se acumulan y afectan tu presupuesto sin que te des cuenta.',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
  },
  {
    icon: Target,
    title: '¿Me lo merezco?',
    description: 'Aprende a diferenciar entre un antojo impulsivo y algo que realmente te acerca a tus metas.',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
  {
    icon: Sparkles,
    title: 'Toma el control',
    description: 'Controla tu dinero sin dejar de disfrutar. Balance inteligente para tu vida.',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="size-full bg-slate-950 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-10 blur-3xl`} />

      <div className="flex gap-1.5 mt-4 z-10">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-gradient-to-r ' + slide.gradient
                : 'w-1.5 bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 z-10">
        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center shadow-2xl`}>
          <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
        </div>

        <div className="text-center space-y-4 px-4">
          <h1 className="text-3xl text-white tracking-tight">
            {slide.title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            {slide.description}
          </p>
        </div>
      </div>

      <button
        onClick={handleNext}
        className={`w-full py-4 rounded-2xl bg-gradient-to-r ${slide.gradient} text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all z-10`}
      >
        <span>{currentSlide === slides.length - 1 ? 'Comenzar' : 'Continuar'}</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
