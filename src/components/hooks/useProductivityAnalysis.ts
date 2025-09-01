import { useEffect, useState } from 'react';
import { useProductivity } from '../../store/productivity';
import { productivityAnalysisService, AnalysisResult } from '../../services/productivityAnalysis';

export function useProductivityAnalysis(options?: { useML?: boolean; days?: number }) {
  const { getDataPoints, setInsights } = useProductivity();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        if (options?.useML) {
          const ml = await productivityAnalysisService.analyzeWithML();
          if (!mounted) return;
          setResult(ml);
          setInsights(ml.recommendations);
        } else {
          const points = getDataPoints(options?.days ?? 30);
          const local = productivityAnalysisService.analyzeLocal(points);
          if (!mounted) return;
          setResult(local);
          setInsights(local.recommendations);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to analyze productivity');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [options?.useML, options?.days]);

  return { result, loading, error };
}

