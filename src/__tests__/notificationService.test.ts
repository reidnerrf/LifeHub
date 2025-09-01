import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationContent, RoutineReminderData } from '../services/notificationService';

vi.mock('expo-notifications', () => {
  return {
    setNotificationHandler: vi.fn(),
    requestPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: vi.fn(() => Promise.resolve('notification-id')),
    cancelScheduledNotificationAsync: vi.fn(() => Promise.resolve()),
    cancelAllScheduledNotificationsAsync: vi.fn(() => Promise.resolve()),
    getAllScheduledNotificationsAsync: vi.fn(() => Promise.resolve([])),
    addNotificationReceivedListener: vi.fn(),
    addNotificationResponseReceivedListener: vi.fn(),
    SchedulableTriggerInputTypes: {
      DATE: 'date',
    },
  };
});

describe('NotificationService', () => {
  beforeEach(() => {
    // Reset initialization state before each test
    (notificationService as any).isInitialized = false;
  });

  it('should initialize and request permissions', async () => {
    const result = await notificationService.initialize();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('should schedule a notification', async () => {
    const content: NotificationContent = {
      title: 'Test Title',
      body: 'Test Body',
    };
    const trigger: Notifications.NotificationTriggerInput = {
      date: new Date(),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    };
    const id = await notificationService.scheduleNotification(content, trigger);
    expect(id).toBe('notification-id');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('should cancel a notification by id', async () => {
    await notificationService.cancelNotification('notification-id');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id');
  });

  it('should cancel all notifications', async () => {
    await notificationService.cancelAllNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });

  it('should get scheduled notifications', async () => {
    const notifications = await notificationService.getScheduledNotifications();
    expect(notifications).toEqual([]);
    expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();
  });

  it('should schedule routine reminder', async () => {
    const reminderData: RoutineReminderData = {
      routineId: 'r1',
      routineName: 'Routine 1',
      activityId: 'a1',
      activityTitle: 'Activity 1',
      activityDuration: 30,
      scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
    };
    const id = await notificationService.scheduleRoutineReminder(reminderData, 5);
    expect(id).toBe('notification-id');
  });

  it('should throw error if routine reminder time is in the past', async () => {
    const reminderData: RoutineReminderData = {
      routineId: 'r1',
      routineName: 'Routine 1',
      activityId: 'a1',
      activityTitle: 'Activity 1',
      activityDuration: 30,
      scheduledTime: new Date(Date.now() - 60000),
    };
    await expect(notificationService.scheduleRoutineReminder(reminderData, 5)).rejects.toThrow('Reminder time is in the past');
  });
});
