import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { notificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

interface UpcomingRemindersWidgetProps {
  onPress?: () => void;
}

interface ReminderItem {
  id: string;
  routineName: string;
  activityTitle: string;
  scheduledTime: Date;
  minutesUntil: number;
  isOptional: boolean;
}

export default function UpcomingRemindersWidget({ onPress }: UpcomingRemindersWidgetProps) {
  const t = useTheme();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReminders();

    // Refresh reminders every minute
    const interval = setInterval(loadReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      const routineNotifications = await notificationService.getRoutineReminders();

      const upcomingReminders: ReminderItem[] = routineNotifications
        .map(notification => {
          const data = notification.content.data as any;
          if (!data || data.type !== 'routine_reminder') return null;

          const scheduledTimeStr = data.scheduledTime as string;
          if (!scheduledTimeStr) return null;

          const scheduledTime = new Date(scheduledTimeStr);
          const now = new Date();
          const minutesUntil = Math.floor((scheduledTime.getTime() - now.getTime()) / (1000 * 60));

          // Only show reminders within the next 24 hours
          if (minutesUntil < 0 || minutesUntil > 1440) return null;

          return {
            id: notification.identifier,
            routineName: notification.content.title.replace('⏰ ', ''),
            activityTitle: (data.activityTitle as string) || 'Atividade',
            scheduledTime,
            minutesUntil,
            isOptional: Boolean(data.isOptional),
          };
        })
        .filter((item): item is ReminderItem => item !== null)
        .sort((a, b) => a.minutesUntil - b.minutesUntil)
        .slice(0, 5); // Show only next 5 reminders

      setReminders(upcomingReminders as ReminderItem[]);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeDescription = (minutes: number) => {
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  const getUrgencyColor = (minutes: number) => {
    if (minutes < 15) return t.error;
    if (minutes < 60) return t.warning;
    return t.success;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: t.card }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={20} color={t.primary} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>Próximos Lembretes</Text>
        </View>
        <View style={styles.loadingState}>
          <Ionicons name="time-outline" size={32} color={t.textLight} />
          <Text style={[styles.loadingText, { color: t.textLight }]}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: t.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={20} color={t.primary} />
        </View>
        <Text style={[styles.title, { color: t.text }]}>Próximos Lembretes</Text>
        <Text style={[styles.count, { color: t.primary }]}>
          {reminders.length}
        </Text>
      </View>

      {reminders.length > 0 ? (
        <ScrollView style={styles.remindersList} showsVerticalScrollIndicator={false}>
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <View style={styles.reminderHeader}>
                <Text style={[styles.activityTitle, { color: t.text }]}>
                  {reminder.activityTitle}
                </Text>
                <View style={[
                  styles.timeBadge,
                  { backgroundColor: getUrgencyColor(reminder.minutesUntil) + '20' }
                ]}>
                  <Text style={[
                    styles.timeText,
                    { color: getUrgencyColor(reminder.minutesUntil) }
                  ]}>
                    {getTimeDescription(reminder.minutesUntil)}
                  </Text>
                </View>
              </View>

              <View style={styles.reminderDetails}>
                <Text style={[styles.routineName, { color: t.textLight }]}>
                  {reminder.routineName}
                </Text>
                <View style={styles.reminderMeta}>
                  <Ionicons name="time-outline" size={12} color={t.textLight} />
                  <Text style={[styles.scheduledTime, { color: t.textLight }]}>
                    {formatTime(reminder.scheduledTime)}
                  </Text>
                  {reminder.isOptional && (
                    <View style={[styles.optionalBadge, { backgroundColor: t.warning + '20' }]}>
                      <Text style={[styles.optionalText, { color: t.warning }]}>
                        Opcional
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off" size={32} color={t.textLight} />
          <Text style={[styles.emptyText, { color: t.textLight }]}>
            Nenhum lembrete agendado
          </Text>
          <Text style={[styles.emptySubtext, { color: t.textLight }]}>
            Ative rotinas para receber lembretes
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    maxHeight: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  remindersList: {
    flex: 1,
  },
  reminderItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reminderDetails: {
    marginTop: 4,
  },
  routineName: {
    fontSize: 12,
    marginBottom: 4,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduledTime: {
    fontSize: 12,
  },
  optionalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
