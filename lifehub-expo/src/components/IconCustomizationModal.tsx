import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, IconSet } from '../store/settings';

interface IconCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function IconCustomizationModal({
  visible,
  onClose,
}: IconCustomizationModalProps) {
  const {
    iconSets,
    selectedIconSet,
    setSelectedIconSet,
    activateIconSet,
    addIconSet,
    deleteIconSet,
  } = useSettings();

  const handleIconSetPress = (iconSet: IconSet) => {
    setSelectedIconSet(iconSet);
  };

  const handleActivateIconSet = (iconSetId: string) => {
    activateIconSet(iconSetId);
    Alert.alert('Sucesso', 'Conjunto de ícones ativado com sucesso!');
  };

  const handleDeleteIconSet = (iconSet: IconSet) => {
    Alert.alert(
      'Excluir Conjunto de Ícones',
      `Tem certeza que deseja excluir "${iconSet.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteIconSet(iconSet.id);
            if (selectedIconSet?.id === iconSet.id) {
              setSelectedIconSet(null);
            }
          },
        },
      ]
    );
  };

  const handleCreateCustomIconSet = () => {
    const newIconSet: Omit<IconSet, 'id'> = {
      name: 'Conjunto Personalizado',
      description: 'Ícones personalizados criados por você',
      preview: '🎨',
      isActive: false,
    };
    addIconSet(newIconSet);
    Alert.alert('Sucesso', 'Conjunto de ícones personalizado criado!');
  };

  const renderIconSetCard = (iconSet: IconSet) => (
    <View
      key={iconSet.id}
      style={[
        styles.iconSetCard,
        {
          borderColor: selectedIconSet?.id === iconSet.id ? '#007AFF' : '#E0E0E0',
          borderWidth: selectedIconSet?.id === iconSet.id ? 2 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.iconSetCardContent}
        onPress={() => handleIconSetPress(iconSet)}
      >
        <View style={styles.iconPreview}>
          <Text style={styles.iconPreviewText}>{iconSet.preview}</Text>
        </View>
        <Text style={styles.iconSetName}>{iconSet.name}</Text>
        <Text style={styles.iconSetDescription}>{iconSet.description}</Text>
      </TouchableOpacity>

      <View style={styles.iconSetActions}>
        {iconSet.isActive ? (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.activeText}>Ativo</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.activateButton}
            onPress={() => handleActivateIconSet(iconSet.id)}
          >
            <Text style={styles.activateButtonText}>Ativar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteIconSet(iconSet)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIconPreview = () => {
    if (!selectedIconSet) return null;

    const sampleIcons = [
      { name: 'home', label: 'Início' },
      { name: 'list', label: 'Lista' },
      { name: 'calendar', label: 'Calendário' },
      { name: 'timer', label: 'Timer' },
      { name: 'document-text', label: 'Documento' },
      { name: 'wallet', label: 'Carteira' },
      { name: 'checkmark-circle', label: 'Check' },
      { name: 'sparkles', label: 'Estrela' },
    ];

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Visualização</Text>
        <View style={styles.iconGrid}>
          {sampleIcons.map((icon) => (
            <View key={icon.name} style={styles.iconItem}>
              <View style={styles.iconContainer}>
                <Ionicons name={icon.name as any} size={24} color="#007AFF" />
              </View>
              <Text style={styles.iconLabel}>{icon.label}</Text>
            </View>
          ))}
        </View>
      </View>
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
          <Text style={styles.title}>Personalização de Ícones</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Conjuntos de Ícones</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateCustomIconSet}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.iconSetsGrid}>
              {iconSets.map(renderIconSetCard)}
            </View>
          </View>

          {selectedIconSet && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conjunto Selecionado</Text>
              <View style={styles.selectedIconSetInfo}>
                <Text style={styles.selectedIconSetName}>{selectedIconSet.name}</Text>
                <Text style={styles.selectedIconSetDescription}>
                  {selectedIconSet.description}
                </Text>
              </View>
              {renderIconPreview()}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="eye-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Toque em um conjunto para visualizar os ícones
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="brush-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Crie conjuntos personalizados com seus ícones favoritos
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  O conjunto ativo será aplicado em todo o aplicativo
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  iconSetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconSetCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconSetCardContent: {
    alignItems: 'center',
  },
  iconPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconPreviewText: {
    fontSize: 24,
  },
  iconSetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  iconSetDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  iconSetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
    marginLeft: 4,
  },
  activateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  selectedIconSetInfo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  selectedIconSetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedIconSetDescription: {
    fontSize: 14,
    color: '#666666',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconLabel: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
    flex: 1,
  },
});