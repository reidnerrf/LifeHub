import { notificationService, RoutineReminderData } from './notificationService';
import { useAssistant, Routine } from '../store/assistant';

class RoutineNotificationManager {
  private static instance: RoutineNotificationManager;

  private constructor() {}

  static getInstance(): RoutineNotificationManager {
    if (!RoutineNotificationManager.instance) {
      RoutineNotificationManager.instance = new RoutineNotificationManager();
    }
    return RoutineNotificationManager.instance;
  }

  async scheduleRoutineNotifications(routine: Routine, minutesBefore: number = 5) {
    if (!routine.isActive) return;

    for (const activity of routine.activities) {
      if (!activity.isOptional) {
        const scheduledTime = new Date();
        // For demo, schedule notifications at current time + activity order * 10 minutes
        scheduledTime.setMinutes(scheduledTime.getMinutes() + activity.order * 10);

        const reminderData: RoutineReminderData = {
          routineId: routine.id,
          routineName: routine.name,
          activityId: activity.id,
          activityTitle: activity.title,
          activityDuration: activity.duration,
          scheduledTime,
          isOptional: activity.isOptional,
        };

        try {
          await notificationService.scheduleRoutineReminder(reminderData, minutesBefore);
        } catch (error) {
          console.error('Failed to schedule notification for activity:', activity.title, error);
        }
      }
    }
  }

  async cancelRoutineNotifications(routineId: string) {
    try {
      await notificationService.cancelRoutineReminders(routineId);
    } catch (error) {
      console.error('Failed to cancel routine notifications for routine:', routineId, error);
    }
  }

  async rescheduleRoutineNotifications(routine: Routine, minutesBefore: number = 5) {
    await this.cancelRoutineNotifications(routine.id);
    await this.scheduleRoutineNotifications(routine, minutesBefore);
  }
}

export const routineNotificationManager = RoutineNotificationManager.getInstance();
