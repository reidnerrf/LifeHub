import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Search } from 'lucide-react';
import PWAManager from './components/PWAManager';
import GlobalSearch from './components/GlobalSearch';
import { LoadingSpinner } from './components/ui/skeleton-components';
import { useNavigationGestures } from './components/hooks/useGestures';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './components/ui/sheet';

// Lazy load components for better performance
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const BottomNavigation = lazy(() => import('./components/BottomNavigation'));
const FloatingActionButton = lazy(() => import('./components/FloatingActionButton'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const TasksView = lazy(() => import('./components/TasksView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const HabitsView = lazy(() => import('./components/HabitsView'));
const FocusView = lazy(() => import('./components/FocusView'));
const FinancesView = lazy(() => import('./components/FinancesView'));
const NotesView = lazy(() => import('./components/NotesView'));
const AssistantView = lazy(() => import('./components/AssistantView'));
const ProfileView = lazy(() => import('./components/ProfileView'));

type AppState = 'splash' | 'onboarding' | 'login' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);

  // Auto detect dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (appState === 'splash') {
      return;
    }
    
    if (hasCompletedOnboarding && isLoggedIn) {
      setAppState('app');
    } else if (hasCompletedOnboarding && !isLoggedIn) {
      setAppState('login');
    } else {
      setAppState('onboarding');
    }
  }, [appState]);

  // Smart notifications system
  useEffect(() => {
    if (appState !== 'app') return;

    const notifications = [
      {
        time: 9 * 60 + 30,
        message: 'Hora ideal para começar tarefas complexas! Sua produtividade está no pico.',
        type: 'productivity'
      },
      {
        time: 12 * 60,
        message: 'Lembrete: beber água! Você está 2 copos abaixo da meta.',
        type: 'habit'
      },
      {
        time: 15 * 60,
        message: 'Seus gastos com alimentação atingiram 80% do orçamento mensal.',
        type: 'finance'
      },
      {
        time: 18 * 60,
        message: 'Hora de exercitar-se! Mantenha sua sequência de 12 dias.',
        type: 'habit'
      }
    ];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    notifications.forEach(notification => {
      if (Math.abs(currentMinutes - notification.time) <= 1) {
        console.log('Smart notification:', notification.message);
        
        if (Notification.permission === 'granted') {
          new Notification('LifeHub', {
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png'
          });
        }
      }
    });
  }, [appState]);

  // Request notification permission
  useEffect(() => {
    if (appState === 'app' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [appState]);

  // Navigation gestures
  const { gestureProps } = useNavigationGestures(
    () => handleNavigateBack(),
    () => {},
    () => setShowGlobalSearch(true)
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (appState !== 'app') return;

      // Cmd/Ctrl + K for global search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }

      // ESC to close modals
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
        setShowAddModal(false);
      }

      // Number keys for quick navigation
      if (e.key >= '1' && e.key <= '5' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tabs = ['dashboard', 'tasks', 'calendar', 'habits', 'more'];
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          handleTabChange(tabs[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [appState]);

  // Preload critical components
  useEffect(() => {
    if (appState === 'app') {
      // Preload commonly used components
      import('./components/TasksView');
      import('./components/CalendarView');
    }
  }, [appState]);

  const handleSplashComplete = () => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (hasCompletedOnboarding && isLoggedIn) {
      setAppState('app');
    } else if (hasCompletedOnboarding) {
      setAppState('login');
    } else {
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setAppState('login');
  };

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setAppState('app');
  };

  const handleSignUp = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setAppState('app');
  };

  const handleTabChange = (tab: string) => {
    setIsLoading(true);
    
    // Update tab history for back navigation
    setTabHistory(prev => {
      const newHistory = prev.filter(t => t !== tab);
      return [tab, ...newHistory.slice(0, 4)]; // Keep last 5 tabs
    });
    
    setActiveTab(tab);
    
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 150);
    
    // Analytics
    console.log('Navigation:', {
      from: activeTab,
      to: tab,
      timestamp: new Date().toISOString()
    });
  };

  const handleNavigateBack = () => {
    if (tabHistory.length > 1) {
      const previousTab = tabHistory[1];
      handleTabChange(previousTab);
    }
  };

  const handleGlobalSearchNavigate = (type: string, id: string) => {
    setShowGlobalSearch(false);
    
    // Navigate to appropriate tab based on type
    const typeToTab: Record<string, string> = {
      task: 'tasks',
      habit: 'habits',
      event: 'calendar',
      transaction: 'finances',
      note: 'notes',
      session: 'focus'
    };
    
    const targetTab = typeToTab[type] || 'dashboard';
    handleTabChange(targetTab);
    
    // Analytics for search navigation
    console.log('Search navigation:', { type, id, targetTab });
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  // Splash Screen
  if (appState === 'splash') {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-[var(--app-blue)]" />}>
        <SplashScreen onComplete={handleSplashComplete} />
      </Suspense>
    );
  }

  // Onboarding Flow
  if (appState === 'onboarding') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  // Login Screen
  if (appState === 'login') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />
      </Suspense>
    );
  }

  // Main App
  const renderActiveView = () => {
    const viewProps = { key: activeTab }; // Force re-render on tab change
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard {...viewProps} />
          </Suspense>
        );
      case 'tasks':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TasksView {...viewProps} />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CalendarView {...viewProps} />
          </Suspense>
        );
      case 'habits':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HabitsView {...viewProps} />
          </Suspense>
        );
      case 'focus':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FocusView {...viewProps} />
          </Suspense>
        );
      case 'finances':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FinancesView {...viewProps} />
          </Suspense>
        );
      case 'notes':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <NotesView {...viewProps} />
          </Suspense>
        );
      case 'assistant':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AssistantView {...viewProps} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileView {...viewProps} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard {...viewProps} />
          </Suspense>
        );
    }
  };

  const handleAddAction = () => {
    setShowQuickAdd(true);
    
    // Analytics tracking
    console.log('User interaction:', {
      action: 'add_button_clicked',
      tab: activeTab,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    });
  };

  const getAddModalTitle = () => {
    switch (activeTab) {
      case 'tasks': return 'Nova Tarefa';
      case 'calendar': return 'Novo Evento';
      case 'habits': return 'Novo Hábito';
      case 'finances': return 'Nova Transação';
      case 'notes': return 'Nova Nota';
      case 'focus': return 'Nova Sessão';
      default: return 'Adicionar Item';
    }
  };

  const getAddModalFields = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <>
            <input 
              type="text" 
              placeholder="Nome da tarefa"
              className="w-full p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all placeholder-[var(--app-text-light)]"
            />
            <textarea 
              placeholder="Descrição (opcional)"
              rows={3}
              className="w-full p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none resize-none bg-[var(--app-card)] text-[var(--app-text)] transition-all placeholder-[var(--app-text-light)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select className="p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all">
                <option>Prioridade</option>
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
              <input 
                type="date" 
                className="p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all"
              />
            </div>
          </>
        );
      case 'finances':
        return (
          <>
            <input 
              type="text" 
              placeholder="Descrição da transação"
              className="w-full p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all placeholder-[var(--app-text-light)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="number" 
                placeholder="Valor"
                className="p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all placeholder-[var(--app-text-light)]"
              />
              <select className="p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all">
                <option>Tipo</option>
                <option>Receita</option>
                <option>Despesa</option>
              </select>
            </div>
            <select className="w-full p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all">
              <option>Categoria</option>
              <option>Alimentação</option>
              <option>Transporte</option>
              <option>Entretenimento</option>
              <option>Saúde</option>
              <option>Trabalho</option>
            </select>
          </>
        );
      default:
        return (
          <input 
            type="text" 
            placeholder="Digite o nome..."
            className="w-full p-4 border border-[var(--app-light-gray)] rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] focus:border-transparent outline-none bg-[var(--app-card)] text-[var(--app-text)] transition-all placeholder-[var(--app-text-light)]"
          />
        );
    }
  };

  const shouldShowFAB = !['assistant', 'profile'].includes(activeTab);

  return (
    <PWAManager>
      <div className="mobile-container bg-[var(--app-bg)] min-h-screen transition-colors duration-300" {...gestureProps}>
        {/* Status Bar Spacer */}
        <div className="safe-area-top" />
        
        {/* Global Search Button */}
        <button
          onClick={() => setShowGlobalSearch(true)}
          className="fixed top-12 left-6 z-30 p-3 bg-[var(--app-card)] rounded-xl shadow-lg border border-[var(--app-light-gray)] hover:shadow-xl transition-all transform hover:scale-105"
          title="Buscar (Cmd+K)"
        >
          <Search size={20} className="text-[var(--app-gray)]" />
        </button>
        
        {/* Main Content */}
        <div className="flex-1 px-6 pt-6 pb-24 overflow-y-auto custom-scrollbar">
          <div className={`transition-all duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            {renderActiveView()}
          </div>
        </div>

        {/* Floating Action Button */}
        {shouldShowFAB && (
          <Suspense fallback={null}>
            <FloatingActionButton 
              onClick={handleAddAction} 
              activeTab={activeTab}
            />
          </Suspense>
        )}

        {/* Bottom Navigation */}
        <Suspense fallback={null}>
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </Suspense>

        {/* Global Search */}
        <GlobalSearch
          isOpen={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
          onNavigate={handleGlobalSearchNavigate}
        />

        {/* Enhanced Add Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50 animate-fade-in backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <div 
              className="bg-[var(--app-card)] rounded-t-3xl w-full max-w-md p-8 animate-slide-up border-t-4 border-[var(--app-blue)] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-[var(--app-light-gray)] rounded-full mx-auto mb-6" />
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[var(--app-text)] mb-2">
                  {getAddModalTitle()}
                </h3>
                <p className="text-sm text-[var(--app-text-light)]">
                  Preencha as informações abaixo
                </p>
              </div>
              
              <div className="space-y-4">
                {getAddModalFields()}
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 px-4 bg-[var(--app-light-gray)] text-[var(--app-text)] rounded-2xl hover:bg-[var(--app-dark-gray)] transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      console.log('Saving new item for tab:', activeTab);
                    }}
                    className="flex-1 py-4 px-4 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] text-white rounded-2xl hover:shadow-lg transition-all font-medium transform hover:scale-105"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BottomSheet Quick Add */}
        <Sheet open={showQuickAdd} onOpenChange={setShowQuickAdd}>
          <SheetContent side="bottom" className="rounded-t-3xl p-6">
            <SheetHeader>
              <SheetTitle>Adicionar rápido</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => { setShowQuickAdd(false); setShowAddModal(true); setActiveTab('tasks'); }} className="p-4 rounded-2xl bg-[var(--app-light-gray)]">Tarefa</button>
              <button onClick={() => { setShowQuickAdd(false); setShowAddModal(true); setActiveTab('calendar'); }} className="p-4 rounded-2xl bg-[var(--app-light-gray)]">Evento</button>
              <button onClick={() => { setShowQuickAdd(false); setShowAddModal(true); setActiveTab('notes'); }} className="p-4 rounded-2xl bg-[var(--app-light-gray)]">Nota</button>
              <button onClick={() => { setShowQuickAdd(false); setShowAddModal(true); setActiveTab('habits'); }} className="p-4 rounded-2xl bg-[var(--app-light-gray)]">Hábito</button>
              <button onClick={() => { setShowQuickAdd(false); setShowAddModal(true); setActiveTab('finances'); }} className="p-4 rounded-2xl bg-[var(--app-light-gray)]">Conta</button>
              <button onClick={() => { setShowQuickAdd(false); setActiveTab('focus'); }} className="p-4 rounded-2xl bg-[var(--app-light-gray)]">Foco</button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PWAManager>
  );
}