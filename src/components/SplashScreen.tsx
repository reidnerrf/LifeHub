import React, { useEffect, useState } from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Inicializando...',
    'Carregando dados...',
    'Preparando sua experiência...',
    'Quase pronto!'
  ];

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Update loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return loadingSteps.length - 1;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--app-blue)] via-[var(--app-purple)] to-[var(--app-green)] flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-pulse" />
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-8 w-16 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center px-8">
        {/* Logo Animation */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl transform animate-bounce">
            <div className="relative">
              <Zap size={40} className="text-[var(--app-blue)] animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Sparkles size={16} className="text-[var(--app-yellow)] animate-spin" />
              </div>
            </div>
          </div>
          
          {/* Pulsing Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-white opacity-20 rounded-full animate-ping" />
            <div className="absolute w-40 h-40 border-2 border-white opacity-10 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* App Name */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Life<span className="text-[var(--app-yellow)]">Hub</span>
          </h1>
          <p className="text-white/80 text-lg">Sua vida organizada em um só lugar</p>
        </div>

        {/* Loading Progress */}
        <div className="mb-8 animate-slide-up">
          <div className="w-64 h-2 bg-white/20 rounded-full mx-auto mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-white to-[var(--app-yellow)] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Loading Text */}
          <div className="text-white/90 text-sm font-medium animate-pulse">
            {loadingSteps[loadingStep]}
          </div>
          
          {/* Progress Percentage */}
          <div className="text-white/60 text-xs mt-2 font-mono">
            {progress.toFixed(0)}%
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 animate-fade-in">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-8 text-center text-white/60 text-xs">
        <p>Versão 1.0.0 • Figma Make</p>
      </div>
    </div>
  );
};

export default SplashScreen;