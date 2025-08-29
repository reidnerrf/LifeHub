import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { Task, SubTask, useTasks } from '../store/tasks';

const { width } = Dimensions.get('window');

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
  showSubtasks?: boolean;
}

export default function TaskItem({ task, onPress, showSubtasks = true }: TaskItemProps) {
  const t = useTheme();
  const { toggleTask, updateTask, deleteTask, addSubtask, toggleSubtask, estimateTaskDuration } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return t.textLight;
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'flash';
      case 'high': return 'arrow-up';
      case 'medium': return 'remove';
      case 'low': return 'arrow-down';
      default: return 'remove';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return t.success;
      case 'in_progress': return t.warning;
      case 'cancelled': return t.error;
      default: return t.textLight;
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    addSubtask(task.id, {
      title: newSubtask.trim(),
      completed: false,
    });
    setNewSubtask('');
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    
    updateTask(task.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteTask(task.id)
        }
      ]
    );
  };

  const handleReschedule = () => {
    // Implementar modal de reagendamento
    Alert.alert('Reagendar', 'Funcionalidade de reagendamento será implementada');
  };

  const estimatedDuration = task.estimatedDuration || estimateTaskDuration(task);
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <View style={[styles.container, { backgroundColor: t.card }]}>
      {/* Header da Tarefa */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleTask(task.id)}
        >
          <Ionicons 
            name={task.completed ? 'checkmark-circle' : 'ellipse-outline'} 
            size={24} 
            color={task.completed ? t.success : t.textLight} 
          />
        </TouchableOpacity>

        <View style={styles.content}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                style={[styles.editInput, { color: t.text, backgroundColor: t.background }]}
                autoFocus
                onBlur={handleSaveEdit}
                onSubmitEditing={handleSaveEdit}
              />
            </View>
          ) : (
            <TouchableOpacity onPress={onPress} style={styles.titleContainer}>
              <Text style={[
                styles.title, 
                { color: t.text },
                task.completed && styles.completedTitle
              ]}>
                {task.title}
              </Text>
            </TouchableOpacity>
          )}

          {task.description && (
            <Text style={[styles.description, { color: t.textLight }]}>
              {task.description}
            </Text>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {task.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: t.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: t.primary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Meta informações */}
          <View style={styles.meta}>
            {/* Prioridade */}
            <View style={styles.priorityContainer}>
              <Ionicons 
                name={getPriorityIcon(task.priority)} 
                size={16} 
                color={getPriorityColor(task.priority)} 
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>

            {/* Status */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]} />
              <Text style={[styles.statusText, { color: t.textLight }]}>
                {task.status.replace('_', ' ')}
              </Text>
            </View>

            {/* Duração estimada */}
            {estimatedDuration > 0 && (
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color={t.textLight} />
                <Text style={[styles.durationText, { color: t.textLight }]}>
                  {estimatedDuration}min
                </Text>
              </View>
            )}

            {/* Data de vencimento */}
            {task.dueDate && (
              <View style={styles.dueDateContainer}>
                <Ionicons name="calendar-outline" size={16} color={t.textLight} />
                <Text style={[styles.dueDateText, { color: t.textLight }]}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.actions}>
          {showSubtasks && (
            <TouchableOpacity 
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.actionButton}
            >
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={t.textLight} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={20} color={t.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleReschedule}
            style={styles.actionButton}
          >
            <Ionicons name="calendar" size={20} color={t.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDelete}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color={t.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtarefas */}
      {showSubtasks && isExpanded && (
        <View style={styles.subtasksContainer}>
          {task.subtasks.length > 0 && (
            <View style={styles.subtasksHeader}>
              <Text style={[styles.subtasksTitle, { color: t.textLight }]}>
                Subtarefas ({completedSubtasks}/{totalSubtasks})
              </Text>
            </View>
          )}

          {task.subtasks.map((subtask) => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <TouchableOpacity 
                style={styles.subtaskCheckbox}
                onPress={() => toggleSubtask(task.id, subtask.id)}
              >
                <Ionicons 
                  name={subtask.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={20} 
                  color={subtask.completed ? t.success : t.textLight} 
                />
              </TouchableOpacity>
              <Text style={[
                styles.subtaskTitle, 
                { color: t.text },
                subtask.completed && styles.completedSubtask
              ]}>
                {subtask.title}
              </Text>
            </View>
          ))}

          {/* Adicionar nova subtarefa */}
          <View style={styles.addSubtaskContainer}>
            <TextInput
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Adicionar subtarefa..."
              placeholderTextColor={t.textLight}
              style={[styles.subtaskInput, { color: t.text, backgroundColor: t.background }]}
              onSubmitEditing={handleAddSubtask}
            />
            <TouchableOpacity 
              onPress={handleAddSubtask}
              style={[styles.addSubtaskButton, { backgroundColor: t.primary }]}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
    borderRadius: 8,
  },
  titleContainer: {
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
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
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  subtasksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  subtasksHeader: {
    marginBottom: 12,
  },
  subtasksTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskCheckbox: {
    marginRight: 12,
  },
  subtaskTitle: {
    fontSize: 14,
    flex: 1,
  },
  completedSubtask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addSubtaskButton: {
    padding: 8,
    borderRadius: 8,
  },
});