import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents, VoiceRecognitionResult } from '../store/events';

interface VoiceRecognitionModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated?: (event: any) => void;
}

export const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
  visible,
  onClose,
  onEventCreated,
}) => {
  const {
    isVoiceRecording,
    voiceRecognitionResult,
    startVoiceRecording,
    stopVoiceRecording,
    createEventFromVoice,
  } = useEvents();

  const [recordingPhase, setRecordingPhase] = useState<'idle' | 'listening' | 'processing' | 'result'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (recordingPhase === 'listening') {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingPhase]);

  useEffect(() => {
    if (recordingPhase === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [recordingPhase, pulseAnimation]);

  const handleStartRecording = async () => {
    try {
      setRecordingPhase('listening');
      await startVoiceRecording();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação de voz');
      setRecordingPhase('idle');
    }
  };

  const handleStopRecording = async () => {
    try {
      setRecordingPhase('processing');
      const result = await stopVoiceRecording();
      
      if (result.confidence > 0.7) {
        setRecordingPhase('result');
      } else {
        Alert.alert('Baixa Confiança', 'Não foi possível entender claramente. Tente novamente.');
        setRecordingPhase('idle');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar a gravação de voz');
      setRecordingPhase('idle');
    }
  };

  const handleCreateEvent = () => {
    if (!voiceRecognitionResult) return;

    const event = createEventFromVoice(voiceRecognitionResult);
    if (event) {
      onEventCreated?.(event);
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
      handleClose();
    } else {
      Alert.alert('Erro', 'Não foi possível criar o evento. Verifique os dados reconhecidos.');
    }
  };

  const handleClose = () => {
    setRecordingPhase('idle');
    setRecordingTime(0);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIdlePhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="mic-outline" size={64} color="#007bff" />
      </View>
      
      <Text style={styles.phaseTitle}>Reconhecimento de Voz</Text>
      <Text style={styles.phaseDescription}>
        Toque no botão para começar a gravar e criar um evento por voz
      </Text>
      
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>Exemplos de comandos:</Text>
        <Text style={styles.exampleText}>• "Reunião com João amanhã às 14h"</Text>
        <Text style={styles.exampleText}>• "Consulta médica hoje às 16h por 30 minutos"</Text>
        <Text style={styles.exampleText}>• "Treino na academia amanhã às 7h da manhã"</Text>
        <Text style={styles.exampleText}>• "Lembrete de pagar contas na sexta às 10h"</Text>
      </View>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartRecording}
      >
        <Ionicons name="mic" size={24} color="#fff" />
        <Text style={styles.startButtonText}>Iniciar Gravação</Text>
      </TouchableOpacity>
    </View>
  );

  const renderListeningPhase = () => (
    <View style={styles.phaseContainer}>
      <Animated.View 
        style={[
          styles.recordingIndicator,
          { transform: [{ scale: pulseAnimation }] }
        ]}
      >
        <Ionicons name="mic" size={48} color="#ff4757" />
        <View style={styles.recordingDot} />
      </Animated.View>
      
      <Text style={styles.phaseTitle}>Ouvindo...</Text>
      <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
      <Text style={styles.phaseDescription}>
        Fale claramente sobre o evento que deseja criar
      </Text>
      
      <TouchableOpacity
        style={styles.stopButton}
        onPress={handleStopRecording}
      >
        <Ionicons name="stop" size={24} color="#fff" />
        <Text style={styles.stopButtonText}>Parar Gravação</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessingPhase = () => (
    <View style={styles.phaseContainer}>
      <View style={styles.processingContainer}>
        <Ionicons name="sync" size={48} color="#007bff" />
        <Text style={styles.processingText}>Processando...</Text>
      </View>
      
      <Text style={styles.phaseDescription}>
        Convertendo sua fala em texto e extraindo informações
      </Text>
    </View>
  );

  const renderResultPhase = () => {
    if (!voiceRecognitionResult) return null;

    const { text, confidence, entities } = voiceRecognitionResult;

    return (
      <ScrollView style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Ionicons name="checkmark-circle" size={48} color="#4caf50" />
          <Text style={styles.phaseTitle}>Reconhecimento Concluído</Text>
          <Text style={styles.confidenceText}>
            Confiança: {(confidence * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Texto Reconhecido:</Text>
          <View style={styles.textContainer}>
            <Text style={styles.recognizedText}>{text}</Text>
          </View>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Informações Extraídas:</Text>
          
          {entities.date && (
            <View style={styles.entityItem}>
              <Ionicons name="calendar-outline" size={20} color="#007bff" />
              <View style={styles.entityInfo}>
                <Text style={styles.entityLabel}>Data:</Text>
                <Text style={styles.entityValue}>
                  {entities.date.toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
          )}

          {entities.time && (
            <View style={styles.entityItem}>
              <Ionicons name="time-outline" size={20} color="#007bff" />
              <View style={styles.entityInfo}>
                <Text style={styles.entityLabel}>Horário:</Text>
                <Text style={styles.entityValue}>
                  {entities.time.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          )}

          {entities.duration && (
            <View style={styles.entityItem}>
              <Ionicons name="timer-outline" size={20} color="#007bff" />
              <View style={styles.entityInfo}>
                <Text style={styles.entityLabel}>Duração:</Text>
                <Text style={styles.entityValue}>
                  {entities.duration} minutos
                </Text>
              </View>
            </View>
          )}

          {entities.location && (
            <View style={styles.entityItem}>
              <Ionicons name="location-outline" size={20} color="#007bff" />
              <View style={styles.entityInfo}>
                <Text style={styles.entityLabel}>Local:</Text>
                <Text style={styles.entityValue}>{entities.location}</Text>
              </View>
            </View>
          )}

          {entities.participants && entities.participants.length > 0 && (
            <View style={styles.entityItem}>
              <Ionicons name="people-outline" size={20} color="#007bff" />
              <View style={styles.entityInfo}>
                <Text style={styles.entityLabel}>Participantes:</Text>
                <Text style={styles.entityValue}>
                  {entities.participants.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setRecordingPhase('idle')}
          >
            <Ionicons name="refresh" size={20} color="#666" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateEvent}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Criar Evento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderCurrentPhase = () => {
    switch (recordingPhase) {
      case 'listening':
        return renderListeningPhase();
      case 'processing':
        return renderProcessingPhase();
      case 'result':
        return renderResultPhase();
      default:
        return renderIdlePhase();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Criar Evento por Voz</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {renderCurrentPhase()}
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
  phaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  phaseDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  examplesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingIndicator: {
    position: 'relative',
    marginBottom: 24,
  },
  recordingDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4757',
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ff4757',
    marginBottom: 16,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    marginTop: 12,
  },
  resultContainer: {
    flex: 1,
    padding: 16,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  resultSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  recognizedText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  entityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  entityValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});