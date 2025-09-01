import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNotes } from '../store/notes';

interface NoteCommentsProps {
  noteId: string;
  authorId: string;
  authorName?: string;
}

export const NoteComments: React.FC<NoteCommentsProps> = ({ noteId, authorId, authorName }) => {
  const { notes, addComment, resolveComment } = useNotes();
  const note = notes.find(n => n.id === noteId);
  const [text, setText] = useState('');
  if (!note) return null;

  return (
    <View>
      <Text style={styles.title}>Comentários</Text>
      <View style={styles.row}>
        <TextInput value={text} onChangeText={setText} placeholder="Adicionar comentário..." style={styles.input} />
        <TouchableOpacity
          style={[styles.btn, !text.trim() && styles.disabled]}
          disabled={!text.trim()}
          onPress={() => { addComment(noteId, text.trim(), authorId, authorName); setText(''); }}
        >
          <Text style={styles.btnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ maxHeight: 220 }}>
        {(note.comments || []).map(c => (
          <View key={c.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.meta}>{c.authorName || c.authorId} · {c.createdAt.toLocaleString()}</Text>
              <Text>{c.content}</Text>
            </View>
            {!c.resolved && (
              <TouchableOpacity onPress={() => resolveComment(noteId, c.id)}>
                <Text style={styles.resolve}>Resolver</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  btn: { backgroundColor: '#007bff', paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', gap: 8 },
  meta: { color: '#666', fontSize: 12 },
  resolve: { color: '#2d5bd1', fontWeight: '600' },
});

