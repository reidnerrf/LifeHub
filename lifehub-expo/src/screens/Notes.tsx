import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../services/api';

type Note = { id: string; title: string; content: string };

export default function Notes() {
  const t = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await api.listNotes();
        setNotes(list.map((n: any) => ({ id: n._id, title: n.title, content: n.content })));
      } catch {
        setError('Falha ao carregar notas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addNote = async () => {
    if (!title.trim()) return;
    try {
      const created = await api.createNote({ title, content: '' });
      setNotes(prev => [{ id: created._id, title: created.title, content: created.content }, ...prev]);
      setTitle('');
    } catch {
      Alert.alert('Erro', 'Falha ao criar nota');
    }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.background, padding: 16 }}>
      <Text style={{ color: t.text, fontSize: 20, fontWeight: '600', marginBottom: 12 }}>Notas</Text>
      {loading && <Text style={{ color: t.textLight, marginBottom: 8 }}>Carregando...</Text>}
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Nova nota" placeholderTextColor={t.textLight}
          style={{ flex: 1, backgroundColor: t.card, color: t.text, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        <TouchableOpacity onPress={addNote} style={{ backgroundColor: t.primary, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>

      <TextInput value={query} onChangeText={setQuery} placeholder="Buscar..." placeholderTextColor={t.textLight}
        style={{ backgroundColor: t.card, color: t.text, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, backgroundColor: t.card, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ color: t.text, fontWeight: '600' }}>{item.title}</Text>
            {item.content?.length > 0 && <Text style={{ color: t.textLight, marginTop: 4 }} numberOfLines={2}>{item.content}</Text>}
            <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
              <TouchableOpacity onPress={async () => {
                const newTitle = prompt('Editar título', item.title);
                if (!newTitle) return;
                try { await api.updateNote(item.id, { title: newTitle }); setNotes(prev => prev.map(n => n.id === item.id ? { ...n, title: newTitle } : n)); } catch {}
              }} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: t.supportYellow, borderRadius: 8 }}>
                <Text style={{ color: '#1C1C1E' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                try { await api.deleteNote(item.id); setNotes(prev => prev.filter(n => n.id !== item.id)); } catch {}
              }} style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#FA5252', borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

