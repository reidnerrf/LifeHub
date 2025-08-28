import React, { useState } from 'react';
import { 
  CheckSquare, 
  Target, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { storage, KEYS } from '../services/storage';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [preferredViews, setPreferredViews] = useState<Array<'tasks'|'notes'|'focus'|'dashboard'>>(['dashboard']);
  const [enableSmart, setEnableSmart] = useState(true);
  const [theme, setTheme] = useState<'light'|'dark'|'system'>('system');

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao LifeHub! 👋',
      subtitle: 'Sua central de produtividade pessoal',
      description: 'Organize tarefas, hábitos, finanças e muito mais em um só lugar. Transforme sua rotina com inteligência artificial.',
      icon: <Sparkles size={80} className="text-[var(--app-yellow)]" />,
      gradient: 'from-[var(--app-blue)] to-[var(--app-purple)]',
      features: [
        { icon: <CheckSquare size={20} />, text: 'Gerenciamento de tarefas inteligente' },
        { icon: <Target size={20} />, text: 'Tracking de hábitos gamificado' },
        { icon: <Brain size={20} />, text: 'Assistente IA personalizado' }
      ]
    },
    {
      id: 'organize',
      title: 'Organize Sua Vida 📋',
      subtitle: 'Tudo integrado e sincronizado',
      description: 'Gerencie tarefas, eventos, notas e hábitos com visualizações intuitivas. Kanban, timeline e muito mais.',
      icon: <CheckSquare size={80} className="text-[var(--app-blue)]" />,
      gradient: 'from-[var(--app-green)] to-[var(--app-blue)]',
      features: [
        { icon: <Calendar size={20} />, text: 'Agenda integrada com Google Calendar' },
        { icon: <FileText size={20} />, text: 'Notas de texto, áudio e imagem' },
        { icon: <Zap size={20} />, text: 'Sincronização em tempo real' }
      ]
    },
    {
      id: 'focus',
      title: 'Foque no que Importa 🎯',
      subtitle: 'Produtividade com técnicas comprovadas',
      description: 'Use Pomodoro, tracking de hábitos e insights de IA para maximizar sua produtividade e bem-estar.',
      icon: <Brain size={80} className="text-[var(--app-green)]" />,
      gradient: 'from-[var(--app-yellow)] to-[var(--app-green)]',
      features: [
        { icon: <Target size={20} />, text: 'Sessões Pomodoro com sons ambiente' },
        { icon: <Sparkles size={20} />, text: 'Sugestões inteligentes baseadas em padrões' },
        { icon: <CheckSquare size={20} />, text: 'Gamificação com conquistas e níveis' }
      ]
    },
    {
      id: 'ready',
      title: 'Tudo Pronto! 🚀',
      subtitle: 'Vamos começar sua jornada',
      description: 'Você está pronto para transformar sua produtividade. Vamos configurar suas preferências e começar!',
      icon: <DollarSign size={80} className="text-[var(--app-purple)]" />,
      gradient: 'from-[var(--app-purple)] to-[var(--app-blue)]',
      features: [
        { icon: <DollarSign size={20} />, text: 'Controle financeiro simplificado' },
        { icon: <Sparkles size={20} />, text: 'Insights e relatórios automáticos' },
        { icon: <Zap size={20} />, text: 'Integrações com bancos e serviços' }
      ]
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Persist minimal onboarding preferences
      storage.set(KEYS.onboarding, {
        goals: selectedGoals,
        preferredViews,
        enableSmartSuggestions: enableSmart,
        theme
      });
      if (theme !== 'system') storage.set(KEYS.theme, theme);
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center z-50 transition-all duration-700`}>
      {/* Skip Button */}
      <button
        onClick={skipOnboarding}
        className="absolute top-12 right-6 text-white/80 hover:text-white transition-colors text-sm font-medium"
      >
        Pular
      </button>

      {/* Progress Indicator */}
      <div className="absolute top-12 left-6 flex space-x-2">
        {onboardingSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-white w-8' : 
              index < currentStep ? 'bg-white/80' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Icon Animation */}
        <div className="mb-8 animate-scale-in">
          <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
            {currentStepData.icon}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            {currentStepData.title}
          </h1>
          <h2 className="text-xl text-white/90 mb-6 font-medium">
            {currentStepData.subtitle}
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-8">
            {currentStepData.description}
          </p>
        </div>

        {/* Features List */}
        <div className="mb-8 space-y-4 animate-slide-up">
          {currentStepData.features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-white/90 flex-shrink-0">
                {feature.icon}
              </div>
              <span className="text-white/90 text-sm font-medium text-left">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Quiz */}
        <div className="mb-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-2">
            {['Organização', 'Foco', 'Notas', 'Bem-estar'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                className={`py-2 px-3 rounded-xl text-sm ${selectedGoals.includes(g) ? 'bg-white text-black' : 'bg-white/10 text-white/80 border border-white/20'}`}
              >{g}</button>
            ))}
          </div>
          <div className="flex items-center justify-between text-white/90 text-sm">
            <span>Tema</span>
            <div className="space-x-2">
              {(['light','system','dark'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} className={`px-3 py-1 rounded-lg ${theme===t?'bg-white text-black':'bg-white/10 border border-white/20'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-white/90 text-sm">
            <span>Sugestões inteligentes</span>
            <button onClick={() => setEnableSmart(v => !v)} className={`px-3 py-1 rounded-lg ${enableSmart?'bg-white text-black':'bg-white/10 border border-white/20 text-white'}`}>{enableSmart?'Ativo':'Inativo'}</button>
          </div>
          <div className="flex items-center justify-between text-white/90 text-sm">
            <span>Importar do Google (stub)</span>
            <button onClick={() => alert('Importação simulada!')} className="px-3 py-1 rounded-lg bg-white text-black">Importar</button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between animate-slide-up">
          <Button
            onClick={prevStep}
            variant="ghost"
            className={`text-white/80 hover:text-white hover:bg-white/10 transition-all ${
              currentStep === 0 ? 'invisible' : ''
            }`}
          >
            <ArrowLeft size={20} className="mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-white scale-110' : 
                  index < currentStep ? 'bg-white/70' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className="bg-white text-[var(--app-blue)] hover:bg-white/90 shadow-lg font-medium px-6"
          >
            {currentStep === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" />
          <div className="absolute bottom-32 right-32 w-3 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-20 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;