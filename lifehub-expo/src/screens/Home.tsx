import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { ai } from '../services/ai';

export default function Home() {
  const t = useTheme();
  const suggestions = ai.getDailySuggestions();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: t.text }]}>LifeHub</Text>
      {suggestions.map(s => (
        <View key={s.id} style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={{ color: t.text }}>{s.title}</Text>
          {!!s.description && <Text style={{ color: t.textLight, marginTop: 4 }}>{s.description}</Text>}
          <TouchableOpacity style={[styles.button, { backgroundColor: t.primary }]}>
            <Text style={{ color: '#fff' }}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  card: { padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, marginBottom: 12 },
  button: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start' },
});