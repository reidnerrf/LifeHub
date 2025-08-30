import React, { useState } from 'react';
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
import { useSettings, ThemeConfig } from '../store/settings';

interface ThemeCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeCustomizationModal({
  visible,
  onClose,
}: ThemeCustomizationModalProps) {
  const {
    themes,
    selectedTheme,
    setSelectedTheme,
    activateTheme,
    addTheme,
    deleteTheme,
    setShowThemeModal,
  } = useSettings();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);

  const handleThemePress = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
  };

  const handleActivateTheme = (themeId: string) => {
    activateTheme(themeId);
    Alert.alert('Sucesso', 'Tema ativado com sucesso!');
  };

  const handleDeleteTheme = (theme: ThemeConfig) => {
    if (theme.isCustom) {
      Alert.alert(
        'Excluir Tema',
        `Tem certeza que deseja excluir o tema "${theme.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deleteTheme(theme.id);
              if (selectedTheme?.id === theme.id) {
                setSelectedTheme(null);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Erro', 'Não é possível excluir temas padrão.');
    }
  };

  const handleCreateCustomTheme = () => {
    const newTheme: Omit<ThemeConfig, 'id'> = {
      name: 'Tema Personalizado',
      primaryColor: '#007AFF',
      secondaryColor: '#5856D6',
      accentColor: '#34C759',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isCustom: true,
      isActive: false,
    };
    addTheme(newTheme);
    Alert.alert('Sucesso', 'Tema personalizado criado!');
  };

  const renderThemeCard = (theme: ThemeConfig) => (
    <View
      key={theme.id}
      style={[
        styles.themeCard,
        {
          backgroundColor: theme.backgroundColor,
          borderColor: selectedTheme?.id === theme.id ? theme.primaryColor : '#E0E0E0',
          borderWidth: selectedTheme?.id === theme.id ? 2 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.themeCardContent}
        onPress={() => handleThemePress(theme)}
      >
        <View style={styles.themePreview}>
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: theme.primaryColor },
            ]}
          />
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: theme.secondaryColor },
            ]}
          />
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: theme.accentColor },
            ]}
          />
        </View>
        <Text
          style={[
            styles.themeName,
            { color: theme.textColor },
          ]}
        >
          {theme.name}
        </Text>
        <Text
          style={[
            styles.themeType,
            { color: theme.textColor, opacity: 0.7 },
          ]}
        >
          {theme.isCustom ? 'Personalizado' : 'Padrão'}
        </Text>
      </TouchableOpacity>

      <View style={styles.themeActions}>
        {theme.isActive ? (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.activeText}>Ativo</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.activateButton}
            onPress={() => handleActivateTheme(theme.id)}
          >
            <Text style={styles.activateButtonText}>Ativar</Text>
          </TouchableOpacity>
        )}

        {theme.isCustom && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTheme(theme)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderColorPicker = () => {
    if (!selectedTheme) return null;

    return (
      <View style={styles.colorPickerContainer}>
        <Text style={styles.colorPickerTitle}>Cores do Tema</Text>
        <View style={styles.colorGrid}>
          <View style={styles.colorItem}>
            <Text style={styles.colorLabel}>Primária</Text>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: selectedTheme.primaryColor },
              ]}
            />
          </View>
          <View style={styles.colorItem}>
            <Text style={styles.colorLabel}>Secundária</Text>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: selectedTheme.secondaryColor },
              ]}
            />
          </View>
          <View style={styles.colorItem}>
            <Text style={styles.colorLabel}>Destaque</Text>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: selectedTheme.accentColor },
              ]}
            />
          </View>
          <View style={styles.colorItem}>
            <Text style={styles.colorLabel}>Fundo</Text>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: selectedTheme.backgroundColor },
              ]}
            />
          </View>
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
          <Text style={styles.title}>Personalização de Temas</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Temas Disponíveis</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateCustomTheme}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.themesGrid}>
              {themes.map(renderThemeCard)}
            </View>
          </View>

          {selectedTheme && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tema Selecionado</Text>
              <View style={styles.selectedThemeInfo}>
                <Text style={styles.selectedThemeName}>{selectedTheme.name}</Text>
                <Text style={styles.selectedThemeDescription}>
                  {selectedTheme.isCustom ? 'Tema personalizado' : 'Tema padrão do sistema'}
                </Text>
              </View>
              {renderColorPicker()}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Toque em um tema para visualizar suas cores
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="color-palette-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Crie temas personalizados com suas cores favoritas
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  O tema ativo será aplicado em todo o aplicativo
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
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeCardContent: {
    alignItems: 'center',
  },
  themePreview: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  themeType: {
    fontSize: 12,
    textAlign: 'center',
  },
  themeActions: {
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
  selectedThemeInfo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  selectedThemeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedThemeDescription: {
    fontSize: 14,
    color: '#666666',
  },
  colorPickerContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  colorPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  colorLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
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