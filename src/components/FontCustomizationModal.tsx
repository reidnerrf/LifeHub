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
import { useSettings, FontConfig } from '../store/settings';

interface FontCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FontCustomizationModal({
  visible,
  onClose,
}: FontCustomizationModalProps) {
  const {
    fonts,
    selectedFont,
    setSelectedFont,
    activateFont,
    addFont,
    deleteFont,
  } = useSettings();

  const handleFontPress = (font: FontConfig) => {
    setSelectedFont(font);
  };

  const handleActivateFont = (fontId: string) => {
    activateFont(fontId);
    Alert.alert('Sucesso', 'Fonte ativada com sucesso!');
  };

  const handleDeleteFont = (font: FontConfig) => {
    Alert.alert(
      'Excluir Fonte',
      `Tem certeza que deseja excluir "${font.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteFont(font.id);
            if (selectedFont?.id === font.id) {
              setSelectedFont(null);
            }
          },
        },
      ]
    );
  };

  const handleCreateCustomFont = () => {
    const newFont: Omit<FontConfig, 'id'> = {
      name: 'Fonte Personalizada',
      family: 'CustomFont',
      weight: 'normal',
      size: 16,
      isActive: false,
    };
    addFont(newFont);
    Alert.alert('Sucesso', 'Fonte personalizada criada!');
  };

  const renderFontCard = (font: FontConfig) => (
    <View
      key={font.id}
      style={[
        styles.fontCard,
        {
          borderColor: selectedFont?.id === font.id ? '#007AFF' : '#E0E0E0',
          borderWidth: selectedFont?.id === font.id ? 2 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fontCardContent}
        onPress={() => handleFontPress(font)}
      >
        <Text
          style={[
            styles.fontPreview,
            {
              fontFamily: font.family,
              fontWeight: font.weight,
              fontSize: font.size,
            },
          ]}
        >
          AaBbCcDd
        </Text>
        <Text style={styles.fontName}>{font.name}</Text>
        <Text style={styles.fontDetails}>
          {font.family} • {font.weight} • {font.size}px
        </Text>
      </TouchableOpacity>

      <View style={styles.fontActions}>
        {font.isActive ? (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.activeText}>Ativa</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.activateButton}
            onPress={() => handleActivateFont(font.id)}
          >
            <Text style={styles.activateButtonText}>Ativar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFont(font)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFontPreview = () => {
    if (!selectedFont) return null;

    const sampleTexts = [
      {
        title: 'Título Principal',
        text: 'Este é um exemplo de título principal',
        size: selectedFont.size + 8,
      },
      {
        title: 'Subtítulo',
        text: 'Este é um exemplo de subtítulo',
        size: selectedFont.size + 4,
      },
      {
        title: 'Texto Normal',
        text: 'Este é um exemplo de texto normal do aplicativo',
        size: selectedFont.size,
      },
      {
        title: 'Texto Pequeno',
        text: 'Este é um exemplo de texto pequeno',
        size: selectedFont.size - 2,
      },
    ];

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Visualização</Text>
        <View style={styles.textPreviewContainer}>
          {sampleTexts.map((sample, index) => (
            <View key={index} style={styles.textSample}>
              <Text style={styles.sampleTitle}>{sample.title}</Text>
              <Text
                style={[
                  styles.sampleText,
                  {
                    fontFamily: selectedFont.family,
                    fontWeight: selectedFont.weight,
                    fontSize: sample.size,
                  },
                ]}
              >
                {sample.text}
              </Text>
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
          <Text style={styles.title}>Personalização de Fontes</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fontes Disponíveis</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateCustomFont}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.fontsGrid}>
              {fonts.map(renderFontCard)}
            </View>
          </View>

          {selectedFont && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fonte Selecionada</Text>
              <View style={styles.selectedFontInfo}>
                <Text style={styles.selectedFontName}>{selectedFont.name}</Text>
                <Text style={styles.selectedFontDetails}>
                  {selectedFont.family} • {selectedFont.weight} • {selectedFont.size}px
                </Text>
              </View>
              {renderFontPreview()}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="text-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Toque em uma fonte para visualizar como ficará
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="options-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Ajuste o tamanho e peso da fonte conforme sua preferência
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  A fonte ativa será aplicada em todo o aplicativo
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
  fontsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fontCard: {
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
  fontCardContent: {
    alignItems: 'center',
  },
  fontPreview: {
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  fontName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  fontDetails: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  fontActions: {
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
  selectedFontInfo: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  selectedFontName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  selectedFontDetails: {
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
  textPreviewContainer: {
    gap: 15,
  },
  textSample: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sampleTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  sampleText: {
    color: '#000000',
    lineHeight: 20,
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