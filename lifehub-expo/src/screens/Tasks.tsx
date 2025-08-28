import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks } from '../store/tasks';
import { api } from '../services/api';

export default function Tasks() {
  const t = useTheme();
  const { tasks, setTasks } = useTasks();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await api.listTasks();
        setTasks(list.map((t: any) => ({ id: t._id, title: t.title })));
      } catch (e: any) {
        setError('Falha ao carregar tarefas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const created = await api.createTask({ title, completed: false });
      setTasks(prev => [{ id: created._id, title: created.title }, ...prev]);
      setTitle('');
    } catch {
      setError('Falha ao criar tarefa');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background, padding: 16 }}>
      <Text style={{ color: t.text, fontSize: 20, fontWeight: '600', marginBottom: 12 }}>Tarefas</Text>
      {loading && <Text style={{ color: t.textLight, marginBottom: 8 }}>Carregando...</Text>}
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Nova tarefa"
          placeholderTextColor={t.textLight}
          style={{ flex: 1, backgroundColor: t.card, color: t.text, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        <TouchableOpacity onPress={addTask} style={{ backgroundColor: t.primary, paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, backgroundColor: t.card, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ color: t.text }}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}