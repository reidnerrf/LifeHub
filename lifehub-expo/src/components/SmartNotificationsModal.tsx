import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, SmartNotification } from '../store/settings';

interface SmartNotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SmartNotificationsModal({
  visible,
  onClose,
}: SmartNotificationsModalProps) {
  const {
    smartNotifications,
    toggleSmartNotification,
    updateSmartNotification,
    addSmartNotification,
    deleteSmartNotification,
  } = useSettings();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'location':
        return 'location';
      case 'time':
        return 'time';
      case 'activity':
        return 'analytics';
      case 'context':
        return 'bulb';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: SmartNotification['type']) => {
    switch (type) {
      case 'location':
        return '#FF9500';
      case 'time':
        return '#5856D6';
      case 'activity':
        return '#34C759';
      case 'context':
        return '#007AFF';
      default:
        return '#666666';
    }
  };

  const getNotificationDescription = (type: SmartNotification['type']) => {
    switch (type) {
      case 'location':
        return 'Baseadas na sua localização';
      case 'time':
        return 'Baseadas em horários específicos';
      case 'activity':
        return 'Baseadas na sua atividade';
      case 'context':
        return 'Baseadas no contexto atual';
      default:
        return 'Notificação personalizada';
    }
  };

  const handleToggleNotification = (notification: SmartNotification) => {
    toggleSmartNotification(notification.id);
  };

  const handleDeleteNotification = (notification: SmartNotification) => {
    Alert.alert(
      'Excluir Notificação',
      `Tem certeza que deseja excluir "${notification.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteSmartNotification(notification.id);
            Alert.alert('Sucesso', 'Notificação excluída!');
          },
        },
      ]
    );
  };

  const handleCreateNotification = () => {
    const newNotification: Omit<SmartNotification, 'id'> = {
      title: 'Nova Notificação Inteligente',
      description: 'Notificação personalizada criada por você',
      type: 'context',
      enabled: true,
      conditions: {
        context: {
          weather: true,
          traffic: false,
          calendar: true,
        },
      },
      actions: [
        {
          type: 'suggestion',
          message: 'Nova notificação inteligente ativada!',
          action: 'custom_action',
        },
      ],
    };
    addSmartNotification(newNotification);
    Alert.alert('Sucesso', 'Notificação inteligente criada!');
  };

  const renderConditionDetails = (notification: SmartNotification) => {
    const { conditions } = notification;

    if (conditions.location) {
      return (
        <View style={styles.conditionDetail}>
          <Ionicons name="location" size={16} color="#FF9500" />
          <Text style={styles.conditionText}>
            Localização: {conditions.location.latitude.toFixed(4)}, {conditions.location.longitude.toFixed(4)}
          </Text>
        </View>
      );
    }

    if (conditions.time) {
      return (
        <View style={styles.conditionDetail}>
          <Ionicons name="time" size={16} color="#5856D6" />
          <Text style={styles.conditionText}>
            Horário: {conditions.time.startTime} - {conditions.time.endTime}
          </Text>
        </View>
      );
    }

    if (conditions.activity) {
      return (
        <View style={styles.conditionDetail}>
          <Ionicons name="analytics" size={16} color="#34C759" />
          <Text style={styles.conditionText}>
            Atividade: {conditions.activity.type} ({conditions.activity.threshold} min)
          </Text>
        </View>
      );
    }

    if (conditions.context) {
      const contextItems = [];
      if (conditions.context.weather) contextItems.push('Clima');
      if (conditions.context.traffic) contextItems.push('Trânsito');
      if (conditions.context.calendar) contextItems.push('Calendário');

      return (
        <View style={styles.conditionDetail}>
          <Ionicons name="bulb" size={16} color="#007AFF" />
          <Text style={styles.conditionText}>
            Contexto: {contextItems.join(', ')}
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderActionDetails = (notification: SmartNotification) => {
    return notification.actions.map((action, index) => (
      <View key={index} style={styles.actionDetail}>
        <Ionicons
          name={
            action.type === 'reminder' ? 'alarm' :
            action.type === 'suggestion' ? 'bulb' :
            'warning'
          }
          size={16}
          color={
            action.type === 'reminder' ? '#FF9500' :
            action.type === 'suggestion' ? '#007AFF' :
            '#FF3B30'
          }
        />
        <Text style={styles.actionText}>
          {action.type === 'reminder' ? 'Lembrete' :
           action.type === 'suggestion' ? 'Sugestão' :
           'Alerta'}: {action.message}
        </Text>
      </View>
    ));
  };

  const renderNotificationCard = (notification: SmartNotification) => (
    <View key={notification.id} style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationInfo}>
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: getNotificationColor(notification.type) },
            ]}
          >
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.notificationDetails}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationDescription}>
              {notification.description}
            </Text>
            <Text style={styles.notificationType}>
              {getNotificationDescription(notification.type)}
            </Text>
          </View>
        </View>
        <View style={styles.notificationActions}>
          <Switch
            value={notification.enabled}
            onValueChange={() => handleToggleNotification(notification)}
            trackColor={{ false: '#E0E0E0', true: getNotificationColor(notification.type) }}
            thumbColor="#FFFFFF"
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNotification(notification)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.notificationContent}>
        {renderConditionDetails(notification)}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Ações:</Text>
          {renderActionDetails(notification)}
        </View>
      </View>
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
          <Text style={styles.title}>Notificações Inteligentes</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notificações Ativas</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNotification}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              Configure notificações inteligentes que se adaptam ao seu contexto e comportamento.
            </Text>
          </View>

          <View style={styles.notificationsContainer}>
            {smartNotifications.map(renderNotificationCard)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos de Notificações</Text>
            <View style={styles.typesContainer}>
              <View style={styles.typeCard}>
                <View style={[styles.typeIcon, { backgroundColor: '#FF9500' }]}>
                  <Ionicons name="location" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.typeTitle}>Localização</Text>
                <Text style={styles.typeDescription}>
                  Notificações baseadas na sua localização atual
                </Text>
              </View>

              <View style={styles.typeCard}>
                <View style={[styles.typeIcon, { backgroundColor: '#5856D6' }]}>
                  <Ionicons name="time" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.typeTitle}>Horário</Text>
                <Text style={styles.typeDescription}>
                  Notificações em horários específicos do dia
                </Text>
              </View>

              <View style={styles.typeCard}>
                <View style={[styles.typeIcon, { backgroundColor: '#34C759' }]}>
                  <Ionicons name="analytics" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.typeTitle}>Atividade</Text>
                <Text style={styles.typeDescription}>
                  Notificações baseadas na sua atividade no app
                </Text>
              </View>

              <View style={styles.typeCard}>
                <View style={[styles.typeIcon, { backgroundColor: '#007AFF' }]}>
                  <Ionicons name="bulb" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.typeTitle}>Contexto</Text>
                <Text style={styles.typeDescription}>
                  Notificações baseadas no contexto atual
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="location-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Use notificações de localização para lembretes quando chegar em casa ou no trabalho
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="time-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Configure horários específicos para rotinas matinais ou noturnas
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="analytics-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Monitore sua atividade para receber sugestões personalizadas
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 15,
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
  notificationsContainer: {
    gap: 15,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  notificationInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    color: '#999999',
  },
  notificationActions: {
    alignItems: 'center',
    gap: 10,
  },
  deleteButton: {
    padding: 4,
  },
  notificationContent: {
    gap: 10,
  },
  conditionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  actionsSection: {
    gap: 8,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  actionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 5,
  },
  typeDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});