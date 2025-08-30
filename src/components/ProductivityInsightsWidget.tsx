import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAssistant } from '../store/assistant';

interface ProductivityInsightsWidgetProps {
  onPress?: () => void;
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

export default function ProductivityInsightsWidget({ onPress }: ProductivityInsightsWidgetProps) {
  const t = useTheme();
  const { analyzeProductivity } = useAssistant();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const analysis = analyzeProductivity(7); // Last 7 days

      // Transform analysis data into insights
      const productivityInsights: InsightItem[] = [
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

      setInsights(productivityInsights);
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
    return (
      <View style={[styles.container, { backgroundColor: t.card }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="analytics" size={20} color={t.primary} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>Insights de Produtividade</Text>
        </View>
        <View style={styles.loadingState}>
          <Ionicons name="analytics" size={32} color={t.textLight} />
          <Text style={[styles.loadingText, { color: t.textLight }]}>
            Analisando dados...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: t.card }]}
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
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightItem}>
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
            </View>
          ))}
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
          Baseado nos últimos 7 dias
        </Text>
      </View>
    </TouchableOpacity>
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
