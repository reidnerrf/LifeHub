import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService } from '../services/reportService';
import { ProductivityReport } from '../store/productivity';

// Mock URL and document for download functionality
const mockCreateObjectURL = vi.fn(() => 'mock-url');
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

Object.defineProperty(window, 'document', {
  value: {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

describe('ReportService', () => {
  let reportService: ReportService;
  let mockReport: ProductivityReport;

  beforeEach(() => {
    reportService = new ReportService();
    mockReport = {
      id: 'test-report',
      title: 'Test Report',
      type: 'weekly',
      period: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-07'),
      },
      summary: {
        totalTasks: 10,
        totalFocusTime: 300,
        totalHabits: 5,
        averageProductivity: 75,
        bestDay: new Date('2024-01-03'),
        worstDay: new Date('2024-01-01'),
      },
      trends: {
        tasksTrend: 15.5,
        focusTrend: -5.2,
        habitsTrend: 8.3,
        productivityTrend: 12.1,
      },
      insights: [],
      recommendations: ['Test recommendation'],
      generatedAt: new Date(),
    };
  });

  it('should convert report to CSV format', () => {
    const csv = reportService.toCSV(mockReport as any);
    expect(csv).toContain('period,startDate,endDate');
    expect(csv).toContain('weekly');
    expect(csv).toContain('10');
    expect(csv).toContain('300');
  });

  it('should convert report to JSON format', () => {
    const json = reportService.toJSON(mockReport);
    expect(json).toContain('"id": "test-report"');
    expect(json).toContain('"title": "Test Report"');
  });

  it('should download file with correct parameters', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    (document.createElement as any).mockReturnValue(mockAnchor);

    reportService.download('test.csv', 'content', 'text/csv');

    expect(mockAnchor.download).toBe('test.csv');
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('should export report as CSV', () => {
    reportService.exportCSV(mockReport);
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should export report as JSON', () => {
    reportService.exportJSON(mockReport);
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should handle download in non-browser environment', () => {
    // Mock non-browser environment
    const originalWindow = global.window;
    (global as any).window = undefined;

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    reportService.download('test.csv', 'content', 'text/csv');

    expect(consoleSpy).toHaveBeenCalledWith('Export not supported in this environment.');

    // Restore window
    (global as any).window = originalWindow;
    consoleSpy.mockRestore();
  });
});
