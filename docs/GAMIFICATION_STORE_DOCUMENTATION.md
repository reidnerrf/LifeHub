# Gamification Store Documentation

## Overview

The Gamification Store is a comprehensive state management system built with Zustand that handles all gamification-related functionality in the LifeHub application. It manages user profiles, achievements, medals, quests, streaks, and leaderboards to create an engaging user experience.

## Architecture

### Core Interfaces

#### UserProfile
```typescript
interface UserProfile {
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
```

#### Achievement
```typescript
interface Achievement {
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
```

#### Medal
```typescript
interface Medal {
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
```

#### Quest
```typescript
interface Quest {
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
```

#### Streak
```typescript
interface Streak {
  id: string;
  type: 'tasks' | 'habits' | 'focus' | 'consistency';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  startDate: Date;
}
```

## Store Methods

### User Profile Management

#### `updateUserProfile(updates: Partial<UserProfile>)`
Updates user profile information and sets lastActive to current date.

#### `addExperience(amount: number)`
Adds experience points to the user. Handles level progression automatically.

#### `addPoints(amount: number)`
Adds points to the user's total points.

#### `updateStreak(type: Streak['type'], increment: boolean)`
Updates streak information for a specific type. Resets streak if increment is false.

### Achievement Management

#### `unlockAchievement(achievementId: string)`
Unlocks a specific achievement and awards points.

#### `updateAchievementProgress(achievementId: string, progress: number)`
Updates progress for an achievement and automatically unlocks it when requirements are met.

#### `getUnlockedAchievements(): Achievement[]`
Returns all unlocked achievements.

#### `getLockedAchievements(): Achievement[]`
Returns all locked achievements.

#### `getAchievementsByCategory(category: Achievement['category']): Achievement[]`
Returns achievements filtered by category.

### Medal Management

#### `unlockMedal(medalId: string)`
Unlocks a specific medal.

#### `updateMedalProgress(medalId: string, progress: number)`
Updates progress for a medal and automatically unlocks it when requirements are met.

#### `getUnlockedMedals(): Medal[]`
Returns all unlocked medals.

#### `getLockedMedals(): Medal[]`
Returns all locked medals.

#### `getMedalsByRarity(rarity: Medal['rarity']): Medal[]`
Returns medals filtered by rarity.

### Quest Management

#### `addQuest(quest: Omit<Quest, 'id' | 'createdAt'>)`
Adds a new quest to the store with auto-generated ID and creation date.

#### `updateQuest(questId: string, updates: Partial<Quest>)`
Updates quest information.

#### `completeQuest(questId: string)`
Completes a quest and awards rewards.

#### `generateAIQuests(): Promise<Quest[]>`
Generates AI-suggested quests.

#### `getActiveQuests(): Quest[]`
Returns all active quests.

#### `getCompletedQuests(): Quest[]`
Returns all completed quests.

#### `getQuestsByCategory(category: Quest['category']): Quest[]`
Returns quests filtered by category.

### Streak Management

#### `getStreakByType(type: Streak['type']): Streak | null`
Returns streak information for a specific type.

#### `getAllStreaks(): Streak[]`
Returns all streak information.

### Leaderboard Management

#### `updateLeaderboard()`
Updates leaderboard rankings.

#### `getUserRank(): number`
Returns the current user's rank.

#### `getTopUsers(limit: number): LeaderboardEntry[]`
Returns top users up to the specified limit.

### Statistics

#### `getGamificationStats(): GamificationStats`
Returns comprehensive gamification statistics including:
- Total points and level
- Experience and experience to next level
- Achievement and medal counts
- Streak information
- Quest completion statistics

## Usage Examples

### Basic Usage
```typescript
import { useGamification } from '../store/gamification';

// In a React component
const MyComponent = () => {
  const {
    userProfile,
    achievements,
    addExperience,
    unlockAchievement,
    getGamificationStats
  } = useGamification();

  const handleTaskComplete = () => {
    addExperience(10);
    updateAchievementProgress('task-master', 1);
  };

  return (
    <div>
      <h2>Level {userProfile.level}</h2>
      <p>Experience: {userProfile.experience}</p>
      <button onClick={handleTaskComplete}>Complete Task</button>
    </div>
  );
};
```

### Achievement Tracking
```typescript
const trackAchievement = (achievementId: string, progress: number) => {
  const { updateAchievementProgress, unlockAchievement } = useGamification();

  updateAchievementProgress(achievementId, progress);
};
```

### Quest Management
```typescript
const createNewQuest = () => {
  const { addQuest } = useGamification();

  const newQuest = {
    title: 'Weekly Challenge',
    description: 'Complete 10 tasks this week',
    category: 'weekly',
    type: 'tasks',
    objective: {
      action: 'Complete tasks',
      target: 10,
      current: 0,
      unit: 'tasks'
    },
    rewards: {
      points: 100,
      experience: 50
    },
    difficulty: 'medium',
    isCompleted: false,
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    suggestedBy: 'system'
  };

  addQuest(newQuest);
};
```

## Data Flow

1. **User Actions**: User performs actions (completing tasks, habits, focus sessions)
2. **Progress Updates**: Store methods update relevant progress counters
3. **Achievement Checks**: Automatic checking for achievement unlocks
4. **Point Distribution**: Points and experience are awarded
5. **UI Updates**: Components re-render with updated gamification state

## Best Practices

### Performance
- Use selectors to prevent unnecessary re-renders
- Batch multiple updates when possible
- Avoid deep object comparisons in effects

### State Management
- Always use the provided methods to update state
- Don't mutate state directly
- Use TypeScript interfaces for type safety

### Error Handling
- Validate inputs before calling store methods
- Handle edge cases (e.g., negative values, invalid IDs)
- Provide user feedback for failed operations

## Testing

### Unit Tests
Test individual store methods with various inputs and edge cases.

### Integration Tests
Test complete user flows and state interactions.

### Performance Tests
Monitor memory usage and render performance with large datasets.

## Future Enhancements

- Real-time multiplayer features
- Advanced AI quest generation
- Social features and friend challenges
- Custom achievement creation
- Advanced analytics and insights
- Integration with external gamification platforms

## Dependencies

- Zustand: State management
- TypeScript: Type safety
- Date objects for time-based calculations

## File Structure

```
src/store/
├── gamification.ts          # Main store implementation
├── types/                   # Type definitions (if separated)
└── hooks/                   # Custom hooks for gamification
```

This documentation provides a comprehensive overview of the Gamification Store's capabilities and usage patterns. For specific implementation details, refer to the source code and TypeScript interfaces.
