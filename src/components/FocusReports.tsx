import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useFocus, FocusReport, FocusMode } from '../store/focus';

const { width } = Dimensions.get('window');

interface FocusReportsProps {
  visible: boolean;
  onClose: () => void;
}

export default function FocusReports({ visible, onClose }: FocusReportsProps) {
  const t = useTheme();
  const { 
    getProductivityStats, 
    getSessionHistory, 
    getFocusStreak, 
    getWeeklyGoal,
    generateDailyReport,
    generateWeeklyReport,
    reports 
  } = useFocus();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedMode, setSelectedMode] = useState<FocusMode | 'all'>('all');

  const stats = getProductivityStats(selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90);
  const sessionHistory = getSessionHistory(selectedMode === 'all' ? undefined : selectedMode, selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90);
  const focusStreak = getFocusStreak();
  const weeklyGoal = getWeeklyGoal();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'trending-up';
      case 'decreasing': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return t.success;
      case 'decreasing': return t.error;
      default: return t.textLight;
    }
  };

  const getProductivityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excelente', color: t.success };
    if (score >= 60) return { level: 'Bom', color: t.warning };
    if (score >= 40) return { level: 'Regular', color: t.error };
    return { level: 'Baixo', color: t.error };
  };

  const productivityLevel = getProductivityLevel(stats.completionRate);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Relatórios de Foco
          </Text>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={24} color={t.primary} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Filtros */}
          <View style={[styles.filters, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Período</Text>
            <View style={styles.filterButtons}>
              {(['7d', '30d', '90d'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.filterButton,
                    { backgroundColor: t.background },
                    selectedPeriod === period && { backgroundColor: t.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: t.text },
                    selectedPeriod === period && { color: t.primary, fontWeight: '600' }
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: t.text, marginTop: 16 }]}>Modo</Text>
            <View style={styles.filterButtons}>
              {(['all', 'pomodoro', 'flowtime', 'deepwork'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setSelectedMode(mode)}
                  style={[
                    styles.filterButton,
                    { backgroundColor: t.background },
                    selectedMode === mode && { backgroundColor: t.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: t.text },
                    selectedMode === mode && { color: t.primary, fontWeight: '600' }
                  ]}>
                    {mode === 'all' ? 'Todos' : mode === 'pomodoro' ? 'Pomodoro' : mode === 'flowtime' ? 'Flowtime' : 'Deep Work'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resumo Geral */}
          <View style={[styles.summarySection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Resumo Geral</Text>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Ionicons name="time" size={24} color={t.primary} />
                <Text style={[styles.summaryValue, { color: t.text }]}>
                  {formatTime(stats.totalFocusTime)}
                </Text>
                <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                  Tempo Total
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="timer" size={24} color={t.warning} />
                <Text style={[styles.summaryValue, { color: t.text }]}>
                  {formatTime(stats.averageSessionLength)}
                </Text>
                <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                  Média/Sessão
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="checkmark-circle" size={24} color={t.success} />
                <Text style={[styles.summaryValue, { color: t.text }]}>
                  {formatPercentage(stats.completionRate)}
                </Text>
                <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                  Taxa Conclusão
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Ionicons name="flame" size={24} color={t.error} />
                <Text style={[styles.summaryValue, { color: t.text }]}>
                  {focusStreak}
                </Text>
                <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                  Sequência
                </Text>
              </View>
            </View>
          </View>

          {/* Produtividade */}
          <View style={[styles.productivitySection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Produtividade</Text>
            
            <View style={styles.productivityCard}>
              <View style={styles.productivityHeader}>
                <Text style={[styles.productivityTitle, { color: t.text }]}>
                  Nível de Produtividade
                </Text>
                <View style={styles.trendContainer}>
                  <Ionicons 
                    name={getTrendIcon(stats.productivityTrend)} 
                    size={16} 
                    color={getTrendColor(stats.productivityTrend)} 
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(stats.productivityTrend) }]}>
                    {stats.productivityTrend === 'increasing' ? 'Crescendo' : 
                     stats.productivityTrend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.productivityBar}>
                <View 
                  style={[
                    styles.productivityFill, 
                    { 
                      width: `${Math.min(stats.completionRate, 100)}%`,
                      backgroundColor: productivityLevel.color 
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.productivityLevel, { color: productivityLevel.color }]}>
                {productivityLevel.level}
              </Text>
            </View>

            <View style={styles.insightsGrid}>
              <View style={styles.insightCard}>
                <Ionicons name="time-outline" size={20} color={t.primary} />
                <Text style={[styles.insightLabel, { color: t.textLight }]}>
                  Hora Mais Produtiva
                </Text>
                <Text style={[styles.insightValue, { color: t.text }]}>
                  {stats.mostProductiveHour}
                </Text>
              </View>

              <View style={styles.insightCard}>
                <Ionicons name="calendar-outline" size={20} color={t.warning} />
                <Text style={[styles.insightLabel, { color: t.textLight }]}>
                  Melhor Dia
                </Text>
                <Text style={[styles.insightValue, { color: t.text }]}>
                  {stats.bestDayOfWeek}
                </Text>
              </View>
            </View>
          </View>

          {/* Meta Semanal */}
          <View style={[styles.goalSection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Meta Semanal</Text>
            
            <View style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, { color: t.text }]}>
                  {formatTime(weeklyGoal.current)} / {formatTime(weeklyGoal.target)}
                </Text>
                <Text style={[styles.goalPercentage, { color: t.primary }]}>
                  {formatPercentage(weeklyGoal.percentage)}
                </Text>
              </View>
              
              <View style={styles.goalBar}>
                <View 
                  style={[
                    styles.goalFill, 
                    { 
                      width: `${Math.min(weeklyGoal.percentage, 100)}%`,
                      backgroundColor: weeklyGoal.percentage >= 100 ? t.success : t.primary 
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.goalStatus, { color: t.textLight }]}>
                {weeklyGoal.percentage >= 100 ? 'Meta atingida! 🎉' : 
                 weeklyGoal.percentage >= 75 ? 'Quase lá!' :
                 weeklyGoal.percentage >= 50 ? 'Bom progresso!' : 'Continue focado!'}
              </Text>
            </View>
          </View>

          {/* Histórico de Sessões */}
          <View style={[styles.historySection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Histórico de Sessões ({sessionHistory.length})
            </Text>
            
            {sessionHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={48} color={t.textLight} />
                <Text style={[styles.emptyText, { color: t.textLight }]}>
                  Nenhuma sessão encontrada
                </Text>
                <Text style={[styles.emptySubtext, { color: t.textLight }]}>
                  Comece uma sessão de foco para ver estatísticas
                </Text>
              </View>
            ) : (
              <View style={styles.sessionList}>
                {sessionHistory.slice(0, 10).map((session) => (
                  <View key={session.id} style={styles.sessionItem}>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionHeader}>
                        <Text style={[styles.sessionType, { color: t.primary }]}>
                          {session.type === 'pomodoro' ? 'Pomodoro' : 
                           session.type === 'flowtime' ? 'Flowtime' : 'Deep Work'}
                        </Text>
                        <View style={styles.sessionStatus}>
                          {session.completed ? (
                            <Ionicons name="checkmark-circle" size={16} color={t.success} />
                          ) : session.interrupted ? (
                            <Ionicons name="close-circle" size={16} color={t.error} />
                          ) : (
                            <Ionicons name="pause-circle" size={16} color={t.warning} />
                          )}
                        </View>
                      </View>
                      
                      <Text style={[styles.sessionTime, { color: t.text }]}>
                        {formatTime(session.actualDuration)}
                      </Text>
                      
                      <Text style={[styles.sessionDate, { color: t.textLight }]}>
                        {new Date(session.startTime).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    
                    {session.interruptions > 0 && (
                      <View style={styles.interruptionBadge}>
                        <Ionicons name="warning" size={12} color={t.warning} />
                        <Text style={[styles.interruptionText, { color: t.warning }]}>
                          {session.interruptions} interrupções
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Ações */}
          <View style={[styles.actionsSection, { backgroundColor: t.card }]}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: t.primary }]}
              onPress={() => {
                generateDailyReport(new Date());
                // Aqui você pode implementar exportação ou compartilhamento
              }}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                Exportar Relatório
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: t.background }]}
              onPress={() => {
                generateWeeklyReport(new Date());
                // Aqui você pode implementar compartilhamento
              }}
            >
              <Ionicons name="share" size={20} color={t.text} />
              <Text style={[styles.actionButtonText, { color: t.text }]}>
                Compartilhar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filters: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summarySection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: (width - 64) / 2 - 6,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  productivitySection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  productivityCard: {
    marginBottom: 16,
  },
  productivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productivityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productivityBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  productivityFill: {
    height: '100%',
    borderRadius: 4,
  },
  productivityLevel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  insightLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalStatus: {
    fontSize: 14,
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  sessionList: {
    gap: 12,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionStatus: {
    // Ícone de status
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
  },
  interruptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,193,7,0.1)',
  },
  interruptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsSection: {
    borderRadius: 12,
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});