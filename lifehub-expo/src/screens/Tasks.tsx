import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks, Task, TaskView } from '../store/tasks';
import { api } from '../services/api';
import TaskItem from '../components/TaskItem';
import TaskFilters from '../components/TaskFilters';
import KanbanView from '../components/KanbanView';
import CalendarView from '../components/CalendarView';
import CreateTaskModal from '../components/CreateTaskModal';

const { width } = Dimensions.get('window');

export default function Tasks() {
  const t = useTheme();
  const {
    tasks,
    setTasks,
    view,
    setView,
    getFilteredTasks,
    addTask,
    updateTask,
    deleteTask
  } = useTasks();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const list = await api.listTasks();
      // Converter dados do backend para o formato do store
      const formattedTasks = list.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description || '',
        completed: task.status === 'completed',
        priority: task.priority || 'medium',
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        estimatedDuration: task.estimatedDuration,
        actualDuration: task.actualDuration,
        status: task.status || 'pending',
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      setTasks(formattedTasks);
    } catch (e: any) {
      setError('Falha ao carregar tarefas');
      console.error('Error loading tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const created = await api.createTask(taskData);
      const newTask = {
        id: created._id,
        title: created.title,
        description: created.description || '',
        completed: false,
        priority: created.priority || 'medium',
        tags: created.tags || [],
        subtasks: created.subtasks || [],
        dueDate: created.dueDate ? new Date(created.dueDate) : undefined,
        estimatedDuration: created.estimatedDuration,
        status: 'pending',
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };
      addTask(newTask);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar tarefa');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      await api.updateTask(taskId, updates);
      updateTask(taskId, updates);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      deleteTask(taskId);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir tarefa');
    }
  };

  const handleTaskPress = (task: Task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const getViewIcon = (viewType: TaskView) => {
    switch (viewType) {
      case 'list': return 'list';
      case 'kanban': return 'grid';
      case 'calendar': return 'calendar';
      default: return 'list';
    }
  };

  const getViewLabel = (viewType: TaskView) => {
    switch (viewType) {
      case 'list': return 'Lista';
      case 'kanban': return 'Kanban';
      case 'calendar': return 'Calendário';
      default: return 'Lista';
    }
  };

  const filteredTasks = getFilteredTasks();

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { backgroundColor: t.card }]}>
      <Ionicons name="checkmark-circle-outline" size={64} color={t.textLight} />
      <Text style={[styles.emptyTitle, { color: t.text }]}>
        {filteredTasks.length === 0 && tasks.length > 0
          ? 'Nenhuma tarefa encontrada'
          : 'Nenhuma tarefa ainda'
        }
      </Text>
      <Text style={[styles.emptySubtitle, { color: t.textLight }]}>
        {filteredTasks.length === 0 && tasks.length > 0
          ? 'Tente ajustar os filtros'
          : 'Crie sua primeira tarefa para começar'
        }
      </Text>
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        style={[styles.createFirstButton, { backgroundColor: t.primary }]}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={[styles.createFirstButtonText, { color: '#fff' }]}>
          Criar Primeira Tarefa
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: t.text }]}>Tarefas & Planner</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            style={[styles.addButton, { backgroundColor: t.primary }]}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* View Selector */}
        <View style={styles.viewSelector}>
          {(['list', 'kanban', 'calendar'] as TaskView[]).map((viewType) => (
            <TouchableOpacity
              key={viewType}
              onPress={() => setView(viewType)}
              style={[
                styles.viewButton,
                { backgroundColor: t.background },
                view === viewType && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons
                name={getViewIcon(viewType)}
                size={20}
                color={view === viewType ? t.primary : t.textLight}
              />
              <Text style={[
                styles.viewButtonText,
                { color: view === viewType ? t.primary : t.textLight }
              ]}>
                {getViewLabel(viewType)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.text }]}>{tasks.length}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.success }]}>
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Concluídas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {tasks.filter(t => t.priority === 'urgent').length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Urgentes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.warning }]}>
              {tasks.filter(t => t.status === 'in_progress').length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Em Progresso</Text>
          </View>
        </View>
      </View>

      {/* Filtros */}
      <TaskFilters onFilterChange={() => {}} />

      {/* Conteúdo baseado na view */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: t.textLight }]}>Carregando tarefas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
            <TouchableOpacity onPress={loadTasks} style={[styles.retryButton, { backgroundColor: t.primary }]}>
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {view === 'list' && (
              <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTaskItem}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}

            {view === 'kanban' && (
              <KanbanView onTaskPress={handleTaskPress} />
            )}

            {view === 'calendar' && (
              <CalendarView onTaskPress={handleTaskPress} />
            )}
          </>
        )}
      </View>

      {/* Modal de criação/edição */}
      <CreateTaskModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        initialData={editingTask || undefined}
      />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
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
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});