import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, ProductivityReport } from '../store/tasks';

interface ProductivityReportsModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const ProductivityReportsModal: React.FC<ProductivityReportsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    generateProductivityReport,
    getProductivityReports,
    getProductivityStats,
  } = useTasks();

  const [selectedPeriod, setSelectedPeriod] = useState<ProductivityReport['period']>('weekly');
  const [selectedReport, setSelectedReport] = useState<ProductivityReport | null>(null);

  const reports = getProductivityReports(selectedPeriod);
  const stats = getProductivityStats();

  const handleGenerateReport = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (selectedPeriod) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
    }

    const report = generateProductivityReport(selectedPeriod, startDate, endDate);
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

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Resumo Geral</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="list-outline" size={24} color="#007bff" />
          <Text style={styles.statValue}>{stats.totalTasks}</Text>
          <Text style={styles.statLabel}>Total de Tarefas</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#4caf50" />
          <Text style={styles.statValue}>{stats.completedTasks}</Text>
          <Text style={styles.statLabel}>Concluídas</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={24} color="#ff9800" />
          <Text style={styles.statValue}>{stats.completionRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Taxa de Conclusão</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color="#9c27b0" />
          <Text style={styles.statValue}>{formatDuration(stats.totalTimeSpent)}</Text>
          <Text style={styles.statLabel}>Tempo Total</Text>
        </View>
      </View>
    </View>
  );

  const renderReportCard = ({ item: report }: { item: ProductivityReport }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => setSelectedReport(report)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportPeriod}>
            {report.period === 'daily' && 'Diário'}
            {report.period === 'weekly' && 'Semanal'}
            {report.period === 'monthly' && 'Mensal'}
          </Text>
          <Text style={styles.reportDate}>
            {formatDate(report.startDate)} - {formatDate(report.endDate)}
          </Text>
        </View>
        
        <View style={styles.reportStats}>
          <Text style={styles.reportCompletionRate}>
            {report.completionRate.toFixed(1)}%
          </Text>
          <Text style={styles.reportCompletionLabel}>Conclusão</Text>
        </View>
      </View>

      <View style={styles.reportDetails}>
        <View style={styles.reportDetail}>
          <Ionicons name="list-outline" size={16} color="#666" />
          <Text style={styles.reportDetailText}>
            {report.totalTasks} tarefas
          </Text>
        </View>
        
        <View style={styles.reportDetail}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
          <Text style={styles.reportDetailText}>
            {report.completedTasks} concluídas
          </Text>
        </View>
        
        <View style={styles.reportDetail}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.reportDetailText}>
            {formatDuration(report.totalTimeSpent)}
          </Text>
        </View>
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.reportGeneratedAt}>
          Gerado em {formatDate(report.generatedAt)}
        </Text>
        
        <TouchableOpacity style={styles.viewReportButton}>
          <Text style={styles.viewReportButtonText}>Ver Detalhes</Text>
          <Ionicons name="chevron-forward" size={16} color="#007bff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDetailedReport = () => {
    if (!selectedReport) return null;

    return (
      <View style={styles.detailedReportContainer}>
        <View style={styles.detailedReportHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedReport(null)}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <Text style={styles.detailedReportTitle}>Relatório Detalhado</Text>
        </View>

        <ScrollView style={styles.detailedReportContent}>
          <View style={styles.detailedReportSection}>
            <Text style={styles.sectionTitle}>Visão Geral</Text>
            
            <View style={styles.detailedStatsGrid}>
              <View style={styles.detailedStatItem}>
                <Text style={styles.detailedStatValue}>{selectedReport.totalTasks}</Text>
                <Text style={styles.detailedStatLabel}>Total de Tarefas</Text>
              </View>
              
              <View style={styles.detailedStatItem}>
                <Text style={styles.detailedStatValue}>{selectedReport.completedTasks}</Text>
                <Text style={styles.detailedStatLabel}>Concluídas</Text>
              </View>
              
              <View style={styles.detailedStatItem}>
                <Text style={styles.detailedStatValue}>{selectedReport.overdueTasks}</Text>
                <Text style={styles.detailedStatLabel}>Atrasadas</Text>
              </View>
              
              <View style={styles.detailedStatItem}>
                <Text style={styles.detailedStatValue}>{selectedReport.completionRate.toFixed(1)}%</Text>
                <Text style={styles.detailedStatLabel}>Taxa de Conclusão</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailedReportSection}>
            <Text style={styles.sectionTitle}>Tempo</Text>
            
            <View style={styles.timeStats}>
              <View style={styles.timeStatItem}>
                <Ionicons name="time-outline" size={20} color="#007bff" />
                <View style={styles.timeStatInfo}>
                  <Text style={styles.timeStatValue}>
                    {formatDuration(selectedReport.totalTimeSpent)}
                  </Text>
                  <Text style={styles.timeStatLabel}>Tempo Total Gasto</Text>
                </View>
              </View>
              
              <View style={styles.timeStatItem}>
                <Ionicons name="timer-outline" size={20} color="#4caf50" />
                <View style={styles.timeStatInfo}>
                  <Text style={styles.timeStatValue}>
                    {formatDuration(selectedReport.averageTaskDuration)}
                  </Text>
                  <Text style={styles.timeStatLabel}>Tempo Médio por Tarefa</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailedReportSection}>
            <Text style={styles.sectionTitle}>Produtividade</Text>
            
            <View style={styles.productivityStats}>
              <View style={styles.productivityStatItem}>
                <Ionicons name="calendar-outline" size={20} color="#ff9800" />
                <View style={styles.productivityStatInfo}>
                  <Text style={styles.productivityStatValue}>
                    {selectedReport.mostProductiveDay}
                  </Text>
                  <Text style={styles.productivityStatLabel}>Dia Mais Produtivo</Text>
                </View>
              </View>
              
              <View style={styles.productivityStatItem}>
                <Ionicons name="time-outline" size={20} color="#9c27b0" />
                <View style={styles.productivityStatInfo}>
                  <Text style={styles.productivityStatValue}>
                    {selectedReport.mostProductiveHour}h
                  </Text>
                  <Text style={styles.productivityStatLabel}>Hora Mais Produtiva</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailedReportSection}>
            <Text style={styles.sectionTitle}>Distribuição por Prioridade</Text>
            
            <View style={styles.priorityDistribution}>
              {Object.entries(selectedReport.priorityDistribution).map(([priority, count]) => (
                <View key={priority} style={styles.priorityItem}>
                  <View style={styles.priorityHeader}>
                    <View
                      style={[
                        styles.priorityIndicator,
                        {
                          backgroundColor:
                            priority === 'urgent' ? '#ff4757' :
                            priority === 'high' ? '#ff6b35' :
                            priority === 'medium' ? '#ffa726' : '#66bb6a'
                        }
                      ]}
                    />
                    <Text style={styles.priorityLabel}>
                      {priority === 'urgent' ? 'Urgente' :
                       priority === 'high' ? 'Alta' :
                       priority === 'medium' ? 'Média' : 'Baixa'}
                    </Text>
                  </View>
                  
                  <View style={styles.priorityBar}>
                    <View
                      style={[
                        styles.priorityBarFill,
                        {
                          width: `${(count / selectedReport.totalTasks) * 100}%`,
                          backgroundColor:
                            priority === 'urgent' ? '#ff4757' :
                            priority === 'high' ? '#ff6b35' :
                            priority === 'medium' ? '#ffa726' : '#66bb6a'
                        }
                      ]}
                    />
                  </View>
                  
                  <Text style={styles.priorityCount}>{count} tarefas</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailedReportSection}>
            <Text style={styles.sectionTitle}>Período do Relatório</Text>
            
            <View style={styles.reportPeriodInfo}>
              <View style={styles.periodInfoItem}>
                <Text style={styles.periodInfoLabel}>Início:</Text>
                <Text style={styles.periodInfoValue}>
                  {formatDate(selectedReport.startDate)}
                </Text>
              </View>
              
              <View style={styles.periodInfoItem}>
                <Text style={styles.periodInfoLabel}>Fim:</Text>
                <Text style={styles.periodInfoValue}>
                  {formatDate(selectedReport.endDate)}
                </Text>
              </View>
              
              <View style={styles.periodInfoItem}>
                <Text style={styles.periodInfoLabel}>Gerado em:</Text>
                <Text style={styles.periodInfoValue}>
                  {formatDate(selectedReport.generatedAt)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
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
              <Text style={styles.headerTitle}>Relatórios de Produtividade</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodTab, selectedPeriod === 'daily' && styles.activePeriodTab]}
                onPress={() => setSelectedPeriod('daily')}
              >
                <Text style={[styles.periodTabText, selectedPeriod === 'daily' && styles.activePeriodTabText]}>
                  Diário
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.periodTab, selectedPeriod === 'weekly' && styles.activePeriodTab]}
                onPress={() => setSelectedPeriod('weekly')}
              >
                <Text style={[styles.periodTabText, selectedPeriod === 'weekly' && styles.activePeriodTabText]}>
                  Semanal
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.periodTab, selectedPeriod === 'monthly' && styles.activePeriodTab]}
                onPress={() => setSelectedPeriod('monthly')}
              >
                <Text style={[styles.periodTabText, selectedPeriod === 'monthly' && styles.activePeriodTabText]}>
                  Mensal
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {renderStatsCard()}

              <View style={styles.generateSection}>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateReport}
                >
                  <Ionicons name="refresh-outline" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>
                    Gerar Relatório {selectedPeriod === 'daily' ? 'Diário' : selectedPeriod === 'weekly' ? 'Semanal' : 'Mensal'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.reportsSection}>
                <Text style={styles.reportsTitle}>Relatórios Anteriores</Text>
                
                {reports.length === 0 ? (
                  <View style={styles.emptyReports}>
                    <Ionicons name="document-outline" size={32} color="#ccc" />
                    <Text style={styles.emptyReportsText}>
                      Nenhum relatório gerado ainda
                    </Text>
                    <Text style={styles.emptyReportsSubtext}>
                      Gere seu primeiro relatório para ver suas estatísticas
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={reports}
                    renderItem={renderReportCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                )}
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activePeriodTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  periodTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePeriodTabText: {
    color: '#007bff',
    fontWeight: '600',
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
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: (width - 64) / 2 - 6,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  generateSection: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyReports: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyReportsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptyReportsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportPeriod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportStats: {
    alignItems: 'flex-end',
  },
  reportCompletionRate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
  },
  reportCompletionLabel: {
    fontSize: 12,
    color: '#666',
  },
  reportDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDetailText: {
    fontSize: 12,
    color: '#666',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportGeneratedAt: {
    fontSize: 12,
    color: '#999',
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewReportButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  detailedReportContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  detailedReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  detailedReportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailedReportContent: {
    flex: 1,
  },
  detailedReportSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailedStatItem: {
    width: (width - 64) / 2 - 6,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailedStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  detailedStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  timeStats: {
    gap: 12,
  },
  timeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeStatInfo: {
    marginLeft: 12,
  },
  timeStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  productivityStats: {
    gap: 12,
  },
  productivityStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productivityStatInfo: {
    marginLeft: 12,
  },
  productivityStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productivityStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  priorityDistribution: {
    gap: 12,
  },
  priorityItem: {
    gap: 8,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  priorityBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  priorityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  priorityCount: {
    fontSize: 12,
    color: '#666',
  },
  reportPeriodInfo: {
    gap: 8,
  },
  periodInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  periodInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});