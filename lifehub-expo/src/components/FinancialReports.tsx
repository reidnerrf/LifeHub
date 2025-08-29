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
import { useFinances, FinancialReport } from '../store/finances';

const { width } = Dimensions.get('window');

interface FinancialReportsProps {
  visible: boolean;
  onClose: () => void;
}

export default function FinancialReports({ visible, onClose }: FinancialReportsProps) {
  const t = useTheme();
  const { 
    generateMonthlyReport,
    generateWeeklyReport,
    generateYearlyReport,
    reports,
    selectedPeriod,
    setSelectedPeriod
  } = useFinances();
  
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return period;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good': return t.success;
      case 'warning': return t.warning;
      case 'danger': return t.error;
      default: return t.textLight;
    }
  };

  const getSavingsStatus = (rate: number) => {
    if (rate >= 20) return { status: 'good', label: 'Excelente' };
    if (rate >= 10) return { status: 'warning', label: 'Bom' };
    return { status: 'danger', label: 'Atenção' };
  };

  const generateCurrentReport = () => {
    const now = new Date();
    let report: FinancialReport;
    
    switch (selectedPeriod) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        report = generateWeeklyReport(weekStart);
        break;
      case 'month':
        report = generateMonthlyReport(now.getFullYear(), now.getMonth());
        break;
      case 'year':
        report = generateYearlyReport(now.getFullYear());
        break;
      default:
        report = generateMonthlyReport(now.getFullYear(), now.getMonth());
    }
    
    setSelectedReport(report);
  };

  const savingsStatus = selectedReport ? getSavingsStatus(selectedReport.savingsRate) : null;

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
            Relatórios Financeiros
          </Text>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={24} color={t.primary} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Seletor de Período */}
          <View style={[styles.periodSelector, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Período</Text>
            <View style={styles.periodButtons}>
              {(['week', 'month', 'year'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.periodButton,
                    { backgroundColor: t.background },
                    selectedPeriod === period && { backgroundColor: t.primary + '20' }
                  ]}
                >
                  <Text style={[
                    styles.periodButtonText,
                    { color: t.text },
                    selectedPeriod === period && { color: t.primary, fontWeight: '600' }
                  ]}>
                    {getPeriodLabel(period)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={generateCurrentReport}
              style={[styles.generateButton, { backgroundColor: t.primary }]}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={[styles.generateButtonText, { color: '#fff' }]}>
                Gerar Relatório
              </Text>
            </TouchableOpacity>
          </View>

          {/* Relatório Atual */}
          {selectedReport && (
            <View style={styles.reportSection}>
              {/* Resumo Geral */}
              <View style={[styles.summaryCard, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Resumo {getPeriodLabel(selectedReport.period)}
                </Text>
                
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="trending-up" size={20} color={t.success} />
                    <Text style={[styles.summaryValue, { color: t.text }]}>
                      {formatCurrency(selectedReport.totalIncome)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                      Entradas
                    </Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <Ionicons name="trending-down" size={20} color={t.error} />
                    <Text style={[styles.summaryValue, { color: t.text }]}>
                      {formatCurrency(selectedReport.totalExpenses)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                      Saídas
                    </Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <Ionicons name="wallet" size={20} color={t.primary} />
                    <Text style={[styles.summaryValue, { color: t.text }]}>
                      {formatCurrency(selectedReport.netIncome)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                      Saldo
                    </Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <Ionicons name="save" size={20} color={getStatusColor(savingsStatus?.status || 'warning')} />
                    <Text style={[styles.summaryValue, { color: t.text }]}>
                      {formatPercentage(selectedReport.savingsRate)}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: t.textLight }]}>
                      Taxa de Economia
                    </Text>
                  </View>
                </View>
              </View>

              {/* Status de Economia */}
              <View style={[styles.savingsCard, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Status de Economia
                </Text>
                
                <View style={styles.savingsStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(savingsStatus?.status || 'warning') + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(savingsStatus?.status || 'warning') }]}>
                      {savingsStatus?.label}
                    </Text>
                  </View>
                  
                  <Text style={[styles.savingsDescription, { color: t.textLight }]}>
                    {selectedReport.savingsRate >= 20 
                      ? 'Excelente! Você está economizando muito bem.'
                      : selectedReport.savingsRate >= 10
                      ? 'Bom trabalho! Continue economizando.'
                      : 'Atenção! Considere reduzir gastos para aumentar suas economias.'
                    }
                  </Text>
                </View>
              </View>

              {/* Top Categorias de Despesa */}
              <View style={[styles.categoriesCard, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Top Categorias de Despesa
                </Text>
                
                {selectedReport.topExpenseCategories.length > 0 ? (
                  <View style={styles.categoriesList}>
                    {selectedReport.topExpenseCategories.map((category, index) => (
                      <View key={index} style={styles.categoryItem}>
                        <View style={styles.categoryInfo}>
                          <Text style={[styles.categoryName, { color: t.text }]}>
                            {category.category}
                          </Text>
                          <Text style={[styles.categoryAmount, { color: t.error }]}>
                            {formatCurrency(category.amount)}
                          </Text>
                        </View>
                        <View style={styles.categoryBar}>
                          <View 
                            style={[
                              styles.categoryBarFill,
                              { 
                                width: `${(category.amount / selectedReport.totalExpenses) * 100}%`,
                                backgroundColor: t.error
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: t.textLight }]}>
                    Nenhuma despesa registrada neste período
                  </Text>
                )}
              </View>

              {/* Top Fontes de Renda */}
              <View style={[styles.incomeCard, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Top Fontes de Renda
                </Text>
                
                {selectedReport.topIncomeSources.length > 0 ? (
                  <View style={styles.incomeList}>
                    {selectedReport.topIncomeSources.map((source, index) => (
                      <View key={index} style={styles.incomeItem}>
                        <View style={styles.incomeInfo}>
                          <Text style={[styles.incomeName, { color: t.text }]}>
                            {source.source}
                          </Text>
                          <Text style={[styles.incomeAmount, { color: t.success }]}>
                            {formatCurrency(source.amount)}
                          </Text>
                        </View>
                        <View style={styles.incomeBar}>
                          <View 
                            style={[
                              styles.incomeBarFill,
                              { 
                                width: `${(source.amount / selectedReport.totalIncome) * 100}%`,
                                backgroundColor: t.success
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: t.textLight }]}>
                    Nenhuma entrada registrada neste período
                  </Text>
                )}
              </View>

              {/* Status de Contas */}
              <View style={[styles.billsCard, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Status de Contas
                </Text>
                
                <View style={styles.billsGrid}>
                  <View style={styles.billStatus}>
                    <Ionicons name="checkmark-circle" size={20} color={t.success} />
                    <Text style={[styles.billStatusValue, { color: t.text }]}>
                      {selectedReport.billsPaid}
                    </Text>
                    <Text style={[styles.billStatusLabel, { color: t.textLight }]}>
                      Contas Pagas
                    </Text>
                  </View>
                  
                  <View style={styles.billStatus}>
                    <Ionicons name="alert-circle" size={20} color={t.error} />
                    <Text style={[styles.billStatusValue, { color: t.text }]}>
                      {selectedReport.billsOverdue}
                    </Text>
                    <Text style={[styles.billStatusLabel, { color: t.textLight }]}>
                      Contas Atrasadas
                    </Text>
                  </View>
                  
                  <View style={styles.billStatus}>
                    <Ionicons name="cash" size={20} color={t.success} />
                    <Text style={[styles.billStatusValue, { color: t.text }]}>
                      {selectedReport.receivablesCollected}
                    </Text>
                    <Text style={[styles.billStatusLabel, { color: t.textLight }]}>
                      Recebimentos
                    </Text>
                  </View>
                  
                  <View style={styles.billStatus}>
                    <Ionicons name="time" size={20} color={t.warning} />
                    <Text style={[styles.billStatusValue, { color: t.text }]}>
                      {selectedReport.receivablesOverdue}
                    </Text>
                    <Text style={[styles.billStatusLabel, { color: t.textLight }]}>
                      A Receber Atrasado
                    </Text>
                  </View>
                </View>
              </View>

              {/* Informações do Relatório */}
              <View style={[styles.infoCard, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Informações do Relatório
                </Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={16} color={t.textLight} />
                  <Text style={[styles.infoText, { color: t.textLight }]}>
                    Período: {formatDate(selectedReport.startDate)} a {formatDate(selectedReport.endDate)}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color={t.textLight} />
                  <Text style={[styles.infoText, { color: t.textLight }]}>
                    Gerado em: {formatDate(selectedReport.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="analytics" size={16} color={t.textLight} />
                  <Text style={[styles.infoText, { color: t.textLight }]}>
                    Tipo: {getPeriodLabel(selectedReport.period)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Histórico de Relatórios */}
          <View style={[styles.historyCard, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Histórico de Relatórios ({reports.length})
            </Text>
            
            {reports.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="document-text-outline" size={48} color={t.textLight} />
                <Text style={[styles.emptyText, { color: t.textLight }]}>
                  Nenhum relatório gerado
                </Text>
                <Text style={[styles.emptySubtext, { color: t.textLight }]}>
                  Gere seu primeiro relatório para ver o histórico
                </Text>
              </View>
            ) : (
              <View style={styles.reportsList}>
                {reports.slice(0, 5).map((report) => (
                  <TouchableOpacity
                    key={report.id}
                    onPress={() => setSelectedReport(report)}
                    style={styles.reportItem}
                  >
                    <View style={styles.reportInfo}>
                      <Text style={[styles.reportTitle, { color: t.text }]}>
                        {getPeriodLabel(report.period)} - {formatDate(report.startDate)}
                      </Text>
                      <Text style={[styles.reportSubtitle, { color: t.textLight }]}>
                        Saldo: {formatCurrency(report.netIncome)} • Economia: {formatPercentage(report.savingsRate)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={t.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  periodSelector: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportSection: {
    gap: 20,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: (width - 64) / 2 - 6,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  savingsCard: {
    borderRadius: 12,
    padding: 16,
  },
  savingsStatus: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  savingsDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesCard: {
    borderRadius: 12,
    padding: 16,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  incomeCard: {
    borderRadius: 12,
    padding: 16,
  },
  incomeList: {
    gap: 12,
  },
  incomeItem: {
    marginBottom: 8,
  },
  incomeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  incomeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  incomeAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
  incomeBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  billsCard: {
    borderRadius: 12,
    padding: 16,
  },
  billsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  billStatus: {
    flex: 1,
    minWidth: (width - 64) / 2 - 6,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  billStatusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  billStatusLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  historyCard: {
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
  reportsList: {
    gap: 8,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportSubtitle: {
    fontSize: 12,
  },
});