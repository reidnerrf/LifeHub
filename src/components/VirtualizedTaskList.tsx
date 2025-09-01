import React, { memo, useMemo } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
}

interface VirtualizedTaskListProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onTaskComplete?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  maxToRenderPerBatch?: number;
  windowSize?: number;
}

const TaskItem = memo(({ task, onPress, onComplete, onEdit, onDelete, theme }: {
  task: Task;
  onPress?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  theme: any;
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.error || '#FF3B30';
      case 'medium': return theme.warning || '#FF9500';
      case 'low': return theme.success || '#34C759';
      default: return theme.textLight || '#8E8E93';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.taskItem, { backgroundColor: theme.card }]}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      <View style={styles.taskContent}>
        <TouchableOpacity
          style={[styles.checkbox, {
            borderColor: getPriorityColor(task.priority),
            backgroundColor: task.completed ? getPriorityColor(task.priority) : 'transparent'
          }]}
          onPress={() => onComplete?.(task)}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={12} color="white" />
          )}
        </TouchableOpacity>

        <View style={styles.taskText}>
          <Text style={[
            styles.taskTitle,
            {
              color: theme.text,
              textDecorationLine: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.6 : 1
            }
          ]}>
            {task.title}
          </Text>
          {task.description && (
            <Text style={[styles.taskDescription, { color: theme.textLight }]}>
              {task.description}
            </Text>
          )}
        </View>

        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit?.(task)}
          >
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete?.(task)}
          >
            <Ionicons name="trash" size={16} color={theme.error || '#FF3B30'} />
          </TouchableOpacity>
        </View>
      </View>

      {task.tags && task.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {task.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.tagText, { color: theme.primary }]}>{tag}</Text>
            </View>
          ))}
          {task.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: theme.textLight }]}>
              +{task.tags.length - 3}
            </Text>
          )}
        </View>
      )}

      {task.dueDate && (
        <View style={styles.dueDateContainer}>
          <Ionicons name="time-outline" size={12} color={theme.textLight} />
          <Text style={[styles.dueDate, { color: theme.textLight }]}>
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const VirtualizedTaskList: React.FC<VirtualizedTaskListProps> = ({
  tasks,
  onTaskPress,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
  maxToRenderPerBatch = 10,
  windowSize = 10,
}) => {
  const theme = useTheme();

  const memoizedTasks = useMemo(() => {
    return tasks.map(task => ({ ...task, key: task.id }));
  }, [tasks]);

  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={onTaskPress}
      onComplete={onTaskComplete}
      onEdit={onTaskEdit}
      onDelete={onTaskDelete}
      theme={theme}
    />
  );

  const getItemLayout = (data: any, index: number) => ({
    length: 100, // Estimated height of each item
    offset: 100 * index,
    index,
  });

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color={theme.textLight} />
        <Text style={[styles.emptyText, { color: theme.textLight }]}>
          Nenhuma tarefa encontrada
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={memoizedTasks}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      getItemLayout={getItemLayout}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      removeClippedSubviews={true}
      initialNumToRender={10}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  taskItem: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 14,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default memo(VirtualizedTaskList);
