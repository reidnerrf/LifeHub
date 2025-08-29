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
import { useEvents, EventTemplate } from '../store/events';

interface EventTemplatesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: EventTemplate) => void;
}

export const EventTemplatesModal: React.FC<EventTemplatesModalProps> = ({
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
  } = useEvents();

  const [activeTab, setActiveTab] = useState<'all' | 'categories' | 'popular' | 'create'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: '',
    type: 'event' as EventTemplate['type'],
    priority: 'medium' as EventTemplate['priority'],
    tags: '',
    location: '',
    isRecurring: false,
    recurrenceType: 'weekly' as EventTemplate['recurrence']['type'],
    recurrenceInterval: '1',
    isPublic: true,
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do template é obrigatório');
      return;
    }

    const newTemplate: Omit<EventTemplate, 'id' | 'createdAt' | 'usageCount'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category.trim() || 'Geral',
      duration: parseInt(formData.duration) || 60,
      type: formData.type,
      priority: formData.priority,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      location: formData.location.trim() || undefined,
      isRecurring: formData.isRecurring,
      recurrence: formData.isRecurring ? {
        type: formData.recurrenceType,
        interval: parseInt(formData.recurrenceInterval),
      } : undefined,
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
      duration: parseInt(formData.duration) || 60,
      type: formData.type,
      priority: formData.priority,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      location: formData.location.trim() || undefined,
      isRecurring: formData.isRecurring,
      recurrence: formData.isRecurring ? {
        type: formData.recurrenceType,
        interval: parseInt(formData.recurrenceInterval),
      } : undefined,
      isPublic: formData.isPublic,
    });

    resetForm();
    setEditingTemplate(null);
    Alert.alert('Sucesso', 'Template atualizado com sucesso!');
  };

  const handleDeleteTemplate = (template: EventTemplate) => {
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
      duration: '',
      type: 'event',
      priority: 'medium',
      tags: '',
      location: '',
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceInterval: '1',
      isPublic: true,
    });
  };

  const startEditing = (template: EventTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      duration: template.duration.toString(),
      type: template.type,
      priority: template.priority,
      tags: template.tags.join(', '),
      location: template.location || '',
      isRecurring: template.isRecurring,
      recurrenceType: template.recurrence?.type || 'weekly',
      recurrenceInterval: template.recurrence?.interval.toString() || '1',
      isPublic: template.isPublic,
    });
    setShowCreateForm(true);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getTypeIcon = (type: EventTemplate['type']) => {
    switch (type) {
      case 'event':
        return 'calendar-outline';
      case 'task':
        return 'checkbox-outline';
      case 'meeting':
        return 'people-outline';
      case 'reminder':
        return 'notifications-outline';
      default:
        return 'calendar-outline';
    }
  };

  const getPriorityColor = (priority: EventTemplate['priority']) => {
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

  const renderTemplate = ({ item: template }: { item: EventTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <View style={styles.templateTitleRow}>
            <Ionicons name={getTypeIcon(template.type)} size={20} color="#007bff" />
            <Text style={styles.templateName}>{template.name}</Text>
          </View>
          <Text style={styles.templateCategory}>{template.category}</Text>
          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>
        </View>
        
        <View style={styles.templateStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.statText}>{formatDuration(template.duration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={14} color="#666" />
            <Text style={styles.statText}>{template.usageCount} usos</Text>
          </View>
        </View>
      </View>

      <View style={styles.templateDetails}>
        <View style={styles.detailRow}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(template.priority) }]}>
            <Text style={styles.priorityText}>
              {template.priority === 'urgent' ? 'Urgente' :
               template.priority === 'high' ? 'Alta' :
               template.priority === 'medium' ? 'Média' : 'Baixa'}
            </Text>
          </View>
          
          {template.isRecurring && (
            <View style={styles.recurringBadge}>
              <Ionicons name="repeat" size={12} color="#007bff" />
              <Text style={styles.recurringText}>
                {template.recurrence?.type === 'daily' ? 'Diário' :
                 template.recurrence?.type === 'weekly' ? 'Semanal' :
                 template.recurrence?.type === 'monthly' ? 'Mensal' : 'Anual'}
              </Text>
            </View>
          )}
        </View>

        {template.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{template.location}</Text>
          </View>
        )}

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
      </View>

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
          placeholder="Categoria (ex: Reuniões, Saúde, Fitness)"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Duração (min)</Text>
          <TextInput
            style={styles.input}
            value={formData.duration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
            placeholder="60"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.typeSelector}>
            {(['event', 'task', 'meeting', 'reminder'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  formData.type === type && styles.typeOptionActive,
                ]}
                onPress={() => setFormData(prev => ({ ...prev, type }))}
              >
                <Ionicons
                  name={getTypeIcon(type)}
                  size={16}
                  color={formData.type === type ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    formData.type === type && styles.typeOptionTextActive,
                  ]}
                >
                  {type === 'event' ? 'Evento' :
                   type === 'task' ? 'Tarefa' :
                   type === 'meeting' ? 'Reunião' : 'Lembrete'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.prioritySelector}>
          {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityOption,
                formData.priority === priority && styles.priorityOptionActive,
                { borderColor: getPriorityColor(priority) },
              ]}
              onPress={() => setFormData(prev => ({ ...prev, priority }))}
            >
              <Text
                style={[
                  styles.priorityOptionText,
                  formData.priority === priority && styles.priorityOptionTextActive,
                  { color: formData.priority === priority ? '#fff' : getPriorityColor(priority) },
                ]}
              >
                {priority === 'low' ? 'Baixa' :
                 priority === 'medium' ? 'Média' :
                 priority === 'high' ? 'Alta' : 'Urgente'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Local (opcional)</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
          placeholder="Local do evento"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tags (separadas por vírgula)</Text>
        <TextInput
          style={styles.input}
          value={formData.tags}
          onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
          placeholder="reunião, equipe, semanal"
        />
      </View>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.recurringToggle}
          onPress={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
        >
          <Ionicons
            name={formData.isRecurring ? 'repeat' : 'repeat-outline'}
            size={20}
            color={formData.isRecurring ? '#007bff' : '#666'}
          />
          <Text style={[styles.recurringText, { color: formData.isRecurring ? '#007bff' : '#666' }]}>
            Evento recorrente
          </Text>
        </TouchableOpacity>
      </View>

      {formData.isRecurring && (
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Tipo de recorrência</Text>
            <View style={styles.recurrenceTypeSelector}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.recurrenceTypeOption,
                    formData.recurrenceType === type && styles.recurrenceTypeOptionActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, recurrenceType: type }))}
                >
                  <Text
                    style={[
                      styles.recurrenceTypeText,
                      formData.recurrenceType === type && styles.recurrenceTypeTextActive,
                    ]}
                  >
                    {type === 'daily' ? 'Diário' :
                     type === 'weekly' ? 'Semanal' :
                     type === 'monthly' ? 'Mensal' : 'Anual'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Intervalo</Text>
            <TextInput
              style={styles.input}
              value={formData.recurrenceInterval}
              onChangeText={(text) => setFormData(prev => ({ ...prev, recurrenceInterval: text }))}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

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
          <Text style={styles.headerTitle}>Templates de Eventos</Text>
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
  templateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  templateDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurringText: {
    fontSize: 11,
    color: '#007bff',
    fontWeight: '500',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  templateTags: {
    flexDirection: 'row',
    alignItems: 'center',
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
  typeSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  typeOptionActive: {
    backgroundColor: '#007bff',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: '#fff',
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
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityOptionActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityOptionTextActive: {
    color: '#fff',
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  recurrenceTypeSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  recurrenceTypeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  recurrenceTypeOptionActive: {
    backgroundColor: '#007bff',
  },
  recurrenceTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  recurrenceTypeTextActive: {
    color: '#fff',
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