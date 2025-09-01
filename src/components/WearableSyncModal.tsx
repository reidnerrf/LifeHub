import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { wearableSyncService, WearableDataPoint } from '../services/wearableSyncService';
import { useProductivity } from '../store/productivity';

interface WearableSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WearableSyncModal: React.FC<WearableSyncModalProps> = ({ visible, onClose }) => {
  const [data, setData] = useState<WearableDataPoint[] | null>(null);
  const [syncing, setSyncing] = useState<'apple' | 'fitbit' | null>(null);
  const { addDataPoint } = useProductivity();

  const mergeIntoProductivity = (points: WearableDataPoint[]) => {
    // Simple merge: translate physical activity and sleep into productivity score nudges
    points.forEach(p => {
      const healthBoost = Math.min(10, Math.max(0, Math.round((p.sleepHours - 6) * 3)));
      addDataPoint({
        date: p.date,
        tasksCompleted: 0,
        focusMinutes: 0,
        habitsScore: Math.min(100, 70 + healthBoost),
        eventsCount: 0,
        productivityScore: Math.min(100, 60 + Math.floor(p.steps / 1000) + healthBoost),
      });
    });
  };

  const syncApple = async () => {
    setSyncing('apple');
    const points = await wearableSyncService.syncAppleWatch();
    setData(points);
    mergeIntoProductivity(points);
    setSyncing(null);
  };

  const syncFitbit = async () => {
    setSyncing('fitbit');
    const points = await wearableSyncService.syncFitbit();
    setData(points);
    mergeIntoProductivity(points);
    setSyncing(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Sincronizar Wearables</Text>
          <Text style={styles.subtitle}>Apple Watch e Fitbit</Text>

          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, syncing === 'apple' && styles.disabled]} disabled={!!syncing} onPress={syncApple}>
              <Text style={styles.btnText}>{syncing === 'apple' ? 'Sincronizando...' : 'Apple Watch'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, syncing === 'fitbit' && styles.disabled]} disabled={!!syncing} onPress={syncFitbit}>
              <Text style={styles.btnText}>{syncing === 'fitbit' ? 'Sincronizando...' : 'Fitbit'}</Text>
            </TouchableOpacity>
          </View>

          {data && (
            <ScrollView style={styles.list}>
              {data.map((p) => (
                <View key={p.date} style={styles.item}>
                  <Text style={styles.itemDate}>{p.date}</Text>
                  <Text style={styles.itemMeta}>Passos: {p.steps} · Sono: {p.sleepHours}h · Calorias: {p.calories}</Text>
                </View>
              ))}
            </ScrollView>
          )}

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
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 480 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#666', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  btn: { flex: 1, backgroundColor: '#007bff', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  disabled: { backgroundColor: '#aac8f7' },
  btnText: { color: '#fff', fontWeight: '600' },
  list: { maxHeight: 200, marginTop: 8 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemDate: { fontWeight: '600' },
  itemMeta: { color: '#666' },
  close: { marginTop: 12, alignItems: 'center' },
  closeText: { color: '#555' },
});

