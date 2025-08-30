import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useEvents, Event } from '../store/events';

const { width } = Dimensions.get('window');
const DAY_WIDTH = width / 7;

interface MonthViewProps {
  year: number;
  month: number;
  onDatePress?: (date: Date) => void;
  onEventPress?: (event: Event) => void;
}

export default function MonthView({ year, month, onDatePress, onEventPress }: MonthViewProps) {
  const t = useTheme();
  const { getEventsForMonth } = useEvents();

  const monthData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate.getMonth() <= month && days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [year, month]);

  const monthEvents = getEventsForMonth(year, month);

  const getEventsForDate = (date: Date) => {
    return monthEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <View style={styles.container}>
      {/* Header dos dias da semana */}
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayHeader}>
            <Text style={[
              styles.weekDayText, 
              { color: t.textLight },
              (index === 0 || index === 6) && { color: t.error }
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid do calendário */}
      <ScrollView style={styles.calendarGrid}>
        {Array.from({ length: Math.ceil(monthData.length / 7) }, (_, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {monthData.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    { backgroundColor: t.card },
                    isTodayDate && { backgroundColor: t.primary + '20' },
                    !isCurrentMonthDay && { opacity: 0.3 }
                  ]}
                  onPress={() => onDatePress?.(date)}
                >
                  {/* Número do dia */}
                  <Text style={[
                    styles.dayNumber,
                    { color: t.text },
                    !isCurrentMonthDay && { color: t.textLight },
                    isTodayDate && { color: t.primary, fontWeight: '600' },
                    isWeekend(date) && isCurrentMonthDay && { color: t.error }
                  ]}>
                    {date.getDate()}
                  </Text>

                  {/* Indicadores de eventos */}
                  <View style={styles.eventIndicators}>
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <View
                        key={eventIndex}
                        style={[
                          styles.eventIndicator,
                          { backgroundColor: getPriorityColor(event.priority) }
                        ]}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <Text style={[styles.moreEventsText, { color: t.textLight }]}>
                        +{dayEvents.length - 3}
                      </Text>
                    )}
                  </View>

                  {/* Eventos do dia (versão expandida) */}
                  {dayEvents.length > 0 && (
                    <View style={styles.dayEvents}>
                      {dayEvents.slice(0, 2).map((event) => (
                        <TouchableOpacity
                          key={event.id}
                          style={[
                            styles.eventItem,
                            { backgroundColor: getPriorityColor(event.priority) + '20' }
                          ]}
                          onPress={() => onEventPress?.(event)}
                        >
                          <Ionicons 
                            name={getEventTypeIcon(event.type)} 
                            size={12} 
                            color={getPriorityColor(event.priority)} 
                          />
                          <Text style={[
                            styles.eventTitle,
                            { color: getPriorityColor(event.priority) }
                          ]} numberOfLines={1}>
                            {event.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  weekDayHeader: {
    width: DAY_WIDTH,
    paddingVertical: 12,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  dayCell: {
    width: DAY_WIDTH,
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 4,
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreEventsText: {
    fontSize: 10,
    fontWeight: '500',
  },
  dayEvents: {
    gap: 2,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  eventTitle: {
    fontSize: 10,
    fontWeight: '500',
    flex: 1,
  },
});