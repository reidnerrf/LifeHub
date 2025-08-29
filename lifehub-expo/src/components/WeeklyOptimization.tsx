import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAssistant, OptimizationResult } from '../store/assistant';

const { width } = Dimensions.get('window');

interface WeeklyOptimizationProps {
  visible: boolean;
  onClose: () => void;
  planId?: string;
}

export default function WeeklyOptimization({ visible, onClose, planId }: WeeklyOptimizationProps) {
  const t = useTheme();
  const {
    weeklyPlans,
    optimizeWeeklyPlan,
    isOptimizing,
    addInsight,
  } = useAssistant();

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const currentPlan = planId ? weeklyPlans.find(p => p.id === planId) : null;

  const handleOptimize = async () => {
    if (!currentPlan) {
      Alert.alert('Erro', 'Nenhum plano selecionado para otimização');
      return;
    }

    try {
      const result = await optimizeWeeklyPlan(currentPlan.id);
      setOptimizationResult(result);
      setShowResults(true);
      
      // Adicionar insights baseados no resultado
      result.insights.forEach(insight => {
        addInsight({
          type: 'optimization',
          title: 'Otimização Aplicada',
          description: insight,
          priority: 'high',
          category: 'productivity',
          actionable: false,
        });
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao otimizar o plano semanal');
    }
  };

  const handleApplyOptimization = () => {
    Alert.alert(
      'Aplicar Otimização',
      'Deseja aplicar as mudanças sugeridas ao seu plano?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            setShowResults(false);
            setOptimizationResult(null);
            onClose();
            Alert.alert('Sucesso', 'Otimização aplicada com sucesso!');
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return t.success;
      case 'negative': return t.error;
      case 'neutral': return t.warning;
      default: return t.textLight;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return 'trending-up';
      case 'negative': return 'trending-down';
      case 'neutral': return 'remove';
      default: return 'help';
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modal, { backgroundColor: t.card }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>
            {showResults ? 'Otimização Concluída' : 'Otimizar Plano Semanal'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!showResults ? (
            /* Tela de Otimização */
            <View>
              {currentPlan ? (
                <View>
                  {/* Informações do Plano Atual */}
                  <View style={[styles.planInfo, { backgroundColor: t.background }]}>
                    <Text style={[styles.planTitle, { color: t.text }]}>
                      Plano da Semana
                    </Text>
                    <Text style={[styles.planDate, { color: t.textLight }]}>
                      {formatDate(currentPlan.weekStart)} - {formatDate(currentPlan.weekEnd)}
                    </Text>
                    <View style={styles.planStats}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: t.primary }]}>
                          {currentPlan.tasks.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textLight }]}>
                          Tarefas
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: t.secondary }]}>
                          {currentPlan.events.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textLight }]}>
                          Eventos
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: t.success }]}>
                          {currentPlan.habits.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textLight }]}>
                          Hábitos
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: t.warning }]}>
                          {currentPlan.focusSessions.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: t.textLight }]}>
                          Foco
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={[styles.scoreLabel, { color: t.textLight }]}>
                        Score Atual
                      </Text>
                      <Text style={[styles.scoreValue, { color: t.primary }]}>
                        {currentPlan.score}/100
                      </Text>
                    </View>
                  </View>

                  {/* Benefícios da Otimização */}
                  <View style={styles.benefitsSection}>
                    <Text style={[styles.sectionTitle, { color: t.text }]}>
                      Benefícios da Otimização
                    </Text>
                    <View style={styles.benefitsList}>
                      <View style={styles.benefitItem}>
                        <Ionicons name="time" size={20} color={t.success} />
                        <Text style={[styles.benefitText, { color: t.text }]}>
                          Melhor distribuição de tempo
                        </Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="trending-up" size={20} color={t.success} />
                        <Text style={[styles.benefitText, { color: t.text }]}>
                          Aumento da produtividade
                        </Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color={t.success} />
                        <Text style={[styles.benefitText, { color: t.text }]}>
                          Redução de conflitos de agenda
                        </Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <Ionicons name="heart" size={20} color={t.success} />
                        <Text style={[styles.benefitText, { color: t.text }]}>
                          Melhor equilíbrio vida-trabalho
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Botão de Otimização */}
                  <TouchableOpacity
                    style={[styles.optimizeButton, { backgroundColor: t.primary }]}
                    onPress={handleOptimize}
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={20} color="#fff" />
                        <Text style={[styles.optimizeButtonText, { color: '#fff' }]}>
                          Otimizar Plano
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color={t.textLight} />
                  <Text style={[styles.emptyTitle, { color: t.text }]}>
                    Nenhum Plano Encontrado
                  </Text>
                  <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                    Gere um plano semanal primeiro para poder otimizá-lo
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* Tela de Resultados */
            optimizationResult && (
              <View>
                {/* Score Melhorado */}
                <View style={[styles.resultCard, { backgroundColor: t.background }]}>
                  <Text style={[styles.resultTitle, { color: t.text }]}>
                    Score Melhorado
                  </Text>
                  <View style={styles.scoreComparison}>
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreLabel, { color: t.textLight }]}>
                        Antes
                      </Text>
                      <Text style={[styles.scoreValue, { color: t.textLight }]}>
                        {optimizationResult.originalPlan.score}/100
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color={t.primary} />
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreLabel, { color: t.textLight }]}>
                        Depois
                      </Text>
                      <Text style={[styles.scoreValue, { color: t.success }]}>
                        {optimizationResult.optimizedPlan.score}/100
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.improvementBadge, { backgroundColor: t.success + '20' }]}>
                    <Ionicons name="trending-up" size={16} color={t.success} />
                    <Text style={[styles.improvementText, { color: t.success }]}>
                      +{optimizationResult.scoreImprovement} pontos
                    </Text>
                  </View>
                </View>

                {/* Mudanças Aplicadas */}
                <View style={styles.changesSection}>
                  <Text style={[styles.sectionTitle, { color: t.text }]}>
                    Mudanças Sugeridas
                  </Text>
                  {optimizationResult.changes.map((change, index) => (
                    <View key={index} style={[styles.changeItem, { backgroundColor: t.background }]}>
                      <View style={styles.changeHeader}>
                        <Ionicons 
                          name={getImpactIcon(change.impact)} 
                          size={20} 
                          color={getImpactColor(change.impact)} 
                        />
                        <Text style={[styles.changeType, { color: t.text }]}>
                          {change.type === 'reschedule' ? 'Reagendamento' :
                           change.type === 'add' ? 'Adição' :
                           change.type === 'remove' ? 'Remoção' : 'Modificação'}
                        </Text>
                      </View>
                      <Text style={[styles.changeDescription, { color: t.textLight }]}>
                        {change.description}
                      </Text>
                      <View style={[styles.impactBadge, { backgroundColor: getImpactColor(change.impact) + '20' }]}>
                        <Text style={[styles.impactText, { color: getImpactColor(change.impact) }]}>
                          {change.impact === 'positive' ? 'Positivo' :
                           change.impact === 'negative' ? 'Negativo' : 'Neutro'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Insights */}
                <View style={styles.insightsSection}>
                  <Text style={[styles.sectionTitle, { color: t.text }]}>
                    Insights da IA
                  </Text>
                  {optimizationResult.insights.map((insight, index) => (
                    <View key={index} style={[styles.insightItem, { backgroundColor: t.background }]}>
                      <Ionicons name="bulb" size={16} color={t.warning} />
                      <Text style={[styles.insightText, { color: t.text }]}>
                        {insight}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Botões de Ação */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: t.background }]}
                    onPress={() => {
                      setShowResults(false);
                      setOptimizationResult(null);
                    }}
                  >
                    <Text style={[styles.actionButtonText, { color: t.text }]}>
                      Nova Otimização
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: t.primary }]}
                    onPress={handleApplyOptimization}
                  >
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                      Aplicar Mudanças
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: width - 32,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  planInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 14,
    marginBottom: 16,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  scoreLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  benefitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  optimizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scoreComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changesSection: {
    marginBottom: 20,
  },
  changeItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  changeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  changeType: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  impactBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});