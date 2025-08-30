import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../services/api';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

interface VoiceRecognitionProps {
  onCommandExecuted?: () => void;
  continuousMode?: boolean;
  showTranscript?: boolean;
}

export default function VoiceRecognition({ 
  onCommandExecuted, 
  continuousMode = false,
  showTranscript = true 
}: VoiceRecognitionProps) {
  const t = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [continuousModeEnabled, setContinuousModeEnabled] = useState(continuousMode);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkPermissions();
    initializeSpeech();
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
      animateButtonPress();
    } else {
      stopPulseAnimation();
      animateButtonRelease();
    }
  }, [isListening]);

  const checkPermissions = async () => {
    try {
      // Check microphone permission using the speech recognition module
      const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      setPermissionGranted(result.granted);
      
      if (!result.granted) {
        const newResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        setPermissionGranted(newResult.granted);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      Alert.alert('Erro', 'Não foi possível verificar as permissões do microfone');
    }
  };

  const initializeSpeech = async () => {
    try {
      // Initialize speech synthesis with better settings
      Speech.speak('', { language: 'pt-BR' }); // Warm up speech engine
    } catch (error) {
      console.error('Error initializing speech:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const animateButtonPress = () => {
    Animated.spring(buttonScale, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const animateButtonRelease = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setIsProcessing(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setIsProcessing(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const newTranscript = event.results[0].transcript;
      setTranscript(newTranscript);
      
      // If this is a final result, execute the command
      if (event.isFinal && newTranscript.trim()) {
        setIsProcessing(true);
        executeVoiceCommand(newTranscript);
        
        // If in continuous mode, restart listening after a short delay
        if (continuousModeEnabled) {
          setTimeout(() => {
            if (!isListening) {
              startListening();
            }
          }, 1000);
        }
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error, event.message);
    setIsListening(false);
    setIsProcessing(false);
    
    if (event.error === 'not-allowed') {
      Alert.alert('Permissão necessária', 'Por favor, conceda permissão para usar o microfone');
    } else if (event.error !== 'aborted') {
      Alert.alert('Erro', 'Não foi possível processar o áudio');
    }
  });

  const startListening = async () => {
    if (!permissionGranted) {
      Alert.alert('Permissão necessária', 'Por favor, conceda permissão para usar o microfone');
      await checkPermissions();
      return;
    }

    setIsProcessing(true);
    setTranscript('');

    try {
      await ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: continuousModeEnabled,
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsProcessing(false);
      Alert.alert('Erro', 'Não foi possível iniciar o reconhecimento de voz');
    }
  };

  const stopListening = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  const speakFeedback = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: 'pt-BR',
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8,
      });
    } catch (error) {
      console.error('Error speaking feedback:', error);
    }
  };

  const executeVoiceCommand = async (command: string) => {
    try {
      const response = await api.voiceCommand({ text: command, locale: 'pt-BR' });
      
      if (response.ok) {
        // Speak feedback with improved speech synthesis
        if (response.feedback) {
          await speakFeedback(response.feedback);
        }

        Alert.alert(
          'Comando Executado', 
          `${response.feedback}\n\nComando: "${command}"`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                setTranscript('');
                onCommandExecuted?.();
              }
            }
          ]
        );
      } else {
        await speakFeedback('Desculpe, não consegui executar esse comando.');
        Alert.alert('Erro', response.error || 'Erro ao executar comando');
      }
    } catch (error) {
      console.error('Error executing voice command:', error);
      await speakFeedback('Ocorreu um erro ao processar seu comando.');
      Alert.alert('Erro', 'Não foi possível executar o comando de voz');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleContinuousMode = () => {
    setContinuousModeEnabled(!continuousModeEnabled);
    Alert.alert(
      'Modo Contínuo', 
      continuousModeEnabled ? 'Modo contínuo desativado' : 'Modo contínuo ativado'
    );
  };

  const getListeningText = () => {
    if (isProcessing) {
      return 'Processando...';
    }
    if (isListening) {
      return transcript ? `"${transcript}"` : 'Ouvindo...';
    }
    return 'Toque para falar';
  };

  const getButtonState = () => {
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    return 'idle';
  };

  const getButtonColor = () => {
    const state = getButtonState();
    switch (state) {
      case 'listening': return t.error;
      case 'processing': return t.warning;
      default: return t.primary;
    }
  };

  const getButtonIcon = () => {
    const state = getButtonState();
    switch (state) {
      case 'listening': return 'mic';
      case 'processing': return 'time';
      default: return 'mic-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            { 
              backgroundColor: getButtonColor(),
            }
          ]}
          onPress={isListening || isProcessing ? stopListening : startListening}
          onLongPress={toggleContinuousMode}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={getButtonIcon()} 
            size={32} 
            color="#fff" 
          />
        </TouchableOpacity>
      </Animated.View>
      
      {showTranscript && (isListening || isProcessing) && (
        <View style={[styles.transcriptContainer, { backgroundColor: t.card }]}>
          <Text style={[styles.transcriptText, { color: t.text }]}>
            {getListeningText()}
          </Text>
          {(isListening && !isProcessing) && (
            <Animated.View 
              style={[
                styles.pulse, 
                { 
                  backgroundColor: t.primary,
                  transform: [{ scale: pulseAnim }]
                }
              ]} 
            />
          )}
        </View>
      )}

      {!permissionGranted && (
        <View style={[styles.permissionWarning, { backgroundColor: t.warning }]}>
          <Text style={styles.permissionText}>
            Permissões de microfone e voz necessárias
          </Text>
          <TouchableOpacity onPress={checkPermissions} style={styles.retryButton}>
            <Text style={styles.retryText}>Conceder Permissões</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.modeIndicator}>
        <Text style={[styles.modeText, { color: t.textLight }]}>
          {continuousModeEnabled ? 'Modo Contínuo' : 'Modo Normal'}
        </Text>
        <Text style={[styles.modeHint, { color: t.textLight }]}>
          {continuousModeEnabled ? 'Mantenha pressionado para desativar' : 'Mantenha pressionado para ativar'}
        </Text>
      </View>
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
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.7,
  },
  permissionWarning: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modeIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modeHint: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
