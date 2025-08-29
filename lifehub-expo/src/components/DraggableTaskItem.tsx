import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, Task } from '../store/tasks';

interface DraggableTaskItemProps {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  onPress,
  onLongPress,
  style,
}) => {
  const {
    draggedTask,
    setDraggedTask,
    setDropTarget,
    moveTask,
    activeTimeEntry,
    startTimeTracking,
    stopTimeTracking,
  } = useTasks();

  const translateY = new Animated.Value(0);
  const scale = new Animated.Value(1);
  const opacity = new Animated.Value(1);

  const isBeingDragged = draggedTask?.id === task.id;
  const isTimeTracking = activeTimeEntry?.taskId === task.id;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setDraggedTask(task);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (event.nativeEvent.state === State.END) {
      setDraggedTask(null);
      setDropTarget(null);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleTimeTracking = () => {
    if (isTimeTracking) {
      stopTimeTracking(task.id);
    } else {
      startTimeTracking(task.id);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return '#ff4757';
      case 'high':
        return '#ff6b35';
      case 'medium':
        return '#ffa726';
      case 'low':
        return '#66bb6a';
      default:
        return '#66bb6a';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in_progress':
        return '#2196f3';
      case 'cancelled':
        return '#9e9e9e';
      default:
        return '#ff9800';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={!isTimeTracking}
    >
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [{ translateY }, { scale }],
            opacity,
            zIndex: isBeingDragged ? 1000 : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.taskContainer}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(task.priority) },
                ]}
              />
              <Text
                style={[
                  styles.title,
                  task.completed && styles.completedTitle,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
            </View>
            
            <View style={styles.actions}>
              {task.estimatedDuration && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.durationText}>
                    {formatDuration(task.estimatedDuration)}
                  </Text>
                </View>
              )}
              
              {task.actualDuration && (
                <View style={styles.actualDurationBadge}>
                  <Ionicons name="timer-outline" size={12} color="#666" />
                  <Text style={styles.durationText}>
                    {formatDuration(task.actualDuration)}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.timeTrackingButton,
                  isTimeTracking && styles.timeTrackingActive,
                ]}
                onPress={handleTimeTracking}
              >
                <Ionicons
                  name={isTimeTracking ? 'pause' : 'play'}
                  size={16}
                  color={isTimeTracking ? '#fff' : '#666'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.tagsContainer}>
              {task.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {task.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
              )}
            </View>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(task.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {task.status === 'pending' && 'Pendente'}
                  {task.status === 'in_progress' && 'Em Progresso'}
                  {task.status === 'completed' && 'Concluída'}
                  {task.status === 'cancelled' && 'Cancelada'}
                </Text>
              </View>
            </View>
          </View>

          {task.subtasks.length > 0 && (
            <View style={styles.subtasksContainer}>
              <Text style={styles.subtasksText}>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtarefas
              </Text>
              <View style={styles.subtasksProgress}>
                <View
                  style={[
                    styles.subtasksProgressBar,
                    {
                      width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {task.dueDate && (
            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.dueDateText}>
                {task.dueDate.toLocaleDateString('pt-BR')}
              </Text>
              {task.dueDate < new Date() && !task.completed && (
                <Text style={styles.overdueText}>Atrasada</Text>
              )}
            </View>
          )}

          {task.isShared && (
            <View style={styles.sharedIndicator}>
              <Ionicons name="people-outline" size={14} color="#666" />
              <Text style={styles.sharedText}>Compartilhada</Text>
            </View>
          )}

          {task.dependencies.length > 0 && (
            <View style={styles.dependenciesIndicator}>
              <Ionicons name="link-outline" size={14} color="#666" />
              <Text style={styles.dependenciesText}>
                {task.dependencies.length} dependência{task.dependencies.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  taskContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  actualDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  durationText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  timeTrackingButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeTrackingActive: {
    backgroundColor: '#ff4757',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  subtasksContainer: {
    marginBottom: 8,
  },
  subtasksText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  subtasksProgress: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subtasksProgressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
  },
  overdueText: {
    fontSize: 11,
    color: '#ff4757',
    fontWeight: '600',
    marginLeft: 8,
  },
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  sharedText: {
    fontSize: 11,
    color: '#666',
  },
  dependenciesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dependenciesText: {
    fontSize: 11,
    color: '#666',
  },
});