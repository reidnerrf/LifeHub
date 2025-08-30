import React, { useState, useEffect } from 'react';
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
import { useAssistant, WeeklyPlan, AIInsight } from '../store/assistant';
import WeeklyOptimization from '../components/WeeklyOptimization';
import RoutinesManager from '../components/RoutinesManager';

const { width } = Dimensions.get('window');

export default function Assistant() {
  const t = useTheme();
  const {
    weeklyPlans,
    routines,
    insights,
    currentWeekPlan,
    generateWeeklyPlan,
    getCurrentWeekPlan,
    getUnreadInsights,
    getActiveRoutines,
    analyzeProductivity,
    addInsight,
    setShowOptimizationModal,
    setShowRoutinesModal,
    isLoading,
  } = useAssistant();

  const [showOptimization, setShowOptimization] = useState(false);
  const [showRoutines, setShowRoutines] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    // Carregar dados iniciais
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Gerar plano semanal se não existir
      const currentPlan = getCurrentWeekPlan();
      if (!currentPlan) {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        await generateWeeklyPlan(weekStart);
      }

      // Adicionar insights iniciais se não existirem
      if (insights.length === 0) {
        addInitialInsights();
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const addInitialInsights = () => {
    const initialInsights: Omit<AIInsight, 'id' | 'createdAt'>[] = [
      {
        type: 'suggestion',
        title: 'Otimizar Horários',
        description: 'Sua produtividade é maior entre 9h e 11h. Considere agendar tarefas importantes neste período.',
        priority: 'high',
        category: 'productivity',
        actionable: true,
        action: {
          type: 'optimize',
          suggestion: 'Mover tarefas importantes para 9h-11h',
        },
      },
      {
        type: 'achievement',
        title: 'Rotina Matinal Consistente',
        description: 'Você manteve sua rotina da manhã por 5 dias consecutivos! Continue assim.',
        priority: 'medium',
        category: 'health',
        actionable: false,
      },
      {
        type: 'warning',
        title: 'Muitas Tarefas Pendentes',
        description: 'Você tem 8 tarefas pendentes. Considere priorizar ou delegar algumas.',
        priority: 'high',
        category: 'productivity',
        actionable: true,
        action: {
          type: 'optimize',
          suggestion: 'Revisar e priorizar tarefas pendentes',
        },
      },
    ];

    initialInsights.forEach(insight => addInsight(insight));
  };

  const handleGeneratePlan = async () => {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      await generateWeeklyPlan(weekStart);
      Alert.alert('Sucesso', 'Plano semanal gerado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gerar plano semanal');
    }
  };

  const handleOptimizePlan = (planId: string) => {
    setSelectedPlanId(planId);
    setShowOptimization(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return 'sparkles';
      case 'suggestion': return 'bulb';
      case 'warning': return 'warning';
      case 'achievement': return 'trophy';
      default: return 'information-circle';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization': return t.primary;
      case 'suggestion': return t.warning;
      case 'warning': return t.error;
      case 'achievement': return t.success;
      default: return t.textLight;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return t.error;
      case 'medium': return t.warning;
      case 'low': return t.success;
      default: return t.textLight;
    }
  };

  const productivityAnalysis = analyzeProductivity(7);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: t.text }]}>Assistente IA</Text>
            <Text style={[styles.subtitle, { color: t.textLight }]}>
              Planejamento inteligente e otimização automática
            </Text>
          </View>
          <View style={[styles.aiStatus, { backgroundColor: t.primary + '20' }]}>
            <Ionicons name="sparkles" size={20} color={t.primary} />
            <Text style={[styles.aiStatusText, { color: t.primary }]}>IA Ativa</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score de Produtividade */}
        <View style={[styles.scoreCard, { backgroundColor: t.card }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreTitle, { color: t.text }]}>Score de Produtividade</Text>
            <TouchableOpacity onPress={() => Alert.alert('Detalhes', 'Análise detalhada da produtividade')}>
              <Ionicons name="information-circle" size={20} color={t.textLight} />
            </TouchableOpacity>
          </View>
          <View style={styles.scoreContent}>
            <Text style={[styles.scoreValue, { color: t.primary }]}>
              {productivityAnalysis.score}
            </Text>
            <Text style={[styles.scoreLabel, { color: t.textLight }]}>/ 100</Text>
          </View>
          <View style={styles.scoreInsights}>
            {productivityAnalysis.insights.slice(0, 2).map((insight, index) => (
              <Text key={index} style={[styles.scoreInsight, { color: t.textLight }]}>
                • {insight}
              </Text>
            ))}
          </View>
        </View>

        {/* Plano Semanal Atual */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Plano Semanal</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: t.primary + '20' }]}
                onPress={handleGeneratePlan}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={t.primary} />
                ) : (
                  <Ionicons name="refresh" size={16} color={t.primary} />
                )}
              </TouchableOpacity>
              {currentWeekPlan && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: t.warning + '20' }]}
                  onPress={() => handleOptimizePlan(currentWeekPlan.id)}
                >
                  <Ionicons name="sparkles" size={16} color={t.warning} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {currentWeekPlan ? (
            <View style={styles.planInfo}>
              <View style={styles.planHeader}>
                <Text style={[styles.planDate, { color: t.text }]}>
                  {formatDate(currentWeekPlan.weekStart)} - {formatDate(currentWeekPlan.weekEnd)}
                </Text>
                <View style={[styles.planScore, { backgroundColor: t.primary + '20' }]}>
                  <Text style={[styles.planScoreText, { color: t.primary }]}>
                    {currentWeekPlan.score}/100
                  </Text>
                </View>
              </View>
              
              <View style={styles.planStats}>
                <View style={styles.planStat}>
                  <Ionicons name="checkmark-circle" size={16} color={t.primary} />
                  <Text style={[styles.planStatText, { color: t.text }]}>
                    {currentWeekPlan.tasks.length} tarefas
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Ionicons name="calendar" size={16} color={t.secondary} />
                  <Text style={[styles.planStatText, { color: t.text }]}>
                    {currentWeekPlan.events.length} eventos
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Ionicons name="repeat" size={16} color={t.success} />
                  <Text style={[styles.planStatText, { color: t.text }]}>
                    {currentWeekPlan.habits.length} hábitos
                  </Text>
                </View>
                <View style={styles.planStat}>
                  <Ionicons name="timer" size={16} color={t.warning} />
                  <Text style={[styles.planStatText, { color: t.text }]}>
                    {currentWeekPlan.focusSessions.length} sessões
                  </Text>
                </View>
              </View>

              {currentWeekPlan.insights.length > 0 && (
                <View style={styles.planInsights}>
                  <Text style={[styles.insightsTitle, { color: t.textLight }]}>
                    Insights do Plano:
                  </Text>
                  {currentWeekPlan.insights.slice(0, 2).map((insight, index) => (
                    <Text key={index} style={[styles.planInsight, { color: t.textLight }]}>
                      • {insight}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyPlan}>
              <Ionicons name="calendar-outline" size={48} color={t.textLight} />
              <Text style={[styles.emptyPlanText, { color: t.text }]}>
                Nenhum plano semanal encontrado
              </Text>
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: t.primary }]}
                onPress={handleGeneratePlan}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={[styles.generateButtonText, { color: '#fff' }]}>
                      Gerar Plano
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Rotinas Ativas */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Rotinas Ativas</Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: t.success + '20' }]}
              onPress={() => setShowRoutines(true)}
            >
              <Ionicons name="settings" size={16} color={t.success} />
            </TouchableOpacity>
          </View>

          {getActiveRoutines().length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getActiveRoutines().slice(0, 3).map((routine) => (
                <View key={routine.id} style={[styles.routineCard, { backgroundColor: t.background }]}>
                  <View style={[styles.routineIcon, { backgroundColor: routine.color + '20' }]}>
                    <Ionicons name={routine.icon as any} size={24} color={routine.color} />
                  </View>
                  <Text style={[styles.routineName, { color: t.text }]} numberOfLines={1}>
                    {routine.name}
                  </Text>
                  <Text style={[styles.routineDuration, { color: t.textLight }]}>
                    {Math.floor(routine.duration / 60)}h {routine.duration % 60}min
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyRoutines}>
              <Ionicons name="time-outline" size={32} color={t.textLight} />
              <Text style={[styles.emptyRoutinesText, { color: t.textLight }]}>
                Nenhuma rotina ativa
              </Text>
            </View>
          )}
        </View>

        {/* Insights da IA */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Insights da IA</Text>
            <View style={styles.insightsBadge}>
              <Text style={[styles.insightsCount, { color: t.primary }]}>
                {getUnreadInsights().length}
              </Text>
            </View>
          </View>

          {insights.length > 0 ? (
            <View style={styles.insightsList}>
              {insights.slice(0, 3).map((insight) => (
                <View key={insight.id} style={[styles.insightCard, { backgroundColor: t.background }]}>
                  <View style={styles.insightHeader}>
                    <View style={styles.insightInfo}>
                      <Ionicons 
                        name={getInsightIcon(insight.type)} 
                        size={20} 
                        color={getInsightColor(insight.type)} 
                      />
                      <Text style={[styles.insightTitle, { color: t.text }]}>
                        {insight.title}
                      </Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) + '20' }]}>
                      <Text style={[styles.priorityText, { color: getPriorityColor(insight.priority) }]}>
                        {insight.priority}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.insightDescription, { color: t.textLight }]}>
                    {insight.description}
                  </Text>
                  {insight.actionable && insight.action && (
                    <TouchableOpacity
                      style={[styles.actionableButton, { backgroundColor: t.primary + '20' }]}
                      onPress={() => Alert.alert('Ação', insight.action!.suggestion)}
                    >
                      <Ionicons name="play" size={14} color={t.primary} />
                      <Text style={[styles.actionableText, { color: t.primary }]}>
                        {insight.action.suggestion}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyInsights}>
              <Ionicons name="bulb-outline" size={32} color={t.textLight} />
              <Text style={[styles.emptyInsightsText, { color: t.textLight }]}>
                Nenhum insight disponível
              </Text>
            </View>
          )}
        </View>

        {/* Ações Rápidas */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.primary + '20' }]}
              onPress={() => setShowOptimization(true)}
            >
              <Ionicons name="sparkles" size={24} color={t.primary} />
              <Text style={[styles.quickActionText, { color: t.primary }]}>
                Otimizar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.success + '20' }]}
              onPress={() => setShowRoutines(true)}
            >
              <Ionicons name="time" size={24} color={t.success} />
              <Text style={[styles.quickActionText, { color: t.success }]}>
                Rotinas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.warning + '20' }]}
              onPress={() => Alert.alert('Análise', 'Análise detalhada de produtividade')}
            >
              <Ionicons name="analytics" size={24} color={t.warning} />
              <Text style={[styles.quickActionText, { color: t.warning }]}>
                Análise
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.secondary + '20' }]}
              onPress={() => Alert.alert('Configurações', 'Configurações do assistente')}
            >
              <Ionicons name="settings" size={24} color={t.secondary} />
              <Text style={[styles.quickActionText, { color: t.secondary }]}>
                Config
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modais */}
      <WeeklyOptimization
        visible={showOptimization}
        onClose={() => setShowOptimization(false)}
        planId={selectedPlanId || undefined}
      />

      <RoutinesManager
        visible={showRoutines}
        onClose={() => setShowRoutines(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  aiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  aiStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  scoreInsights: {
    gap: 4,
  },
  scoreInsight: {
    fontSize: 12,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    gap: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  planScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planStatText: {
    fontSize: 12,
  },
  planInsights: {
    gap: 4,
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  planInsight: {
    fontSize: 12,
  },
  emptyPlan: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyPlanText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  routineCard: {
    width: 100,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  routineDuration: {
    fontSize: 10,
  },
  emptyRoutines: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyRoutinesText: {
    fontSize: 14,
    marginTop: 8,
  },
  insightsBadge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  insightsCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 8,
    padding: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  actionableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  actionableText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyInsights: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyInsightsText: {
    fontSize: 14,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});