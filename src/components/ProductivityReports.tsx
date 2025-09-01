import React, { useState, useEffect } from 'react';
import { useProductivity } from '../store/productivity';
import { ReportService } from '../services/reportService';
import { ProductivityAnalysisService } from '../services/productivityAnalysis';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

// Using basic React Native components - replace with your UI library components as needed

interface ProductivityReportsProps {
  onClose?: () => void;
}

export const ProductivityReports: React.FC<ProductivityReportsProps> = ({ onClose }) => {
  const {
    reports,
    metrics,
    sessions,
    insights,
    stats,
    isGeneratingReport,
    generateReport,
    analyzeProductivity,
    setShowReportModal,
    setSelectedReport,
  } = useProductivity();

  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);

  useEffect(() => {
    // Carregar dados iniciais se necessário
    if (metrics.length === 0) {
      // Simular carregamento de dados
      console.log('Carregando métricas de produtividade...');
    }
  }, [metrics]);

  const handleGenerateReport = async () => {
    try {
      const report = await generateReport(selectedPeriod);
      setSelectedReport(report);
      setShowReportModal(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Tente novamente.');
    }
  };

  const handleAnalyzeProductivity = async () => {
    setIsAnalyzing(true);
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newInsights = await analyzeProductivity(weekAgo, now);
      const trends = ProductivityAnalysisService.analyzeTrends(metrics, 7);
      const recommendations = ProductivityAnalysisService.generateRecommendations(metrics, sessions, stats);

      setCurrentAnalysis({
        insights: newInsights,
        trends,
        recommendations,
        generatedAt: new Date(),
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível analisar a produtividade. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'csv' | 'json') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      let url: string;
      switch (format) {
        case 'pdf':
          url = await ReportService.exportToPDF(report);
          break;
        case 'csv':
          url = await ReportService.exportToCSV(report);
          break;
        case 'json':
          url = await ReportService.exportToJSON(report);
          break;
      }

      const filename = `relatorio-produtividade-${report.type}-${Date.now()}.${format}`;
      ReportService.downloadFile(url, filename);

      Alert.alert('Sucesso', `Relatório exportado como ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar o relatório. Tente novamente.');
    }
  };

  const formatTrend = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getTrendColor = (value: number) => {
    if (value > 5) return '#4CAF50';
    if (value < -5) return '#F44336';
    return '#FF9800';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios de Produtividade</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seletor de Período */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Período do Relatório</Text>
          <View style={styles.periodButtons}>
            {[
              { key: 'weekly', label: 'Semanal' },
              { key: 'monthly', label: 'Mensal' },
              { key: 'custom', label: 'Personalizado' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key as any)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estatísticas Rápidas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estatísticas Atuais</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.today.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Tarefas Hoje</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.today.focusTime}m</Text>
              <Text style={styles.statLabel}>Foco Hoje</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.today.productivityScore}%</Text>
              <Text style={styles.statLabel}>Produtividade</Text>
            </View>
          </View>
        </View>

        {/* Análise de Tendências */}
        {currentAnalysis && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Análise de Tendências (7 dias)</Text>
            <View style={styles.trendsGrid}>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Tarefas</Text>
                <Text style={[styles.trendValue, { color: getTrendColor(currentAnalysis.trends.tasksTrend) }]}>
                  {formatTrend(currentAnalysis.trends.tasksTrend)}
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Foco</Text>
                <Text style={[styles.trendValue, { color: getTrendColor(currentAnalysis.trends.focusTrend) }]}>
                  {formatTrend(currentAnalysis.trends.focusTrend)}
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Hábitos</Text>
                <Text style={[styles.trendValue, { color: getTrendColor(currentAnalysis.trends.habitsTrend) }]}>
                  {formatTrend(currentAnalysis.trends.habitsTrend)}
                </Text>
              </View>
              <View style={styles.trendItem}>
                <Text style={styles.trendLabel}>Produtividade</Text>
                <Text style={[styles.trendValue, { color: getTrendColor(currentAnalysis.trends.productivityTrend) }]}>
                  {formatTrend(currentAnalysis.trends.productivityTrend)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recomendações */}
        {currentAnalysis?.recommendations && currentAnalysis.recommendations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            {currentAnalysis.recommendations.map((rec: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.bulbIcon}>💡</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Relatórios Salvos */}
        {reports.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Relatórios Salvos</Text>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>
                    {report.generatedAt.toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.reportActions}>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleExportReport(report.id, 'pdf')}
                  >
                    <Text style={styles.downloadIcon}>📄</Text>
                    <Text style={styles.exportButtonText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleExportReport(report.id, 'csv')}
                  >
                    <Text style={styles.downloadIcon}>📊</Text>
                    <Text style={styles.exportButtonText}>CSV</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Insights Recentes</Text>
            {insights.slice(0, 3).map((insight) => (
              <View key={insight.id} style={styles.insightItem}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(insight.severity) }]}>
                    <Text style={styles.severityText}>{insight.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleAnalyzeProductivity}
          disabled={isAnalyzing}
        >
          <Text style={styles.secondaryButtonText}>
            {isAnalyzing ? 'Analisando...' : 'Analisar Produtividade'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleGenerateReport}
          disabled={isGeneratingReport}
        >
          <Text style={styles.primaryButtonText}>
            {isGeneratingReport ? 'Gerando...' : 'Gerar Relatório'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return '#F44336';
    case 'medium': return '#FF9800';
    case 'low': return '#4CAF50';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bulbIcon: {
    fontSize: 16,
    color: '#FF9800',
  },
  downloadIcon: {
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  trendsCard: {
    marginBottom: 16,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendItem: {
    width: '50%',
    padding: 12,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  recommendationsCard: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  savedReportsCard: {
    marginBottom: 16,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reportActions: {
    flexDirection: 'row',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exportButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  insightsCard: {
    marginBottom: 16,
  },
  insightItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useProductivityReports } from './hooks/useProductivityReports';
import { useProductivityData } from './hooks/useProductivityData';
import { ExportModal } from './ExportModal';
import { ProductivityPeriod } from '../store/productivity';

export const ProductivityReports: React.FC = () => {
  const [period, setPeriod] = useState<ProductivityPeriod>('weekly');
  const { reports, latest, generate } = useProductivityReports(period);
  const { trend, stats } = useProductivityData(30);
  const [exportOpen, setExportOpen] = useState(false);

  const periodLabel = useMemo(() => (period === 'weekly' ? 'Semanal' : 'Mensal'), [period]);

  const generateNow = () => {
    const now = new Date();
    if (period === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      generate(start, now);
    } else {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      generate(start, now);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios de Produtividade</Text>
        <View style={styles.periodSwitch}>
          <TouchableOpacity
            style={[styles.switchButton, period === 'weekly' && styles.switchActive]}
            onPress={() => setPeriod('weekly')}
          >
            <Text style={[styles.switchText, period === 'weekly' && styles.switchTextActive]}>Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchButton, period === 'monthly' && styles.switchActive]}
            onPress={() => setPeriod('monthly')}
          >
            <Text style={[styles.switchText, period === 'monthly' && styles.switchTextActive]}>Mensal</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalTasksCompleted}</Text>
          <Text style={styles.statLabel}>Tarefas concluídas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalFocusHours}h</Text>
          <Text style={styles.statLabel}>Tempo de foco</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.averageProductivity}%</Text>
          <Text style={styles.statLabel}>Produtividade média</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={generateNow}>
          <Text style={styles.primaryText}>Gerar {periodLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setExportOpen(true)}>
          <Text style={styles.secondaryText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {reports.map((r) => (
          <View key={r.id} style={styles.reportItem}>
            <Text style={styles.reportTitle}>
              {periodLabel}: {r.startDate} — {r.endDate}
            </Text>
            <Text style={styles.reportMeta}>
              Tarefas: {r.totals.tasksCompleted} • Foco: {r.totals.focusMinutes}min • Prod. média: {r.averages.productivityScore}%
            </Text>
          </View>
        ))}
        {reports.length === 0 && (
          <Text style={styles.empty}>Nenhum relatório gerado ainda.</Text>
        )}
      </ScrollView>

      <ExportModal visible={exportOpen} onClose={() => setExportOpen(false)} report={latest} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  periodSwitch: { flexDirection: 'row', backgroundColor: '#f0f2f5', borderRadius: 8 },
  switchButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  switchActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  switchText: { color: '#666' },
  switchTextActive: { color: '#111', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#666' },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  primaryBtn: { backgroundColor: '#007bff', padding: 10, borderRadius: 8 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#eef3ff', padding: 10, borderRadius: 8 },
  secondaryText: { color: '#2d5bd1', fontWeight: '600' },
  list: { marginTop: 8 },
  reportItem: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
  reportTitle: { fontWeight: '600' },
  reportMeta: { color: '#666', marginTop: 4 },
  empty: { color: '#666', textAlign: 'center', marginTop: 16 },
});

