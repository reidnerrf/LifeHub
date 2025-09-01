import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNotes } from '../store/notes';

interface NoteSharingModalProps {
  visible: boolean;
  onClose: () => void;
  noteId: string;
}

export const NoteSharingModal: React.FC<NoteSharingModalProps> = ({ visible, onClose, noteId }) => {
  const { notes, shareNote, revokeShare } = useNotes();
  const note = notes.find(n => n.id === noteId);
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view');

  if (!note) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Compartilhar Nota</Text>
          <Text style={styles.subtitle}>{note.title}</Text>

          <View style={styles.row}>
            <TextInput
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
              style={styles.input}
            />
            <View style={styles.segmented}>
              {(['view','comment','edit'] as const).map(p => (
                <TouchableOpacity key={p} style={[styles.seg, permission === p && styles.segActive]} onPress={() => setPermission(p)}>
                  <Text style={[styles.segText, permission === p && styles.segTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primary, !userId && styles.disabled]}
            disabled={!userId}
            onPress={() => { shareNote(noteId, userId, permission); setUserId(''); }}
          >
            <Text style={styles.primaryText}>Adicionar</Text>
          </TouchableOpacity>

          <Text style={styles.section}>Usuários com acesso</Text>
          <ScrollView style={{ maxHeight: 180 }}>
            {(note.sharedWith || []).map(s => (
              <View key={s.userId} style={styles.shareItem}>
                <Text style={styles.shareUser}>{s.userId}</Text>
                <Text style={styles.sharePerm}>{s.permission}</Text>
                <TouchableOpacity onPress={() => revokeShare(noteId, s.userId)}>
                  <Text style={styles.remove}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 520 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#666', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  segmented: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 8 },
  seg: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  segActive: { backgroundColor: '#fff' },
  segText: { color: '#666' },
  segTextActive: { color: '#111', fontWeight: '600' },
  primary: { backgroundColor: '#007bff', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
  section: { fontWeight: '600', marginTop: 8, marginBottom: 6 },
  shareItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  shareUser: { fontWeight: '600' },
  sharePerm: { color: '#666' },
  remove: { color: '#b00020', fontWeight: '600' },
  close: { marginTop: 10, alignItems: 'center' },
  closeText: { color: '#555' },
});

