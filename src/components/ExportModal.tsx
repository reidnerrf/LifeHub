import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { reportService } from '../services/reportService';
import { ProductivityReport } from '../store/productivity';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  report: ProductivityReport | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ visible, onClose, report }) => {
  const disabled = !report;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Exportar Relatório</Text>
          <Text style={styles.subtitle}>Escolha o formato para exportação</Text>

          <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            disabled={disabled}
            onPress={() => {
              if (report) reportService.exportCSV(report);
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Exportar como CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            disabled={disabled}
            onPress={() => {
              if (report) reportService.exportJSON(report);
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Exportar como JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#aac8f7',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancel: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
  },
});

