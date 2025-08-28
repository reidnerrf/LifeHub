import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
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
import { DraggableTaskItem } from '../components/DraggableTaskItem';
import { TaskTemplatesModal } from '../components/TaskTemplatesModal';
import { TaskDependenciesModal } from '../components/TaskDependenciesModal';
import { ProductivityReportsModal } from '../components/ProductivityReportsModal';

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
    deleteTask,
    createTaskFromTemplate,
    getProductivityStats,
    getOverdueTasks,
    getTasksDueSoon,
    isOffline,
    syncOfflineChanges,
    getPendingSync,
    activeTimeEntry,
  } = useTasks();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForDependencies, setSelectedTaskForDependencies] = useState<Task | null>(null);

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
        dependencies: task.dependencies || [],
        timeEntries: task.timeEntries || [],
        isShared: task.isShared || false,
        sharedWith: task.sharedWith || [],
        externalCalendarId: task.externalCalendarId,
        externalEventId: task.externalEventId,
        notifications: task.notifications || { enabled: true, reminderTime: 30 },
        aiSuggestions: task.aiSuggestions || {},
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
        dependencies: [],
        timeEntries: [],
        isShared: false,
        sharedWith: [],
        notifications: { enabled: true, reminderTime: 30 },
        aiSuggestions: {},
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

  const handleTemplateSelect = (template: any) => {
    createTaskFromTemplate(template.id);
    Alert.alert('Sucesso', 'Tarefa criada a partir do template!');
  };

  const handleSyncOffline = async () => {
    try {
      const success = await syncOfflineChanges();
      if (success) {
        Alert.alert('Sucesso', 'Alterações sincronizadas com sucesso!');
      } else {
        Alert.alert('Erro', 'Falha na sincronização. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro durante a sincronização');
    }
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
  const stats = getProductivityStats();
  const overdueTasks = getOverdueTasks();
  const tasksDueSoon = getTasksDueSoon(24); // próximas 24 horas
  const pendingSync = getPendingSync();

  const renderTaskItem = ({ item }: { item: Task }) => (
    <DraggableTaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onLongPress={() => {
        setSelectedTaskForDependencies(item);
        setShowDependenciesModal(true);
      }}
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

  const renderQuickActions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.quickActionsContainer}
      contentContainerStyle={styles.quickActionsContent}
    >
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: t.primary }]}
        onPress={() => setShowTemplatesModal(true)}
      >
        <Ionicons name="copy-outline" size={20} color="#fff" />
        <Text style={[styles.quickActionText, { color: '#fff' }]}>Templates</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: t.success }]}
        onPress={() => setShowReportsModal(true)}
      >
        <Ionicons name="analytics-outline" size={20} color="#fff" />
        <Text style={[styles.quickActionText, { color: '#fff' }]}>Relatórios</Text>
      </TouchableOpacity>

      {isOffline && (
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: t.warning }]}
          onPress={handleSyncOffline}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={[styles.quickActionText, { color: '#fff' }]}>
            Sincronizar ({pendingSync.tasks.length + pendingSync.timeEntries.length})
          </Text>
        </TouchableOpacity>
      )}

      {activeTimeEntry && (
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: '#ff4757' }]}
        >
          <Ionicons name="timer" size={20} color="#fff" />
          <Text style={[styles.quickActionText, { color: '#fff' }]}>Cronômetro Ativo</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderAlerts = () => {
    const alerts = [];
    
    if (overdueTasks.length > 0) {
      alerts.push(
        <View key="overdue" style={[styles.alertCard, { backgroundColor: '#ffebee' }]}>
          <Ionicons name="warning-outline" size={20} color="#d32f2f" />
          <Text style={[styles.alertText, { color: '#d32f2f' }]}>
            {overdueTasks.length} tarefa{overdueTasks.length > 1 ? 's' : ''} atrasada{overdueTasks.length > 1 ? 's' : ''}
          </Text>
        </View>
      );
    }

    if (tasksDueSoon.length > 0) {
      alerts.push(
        <View key="dueSoon" style={[styles.alertCard, { backgroundColor: '#fff3e0' }]}>
          <Ionicons name="time-outline" size={20} color="#f57c00" />
          <Text style={[styles.alertText, { color: '#f57c00' }]}>
            {tasksDueSoon.length} tarefa{tasksDueSoon.length > 1 ? 's' : ''} vence{m em breve
          </Text>
        </View>
      );
    }

    return alerts.length > 0 ? (
      <View style={styles.alertsContainer}>
        {alerts}
      </View>
    ) : null;
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: t.text }]}>Tarefas & Planner</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowTemplatesModal(true)}
              style={[styles.headerActionButton, { backgroundColor: t.background }]}
            >
              <Ionicons name="copy-outline" size={20} color={t.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={[styles.addButton, { backgroundColor: t.primary }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
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
            <Text style={[styles.statNumber, { color: t.text }]}>{stats.totalTasks}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.success }]}>
              {stats.completedTasks}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Concluídas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {overdueTasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Atrasadas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.warning }]}>
              {tasks.filter(t => t.status === 'in_progress').length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Em Progresso</Text>
          </View>
        </View>

        {/* Ações Rápidas */}
        {renderQuickActions()}

        {/* Alertas */}
        {renderAlerts()}
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

      {/* Modais */}
      <CreateTaskModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        initialData={editingTask || undefined}
      />

      <TaskTemplatesModal
        visible={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      <TaskDependenciesModal
        visible={showDependenciesModal}
        onClose={() => {
          setShowDependenciesModal(false);
          setSelectedTaskForDependencies(null);
        }}
        taskId={selectedTaskForDependencies?.id || ''}
      />

      <ProductivityReportsModal
        visible={showReportsModal}
        onClose={() => setShowReportsModal(false)}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
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
  quickActionsContainer: {
    marginBottom: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
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