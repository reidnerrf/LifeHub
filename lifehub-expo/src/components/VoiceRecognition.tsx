import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../services/api';

interface VoiceRecognitionProps {
  onCommandExecuted?: () => void;
}

export default function VoiceRecognition({ onCommandExecuted }: VoiceRecognitionProps) {
  const t = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Simulação de reconhecimento de voz (em produção, usar biblioteca como expo-speech)
  const startListening = async () => {
    setIsListening(true);
    setTranscript('');
    
    // Simular processamento de voz
    setTimeout(() => {
      // Em um app real, aqui seria o resultado do reconhecimento de voz
      const mockCommands = [
        'adicionar tarefa estudar programação',
        'adicionar nota reunião importante',
        'iniciar pausa',
        'próxima tarefa',
        'adicionar evento consulta médica',
        'adicionar hábito exercício físico'
      ];
      
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setTranscript(randomCommand);
      
      // Executar comando
      executeVoiceCommand(randomCommand);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const executeVoiceCommand = async (command: string) => {
    try {
      const response = await api.voiceCommand({ text: command, locale: 'pt-BR' });
      
      if (response.ok) {
        Alert.alert(
          'Comando Executado', 
          `${response.feedback}\n\nComando: "${command}"`,
          [
            { text: 'OK', onPress: () => {
              setTranscript('');
              onCommandExecuted?.();
            }}
          ]
        );
      } else {
        Alert.alert('Erro', response.error || 'Erro ao executar comando');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível executar o comando de voz');
    } finally {
      setIsListening(false);
    }
  };

  const getListeningText = () => {
    if (isListening) {
      return transcript ? `"${transcript}"` : 'Ouvindo...';
    }
    return 'Toque para falar';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          { 
            backgroundColor: isListening ? t.error : t.primary,
            transform: [{ scale: isListening ? 1.1 : 1 }]
          }
        ]}
        onPress={isListening ? stopListening : startListening}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isListening ? 'mic' : 'mic-outline'} 
          size={32} 
          color="#fff" 
        />
      </TouchableOpacity>
      
      {isListening && (
        <View style={[styles.transcriptContainer, { backgroundColor: t.card }]}>
          <Text style={[styles.transcriptText, { color: t.text }]}>
            {getListeningText()}
          </Text>
          <View style={[styles.pulse, { backgroundColor: t.primary }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  transcriptContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  transcriptText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },
});