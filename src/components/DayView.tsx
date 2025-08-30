import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useEvents, Event } from '../store/events';

const { width } = Dimensions.get('window');
const HOUR_HEIGHT = 60;
const TIMELINE_START = 6; // 6h
const TIMELINE_END = 22; // 22h

interface DayViewProps {
  date: Date;
  onEventPress?: (event: Event) => void;
  onTimeSlotPress?: (time: Date) => void;
}

export default function DayView({ date, onEventPress, onTimeSlotPress }: DayViewProps) {
  const t = useTheme();
  const { getEventsForDate } = useEvents();

  const dayEvents = getEventsForDate(date);
  const allDayEvents = dayEvents.filter(event => event.isAllDay);
  const timeEvents = dayEvents.filter(event => !event.isAllDay);

  const timelineHours = useMemo(() => {
    const hours = [];
    for (let i = TIMELINE_START; i <= TIMELINE_END; i++) {
      hours.push(i);
    }
    return hours;
  }, []);

  const getEventPosition = (event: Event) => {
    const startHour = event.startTime.getHours() + event.startTime.getMinutes() / 60;
    const endHour = event.endTime.getHours() + event.endTime.getMinutes() / 60;
    const duration = endHour - startHour;
    
    const top = (startHour - TIMELINE_START) * HOUR_HEIGHT;
    const height = duration * HOUR_HEIGHT;
    
    return { top, height };
  };

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return t.primary;
    }
  };

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return 'people';
      case 'task': return 'checkmark-circle';
      case 'reminder': return 'alarm';
      default: return 'calendar';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    if (isToday(date)) {
      const currentHour = now.getHours() + now.getMinutes() / 60;
      if (currentHour >= TIMELINE_START && currentHour <= TIMELINE_END) {
        return (currentHour - TIMELINE_START) * HOUR_HEIGHT;
      }
    }
    return null;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <View style={styles.container}>
      {/* Header com data */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Text style={[styles.dateText, { color: t.text }]}>
          {date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        {isToday(date) && (
          <View style={[styles.todayIndicator, { backgroundColor: t.primary }]}>
            <Text style={[styles.todayText, { color: '#fff' }]}>Hoje</Text>
          </View>
        )}
      </View>

      {/* Eventos do dia inteiro */}
      {allDayEvents.length > 0 && (
        <View style={[styles.allDaySection, { backgroundColor: t.card }]}>
          <Text style={[styles.allDayTitle, { color: t.text }]}>Dia Inteiro</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allDayEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.allDayEvent,
                  { backgroundColor: getPriorityColor(event.priority) + '20' }
                ]}
                onPress={() => onEventPress?.(event)}
              >
                <Ionicons 
                  name={getEventTypeIcon(event.type)} 
                  size={16} 
                  color={getPriorityColor(event.priority)} 
                />
                <Text style={[
                  styles.allDayEventTitle,
                  { color: getPriorityColor(event.priority) }
                ]} numberOfLines={1}>
                  {event.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Timeline */}
      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {/* Linha do tempo atual */}
          {currentTimePosition !== null && (
            <View 
              style={[
                styles.currentTimeLine,
                { 
                  top: currentTimePosition,
                  backgroundColor: t.primary 
                }
              ]}
            >
              <View style={[styles.currentTimeDot, { backgroundColor: t.primary }]} />
            </View>
          )}

          {/* Horários */}
          {timelineHours.map((hour) => (
            <TouchableOpacity
              key={hour}
              style={styles.timeSlot}
              onPress={() => {
                const time = new Date(date);
                time.setHours(hour, 0, 0, 0);
                onTimeSlotPress?.(time);
              }}
            >
              <Text style={[styles.timeText, { color: t.textLight }]}>
                {hour.toString().padStart(2, '0')}:00
              </Text>
              <View style={[styles.timeLine, { backgroundColor: t.border }]} />
            </TouchableOpacity>
          ))}

          {/* Eventos posicionados */}
          {timeEvents.map((event) => {
            const { top, height } = getEventPosition(event);
            
            return (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  {
                    top,
                    height: Math.max(height, 40),
                    backgroundColor: getPriorityColor(event.priority) + '20',
                    borderLeftColor: getPriorityColor(event.priority),
                  }
                ]}
                onPress={() => onEventPress?.(event)}
              >
                <View style={styles.eventHeader}>
                  <Ionicons 
                    name={getEventTypeIcon(event.type)} 
                    size={14} 
                    color={getPriorityColor(event.priority)} 
                  />
                  <Text style={[
                    styles.eventTime,
                    { color: getPriorityColor(event.priority) }
                  ]}>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Text>
                </View>
                
                <Text style={[
                  styles.eventTitle,
                  { color: getPriorityColor(event.priority) }
                ]} numberOfLines={2}>
                  {event.title}
                </Text>
                
                {event.location && (
                  <Text style={[styles.eventLocation, { color: t.textLight }]} numberOfLines={1}>
                    📍 {event.location}
                  </Text>
                )}

                {event.reminders.length > 0 && (
                  <View style={styles.remindersContainer}>
                    {event.reminders.map((reminder, index) => (
                      <View key={index} style={styles.reminderItem}>
                        <Ionicons name="alarm" size={12} color={t.warning} />
                        <Text style={[styles.reminderText, { color: t.textLight }]}>
                          {reminder.minutesBefore}min antes
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Resumo do dia */}
      <View style={[styles.summary, { backgroundColor: t.card }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: t.text }]}>
            {dayEvents.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: t.textLight }]}>Eventos</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: t.success }]}>
            {dayEvents.filter(e => e.type === 'meeting').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: t.textLight }]}>Reuniões</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: '#FF3B30' }]}>
            {dayEvents.filter(e => e.priority === 'urgent').length}
          </Text>
          <Text style={[styles.summaryLabel, { color: t.textLight }]}>Urgentes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  todayIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  allDaySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  allDayTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  allDayEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  allDayEventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeline: {
    flex: 1,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 60,
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
  },
  currentTimeDot: {
    position: 'absolute',
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeSlot: {
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    position: 'absolute',
    left: -50,
    fontSize: 12,
    fontWeight: '500',
  },
  timeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  eventCard: {
    position: 'absolute',
    left: 10,
    right: 10,
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  remindersContainer: {
    gap: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderText: {
    fontSize: 10,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});