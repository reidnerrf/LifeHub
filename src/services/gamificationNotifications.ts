import { notificationService } from './notificationService';
import { Achievement, Medal, Quest } from '../store/gamification';

export interface GamificationNotificationData {
  type: 'achievement_unlock' | 'medal_unlock' | 'level_up' | 'streak_milestone' | 'quest_complete';
  title: string;
  body: string;
  data: {
    achievementId?: string;
    medalId?: string;
    questId?: string;
    level?: number;
    streakCount?: number;
    points?: number;
    experience?: number;
  };
}

class GamificationNotifications {
  private static instance: GamificationNotifications;
  private notificationHistory: GamificationNotificationData[] = [];
  private maxHistorySize = 50;

  private constructor() {}

  static getInstance(): GamificationNotifications {
    if (!GamificationNotifications.instance) {
      GamificationNotifications.instance = new GamificationNotifications();
    }
    return GamificationNotifications.instance;
  }

  async sendAchievementUnlockNotification(achievement: Achievement): Promise<string | null> {
    try {
      const notificationData: GamificationNotificationData = {
        type: 'achievement_unlock',
        title: '🏆 Nova Conquista!',
        body: `Você desbloqueou "${achievement.name}" e ganhou ${achievement.points} pontos!`,
        data: {
          achievementId: achievement.id,
          points: achievement.points,
        },
      };

      const notificationId = await notificationService.scheduleNotification(
        {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          sound: true,
        },
        {
          date: new Date(Date.now() + 1000), // Send immediately
          type: 'expo-notifications' as any,
        }
      );

      this.addToHistory(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Failed to send achievement unlock notification:', error);
      return null;
    }
  }

  async sendMedalUnlockNotification(medal: Medal): Promise<string | null> {
    try {
      const rarityEmoji = this.getRarityEmoji(medal.rarity);
      const notificationData: GamificationNotificationData = {
        type: 'medal_unlock',
        title: `${rarityEmoji} Nova Medalha!`,
        body: `Você conquistou a medalha "${medal.name}" (${medal.rarity})!`,
        data: {
          medalId: medal.id,
        },
      };

      const notificationId = await notificationService.scheduleNotification(
        {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          sound: true,
        },
        {
          date: new Date(Date.now() + 1000), // Send immediately
          type: 'expo-notifications' as any,
        }
      );

      this.addToHistory(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Failed to send medal unlock notification:', error);
      return null;
    }
  }

  async sendLevelUpNotification(newLevel: number, experience: number): Promise<string | null> {
    try {
      const notificationData: GamificationNotificationData = {
        type: 'level_up',
        title: '⭐ Nível Aumentado!',
        body: `Parabéns! Você alcançou o nível ${newLevel} com ${experience} XP!`,
        data: {
          level: newLevel,
          experience,
        },
      };

      const notificationId = await notificationService.scheduleNotification(
        {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          sound: true,
        },
        {
          date: new Date(Date.now() + 1000), // Send immediately
          type: 'expo-notifications' as any,
        }
      );

      this.addToHistory(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Failed to send level up notification:', error);
      return null;
    }
  }

  async sendStreakMilestoneNotification(streakCount: number, type: string): Promise<string | null> {
    try {
      const typeName = this.getStreakTypeName(type);
      const notificationData: GamificationNotificationData = {
        type: 'streak_milestone',
        title: '🔥 Sequência Record!',
        body: `Incrível! Você mantém uma sequência de ${streakCount} dias de ${typeName}!`,
        data: {
          streakCount,
        },
      };

      const notificationId = await notificationService.scheduleNotification(
        {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          sound: true,
        },
        {
          date: new Date(Date.now() + 1000), // Send immediately
          type: 'expo-notifications' as any,
        }
      );

      this.addToHistory(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Failed to send streak milestone notification:', error);
      return null;
    }
  }

  async sendQuestCompleteNotification(quest: Quest): Promise<string | null> {
    try {
      const notificationData: GamificationNotificationData = {
        type: 'quest_complete',
        title: '🎯 Quest Concluída!',
        body: `Você completou "${quest.title}" e ganhou ${quest.rewards.points} pontos!`,
        data: {
          questId: quest.id,
          points: quest.rewards.points,
          experience: quest.rewards.experience,
        },
      };

      const notificationId = await notificationService.scheduleNotification(
        {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          sound: true,
        },
        {
          date: new Date(Date.now() + 1000), // Send immediately
          type: 'expo-notifications' as any,
        }
      );

      this.addToHistory(notificationData);
      return notificationId;
    } catch (error) {
      console.error('Failed to send quest complete notification:', error);
      return null;
    }
  }

  private getRarityEmoji(rarity: string): string {
    switch (rarity) {
      case 'common': return '🥉';
      case 'rare': return '🥈';
      case 'epic': return '🥇';
      case 'legendary': return '👑';
      default: return '🏅';
    }
  }

  private getStreakTypeName(type: string): string {
    switch (type) {
      case 'consistency': return 'consistência';
      case 'tasks': return 'tarefas';
      case 'habits': return 'hábitos';
      case 'focus': return 'foco';
      default: return 'atividade';
    }
  }

  private addToHistory(notification: GamificationNotificationData): void {
    this.notificationHistory.unshift(notification);
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory = this.notificationHistory.slice(0, this.maxHistorySize);
    }
  }

  getNotificationHistory(): GamificationNotificationData[] {
    return [...this.notificationHistory];
  }

  clearNotificationHistory(): void {
    this.notificationHistory = [];
  }

  async cancelGamificationNotifications(): Promise<void> {
    try {
      const scheduledNotifications = await notificationService.getScheduledNotifications();

      const gamificationNotifications = scheduledNotifications.filter(notification =>
        notification.content.data?.type &&
        ['achievement_unlock', 'medal_unlock', 'level_up', 'streak_milestone', 'quest_complete']
          .includes(notification.content.data.type)
      );

      for (const notification of gamificationNotifications) {
        await notificationService.cancelNotification(notification.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel gamification notifications:', error);
    }
  }

  // Settings and preferences
  private settings = {
    achievementNotifications: true,
    medalNotifications: true,
    levelUpNotifications: true,
    streakNotifications: true,
    questNotifications: true,
    soundEnabled: true,
  };

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  shouldSendNotification(type: GamificationNotificationData['type']): boolean {
    switch (type) {
      case 'achievement_unlock':
        return this.settings.achievementNotifications;
      case 'medal_unlock':
        return this.settings.medalNotifications;
      case 'level_up':
        return this.settings.levelUpNotifications;
      case 'streak_milestone':
        return this.settings.streakNotifications;
      case 'quest_complete':
        return this.settings.questNotifications;
      default:
        return true;
    }
  }
}

export const gamificationNotifications = GamificationNotifications.getInstance();
