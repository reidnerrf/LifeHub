import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Animated, Easing, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

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

export default function NotificationSystem({ isOpen, onClose }: NotificationSystemProps) {
  const t = useTheme();
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
        { label: 'Ver Tarefas', action: () => Alert.alert('Ver Tarefas') },
        { label: 'Adiar', action: () => Alert.alert('Adiar') }
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
        { label: 'Compartilhar', action: () => Alert.alert('Compartilhar') }
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
        { label: 'Ver Detalhes', action: () => Alert.alert('Ver Detalhes') },
        { label: 'Ajustar Orçamento', action: () => Alert.alert('Ajustar Orçamento') }
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
        { label: 'Iniciar Foco', action: () => Alert.alert('Iniciar Foco') }
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

  // Animation values
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateX = useRef(new Animated.Value(width)).current;
  const notificationScales = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Animate modal visibility
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateX, {
          toValue: width,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      case 'reminder': return 'notifications';
      default: return 'information-circle';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return t.success;
      case 'warning': return t.warning;
      case 'info': return t.primary;
      case 'reminder': return t.secondary;
      default: return t.textLight;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task': return 'checkmark-circle-outline';
      case 'habit': return 'trophy-outline';
      case 'finance': return 'cash-outline';
      case 'focus': return 'bulb-outline';
      default: return 'notifications-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'task': return t.primary;
      case 'habit': return t.success;
      case 'finance': return t.warning;
      case 'focus': return t.secondary;
      default: return t.textLight;
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

  const getNotificationScale = (id: string) => {
    if (!notificationScales[id]) {
      notificationScales[id] = new Animated.Value(1);
    }
    return notificationScales[id];
  };

  const handleNotificationPress = (notification: Notification) => {
    const scale = getNotificationScale(notification.id);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  if (!isOpen) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: modalOpacity,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: t.card,
              transform: [{ translateX: modalTranslateX }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: t.text }]}>Notificações</Text>
              {unreadCount > 0 && (
                <Text style={[styles.unreadCount, { color: t.textLight }]}>
                  {unreadCount} não lidas
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: t.background }]}
            >
              <Ionicons name="close" size={20} color={t.text} />
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
            {sortedNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={64} color={t.textLight} />
                <Text style={[styles.emptyTitle, { color: t.text }]}>Nenhuma notificação</Text>
                <Text style={[styles.emptyMessage, { color: t.textLight }]}>
                  Você está em dia com tudo!
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsContainer}>
                {sortedNotifications.map((notification) => (
                  <Animated.View
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      {
                        backgroundColor: notification.read ? t.background : t.card,
                        transform: [{ scale: getNotificationScale(notification.id) }],
                      }
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleNotificationPress(notification)}
                      style={styles.notificationTouchable}
                    >
                      <View style={styles.notificationHeader}>
                        <View style={styles.iconContainer}>
                          <Ionicons
                            name={getIcon(notification.type) as any}
                            size={20}
                            color={getIconColor(notification.type)}
                          />
                        </View>
                        <View style={styles.notificationContent}>
                          <View style={styles.titleRow}>
                            <Text
                              style={[styles.notificationTitle, { color: t.text }]}
                              numberOfLines={1}
                            >
                              {notification.title}
                            </Text>
                            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(notification.category) + '20' }]}>
                              <Ionicons
                                name={getCategoryIcon(notification.category) as any}
                                size={12}
                                color={getCategoryColor(notification.category)}
                              />
                            </View>
                            {!notification.read && (
                              <View style={[styles.unreadDot, { backgroundColor: t.primary }]} />
                            )}
                          </View>

                          <Text
                            style={[styles.notificationMessage, { color: t.textLight }]}
                            numberOfLines={2}
                          >
                            {notification.message}
                          </Text>

                          <View style={styles.notificationFooter}>
                            <Text style={[styles.timestamp, { color: t.textLight }]}>
                              {formatTime(notification.timestamp)}
                            </Text>
                            <View style={[
                              styles.priorityBadge,
                              {
                                backgroundColor:
                                  notification.priority === 'high' ? t.error + '20' :
                                  notification.priority === 'medium' ? t.warning + '20' :
                                  t.textLight + '20'
                              }
                            ]}>
                              <Text style={[
                                styles.priorityText,
                                {
                                  color:
                                    notification.priority === 'high' ? t.error :
                                    notification.priority === 'medium' ? t.warning :
                                    t.textLight
                                }
                              ]}>
                                {notification.priority === 'high' ? 'Alta' :
                                 notification.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Text>
                            </View>
                          </View>

                          {notification.actions && notification.actions.length > 0 && (
                            <View style={styles.actionsContainer}>
                              {notification.actions.map((action, index) => (
                                <TouchableOpacity
                                  key={index}
                                  style={[styles.actionButton, { backgroundColor: t.primary + '20' }]}
                                  onPress={() => action.action()}
                                >
                                  <Text style={[styles.actionText, { color: t.primary }]}>
                                    {action.label}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                              <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: t.textLight + '20' }]}
                                onPress={() => removeNotification(notification.id)}
                              >
                                <Text style={[styles.actionText, { color: t.textLight }]}>
                                  Dispensar
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: t.background }]}>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: t.primary + '20' }]}
              onPress={() => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              }}
            >
              <Text style={[styles.footerButtonText, { color: t.primary }]}>
                Marcar Todas como Lidas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: t.textLight + '20' }]}
              onPress={() => {
                setNotifications([]);
              }}
            >
              <Text style={[styles.footerButtonText, { color: t.textLight }]}>
                Limpar Todas
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width - 32,
    maxHeight: '90%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadCount: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsList: {
    flex: 1,
    maxHeight: 400,
  },
  notificationsContainer: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  notificationTouchable: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
