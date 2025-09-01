import { useProductivity, ProductivityDataPoint, ProductivityInsight, ProductivityTrend } from '../store/productivity';
import { mlOptimizationService } from './mlOptimizationService';

export interface AnalysisResult {
  score: number;
  trend: ProductivityTrend;
  patterns: {
    bestWorkingHours: string[];
    mostProductiveDays: string[];
    commonDistractions: string[];
  };
  recommendations: ProductivityInsight[];
}

function movingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 1) return values.slice();
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(Number(avg.toFixed(2)));
  }
  return result;
}

function normalizeTo100(value: number, min: number, max: number): number {
  if (max === min) return 0;
  const v = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Number(v.toFixed(1))));
}

export class ProductivityAnalysisService {
  analyzeLocal(points: ProductivityDataPoint[]): AnalysisResult {
    const trend: ProductivityTrend = {
      dates: points.map((p) => p.date),
      tasksCompleted: movingAverage(points.map((p) => p.tasksCompleted), 3),
      focusMinutes: movingAverage(points.map((p) => p.focusMinutes), 3),
      habitsScore: movingAverage(points.map((p) => p.habitsScore), 3),
      productivityScore: movingAverage(points.map((p) => p.productivityScore), 3),
    };

    const lastScore = points.at(-1)?.productivityScore ?? 0;
    const minScore = Math.min(...points.map((p) => p.productivityScore));
    const maxScore = Math.max(...points.map((p) => p.productivityScore));
    const score = normalizeTo100(lastScore, minScore, maxScore);

    const byDay: Record<string, { score: number; count: number }> = {};
    points.forEach((p) => {
      const day = new Date(p.date).getDay();
      byDay[day] = byDay[day] || { score: 0, count: 0 };
      byDay[day].score += p.productivityScore;
      byDay[day].count += 1;
    });
    const weekdayMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const mostProductiveDays = Object.entries(byDay)
      .map(([k, v]) => ({ day: weekdayMap[Number(k)], avg: v.score / Math.max(1, v.count) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map((x) => x.day);

    // Simple heuristic for best working hours based on focus minutes trend (placeholder)
    const bestWorkingHours = ['09:00-11:00', '14:00-16:00'];

    // Local recommendations
    const recommendations: ProductivityInsight[] = [];
    const recent = points.slice(-7);
    const avgFocus = recent.reduce((s, p) => s + p.focusMinutes, 0) / Math.max(1, recent.length);
    if (avgFocus < 60) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        type: 'schedule',
        title: 'Pouco tempo de foco recente',
        description: 'Reserve sessões de foco de 25min com pausas curtas (técnica Pomodoro).',
        priority: 'high',
        expectedImpact: 12,
        createdAt: new Date().toISOString(),
      });
    }
    const avgHabits = recent.reduce((s, p) => s + p.habitsScore, 0) / Math.max(1, recent.length);
    if (avgHabits < 60) {
      recommendations.push({
        id: `rec-${Date.now()}-2`,
        type: 'habits',
        title: 'Consistência de hábitos baixa',
        description: 'Reforce hábitos-chave como sono, hidratação e pausas planejadas.',
        priority: 'medium',
        expectedImpact: 10,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      score,
      trend,
      patterns: {
        bestWorkingHours,
        mostProductiveDays,
        commonDistractions: [],
      },
      recommendations,
    };
  }

  async analyzeWithML(payload?: any): Promise<AnalysisResult> {
    const store = useProductivity.getState();
    const data = payload ?? { points: store.getDataPoints(30) };
    const ml = await mlOptimizationService.analyzeProductivity(data);
    const insights: ProductivityInsight[] = ml.recommendations.map((r, idx) => ({
      id: `ml-${Date.now()}-${idx}`,
      type: r.type,
      title: 'Recomendação de Produtividade',
      description: r.description,
      priority: r.priority,
      expectedImpact: r.expectedImpact,
      createdAt: new Date().toISOString(),
    }));
    return {
      score: ml.score,
      trend: {
        dates: Array.from({ length: ml.trends.productivityScore.length }, (_, i) => i.toString()),
        tasksCompleted: ml.trends.tasksCompleted,
        focusMinutes: ml.trends.focusTime,
        habitsScore: ml.trends.habitConsistency,
        productivityScore: ml.trends.productivityScore,
      },
      patterns: ml.patterns,
      recommendations: insights,
    };
  }
}

export const productivityAnalysisService = new ProductivityAnalysisService();

import { ProductivityMetric, ProductivityInsight, ProductivitySession } from '../store/productivity';

export class ProductivityAnalysisService {
  /**
   * Analisa tendências de produtividade baseadas em métricas
   */
  static analyzeTrends(metrics: ProductivityMetric[], days: number = 30): {
    tasksTrend: number;
    focusTrend: number;
    habitsTrend: number;
    productivityTrend: number;
  } {
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const periodMetrics = metrics.filter(m => m.date >= periodStart);
    const midPoint = new Date(periodStart.getTime() + (days / 2) * 24 * 60 * 60 * 1000);

    const firstHalf = periodMetrics.filter(m => m.date < midPoint);
    const secondHalf = periodMetrics.filter(m => m.date >= midPoint);

    const calculateAverage = (metrics: ProductivityMetric[], type: string) => {
      const filtered = metrics.filter(m => m.type === type);
      if (filtered.length === 0) return 0;
      return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
    };

    const firstTasks = calculateAverage(firstHalf, 'tasks_completed');
    const secondTasks = calculateAverage(secondHalf, 'tasks_completed');
    const firstFocus = calculateAverage(firstHalf, 'focus_time');
    const secondFocus = calculateAverage(secondHalf, 'focus_time');
    const firstHabits = calculateAverage(firstHalf, 'habits_completed');
    const secondHabits = calculateAverage(secondHalf, 'habits_completed');

    return {
      tasksTrend: firstTasks > 0 ? ((secondTasks - firstTasks) / firstTasks) * 100 : 0,
      focusTrend: firstFocus > 0 ? ((secondFocus - firstFocus) / firstFocus) * 100 : 0,
      habitsTrend: firstHabits > 0 ? ((secondHabits - firstHabits) / firstHabits) * 100 : 0,
      productivityTrend: this.calculateProductivityTrend(periodMetrics),
    };
  }

  /**
   * Calcula tendência geral de produtividade
   */
  private static calculateProductivityTrend(metrics: ProductivityMetric[]): number {
    const dailyScores = new Map<string, number>();

    // Agrupar métricas por dia
    metrics.forEach(metric => {
      const dateKey = metric.date.toISOString().split('T')[0];
      if (!dailyScores.has(dateKey)) {
        dailyScores.set(dateKey, 0);
      }

      // Calcular pontuação baseada no tipo de métrica
      let score = 0;
      switch (metric.type) {
        case 'tasks_completed':
          score = metric.value * 10;
          break;
        case 'focus_time':
          score = Math.min(metric.value / 3, 35); // 30min = 35 pontos
          break;
        case 'habits_completed':
          score = metric.value * 5;
          break;
      }

      dailyScores.set(dateKey, dailyScores.get(dateKey)! + score);
    });

    // Calcular tendência
    const scores = Array.from(dailyScores.values());
    if (scores.length < 2) return 0;

    const midPoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midPoint);
    const secondHalf = scores.slice(midPoint);

    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  /**
   * Identifica padrões de produtividade
   */
  static identifyPatterns(metrics: ProductivityMetric[], sessions: ProductivitySession[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];

    // Padrão: Horários de pico de produtividade
    const peakHoursPattern = this.analyzePeakHours(metrics);
    if (peakHoursPattern) {
      insights.push(peakHoursPattern);
    }

    // Padrão: Correlação entre foco e tarefas
    const focusTaskCorrelation = this.analyzeFocusTaskCorrelation(metrics);
    if (focusTaskCorrelation) {
      insights.push(focusTaskCorrelation);
    }

    // Padrão: Sequências de produtividade
    const productivityStreaks = this.analyzeProductivityStreaks(metrics);
    if (productivityStreaks) {
      insights.push(productivityStreaks);
    }

    return insights;
  }

  /**
   * Analisa horários de pico de produtividade
   */
  private static analyzePeakHours(metrics: ProductivityMetric[]): ProductivityInsight | null {
    const hourlyProductivity = new Map<number, number>();

    metrics.forEach(metric => {
      const hour = metric.date.getHours();
      const productivity = this.calculateMetricProductivity(metric);

      if (!hourlyProductivity.has(hour)) {
        hourlyProductivity.set(hour, 0);
      }
      hourlyProductivity.set(hour, hourlyProductivity.get(hour)! + productivity);
    });

    if (hourlyProductivity.size === 0) return null;

    // Encontrar horário com maior produtividade
    let peakHour = 0;
    let maxProductivity = 0;

    hourlyProductivity.forEach((productivity, hour) => {
      if (productivity > maxProductivity) {
        maxProductivity = productivity;
        peakHour = hour;
      }
    });

    return {
      id: `pattern-peak-hours-${Date.now()}`,
      type: 'pattern',
      title: 'Horário de Pico de Produtividade',
      description: `Você é mais produtivo entre ${peakHour}:00 e ${peakHour + 1}:00`,
      severity: 'low',
      category: 'productivity',
      data: { peakHour, productivity: maxProductivity },
      generatedAt: new Date(),
      isRead: false,
    };
  }

  /**
   * Analisa correlação entre foco e conclusão de tarefas
   */
  private static analyzeFocusTaskCorrelation(metrics: ProductivityMetric[]): ProductivityInsight | null {
    const focusMetrics = metrics.filter(m => m.type === 'focus_time');
    const taskMetrics = metrics.filter(m => m.type === 'tasks_completed');

    if (focusMetrics.length === 0 || taskMetrics.length === 0) return null;

    // Calcular correlação simples
    const focusAvg = focusMetrics.reduce((sum, m) => sum + m.value, 0) / focusMetrics.length;
    const taskAvg = taskMetrics.reduce((sum, m) => sum + m.value, 0) / taskMetrics.length;

    // Dias com foco acima da média e tarefas acima da média
    const highFocusHighTaskDays = metrics.filter(m => {
      if (m.type === 'focus_time' && m.value > focusAvg) {
        const dayTasks = taskMetrics.find(t =>
          t.date.toDateString() === m.date.toDateString()
        );
        return dayTasks && dayTasks.value > taskAvg;
      }
      return false;
    }).length;

    const correlation = (highFocusHighTaskDays / Math.min(focusMetrics.length, taskMetrics.length)) * 100;

    if (correlation > 60) {
      return {
        id: `pattern-focus-task-${Date.now()}`,
        type: 'pattern',
        title: 'Correlação Foco x Tarefas',
        description: `Dias com mais tempo de foco tendem a ter ${correlation.toFixed(0)}% mais tarefas concluídas`,
        severity: 'medium',
        category: 'focus',
        data: { correlation, focusAvg, taskAvg },
        generatedAt: new Date(),
        isRead: false,
      };
    }

    return null;
  }

  /**
   * Analisa sequências de produtividade
   */
  private static analyzeProductivityStreaks(metrics: ProductivityMetric[]): ProductivityInsight | null {
    const dailyProductivity = new Map<string, number>();

    // Calcular produtividade diária
    metrics.forEach(metric => {
      const dateKey = metric.date.toISOString().split('T')[0];
      if (!dailyProductivity.has(dateKey)) {
        dailyProductivity.set(dateKey, 0);
      }
      dailyProductivity.set(dateKey, dailyProductivity.get(dateKey)! + this.calculateMetricProductivity(metric));
    });

    // Encontrar sequências
    const dates = Array.from(dailyProductivity.keys()).sort();
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < dates.length; i++) {
      const productivity = dailyProductivity.get(dates[i]) || 0;
      if (productivity > 50) { // Considera produtivo se score > 50
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    if (maxStreak >= 5) {
      return {
        id: `pattern-streaks-${Date.now()}`,
        type: 'pattern',
        title: 'Sequências de Produtividade',
        description: `Sua maior sequência de dias produtivos foi de ${maxStreak} dias`,
        severity: 'low',
        category: 'consistency',
        data: { maxStreak, currentStreak },
        generatedAt: new Date(),
        isRead: false,
      };
    }

    return null;
  }

  /**
   * Calcula produtividade de uma métrica individual
   */
  private static calculateMetricProductivity(metric: ProductivityMetric): number {
    switch (metric.type) {
      case 'tasks_completed':
        return Math.min(metric.value * 10, 40);
      case 'focus_time':
        return Math.min(metric.value / 3, 35);
      case 'habits_completed':
        return Math.min(metric.value * 5, 25);
      default:
        return 0;
    }
  }

  /**
   * Gera recomendações personalizadas baseadas na análise
   */
  static generateRecommendations(
    metrics: ProductivityMetric[],
    sessions: ProductivitySession[],
    stats: any
  ): string[] {
    const recommendations: string[] = [];

    // Recomendação baseada em foco
    if (stats.today.focusTime < 60) {
      recommendations.push('Considere aumentar seu tempo de foco diário para melhorar a produtividade');
    }

    // Recomendação baseada em tarefas
    if (stats.week.tasksCompleted < 10) {
      recommendations.push('Tente estabelecer metas diárias menores para manter a consistência');
    }

    // Recomendação baseada em hábitos
    if (stats.month.habitsCompleted < 15) {
      recommendations.push('Foque em manter 2-3 hábitos principais antes de adicionar novos');
    }

    // Recomendação baseada em padrões de sessão
    const focusSessions = sessions.filter(s => s.type === 'focus');
    if (focusSessions.length > 0) {
      const avgSessionLength = focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length;
      if (avgSessionLength < 25) {
        recommendations.push('Suas sessões de foco são curtas. Considere usar a técnica Pomodoro (25 minutos)');
      }
    }

    // Recomendação baseada em tendências
    const trends = this.analyzeTrends(metrics, 7);
    if (trends.productivityTrend < -10) {
      recommendations.push('Sua produtividade está diminuindo. Considere revisar sua rotina e identificar obstáculos');
    }

    return recommendations;
  }

  /**
   * Calcula estatísticas avançadas de produtividade
   */
  static calculateAdvancedStats(metrics: ProductivityMetric[], sessions: ProductivitySession[]) {
    const stats = {
      averageSessionLength: 0,
      mostProductiveDayOfWeek: 0,
      productivityByHour: new Map<number, number>(),
      weeklyConsistency: 0,
      focusEfficiency: 0,
      taskCompletionRate: 0,
    };

    // Calcular duração média das sessões
    if (sessions.length > 0) {
      stats.averageSessionLength = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    }

    // Calcular dia da semana mais produtivo
    const productivityByDay = new Map<number, number>();
    metrics.forEach(metric => {
      const dayOfWeek = metric.date.getDay();
      const productivity = this.calculateMetricProductivity(metric);

      if (!productivityByDay.has(dayOfWeek)) {
        productivityByDay.set(dayOfWeek, 0);
      }
      productivityByDay.set(dayOfWeek, productivityByDay.get(dayOfWeek)! + productivity);
    });

    let maxProductivity = 0;
    productivityByDay.forEach((productivity, day) => {
      if (productivity > maxProductivity) {
        maxProductivity = productivity;
        stats.mostProductiveDayOfWeek = day;
      }
    });

    // Calcular produtividade por hora
    metrics.forEach(metric => {
      const hour = metric.date.getHours();
      const productivity = this.calculateMetricProductivity(metric);

      if (!stats.productivityByHour.has(hour)) {
        stats.productivityByHour.set(hour, 0);
      }
      stats.productivityByHour.set(hour, stats.productivityByHour.get(hour)! + productivity);
    });

    return stats;
  }
}
