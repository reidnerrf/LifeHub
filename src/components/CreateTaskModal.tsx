import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks, Task } from '../store/tasks';

const { width } = Dimensions.get('window');

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: Partial<Task>;
}

export default function CreateTaskModal({ visible, onClose, initialData }: CreateTaskModalProps) {
  const t = useTheme();
  const { addTask, estimateTaskDuration } = useTasks();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const priorities: { value: Task['priority']; label: string; icon: string; color: string }[] = [
    { value: 'urgent', label: 'Urgente', icon: 'flash', color: '#FF3B30' },
    { value: 'high', label: 'Alta', icon: 'arrow-up', color: '#FF9500' },
    { value: 'medium', label: 'Média', icon: 'remove', color: '#007AFF' },
    { value: 'low', label: 'Baixa', icon: 'arrow-down', color: '#34C759' },
  ];

  const commonTags = ['trabalho', 'pessoal', 'estudo', 'saúde', 'financeiro', 'casa', 'projeto'];

  useEffect(() => {
    if (visible && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
      setTags(initialData.tags || []);
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate) : undefined);
      setEstimatedDuration(initialData.estimatedDuration || 30);
      setSubtasks(initialData.subtasks?.map(st => ({ title: st.title, completed: st.completed })) || []);
    } else if (!visible) {
      resetForm();
    }
  }, [visible, initialData]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTags([]);
    setNewTag('');
    setDueDate(undefined);
    setEstimatedDuration(30);
    setSubtasks([]);
    setNewSubtask('');
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const setQuickDueDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDueDate(date);
  };

  const calculateEstimatedDuration = () => {
    const mockTask: Task = {
      id: '',
      title,
      description,
      completed: false,
      priority,
      tags,
      subtasks: subtasks.map(st => ({ id: '', title: st.title, completed: st.completed, createdAt: new Date() })),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const estimated = estimateTaskDuration(mockTask);
    setEstimatedDuration(estimated);
  };

  const handleCreateTask = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título da tarefa é obrigatório');
      return;
    }

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      priority,
      tags,
      subtasks: subtasks.map(st => ({ title: st.title, completed: st.completed })),
      dueDate,
      estimatedDuration,
      status: 'pending' as Task['status'],
    };

    addTask(newTask);
    onClose();
    resetForm();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </Text>
          <TouchableOpacity onPress={handleCreateTask} style={[styles.saveButton, { backgroundColor: t.primary }]}>
            <Text style={[styles.saveButtonText, { color: '#fff' }]}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Título */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Título *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título da tarefa..."
              placeholderTextColor={t.textLight}
              style={[styles.titleInput, { color: t.text, backgroundColor: t.card }]}
              multiline
            />
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Adicione uma descrição..."
              placeholderTextColor={t.textLight}
              style={[styles.descriptionInput, { color: t.text, backgroundColor: t.card }]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Prioridade */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Prioridade</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setPriority(p.value)}
                  style={[
                    styles.priorityOption,
                    { backgroundColor: t.card },
                    priority === p.value && { backgroundColor: p.color + '20' }
                  ]}
                >
                  <Ionicons name={p.icon} size={20} color={p.color} />
                  <Text style={[
                    styles.priorityText,
                    { color: t.text },
                    priority === p.value && { color: p.color, fontWeight: '600' }
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Tags</Text>
            
            {/* Tags comuns */}
            <View style={styles.commonTags}>
              {commonTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => {
                    if (!tags.includes(tag)) {
                      setTags([...tags, tag]);
                    }
                  }}
                  style={[
                    styles.commonTag,
                    { backgroundColor: t.card },
                    tags.includes(tag) && { backgroundColor: t.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.commonTagText,
                    { color: t.text },
                    tags.includes(tag) && { color: t.primary }
                  ]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Adicionar nova tag */}
            <View style={styles.addTagContainer}>
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Adicionar tag..."
                placeholderTextColor={t.textLight}
                style={[styles.tagInput, { color: t.text, backgroundColor: t.card }]}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity onPress={addTag} style={[styles.addTagButton, { backgroundColor: t.primary }]}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Tags selecionadas */}
            {tags.length > 0 && (
              <View style={styles.selectedTags}>
                {tags.map((tag) => (
                  <View key={tag} style={[styles.selectedTag, { backgroundColor: t.primary + '20' }]}>
                    <Text style={[styles.selectedTagText, { color: t.primary }]}>#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={16} color={t.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Data de vencimento */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Data de Vencimento</Text>
            
            {/* Opções rápidas */}
            <View style={styles.quickDates}>
              <TouchableOpacity
                onPress={() => setQuickDueDate(0)}
                style={[styles.quickDate, { backgroundColor: t.card }]}
              >
                <Text style={[styles.quickDateText, { color: t.text }]}>Hoje</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setQuickDueDate(1)}
                style={[styles.quickDate, { backgroundColor: t.card }]}
              >
                <Text style={[styles.quickDateText, { color: t.text }]}>Amanhã</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setQuickDueDate(7)}
                style={[styles.quickDate, { backgroundColor: t.card }]}
              >
                <Text style={[styles.quickDateText, { color: t.text }]}>Próxima semana</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDueDate(undefined)}
                style={[styles.quickDate, { backgroundColor: t.error + '20' }]}
              >
                <Text style={[styles.quickDateText, { color: t.error }]}>Sem data</Text>
              </TouchableOpacity>
            </View>

            {dueDate && (
              <View style={[styles.selectedDate, { backgroundColor: t.primary + '20' }]}>
                <Ionicons name="calendar" size={16} color={t.primary} />
                <Text style={[styles.selectedDateText, { color: t.primary }]}>
                  {dueDate.toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>

          {/* Duração estimada */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Duração Estimada</Text>
            
            <View style={styles.durationContainer}>
              <TouchableOpacity
                onPress={calculateEstimatedDuration}
                style={[styles.autoEstimateButton, { backgroundColor: t.secondary }]}
              >
                <Ionicons name="calculator" size={16} color="#fff" />
                <Text style={[styles.autoEstimateText, { color: '#fff' }]}>Auto-estimar</Text>
              </TouchableOpacity>
              
              <View style={styles.durationInputContainer}>
                <TextInput
                  value={estimatedDuration.toString()}
                  onChangeText={(text) => setEstimatedDuration(parseInt(text) || 0)}
                  keyboardType="numeric"
                  style={[styles.durationInput, { color: t.text, backgroundColor: t.card }]}
                />
                <Text style={[styles.durationUnit, { color: t.textLight }]}>minutos</Text>
              </View>
            </View>
          </View>

          {/* Subtarefas */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Subtarefas</Text>
            
            {/* Adicionar subtarefa */}
            <View style={styles.addSubtaskContainer}>
              <TextInput
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Adicionar subtarefa..."
                placeholderTextColor={t.textLight}
                style={[styles.subtaskInput, { color: t.text, backgroundColor: t.card }]}
                onSubmitEditing={addSubtask}
              />
              <TouchableOpacity onPress={addSubtask} style={[styles.addSubtaskButton, { backgroundColor: t.primary }]}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Lista de subtarefas */}
            {subtasks.length > 0 && (
              <View style={styles.subtasksList}>
                {subtasks.map((subtask, index) => (
                  <View key={index} style={[styles.subtaskItem, { backgroundColor: t.card }]}>
                    <Text style={[styles.subtaskText, { color: t.text }]}>{subtask.title}</Text>
                    <TouchableOpacity onPress={() => removeSubtask(index)}>
                      <Ionicons name="close" size={16} color={t.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '500',
    padding: 12,
    borderRadius: 8,
    minHeight: 50,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  commonTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  commonTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  commonTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickDate: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDate: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  autoEstimateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  autoEstimateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationInput: {
    width: 80,
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  durationUnit: {
    fontSize: 14,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subtaskInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  addSubtaskButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtasksList: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  subtaskText: {
    fontSize: 14,
    flex: 1,
  },
});