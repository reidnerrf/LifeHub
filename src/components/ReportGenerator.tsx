import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProductivityPeriod } from '../store/productivity';
import { useProductivityReports } from './hooks/useProductivityReports';

export const ReportGenerator: React.FC = () => {
  const [period, setPeriod] = useState<ProductivityPeriod>('weekly');
  const { generate } = useProductivityReports(period);

  const generateReport = () => {
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
      <Text style={styles.title}>Gerar Relatório</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pill, period === 'weekly' && styles.pillActive]}
          onPress={() => setPeriod('weekly')}
        >
          <Text style={[styles.pillText, period === 'weekly' && styles.pillTextActive]}>Semanal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, period === 'monthly' && styles.pillActive]}
          onPress={() => setPeriod('monthly')}
        >
          <Text style={[styles.pillText, period === 'monthly' && styles.pillTextActive]}>Mensal</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.primary} onPress={generateReport}>
        <Text style={styles.primaryText}>Gerar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#f0f2f5' },
  pillActive: { backgroundColor: '#e6efff' },
  pillText: { color: '#666' },
  pillTextActive: { color: '#2d5bd1', fontWeight: '600' },
  primary: { backgroundColor: '#007bff', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' },
});

