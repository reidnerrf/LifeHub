import React, { useEffect, useMemo, useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Target, 
  DollarSign, 
  Brain, 
  Heart, 
  MessageCircle, 
  Trophy, 
  Bell,
  ExternalLink,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Award,
  Coffee,
  Sun,
  Moon,
  Sunrise
} from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PremiumModal from './PremiumModal';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  const [showPremium, setShowPremium] = useState(false);

  // Sample data for charts
  const productivityData = [
    { day: 'Seg', tasks: 8, focus: 4.2, habits: 85 },
    { day: 'Ter', tasks: 12, focus: 6.1, habits: 92 },
    { day: 'Qua', tasks: 6, focus: 3.8, habits: 78 },
    { day: 'Qui', tasks: 10, focus: 5.5, habits: 88 },
    { day: 'Sex', tasks: 14, focus: 7.2, habits: 95 },
    { day: 'Sáb', tasks: 4, focus: 2.1, habits: 65 },
    { day: 'Dom', tasks: 2, focus: 1.5, habits: 70 },
  ];

  const expenseData = [
    { category: 'Alimentação', value: 420, color: 'var(--app-red)' },
    { category: 'Transporte', value: 280, color: 'var(--app-blue)' },
    { category: 'Entretenimento', value: 150, color: 'var(--app-purple)' },
    { category: 'Saúde', value: 120, color: 'var(--app-green)' },
    { category: 'Outros', value: 180, color: 'var(--app-yellow)' },
  ];

  const todayTasks = [
    { id: 1, title: 'Revisar relatórios', time: '09:00', completed: true, source: 'local' },
    { id: 2, title: 'Reunião com cliente', time: '14:00', completed: false, source: 'google-calendar' },
    { id: 3, title: 'Exercitar-se', time: '18:00', completed: false, source: 'local' },
    { id: 4, title: 'Ler 30 minutos', time: '20:00', completed: false, source: 'local' },
  ];

  const habitProgress = [
    { name: 'Água (8 copos)', current: 6, total: 8, color: 'var(--app-blue)' },
    { name: 'Exercício', current: 1, total: 1, color: 'var(--app-green)' },
    { name: 'Meditação', current: 0, total: 1, color: 'var(--app-yellow)' },
  ];

  const stats = [
    { icon: CheckSquare, label: 'Tarefas hoje', value: '3/6', color: 'var(--app-blue)', trend: '+2', trendUp: true },
    { icon: Target, label: 'Hábitos', value: '67%', color: 'var(--app-green)', trend: '+5%', trendUp: true },
    { icon: DollarSign, label: 'Gastos hoje', value: 'R$ 45', color: 'var(--app-yellow)', trend: '-R$ 15', trendUp: false },
    { icon: Trophy, label: 'Pontos XP', value: '2.450', color: 'var(--app-purple)', trend: '+120', trendUp: true },
  ];

  // Motivational messages based on time of day
  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    const name = 'Ana';

    if (hour < 12) {
      return {
        icon: <Sunrise size={24} className="text-[var(--app-yellow)]" />,
        title: `Bom dia, ${name}! ☀️`,
        message: 'Um novo dia cheio de possibilidades te espera. Vamos conquistar seus objetivos!',
        color: 'from-[var(--app-yellow)] to-[var(--app-green)]'
      };
    } else if (hour < 18) {
      return {
        icon: <Sun size={24} className="text-[var(--app-blue)]" />,
        title: `Boa tarde, ${name}! 🌤️`,
        message: 'Você está indo muito bem! Continue assim e termine o dia com chave de ouro.',
        color: 'from-[var(--app-blue)] to-[var(--app-purple)]'
      };
    } else {
      return {
        icon: <Moon size={24} className="text-[var(--app-purple)]" />,
        title: `Boa noite, ${name}! 🌙`,
        message: 'Hora de relaxar e se preparar para um amanhã ainda melhor.',
        color: 'from-[var(--app-purple)] to-[var(--app-blue)]'
      };
    }
  };

  const motivationalMessage = getMotivationalMessage();

  const smartNotifications = [
    {
      id: 'focus-suggestion',
      type: 'suggestion',
      icon: Brain,
      color: 'var(--app-blue)',
      title: 'Hora ideal para foco! 🧠',
      message: 'Sua produtividade é 40% maior agora. Que tal uma sessão Pomodoro?',
      action: 'Iniciar foco',
      priority: 'medium'
    },
    {
      id: 'habit-reminder',
      type: 'reminder',
      icon: Target,
      color: 'var(--app-green)',
      title: 'Quase lá! 💪',
      message: 'Faltam apenas 2 copos de água para completar sua meta diária.',
      action: 'Registrar água',
      priority: 'low'
    }
  ];

  const activeIntegrations = [
    { name: 'Google Calendar', status: 'active', lastSync: '2min' },
    { name: 'Nubank', status: 'active', lastSync: '1h' },
    { name: 'Spotify', status: 'active', lastSync: 'agora' },
    { name: 'Google Drive', status: 'syncing', lastSync: 'sincronizando...' }
  ];

  const dismissNotification = (id: string) => {
    setDismissedNotifications(prev => [...prev, id]);
  };

  const visibleNotifications = smartNotifications.filter(n => !dismissedNotifications.includes(n.id));

  const [aiSuggestions, setAiSuggestions] = useState<{ id: string; title: string; description?: string }[]>([]);
  const [planningScore, setPlanningScore] = useState<{ score: number; insights: string[] } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const list = await api.listSuggestions();
        setAiSuggestions(list);
      } catch {
        setAiSuggestions(aiOrchestrator.getDailySuggestions(new Date()).map(s => ({ id: s.id, title: s.title, description: s.description })));
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const payload = { totalTasks: todayTasks.length, conflictingEvents: 0, overbookedMinutes: 0, freeBlocks: [{ start: new Date().toISOString(), end: new Date(Date.now()+60*60*1000).toISOString() }] };
        const res = await api.scorePlanning(payload);
        setPlanningScore(res);
      } catch {
        setPlanningScore({ score: 78, insights: ['Distribua melhor as tarefas','Reserve folgas para imprevistos'] });
      }
    })();
  }, []);

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Header with Motivational Message */}
      <Card className={`p-6 bg-gradient-to-r ${motivationalMessage.color} rounded-3xl border-0 shadow-lg text-white overflow-hidden relative`}>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            {motivationalMessage.icon}
            <div>
              <h1 className="text-xl font-semibold">{motivationalMessage.title}</h1>
              <p className="text-white/90 text-sm mt-1">Terça-feira, 26 de Agosto</p>
            </div>
          </div>
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            {motivationalMessage.message}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
              <span className="text-white/80">
                {activeIntegrations.filter(i => i.status === 'active').length} integrações ativas
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy size={14} />
              <span className="text-white/80">Nível 12</span>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      </Card>

      {/* Planning Score */}
      {planningScore && (
        <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[var(--app-text)]">Score de Planejamento</h3>
            <span className="text-[var(--app-blue)] font-bold">{planningScore.score}</span>
          </div>
          <ul className="list-disc ml-6 text-sm text-[var(--app-text-light)]">
            {planningScore.insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Smart Notifications */}
      {visibleNotifications.length > 0 && (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <Card 
                key={notification.id}
                className="p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4"
                style={{ borderLeftColor: notification.color }}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${notification.color}15` }}
                  >
                    <Icon size={20} style={{ color: notification.color }} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--app-text)] mb-1">{notification.title}</h4>
                    <p className="text-sm text-[var(--app-text-light)] mb-3">{notification.message}</p>
                    
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        className="text-xs h-7 px-3 rounded-lg"
                        style={{ backgroundColor: notification.color }}
                      >
                        {notification.action}
                      </Button>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-xs text-[var(--app-text-light)] hover:text-[var(--app-text)] transition-colors"
                      >
                        Dispensar
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="p-5 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles size={18} className="text-[var(--app-blue)]" />
              <h3 className="font-medium text-[var(--app-text)]">Sugestões da IA</h3>
            </div>
            <button onClick={() => setShowPremium(true)} className="text-xs px-3 py-1 rounded-lg bg-[var(--app-blue)] text-white">Desbloquear Premium</button>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-[var(--app-light-gray)]">
                <div className="text-sm font-medium text-[var(--app-text)]">{s.title}</div>
                {s.description && (
                  <div className="text-xs text-[var(--app-text-light)] mt-1">{s.description}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--app-text-light)] mb-1">{stat.label}</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-[var(--app-text)]">{stat.value}</p>
                    <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trendUp ? 'bg-[var(--app-green)]10 text-[var(--app-green)]' : 'bg-[var(--app-red)]10 text-[var(--app-red)]'
                    }`}>
                      {stat.trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Productivity Chart */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-[var(--app-text)] mb-1">Produtividade Semanal</h3>
            <p className="text-sm text-[var(--app-text-light)]">Tarefas concluídas e horas de foco</p>
          </div>
          <Badge className="bg-[var(--app-green)]15 text-[var(--app-green)] border-0">
            +15% esta semana
          </Badge>
        </div>
        
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--app-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--app-blue)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--app-purple)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--app-purple)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-light-gray)" />
              <XAxis dataKey="day" stroke="var(--app-text-light)" fontSize={12} />
              <YAxis stroke="var(--app-text-light)" fontSize={12} />
              <Area 
                type="monotone" 
                dataKey="tasks" 
                stroke="var(--app-blue)" 
                fill="url(#tasksGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="focus" 
                stroke="var(--app-purple)" 
                fill="url(#focusGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[var(--app-blue)] rounded-full" />
            <span className="text-[var(--app-text-light)]">Tarefas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[var(--app-purple)] rounded-full" />
            <span className="text-[var(--app-text-light)]">Horas de Foco</span>
          </div>
        </div>
      </Card>

      {/* Expenses Chart */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-[var(--app-text)] mb-1">Gastos por Categoria</h3>
            <p className="text-sm text-[var(--app-text-light)]">Distribuição mensal</p>
          </div>
          <span className="text-sm font-medium text-[var(--app-text)]">R$ 1.150</span>
        </div>
        
        <div className="h-40 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {expenseData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[var(--app-text-light)] flex-1 truncate">{item.category}</span>
              <span className="font-medium text-[var(--app-text)]">R$ {item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Timeline */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[var(--app-text)]">Timeline de Hoje</h3>
          <div className="flex items-center space-x-1 text-xs text-[var(--app-text-light)]">
            <Zap size={12} />
            <span>Sincronizado</span>
          </div>
        </div>
        <div className="space-y-4">
          {todayTasks.map((task, index) => (
            <div key={task.id} className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    task.completed ? 'bg-[var(--app-green)]' : 'bg-[var(--app-gray)]'
                  }`}
                />
                {index !== todayTasks.length - 1 && (
                  <div className="w-0.5 h-8 bg-[var(--app-light-gray)] mt-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className={`${task.completed ? 'line-through text-[var(--app-text-light)]' : 'text-[var(--app-text)]'}`}>
                      {task.title}
                    </p>
                    {task.source === 'google-calendar' && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-[var(--app-blue)]10 text-[var(--app-blue)]">
                        Calendar
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-[var(--app-text-light)]">{task.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Habits Progress */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[var(--app-text)]">Progresso dos Hábitos</h3>
          <div className="flex items-center space-x-1">
            <Award size={16} className="text-[var(--app-yellow)]" />
            <span className="text-sm text-[var(--app-text-light)]">67% hoje</span>
          </div>
        </div>
        <div className="space-y-4">
          {habitProgress.map((habit, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[var(--app-text)]">{habit.name}</span>
                <span className="text-sm font-medium text-[var(--app-text)]">
                  {habit.current}/{habit.total}
                </span>
              </div>
              <Progress 
                value={(habit.current / habit.total) * 100} 
                className="h-3 rounded-full"
                style={{ 
                  '--progress-foreground': habit.color 
                } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-[var(--app-blue)]15 rounded-xl hover:bg-[var(--app-blue)]20 transition-all group">
            <Brain size={20} style={{ color: 'var(--app-blue)' }} />
            <span className="text-sm font-medium text-[var(--app-text)] group-hover:text-[var(--app-blue)] transition-colors">Sessão Foco</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-[var(--app-green)]15 rounded-xl hover:bg-[var(--app-green)]20 transition-all group">
            <Heart size={20} style={{ color: 'var(--app-green)' }} />
            <span className="text-sm font-medium text-[var(--app-text)] group-hover:text-[var(--app-green)] transition-colors">Bem-estar</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-[var(--app-yellow)]15 rounded-xl hover:bg-[var(--app-yellow)]20 transition-all group">
            <MessageCircle size={20} style={{ color: 'var(--app-yellow)' }} />
            <span className="text-sm font-medium text-[var(--app-text)] group-hover:text-[var(--app-yellow)] transition-colors">Assistente IA</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-[var(--app-purple)]15 rounded-xl hover:bg-[var(--app-purple)]20 transition-all group">
            <Coffee size={20} style={{ color: 'var(--app-purple)' }} />
            <span className="text-sm font-medium text-[var(--app-text)] group-hover:text-[var(--app-purple)] transition-colors">Pausa</span>
          </button>
        </div>
      </Card>
      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
};

export default Dashboard;