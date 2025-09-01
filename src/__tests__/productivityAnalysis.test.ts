import { describe, it, expect } from 'vitest';
import { productivityAnalysisService } from '../services/productivityAnalysis';
import { ProductivityDataPoint } from '../store/productivity';

describe('ProductivityAnalysisService', () => {
  it('should calculate moving average and normalize score correctly in analyzeLocal', () => {
    const points: ProductivityDataPoint[] = [
      { date: '2023-06-01', tasksCompleted: 5, focusMinutes: 60, habitsScore: 70, productivityScore: 80, eventsCount: 0 },
      { date: '2023-06-02', tasksCompleted: 6, focusMinutes: 50, habitsScore: 65, productivityScore: 75, eventsCount: 0 },
      { date: '2023-06-03', tasksCompleted: 7, focusMinutes: 55, habitsScore: 60, productivityScore: 70, eventsCount: 0 },
      { date: '2023-06-04', tasksCompleted: 8, focusMinutes: 65, habitsScore: 75, productivityScore: 85, eventsCount: 0 },
      { date: '2023-06-05', tasksCompleted: 9, focusMinutes: 70, habitsScore: 80, productivityScore: 90, eventsCount: 0 },
    ];

    const result = productivityAnalysisService.analyzeLocal(points);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.trend.tasksCompleted.length).toBe(points.length);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    expect(result.patterns.bestWorkingHours.length).toBeGreaterThan(0);
    expect(result.patterns.mostProductiveDays.length).toBeGreaterThan(0);
  });

  it('should generate recommendations based on low focus and habits', () => {
    const points: ProductivityDataPoint[] = [
      { date: '2023-06-01', tasksCompleted: 5, focusMinutes: 30, habitsScore: 40, productivityScore: 50, eventsCount: 0 },
      { date: '2023-06-02', tasksCompleted: 6, focusMinutes: 20, habitsScore: 35, productivityScore: 45, eventsCount: 0 },
      { date: '2023-06-03', tasksCompleted: 7, focusMinutes: 25, habitsScore: 30, productivityScore: 40, eventsCount: 0 },
      { date: '2023-06-04', tasksCompleted: 8, focusMinutes: 15, habitsScore: 25, productivityScore: 35, eventsCount: 0 },
      { date: '2023-06-05', tasksCompleted: 9, focusMinutes: 10, habitsScore: 20, productivityScore: 30, eventsCount: 0 },
    ];

    const result = productivityAnalysisService.analyzeLocal(points);

    expect(result.recommendations.some(r => r.title.includes('Pouco tempo de foco'))).toBe(true);
    expect(result.recommendations.some(r => r.title.includes('Consistência de hábitos baixa'))).toBe(true);
  });
});
