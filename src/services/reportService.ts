import { ProductivityReport } from '../store/productivity';

export class ReportService {
  toCSV(report: ProductivityReport): string {
    const header = [
      'period',
      'startDate',
      'endDate',
      'tasksCompleted',
      'focusMinutes',
      'eventsCount',
      'tasksPerDay',
      'focusMinutesPerDay',
      'avgProductivityScore',
      'mostProductiveDay',
    ].join(',');

    const row = [
      report.period,
      report.startDate,
      report.endDate,
      report.totals.tasksCompleted,
      report.totals.focusMinutes,
      report.totals.eventsCount,
      report.averages.tasksPerDay.toFixed(2),
      report.averages.focusMinutesPerDay.toFixed(2),
      report.averages.productivityScore.toFixed(1),
      report.mostProductiveDay,
    ].join(',');

    const trendHeader = ['date', 'tasksCompleted', 'focusMinutes', 'habitsScore', 'productivityScore'].join(',');
    const trendRows = report.trend.dates
      .map((d, i) => [
        d,
        report.trend.tasksCompleted[i],
        report.trend.focusMinutes[i],
        report.trend.habitsScore[i],
        report.trend.productivityScore[i],
      ].join(','))
      .join('\n');

    return [header, row, '', trendHeader, trendRows].join('\n');
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
}

export const reportService = new ReportService();

