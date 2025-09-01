import { ProductivityReport, ProductivityMetric, ProductivityInsight } from '../store/productivity';
import { ProductivityAnalysisService } from './productivityAnalysis';

export class ReportService {
  // Instance methods for export functionality
  toCSV(report: ProductivityReport): string {
    const header = [
      'period',
      'startDate',
      'endDate',
      'totalTasks',
      'totalFocusTime',
      'totalHabits',
      'averageProductivity',
      'bestDay',
      'worstDay',
      'tasksTrend',
      'focusTrend',
      'habitsTrend',
      'productivityTrend',
    ].join(',');

    const row = [
      report.type,
      report.period.start.toISOString().split('T')[0],
      report.period.end.toISOString().split('T')[0],
      report.summary.totalTasks,
      report.summary.totalFocusTime,
      report.summary.totalHabits,
      report.summary.averageProductivity,
      report.summary.bestDay.toISOString().split('T')[0],
      report.summary.worstDay.toISOString().split('T')[0],
      report.trends.tasksTrend,
      report.trends.focusTrend,
      report.trends.habitsTrend,
      report.trends.productivityTrend,
    ].join(',');

    return [header, row].join('\n');
  }

  toJSON(report: ProductivityReport): string {
    return JSON.stringify(report, null, 2);
  }

  download(filename: string, content: string, mime: string): void {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('Export not supported in this environment.');
        return;
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
    }
  }

  exportCSV(report: ProductivityReport, filename?: string): void {
    const csv = this.toCSV(report);
    this.download(filename ?? `productivity-report-${report.period}.csv`, csv, 'text/csv;charset=utf-8;');
  }

  exportJSON(report: ProductivityReport, filename?: string): void {
    const json = this.toJSON(report);
    this.download(filename ?? `productivity-report-${report.period}.json`, json, 'application/json;charset=utf-8;');
  }

  /**
   * Gera relatório semanal de produtividade
   */
  static async generateWeeklyReport(
    metrics: ProductivityMetric[],
    insights: ProductivityInsight[],
    startDate?: Date,
    endDate?: Date
  ): Promise<ProductivityReport> {
    const period = this.getWeeklyPeriod(startDate, endDate);
    const periodMetrics = metrics.filter(m =>
      m.date >= period.start && m.date <= period.end
    );

    const summary = this.calculateSummary(periodMetrics, period);
    const trends = ProductivityAnalysisService.analyzeTrends(periodMetrics, 7);
    const recommendations = this.generateRecommendations(periodMetrics, summary);

    const report: ProductivityReport = {
      id: `report-weekly-${Date.now()}`,
      title: 'Relatório Semanal de Produtividade',
      type: 'weekly',
      period,
      summary,
      trends,
      insights: insights.filter(i =>
        i.generatedAt >= period.start && i.generatedAt <= period.end
      ),
      recommendations,
      generatedAt: new Date(),
    };

    return report;
  }

  /**
   * Gera relatório mensal de produtividade
   */
  static async generateMonthlyReport(
    metrics: ProductivityMetric[],
    insights: ProductivityInsight[],
    startDate?: Date,
    endDate?: Date
  ): Promise<ProductivityReport> {
    const period = this.getMonthlyPeriod(startDate, endDate);
    const periodMetrics = metrics.filter(m =>
      m.date >= period.start && m.date <= period.end
    );

    const summary = this.calculateSummary(periodMetrics, period);
    const trends = ProductivityAnalysisService.analyzeTrends(periodMetrics, 30);
    const recommendations = this.generateRecommendations(periodMetrics, summary);

    const report: ProductivityReport = {
      id: `report-monthly-${Date.now()}`,
      title: 'Relatório Mensal de Produtividade',
      type: 'monthly',
      period,
      summary,
      trends,
      insights: insights.filter(i =>
        i.generatedAt >= period.start && i.generatedAt <= period.end
      ),
      recommendations,
      generatedAt: new Date(),
    };

    return report;
  }

  /**
   * Gera relatório personalizado
   */
  static async generateCustomReport(
    metrics: ProductivityMetric[],
    insights: ProductivityInsight[],
    startDate: Date,
    endDate: Date
  ): Promise<ProductivityReport> {
    const period = { start: startDate, end: endDate };
    const periodMetrics = metrics.filter(m =>
      m.date >= period.start && m.date <= period.end
    );

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const summary = this.calculateSummary(periodMetrics, period);
    const trends = ProductivityAnalysisService.analyzeTrends(periodMetrics, days);
    const recommendations = this.generateRecommendations(periodMetrics, summary);

    const report: ProductivityReport = {
      id: `report-custom-${Date.now()}`,
      title: 'Relatório Personalizado de Produtividade',
      type: 'custom',
      period,
      summary,
      trends,
      insights: insights.filter(i =>
        i.generatedAt >= period.start && i.generatedAt <= period.end
      ),
      recommendations,
      generatedAt: new Date(),
    };

    return report;
  }

  /**
   * Calcula resumo do período
   */
  private static calculateSummary(metrics: ProductivityMetric[], period: { start: Date; end: Date }) {
    const totalTasks = metrics
      .filter(m => m.type === 'tasks_completed')
      .reduce((sum, m) => sum + m.value, 0);

    const totalFocusTime = metrics
      .filter(m => m.type === 'focus_time')
      .reduce((sum, m) => sum + m.value, 0);

    const totalHabits = metrics
      .filter(m => m.type === 'habits_completed')
      .reduce((sum, m) => sum + m.value, 0);

    // Calcular produtividade média
    const dailyProductivity = new Map<string, number>();
    metrics.forEach(metric => {
      const dateKey = metric.date.toISOString().split('T')[0];
      if (!dailyProductivity.has(dateKey)) {
        dailyProductivity.set(dateKey, 0);
      }
      const productivity = this.calculateMetricProductivity(metric);
      dailyProductivity.set(dateKey, dailyProductivity.get(dateKey)! + productivity);
    });

    const productivityScores = Array.from(dailyProductivity.values());
    const averageProductivity = productivityScores.length > 0
      ? productivityScores.reduce((sum, score) => sum + score, 0) / productivityScores.length
      : 0;

    // Encontrar melhor e pior dia
    let bestDay = period.start;
    let worstDay = period.start;
    let bestScore = -1;
    let worstScore = Infinity;

    dailyProductivity.forEach((score, dateStr) => {
      if (score > bestScore) {
        bestScore = score;
        bestDay = new Date(dateStr);
      }
      if (score < worstScore) {
        worstScore = score;
        worstDay = new Date(dateStr);
      }
    });

    return {
      totalTasks,
      totalFocusTime,
      totalHabits,
      averageProductivity: Math.round(averageProductivity),
      bestDay,
      worstDay,
    };
  }

  /**
   * Calcula produtividade de uma métrica
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
   * Gera recomendações baseadas nos dados
   */
  private static generateRecommendations(metrics: ProductivityMetric[], summary: any): string[] {
    const recommendations: string[] = [];

    if (summary.averageProductivity < 50) {
      recommendations.push('Considere aumentar seu tempo de foco diário para melhorar a produtividade geral');
    }

    if (summary.totalTasks < 20) {
      recommendations.push('Tente estabelecer metas mais ambiciosas para aumentar sua produtividade');
    }

    if (summary.totalFocusTime < 600) {
      recommendations.push('Aumente gradualmente seu tempo de foco semanal para melhores resultados');
    }

    if (summary.totalHabits < 10) {
      recommendations.push('Foque em manter hábitos consistentes para sustentar sua produtividade');
    }

    return recommendations;
  }

  /**
   * Obtém período semanal
   */
  private static getWeeklyPeriod(startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const now = new Date();
    const end = endDate || now;
    const start = startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    return { start, end };
  }

  /**
   * Obtém período mensal
   */
  private static getMonthlyPeriod(startDate?: Date, endDate?: Date): { start: Date; end: Date } {
    const now = new Date();
    const end = endDate || now;
    const start = startDate || new Date(end.getFullYear(), end.getMonth() - 1, end.getDate() + 1);

    return { start, end };
  }

  /**
   * Exporta relatório para PDF
   */
  static async exportToPDF(report: ProductivityReport): Promise<string> {
    // Simular geração de PDF
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pdfContent = this.generatePDFContent(report);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Em um ambiente real, você usaria uma biblioteca como jsPDF ou Puppeteer
    // Para este exemplo, retornamos uma URL simulada
    return url;
  }

  /**
   * Exporta relatório para CSV
   */
  static async exportToCSV(report: ProductivityReport): Promise<string> {
    const csvContent = this.generateCSVContent(report);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    return url;
  }

  /**
   * Exporta relatório para JSON
   */
  static async exportToJSON(report: ProductivityReport): Promise<string> {
    const jsonContent = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    return url;
  }

  /**
   * Gera conteúdo PDF (simulado)
   */
  private static generatePDFContent(report: ProductivityReport): string {
    return `
RELATÓRIO DE PRODUTIVIDADE
${report.title}

PERÍODO: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}

RESUMO:
- Total de Tarefas: ${report.summary.totalTasks}
- Tempo Total de Foco: ${report.summary.totalFocusTime} minutos
- Hábitos Completados: ${report.summary.totalHabits}
- Produtividade Média: ${report.summary.averageProductivity}%

TENDÊNCIAS:
- Tarefas: ${report.trends.tasksTrend > 0 ? '+' : ''}${report.trends.tasksTrend.toFixed(1)}%
- Foco: ${report.trends.focusTrend > 0 ? '+' : ''}${report.trends.focusTrend.toFixed(1)}%
- Hábitos: ${report.trends.habitsTrend > 0 ? '+' : ''}${report.trends.habitsTrend.toFixed(1)}%
- Produtividade Geral: ${report.trends.productivityTrend > 0 ? '+' : ''}${report.trends.productivityTrend.toFixed(1)}%

RECOMENDAÇÕES:
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

Gerado em: ${report.generatedAt.toLocaleString()}
    `.trim();
  }

  /**
   * Gera conteúdo CSV
   */
  private static generateCSVContent(report: ProductivityReport): string {
    const headers = ['Métrica', 'Valor', 'Unidade'];
    const rows = [
      ['Total de Tarefas', report.summary.totalTasks.toString(), 'tarefas'],
      ['Tempo Total de Foco', report.summary.totalFocusTime.toString(), 'minutos'],
      ['Hábitos Completados', report.summary.totalHabits.toString(), 'hábitos'],
      ['Produtividade Média', report.summary.averageProductivity.toString(), '%'],
      ['Tendência de Tarefas', `${report.trends.tasksTrend > 0 ? '+' : ''}${report.trends.tasksTrend.toFixed(1)}`, '%'],
      ['Tendência de Foco', `${report.trends.focusTrend > 0 ? '+' : ''}${report.trends.focusTrend.toFixed(1)}`, '%'],
      ['Tendência de Hábitos', `${report.trends.habitsTrend > 0 ? '+' : ''}${report.trends.habitsTrend.toFixed(1)}`, '%'],
      ['Tendência Geral', `${report.trends.productivityTrend > 0 ? '+' : ''}${report.trends.productivityTrend.toFixed(1)}`, '%'],
    ];

    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      csvRows.push(row.map(cell => `"${cell}"`).join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Baixa arquivo
   */
  static downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Formata relatório para exibição
   */
  static formatReportForDisplay(report: ProductivityReport): any {
    return {
      ...report,
      periodFormatted: `${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}`,
      summaryFormatted: {
        ...report.summary,
        bestDayFormatted: report.summary.bestDay.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        worstDayFormatted: report.summary.worstDay.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      },
      trendsFormatted: {
        tasksTrend: `${report.trends.tasksTrend > 0 ? '+' : ''}${report.trends.tasksTrend.toFixed(1)}%`,
        focusTrend: `${report.trends.focusTrend > 0 ? '+' : ''}${report.trends.focusTrend.toFixed(1)}%`,
        habitsTrend: `${report.trends.habitsTrend > 0 ? '+' : ''}${report.trends.habitsTrend.toFixed(1)}%`,
        productivityTrend: `${report.trends.productivityTrend > 0 ? '+' : ''}${report.trends.productivityTrend.toFixed(1)}%`,
      },
      generatedAtFormatted: report.generatedAt.toLocaleString('pt-BR'),
    };
  }
}
