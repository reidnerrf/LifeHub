import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAssistant } from '../store/assistant';

interface ProductivityInsightsWidgetProps {
  onPress?: () => void;
  config?: ProductivityInsightsConfig;
}

interface ProductivityInsightsConfig {
  timePeriod: number; // days
  showAnimations: boolean;
  refreshInterval: number; // minutes
  insightTypes: ('productivity' | 'health' | 'learning' | 'social')[];
}

interface InsightItem {
  id: string;
  type: 'productivity' | 'health' | 'learning' | 'social';
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export default function ProductivityInsightsWidget({ onPress, config }: ProductivityInsightsWidgetProps) {
  const t = useTheme();
  const { analyzeProductivity } = useAssistant();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default configuration
  const defaultConfig: ProductivityInsightsConfig = {
    timePeriod: 7,
    showAnimations: true,
    refreshInterval: 30,
    insightTypes: ['productivity', 'health', 'learning', 'social'],
  };

  const widgetConfig = config || defaultConfig;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const itemAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    loadInsights();
  }, []);

  // Auto-refresh based on configuration
  useEffect(() => {
    if (widgetConfig.refreshInterval > 0) {
      const interval = setInterval(() => {
        loadInsights();
      }, widgetConfig.refreshInterval * 60 * 1000); // Convert minutes to milliseconds

      return () => clearInterval(interval);
    }
  }, [widgetConfig.refreshInterval]);

  useEffect(() => {
    if (!isLoading && insights.length > 0) {
      if (widgetConfig.showAnimations) {
        // Animate widget entrance
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();

        // Animate items sequentially
        insights.forEach((insight, index) => {
          if (!itemAnimations[insight.id]) {
            itemAnimations[insight.id] = new Animated.Value(0);
          }
          Animated.timing(itemAnimations[insight.id], {
            toValue: 1,
            duration: 300,
            delay: index * 100,
            useNativeDriver: true,
          }).start();
        });
      } else {
        // Set animations to final state without animation
        fadeAnim.setValue(1);
        scaleAnim.setValue(1);
        insights.forEach((insight) => {
          if (!itemAnimations[insight.id]) {
            itemAnimations[insight.id] = new Animated.Value(1);
          } else {
            itemAnimations[insight.id].setValue(1);
          }
        });
      }
    }
  }, [isLoading, insights, widgetConfig.showAnimations]);

  // Loading spinner animation
  useEffect(() => {
    if (isLoading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isLoading]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const analysis = analyzeProductivity(widgetConfig.timePeriod);

      // Transform analysis data into insights
      const allInsights: InsightItem[] = [
        {
          id: 'productivity-score',
          type: 'productivity',
          title: 'Pontuação de Produtividade',
          value: `${analysis.score}/100`,
          trend: analysis.score > 75 ? 'up' : analysis.score < 60 ? 'down' : 'stable',
          icon: 'trending-up',
          color: analysis.score > 75 ? t.success : analysis.score < 60 ? t.error : t.warning,
        },
        {
          id: 'tasks-completed',
          type: 'productivity',
          title: 'Tarefas Concluídas',
          value: `${analysis.trends.tasks.reduce((a, b) => a + b, 0)}`,
          trend: 'up',
          icon: 'checkmark-circle',
          color: t.primary,
        },
        {
          id: 'focus-time',
          type: 'productivity',
          title: 'Tempo de Foco',
          value: `${Math.round(analysis.trends.focus.reduce((a, b) => a + b, 0) / 60)}h`,
          trend: 'up',
          icon: 'timer',
          color: t.secondary,
        },
        {
          id: 'habits-streak',
          type: 'health',
          title: 'Sequência de Hábitos',
          value: `${Math.max(...analysis.trends.habits)}`,
          trend: 'stable',
          icon: 'flame',
          color: t.warning,
        },
      ];

      // Filter insights based on configuration
      const filteredInsights = allInsights.filter(insight =>
        widgetConfig.insightTypes.includes(insight.type)
      );

      setInsights(filteredInsights);
    } catch (error) {
      console.error('Failed to load productivity insights:', error);
      // Fallback insights
      setInsights([
        {
          id: 'fallback-1',
          type: 'productivity',
          title: 'Análise Indisponível',
          value: '--',
          trend: 'stable',
          icon: 'analytics',
          color: t.textLight,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return t.success;
      case 'down': return t.error;
      default: return t.textLight;
    }
  };

  if (isLoading) {
    const spin = spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={[styles.container, { backgroundColor: t.card }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={20} color={t.primary} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>Insights de Produtividade</Text>
        </View>
        <View style={styles.loadingState}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="analytics" size={32} color={t.primary} />
          </Animated.View>
          <Text style={[styles.loadingText, { color: t.textLight }]}>
            Analisando dados...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: t.card,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <TouchableOpacity
        style={styles.touchableContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={20} color={t.primary} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>Insights de Produtividade</Text>
          <Text style={[styles.count, { color: t.primary }]}>
            {insights.length}
          </Text>
        </View>

        {insights.length > 0 ? (
          <ScrollView style={styles.insightsList} showsVerticalScrollIndicator={false}>
            {insights.map((insight, index) => {
              const itemAnim = itemAnimations[insight.id] || new Animated.Value(1);
              const translateY = itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              });
              const itemOpacity = itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              });

              return (
                <Animated.View
                  key={insight.id}
                  style={[
                    styles.insightItem,
                    {
                      opacity: itemOpacity,
                      transform: [{ translateY }],
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.insightTouchable}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (widgetConfig.showAnimations) {
                        // Add micro-interaction feedback
                        const scaleAnim = new Animated.Value(1);
                        Animated.sequence([
                          Animated.timing(scaleAnim, {
                            toValue: 0.98,
                            duration: 100,
                            useNativeDriver: true,
                          }),
                          Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                          }),
                        ]).start();
                      }
                    }}
                  >
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIcon, { backgroundColor: insight.color + '20' }]}>
                        <Ionicons name={insight.icon as any} size={16} color={insight.color} />
                      </View>
                      <View style={styles.insightContent}>
                        <Text style={[styles.insightTitle, { color: t.text }]}>
                          {insight.title}
                        </Text>
                        <View style={styles.insightMeta}>
                          <Text style={[styles.insightValue, { color: insight.color }]}>
                            {insight.value}
                          </Text>
                          <View style={styles.trendContainer}>
                            <Ionicons
                              name={getTrendIcon(insight.trend) as any}
                              size={12}
                              color={getTrendColor(insight.trend)}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="analytics" size={32} color={t.textLight} />
            <Text style={[styles.emptyText, { color: t.textLight }]}>
              Dados insuficientes
            </Text>
            <Text style={[styles.emptySubtext, { color: t.textLight }]}>
              Complete mais atividades para ver insights
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: t.textLight }]}>
            Baseado nos últimos {widgetConfig.timePeriod} dias
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    maxHeight: 280,
  },
  touchableContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  insightsList: {
    flex: 1,
  },
  insightItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  insightTouchable: {
    flex: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendContainer: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
