import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents, ProductivityAnalysis } from '../store/events';

interface ProductivityAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const ProductivityAnalysisModal: React.FC<ProductivityAnalysisModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    generateProductivityAnalysis,
    getProductivityAnalyses,
    getProductivityStats,
  } = useEvents();

  const [selectedPeriod, setSelectedPeriod] = useState<ProductivityAnalysis['period']>('weekly');
  const [selectedReport, setSelectedReport] = useState<ProductivityAnalysis | null>(null);

  const reports = getProductivityAnalyses(selectedPeriod);
  const stats = getProductivityStats();

  const handleGenerateReport = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        endDate = new Date(now);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
    }

    const report = generateProductivityAnalysis(selectedPeriod, startDate, endDate);
    setSelectedReport(report);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPeriodText = (period: ProductivityAnalysis['period']) => {
    switch (period) {
      case 'daily':
        return 'Diário';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      default:
        return 'Semanal';
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Ionicons name="analytics-outline" size={24} color="#007bff" />
        <Text style={styles.statsTitle}>Visão Geral</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalEvents}</Text>
          <Text style={styles.statLabel}>Total de Eventos</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatDuration(stats.totalDuration)}</Text>
          <Text style={styles.statLabel}>Tempo Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatDuration(stats.averageEventDuration)}</Text>
          <Text style={styles.statLabel}>Duração Média</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.conflictCount}</Text>
          <Text style={styles.statLabel}>Conflitos</Text>
        </View>
      </View>
    </View>
  );

  const renderReportCard = ({ item: report }: { item: ProductivityAnalysis }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => setSelectedReport(report)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportPeriod}>{getPeriodText(report.period)}</Text>
          <Text style={styles.reportDate}>
            {formatDate(report.startDate)} - {formatDate(report.endDate)}
          </Text>
        </View>
        
        <View style={styles.reportStats}>
          <Text style={styles.reportEvents}>{report.totalEvents} eventos</Text>
          <Text style={styles.reportDuration}>{formatDuration(report.totalDuration)}</Text>
        </View>
      </View>
      
      <View style={styles.reportMetrics}>
        <View style={styles.metricItem}>
          <Ionicons name="trending-up-outline" size={16} color="#28a745" />
          <Text style={styles.metricText}>
            {report.mostProductiveDay} - {report.mostProductiveHour}h
          </Text>
        </View>
        
        <View style={styles.metricItem}>
          <Ionicons name="alert-circle-outline" size={16} color="#ffc107" />
          <Text style={styles.metricText}>
            {report.conflictCount} conflitos, {report.rescheduleCount} reagendamentos
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailedReport = () => {
    if (!selectedReport) return null;

    const { typeDistribution, priorityDistribution } = selectedReport;

    return (
      <ScrollView style={styles.detailedReport}>
        <View style={styles.detailedHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedReport(null)}
          >
            <Ionicons name="arrow-back" size={20} color="#007bff" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <Text style={styles.detailedTitle}>Relatório Detalhado</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.reportSummary}>
          <Text style={styles.summaryTitle}>
            {getPeriodText(selectedReport.period)} - {formatDate(selectedReport.startDate)} a {formatDate(selectedReport.endDate)}
          </Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>{selectedReport.totalEvents}</Text>
              <Text style={styles.summaryLabel}>Eventos</Text>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>{formatDuration(selectedReport.totalDuration)}</Text>
              <Text style={styles.summaryLabel}>Tempo Total</Text>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>{formatDuration(selectedReport.averageEventDuration)}</Text>
              <Text style={styles.summaryLabel}>Duração Média</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights de Produtividade</Text>
          
          <View style={styles.insightCard}>
            <Ionicons name="time-outline" size={20} color="#007bff" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Horário Mais Produtivo</Text>
              <Text style={styles.insightText}>
                {selectedReport.mostProductiveDay} às {selectedReport.mostProductiveHour}h
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Ionicons name="calendar-outline" size={20} color="#28a745" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Dia Mais Produtivo</Text>
              <Text style={styles.insightText}>{selectedReport.mostProductiveDay}</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Ionicons name="alert-triangle-outline" size={20} color="#ffc107" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Conflitos e Reagendamentos</Text>
              <Text style={styles.insightText}>
                {selectedReport.conflictCount} conflitos detectados, {selectedReport.rescheduleCount} eventos reagendados
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.distributionSection}>
          <Text style={styles.sectionTitle}>Distribuição por Tipo</Text>
          
          <View style={styles.distributionGrid}>
            {Object.entries(typeDistribution).map(([type, count]) => (
              <View key={type} style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill,
                      { 
                        width: `${(count / selectedReport.totalEvents) * 100}%`,
                        backgroundColor: getTypeColor(type),
                      }
                    ]} 
                  />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionType}>
                    {type === 'event' ? 'Evento' :
                     type === 'task' ? 'Tarefa' :
                     type === 'meeting' ? 'Reunião' : 'Lembrete'}
                  </Text>
                  <Text style={styles.distributionCount}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.distributionSection}>
          <Text style={styles.sectionTitle}>Distribuição por Prioridade</Text>
          
          <View style={styles.distributionGrid}>
            {Object.entries(priorityDistribution).map(([priority, count]) => (
              <View key={priority} style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill,
                      { 
                        width: `${(count / selectedReport.totalEvents) * 100}%`,
                        backgroundColor: getPriorityColor(priority),
                      }
                    ]} 
                  />
                </View>
                <View style={styles.distributionInfo}>
                  <Text style={styles.distributionType}>
                    {priority === 'urgent' ? 'Urgente' :
                     priority === 'high' ? 'Alta' :
                     priority === 'medium' ? 'Média' : 'Baixa'}
                  </Text>
                  <Text style={styles.distributionCount}>{count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recomendações</Text>
          
          <View style={styles.recommendationCard}>
            <Ionicons name="bulb-outline" size={20} color="#ffc107" />
            <Text style={styles.recommendationText}>
              Agende eventos importantes no seu horário mais produtivo ({selectedReport.mostProductiveDay} às {selectedReport.mostProductiveHour}h)
            </Text>
          </View>
          
          {selectedReport.conflictCount > 0 && (
            <View style={styles.recommendationCard}>
              <Ionicons name="warning-outline" size={20} color="#ff4757" />
              <Text style={styles.recommendationText}>
                Considere usar a IA para sugestões de reagendamento e evitar conflitos
              </Text>
            </View>
          )}
          
          <View style={styles.recommendationCard}>
            <Ionicons name="trending-up-outline" size={20} color="#28a745" />
            <Text style={styles.recommendationText}>
              Mantenha uma distribuição equilibrada entre diferentes tipos de eventos
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return '#007bff';
      case 'task':
        return '#28a745';
      case 'meeting':
        return '#ffc107';
      case 'reminder':
        return '#6c757d';
      default:
        return '#007bff';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ff4757';
      case 'high':
        return '#ff6b35';
      case 'medium':
        return '#ffa726';
      case 'low':
        return '#66bb6a';
      default:
        return '#66bb6a';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {!selectedReport ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Análise de Produtividade</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.periodSelector}>
              <Text style={styles.periodLabel}>Período:</Text>
              <View style={styles.periodButtons}>
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive,
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}>
                      {getPeriodText(period)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView style={styles.content}>
              {renderStatsCard()}

              <View style={styles.generateSection}>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateReport}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Gerar Relatório</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.reportsSection}>
                <Text style={styles.sectionTitle}>Relatórios Anteriores</Text>
                {reports.map((report) => renderReportCard({ item: report }))}
              </View>
            </ScrollView>
          </>
        ) : (
          renderDetailedReport()
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  periodSelector: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007bff',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: (width - 64) / 2,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  generateSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportStats: {
    alignItems: 'flex-end',
  },
  reportEvents: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007bff',
    marginBottom: 2,
  },
  reportDuration: {
    fontSize: 12,
    color: '#666',
  },
  reportMetrics: {
    gap: 6,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  detailedReport: {
    flex: 1,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 4,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 80,
  },
  reportSummary: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  insightsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
  },
  distributionSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  distributionGrid: {
    gap: 12,
  },
  distributionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distributionBar: {
    height: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  distributionCount: {
    fontSize: 14,
    color: '#666',
  },
  recommendationsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    lineHeight: 20,
  },
});