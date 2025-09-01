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

