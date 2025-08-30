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
import { useEvents, SharedCalendar } from '../store/events';

interface SharedCalendarsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SharedCalendarsModal: React.FC<SharedCalendarsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    sharedCalendars,
    createSharedCalendar,
    updateSharedCalendar,
    deleteSharedCalendar,
    shareCalendarWithUser,
    removeUserFromCalendar,
    getSharedCalendars,
    getCalendarsSharedWithMe,
  } = useEvents();

  const [activeTab, setActiveTab] = useState<'my' | 'shared' | 'create'>('my');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<SharedCalendar | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<SharedCalendar | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
    isPublic: false,
  });

  // Share form state
  const [shareFormData, setShareFormData] = useState({
    userId: '',
    permissions: 'read' as SharedCalendar['permissions'],
  });

  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#6c757d',
  ];

  const myCalendars = getSharedCalendars();
  const sharedWithMe = getCalendarsSharedWithMe();

  const handleCreateCalendar = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do calendário é obrigatório');
      return;
    }

    const newCalendar: Omit<SharedCalendar, 'id' | 'createdAt'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      ownerId: 'current-user',
      sharedWith: [],
      permissions: 'admin',
      color: formData.color,
      isPublic: formData.isPublic,
    };

    createSharedCalendar(newCalendar);
    resetForm();
    setShowCreateForm(false);
    Alert.alert('Sucesso', 'Calendário compartilhado criado com sucesso!');
  };

  const handleUpdateCalendar = () => {
    if (!editingCalendar || !formData.name.trim()) {
      Alert.alert('Erro', 'Nome do calendário é obrigatório');
      return;
    }

    updateSharedCalendar(editingCalendar.id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      isPublic: formData.isPublic,
    });

    resetForm();
    setEditingCalendar(null);
    Alert.alert('Sucesso', 'Calendário atualizado com sucesso!');
  };

  const handleDeleteCalendar = (calendar: SharedCalendar) => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o calendário "${calendar.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteSharedCalendar(calendar.id);
            Alert.alert('Sucesso', 'Calendário excluído com sucesso!');
          },
        },
      ]
    );
  };

  const handleShareCalendar = () => {
    if (!selectedCalendar || !shareFormData.userId.trim()) {
      Alert.alert('Erro', 'ID do usuário é obrigatório');
      return;
    }

    shareCalendarWithUser(selectedCalendar.id, shareFormData.userId.trim(), shareFormData.permissions);
    setShareFormData({ userId: '', permissions: 'read' });
    setSelectedCalendar(null);
    Alert.alert('Sucesso', 'Calendário compartilhado com sucesso!');
  };

  const handleRemoveUser = (calendarId: string, userId: string) => {
    Alert.alert(
      'Confirmar remoção',
      'Tem certeza que deseja remover este usuário do calendário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeUserFromCalendar(calendarId, userId);
            Alert.alert('Sucesso', 'Usuário removido com sucesso!');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#007bff',
      isPublic: false,
    });
  };

  const startEditing = (calendar: SharedCalendar) => {
    setEditingCalendar(calendar);
    setFormData({
      name: calendar.name,
      description: calendar.description,
      color: calendar.color,
      isPublic: calendar.isPublic,
    });
    setShowCreateForm(true);
  };

  const getPermissionText = (permissions: SharedCalendar['permissions']) => {
    switch (permissions) {
      case 'read':
        return 'Leitura';
      case 'write':
        return 'Escrita';
      case 'admin':
        return 'Administrador';
      default:
        return 'Leitura';
    }
  };

  const getPermissionColor = (permissions: SharedCalendar['permissions']) => {
    switch (permissions) {
      case 'read':
        return '#28a745';
      case 'write':
        return '#ffc107';
      case 'admin':
        return '#dc3545';
      default:
        return '#28a745';
    }
  };

  const renderCalendar = ({ item: calendar }: { item: SharedCalendar }) => (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <View style={styles.calendarInfo}>
          <View style={styles.calendarTitleRow}>
            <View style={[styles.colorIndicator, { backgroundColor: calendar.color }]} />
            <Text style={styles.calendarName}>{calendar.name}</Text>
            {calendar.isPublic && (
              <View style={styles.publicBadge}>
                <Ionicons name="globe-outline" size={12} color="#007bff" />
                <Text style={styles.publicText}>Público</Text>
              </View>
            )}
          </View>
          <Text style={styles.calendarDescription}>{calendar.description}</Text>
        </View>
        
        <View style={styles.calendarStats}>
          <Text style={styles.sharedCount}>{calendar.sharedWith.length} compartilhado(s)</Text>
        </View>
      </View>

      <View style={styles.calendarActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            setSelectedCalendar(calendar);
            setActiveTab('create');
          }}
        >
          <Ionicons name="share-outline" size={16} color="#fff" />
          <Text style={styles.shareButtonText}>Compartilhar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => startEditing(calendar)}
        >
          <Ionicons name="create-outline" size={16} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCalendar(calendar)}
        >
          <Ionicons name="trash-outline" size={16} color="#ff4757" />
        </TouchableOpacity>
      </View>

      {calendar.sharedWith.length > 0 && (
        <View style={styles.sharedUsersContainer}>
          <Text style={styles.sharedUsersTitle}>Compartilhado com:</Text>
          {calendar.sharedWith.map((userId, index) => (
            <View key={index} style={styles.sharedUserItem}>
              <View style={styles.userInfo}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.userId}>{userId}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeUserButton}
                onPress={() => handleRemoveUser(calendar.id, userId)}
              >
                <Ionicons name="close-circle-outline" size={16} color="#ff4757" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSharedCalendar = ({ item: calendar }: { item: SharedCalendar }) => (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeader}>
        <View style={styles.calendarInfo}>
          <View style={styles.calendarTitleRow}>
            <View style={[styles.colorIndicator, { backgroundColor: calendar.color }]} />
            <Text style={styles.calendarName}>{calendar.name}</Text>
            <View style={[
              styles.permissionBadge,
              { backgroundColor: getPermissionColor(calendar.permissions) }
            ]}>
              <Text style={styles.permissionText}>
                {getPermissionText(calendar.permissions)}
              </Text>
            </View>
          </View>
          <Text style={styles.calendarDescription}>{calendar.description}</Text>
          <Text style={styles.ownerText}>Proprietário: {calendar.ownerId}</Text>
        </View>
      </View>
    </View>
  );

  const renderCreateForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingCalendar ? 'Editar Calendário' : 'Criar Calendário Compartilhado'}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Nome do calendário"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Descrição do calendário"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cor</Text>
        <View style={styles.colorSelector}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                formData.color === color && styles.colorOptionActive,
              ]}
              onPress={() => setFormData(prev => ({ ...prev, color }))}
            >
              {formData.color === color && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.visibilityToggle}
          onPress={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
        >
          <Ionicons
            name={formData.isPublic ? 'globe-outline' : 'lock-closed-outline'}
            size={20}
            color={formData.isPublic ? '#007bff' : '#666'}
          />
          <Text style={[styles.visibilityText, { color: formData.isPublic ? '#007bff' : '#666' }]}>
            {formData.isPublic ? 'Calendário público' : 'Calendário privado'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            resetForm();
            setShowCreateForm(false);
            setEditingCalendar(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={editingCalendar ? handleUpdateCalendar : handleCreateCalendar}
        >
          <Text style={styles.saveButtonText}>
            {editingCalendar ? 'Atualizar' : 'Criar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderShareForm = () => (
    <View style={styles.shareFormContainer}>
      <Text style={styles.formTitle}>Compartilhar Calendário</Text>
      
      {selectedCalendar && (
        <View style={styles.selectedCalendarInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: selectedCalendar.color }]} />
          <Text style={styles.selectedCalendarName}>{selectedCalendar.name}</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID do Usuário *</Text>
        <TextInput
          style={styles.input}
          value={shareFormData.userId}
          onChangeText={(text) => setShareFormData(prev => ({ ...prev, userId: text }))}
          placeholder="Digite o ID do usuário"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Permissões</Text>
        <View style={styles.permissionsSelector}>
          {(['read', 'write', 'admin'] as const).map((permission) => (
            <TouchableOpacity
              key={permission}
              style={[
                styles.permissionOption,
                shareFormData.permissions === permission && styles.permissionOptionActive,
                { borderColor: getPermissionColor(permission) },
              ]}
              onPress={() => setShareFormData(prev => ({ ...prev, permissions: permission }))}
            >
              <Text
                style={[
                  styles.permissionOptionText,
                  shareFormData.permissions === permission && styles.permissionOptionTextActive,
                  { color: shareFormData.permissions === permission ? '#fff' : getPermissionColor(permission) },
                ]}
              >
                {getPermissionText(permission)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setSelectedCalendar(null);
            setShareFormData({ userId: '', permissions: 'read' });
            setActiveTab('my');
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleShareCalendar}
        >
          <Text style={styles.saveButtonText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (showCreateForm) {
      return renderCreateForm();
    }

    if (activeTab === 'create' && selectedCalendar) {
      return renderShareForm();
    }

    return (
      <>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              Meus Calendários
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shared' && styles.activeTab]}
            onPress={() => setActiveTab('shared')}
          >
            <Text style={[styles.tabText, activeTab === 'shared' && styles.activeTabText]}>
              Compartilhados Comigo
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTab === 'my' ? myCalendars : sharedWithMe}
          renderItem={activeTab === 'my' ? renderCalendar : renderSharedCalendar}
          keyExtractor={(item) => item.id}
          style={styles.calendarsList}
          showsVerticalScrollIndicator={false}
        />

        {activeTab === 'my' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Criar Calendário</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendários Compartilhados</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>
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
  calendarsList: {
    flex: 1,
    padding: 16,
  },
  calendarCard: {
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  publicText: {
    fontSize: 10,
    color: '#007bff',
    fontWeight: '500',
    marginLeft: 2,
  },
  permissionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  permissionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  calendarDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 12,
    color: '#999',
  },
  calendarStats: {
    alignItems: 'flex-end',
  },
  sharedCount: {
    fontSize: 12,
    color: '#666',
  },
  calendarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  shareButtonText: {
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
  sharedUsersContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  sharedUsersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sharedUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userId: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  removeUserButton: {
    padding: 4,
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
  shareFormContainer: {
    flex: 1,
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  selectedCalendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedCalendarName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
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
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionActive: {
    borderWidth: 2,
    borderColor: '#333',
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
  permissionsSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  permissionOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  permissionOptionActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  permissionOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  permissionOptionTextActive: {
    color: '#fff',
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