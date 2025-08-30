import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  totalPoints: number;
  streakDays: number;
  longestStreak: number;
  currentStreak: number;
  joinDate: Date;
  lastActive: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'productivity' | 'health' | 'learning' | 'social' | 'special';
  type: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'special';
  requirement: {
    type: 'streak' | 'tasks' | 'habits' | 'focus' | 'events' | 'custom';
    value: number;
    period?: 'days' | 'weeks' | 'months';
  };
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'consistency' | 'productivity' | 'health' | 'learning' | 'social';
  requirement: {
    type: 'streak' | 'tasks' | 'habits' | 'focus' | 'events';
    value: number;
    period: 'days' | 'weeks' | 'months';
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  type: 'tasks' | 'habits' | 'focus' | 'events' | 'consistency' | 'productivity';
  objective: {
    action: string;
    target: number;
    current: number;
    unit: string;
  };
  rewards: {
    points: number;
    experience: number;
    items?: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  isCompleted: boolean;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  completedAt?: Date;
  suggestedBy: 'ai' | 'system' | 'user';
}

export interface Streak {
  id: string;
  type: 'tasks' | 'habits' | 'focus' | 'consistency';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  startDate: Date;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  totalPoints: number;
  streakDays: number;
  achievements: number;
  rank: number;
}

export interface GamificationStats {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  medalsUnlocked: number;
  totalMedals: number;
  currentStreak: number;
  longestStreak: number;
  questsCompleted: number;
  totalQuests: number;
}

interface GamificationStore {
  // Dados
  userProfile: UserProfile;
  achievements: Achievement[];
  medals: Medal[];
  quests: Quest[];
  streaks: Streak[];
  leaderboard: LeaderboardEntry[];
  
  // Estado atual
  isLoading: boolean;
  showAchievementModal: boolean;
  showQuestModal: boolean;
  showLeaderboardModal: boolean;
  selectedAchievement: Achievement | null;
  selectedQuest: Quest | null;
  
  // Ações para Perfil do Usuário
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addExperience: (amount: number) => void;
  addPoints: (amount: number) => void;
  updateStreak: (type: Streak['type'], increment: boolean) => void;
  getGamificationStats: () => GamificationStats;
  
  // Ações para Conquistas
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
  
  // Ações para Medalhas
  unlockMedal: (medalId: string) => void;
  updateMedalProgress: (medalId: string, progress: number) => void;
  getUnlockedMedals: () => Medal[];
  getLockedMedals: () => Medal[];
  getMedalsByRarity: (rarity: Medal['rarity']) => Medal[];
  
  // Ações para Quests
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt'>) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  completeQuest: (questId: string) => void;
  generateAIQuests: () => Promise<Quest[]>;
  getActiveQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  getQuestsByCategory: (category: Quest['category']) => Quest[];
  
  // Ações para Streaks
  getStreakByType: (type: Streak['type']) => Streak | null;
  getAllStreaks: () => Streak[];
  
  // Ações para Leaderboard
  updateLeaderboard: () => void;
  getUserRank: () => number;
  getTopUsers: (limit: number) => LeaderboardEntry[];
  
  // Configurações
  setShowAchievementModal: (show: boolean) => void;
  setShowQuestModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setSelectedAchievement: (achievement: Achievement | null) => void;
  setSelectedQuest: (quest: Quest | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useGamification = create<GamificationStore>((set, get) => ({
  // Estado inicial
  userProfile: {
    id: 'user-1',
    username: 'LifeHub User',
    level: 5,
    experience: 1250,
    totalPoints: 2840,
    streakDays: 12,
    longestStreak: 25,
    currentStreak: 12,
    joinDate: new Date('2024-01-01'),
    lastActive: new Date(),
  },
  achievements: [
    {
      id: 'first-task',
      name: 'Primeira Tarefa',
      description: 'Complete sua primeira tarefa',
      icon: 'checkmark-circle',
      category: 'productivity',
      type: 'milestone',
      requirement: { type: 'tasks', value: 1 },
      points: 10,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-01'),
      progress: 1,
      maxProgress: 1,
    },
    {
      id: 'task-master',
      name: 'Mestre das Tarefas',
      description: 'Complete 50 tarefas',
      icon: 'trophy',
      category: 'productivity',
      type: 'milestone',
      requirement: { type: 'tasks', value: 50, period: 'days' },
      points: 100,
      isUnlocked: false,
      progress: 23,
      maxProgress: 50,
    },
    {
      id: 'streak-7',
      name: 'Semana Consistente',
      description: 'Mantenha uma sequência de 7 dias',
      icon: 'flame',
      category: 'consistency',
      type: 'milestone',
      requirement: { type: 'streak', value: 7, period: 'days' },
      points: 50,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-07'),
      progress: 7,
      maxProgress: 7,
    },
    {
      id: 'streak-30',
      name: 'Mestre da Consistência',
      description: 'Mantenha uma sequência de 30 dias',
      icon: 'star',
      category: 'consistency',
      type: 'milestone',
      requirement: { type: 'streak', value: 30, period: 'days' },
      points: 500,
      isUnlocked: false,
      progress: 12,
      maxProgress: 30,
    },
    {
      id: 'habit-former',
      name: 'Formador de Hábitos',
      description: 'Complete 5 hábitos diferentes',
      icon: 'repeat',
      category: 'health',
      type: 'milestone',
      requirement: { type: 'habits', value: 5, period: 'days' },
      points: 75,
      isUnlocked: true,
      unlockedAt: new Date('2024-01-15'),
      progress: 5,
      maxProgress: 5,
    },
    {
      id: 'focus-master',
      name: 'Mestre do Foco',
      description: 'Complete 10 sessões de foco',
      icon: 'timer',
      category: 'productivity',
      type: 'milestone',
      requirement: { type: 'focus', value: 10, period: 'days' },
      points: 150,
      isUnlocked: false,
      progress: 7,
      maxProgress: 10,
    },
  ],
  medals: [
    {
      id: 'consistency-bronze',
      name: 'Consistência Bronze',
      description: '7 dias consecutivos de atividade',
      icon: 'medal',
      color: '#CD7F32',
      category: 'consistency',
      requirement: { type: 'streak', value: 7, period: 'days' },
      isUnlocked: true,
      unlockedAt: new Date('2024-01-07'),
      progress: 7,
      maxProgress: 7,
      rarity: 'common',
    },
    {
      id: 'consistency-silver',
      name: 'Consistência Prata',
      description: '15 dias consecutivos de atividade',
      icon: 'medal',
      color: '#C0C0C0',
      category: 'consistency',
      requirement: { type: 'streak', value: 15, period: 'days' },
      isUnlocked: false,
      progress: 12,
      maxProgress: 15,
      rarity: 'rare',
    },
    {
      id: 'consistency-gold',
      name: 'Consistência Ouro',
      description: '30 dias consecutivos de atividade',
      icon: 'medal',
      color: '#FFD700',
      category: 'consistency',
      requirement: { type: 'streak', value: 30, period: 'days' },
      isUnlocked: false,
      progress: 12,
      maxProgress: 30,
      rarity: 'epic',
    },
    {
      id: 'productivity-bronze',
      name: 'Produtividade Bronze',
      description: 'Complete 25 tarefas',
      icon: 'checkmark-circle',
      color: '#CD7F32',
      category: 'productivity',
      requirement: { type: 'tasks', value: 25, period: 'days' },
      isUnlocked: true,
      unlockedAt: new Date('2024-01-20'),
      progress: 25,
      maxProgress: 25,
      rarity: 'common',
    },
    {
      id: 'productivity-silver',
      name: 'Produtividade Prata',
      description: 'Complete 100 tarefas',
      icon: 'checkmark-circle',
      color: '#C0C0C0',
      category: 'productivity',
      requirement: { type: 'tasks', value: 100, period: 'days' },
      isUnlocked: false,
      progress: 23,
      maxProgress: 100,
      rarity: 'rare',
    },
    {
      id: 'health-bronze',
      name: 'Saúde Bronze',
      description: 'Complete 3 hábitos diferentes',
      icon: 'heart',
      color: '#CD7F32',
      category: 'health',
      requirement: { type: 'habits', value: 3, period: 'days' },
      isUnlocked: true,
      unlockedAt: new Date('2024-01-10'),
      progress: 3,
      maxProgress: 3,
      rarity: 'common',
    },
    {
      id: 'focus-bronze',
      name: 'Foco Bronze',
      description: 'Complete 5 sessões de foco',
      icon: 'timer',
      color: '#CD7F32',
      category: 'learning',
      requirement: { type: 'focus', value: 5, period: 'days' },
      isUnlocked: true,
      unlockedAt: new Date('2024-01-12'),
      progress: 5,
      maxProgress: 5,
      rarity: 'common',
    },
  ],
  quests: [
    {
      id: 'quest-weekly-tasks',
      title: 'Mestre das Tarefas',
      description: 'Complete 15 tarefas esta semana',
      category: 'weekly',
      type: 'tasks',
      objective: {
        action: 'Complete tarefas',
        target: 15,
        current: 8,
        unit: 'tarefas',
      },
      rewards: {
        points: 100,
        experience: 50,
      },
      difficulty: 'medium',
      isCompleted: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      suggestedBy: 'ai',
    },
    {
      id: 'quest-weekly-habits',
      title: 'Hábitos Consistentes',
      description: 'Mantenha 3 hábitos por 5 dias consecutivos',
      category: 'weekly',
      type: 'habits',
      objective: {
        action: 'Dias consecutivos',
        target: 5,
        current: 3,
        unit: 'dias',
      },
      rewards: {
        points: 75,
        experience: 30,
      },
      difficulty: 'easy',
      isCompleted: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      suggestedBy: 'ai',
    },
    {
      id: 'quest-weekly-focus',
      title: 'Sessões de Foco',
      description: 'Complete 3 sessões de foco de 25 minutos',
      category: 'weekly',
      type: 'focus',
      objective: {
        action: 'Sessões completadas',
        target: 3,
        current: 1,
        unit: 'sessões',
      },
      rewards: {
        points: 120,
        experience: 60,
      },
      difficulty: 'hard',
      isCompleted: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      suggestedBy: 'ai',
    },
  ],
  streaks: [
    {
      id: 'streak-consistency',
      type: 'consistency',
      currentStreak: 12,
      longestStreak: 25,
      lastActivity: new Date(),
      startDate: new Date('2024-01-01'),
    },
    {
      id: 'streak-tasks',
      type: 'tasks',
      currentStreak: 8,
      longestStreak: 15,
      lastActivity: new Date(),
      startDate: new Date('2024-01-01'),
    },
    {
      id: 'streak-habits',
      type: 'habits',
      currentStreak: 5,
      longestStreak: 12,
      lastActivity: new Date(),
      startDate: new Date('2024-01-01'),
    },
    {
      id: 'streak-focus',
      type: 'focus',
      currentStreak: 3,
      longestStreak: 7,
      lastActivity: new Date(),
      startDate: new Date('2024-01-01'),
    },
  ],
  leaderboard: [
    {
      id: 'user-1',
      username: 'LifeHub User',
      level: 5,
      totalPoints: 2840,
      streakDays: 12,
      achievements: 4,
      rank: 1,
    },
    {
      id: 'user-2',
      username: 'Produtividade Pro',
      level: 8,
      totalPoints: 4520,
      streakDays: 25,
      achievements: 7,
      rank: 2,
    },
    {
      id: 'user-3',
      username: 'Hábitos Master',
      level: 6,
      totalPoints: 3200,
      streakDays: 18,
      achievements: 5,
      rank: 3,
    },
  ],
  isLoading: false,
  showAchievementModal: false,
  showQuestModal: false,
  showLeaderboardModal: false,
  selectedAchievement: null,
  selectedQuest: null,

  // Implementações das ações
  updateUserProfile: (updates) => {
    set(state => ({
      userProfile: { ...state.userProfile, ...updates, lastActive: new Date() },
    }));
  },

  addExperience: (amount) => {
    set(state => {
      const newExperience = state.userProfile.experience + amount;
      const experienceToNextLevel = state.userProfile.level * 100;
      
      if (newExperience >= experienceToNextLevel) {
        return {
          userProfile: {
            ...state.userProfile,
            level: state.userProfile.level + 1,
            experience: newExperience - experienceToNextLevel,
            lastActive: new Date(),
          },
        };
      }
      
      return {
        userProfile: {
          ...state.userProfile,
          experience: newExperience,
          lastActive: new Date(),
        },
      };
    });
  },

  addPoints: (amount) => {
    set(state => ({
      userProfile: {
        ...state.userProfile,
        totalPoints: state.userProfile.totalPoints + amount,
        lastActive: new Date(),
      },
    }));
  },

  updateStreak: (type, increment) => {
    set(state => {
      const streak = state.streaks.find(s => s.type === type);
      if (!streak) return state;

      const newStreak = increment ? streak.currentStreak + 1 : 0;
      const newLongestStreak = Math.max(streak.longestStreak, newStreak);

      return {
        streaks: state.streaks.map(s =>
          s.type === type
            ? {
                ...s,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                lastActivity: new Date(),
              }
            : s
        ),
        userProfile: {
          ...state.userProfile,
          currentStreak: newStreak,
          longestStreak: Math.max(state.userProfile.longestStreak, newStreak),
          lastActive: new Date(),
        },
      };
    });
  },

  getGamificationStats: () => {
    const state = get();
    const unlockedAchievements = state.achievements.filter(a => a.isUnlocked);
    const unlockedMedals = state.medals.filter(m => m.isUnlocked);
    const completedQuests = state.quests.filter(q => q.isCompleted);
    const experienceToNextLevel = state.userProfile.level * 100;

    return {
      totalPoints: state.userProfile.totalPoints,
      level: state.userProfile.level,
      experience: state.userProfile.experience,
      experienceToNextLevel,
      achievementsUnlocked: unlockedAchievements.length,
      totalAchievements: state.achievements.length,
      medalsUnlocked: unlockedMedals.length,
      totalMedals: state.medals.length,
      currentStreak: state.userProfile.currentStreak,
      longestStreak: state.userProfile.longestStreak,
      questsCompleted: completedQuests.length,
      totalQuests: state.quests.length,
    };
  },

  unlockAchievement: (achievementId) => {
    set(state => {
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.isUnlocked) return state;

      const updatedAchievement = {
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      return {
        achievements: state.achievements.map(a =>
          a.id === achievementId ? updatedAchievement : a
        ),
        userProfile: {
          ...state.userProfile,
          totalPoints: state.userProfile.totalPoints + achievement.points,
          lastActive: new Date(),
        },
      };
    });
  },

  updateAchievementProgress: (achievementId, progress) => {
    set(state => {
      const achievement = state.achievements.find(a => a.id === achievementId);
      if (!achievement) return state;

      const updatedProgress = Math.min(progress, achievement.maxProgress);
      const shouldUnlock = updatedProgress >= achievement.maxProgress && !achievement.isUnlocked;

      const updatedAchievement = {
        ...achievement,
        progress: updatedProgress,
        isUnlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt,
      };

      return {
        achievements: state.achievements.map(a =>
          a.id === achievementId ? updatedAchievement : a
        ),
        userProfile: shouldUnlock
          ? {
              ...state.userProfile,
              totalPoints: state.userProfile.totalPoints + achievement.points,
              lastActive: new Date(),
            }
          : state.userProfile,
      };
    });
  },

  getUnlockedAchievements: () => {
    const state = get();
    return state.achievements.filter(a => a.isUnlocked);
  },

  getLockedAchievements: () => {
    const state = get();
    return state.achievements.filter(a => !a.isUnlocked);
  },

  getAchievementsByCategory: (category) => {
    const state = get();
    return state.achievements.filter(a => a.category === category);
  },

  unlockMedal: (medalId) => {
    set(state => {
      const medal = state.medals.find(m => m.id === medalId);
      if (!medal || medal.isUnlocked) return state;

      const updatedMedal = {
        ...medal,
        isUnlocked: true,
        unlockedAt: new Date(),
      };

      return {
        medals: state.medals.map(m =>
          m.id === medalId ? updatedMedal : m
        ),
      };
    });
  },

  updateMedalProgress: (medalId, progress) => {
    set(state => {
      const medal = state.medals.find(m => m.id === medalId);
      if (!medal) return state;

      const updatedProgress = Math.min(progress, medal.maxProgress);
      const shouldUnlock = updatedProgress >= medal.maxProgress && !medal.isUnlocked;

      const updatedMedal = {
        ...medal,
        progress: updatedProgress,
        isUnlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date() : medal.unlockedAt,
      };

      return {
        medals: state.medals.map(m =>
          m.id === medalId ? updatedMedal : m
        ),
      };
    });
  },

  getUnlockedMedals: () => {
    const state = get();
    return state.medals.filter(m => m.isUnlocked);
  },

  getLockedMedals: () => {
    const state = get();
    return state.medals.filter(m => !m.isUnlocked);
  },

  getMedalsByRarity: (rarity) => {
    const state = get();
    return state.medals.filter(m => m.rarity === rarity);
  },

  addQuest: (quest) => {
    const newQuest: Quest = {
      ...quest,
      id: `quest-${Date.now()}`,
      createdAt: new Date(),
    };

    set(state => ({
      quests: [...state.quests, newQuest],
    }));
  },

  updateQuest: (questId, updates) => {
    set(state => ({
      quests: state.quests.map(q =>
        q.id === questId ? { ...q, ...updates } : q
      ),
    }));
  },

  completeQuest: (questId) => {
    set(state => {
      const quest = state.quests.find(q => q.id === questId);
      if (!quest || quest.isCompleted) return state;

      const updatedQuest = {
        ...quest,
        isCompleted: true,
        completedAt: new Date(),
      };

      return {
        quests: state.quests.map(q =>
          q.id === questId ? updatedQuest : q
        ),
        userProfile: {
          ...state.userProfile,
          totalPoints: state.userProfile.totalPoints + quest.rewards.points,
          lastActive: new Date(),
        },
      };
    });
  },

  generateAIQuests: async () => {
    // Simular geração de quests pela IA
    const aiQuests: Omit<Quest, 'id' | 'createdAt'>[] = [
      {
        title: 'Desafio da Produtividade',
        description: 'Complete 20 tarefas em 7 dias',
        category: 'weekly',
        type: 'tasks',
        objective: {
          action: 'Complete tarefas',
          target: 20,
          current: 0,
          unit: 'tarefas',
        },
        rewards: {
          points: 150,
          experience: 75,
        },
        difficulty: 'hard',
        isCompleted: false,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        suggestedBy: 'ai',
      },
      {
        title: 'Mestre do Foco',
        description: 'Complete 5 sessões de foco de 30 minutos',
        category: 'weekly',
        type: 'focus',
        objective: {
          action: 'Sessões completadas',
          target: 5,
          current: 0,
          unit: 'sessões',
        },
        rewards: {
          points: 200,
          experience: 100,
        },
        difficulty: 'epic',
        isCompleted: false,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        suggestedBy: 'ai',
      },
    ];

    return aiQuests;
  },

  getActiveQuests: () => {
    const state = get();
    return state.quests.filter(q => q.isActive && !q.isCompleted);
  },

  getCompletedQuests: () => {
    const state = get();
    return state.quests.filter(q => q.isCompleted);
  },

  getQuestsByCategory: (category) => {
    const state = get();
    return state.quests.filter(q => q.category === category);
  },

  getStreakByType: (type) => {
    const state = get();
    return state.streaks.find(s => s.type === type) || null;
  },

  getAllStreaks: () => {
    const state = get();
    return state.streaks;
  },

  updateLeaderboard: () => {
    // Simular atualização do leaderboard
    console.log('Leaderboard atualizado');
  },

  getUserRank: () => {
    const state = get();
    const userEntry = state.leaderboard.find(entry => entry.id === state.userProfile.id);
    return userEntry ? userEntry.rank : 0;
  },

  getTopUsers: (limit) => {
    const state = get();
    return state.leaderboard.slice(0, limit);
  },

  setShowAchievementModal: (show) => {
    set({ showAchievementModal: show });
  },

  setShowQuestModal: (show) => {
    set({ showQuestModal: show });
  },

  setShowLeaderboardModal: (show) => {
    set({ showLeaderboardModal: show });
  },

  setSelectedAchievement: (achievement) => {
    set({ selectedAchievement: achievement });
  },

  setSelectedQuest: (quest) => {
    set({ selectedQuest: quest });
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },
}));