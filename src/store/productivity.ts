import { create } from 'zustand';

export interface ProductivityMetric {
  id: string;
  date: Date;
  type: 'tasks_completed' | 'focus_time' | 'habits_completed' | 'breaks_taken' | 'distractions_logged';
  value: number;
  unit: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ProductivitySession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: 'focus' | 'break' | 'distraction';
  productivity: number; // 0-100 scale
  notes?: string;
  tags?: string[];
}

export interface ProductivityGoal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  metric: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  isCompleted: boolean;
  createdAt: Date;
}

export interface ProductivityInsight {
  id: string;
  type: 'trend' | 'pattern' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'productivity' | 'habits' | 'focus' | 'consistency';
  data: any;
  generatedAt: Date;
  isRead: boolean;
}

export interface ProductivityReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalTasks: number;
    totalFocusTime: number;
    totalHabits: number;
    averageProductivity: number;
    bestDay: Date;
    worstDay: Date;
  };
  trends: {
    tasksTrend: number;
    focusTrend: number;
    habitsTrend: number;
    productivityTrend: number;
  };
  insights: ProductivityInsight[];
  recommendations: string[];
  generatedAt: Date;
}

export interface ProductivityStats {
  today: {
    tasksCompleted: number;
    focusTime: number;
    habitsCompleted: number;
    productivityScore: number;
  };
  week: {
    tasksCompleted: number;
    focusTime: number;
    habitsCompleted: number;
    productivityScore: number;
    streakDays: number;
  };
  month: {
    tasksCompleted: number;
    focusTime: number;
    habitsCompleted: number;
    productivityScore: number;
    activeDays: number;
  };
  allTime: {
    totalTasks: number;
    totalFocusTime: number;
    totalHabits: number;
    averageProductivity: number;
    longestStreak: number;
    joinDate: Date;
  };
}

interface ProductivityStore {
  // Dados
  metrics: ProductivityMetric[];
  sessions: ProductivitySession[];
  goals: ProductivityGoal[];
  insights: ProductivityInsight[];
  reports: ProductivityReport[];

  // Estado atual
  currentSession: ProductivitySession | null;
  isTracking: boolean;
  stats: ProductivityStats;

  // Estado da UI
  showReportModal: boolean;
  showInsightsModal: boolean;
  showExportModal: boolean;
  selectedReport: ProductivityReport | null;
  selectedInsight: ProductivityInsight | null;
  isGeneratingReport: boolean;

  // Ações para Métricas
  addMetric: (metric: Omit<ProductivityMetric, 'id'>) => void;
  getMetricsByDateRange: (start: Date, end: Date) => ProductivityMetric[];
  getMetricsByType: (type: ProductivityMetric['type']) => ProductivityMetric[];
  getMetricsByCategory: (category: string) => ProductivityMetric[];

  // Ações para Sessões
  startSession: (type: ProductivitySession['type'], notes?: string) => void;
  endSession: (productivity?: number) => void;
  addSession: (session: Omit<ProductivitySession, 'id'>) => void;
  getSessionsByDateRange: (start: Date, end: Date) => ProductivitySession[];
  getSessionsByType: (type: ProductivitySession['type']) => ProductivitySession[];

  // Ações para Metas
  addGoal: (goal: Omit<ProductivityGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (goalId: string, updates: Partial<ProductivityGoal>) => void;
  completeGoal: (goalId: string) => void;
  getActiveGoals: () => ProductivityGoal[];
  getCompletedGoals: () => ProductivityGoal[];

  // Ações para Insights
  addInsight: (insight: Omit<ProductivityInsight, 'id' | 'generatedAt' | 'isRead'>) => void;
  markInsightAsRead: (insightId: string) => void;
  getUnreadInsights: () => ProductivityInsight[];
  getInsightsByCategory: (category: ProductivityInsight['category']) => ProductivityInsight[];

  // Ações para Relatórios
  generateReport: (type: ProductivityReport['type'], start?: Date, end?: Date) => Promise<ProductivityReport>;
  exportReport: (reportId: string, format: 'pdf' | 'csv' | 'json') => Promise<string>;
  getReportsByType: (type: ProductivityReport['type']) => ProductivityReport[];
  deleteReport: (reportId: string) => void;

  // Ações para Estatísticas
  updateStats: () => void;
  getProductivityScore: (date: Date) => number;
  getProductivityTrends: (days: number) => any;

  // Ações para Análise
  analyzeProductivity: (start: Date, end: Date) => Promise<ProductivityInsight[]>;
  generateRecommendations: () => string[];

  // Configurações da UI
  setShowReportModal: (show: boolean) => void;
  setShowInsightsModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setSelectedReport: (report: ProductivityReport | null) => void;
  setSelectedInsight: (insight: ProductivityInsight | null) => void;
  setIsGeneratingReport: (generating: boolean) => void;
}

export const useProductivity = create<ProductivityStore>((set, get) => ({
  // Estado inicial
  metrics: [],
  sessions: [],
  goals: [],
  insights: [],
  reports: [],

  currentSession: null,
  isTracking: false,
  stats: {
    today: {
      tasksCompleted: 0,
      focusTime: 0,
      habitsCompleted: 0,
      productivityScore: 0,
    },
    week: {
      tasksCompleted: 0,
      focusTime: 0,
      habitsCompleted: 0,
      productivityScore: 0,
      streakDays: 0,
    },
    month: {
      tasksCompleted: 0,
      focusTime: 0,
      habitsCompleted: 0,
      productivityScore: 0,
      activeDays: 0,
    },
    allTime: {
      totalTasks: 0,
      totalFocusTime: 0,
      totalHabits: 0,
      averageProductivity: 0,
      longestStreak: 0,
      joinDate: new Date(),
    },
  },

  showReportModal: false,
  showInsightsModal: false,
  showExportModal: false,
  selectedReport: null,
  selectedInsight: null,
  isGeneratingReport: false,

  // Implementações das ações
  addMetric: (metric) => {
    const newMetric: ProductivityMetric = {
      ...metric,
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    set(state => ({
      metrics: [...state.metrics, newMetric],
    }));

    // Atualizar estatísticas após adicionar métrica
    get().updateStats();
  },

  getMetricsByDateRange: (start, end) => {
    const state = get();
    return state.metrics.filter(metric =>
      metric.date >= start && metric.date <= end
    );
  },

  getMetricsByType: (type) => {
    const state = get();
    return state.metrics.filter(metric => metric.type === type);
  },

  getMetricsByCategory: (category) => {
    const state = get();
    return state.metrics.filter(metric => metric.category === category);
  },

  startSession: (type, notes) => {
    const session: ProductivitySession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      type,
      productivity: 0,
      notes,
      tags: [],
    };

    set(state => ({
      currentSession: session,
      isTracking: true,
    }));
  },

  endSession: (productivity = 0) => {
    const state = get();
    if (!state.currentSession) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - state.currentSession.startTime.getTime()) / (1000 * 60));

    const completedSession: ProductivitySession = {
      ...state.currentSession,
      endTime,
      duration,
      productivity,
    };

    set(state => ({
      sessions: [...state.sessions, completedSession],
      currentSession: null,
      isTracking: false,
    }));

    // Adicionar métrica baseada na sessão
    if (completedSession.type === 'focus') {
      get().addMetric({
        date: new Date(),
        type: 'focus_time',
        value: duration,
        unit: 'minutes',
        category: 'productivity',
        metadata: { sessionId: completedSession.id, productivity },
      });
    }
  },

  addSession: (session) => {
    const newSession: ProductivitySession = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    set(state => ({
      sessions: [...state.sessions, newSession],
    }));
  },

  getSessionsByDateRange: (start, end) => {
    const state = get();
    return state.sessions.filter(session =>
      session.startTime >= start && session.startTime <= end
    );
  },

  getSessionsByType: (type) => {
    const state = get();
    return state.sessions.filter(session => session.type === type);
  },

  addGoal: (goal) => {
    const newGoal: ProductivityGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date(),
    };

    set(state => ({
      goals: [...state.goals, newGoal],
    }));
  },

  updateGoal: (goalId, updates) => {
    set(state => ({
      goals: state.goals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ),
    }));
  },

  completeGoal: (goalId) => {
    set(state => ({
      goals: state.goals.map(goal =>
        goal.id === goalId
          ? { ...goal, isCompleted: true }
          : goal
      ),
    }));
  },

  getActiveGoals: () => {
    const state = get();
    return state.goals.filter(goal => !goal.isCompleted && goal.deadline > new Date());
  },

  getCompletedGoals: () => {
    const state = get();
    return state.goals.filter(goal => goal.isCompleted);
  },

  addInsight: (insight) => {
    const newInsight: ProductivityInsight = {
      ...insight,
      id: `insight-${Date.now()}`,
      generatedAt: new Date(),
      isRead: false,
    };

    set(state => ({
      insights: [...state.insights, newInsight],
    }));
  },

  markInsightAsRead: (insightId) => {
    set(state => ({
      insights: state.insights.map(insight =>
        insight.id === insightId ? { ...insight, isRead: true } : insight
      ),
    }));
  },

  getUnreadInsights: () => {
    const state = get();
    return state.insights.filter(insight => !insight.isRead);
  },

  getInsightsByCategory: (category) => {
    const state = get();
    return state.insights.filter(insight => insight.category === category);
  },

  generateReport: async (type, start, end) => {
    set({ isGeneratingReport: true });

    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000));

    const reportPeriod = start && end ? { start, end } : getDefaultPeriod(type);

    const report: ProductivityReport = {
      id: `report-${Date.now()}`,
      title: `${type === 'weekly' ? 'Relatório Semanal' : type === 'monthly' ? 'Relatório Mensal' : 'Relatório Personalizado'} de Produtividade`,
      type,
      period: reportPeriod,
      summary: {
        totalTasks: 45,
        totalFocusTime: 1200,
        totalHabits: 28,
        averageProductivity: 78,
        bestDay: new Date(),
        worstDay: new Date(),
      },
      trends: {
        tasksTrend: 12,
        focusTrend: 8,
        habitsTrend: -3,
        productivityTrend: 5,
      },
      insights: [],
      recommendations: [],
      generatedAt: new Date(),
    };

    set(state => ({
      reports: [...state.reports, report],
      isGeneratingReport: false,
    }));

    return report;
  },

  exportReport: async (reportId, format) => {
    // Simular exportação
    await new Promise(resolve => setTimeout(resolve, 1000));

    const downloadUrl = `export-${reportId}.${format}`;
    return downloadUrl;
  },

  getReportsByType: (type) => {
    const state = get();
    return state.reports.filter(report => report.type === type);
  },

  deleteReport: (reportId) => {
    set(state => ({
      reports: state.reports.filter(report => report.id !== reportId),
    }));
  },

  updateStats: () => {
    const state = get();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calcular estatísticas do dia
    const todayMetrics = state.metrics.filter(m => m.date >= today);
    const todayTasks = todayMetrics.filter(m => m.type === 'tasks_completed').reduce((sum, m) => sum + m.value, 0);
    const todayFocus = todayMetrics.filter(m => m.type === 'focus_time').reduce((sum, m) => sum + m.value, 0);
    const todayHabits = todayMetrics.filter(m => m.type === 'habits_completed').reduce((sum, m) => sum + m.value, 0);

    // Calcular estatísticas da semana
    const weekMetrics = state.metrics.filter(m => m.date >= weekAgo);
    const weekTasks = weekMetrics.filter(m => m.type === 'tasks_completed').reduce((sum, m) => sum + m.value, 0);
    const weekFocus = weekMetrics.filter(m => m.type === 'focus_time').reduce((sum, m) => sum + m.value, 0);
    const weekHabits = weekMetrics.filter(m => m.type === 'habits_completed').reduce((sum, m) => sum + m.value, 0);

    // Calcular estatísticas do mês
    const monthMetrics = state.metrics.filter(m => m.date >= monthAgo);
    const monthTasks = monthMetrics.filter(m => m.type === 'tasks_completed').reduce((sum, m) => sum + m.value, 0);
    const monthFocus = monthMetrics.filter(m => m.type === 'focus_time').reduce((sum, m) => sum + m.value, 0);
    const monthHabits = monthMetrics.filter(m => m.type === 'habits_completed').reduce((sum, m) => sum + m.value, 0);

    // Calcular estatísticas gerais
    const allTasks = state.metrics.filter(m => m.type === 'tasks_completed').reduce((sum, m) => sum + m.value, 0);
    const allFocus = state.metrics.filter(m => m.type === 'focus_time').reduce((sum, m) => sum + m.value, 0);
    const allHabits = state.metrics.filter(m => m.type === 'habits_completed').reduce((sum, m) => sum + m.value, 0);

    set(state => ({
      stats: {
        today: {
          tasksCompleted: todayTasks,
          focusTime: todayFocus,
          habitsCompleted: todayHabits,
          productivityScore: calculateProductivityScore(todayTasks, todayFocus, todayHabits),
        },
        week: {
          tasksCompleted: weekTasks,
          focusTime: weekFocus,
          habitsCompleted: weekHabits,
          productivityScore: calculateProductivityScore(weekTasks / 7, weekFocus / 7, weekHabits / 7),
          streakDays: 5, // TODO: calcular sequência real
        },
        month: {
          tasksCompleted: monthTasks,
          focusTime: monthFocus,
          habitsCompleted: monthHabits,
          productivityScore: calculateProductivityScore(monthTasks / 30, monthFocus / 30, monthHabits / 30),
          activeDays: 22, // TODO: calcular dias ativos reais
        },
        allTime: {
          totalTasks: allTasks,
          totalFocusTime: allFocus,
          totalHabits: allHabits,
          averageProductivity: calculateProductivityScore(allTasks / 30, allFocus / 30, allHabits / 30), // média aproximada
          longestStreak: 12, // TODO: calcular sequência mais longa
          joinDate: new Date('2024-01-01'),
        },
      },
    }));
  },

  getProductivityScore: (date) => {
    const state = get();
    const dayMetrics = state.metrics.filter(m =>
      m.date.toDateString() === date.toDateString()
    );

    const tasks = dayMetrics.filter(m => m.type === 'tasks_completed').reduce((sum, m) => sum + m.value, 0);
    const focus = dayMetrics.filter(m => m.type === 'focus_time').reduce((sum, m) => sum + m.value, 0);
    const habits = dayMetrics.filter(m => m.type === 'habits_completed').reduce((sum, m) => sum + m.value, 0);

    return calculateProductivityScore(tasks, focus, habits);
  },

  getProductivityTrends: (days) => {
    const state = get();
    const now = new Date();
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const score = get().getProductivityScore(date);
      trends.push({ date, score });
    }

    return trends;
  },

  analyzeProductivity: async (start, end) => {
    // Simular análise
    await new Promise(resolve => setTimeout(resolve, 1500));

    const insights: ProductivityInsight[] = [
      {
        id: `insight-${Date.now()}-1`,
        type: 'trend',
        title: 'Melhoria na Produtividade',
        description: 'Sua produtividade aumentou 15% nesta semana',
        severity: 'low',
        category: 'productivity',
        data: { trend: 15 },
        generatedAt: new Date(),
        isRead: false,
      },
      {
        id: `insight-${Date.now()}-2`,
        type: 'recommendation',
        title: 'Otimize seus Horários de Foco',
        description: 'Considere focar mais entre 9h-11h quando sua produtividade é maior',
        severity: 'medium',
        category: 'focus',
        data: { optimalHours: ['9:00', '11:00'] },
        generatedAt: new Date(),
        isRead: false,
      },
    ];

    set(state => ({
      insights: [...state.insights, ...insights],
    }));

    return insights;
  },

  generateRecommendations: () => {
    const state = get();
    const recommendations = [];

    // Análise baseada em estatísticas atuais
    if (state.stats.today.productivityScore < 50) {
      recommendations.push('Considere fazer uma pausa curta para recarregar sua energia');
    }

    if (state.stats.week.tasksCompleted < 20) {
      recommendations.push('Tente dividir suas tarefas em objetivos menores e mais alcançáveis');
    }

    if (state.stats.month.focusTime < 600) {
      recommendations.push('Aumente gradualmente seu tempo de foco diário para melhorar a concentração');
    }

    return recommendations;
  },

  // Configurações da UI
  setShowReportModal: (show) => set({ showReportModal: show }),
  setShowInsightsModal: (show) => set({ showInsightsModal: show }),
  setShowExportModal: (show) => set({ showExportModal: show }),
  setSelectedReport: (report) => set({ selectedReport: report }),
  setSelectedInsight: (insight) => set({ selectedInsight: insight }),
  setIsGeneratingReport: (generating) => set({ isGeneratingReport: generating }),
}));

// Funções auxiliares
function calculateProductivityScore(tasks: number, focusTime: number, habits: number): number {
  // Fórmula simples de pontuação de produtividade
  const taskScore = Math.min(tasks * 10, 40); // Máximo 40 pontos por tarefas
  const focusScore = Math.min(focusTime / 30, 35); // Máximo 35 pontos por foco (30min = 35 pontos)
  const habitScore = Math.min(habits * 5, 25); // Máximo 25 pontos por hábitos

  return Math.round(taskScore + focusScore + habitScore);
}

function getDefaultPeriod(type: ProductivityReport['type']): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();

  switch (type) {
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  return { start, end: now };
}
