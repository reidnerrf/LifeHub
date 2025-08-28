import React, { useState } from 'react';
import { Home, CheckSquare, Calendar, Target, MoreHorizontal, Brain, DollarSign, FileText, Bot, X, Sparkles } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'dashboard', icon: Home, label: 'Início', color: 'var(--app-blue)' },
    { id: 'tasks', icon: CheckSquare, label: 'Tarefas', color: 'var(--app-green)' },
    { id: 'calendar', icon: Calendar, label: 'Agenda', color: 'var(--app-purple)' },
    { id: 'habits', icon: Target, label: 'Hábitos', color: 'var(--app-yellow)' },
    { id: 'more', icon: MoreHorizontal, label: 'Mais', color: 'var(--app-gray)' },
  ];

  const moreTabs = [
    { id: 'focus', icon: Brain, label: 'Foco', color: 'var(--app-blue)', description: 'Sessões Pomodoro' },
    { id: 'finances', icon: DollarSign, label: 'Finanças', color: 'var(--app-yellow)', description: 'Controle de gastos' },
    { id: 'notes', icon: FileText, label: 'Notas', color: 'var(--app-purple)', description: 'Anotações e ideias' },
    { id: 'assistant', icon: Bot, label: 'Assistente IA', color: 'var(--app-green)', description: 'Sugestões inteligentes' },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'more') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      onTabChange(tabId);
      setShowMoreMenu(false);
    }
  };

  const handleMoreTabClick = (tabId: string) => {
    onTabChange(tabId);
    setShowMoreMenu(false);
  };

  const isMoreTabActive = moreTabs.some(tab => tab.id === activeTab);
  const getActiveTabColor = () => {
    const allTabs = [...mainTabs, ...moreTabs];
    const activeTabData = allTabs.find(tab => tab.id === activeTab);
    return activeTabData?.color || 'var(--app-blue)';
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="fixed bottom-20 left-4 right-4 bg-[var(--app-card)] rounded-3xl shadow-2xl animate-slide-up z-50 border border-[var(--app-light-gray)] overflow-hidden backdrop-blur-lg"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mais Funcionalidades</h3>
                    <p className="text-white/80 text-sm">Explore todas as possibilidades</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {moreTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleMoreTabClick(tab.id)}
                      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all transform hover:scale-105 ${
                        isActive 
                          ? 'shadow-lg' 
                          : 'hover:bg-[var(--app-light-gray)]'
                      }`}
                      style={{
                        backgroundColor: isActive ? `${tab.color}15` : 'transparent',
                        borderLeft: isActive ? `4px solid ${tab.color}` : '4px solid transparent'
                      }}
                    >
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          isActive ? 'shadow-md transform scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: isActive ? tab.color : `${tab.color}15`,
                          color: isActive ? 'white' : tab.color
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className={`font-medium transition-colors ${
                          isActive ? 'text-[var(--app-text)]' : 'text-[var(--app-text)]'
                        }`}>
                          {tab.label}
                        </h4>
                        <p className="text-sm text-[var(--app-text-light)]">
                          {tab.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tab.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="mobile-container">
          <div className="relative">
            {/* Active Tab Indicator */}
            <div 
              className="absolute top-0 left-0 h-1 rounded-full transition-all duration-300 ease-out"
              style={{ 
                backgroundColor: getActiveTabColor(),
                width: '20%',
                left: `${mainTabs.findIndex(tab => tab.id === activeTab || (tab.id === 'more' && isMoreTabActive)) * 20}%`
              }}
            />
            
            {/* Navigation Background */}
            <div className="bg-[var(--app-card)] border-t border-[var(--app-light-gray)] backdrop-blur-lg bg-opacity-95 safe-area-bottom">
              <div className="grid grid-cols-5 py-3">
                {mainTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === 'more' ? isMoreTabActive : activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 group relative ${
                        isActive 
                          ? 'transform scale-110' 
                          : 'hover:scale-105'
                      }`}
                    >
                      {/* Icon Container */}
                      <div 
                        className={`relative p-2 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'shadow-lg transform -translate-y-1' 
                            : 'group-hover:bg-[var(--app-light-gray)]'
                        }`}
                        style={{
                          backgroundColor: isActive ? `${tab.color}15` : 'transparent'
                        }}
                      >
                        <Icon 
                          size={20} 
                          className="transition-all duration-300"
                          style={{ 
                            color: isActive ? tab.color : 'var(--app-gray)'
                          }}
                        />
                        
                        {/* Active Tab Pulse */}
                        {isActive && (
                          <div 
                            className="absolute inset-0 rounded-xl animate-ping opacity-30"
                            style={{ backgroundColor: tab.color }}
                          />
                        )}
                        
                        {/* More Tab Notification Dot */}
                        {tab.id === 'more' && isMoreTabActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: getActiveTabColor() }} />
                        )}
                      </div>
                      
                      {/* Label */}
                      <span 
                        className={`text-xs mt-1 font-medium transition-all duration-300 ${
                          isActive ? 'opacity-100 transform translate-y-0' : 'opacity-60 transform translate-y-1'
                        }`}
                        style={{ 
                          color: isActive ? tab.color : 'var(--app-gray)'
                        }}
                      >
                        {tab.label}
                      </span>
                      
                      {/* Active Indicator Dot */}
                      {isActive && (
                        <div 
                          className="absolute -bottom-1 w-1 h-1 rounded-full animate-fade-in"
                          style={{ backgroundColor: tab.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;