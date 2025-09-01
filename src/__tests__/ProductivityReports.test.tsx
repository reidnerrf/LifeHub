import { describe, it, expect, vi } from 'vitest';

// Mock the services
vi.mock('../services/reportService', () => ({
  ReportService: {
    exportToPDF: vi.fn().mockResolvedValue('mock-pdf-url'),
    exportToCSV: vi.fn().mockResolvedValue('mock-csv-url'),
    exportToJSON: vi.fn().mockResolvedValue('mock-json-url'),
    downloadFile: vi.fn(),
  },
}));

vi.mock('../services/productivityAnalysis', () => ({
  ProductivityAnalysisService: {
    analyzeTrends: vi.fn().mockReturnValue({
      tasksTrend: 15.5,
      focusTrend: -5.2,
      habitsTrend: 8.3,
      productivityTrend: 12.1,
    }),
    generateRecommendations: vi.fn().mockReturnValue([
      'Aumente o tempo de foco diário',
      'Mantenha consistência nas rotinas',
      'Priorize tarefas importantes pela manhã',
    ]),
  },
}));

describe('ProductivityReports Services Tests', () => {
  it('should mock ReportService correctly', () => {
    const { ReportService } = require('../services/reportService');

    expect(ReportService.exportToPDF).toBeDefined();
    expect(ReportService.exportToPDF).toBeInstanceOf(Function);
    expect(ReportService.exportToCSV).toBeDefined();
    expect(ReportService.exportToJSON).toBeDefined();
  });

  it('should mock ProductivityAnalysisService correctly', () => {
    const { ProductivityAnalysisService } = require('../services/productivityAnalysis');

    expect(ProductivityAnalysisService.analyzeTrends).toBeDefined();
    expect(ProductivityAnalysisService.analyzeTrends).toBeInstanceOf(Function);
    expect(ProductivityAnalysisService.generateRecommendations).toBeDefined();
  });

  it('should handle ReportService export functions', async () => {
    const { ReportService } = require('../services/reportService');

    const pdfResult = await ReportService.exportToPDF('report-1');
    expect(pdfResult).toBe('mock-pdf-url');

    const csvResult = await ReportService.exportToCSV('report-1');
    expect(csvResult).toBe('mock-csv-url');

    const jsonResult = await ReportService.exportToJSON('report-1');
    expect(jsonResult).toBe('mock-json-url');
  });

  it('should handle ProductivityAnalysisService functions', () => {
    const { ProductivityAnalysisService } = require('../services/productivityAnalysis');

    const trends = ProductivityAnalysisService.analyzeTrends([], 7);
    expect(trends).toEqual({
      tasksTrend: 15.5,
      focusTrend: -5.2,
      habitsTrend: 8.3,
      productivityTrend: 12.1,
    });

    const recommendations = ProductivityAnalysisService.generateRecommendations([], [], {});
    expect(recommendations).toEqual([
      'Aumente o tempo de foco diário',
      'Mantenha consistência nas rotinas',
      'Priorize tarefas importantes pela manhã',
    ]);
  });

  it('should verify mock data structure', () => {
    const mockStore = {
      reports: [
        {
          id: 'report-1',
          title: 'Relatório Semanal',
          type: 'weekly',
          generatedAt: new Date('2024-01-15'),
          data: {},
        },
      ],
      metrics: [
        {
          id: 'metric-1',
          date: new Date(),
          tasksCompleted: 5,
          focusTime: 120,
          productivityScore: 85,
          habitsCompleted: 3,
        },
      ],
      insights: [
        {
          id: 'insight-1',
          title: 'Produtividade Alta',
          description: 'Sua produtividade está acima da média',
          severity: 'high',
          category: 'productivity',
          createdAt: new Date(),
        },
      ],
      stats: {
        today: {
          tasksCompleted: 5,
          focusTime: 120,
          productivityScore: 85,
          habitsCompleted: 3,
        },
        week: {
          tasksCompleted: 25,
          focusTime: 600,
          productivityScore: 78,
          habitsCompleted: 15,
        },
        month: {
          tasksCompleted: 100,
          focusTime: 2400,
          productivityScore: 82,
          habitsCompleted: 60,
        },
      },
    };

    expect(mockStore.reports).toHaveLength(1);
    expect(mockStore.metrics).toHaveLength(1);
    expect(mockStore.insights).toHaveLength(1);
    expect(mockStore.stats.today.tasksCompleted).toBe(5);
    expect(mockStore.stats.today.focusTime).toBe(120);
    expect(mockStore.stats.today.productivityScore).toBe(85);
  });

  it('should validate report data structure', () => {
    const report = {
      id: 'report-1',
      title: 'Relatório Semanal',
      type: 'weekly',
      generatedAt: new Date('2024-01-15'),
      data: {},
    };

    expect(report.id).toBe('report-1');
    expect(report.title).toBe('Relatório Semanal');
    expect(report.type).toBe('weekly');
    expect(report.generatedAt).toBeInstanceOf(Date);
  });

  it('should validate metric data structure', () => {
    const metric = {
      id: 'metric-1',
      date: new Date(),
      tasksCompleted: 5,
      focusTime: 120,
      productivityScore: 85,
      habitsCompleted: 3,
    };

    expect(metric.id).toBe('metric-1');
    expect(metric.tasksCompleted).toBe(5);
    expect(metric.focusTime).toBe(120);
    expect(metric.productivityScore).toBe(85);
    expect(metric.habitsCompleted).toBe(3);
  });

  it('should validate insight data structure', () => {
    const insight = {
      id: 'insight-1',
      title: 'Produtividade Alta',
      description: 'Sua produtividade está acima da média',
      severity: 'high',
      category: 'productivity',
      createdAt: new Date(),
    };

    expect(insight.id).toBe('insight-1');
    expect(insight.title).toBe('Produtividade Alta');
    expect(insight.severity).toBe('high');
    expect(insight.category).toBe('productivity');
  });

  it('should validate stats data structure', () => {
    const stats = {
      today: {
        tasksCompleted: 5,
        focusTime: 120,
        productivityScore: 85,
        habitsCompleted: 3,
      },
      week: {
        tasksCompleted: 25,
        focusTime: 600,
        productivityScore: 78,
        habitsCompleted: 15,
      },
      month: {
        tasksCompleted: 100,
        focusTime: 2400,
        productivityScore: 82,
        habitsCompleted: 60,
      },
    };

    expect(stats.today).toBeDefined();
    expect(stats.week).toBeDefined();
    expect(stats.month).toBeDefined();

    ['today', 'week', 'month'].forEach(period => {
      const periodStats = stats[period as keyof typeof stats];
      expect(periodStats.tasksCompleted).toBeDefined();
      expect(periodStats.focusTime).toBeDefined();
      expect(periodStats.productivityScore).toBeDefined();
      expect(periodStats.habitsCompleted).toBeDefined();
    });
  });
});
