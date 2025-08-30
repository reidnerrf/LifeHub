import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAssistant } from '../store/assistant';

interface RoutineSummaryWidgetProps {
  onPress?: () => void;
}

export default function RoutineSummaryWidget({ onPress }: RoutineSummaryWidgetProps) {
  const t = useTheme();
  const { getActiveRoutines } = useAssistant();

  const activeRoutines = getActiveRoutines();
  const nextActivity = getNextActivity();

  function getNextActivity() {
    const now = new Date();
    let nextActivity = null;
    let earliestTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    for (const routine of activeRoutines) {
      // This is a simplified version - in a real implementation,
      // you'd need to track scheduled times for routine activities
      // For now, we'll just show the first activity of each routine
      if (routine.activities.length > 0) {
        const activity = routine.activities[0];
        // Mock next activity time - in reality this would come from scheduling logic
        const mockTime = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000); // Within 4 hours

        if (mockTime < earliestTime) {
          earliestTime = mockTime;
          nextActivity = {
            routineName: routine.name,
            activityTitle: activity.title,
            activityDuration: activity.duration,
            scheduledTime: mockTime,
            isOptional: activity.isOptional,
          };
        }
      }
    }

    return nextActivity;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 0) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}min`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: t.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="time" size={20} color={t.primary} />
        </View>
        <Text style={[styles.title, { color: t.text }]}>Rotinas Ativas</Text>
        <Text style={[styles.count, { color: t.primary }]}>
          {activeRoutines.length}
        </Text>
      </View>

      {nextActivity ? (
        <View style={styles.nextActivity}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: t.text }]}>
              {nextActivity.activityTitle}
            </Text>
            <Text style={[styles.timeUntil, { color: t.textLight }]}>
              {getTimeUntil(nextActivity.scheduledTime)}
            </Text>
          </View>

          <View style={styles.activityDetails}>
            <Text style={[styles.routineName, { color: t.textLight }]}>
              {nextActivity.routineName}
            </Text>
            <View style={styles.activityMeta}>
              <Ionicons name="time-outline" size={12} color={t.textLight} />
              <Text style={[styles.duration, { color: t.textLight }]}>
                {nextActivity.activityDuration}min
              </Text>
              {nextActivity.isOptional && (
                <View style={[styles.optionalBadge, { backgroundColor: t.warning + '20' }]}>
                  <Text style={[styles.optionalText, { color: t.warning }]}>
                    Opcional
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={32} color={t.textLight} />
          <Text style={[styles.emptyText, { color: t.textLight }]}>
            Nenhuma atividade próxima
          </Text>
        </View>
      )}

      <View style={styles.routinesList}>
        {activeRoutines.slice(0, 3).map((routine) => (
          <View key={routine.id} style={styles.routineItem}>
            <View style={[styles.routineDot, { backgroundColor: routine.color }]} />
            <Text style={[styles.routineItemText, { color: t.text }]}>
              {routine.name}
            </Text>
          </View>
        ))}
        {activeRoutines.length > 3 && (
          <Text style={[styles.moreText, { color: t.textLight }]}>
            +{activeRoutines.length - 3} mais
          </Text>
        )}
      </View>
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
  nextActivity: {
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  timeUntil: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityDetails: {
    marginBottom: 8,
  },
  routineName: {
    fontSize: 12,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
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
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  routinesList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routineItemText: {
    fontSize: 12,
    flex: 1,
  },
  moreText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
