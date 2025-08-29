import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks, Task } from '../store/tasks';
import TaskItem from './TaskItem';

const { width } = Dimensions.get('window');

interface CalendarViewProps {
  onTaskPress?: (task: Task) => void;
}

export default function CalendarView({ onTaskPress }: CalendarViewProps) {
  const t = useTheme();
  const { tasks, updateTask } = useTasks();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Gerar dias da semana atual
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days;
  }, [currentWeek]);

  // Navegar para semana anterior/próxima
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Obter tarefas para um dia específico
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Verificar se é fim de semana
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return t.textLight;
    }
  };

  // Reagendar tarefa
  const rescheduleTask = (task: Task, newDate: Date) => {
    updateTask(task.id, { dueDate: newDate });
  };

  // Obter estatísticas da semana
  const getWeekStats = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let urgentTasks = 0;

    weekDays.forEach(day => {
      const dayTasks = getTasksForDay(day);
      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.status === 'completed').length;
      urgentTasks += dayTasks.filter(t => t.priority === 'urgent').length;
    });

    return { totalTasks, completedTasks, urgentTasks };
  };

  const weekStats = getWeekStats();

  return (
    <View style={styles.container}>
      {/* Header do calendário */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={t.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={[styles.todayText, { color: t.primary }]}>Hoje</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.weekTitle, { color: t.text }]}>
          {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Text>

        {/* Estatísticas da semana */}
        <View style={styles.weekStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.text }]}>{weekStats.totalTasks}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Tarefas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.success }]}>{weekStats.completedTasks}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Concluídas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{weekStats.urgentTasks}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Urgentes</Text>
          </View>
        </View>
      </View>

      {/* Grid de dias */}
      <ScrollView style={styles.calendarGrid}>
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentDay = isToday(day);
          
          return (
            <View key={index} style={[styles.dayColumn, { backgroundColor: t.card }]}>
              {/* Header do dia */}
              <View style={[
                styles.dayHeader,
                isCurrentDay && { backgroundColor: t.primary + '20' }
              ]}>
                <Text style={[
                  styles.dayName,
                  { color: t.text },
                  isWeekend(day) && { color: t.error },
                  isCurrentDay && { color: t.primary, fontWeight: '600' }
                ]}>
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  { color: t.text },
                  isCurrentDay && { color: t.primary, fontWeight: '600' }
                ]}>
                  {day.getDate()}
                </Text>
                {dayTasks.length > 0 && (
                  <View style={[styles.taskCount, { backgroundColor: t.primary }]}>
                    <Text style={[styles.taskCountText, { color: '#fff' }]}>
                      {dayTasks.length}
                    </Text>
                  </View>
                )}
              </View>

              {/* Lista de tarefas do dia */}
              <ScrollView style={styles.dayTasks} nestedScrollEnabled>
                {dayTasks.length === 0 ? (
                  <View style={styles.emptyDay}>
                    <Text style={[styles.emptyText, { color: t.textLight }]}>
                      Nenhuma tarefa
                    </Text>
                  </View>
                ) : (
                  dayTasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.taskCard,
                        { backgroundColor: t.background },
                        task.priority === 'urgent' && { borderLeftColor: '#FF3B30', borderLeftWidth: 3 },
                        task.priority === 'high' && { borderLeftColor: '#FF9500', borderLeftWidth: 3 },
                        task.status === 'completed' && { opacity: 0.6 }
                      ]}
                      onPress={() => onTaskPress?.(task)}
                    >
                      <View style={styles.taskCardHeader}>
                        <Text style={[
                          styles.taskTitle,
                          { color: t.text },
                          task.status === 'completed' && { textDecorationLine: 'line-through' }
                        ]}>
                          {task.title}
                        </Text>
                        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                      </View>
                      
                      {task.tags.length > 0 && (
                        <View style={styles.taskTags}>
                          {task.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Text key={tagIndex} style={[styles.taskTag, { color: t.primary }]}>
                              #{tag}
                            </Text>
                          ))}
                          {task.tags.length > 2 && (
                            <Text style={[styles.taskTag, { color: t.textLight }]}>
                              +{task.tags.length - 2}
                            </Text>
                          )}
                        </View>
                      )}

                      <View style={styles.taskMeta}>
                        <View style={styles.taskStatus}>
                          <View style={[styles.statusDot, { backgroundColor: task.status === 'completed' ? t.success : t.warning }]} />
                          <Text style={[styles.statusText, { color: t.textLight }]}>
                            {task.status.replace('_', ' ')}
                          </Text>
                        </View>
                        
                        {task.estimatedDuration && (
                          <Text style={[styles.durationText, { color: t.textLight }]}>
                            {task.estimatedDuration}min
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  calendarGrid: {
    flex: 1,
  },
  dayColumn: {
    width: width / 7,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
    minHeight: 200,
  },
  dayHeader: {
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dayTasks: {
    flex: 1,
    padding: 4,
  },
  emptyDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  taskCard: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  taskTag: {
    fontSize: 10,
    marginRight: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  durationText: {
    fontSize: 10,
  },
});