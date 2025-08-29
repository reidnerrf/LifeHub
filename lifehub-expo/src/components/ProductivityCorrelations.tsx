import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useHabits } from '../store/habits';

const { width } = Dimensions.get('window');

interface ProductivityCorrelationsProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProductivityCorrelations({ visible, onClose }: ProductivityCorrelationsProps) {
  const t = useTheme();
  const { 
    getProductivityCorrelation, 
    getWellnessTrends, 
    getCompletionRate,
    getStreakStats 
  } = useHabits();

  const correlation = getProductivityCorrelation(7);
  const wellnessTrends = getWellnessTrends(7);
  const completionRate = getCompletionRate('week');
  const streakStats = getStreakStats();

  const getCorrelationStrength = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return { strength: 'Forte', color: t.success };
    if (absValue >= 0.4) return { strength: 'Moderada', color: t.warning };
    if (absValue >= 0.2) return { strength: 'Fraca', color: t.textLight };
    return { strength: 'Muito Fraca', color: t.textLight };
  };

  const getCorrelationDirection = (value: number) => {
    if (value > 0) return { direction: 'Positiva', icon: 'trending-up', color: t.success };
    if (value < 0) return { direction: 'Negativa', icon: 'trending-down', color: t.error };
    return { direction: 'Neutra', icon: 'remove', color: t.textLight };
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getAverage = (array: number[]) => {
    if (array.length === 0) return 0;
    return array.reduce((sum, value) => sum + value, 0) / array.length;
  };

  const correlationInfo = getCorrelationStrength(correlation.correlation);
  const directionInfo = getCorrelationDirection(correlation.correlation);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Correlações com Produtividade
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textLight }]}>
            Últimos 7 dias
          </Text>
        </View>

        {/* Main Correlation Card */}
        <View style={[styles.correlationCard, { backgroundColor: t.card }]}>
          <View style={styles.correlationHeader}>
            <Ionicons name="analytics" size={24} color={t.primary} />
            <Text style={[styles.correlationTitle, { color: t.text }]}>
              Hábitos x Produtividade
            </Text>
          </View>

          <View style={styles.correlationValue}>
            <Text style={[styles.correlationNumber, { color: t.primary }]}>
              {formatPercentage(correlation.correlation)}
            </Text>
            <View style={styles.correlationInfo}>
              <View style={styles.correlationItem}>
                <Ionicons name={directionInfo.icon} size={16} color={directionInfo.color} />
                <Text style={[styles.correlationLabel, { color: t.textLight }]}>
                  {directionInfo.direction}
                </Text>
              </View>
              <View style={styles.correlationItem}>
                <View style={[styles.strengthIndicator, { backgroundColor: correlationInfo.color }]} />
                <Text style={[styles.correlationLabel, { color: t.textLight }]}>
                  {correlationInfo.strength}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.correlationDescription, { color: t.textLight }]}>
            {correlation.correlation > 0 
              ? 'Quanto mais hábitos você completa, mais produtivo você tende a ser.'
              : correlation.correlation < 0
              ? 'Há uma relação inversa entre hábitos e produtividade.'
              : 'Não há correlação significativa entre hábitos e produtividade.'
            }
          </Text>
        </View>

        {/* Wellness Metrics */}
        <View style={[styles.wellnessCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>
            Métricas de Bem-estar
          </Text>

          <View style={styles.wellnessGrid}>
            <View style={styles.wellnessItem}>
              <View style={styles.wellnessIcon}>
                <Ionicons name="heart" size={20} color="#FF6B6B" />
              </View>
              <Text style={[styles.wellnessValue, { color: t.text }]}>
                {getAverage(wellnessTrends.mood).toFixed(1)}
              </Text>
              <Text style={[styles.wellnessLabel, { color: t.textLight }]}>
                Humor (1-5)
              </Text>
            </View>

            <View style={styles.wellnessItem}>
              <View style={styles.wellnessIcon}>
                <Ionicons name="flash" size={20} color="#FFD93D" />
              </View>
              <Text style={[styles.wellnessValue, { color: t.text }]}>
                {getAverage(wellnessTrends.energy).toFixed(1)}
              </Text>
              <Text style={[styles.wellnessLabel, { color: t.textLight }]}>
                Energia (1-5)
              </Text>
            </View>

            <View style={styles.wellnessItem}>
              <View style={styles.wellnessIcon}>
                <Ionicons name="moon" size={20} color="#6C5CE7" />
              </View>
              <Text style={[styles.wellnessValue, { color: t.text }]}>
                {getAverage(wellnessTrends.sleep).toFixed(1)}h
              </Text>
              <Text style={[styles.wellnessLabel, { color: t.textLight }]}>
                Sono Média
              </Text>
            </View>
          </View>
        </View>

        {/* Habit Performance */}
        <View style={[styles.performanceCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>
            Performance dos Hábitos
          </Text>

          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <Ionicons name="checkmark-circle" size={20} color={t.success} />
              </View>
              <Text style={[styles.performanceValue, { color: t.text }]}>
                {completionRate}%
              </Text>
              <Text style={[styles.performanceLabel, { color: t.textLight }]}>
                Taxa de Conclusão
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <Ionicons name="flame" size={20} color="#FF9500" />
              </View>
              <Text style={[styles.performanceValue, { color: t.text }]}>
                {streakStats.current}
              </Text>
              <Text style={[styles.performanceLabel, { color: t.textLight }]}>
                Sequência Atual
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
              </View>
              <Text style={[styles.performanceValue, { color: t.text }]}>
                {streakStats.longest}
              </Text>
              <Text style={[styles.performanceLabel, { color: t.textLight }]}>
                Maior Sequência
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Trend Chart */}
        <View style={[styles.trendCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>
            Tendência Semanal
          </Text>

          <View style={styles.chartContainer}>
            {correlation.data.map((day, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartBars}>
                  <View 
                    style={[
                      styles.habitsBar, 
                      { 
                        height: day.habitsScore * 0.8,
                        backgroundColor: t.primary 
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.productivityBar, 
                      { 
                        height: day.productivity * 0.8,
                        backgroundColor: t.success 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.chartLabel, { color: t.textLight }]}>
                  D{index + 1}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: t.primary }]} />
              <Text style={[styles.legendText, { color: t.textLight }]}>
                Hábitos
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: t.success }]} />
              <Text style={[styles.legendText, { color: t.textLight }]}>
                Produtividade
              </Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={[styles.insightsCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>
            💡 Insights
          </Text>

          <View style={styles.insightItem}>
            <Ionicons name="bulb" size={16} color={t.primary} />
            <Text style={[styles.insightText, { color: t.textLight }]}>
              {correlation.correlation > 0.5 
                ? 'Excelente! Seus hábitos estão fortemente relacionados à produtividade.'
                : correlation.correlation > 0.2
                ? 'Boa relação entre hábitos e produtividade. Continue assim!'
                : 'Considere ajustar seus hábitos para melhorar a produtividade.'
              }
            </Text>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={16} color={t.success} />
            <Text style={[styles.insightText, { color: t.textLight }]}>
              {getAverage(wellnessTrends.mood) > 3.5 
                ? 'Seu humor está positivo, o que pode estar impulsionando a produtividade.'
                : 'Considere atividades que melhorem seu humor para aumentar a produtividade.'
              }
            </Text>
          </View>

          <View style={styles.insightItem}>
            <Ionicons name="bed" size={16} color="#6C5CE7" />
            <Text style={[styles.insightText, { color: t.textLight }]}>
              {getAverage(wellnessTrends.sleep) >= 7 
                ? 'Sua rotina de sono está adequada para manter a produtividade.'
                : 'Tente dormir mais para melhorar sua produtividade diária.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  correlationCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  correlationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  correlationValue: {
    alignItems: 'center',
    marginBottom: 16,
  },
  correlationNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correlationInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  correlationLabel: {
    fontSize: 12,
  },
  strengthIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  correlationDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  wellnessCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  wellnessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wellnessItem: {
    alignItems: 'center',
    flex: 1,
  },
  wellnessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  wellnessValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  wellnessLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  performanceCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  trendCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  habitsBar: {
    width: 8,
    borderRadius: 4,
  },
  productivityBar: {
    width: 8,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
  },
  insightsCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});