import { useMemo } from 'react';
import { useProductivity, ProductivityPeriod } from '../../store/productivity';

export function useProductivityReports(period: ProductivityPeriod = 'weekly') {
  const { getReports, generateReport } = useProductivity();

  const reports = getReports(period);
  const latest = useMemo(() => reports[0] ?? null, [reports.length]);

  const generate = (startDate: Date, endDate: Date) => generateReport(period, startDate, endDate);

  return { reports, latest, generate };
}

