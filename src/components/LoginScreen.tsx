import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    // Simulate social login
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--app-bg)] via-[var(--app-light-gray)] to-[var(--app-bg)] flex items-center justify-center z-50 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[var(--app-blue)] rounded-full animate-pulse" />
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-[var(--app-green)] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-8 w-16 h-16 bg-[var(--app-purple)] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md bg-[var(--app-card)] border-0 shadow-2xl rounded-3xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] p-8 text-center text-white">
          <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h1>
          <p className="text-white/80 text-sm">
            {isLogin 
              ? 'Entre para continuar sua jornada de produtividade' 
              : 'Comece a organizar sua vida hoje mesmo'
            }
          </p>
        </div>

        <div className="p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full py-3 px-4 bg-white border-2 border-[var(--app-light-gray)] text-[var(--app-text)] hover:bg-[var(--app-light-gray)] hover:border-[var(--app-blue)] transition-all rounded-xl font-medium shadow-sm"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continuar com Google</span>
              </div>
            </Button>

            <Button
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
              className="w-full py-3 px-4 bg-black text-white hover:bg-gray-800 transition-all rounded-xl font-medium shadow-sm"
            >
              <div className="flex items-center justify-center space-x-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Continuar com Apple</span>
              </div>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--app-light-gray)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--app-card)] text-[var(--app-text-light)]">ou</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--app-gray)]" />
              <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 bg-[var(--app-light-gray)] border-0 rounded-xl focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--app-gray)]" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-12 bg-[var(--app-light-gray)] border-0 rounded-xl focus:ring-2 focus:ring-[var(--app-blue)] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--app-gray)] hover:text-[var(--app-text)] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-[var(--app-blue)] hover:text-blue-600 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-12 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Carregando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </form>

          {/* Toggle Login/SignUp */}
          <div className="mt-6 text-center">
            <span className="text-sm text-[var(--app-text-light)]">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-sm text-[var(--app-blue)] hover:text-blue-600 font-medium transition-colors"
            >
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </button>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--app-text-light)] leading-relaxed">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-[var(--app-blue)] hover:text-blue-600 transition-colors">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="#" className="text-[var(--app-blue)] hover:text-blue-600 transition-colors">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </Card>

      {/* Background Decoration */}
      <div className="absolute bottom-8 left-8 text-[var(--app-text-light)] text-xs opacity-60">
        <p>LifeHub • Versão 1.0.0</p>
      </div>
    </div>
  );
};

export default LoginScreen;