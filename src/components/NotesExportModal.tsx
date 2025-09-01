import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNotes } from '../store/notes';
import { noteExportService } from '../services/noteExportService';

interface NotesExportModalProps {
  visible: boolean;
  onClose: () => void;
  noteId?: string; // if provided, export single note; otherwise batch
}

export const NotesExportModal: React.FC<NotesExportModalProps> = ({ visible, onClose, noteId }) => {
  const { notes } = useNotes();
  const note = useMemo(() => notes.find(n => n.id === noteId), [notes, noteId]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Exportar Notas</Text>
          <Text style={styles.subtitle}>{note ? note.title : `Selecionadas: ${notes.length}`}</Text>

          <TouchableOpacity style={styles.btn} onPress={() => { if (note) noteExportService.exportPDF(note); else notes.forEach(n => noteExportService.exportPDF(n)); onClose(); }}>
            <Text style={styles.btnText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => { if (note) noteExportService.exportMarkdown(note); else noteExportService.exportBatchMarkdown(notes); onClose(); }}>
            <Text style={styles.btnText}>Markdown</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => { if (note) noteExportService.exportHTML(note); else notes.forEach(n => noteExportService.exportHTML(n)); onClose(); }}>
            <Text style={styles.btnText}>HTML</Text>
          </TouchableOpacity>

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
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 420 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#666', marginBottom: 12 },
  btn: { backgroundColor: '#007bff', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  close: { marginTop: 8, alignItems: 'center' },
  closeText: { color: '#555' },
});

