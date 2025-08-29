import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useNotes, Note } from '../store/notes';

interface AISummaryProps {
  visible: boolean;
  onClose: () => void;
  note?: Note;
}

export default function AISummary({ visible, onClose, note }: AISummaryProps) {
  const t = useTheme();
  const { generateAISummary, updateAISummary } = useNotes();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(note?.aiSummary || '');

  const handleGenerateSummary = async () => {
    if (!note) return;
    
    try {
      setIsGenerating(true);
      const aiSummary = await generateAISummary(note.id);
      setSummary(aiSummary);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gerar resumo IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSummary = () => {
    if (!note) return;
    updateAISummary(note.id, summary);
    onClose();
  };

  const getSummaryQuality = (content: string) => {
    const wordCount = content.split(' ').length;
    if (wordCount < 10) return { quality: 'Baixa', color: t.error };
    if (wordCount < 30) return { quality: 'Média', color: t.warning };
    return { quality: 'Alta', color: t.success };
  };

  const getContentType = (content: string) => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('reunião') || lowerContent.includes('meeting')) {
      return { type: 'Reunião', icon: 'people', color: t.primary };
    }
    if (lowerContent.includes('receita') || lowerContent.includes('ingrediente')) {
      return { type: 'Receita', icon: 'restaurant', color: t.warning };
    }
    if (lowerContent.includes('ideia') || lowerContent.includes('projeto')) {
      return { type: 'Ideia', icon: 'bulb', color: t.success };
    }
    if (lowerContent.includes('tarefa') || lowerContent.includes('todo')) {
      return { type: 'Tarefa', icon: 'checkmark-circle', color: t.primary };
    }
    
    return { type: 'Nota', icon: 'document-text', color: t.textLight };
  };

  const contentType = note ? getContentType(note.content) : null;
  const summaryQuality = summary ? getSummaryQuality(summary) : null;

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
            Resumo IA
          </Text>
          <TouchableOpacity onPress={handleSaveSummary} style={styles.saveButton}>
            <Ionicons name="checkmark" size={24} color={t.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {note && (
            <>
              {/* Informações da Nota */}
              <View style={[styles.noteInfo, { backgroundColor: t.card }]}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteIcon}>
                    <Ionicons name={contentType?.icon} size={20} color={contentType?.color} />
                  </View>
                  <View style={styles.noteDetails}>
                    <Text style={[styles.noteTitle, { color: t.text }]}>
                      {note.title}
                    </Text>
                    <Text style={[styles.noteType, { color: t.textLight }]}>
                      {contentType?.type} • {note.notebook}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.noteContent, { color: t.textLight }]} numberOfLines={4}>
                  {note.content}
                </Text>

                {note.tags.length > 0 && (
                  <View style={styles.noteTags}>
                    {note.tags.map((tag, index) => (
                      <View key={index} style={[styles.tagBadge, { backgroundColor: t.background }]}>
                        <Text style={[styles.tagText, { color: t.textLight }]}>
                          #{tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Ações */}
              <View style={[styles.actionsCard, { backgroundColor: t.card }]}>
                <TouchableOpacity
                  onPress={handleGenerateSummary}
                  disabled={isGenerating}
                  style={[styles.generateButton, { backgroundColor: t.primary }]}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="sparkles" size={20} color="#fff" />
                  )}
                  <Text style={[styles.generateButtonText, { color: '#fff' }]}>
                    {isGenerating ? 'Gerando...' : 'Gerar Resumo IA'}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.generateDescription, { color: t.textLight }]}>
                  A IA analisará o conteúdo da nota e gerará um resumo inteligente
                </Text>
              </View>

              {/* Resumo Atual */}
              {summary && (
                <View style={[styles.summaryCard, { backgroundColor: t.card }]}>
                  <View style={styles.summaryHeader}>
                    <View style={styles.summaryIcon}>
                      <Ionicons name="sparkles" size={16} color={t.primary} />
                    </View>
                    <Text style={[styles.summaryTitle, { color: t.text }]}>
                      Resumo IA
                    </Text>
                    {summaryQuality && (
                      <View style={[styles.qualityBadge, { backgroundColor: summaryQuality.color + '20' }]}>
                        <Text style={[styles.qualityText, { color: summaryQuality.color }]}>
                          {summaryQuality.quality}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.summaryText, { color: t.text }]}>
                    {summary}
                  </Text>

                  <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="text" size={14} color={t.textLight} />
                      <Text style={[styles.statText, { color: t.textLight }]}>
                        {summary.split(' ').length} palavras
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={14} color={t.textLight} />
                      <Text style={[styles.statText, { color: t.textLight }]}>
                        {Math.ceil(summary.length / 200)} min de leitura
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Recursos da IA */}
              <View style={[styles.featuresCard, { backgroundColor: t.card }]}>
                <Text style={[styles.featuresTitle, { color: t.text }]}>
                  🧠 Recursos da IA
                </Text>

                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={t.success} />
                  <Text style={[styles.featureText, { color: t.textLight }]}>
                    Análise semântica do conteúdo
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={t.success} />
                  <Text style={[styles.featureText, { color: t.textLight }]}>
                    Identificação de tópicos principais
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={t.success} />
                  <Text style={[styles.featureText, { color: t.textLight }]}>
                    Resumos contextualizados
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={t.success} />
                  <Text style={[styles.featureText, { color: t.textLight }]}>
                    Otimização para busca inteligente
                  </Text>
                </View>
              </View>

              {/* Dicas */}
              <View style={[styles.tipsCard, { backgroundColor: t.card }]}>
                <Text style={[styles.tipsTitle, { color: t.text }]}>
                  💡 Dicas para Melhores Resumos
                </Text>

                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={16} color={t.primary} />
                  <Text style={[styles.tipText, { color: t.textLight }]}>
                    Notas com mais conteúdo geram resumos mais detalhados
                  </Text>
                </View>

                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={16} color={t.primary} />
                  <Text style={[styles.tipText, { color: t.textLight }]}>
                    Use tags para melhorar a categorização
                  </Text>
                </View>

                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={16} color={t.primary} />
                  <Text style={[styles.tipText, { color: t.textLight }]}>
                    Resumos são atualizados automaticamente quando você edita a nota
                  </Text>
                </View>
              </View>
            </>
          )}
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
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noteInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noteDetails: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteType: {
    fontSize: 12,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
  },
  actionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  generateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  summaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  qualityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  featuresCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});