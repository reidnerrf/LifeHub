import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Trophy,
  Award,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import NotificationSystem from './NotificationSystem';
import SettingsView from './SettingsView';

const ProfileView: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadNotifications] = useState(3);

  const userStats = {
    level: 12,
    xp: 2450,
    xpToNext: 3000,
    tasksCompleted: 187,
    habitsStreak: 12,
    totalPoints: 15680,
    joinDate: '2024-01-15',
  };

  const achievements = [
    { id: 1, name: 'Primeira Semana', icon: '🎯', unlocked: true, description: 'Complete 7 dias consecutivos' },
    { id: 2, name: 'Produtivo', icon: '⚡', unlocked: true, description: 'Complete 50 tarefas' },
    { id: 3, name: 'Consistente', icon: '🔥', unlocked: false, description: 'Mantenha hábitos por 30 dias' },
    { id: 4, name: 'Mestre do Foco', icon: '🧠', unlocked: true, description: 'Complete 20 sessões Pomodoro' },
  ];

  const quickStats = [
    {
      icon: Target,
      label: 'Tarefas concluídas',
      value: userStats.tasksCompleted,
      color: 'var(--app-blue)',
      change: '+12 esta semana'
    },
    {
      icon: Zap,
      label: 'Dias de sequência',
      value: userStats.habitsStreak,
      color: 'var(--app-yellow)',
      change: 'Recorde pessoal!'
    },
    {
      icon: Trophy,
      label: 'Pontos totais',
      value: userStats.totalPoints.toLocaleString(),
      color: 'var(--app-green)',
      change: '+580 esta semana'
    },
    {
      icon: Calendar,
      label: 'Dias no app',
      value: Math.floor((Date.now() - new Date(userStats.joinDate).getTime()) / (1000 * 60 * 60 * 24)),
      color: 'var(--app-purple)',
      change: 'Desde Jan 2024'
    }
  ];

  const menuItems = [
    { 
      icon: Bell, 
      label: 'Notificações', 
      action: () => setShowNotifications(true),
      badge: unreadNotifications > 0 ? unreadNotifications.toString() : null,
      badgeColor: 'var(--app-red)'
    },
    { 
      icon: Settings, 
      label: 'Configurações', 
      action: () => setShowSettings(true)
    },
    { 
      icon: Shield, 
      label: 'Privacidade e Segurança', 
      action: () => {}
    },
    { 
      icon: HelpCircle, 
      label: 'Ajuda e Suporte', 
      action: () => {}
    }
  ];

  const xpProgress = (userStats.xp / userStats.xpToNext) * 100;

  if (showSettings) {
    return <SettingsView onBack={() => setShowSettings(false)} />;
  }

  return (
    <>
      <div className="flex flex-col space-y-6 pb-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--app-blue)] to-[var(--app-green)] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <User size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--app-text)]">Ana Silva</h1>
          <p className="text-[var(--app-text-light)]">ana.silva@email.com</p>
          
          {/* Level and XP */}
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Badge className="bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] text-white px-4 py-2 shadow-lg">
                <Trophy size={14} className="mr-2" />
                Nível {userStats.level}
              </Badge>
              <div className="text-center">
                <div className="text-sm text-[var(--app-text-light)]">
                  {userStats.xp}/{userStats.xpToNext} XP
                </div>
              </div>
            </div>
            <Progress value={xpProgress} className="h-3 w-64 mx-auto shadow-inner" />
            <div className="text-xs text-[var(--app-text-light)] mt-2">
              {userStats.xpToNext - userStats.xp} XP para o próximo nível
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div className="text-xl font-bold text-[var(--app-text)] mb-1">{stat.value}</div>
                  <div className="text-xs text-[var(--app-text-light)] mb-2">{stat.label}</div>
                  <div 
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${stat.color}10`,
                      color: stat.color
                    }}
                  >
                    {stat.change}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* This Week's Highlights */}
        <Card className="p-6 bg-gradient-to-r from-[var(--app-green)] to-[var(--app-blue)] rounded-2xl border-0 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Destaques da Semana</h3>
            <TrendingUp size={20} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold mb-1">95%</div>
              <div className="text-sm text-white/80">Taxa de conclusão</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">6.5h</div>
              <div className="text-sm text-white/80">Tempo focado</div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--app-text)]">Conquistas Recentes</h3>
            <div className="flex items-center space-x-1 text-sm text-[var(--app-text-light)]">
              <Award size={14} />
              <span>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.slice(0, 4).map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  achievement.unlocked 
                    ? 'border-[var(--app-green)] bg-[var(--app-green)]05 hover:bg-[var(--app-green)]10' 
                    : 'border-[var(--app-light-gray)] bg-[var(--app-light-gray)]'
                }`}
              >
                <div className={`text-2xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <h4 className={`text-sm font-medium mb-1 ${achievement.unlocked ? 'text-[var(--app-text)]' : 'text-[var(--app-text-light)]'}`}>
                  {achievement.name}
                </h4>
                <p className="text-xs text-[var(--app-text-light)]">{achievement.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="bg-[var(--app-card)] rounded-2xl border-0 shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center space-x-4 p-4 hover:bg-[var(--app-light-gray)] transition-colors border-b border-[var(--app-light-gray)] last:border-b-0"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `var(--app-blue)15` }}
                >
                  <Icon size={20} className="text-[var(--app-blue)]" />
                </div>
                <span className="flex-1 text-left text-[var(--app-text)]">{item.label}</span>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge 
                      className="text-xs px-2 py-1 text-white border-0"
                      style={{ backgroundColor: item.badgeColor }}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight size={16} className="text-[var(--app-gray)]" />
                </div>
              </button>
            );
          })}
        </Card>

        {/* Logout Button */}
        <button className="flex items-center justify-center space-x-2 w-full p-4 bg-[var(--app-red)]05 text-[var(--app-red)] rounded-2xl hover:bg-[var(--app-red)]10 transition-colors border border-[var(--app-red)]20">
          <LogOut size={20} />
          <span className="font-medium">Sair da Conta</span>
        </button>
      </div>

      {/* Notification System */}
      <NotificationSystem 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default ProfileView;