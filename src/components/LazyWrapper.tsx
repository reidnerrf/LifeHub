import React, { ComponentType, lazy, Suspense, ReactNode } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

interface LazyWrapperState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends React.Component<LazyWrapperProps, LazyWrapperState> {
  constructor(props: LazyWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LazyWrapperState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.errorFallback || (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar componente
          </Text>
          <Text style={styles.errorSubtext}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback
}) => {
  const theme = useTheme();

  const defaultFallback = fallback || (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.textLight }]}>
        Carregando...
      </Text>
    </View>
  );

  return (
    <LazyErrorBoundary errorFallback={errorFallback}>
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
};

// Utility function to create lazy components with retry logic
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode,
  retries: number = 3
): React.ComponentType<React.ComponentProps<T>> => {
  const LazyComponent = lazy(() =>
    importFunc().catch((error) => {
      if (retries > 0) {
        console.warn(`Lazy loading failed, retrying... (${retries} retries left)`);
        return createLazyComponent(importFunc, fallback, retries - 1) as any;
      }
      throw error;
    })
  );

  return (props: React.ComponentProps<T>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

// Hook for lazy loading with manual trigger
export const useLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  const [Component, setComponent] = React.useState<React.ComponentType<React.ComponentProps<T>> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    if (Component || loading) return;

    setLoading(true);
    setError(null);

    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [Component, loading, importFunc]);

  const reset = React.useCallback(() => {
    setComponent(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    Component,
    loading,
    error,
    loadComponent,
    reset,
  };
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default LazyWrapper;
