import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { offlineSyncService } from '../services/offlineSyncService';
import { useNotes } from '../store/notes';
import { offlineDB } from '../services/offline/watermelon';

const OfflineSyncTester: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState(offlineSyncService.getSyncStatus());
  const [operations, setOperations] = useState(offlineSyncService.getOperations());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(offlineSyncService.getSyncStatus());
      setOperations(offlineSyncService.getOperations());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTestOperation = () => {
    offlineSyncService.addOperation({
      type: 'create',
      entityType: 'note',
      entityId: `test_${Date.now()}`,
      data: {
        title: 'Test Note',
        content: 'This is a test note created while offline',
        createdAt: new Date(),
      },
    });
  };

  const retryFailedOperations = () => {
    offlineSyncService.retryFailedOperations();
  };

  const clearCompletedOperations = () => {
    offlineSyncService.clearCompletedOperations();
  };

  const { notes, queueNoteForSync, markSynced } = useNotes();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Offline Sync Tester</Text>
      
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text>Online: {syncStatus.isOnline ? '✅' : '❌'}</Text>
        <Text>Processing: {syncStatus.processing ? '🔄' : '⏸️'}</Text>
        <Text>Pending Operations: {syncStatus.pendingOperations}</Text>
        <Text>Last Sync: {syncStatus.lastSync?.toLocaleTimeString() || 'Never'}</Text>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Button title="Add Test Operation" onPress={addTestOperation} />
        <Button title="Retry Failed Operations" onPress={retryFailedOperations} />
        <Button title="Clear Completed" onPress={clearCompletedOperations} />
      </View>

      <View style={styles.operationsSection}>
        <Text style={styles.sectionTitle}>Operations ({operations.length})</Text>
        {operations.map((op) => (
          <View key={op.id} style={styles.operationItem}>
            <Text style={styles.operationType}>{op.type.toUpperCase()} {op.entityType}</Text>
            <Text style={styles.operationStatus}>Status: {op.status}</Text>
            <Text style={styles.operationTime}>
              {op.timestamp.toLocaleTimeString()} - Retries: {op.retryCount}
            </Text>
            {op.error && <Text style={styles.operationError}>Error: {op.error}</Text>}
          </View>
        ))}
      </View>

      <View style={styles.operationsSection}>
        <Text style={styles.sectionTitle}>Notas Offline (demo)</Text>
        {notes.slice(0, 5).map((n) => (
          <View key={n.id} style={styles.operationItem}>
            <Text style={styles.operationType}>{n.title}</Text>
            <Text style={styles.operationStatus}>Pending: {n.pendingSync ? 'Yes' : 'No'}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.smallBtn} onPress={async () => {
                queueNoteForSync(n.id);
                await offlineDB.putNote({ id: n.id, title: n.title, content: n.content, notebook: n.notebook, updatedAt: Date.now(), pendingSync: true });
              }}>
                <Text style={styles.smallText}>Queue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => markSynced(n.id)}>
                <Text style={styles.smallText}>Mark Synced</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  operationsSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  operationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  operationType: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  operationStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  operationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  operationError: {
    fontSize: 12,
    color: 'red',
    fontStyle: 'italic',
  },
  smallBtn: {
    backgroundColor: '#eef3ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallText: { color: '#2d5bd1', fontWeight: '600' },
});
