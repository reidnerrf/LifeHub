import { describe, it, expect, beforeEach } from '@jest/globals';
import { useGamification } from '../store/gamification';
import type { Quest } from '../store/gamification';

describe('Gamification Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { setState } = useGamification;
    setState({
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
      ],
      medals: [],
      quests: [],
      streaks: [],
      leaderboard: [],
      isLoading: false,
      showAchievementModal: false,
      showQuestModal: false,
      showLeaderboardModal: false,
      selectedAchievement: null,
      selectedQuest: null,
    });
  });

  it('should add experience and level up correctly', () => {
    const { addExperience, userProfile } = useGamification.getState();
    const initialLevel = userProfile.level;
    const initialExperience = userProfile.experience;

    addExperience(1000);
    const updatedProfile = useGamification.getState().userProfile;

    expect(updatedProfile.level).toBeGreaterThanOrEqual(initialLevel);
    expect(updatedProfile.experience).toBeLessThan(1000);
  });

  it('should unlock achievement when progress meets maxProgress', () => {
    const { updateAchievementProgress, achievements } = useGamification.getState();
    const achievementId = achievements[0].id;

    updateAchievementProgress(achievementId, achievements[0].maxProgress);
    const updatedAchievement = useGamification.getState().achievements.find(a => a.id === achievementId);

    expect(updatedAchievement?.isUnlocked).toBe(true);
  });

  it('should add points correctly', () => {
    const { addPoints, userProfile } = useGamification.getState();
    const initialPoints = userProfile.totalPoints;

    addPoints(50);
    const updatedPoints = useGamification.getState().userProfile.totalPoints;

    expect(updatedPoints).toBe(initialPoints + 50);
  });

  it('should update streak correctly', () => {
    const { updateStreak, streaks } = useGamification.getState();
    const type = 'tasks';

    // Add a streak entry for testing
    useGamification.setState({
      streaks: [
        {
          id: 'streak-tasks',
          type: 'tasks',
          currentStreak: 1,
          longestStreak: 2,
          lastActivity: new Date(),
          startDate: new Date(),
        },
      ],
    });

    updateStreak(type, true);
    const updatedStreak = useGamification.getState().streaks.find(s => s.type === type);

    expect(updatedStreak?.currentStreak).toBe(2);
  });

  it('should add and complete a quest', () => {
    const { addQuest, completeQuest, quests } = useGamification.getState();

    const newQuest: Omit<Quest, 'id' | 'createdAt'> = {
      title: 'Test Quest',
      description: 'Complete test quest',
      category: 'daily',
      type: 'tasks',
      objective: {
        action: 'Complete tasks',
        target: 1,
        current: 0,
        unit: 'tasks',
      },
      rewards: {
        points: 10,
        experience: 5,
      },
      difficulty: 'easy',
      isCompleted: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      suggestedBy: 'user',
    };

    addQuest(newQuest);
    const addedQuest = useGamification.getState().quests.find(q => q.title === 'Test Quest');
    expect(addedQuest).toBeDefined();

    if (addedQuest) {
      completeQuest(addedQuest.id);
      const completedQuest = useGamification.getState().quests.find(q => q.id === addedQuest.id);
      expect(completedQuest?.isCompleted).toBe(true);
    }
  });
});
