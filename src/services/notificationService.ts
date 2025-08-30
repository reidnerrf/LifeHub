import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
}

export interface RoutineReminderData {
  routineId: string;
  routineName: string;
  activityId: string;
  activityTitle: string;
  activityDuration: number;
  scheduledTime: Date;
  isOptional?: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      this.isInitialized = status === 'granted';
      return this.isInitialized;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleNotification(
    content: NotificationContent,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data || {},
          sound: content.sound ?? true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Listen for notification events
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Routine-specific notification methods
  async scheduleRoutineReminder(
    reminderData: RoutineReminderData,
    minutesBefore: number = 5
  ): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const reminderTime = new Date(reminderData.scheduledTime.getTime() - minutesBefore * 60 * 1000);

      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        throw new Error('Reminder time is in the past');
      }

      const content: NotificationContent = {
        title: `⏰ ${reminderData.routineName}`,
        body: `${reminderData.activityTitle} em ${minutesBefore} minutos (${reminderData.activityDuration}min)`,
        data: {
          type: 'routine_reminder',
          routineId: reminderData.routineId,
          activityId: reminderData.activityId,
          scheduledTime: reminderData.scheduledTime.toISOString(),
          isOptional: reminderData.isOptional || false,
        },
        sound: true,
      };

      const trigger: Notifications.NotificationTriggerInput = {
        date: reminderTime,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      };

      const notificationId = await this.scheduleNotification(content, trigger);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule routine reminder:', error);
      throw error;
    }
  }

  async cancelRoutineReminders(routineId: string): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();

      const routineNotifications = scheduledNotifications.filter(notification =>
        notification.content.data?.type === 'routine_reminder' &&
        notification.content.data?.routineId === routineId
      );

      for (const notification of routineNotifications) {
        await this.cancelNotification(notification.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel routine reminders:', error);
    }
  }

  async getRoutineReminders(routineId?: string): Promise<Notifications.NotificationRequest[]> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();

      return scheduledNotifications.filter(notification => {
        const isRoutineReminder = notification.content.data?.type === 'routine_reminder';
        if (!isRoutineReminder) return false;

        if (routineId) {
          return notification.content.data?.routineId === routineId;
        }
        return true;
      });
    } catch (error) {
      console.error('Failed to get routine reminders:', error);
      return [];
    }
  }
}

export const notificationService = NotificationService.getInstance();
