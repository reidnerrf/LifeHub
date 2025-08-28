import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, TaskTemplate } from '../store/tasks';

interface TaskTemplatesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: TaskTemplate) => void;
}

export const TaskTemplatesModal: React.FC<TaskTemplatesModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    getPopularTemplates,
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'all' | 'categories' | 'popular' | 'create'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    estimatedDuration: '',
    priority: 'medium' as TaskTemplate['priority'],
    tags: '',
    subtasks: [] as { title: string; completed: boolean }[],
    isPublic: true,
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do template é obrigatório');
      return;
    }

    const newTemplate: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim() || 'Geral',
      estimatedDuration: parseInt(formData.estimatedDuration) || 30,
      priority: formData.priority,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      subtasks: formData.subtasks,
      isPublic: formData.isPublic,
      createdBy: 'user', // Em um sistema real seria o ID do usuário
    };

    addTemplate(newTemplate);
    resetForm();
    setShowCreateForm(false);
    Alert.alert('Sucesso', 'Template criado com sucesso!');
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !formData.name.trim()) {
      Alert.alert('Erro', 'Nome do template é obrigatório');
      return;
    }

    updateTemplate(editingTemplate.id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim() || 'Geral',
      estimatedDuration: parseInt(formData.estimatedDuration) || 30,
      priority: formData.priority,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      subtasks: formData.subtasks,
      isPublic: formData.isPublic,
    });

    resetForm();
    setEditingTemplate(null);
    Alert.alert('Sucesso', 'Template atualizado com sucesso!');
  };

  const handleDeleteTemplate = (template: TaskTemplate) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o template "${template.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteTemplate(template.id);
            Alert.alert('Sucesso', 'Template excluído com sucesso!');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      estimatedDuration: '',
      priority: 'medium',
      tags: '',
      subtasks: [],
      isPublic: true,
    });
  };

  const startEditing = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      estimatedDuration: template.estimatedDuration.toString(),
      priority: template.priority,
      tags: template.tags.join(', '),
      subtasks: template.subtasks,
      isPublic: template.isPublic,
    });
    setShowCreateForm(true);
  };

  const addSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: '', completed: false }],
    }));
  };

  const updateSubtask = (index: number, title: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) =>
        i === index ? { ...subtask, title } : subtask
      ),
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const getDisplayTemplates = () => {
    switch (activeTab) {
      case 'categories':
        return selectedCategory ? getTemplatesByCategory(selectedCategory) : [];
      case 'popular':
        return getPopularTemplates(10);
      default:
        return templates;
    }
  };

  const renderTemplate = ({ item: template }: { item: TaskTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateCategory}>{template.category}</Text>
          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>
        </View>
        <View style={styles.templateStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.statText}>{template.estimatedDuration}min</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={14} color="#666" />
            <Text style={styles.statText}>{template.usageCount} usos</Text>
          </View>
        </View>
      </View>

      <View style={styles.templateTags}>
        {template.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {template.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{template.tags.length - 3}</Text>
        )}
      </View>

      {template.subtasks.length > 0 && (
        <View style={styles.subtasksPreview}>
          <Text style={styles.subtasksTitle}>Subtarefas:</Text>
          {template.subtasks.slice(0, 3).map((subtask, index) => (
            <Text key={index} style={styles.subtaskText}>
              • {subtask.title}
            </Text>
          ))}
          {template.subtasks.length > 3 && (
            <Text style={styles.moreSubtasksText}>
              +{template.subtasks.length - 3} mais
            </Text>
          )}
        </View>
      )}

      <View style={styles.templateActions}>
        {onSelectTemplate && (
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => {
              onSelectTemplate(template);
              onClose();
            }}
          >
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={styles.useButtonText}>Usar Template</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => startEditing(template)}
        >
          <Ionicons name="create-outline" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTemplate(template)}
        >
          <Ionicons name="trash-outline" size={16} color="#ff4757" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCreateForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Nome do template"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Descrição do template"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoria</Text>
        <TextInput
          style={styles.input}
          value={formData.category}
          onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
          placeholder="Categoria (ex: Reuniões, Desenvolvimento)"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Duração Estimada (min)</Text>
          <TextInput
            style={styles.input}
            value={formData.estimatedDuration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedDuration: text }))}
            placeholder="30"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.prioritySelector}>
            {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityOption,
                  formData.priority === priority && styles.priorityOptionActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, priority }))}
              >
                <Text
                  style={[
                    styles.priorityText,
                    formData.priority === priority && styles.priorityTextActive,
                  ]}
                >
                  {priority === 'low' && 'Baixa'}
                  {priority === 'medium' && 'Média'}
                  {priority === 'high' && 'Alta'}
                  {priority === 'urgent' && 'Urgente'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tags (separadas por vírgula)</Text>
        <TextInput
          style={styles.input}
          value={formData.tags}
          onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
          placeholder="reunião, planejamento, semanal"
        />
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.subtasksHeader}>
          <Text style={styles.label}>Subtarefas</Text>
          <TouchableOpacity style={styles.addSubtaskButton} onPress={addSubtask}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addSubtaskText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
        
        {formData.subtasks.map((subtask, index) => (
          <View key={index} style={styles.subtaskInput}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={subtask.title}
              onChangeText={(text) => updateSubtask(index, text)}
              placeholder={`Subtarefa ${index + 1}`}
            />
            <TouchableOpacity
              style={styles.removeSubtaskButton}
              onPress={() => removeSubtask(index)}
            >
              <Ionicons name="close" size={16} color="#ff4757" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.visibilityToggle}
          onPress={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
        >
          <Ionicons
            name={formData.isPublic ? 'globe-outline' : 'lock-closed-outline'}
            size={16}
            color="#666"
          />
          <Text style={styles.visibilityText}>
            {formData.isPublic ? 'Template público' : 'Template privado'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            resetForm();
            setShowCreateForm(false);
            setEditingTemplate(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        >
          <Text style={styles.saveButtonText}>
            {editingTemplate ? 'Atualizar' : 'Criar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Templates de Tarefas</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {!showCreateForm ? (
          <>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                  Todos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
                onPress={() => setActiveTab('categories')}
              >
                <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
                  Categorias
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'popular' && styles.activeTab]}
                onPress={() => setActiveTab('popular')}
              >
                <Text style={[styles.tabText, activeTab === 'popular' && styles.activeTabText]}>
                  Populares
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'categories' && (
              <ScrollView horizontal style={styles.categoryFilter} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <FlatList
              data={getDisplayTemplates()}
              renderItem={renderTemplate}
              keyExtractor={(item) => item.id}
              style={styles.templatesList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Criar Template</Text>
            </TouchableOpacity>
          </>
        ) : (
          renderCreateForm()
        )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  categoryFilter: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007bff',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  templatesList: {
    flex: 1,
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  templateStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  templateTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#666',
  },
  subtasksPreview: {
    marginBottom: 12,
  },
  subtasksTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  subtaskText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  moreSubtasksText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 4,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  priorityOptionActive: {
    backgroundColor: '#007bff',
  },
  priorityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priorityTextActive: {
    color: '#fff',
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  addSubtaskText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  subtaskInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeSubtaskButton: {
    padding: 8,
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  visibilityText: {
    fontSize: 14,
    color: '#666',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});