import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks, Task } from '../store/tasks';
import TaskItem from './TaskItem';

const { width } = Dimensions.get('window');

interface KanbanViewProps {
  onTaskPress?: (task: Task) => void;
}

export default function KanbanView({ onTaskPress }: KanbanViewProps) {
  const t = useTheme();
  const { tasks, updateTask, getTasksByStatus } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns = [
    { 
      id: 'pending', 
      title: 'A Fazer', 
      icon: 'ellipse-outline',
      color: t.textLight,
      tasks: getTasksByStatus('pending')
    },
    { 
      id: 'in_progress', 
      title: 'Em Progresso', 
      icon: 'play-circle-outline',
      color: t.warning,
      tasks: getTasksByStatus('in_progress')
    },
    { 
      id: 'completed', 
      title: 'Concluído', 
      icon: 'checkmark-circle-outline',
      color: t.success,
      tasks: getTasksByStatus('completed')
    },
    { 
      id: 'cancelled', 
      title: 'Cancelado', 
      icon: 'close-circle-outline',
      color: t.error,
      tasks: getTasksByStatus('cancelled')
    }
  ];

  const handleTaskPress = (task: Task) => {
    onTaskPress?.(task);
  };

  const handleStatusChange = (task: Task, newStatus: Task['status']) => {
    updateTask(task.id, { status: newStatus });
  };

  const getColumnStats = (columnTasks: Task[]) => {
    const total = columnTasks.length;
    const urgent = columnTasks.filter(t => t.priority === 'urgent').length;
    const high = columnTasks.filter(t => t.priority === 'high').length;
    
    return { total, urgent, high };
  };

  const getPriorityCount = (tasks: Task[], priority: Task['priority']) => {
    return tasks.filter(t => t.priority === priority).length;
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {columns.map((column) => {
        const stats = getColumnStats(column.tasks);
        
        return (
          <View key={column.id} style={[styles.column, { backgroundColor: t.card }]}>
            {/* Header da coluna */}
            <View style={styles.columnHeader}>
              <View style={styles.columnTitleContainer}>
                <Ionicons name={column.icon} size={20} color={column.color} />
                <Text style={[styles.columnTitle, { color: t.text }]}>
                  {column.title}
                </Text>
                <View style={[styles.taskCount, { backgroundColor: column.color + '20' }]}>
                  <Text style={[styles.taskCountText, { color: column.color }]}>
                    {stats.total}
                  </Text>
                </View>
              </View>
              
              {/* Estatísticas da coluna */}
              <View style={styles.columnStats}>
                {stats.urgent > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="flash" size={12} color="#FF3B30" />
                    <Text style={[styles.statText, { color: '#FF3B30' }]}>{stats.urgent}</Text>
                  </View>
                )}
                {stats.high > 0 && (
                  <View style={styles.statItem}>
                    <Ionicons name="arrow-up" size={12} color="#FF9500" />
                    <Text style={[styles.statText, { color: '#FF9500' }]}>{stats.high}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Lista de tarefas */}
            <ScrollView 
              style={styles.taskList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {column.tasks.length === 0 ? (
                <View style={styles.emptyColumn}>
                  <Ionicons name="add-circle-outline" size={48} color={t.textLight} />
                  <Text style={[styles.emptyText, { color: t.textLight }]}>
                    Nenhuma tarefa
                  </Text>
                </View>
              ) : (
                column.tasks.map((task) => (
                  <View key={task.id} style={styles.taskWrapper}>
                    <TaskItem 
                      task={task} 
                      onPress={() => handleTaskPress(task)}
                      showSubtasks={false}
                    />
                    
                    {/* Menu de ações rápidas */}
                    <View style={styles.quickActions}>
                      {column.id !== 'completed' && (
                        <TouchableOpacity
                          style={[styles.quickAction, { backgroundColor: t.success }]}
                          onPress={() => handleStatusChange(task, 'completed')}
                        >
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                      )}
                      
                      {column.id !== 'in_progress' && column.id !== 'completed' && (
                        <TouchableOpacity
                          style={[styles.quickAction, { backgroundColor: t.warning }]}
                          onPress={() => handleStatusChange(task, 'in_progress')}
                        >
                          <Ionicons name="play" size={16} color="#fff" />
                        </TouchableOpacity>
                      )}
                      
                      {column.id !== 'cancelled' && (
                        <TouchableOpacity
                          style={[styles.quickAction, { backgroundColor: t.error }]}
                          onPress={() => handleStatusChange(task, 'cancelled')}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Footer da coluna com resumo */}
            <View style={styles.columnFooter}>
              <View style={styles.prioritySummary}>
                {getPriorityCount(column.tasks, 'urgent') > 0 && (
                  <View style={styles.priorityItem}>
                    <View style={[styles.priorityDot, { backgroundColor: '#FF3B30' }]} />
                    <Text style={[styles.priorityText, { color: '#FF3B30' }]}>
                      {getPriorityCount(column.tasks, 'urgent')}
                    </Text>
                  </View>
                )}
                {getPriorityCount(column.tasks, 'high') > 0 && (
                  <View style={styles.priorityItem}>
                    <View style={[styles.priorityDot, { backgroundColor: '#FF9500' }]} />
                    <Text style={[styles.priorityText, { color: '#FF9500' }]}>
                      {getPriorityCount(column.tasks, 'high')}
                    </Text>
                  </View>
                )}
                {getPriorityCount(column.tasks, 'medium') > 0 && (
                  <View style={styles.priorityItem}>
                    <View style={[styles.priorityDot, { backgroundColor: '#007AFF' }]} />
                    <Text style={[styles.priorityText, { color: '#007AFF' }]}>
                      {getPriorityCount(column.tasks, 'medium')}
                    </Text>
                  </View>
                )}
                {getPriorityCount(column.tasks, 'low') > 0 && (
                  <View style={styles.priorityItem}>
                    <View style={[styles.priorityDot, { backgroundColor: '#34C759' }]} />
                    <Text style={[styles.priorityText, { color: '#34C759' }]}>
                      {getPriorityCount(column.tasks, 'low')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  column: {
    width: width * 0.8,
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    maxHeight: '100%',
  },
  columnHeader: {
    marginBottom: 16,
  },
  columnTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  taskCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  columnStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
    marginBottom: 16,
  },
  taskWrapper: {
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  quickAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyColumn: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  columnFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  prioritySummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
});