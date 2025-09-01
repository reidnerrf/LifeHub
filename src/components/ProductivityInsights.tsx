import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProductivity } from '../store/productivity';
import { useProductivityAnalysis } from './hooks/useProductivityAnalysis';

export const ProductivityInsights: React.FC = () => {
  const { insights } = useProductivity();
  const { loading, error } = useProductivityAnalysis({ useML: false, days: 30 });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights de Produtividade</Text>
      {loading && <Text style={styles.subtle}>Analisando...</Text>}
      {error && <Text style={styles.error}>Erro: {error}</Text>}
      {insights.length === 0 && !loading && <Text style={styles.subtle}>Sem recomendações no momento.</Text>}
      {insights.map((i) => (
        <View key={i.id} style={styles.card}>
          <Text style={styles.cardTitle}>{i.title}</Text>
          <Text style={styles.cardDesc}>{i.description}</Text>
          <Text style={styles.meta}>Prioridade: {i.priority}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  subtle: { color: '#666' },
  error: { color: '#b00020' },
  card: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee', padding: 12, marginBottom: 8 },
  cardTitle: { fontWeight: '600', marginBottom: 4 },
  cardDesc: { color: '#444', marginBottom: 6 },
  meta: { color: '#666', fontSize: 12 },
});

