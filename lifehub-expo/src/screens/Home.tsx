import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../services/api';

export default function Home() {
  const t = useTheme();
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; description?: string }[]>([]);
  const [score, setScore] = useState<{ score: number; insights: string[] } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const list = await api.listSuggestions();
        setSuggestions(list);
      } catch { setSuggestions([]); }
      try {
        const res = await api.scorePlanning({ totalTasks: 3, conflictingEvents: 0, overbookedMinutes: 0, freeBlocks: [{ start: new Date().toISOString(), end: new Date(Date.now()+60*60*1000).toISOString() }] });
        setScore(res);
      } catch { setScore(null); }
    })();
  }, []);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: t.text }]}>LifeHub</Text>
      {score && (
        <View style={[styles.card, { backgroundColor: t.card }]}> 
          <Text style={{ color: t.text, fontWeight: '600' }}>Score de Planejamento: {score.score}</Text>
          {score.insights.map((i, idx) => (
            <Text key={idx} style={{ color: t.textLight, marginTop: 4 }}>• {i}</Text>
          ))}
        </View>
      )}
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