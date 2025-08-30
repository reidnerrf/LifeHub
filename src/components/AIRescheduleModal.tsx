import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents, AIRescheduleSuggestion, Event } from '../store/events';

interface AIRescheduleModalProps {
  visible: boolean;
  onClose: () => void;
  eventId?: string;
}

export const AIRescheduleModal: React.FC<AIRescheduleModalProps> = ({
  visible,
  onClose,
  eventId,
}) => {
  const {
    events,
    generateRescheduleSuggestions,
    applyRescheduleSuggestion,
    getRescheduleSuggestions,
    analyzeConflicts,
  } = useEvents();

  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [suggestions, setSuggestions] = useState<AIRescheduleSuggestion[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  useEffect(() => {
    if (visible && eventId) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setConflicts(analyzeConflicts(eventId));
        loadSuggestions(eventId);
      }
    }
  }, [visible, eventId, events]);

  const loadSuggestions = async (eventId: string) => {
    setLoading(true);
    try {
      const newSuggestions = await generateRescheduleSuggestions(eventId);
      setSuggestions(newSuggestions);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar sugestões de reagendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: AIRescheduleSuggestion) => {
    Alert.alert(
      'Confirmar Reagendamento',
      `Deseja reagendar o evento para ${formatDateTime(suggestion.suggestedTime.start)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reagendar',
          onPress: () => {
            applyRescheduleSuggestion(suggestion.id);
            Alert.alert('Sucesso', 'Evento reagendado com sucesso!');
            onClose();
          },
        },
      ]
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4caf50';
    if (confidence >= 0.6) return '#ff9800';
    return '#f44336';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  const renderEventInfo = () => {
    if (!selectedEvent) return null;

    return (
      <View style={styles.eventInfoCard}>
        <View style={styles.eventHeader}>
          <Ionicons name="calendar-outline" size={24} color="#007bff" />
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.eventDetailText}>
              {formatDateTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
            </Text>
          </View>
          
          {selectedEvent.location && (
            <View style={styles.eventDetail}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.eventDetailText}>{selectedEvent.location}</Text>
            </View>
          )}
          
          <View style={styles.eventDetail}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.eventDetailText}>
              {selectedEvent.participants.length > 0 
                ? selectedEvent.participants.join(', ')
                : 'Sem participantes'
              }
            </Text>
          </View>
        </View>

        {conflicts.length > 0 && (
          <View style={styles.conflictsContainer}>
            <Text style={styles.conflictsTitle}>Conflitos Detectados:</Text>
            {conflicts.map((conflict, index) => (
              <Text key={index} style={styles.conflictText}>• {conflict}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSuggestion = (suggestion: AIRescheduleSuggestion) => (
    <View key={suggestion.id} style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionTime}>
          <Text style={styles.suggestionDate}>{formatDate(suggestion.suggestedTime.start)}</Text>
          <Text style={styles.suggestionTimeText}>
            {formatTime(suggestion.suggestedTime.start)} - {formatTime(suggestion.suggestedTime.end)}
          </Text>
        </View>
        
        <View style={styles.confidenceContainer}>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(suggestion.confidence) }
          ]}>
            <Text style={styles.confidenceText}>
              {getConfidenceText(suggestion.confidence)}
            </Text>
          </View>
          <Text style={styles.confidencePercentage}>
            {(suggestion.confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      <Text style={styles.suggestionReason}>{suggestion.reason}</Text>

      {suggestion.alternatives.length > 0 && (
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesTitle}>Alternativas:</Text>
          {suggestion.alternatives.slice(0, 2).map((alt, index) => (
            <View key={index} style={styles.alternativeItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.alternativeText}>
                {formatDate(alt.start)} às {formatTime(alt.start)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.suggestionActions}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApplySuggestion(suggestion)}
        >
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.applyButtonText}>Aplicar Sugestão</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            Alert.alert(
              'Detalhes da Sugestão',
              `Motivo: ${suggestion.reason}\n\nConfiança: ${(suggestion.confidence * 100).toFixed(1)}%\n\nHorário Original: ${formatDateTime(suggestion.originalTime.start)}\nNovo Horário: ${formatDateTime(suggestion.suggestedTime.start)}`
            );
          }}
        >
          <Ionicons name="information-circle-outline" size={16} color="#007bff" />
          <Text style={styles.detailsButtonText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bulb-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Nenhuma Sugestão Disponível</Text>
      <Text style={styles.emptyStateText}>
        Não foi possível gerar sugestões de reagendamento para este evento.
      </Text>
      
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => selectedEvent && loadSuggestions(selectedEvent.id)}
      >
        <Ionicons name="refresh" size={16} color="#007bff" />
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Sugestões de Reagendamento</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content}>
          {renderEventInfo()}

          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={20} color="#007bff" />
              <Text style={styles.sectionTitle}>Sugestões da IA</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Analisando sua agenda...</Text>
              </View>
            ) : suggestions.length > 0 ? (
              suggestions.map(renderSuggestion)
            ) : (
              renderEmptyState()
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#007bff" />
              <Text style={styles.infoTitle}>Como Funciona</Text>
              <Text style={styles.infoText}>
                Nossa IA analisa sua agenda, padrões de produtividade e conflitos para sugerir os melhores horários para reagendar seus eventos.
              </Text>
            </View>
          </View>
        </ScrollView>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  eventInfoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  conflictsContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  conflictsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 6,
  },
  conflictText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
  },
  suggestionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  retryButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionCard: {
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
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionTime: {
    flex: 1,
  },
  suggestionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  suggestionTimeText: {
    fontSize: 14,
    color: '#666',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  confidencePercentage: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  suggestionReason: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  alternativesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alternativesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alternativeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  detailsButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});