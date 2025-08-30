import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { notificationService } from '../services/notificationService';
import { MaterialIcons } from '@expo/vector-icons';

interface NotificationStats {
  totalScheduled: number;
  byType: Record<string, number>;
}

interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

const NotificationCenter: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRationale, setShowRationale] = useState(false);

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      setIsLoading(true);
      const status = await notificationService.getPermissionStatus();
      const stats = await notificationService.getNotificationStats();
      const shouldShowRationale = await notificationService.shouldShowPermissionRationale();

      setPermissionStatus(status);
      setNotificationStats(stats);
      setShowRationale(shouldShowRationale);
    } catch (error) {
      console.error('Failed to load notification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const status = await notificationService.requestPermissions();
      setPermissionStatus(status);
      setShowRationale(false);
      
      if (status.granted) {
        await notificationService.initializeDefaultChannels();
        Alert.alert('Sucesso', 'Permissões de notificação concedidas!');
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
      Alert.alert('Erro', 'Falha ao solicitar permissões de notificação');
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.scheduleAchievementNotification('Primeiro Teste', 100);
      Alert.alert('Sucesso', 'Notificação de teste agendada!');
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to schedule test notification:', error);
      Alert.alert('Erro', 'Falha ao agendar notificação de teste');
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      Alert.alert('Sucesso', 'Todas as notificações foram canceladas');
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      Alert.alert('Erro', 'Falha ao cancelar notificações');
    }
  };

  const scheduleDailyMotivational = async () => {
    try {
      await notificationService.scheduleMotivationalNotification();
      Alert.alert('Sucesso', 'Notificações motivacionais diárias ativadas!');
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to schedule motivational notifications:', error);
      Alert.alert('Erro', 'Falha ao agendar notificações motivacionais');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status de Permissões</Text>
        
        {permissionStatus && (
          <View style={styles.permissionStatus}>
            <View style={styles.statusRow}>
              <MaterialIcons 
                name={permissionStatus.granted ? "check-circle" : "error"} 
                size={24} 
                color={permissionStatus.granted ? "#4CAF50" : "#F44336"} 
              />
              <Text style={styles.statusText}>
                Status: {permissionStatus.granted ? 'Concedido' : 'Negado'}
              </Text>
            </View>
            
            {!permissionStatus.granted && showRationale && (
              <View style={styles.rationaleBox}>
                <Text style={styles.rationaleText}>
                  As notificações nos ajudam a manter você informado sobre suas tarefas, 
                  eventos e conquistas. Elas são essenciais para uma melhor experiência no LifeHub.
                </Text>
                <TouchableOpacity 
                  style={styles.requestButton}
                  onPress={requestPermissions}
                >
                  <Text style={styles.requestButtonText}>Solicitar Permissão</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {permissionStatus?.granted && notificationStats && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{notificationStats.totalScheduled}</Text>
                <Text style={styles.statLabel}>Total Agendadas</Text>
              </View>
              
              {Object.entries(notificationStats.byType).map(([type, count]) => (
                <View key={type} style={styles.statItem}>
                  <Text style={styles.statNumber}>{count}</Text>
                  <Text style={styles.statLabel}>{type}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={testNotification}
            >
              <MaterialIcons name="notifications" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Testar Notificação</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={scheduleDailyMotivational}
            >
              <MaterialIcons name="emoji-events" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Ativar Motivação Diária</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={clearAllNotifications}
            >
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Limpar Todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canais de Notificação</Text>
            <Text style={styles.channelInfo}>
              • Notificações Gerais: Alertas importantes do sistema
            </Text>
            <Text style={styles.channelInfo}>
              • Lembretes: Notificações de tarefas e eventos
            </Text>
            <Text style={styles.channelInfo}>
              • Conquistas: Notificações de recompensas e níveis
            </Text>
            <Text style={styles.channelInfo}>
              • Motivação: Mensagens inspiradoras diárias
            </Text>
          </View>
        </>
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
  permissionStatus: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  rationaleBox: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  rationaleText: {
    color: '#1976d2',
    fontSize: 14,
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  channelInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default NotificationCenter;
