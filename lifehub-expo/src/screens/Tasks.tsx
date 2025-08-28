import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks } from '../store/tasks';

export default function Tasks() {
  const t = useTheme();
  const { tasks, setTasks } = useTasks();
  const [title, setTitle] = useState('');

  const addTask = () => {
    if (!title.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), title }]);
    setTitle('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background, padding: 16 }}>
      <Text style={{ color: t.text, fontSize: 20, fontWeight: '600', marginBottom: 12 }}>Tarefas</Text>
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