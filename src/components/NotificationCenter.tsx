import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { gamificationNotifications, GamificationNotificationData } from '../services/gamificationNotifications';

const { width } = Dimensions.get('window');

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const t = useTheme();
  const [notifications, setNotifications] = useState<GamificationNotificationData[]>([]);
  const [settings, setSettings] = useState(gamificationNotifications.getSettings());

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = () => {
    const history = gamificationNotifications.getNotificationHistory();
    setNotifications(history);
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Limpar Notificações',
      'Tem certeza que deseja limpar todas as notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            gamificationNotifications.clearNotificationHistory();
            setNotifications([]);
          }
        }
      ]
    );
  };

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    gamificationNotifications.updateSettings(newSettings);
  };

  const getNotificationIcon = (type: GamificationNotificationData['type']) => {
    switch (type) {
      case 'achievement_unlock': return 'trophy';
      case 'medal_unlock': return 'medal';
      case 'level_up': return 'star';
      case 'streak_milestone': return 'flame';
      case 'quest_complete': return 'checkmark-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: GamificationNotificationData['type']) => {
    switch (type) {
      case 'achievement_unlock': return t.warning;
      case 'medal_unlock': return t.success;
      case 'level_up': return t.primary;
      case 'streak_milestone': return t.error;
      case 'quest_complete': return t.secondary;
      default: return t.textLight;
    }
  };

  const formatNotificationTime = (index: number) => {
    // Simple time formatting - in real app you'd use actual timestamps
    if (index === 0) return 'Agora';
    if (index === 1) return '1 min atrás';
    if (index < 5) return `${index} min atrás`;
    return 'Recentemente';
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { backgroundColor: t.card }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Centro de Notificações</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Settings Section */}
          <View style={[styles.section, { backgroundColor: t.background }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Configurações</Text>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="trophy" size={20} color={t.warning} />
                  <Text style={[styles.settingText, { color: t.text }]}>Conquistas</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    { backgroundColor: settings.achievementNotifications ? t.primary : t.textLight + '40' }
                  ]}
                  onPress={() => updateSetting('achievementNotifications', !settings.achievementNotifications)}
                >
                  <View style={[
                    styles.toggleKnob,
                    { backgroundColor: t.card },
                    settings.achievementNotifications && { transform: [{ translateX: 20 }] }
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="medal" size={20} color={t.success} />
                  <Text style={[styles.settingText, { color: t.text }]}>Medalhas</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    { backgroundColor: settings.medalNotifications ? t.primary : t.textLight + '40' }
                  ]}
                  onPress={() => updateSetting('medalNotifications', !settings.medalNotifications)}
                >
                  <View style={[
                    styles.toggleKnob,
                    { backgroundColor: t.card },
                    settings.medalNotifications && { transform: [{ translateX: 20 }] }
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="star" size={20} color={t.primary} />
                  <Text style={[styles.settingText, { color: t.text }]}>Aumento de Nível</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    { backgroundColor: settings.levelUpNotifications ? t.primary : t.textLight + '40' }
                  ]}
                  onPress={() => updateSetting('levelUpNotifications', !settings.levelUpNotifications)}
                >
                  <View style={[
                    styles.toggleKnob,
                    { backgroundColor: t.card },
                    settings.levelUpNotifications && { transform: [{ translateX: 20 }] }
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="flame" size={20} color={t.error} />
                  <Text style={[styles.settingText, { color: t.text }]}>Sequências</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    { backgroundColor: settings.streakNotifications ? t.primary : t.textLight + '40' }
                  ]}
                  onPress={() => updateSetting('streakNotifications', !settings.streakNotifications)}
                >
                  <View style={[
                    styles.toggleKnob,
                    { backgroundColor: t.card },
                    settings.streakNotifications && { transform: [{ translateX: 20 }] }
                  ]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="checkmark-circle" size={20} color={t.secondary} />
                  <Text style={[styles.settingText, { color: t.text }]}>Quests</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    { backgroundColor: settings.questNotifications ? t.primary : t.textLight + '40' }
                  ]}
                  onPress={() => updateSetting('questNotifications', !settings.questNotifications)}
                >
                  <View style={[
                    styles.toggleKnob,
                    { backgroundColor: t.card },
                    settings.questNotifications && { transform: [{ translateX: 20 }] }
                  ]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Notifications List */}
          <View style={[styles.section, { backgroundColor: t.background }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Histórico ({notifications.length})
              </Text>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={clearAllNotifications}>
                  <Text style={[styles.clearText, { color: t.primary }]}>Limpar</Text>
                </TouchableOpacity>
              )}
            </View>

            {notifications.length > 0 ? (
              <View style={styles.notificationsList}>
                {notifications.map((notification, index) => (
                  <View key={index} style={styles.notificationItem}>
                    <View style={[
                      styles.notificationIcon,
                      { backgroundColor: getNotificationColor(notification.type) + '20' }
                    ]}>
                      <Ionicons
                        name={getNotificationIcon(notification.type) as any}
                        size={20}
                        color={getNotificationColor(notification.type)}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationTitle, { color: t.text }]}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notificationBody, { color: t.textLight }]}>
                        {notification.body}
                      </Text>
                      <Text style={[styles.notificationTime, { color: t.textLight }]}>
                        {formatNotificationTime(index)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color={t.textLight} />
                <Text style={[styles.emptyTitle, { color: t.text }]}>Nenhuma Notificação</Text>
                <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                  As notificações de conquistas aparecerão aqui
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: width - 32,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsList: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});
