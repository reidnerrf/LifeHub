import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProductivityPeriod = 'weekly' | 'monthly';

export interface ProductivityDataPoint {
  date: string; // ISO date (YYYY-MM-DD)
  tasksCompleted: number;
  focusMinutes: number;
  habitsScore: number; // 0-100
  eventsCount: number;
  productivityScore: number; // 0-100
}

export interface ProductivityTrend {
  dates: string[];
  tasksCompleted: number[];
  focusMinutes: number[];
  habitsScore: number[];
  productivityScore: number[];
}

export interface ProductivityGoal {
  id: string;
  name: string;
  targetMetric: keyof Omit<ProductivityDataPoint, 'date'>;
  targetValue: number;
  currentValue: number;
  deadline?: string; // ISO date
  status: 'active' | 'achieved' | 'archived';
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface ProductivityInsight {
  id: string;
  type: 'schedule' | 'habits' | 'environment' | 'efficiency' | 'productivity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact?: number; // 0-100
  createdAt: string; // ISO datetime
}

export interface ProductivityReport {
  id: string;
  period: ProductivityPeriod;
  startDate: string; // ISO date
  endDate: string; // ISO date
  totals: {
    tasksCompleted: number;
    focusMinutes: number;
    eventsCount: number;
  };
  averages: {
    tasksPerDay: number;
    focusMinutesPerDay: number;
    productivityScore: number;
  };
  mostProductiveDay: string; // Weekday label
  mostProductiveHour?: number; // optional if available from analysis
  trend: ProductivityTrend;
  generatedAt: string; // ISO datetime
}

interface ProductivityStore {
  // Data
  dataPoints: ProductivityDataPoint[];
  reports: ProductivityReport[];
  goals: ProductivityGoal[];
  insights: ProductivityInsight[];

  // State
  isAnalyzing: boolean;

  // Actions - data
  addDataPoint: (point: Omit<ProductivityDataPoint, 'date'> & { date?: string }) => void;
  getDataPoints: (days?: number) => ProductivityDataPoint[];

  // Reports
  generateReport: (period: ProductivityPeriod, startDate: Date, endDate: Date) => ProductivityReport;
  getReports: (period?: ProductivityPeriod) => ProductivityReport[];

  // Trends & Insights
  getTrend: (days: number) => ProductivityTrend;
  setInsights: (insights: ProductivityInsight[]) => void;

  // Goals
  addGoal: (goal: Omit<ProductivityGoal, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'currentValue'> & { currentValue?: number }) => void;
  updateGoalProgress: (goalId: string, currentValue: number) => void;
  completeGoal: (goalId: string) => void;

  // Stats
  getStats: () => {
    totalDaysTracked: number;
    averageProductivity: number;
    totalTasksCompleted: number;
    totalFocusHours: number;
  };
}

const STORAGE_KEYS = {
  DATA_POINTS: 'productivity:dataPoints',
  REPORTS: 'productivity:reports',
  GOALS: 'productivity:goals',
  INSIGHTS: 'productivity:insights',
};

function toISODate(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function getWeekdayLabel(dateISO: string): string {
  const date = new Date(dateISO);
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return weekdays[date.getDay()];
}

async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const useProductivity = create<ProductivityStore>((set, get) => ({
  dataPoints: [],
  reports: [],
  goals: [],
  insights: [],
  isAnalyzing: false,

  addDataPoint: (point) => {
    const date = point.date ?? toISODate(new Date());
    const newPoint: ProductivityDataPoint = {
      date,
      tasksCompleted: point.tasksCompleted,
      focusMinutes: point.focusMinutes,
      habitsScore: Math.max(0, Math.min(100, point.habitsScore)),
      eventsCount: point.eventsCount,
      productivityScore: Math.max(0, Math.min(100, point.productivityScore)),
    };
    set((state) => {
      const filtered = state.dataPoints.filter((p) => p.date !== date);
      const updated = [...filtered, newPoint].sort((a, b) => a.date.localeCompare(b.date));
      saveToStorage(STORAGE_KEYS.DATA_POINTS, updated);
      return { dataPoints: updated };
    });
  },

  getDataPoints: (days) => {
    const points = get().dataPoints;
    if (!days || points.length === 0) return points;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    const cutoffISO = toISODate(cutoff);
    return points.filter((p) => p.date >= cutoffISO);
  },

  generateReport: (period, startDate, endDate) => {
    const startISO = toISODate(startDate);
    const endISO = toISODate(endDate);
    const inRange = get().dataPoints.filter((p) => p.date >= startISO && p.date <= endISO);
    const days = Math.max(1, inRange.length);

    const totals = inRange.reduce(
      (acc, p) => {
        acc.tasksCompleted += p.tasksCompleted;
        acc.focusMinutes += p.focusMinutes;
        acc.eventsCount += p.eventsCount;
        return acc;
      },
      { tasksCompleted: 0, focusMinutes: 0, eventsCount: 0 }
    );

    const averageProductivity = inRange.reduce((sum, p) => sum + p.productivityScore, 0) / days;

    const byDay = inRange.reduce<Record<string, number>>((map, p) => {
      const weekday = getWeekdayLabel(p.date);
      map[weekday] = (map[weekday] ?? 0) + p.productivityScore;
      return map;
    }, {});
    const mostProductiveDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Segunda';

    const trend: ProductivityTrend = {
      dates: inRange.map((p) => p.date),
      tasksCompleted: inRange.map((p) => p.tasksCompleted),
      focusMinutes: inRange.map((p) => p.focusMinutes),
      habitsScore: inRange.map((p) => p.habitsScore),
      productivityScore: inRange.map((p) => p.productivityScore),
    };

    const report: ProductivityReport = {
      id: `prod-report-${Date.now()}`,
      period,
      startDate: startISO,
      endDate: endISO,
      totals,
      averages: {
        tasksPerDay: totals.tasksCompleted / days,
        focusMinutesPerDay: totals.focusMinutes / days,
        productivityScore: Number(averageProductivity.toFixed(1)),
      },
      mostProductiveDay,
      mostProductiveHour: undefined,
      trend,
      generatedAt: new Date().toISOString(),
    };

    set((state) => {
      const updated = [report, ...state.reports];
      saveToStorage(STORAGE_KEYS.REPORTS, updated);
      return { reports: updated };
    });

    return report;
  },

  getReports: (period) => {
    const all = get().reports;
    return period ? all.filter((r) => r.period === period) : all;
  },

  getTrend: (days) => {
    const data = get().getDataPoints(days);
    return {
      dates: data.map((p) => p.date),
      tasksCompleted: data.map((p) => p.tasksCompleted),
      focusMinutes: data.map((p) => p.focusMinutes),
      habitsScore: data.map((p) => p.habitsScore),
      productivityScore: data.map((p) => p.productivityScore),
    };
  },

  setInsights: (insights) => {
    set(() => {
      saveToStorage(STORAGE_KEYS.INSIGHTS, insights);
      return { insights };
    });
  },

  addGoal: (goal) => {
    const now = new Date().toISOString();
    const newGoal: ProductivityGoal = {
      id: `goal-${Date.now()}`,
      name: goal.name,
      targetMetric: goal.targetMetric,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue ?? 0,
      deadline: goal.deadline,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const updated = [newGoal, ...state.goals];
      saveToStorage(STORAGE_KEYS.GOALS, updated);
      return { goals: updated };
    });
  },

  updateGoalProgress: (goalId, currentValue) => {
    set((state) => {
      const updated = state.goals.map((g) =>
        g.id === goalId
          ? { ...g, currentValue, status: currentValue >= g.targetValue ? 'achieved' : g.status, updatedAt: new Date().toISOString() }
          : g
      );
      saveToStorage(STORAGE_KEYS.GOALS, updated);
      return { goals: updated };
    });
  },

  completeGoal: (goalId) => {
    set((state) => {
      const updated = state.goals.map((g) =>
        g.id === goalId ? { ...g, status: 'achieved', updatedAt: new Date().toISOString() } : g
      );
      saveToStorage(STORAGE_KEYS.GOALS, updated);
      return { goals: updated };
    });
  },

  getStats: () => {
    const data = get().dataPoints;
    const totalDaysTracked = data.length;
    const totalTasksCompleted = data.reduce((sum, p) => sum + p.tasksCompleted, 0);
    const totalFocusMinutes = data.reduce((sum, p) => sum + p.focusMinutes, 0);
    const averageProductivity = totalDaysTracked
      ? data.reduce((sum, p) => sum + p.productivityScore, 0) / totalDaysTracked
      : 0;
    return {
      totalDaysTracked,
      averageProductivity: Number(averageProductivity.toFixed(1)),
      totalTasksCompleted,
      totalFocusHours: Number((totalFocusMinutes / 60).toFixed(1)),
    };
  },
}));

// Lazy-load persisted state on first import
(async () => {
  try {
    const [dataPoints, reports, goals, insights] = await Promise.all([
      loadFromStorage<ProductivityDataPoint[]>(STORAGE_KEYS.DATA_POINTS, []),
      loadFromStorage<ProductivityReport[]>(STORAGE_KEYS.REPORTS, []),
      loadFromStorage<ProductivityGoal[]>(STORAGE_KEYS.GOALS, []),
      loadFromStorage<ProductivityInsight[]>(STORAGE_KEYS.INSIGHTS, []),
    ]);
    useProductivity.setState({ dataPoints, reports, goals, insights });
  } catch {
    // ignore
  }
})();

