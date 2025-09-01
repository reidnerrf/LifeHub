import { useMemo } from 'react';
import { useProductivity } from '../../store/productivity';

export function useProductivityData(days: number = 30) {
  const { getDataPoints, getTrend, getStats } = useProductivity();

  const points = getDataPoints(days);
  const trend = useMemo(() => getTrend(days), [days, points.length]);
  const stats = useMemo(() => getStats(), [points.length]);

  return { points, trend, stats };
}

