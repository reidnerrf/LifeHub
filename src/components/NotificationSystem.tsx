import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Calendar, Target, DollarSign, Brain } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'reminder';
  category: 'task' | 'habit' | 'finance' | 'focus' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  actions?: { label: string; action: () => void }[];
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'reminder',
      category: 'task',
      title: 'Tarefa Pendente',
      message: 'Você tem 3 tarefas de alta prioridade vencendo hoje',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'high',
      actions: [
        { label: 'Ver Tarefas', action: () => console.log('Open tasks') },
        { label: 'Adiar', action: () => console.log('Snooze') }
      ]
    },
    {
      id: '2',
      type: 'success',
      category: 'habit',
      title: 'Meta Alcançada! 🎉',
      message: 'Parabéns! Você completou sua sequência de 7 dias de exercícios',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'medium',
      actions: [
        { label: 'Compartilhar', action: () => console.log('Share achievement') }
      ]
    },
    {
      id: '3',
      type: 'warning',
      category: 'finance',
      title: 'Alerta de Orçamento',
      message: 'Seus gastos com alimentação ultrapassaram 90% do limite mensal',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'high',
      actions: [
        { label: 'Ver Detalhes', action: () => console.log('View finances') },
        { label: 'Ajustar Orçamento', action: () => console.log('Adjust budget') }
      ]
    },
    {
      id: '4',
      type: 'info',
      category: 'focus',
      title: 'Hora do Foco',
      message: 'Baseado no seu padrão, este é seu horário mais produtivo. Que tal uma sessão Pomodoro?',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true,
      priority: 'medium',
      actions: [
        { label: 'Iniciar Foco', action: () => console.log('Start focus') }
      ]
    },
    {
      id: '5',
      type: 'reminder',
      category: 'general',
      title: 'Sincronização Concluída',
      message: 'Seus dados foram sincronizados com Google Calendar e 2 novos eventos foram importados',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'low'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-[var(--app-green)]" />;
      case 'warning': return <AlertTriangle size={16} className="text-[var(--app-yellow)]" />;
      case 'info': return <Info size={16} className="text-[var(--app-blue)]" />;
      case 'reminder': return <Bell size={16} className="text-[var(--app-purple)]" />;
      default: return <Info size={16} className="text-[var(--app-gray)]" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task': return <CheckCircle size={14} />;
      case 'habit': return <Target size={14} />;
      case 'finance': return <DollarSign size={14} />;
      case 'focus': return <Brain size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'task': return 'var(--app-blue)';
      case 'habit': return 'var(--app-green)';
      case 'finance': return 'var(--app-yellow)';
      case 'focus': return 'var(--app-purple)';
      default: return 'var(--app-gray)';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="fixed top-0 right-0 w-full max-w-md h-full bg-[var(--app-card)] shadow-xl animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--app-light-gray)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--app-text)]">Notificações</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-[var(--app-text-light)]">{unreadCount} não lidas</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--app-gray)] hover:text-[var(--app-text)] hover:bg-[var(--app-light-gray)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Bell size={48} className="text-[var(--app-gray)] mb-4" />
              <h3 className="font-medium text-[var(--app-text)] mb-2">Nenhuma notificação</h3>
              <p className="text-sm text-[var(--app-text-light)] text-center">
                Você está em dia com tudo!
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sortedNotifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`p-4 border-0 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                    notification.read 
                      ? 'bg-[var(--app-light-gray)] opacity-75' 
                      : 'bg-[var(--app-card)]'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-[var(--app-text)] truncate">
                          {notification.title}
                        </h4>
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${getCategoryColor(notification.category)}15` }}
                        >
                          <div style={{ color: getCategoryColor(notification.category) }}>
                            {getCategoryIcon(notification.category)}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[var(--app-blue)] rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-[var(--app-text-light)] mb-3 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--app-text-light)]">
                          {formatTime(notification.timestamp)}
                        </span>
                        <Badge 
                          variant="secondary"
                          className={`text-xs px-2 py-1 ${
                            notification.priority === 'high' 
                              ? 'bg-[var(--app-red)]15 text-[var(--app-red)]'
                              : notification.priority === 'medium'
                              ? 'bg-[var(--app-yellow)]15 text-[var(--app-yellow)]'
                              : 'bg-[var(--app-gray)]15 text-[var(--app-gray)]'
                          }`}
                        >
                          {notification.priority === 'high' ? 'Alta' : 
                           notification.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {notification.actions.map((action, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.action();
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 px-3 text-[var(--app-gray)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            Dispensar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--app-light-gray)]">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
            >
              Marcar Todas como Lidas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-[var(--app-gray)]"
              onClick={() => {
                setNotifications([]);
              }}
            >
              Limpar Todas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;