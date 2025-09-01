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

