import { create } from 'zustand';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: {
    type: 'days' | 'times_per_week' | 'times_per_month';
    value: number;
  };
  target: number;
  current: number;
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  completedDates: string[]; // ISO date strings
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WellnessCheckin {
  id: string;
  date: string; // ISO date string
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
  sleepHours: number; // 0-12 hours
  notes?: string;
  createdAt: Date;
}

export interface ProductivityCorrelation {
  date: string;
  habitsScore: number; // 0-100
  productivity: number; // 0-100
  mood: number;
  energy: number;
  sleepHours: number;
}

interface HabitsStore {
  // Dados
  habits: Habit[];
  checkins: WellnessCheckin[];
  correlations: ProductivityCorrelation[];

  // Estado atual
  selectedPeriod: 'week' | 'month' | 'year';
  selectedDate: Date;

  // Ações para Hábitos
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  incrementHabit: (id: string) => void;
  decrementHabit: (id: string) => void;
  resetHabit: (id: string) => void;

  // Ações para Check-ins
  addCheckin: (checkin: Omit<WellnessCheckin, 'id' | 'createdAt'>) => void;
  updateCheckin: (id: string, updates: Partial<WellnessCheckin>) => void;
  deleteCheckin: (id: string) => void;
  getCheckinForDate: (date: Date) => WellnessCheckin | null;

  // Ações para Correlações
  addCorrelation: (correlation: Omit<ProductivityCorrelation, 'date'>) => void;
  updateCorrelation: (date: string, updates: Partial<ProductivityCorrelation>) => void;

  // Análises e Relatórios
  getHabitsForDate: (date: Date) => Habit[];
  getHabitsForPeriod: (startDate: Date, endDate: Date) => Habit[];
  getCompletionRate: (period: 'day' | 'week' | 'month') => number;
  getStreakStats: () => { current: number; longest: number; average: number };
  getWellnessTrends: (days: number) => {
    mood: number[];
    energy: number[];
    sleep: number[];
  };
  getProductivityCorrelation: (days: number) => {
    correlation: number;
    data: ProductivityCorrelation[];
  };

  // Configurações
  setSelectedPeriod: (period: 'week' | 'month' | 'year') => void;
  setSelectedDate: (date: Date) => void;
}

export const useHabits = create<HabitsStore>((set, get) => ({
  // Estado inicial
  habits: [
    {
      id: '1',
      name: 'Beber 8 copos de água',
      description: 'Manter-se hidratado durante o dia',
      icon: '💧',
      category: 'Saúde',
      color: '#007AFF',
      frequency: 'daily',
      target: 8,
      current: 6,
      streak: 12,
      longestStreak: 15,
      completedToday: false,
      completedDates: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Exercitar-se por 30 min',
      description: 'Atividade física diária',
      icon: '🏋️',
      category: 'Fitness',
      color: '#34C759',
      frequency: 'daily',
      target: 1,
      current: 1,
      streak: 5,
      longestStreak: 8,
      completedToday: true,
      completedDates: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Meditar por 10 min',
      description: 'Prática de mindfulness',
      icon: '🧘',
      category: 'Bem-estar',
      color: '#FF9500',
      frequency: 'daily',
      target: 1,
      current: 0,
      streak: 8,
      longestStreak: 12,
      completedToday: false,
      completedDates: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Ler por 30 min',
      description: 'Leitura diária para desenvolvimento',
      icon: '📚',
      category: 'Educação',
      color: '#5856D6',
      frequency: 'daily',
      target: 1,
      current: 0,
      streak: 3,
      longestStreak: 7,
      completedToday: false,
      completedDates: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  checkins: [],
  correlations: [],
  selectedPeriod: 'week',
  selectedDate: new Date(),

  // Ações para Hábitos
  addHabit: (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      habits: [newHabit, ...state.habits],
    }));
  },

  updateHabit: (id, updates) => {
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id
          ? { ...habit, ...updates, updatedAt: new Date() }
          : habit
      ),
    }));
  },

  deleteHabit: (id) => {
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    }));
  },

  toggleHabit: (id) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id === id) {
          const today = new Date().toISOString().split('T')[0];
          const isCompleted = habit.completedDates.includes(today);
          
          let newCompletedDates = [...habit.completedDates];
          let newStreak = habit.streak;
          let newCurrent = habit.current;

          if (isCompleted) {
            // Desmarcar
            newCompletedDates = newCompletedDates.filter(date => date !== today);
            newCurrent = Math.max(0, habit.current - 1);
            // Reset streak se desmarcou hoje
            if (habit.completedToday) {
              newStreak = 0;
            }
          } else {
            // Marcar
            newCompletedDates.push(today);
            newCurrent = Math.min(habit.target, habit.current + 1);
            // Incrementar streak se não estava marcado
            if (!habit.completedToday) {
              newStreak = habit.streak + 1;
            }
          }

          return {
            ...habit,
            current: newCurrent,
            completedToday: !isCompleted,
            completedDates: newCompletedDates,
            streak: newStreak,
            longestStreak: Math.max(newStreak, habit.longestStreak),
            updatedAt: new Date(),
          };
        }
        return habit;
      }),
    }));
  },

  incrementHabit: (id) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id === id) {
          return {
            ...habit,
            current: Math.min(habit.target, habit.current + 1),
            updatedAt: new Date(),
          };
        }
        return habit;
      }),
    }));
  },

  decrementHabit: (id) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id === id) {
          return {
            ...habit,
            current: Math.max(0, habit.current - 1),
            updatedAt: new Date(),
          };
        }
        return habit;
      }),
    }));
  },

  resetHabit: (id) => {
    set((state) => ({
      habits: state.habits.map((habit) => {
        if (habit.id === id) {
          return {
            ...habit,
            current: 0,
            completedToday: false,
            updatedAt: new Date(),
          };
        }
        return habit;
      }),
    }));
  },

  // Ações para Check-ins
  addCheckin: (checkin) => {
    const newCheckin: WellnessCheckin = {
      ...checkin,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      checkins: [newCheckin, ...state.checkins],
    }));

    // Calcular correlação com produtividade
    const { getProductivityCorrelation } = get();
    const correlation = getProductivityCorrelation(7);
    
    // Adicionar correlação se não existir para hoje
    const today = new Date().toISOString().split('T')[0];
    const existingCorrelation = get().correlations.find(c => c.date === today);
    
    if (!existingCorrelation) {
      const habitsScore = get().getCompletionRate('day');
      const productivity = Math.round(50 + Math.random() * 50); // Mock data
      
      get().addCorrelation({
        habitsScore,
        productivity,
        mood: checkin.mood,
        energy: checkin.energy,
        sleepHours: checkin.sleepHours,
      });
    }
  },

  updateCheckin: (id, updates) => {
    set((state) => ({
      checkins: state.checkins.map((checkin) =>
        checkin.id === id ? { ...checkin, ...updates } : checkin
      ),
    }));
  },

  deleteCheckin: (id) => {
    set((state) => ({
      checkins: state.checkins.filter((checkin) => checkin.id !== id),
    }));
  },

  getCheckinForDate: (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return get().checkins.find((checkin) => checkin.date === dateStr) || null;
  },

  // Ações para Correlações
  addCorrelation: (correlation) => {
    const today = new Date().toISOString().split('T')[0];
    const newCorrelation: ProductivityCorrelation = {
      ...correlation,
      date: today,
    };
    set((state) => ({
      correlations: [newCorrelation, ...state.correlations],
    }));
  },

  updateCorrelation: (date, updates) => {
    set((state) => ({
      correlations: state.correlations.map((correlation) =>
        correlation.date === date ? { ...correlation, ...updates } : correlation
      ),
    }));
  },

  // Análises e Relatórios
  getHabitsForDate: (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return get().habits.filter((habit) => 
      habit.completedDates.includes(dateStr)
    );
  },

  getHabitsForPeriod: (startDate, endDate) => {
    return get().habits.filter((habit) => {
      const habitDate = new Date(habit.createdAt);
      return habitDate >= startDate && habitDate <= endDate;
    });
  },

  getCompletionRate: (period) => {
    const { habits } = get();
    if (habits.length === 0) return 0;

    const today = new Date();
    let relevantHabits = habits;

    if (period === 'day') {
      relevantHabits = habits.filter(habit => habit.completedToday);
    } else if (period === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      relevantHabits = habits.filter(habit => 
        new Date(habit.createdAt) >= weekAgo
      );
    } else if (period === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      relevantHabits = habits.filter(habit => 
        new Date(habit.createdAt) >= monthAgo
      );
    }

    const completed = relevantHabits.filter(habit => habit.completedToday).length;
    return Math.round((completed / relevantHabits.length) * 100);
  },

  getStreakStats: () => {
    const { habits } = get();
    if (habits.length === 0) return { current: 0, longest: 0, average: 0 };

    const currentStreaks = habits.map(habit => habit.streak);
    const longestStreaks = habits.map(habit => habit.longestStreak);

    return {
      current: Math.max(...currentStreaks),
      longest: Math.max(...longestStreaks),
      average: Math.round(currentStreaks.reduce((sum, streak) => sum + streak, 0) / currentStreaks.length),
    };
  },

  getWellnessTrends: (days) => {
    const { checkins } = get();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const recentCheckins = checkins.filter(checkin => {
      const checkinDate = new Date(checkin.date);
      return checkinDate >= startDate && checkinDate <= endDate;
    });

    return {
      mood: recentCheckins.map(c => c.mood),
      energy: recentCheckins.map(c => c.energy),
      sleep: recentCheckins.map(c => c.sleepHours),
    };
  },

  getProductivityCorrelation: (days) => {
    const { correlations } = get();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const recentCorrelations = correlations.filter(correlation => {
      const correlationDate = new Date(correlation.date);
      return correlationDate >= startDate && correlationDate <= endDate;
    });

    // Calcular correlação de Pearson
    const calculateCorrelation = (data: ProductivityCorrelation[]) => {
      if (data.length < 2) return 0;

      const habitsScores = data.map(d => d.habitsScore);
      const productivityScores = data.map(d => d.productivity);

      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const mx = mean(habitsScores);
      const my = mean(productivityScores);

      const numerator = habitsScores.map((x, i) => (x - mx) * (productivityScores[i] - my))
        .reduce((a, b) => a + b, 0);

      const denominator = Math.sqrt(
        habitsScores.map(x => (x - mx) ** 2).reduce((a, b) => a + b, 0) *
        productivityScores.map(y => (y - my) ** 2).reduce((a, b) => a + b, 0)
      ) || 1;

      return +(numerator / denominator).toFixed(2);
    };

    return {
      correlation: calculateCorrelation(recentCorrelations),
      data: recentCorrelations,
    };
  },

  // Configurações
  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
}));