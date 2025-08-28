import React, { useState, useEffect } from 'react';
import { Download, Wifi, WifiOff, RefreshCw, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PWAManagerProps {
  children: React.ReactNode;
}

const PWAManager: React.FC<PWAManagerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if app is running as PWA
  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
      setTimeout(() => setShowOfflineNotice(false), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show install prompt after 30 seconds if not already installed
      if (!isPWA()) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 30000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
      
      // Reload the page to get the new version
      window.location.reload();
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Check if install prompt was recently dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('installPromptDismissed');
    if (dismissedTime) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (parseInt(dismissedTime) > sevenDaysAgo) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  return (
    <>
      {children}

      {/* Connection Status Indicator */}
      <div className="fixed top-8 right-6 z-50">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
          isOnline 
            ? 'bg-[var(--app-green)]15 text-[var(--app-green)] border-[var(--app-green)]20'
            : 'bg-[var(--app-red)]15 text-[var(--app-red)] border-[var(--app-red)]20'
        }`}>
          {isOnline ? (
            <>
              <div className="w-2 h-2 bg-[var(--app-green)] rounded-full animate-pulse" />
              <Wifi size={12} />
              <span>Online</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-[var(--app-red)] rounded-full" />
              <WifiOff size={12} />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="fixed top-20 left-6 right-6 z-50 animate-slide-down">
          <Card className="p-4 bg-[var(--app-red)]15 border-[var(--app-red)]20 border-l-4 border-l-[var(--app-red)]">
            <div className="flex items-center space-x-3">
              <WifiOff size={20} className="text-[var(--app-red)]" />
              <div className="flex-1">
                <h4 className="font-medium text-[var(--app-text)]">Sem conexão</h4>
                <p className="text-sm text-[var(--app-text-light)]">
                  Você está offline. Algumas funcionalidades podem estar limitadas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Update Available Notice */}
      {updateAvailable && (
        <div className="fixed bottom-28 left-6 right-6 z-50 animate-slide-up">
          <Card className="p-4 bg-[var(--app-blue)]15 border-[var(--app-blue)]20 border-l-4 border-l-[var(--app-blue)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw size={20} className="text-[var(--app-blue)]" />
                <div>
                  <h4 className="font-medium text-[var(--app-text)]">Atualização disponível</h4>
                  <p className="text-sm text-[var(--app-text-light)]">
                    Uma nova versão do app está disponível
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpdateApp}
                size="sm"
                className="bg-[var(--app-blue)] text-white hover:bg-blue-600"
              >
                Atualizar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && isInstallable && !isPWA() && (
        <div className="fixed bottom-28 left-6 right-6 z-50 animate-slide-up">
          <Card className="p-6 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] text-white border-0 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instalar LifeHub</h3>
                  <p className="text-white/90 text-sm">
                    Acesse mais rápido, receba notificações e use offline
                  </p>
                </div>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full" />
                <span>Acesso rápido direto da tela inicial</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full" />
                <span>Funciona offline para consultas</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full" />
                <span>Notificações inteligentes</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={dismissInstallPrompt}
                variant="ghost"
                className="flex-1 text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
              >
                Mais tarde
              </Button>
              <Button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 bg-white text-[var(--app-blue)] hover:bg-white/90 font-medium shadow-lg"
              >
                {isInstalling ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[var(--app-blue)] border-t-transparent rounded-full animate-spin" />
                    <span>Instalando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Download size={16} />
                    <span>Instalar</span>
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default PWAManager;