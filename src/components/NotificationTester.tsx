import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { notificationService } from '../services/notificationService';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationTester: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);

  const testAchievementNotification = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleAchievementNotification('Explorador Inicial', 50);
      Alert.alert('✅ Sucesso', 'Notificação de conquista agendada!');
    } catch (error) {
      console.error('Failed to schedule achievement notification:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar notificação de conquista');
    } finally {
      setIsTesting(false);
    }
  };

  const testQuestCompletion = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleQuestCompletionNotification('Completar 5 Tarefas', {
        points: 100,
        experience: 50
      });
      Alert.alert('✅ Sucesso', 'Notificação de missão agendada!');
    } catch (error) {
      console.error('Failed to schedule quest notification:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar notificação de missão');
    } finally {
      setIsTesting(false);
    }
  };

  const testLevelUp = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleLevelUpNotification(5);
      Alert.alert('✅ Sucesso', 'Notificação de nível agendada!');
    } catch (error) {
      console.error('Failed to schedule level up notification:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar notificação de nível');
    } finally {
      setIsTesting(false);
    }
  };

  const testStreakNotification = async (isBroken: boolean = false) => {
    setIsTesting(true);
    try {
      await notificationService.scheduleStreakNotification(
        'tarefas diárias',
        isBroken ? 7 : 3,
        isBroken
      );
      Alert.alert('✅ Sucesso', `Notificação de sequência ${isBroken ? 'quebrada' : 'ativa'} agendada!`);
    } catch (error) {
      console.error('Failed to schedule streak notification:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar notificação de sequência');
    } finally {
      setIsTesting(false);
    }
  };

  const testTaskReminder = async () => {
    setIsTesting(true);
    try {
      const dueDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      await notificationService.scheduleTaskReminder(
        'task-123',
        'Estudar React Native',
        dueDate,
        15
      );
      Alert.alert('✅ Sucesso', 'Lembrete de tarefa agendado para 15 minutos antes!');
    } catch (error) {
      console.error('Failed to schedule task reminder:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar lembrete de tarefa');
    } finally {
      setIsTesting(false);
    }
  };

  const testEventReminder = async () => {
    setIsTesting(true);
    try {
      const startTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      await notificationService.scheduleEventReminder(
        'event-456',
        'Reunião de Equipe',
        startTime,
        30
      );
      Alert.alert('✅ Sucesso', 'Lembrete de evento agendado para 30 minutos antes!');
    } catch (error) {
      console.error('Failed to schedule event reminder:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar lembrete de evento');
    } finally {
      setIsTesting(false);
    }
  };

  const testHabitReminder = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleHabitReminder(
        'habit-789',
        'Meditação Matinal',
        '08:00'
      );
      Alert.alert('✅ Sucesso', 'Lembrete de hábito agendado para 08:00!');
    } catch (error) {
      console.error('Failed to schedule habit reminder:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar lembrete de hábito');
    } finally {
      setIsTesting(false);
    }
  };

  const testDailySummary = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleDailySummary('20:00');
      Alert.alert('✅ Sucesso', 'Resumo diário agendado para 20:00!');
    } catch (error) {
      console.error('Failed to schedule daily summary:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar resumo diário');
    } finally {
      setIsTesting(false);
    }
  };

  const testWeeklyReview = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleWeeklyReview(0, '10:00'); // Sunday at 10:00
      Alert.alert('✅ Sucesso', 'Revisão semanal agendada para domingo às 10:00!');
    } catch (error) {
      console.error('Failed to schedule weekly review:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar revisão semanal');
    } finally {
      setIsTesting(false);
    }
  };

  const testMotivational = async () => {
    setIsTesting(true);
    try {
      await notificationService.scheduleMotivationalNotification();
      Alert.alert('✅ Sucesso', 'Notificação motivacional agendada!');
    } catch (error) {
      console.error('Failed to schedule motivational notification:', error);
      Alert.alert('❌ Erro', 'Falha ao agendar notificação motivacional');
    } finally {
      setIsTesting(false);
    }
  };

  const testAllTypes = async () => {
    setIsTesting(true);
    try {
      // Test all notification types
      await testAchievementNotification();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testQuestCompletion();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testLevelUp();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testStreakNotification(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testMotivational();
      
      Alert.alert('🎉 Concluído', 'Todos os tipos de notificação foram testados!');
    } catch (error) {
      console.error('Failed to test all notification types:', error);
      Alert.alert('❌ Erro', 'Falha ao testar alguns tipos de notificação');
    } finally {
      setIsTesting(false);
    }
  };

  const TestButton: React.FC<{
    title: string;
    onPress: () => void;
    icon: string;
    color?: string;
  }> = ({ title, onPress, icon, color = '#2196F3' }) => (
    <TouchableOpacity 
      style={[styles.testButton, { backgroundColor: color }]}
      onPress={onPress}
      disabled={isTesting}
    >
      <MaterialIcons name={icon as any} size={20} color="#fff" />
      <Text style={styles.testButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Testador de Notificações</Text>
      <Text style={styles.subtitle}>
        Teste todos os tipos de notificações disponíveis no LifeHub
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Conquistas e Progresso</Text>
        
        <TestButton
          title="Notificação de Conquista"
          onPress={testAchievementNotification}
          icon="emoji-events"
          color="#FF9800"
        />
        
        <TestButton
          title="Missão Concluída"
          onPress={testQuestCompletion}
          icon="flag"
          color="#4CAF50"
        />
        
        <TestButton
          title="Subir de Nível"
          onPress={testLevelUp}
          icon="star"
          color="#9C27B0"
        />
        
        <TestButton
          title="Sequência Ativa"
          onPress={() => testStreakNotification(false)}
          icon="whatshot"
          color="#F44336"
        />
        
        <TestButton
          title="Sequência Quebrada"
          onPress={() => testStreakNotification(true)}
          icon="broken-image"
          color="#607D8B"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Lembretes Programados</Text>
        
        <TestButton
          title="Lembrete de Tarefa"
          onPress={testTaskReminder}
          icon="assignment"
          color="#2196F3"
        />
        
        <TestButton
          title="Lembrete de Evento"
          onPress={testEventReminder}
          icon="event"
          color="#3F51B5"
        />
        
        <TestButton
          title="Lembrete de Hábito"
          onPress={testHabitReminder}
          icon="repeat"
          color="#009688"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Resumos e Revisões</Text>
        
        <TestButton
          title="Resumo Diário"
          onPress={testDailySummary}
          icon="today"
          color="#795548"
        />
        
        <TestButton
          title="Revisão Semanal"
          onPress={testWeeklyReview}
          icon="date-range"
          color="#607D8B"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Motivação</Text>
        
        <TestButton
          title="Notificação Motivacional"
          onPress={testMotivational}
          icon="lightbulb"
          color="#FFC107"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Teste Completo</Text>
        
        <TestButton
          title="Testar Todos os Tipos"
          onPress={testAllTypes}
          icon="all-inclusive"
          color="#E91E63"
        />
      </View>

      {isTesting && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Testando notificação...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NotificationTester;
