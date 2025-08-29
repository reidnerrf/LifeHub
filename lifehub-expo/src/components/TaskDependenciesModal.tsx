import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, Task, TaskDependency } from '../store/tasks';

interface TaskDependenciesModalProps {
  visible: boolean;
  onClose: () => void;
  taskId: string;
}

export const TaskDependenciesModal: React.FC<TaskDependenciesModalProps> = ({
  visible,
  onClose,
  taskId,
}) => {
  const {
    tasks,
    addDependency,
    removeDependency,
    getDependencies,
    getBlockedTasks,
    canCompleteTask,
  } = useTasks();

  const [selectedDependencyType, setSelectedDependencyType] = useState<TaskDependency['type']>('requires');
  const [showAddDependency, setShowAddDependency] = useState(false);

  const currentTask = tasks.find(t => t.id === taskId);
  const dependencies = getDependencies(taskId);
  const blockedTasks = getBlockedTasks(taskId);
  const canComplete = canCompleteTask(taskId);

  // Filtrar tarefas que podem ser dependências (excluindo a própria tarefa e dependências circulares)
  const availableTasks = tasks.filter(task => 
    task.id !== taskId && 
    !dependencies.some(dep => dep.dependsOnTaskId === task.id)
  );

  const handleAddDependency = (dependsOnTaskId: string) => {
    addDependency(taskId, dependsOnTaskId, selectedDependencyType);
    setShowAddDependency(false);
    Alert.alert('Sucesso', 'Dependência adicionada com sucesso!');
  };

  const handleRemoveDependency = (dependencyId: string) => {
    Alert.alert(
      'Confirmar remoção',
      'Tem certeza que deseja remover esta dependência?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeDependency(dependencyId);
            Alert.alert('Sucesso', 'Dependência removida com sucesso!');
          },
        },
      ]
    );
  };

  const getDependencyTypeText = (type: TaskDependency['type']) => {
    switch (type) {
      case 'blocks':
        return 'Bloqueia';
      case 'requires':
        return 'Requer';
      case 'suggests':
        return 'Sugere';
      default:
        return type;
    }
  };

  const getDependencyTypeColor = (type: TaskDependency['type']) => {
    switch (type) {
      case 'blocks':
        return '#ff4757';
      case 'requires':
        return '#ff6b35';
      case 'suggests':
        return '#2ed573';
      default:
        return '#666';
    }
  };

  const getDependencyTypeIcon = (type: TaskDependency['type']) => {
    switch (type) {
      case 'blocks':
        return 'close-circle';
      case 'requires':
        return 'checkmark-circle';
      case 'suggests':
        return 'arrow-forward-circle';
      default:
        return 'link';
    }
  };

  const renderDependency = ({ item: dependency }: { item: TaskDependency }) => {
    const dependsOnTask = tasks.find(t => t.id === dependency.dependsOnTaskId);
    if (!dependsOnTask) return null;

    return (
      <View style={styles.dependencyCard}>
        <View style={styles.dependencyHeader}>
          <View style={styles.dependencyInfo}>
            <View style={styles.dependencyTypeContainer}>
              <Ionicons
                name={getDependencyTypeIcon(dependency.type)}
                size={16}
                color={getDependencyTypeColor(dependency.type)}
              />
              <Text style={[styles.dependencyType, { color: getDependencyTypeColor(dependency.type) }]}>
                {getDependencyTypeText(dependency.type)}
              </Text>
            </View>
            <Text style={styles.dependencyTaskTitle}>{dependsOnTask.title}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.removeDependencyButton}
            onPress={() => handleRemoveDependency(dependency.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ff4757" />
          </TouchableOpacity>
        </View>

        <View style={styles.dependencyDetails}>
          <View style={styles.dependencyStatus}>
            <View style={[styles.statusIndicator, { backgroundColor: dependsOnTask.completed ? '#4caf50' : '#ff9800' }]} />
            <Text style={styles.statusText}>
              {dependsOnTask.completed ? 'Concluída' : 'Pendente'}
            </Text>
          </View>
          
          {dependsOnTask.dueDate && (
            <View style={styles.dependencyDate}>
              <Ionicons name="calendar-outline" size={12} color="#666" />
              <Text style={styles.dateText}>
                {dependsOnTask.dueDate.toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAvailableTask = ({ item: task }: { item: Task }) => (
    <TouchableOpacity
      style={styles.availableTaskCard}
      onPress={() => handleAddDependency(task.id)}
    >
      <View style={styles.availableTaskInfo}>
        <Text style={styles.availableTaskTitle}>{task.title}</Text>
        <Text style={styles.availableTaskStatus}>
          {task.completed ? 'Concluída' : 'Pendente'}
        </Text>
      </View>
      
      <View style={styles.availableTaskActions}>
        <Ionicons name="add-circle-outline" size={20} color="#007bff" />
      </View>
    </TouchableOpacity>
  );

  const renderAddDependencyForm = () => (
    <View style={styles.addDependencyContainer}>
      <Text style={styles.addDependencyTitle}>Adicionar Dependência</Text>
      
      <View style={styles.dependencyTypeSelector}>
        <Text style={styles.selectorLabel}>Tipo de dependência:</Text>
        <View style={styles.typeOptions}>
          {(['requires', 'blocks', 'suggests'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeOption,
                selectedDependencyType === type && styles.typeOptionActive,
              ]}
              onPress={() => setSelectedDependencyType(type)}
            >
              <Ionicons
                name={getDependencyTypeIcon(type)}
                size={16}
                color={selectedDependencyType === type ? '#fff' : getDependencyTypeColor(type)}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  selectedDependencyType === type && styles.typeOptionTextActive,
                ]}
              >
                {getDependencyTypeText(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.availableTasksTitle}>Tarefas disponíveis:</Text>
      
      {availableTasks.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#666" />
          <Text style={styles.noTasksText}>
            Não há tarefas disponíveis para adicionar como dependência.
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableTasks}
          renderItem={renderAvailableTask}
          keyExtractor={(item) => item.id}
          style={styles.availableTasksList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.cancelAddButton}
        onPress={() => setShowAddDependency(false)}
      >
        <Text style={styles.cancelAddButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

  if (!currentTask) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dependências da Tarefa</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{currentTask.title}</Text>
            <View style={styles.taskStatus}>
              <View style={[styles.statusIndicator, { backgroundColor: currentTask.completed ? '#4caf50' : '#ff9800' }]} />
              <Text style={styles.statusText}>
                {currentTask.completed ? 'Concluída' : 'Pendente'}
              </Text>
              {!canComplete && !currentTask.completed && (
                <View style={styles.blockedIndicator}>
                  <Ionicons name="lock-closed" size={12} color="#ff4757" />
                  <Text style={styles.blockedText}>Bloqueada</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dependências ({dependencies.length})</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddDependency(true)}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {dependencies.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="link-outline" size={32} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Nenhuma dependência configurada
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Adicione dependências para organizar o fluxo de trabalho
                </Text>
              </View>
            ) : (
              <FlatList
                data={dependencies}
                renderItem={renderDependency}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>

          {blockedTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tarefas Bloqueadas ({blockedTasks.length})</Text>
              <Text style={styles.sectionSubtitle}>
                Estas tarefas dependem da conclusão desta tarefa
              </Text>
              
              {blockedTasks.map((task) => (
                <View key={task.id} style={styles.blockedTaskCard}>
                  <Text style={styles.blockedTaskTitle}>{task.title}</Text>
                  <View style={styles.blockedTaskStatus}>
                    <View style={[styles.statusIndicator, { backgroundColor: task.completed ? '#4caf50' : '#ff9800' }]} />
                    <Text style={styles.statusText}>
                      {task.completed ? 'Concluída' : 'Pendente'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos de Dependência</Text>
            
            <View style={styles.dependencyTypesInfo}>
              <View style={styles.dependencyTypeInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#ff6b35" />
                <View style={styles.dependencyTypeText}>
                  <Text style={styles.dependencyTypeLabel}>Requer</Text>
                  <Text style={styles.dependencyTypeDescription}>
                    Esta tarefa só pode ser iniciada após a conclusão da dependência
                  </Text>
                </View>
              </View>
              
              <View style={styles.dependencyTypeInfo}>
                <Ionicons name="close-circle" size={16} color="#ff4757" />
                <View style={styles.dependencyTypeText}>
                  <Text style={styles.dependencyTypeLabel}>Bloqueia</Text>
                  <Text style={styles.dependencyTypeDescription}>
                    Esta tarefa impede o início da dependência até ser concluída
                  </Text>
                </View>
              </View>
              
              <View style={styles.dependencyTypeInfo}>
                <Ionicons name="arrow-forward-circle" size={16} color="#2ed573" />
                <View style={styles.dependencyTypeText}>
                  <Text style={styles.dependencyTypeLabel}>Sugere</Text>
                  <Text style={styles.dependencyTypeDescription}>
                    Recomenda a conclusão da dependência antes desta tarefa
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {showAddDependency && renderAddDependencyForm()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  taskInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  blockedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  blockedText: {
    fontSize: 12,
    color: '#ff4757',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  dependencyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dependencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dependencyInfo: {
    flex: 1,
  },
  dependencyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dependencyType: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dependencyTaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  removeDependencyButton: {
    padding: 4,
  },
  dependencyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dependencyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dependencyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  blockedTaskCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  blockedTaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  blockedTaskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dependencyTypesInfo: {
    gap: 12,
  },
  dependencyTypeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dependencyTypeText: {
    flex: 1,
    marginLeft: 8,
  },
  dependencyTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dependencyTypeDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  addDependencyContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  addDependencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dependencyTypeSelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  typeOptionActive: {
    backgroundColor: '#007bff',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  availableTasksTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noTasksText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  availableTasksList: {
    maxHeight: 200,
  },
  availableTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  availableTaskInfo: {
    flex: 1,
  },
  availableTaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  availableTaskStatus: {
    fontSize: 12,
    color: '#666',
  },
  availableTaskActions: {
    padding: 4,
  },
  cancelAddButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelAddButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});