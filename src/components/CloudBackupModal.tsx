import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, CloudBackup } from '../store/settings';

interface CloudBackupModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CloudBackupModal({
  visible,
  onClose,
}: CloudBackupModalProps) {
  const {
    cloudBackups,
    connectCloudBackup,
    disconnectCloudBackup,
    performBackup,
    restoreBackup,
    updateCloudBackup,
  } = useSettings();

  const [connecting, setConnecting] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const getProviderIcon = (provider: CloudBackup['provider']) => {
    switch (provider) {
      case 'google':
        return 'logo-google';
      case 'icloud':
        return 'cloud';
      case 'dropbox':
        return 'logo-dropbox';
      case 'onedrive':
        return 'logo-microsoft';
      default:
        return 'cloud';
    }
  };

  const getProviderName = (provider: CloudBackup['provider']) => {
    switch (provider) {
      case 'google':
        return 'Google Drive';
      case 'icloud':
        return 'iCloud';
      case 'dropbox':
        return 'Dropbox';
      case 'onedrive':
        return 'OneDrive';
      default:
        return provider;
    }
  };

  const getProviderColor = (provider: CloudBackup['provider']) => {
    switch (provider) {
      case 'google':
        return '#4285F4';
      case 'icloud':
        return '#007AFF';
      case 'dropbox':
        return '#0061FF';
      case 'onedrive':
        return '#0078D4';
      default:
        return '#666666';
    }
  };

  const handleConnect = async (provider: CloudBackup['provider']) => {
    setConnecting(provider);
    try {
      const success = await connectCloudBackup(provider);
      if (success) {
        Alert.alert('Sucesso', `Conectado ao ${getProviderName(provider)} com sucesso!`);
      } else {
        Alert.alert('Erro', `Falha ao conectar ao ${getProviderName(provider)}. Tente novamente.`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante a conexão.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (backup: CloudBackup) => {
    Alert.alert(
      'Desconectar',
      `Tem certeza que deseja desconectar do ${getProviderName(backup.provider)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: () => {
            disconnectCloudBackup(backup.id);
            Alert.alert('Sucesso', 'Desconectado com sucesso!');
          },
        },
      ]
    );
  };

  const handleBackup = async (backup: CloudBackup) => {
    setBackingUp(backup.id);
    try {
      const success = await performBackup(backup.id);
      if (success) {
        Alert.alert('Sucesso', 'Backup realizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Falha ao realizar backup. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante o backup.');
    } finally {
      setBackingUp(null);
    }
  };

  const handleRestore = async (backup: CloudBackup) => {
    Alert.alert(
      'Restaurar Backup',
      `Tem certeza que deseja restaurar o backup do ${getProviderName(backup.provider)}? Isso substituirá os dados atuais.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            setRestoring(backup.id);
            try {
              const success = await restoreBackup(backup.id);
              if (success) {
                Alert.alert('Sucesso', 'Backup restaurado com sucesso!');
              } else {
                Alert.alert('Erro', 'Falha ao restaurar backup. Tente novamente.');
              }
            } catch (error) {
              Alert.alert('Erro', 'Ocorreu um erro durante a restauração.');
            } finally {
              setRestoring(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleAutoBackup = (backup: CloudBackup) => {
    updateCloudBackup(backup.id, { autoBackup: !backup.autoBackup });
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBackupCard = (backup: CloudBackup) => (
    <View key={backup.id} style={styles.backupCard}>
      <View style={styles.backupHeader}>
        <View style={styles.providerInfo}>
          <View
            style={[
              styles.providerIcon,
              { backgroundColor: getProviderColor(backup.provider) },
            ]}
          >
            <Ionicons
              name={getProviderIcon(backup.provider)}
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>
              {getProviderName(backup.provider)}
            </Text>
            <Text style={styles.providerStatus}>
              {backup.isConnected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          {backup.isConnected ? (
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          ) : (
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
          )}
        </View>
      </View>

      {backup.isConnected && (
        <>
          <View style={styles.backupInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Último backup:</Text>
              <Text style={styles.infoValue}>
                {formatDate(backup.lastBackup)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Armazenamento:</Text>
              <Text style={styles.infoValue}>
                {formatStorage(backup.storageUsed)} / {formatStorage(backup.storageLimit)}
              </Text>
            </View>
            <View style={styles.storageBar}>
              <View
                style={[
                  styles.storageProgress,
                  {
                    width: `${(backup.storageUsed / backup.storageLimit) * 100}%`,
                    backgroundColor: getProviderColor(backup.provider),
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.backupSettings}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Backup automático</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: backup.autoBackup ? '#34C759' : '#E0E0E0' },
                ]}
                onPress={() => handleToggleAutoBackup(backup)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: backup.autoBackup ? 20 : 0 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Frequência:</Text>
              <Text style={styles.settingValue}>
                {backup.backupFrequency === 'daily' && 'Diário'}
                {backup.backupFrequency === 'weekly' && 'Semanal'}
                {backup.backupFrequency === 'monthly' && 'Mensal'}
              </Text>
            </View>
          </View>

          <View style={styles.backupActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleBackup(backup)}
              disabled={backingUp === backup.id}
            >
              {backingUp === backup.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.actionButtonText}>
                {backingUp === backup.id ? 'Fazendo backup...' : 'Fazer Backup'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.restoreButton]}
              onPress={() => handleRestore(backup)}
              disabled={restoring === backup.id}
            >
              {restoring === backup.id ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="cloud-download" size={16} color="#007AFF" />
              )}
              <Text style={[styles.actionButtonText, styles.restoreButtonText]}>
                {restoring === backup.id ? 'Restaurando...' : 'Restaurar'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.connectionActions}>
        {backup.isConnected ? (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => handleDisconnect(backup)}
          >
            <Ionicons name="close" size={16} color="#FF3B30" />
            <Text style={styles.disconnectButtonText}>Desconectar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.connectButton,
              { backgroundColor: getProviderColor(backup.provider) },
            ]}
            onPress={() => handleConnect(backup.provider)}
            disabled={connecting === backup.provider}
          >
            {connecting === backup.provider ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="link" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.connectButtonText}>
              {connecting === backup.provider ? 'Conectando...' : 'Conectar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Backup em Nuvem</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Serviços de Nuvem</Text>
            <Text style={styles.sectionDescription}>
              Conecte seus serviços de nuvem favoritos para fazer backup automático dos seus dados.
            </Text>
          </View>

          <View style={styles.backupsContainer}>
            {cloudBackups.map(renderBackupCard)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas de Backup</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Mantenha backups regulares para proteger seus dados
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="wifi-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Conecte-se ao Wi-Fi para backups mais rápidos
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="time-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Configure backup automático para não esquecer
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  backupsContainer: {
    gap: 15,
  },
  backupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  providerStatus: {
    fontSize: 14,
    color: '#666666',
  },
  statusIndicator: {
    padding: 5,
  },
  backupInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  storageBar: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginTop: 8,
  },
  storageProgress: {
    height: '100%',
    borderRadius: 2,
  },
  backupSettings: {
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 14,
    color: '#000000',
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  restoreButton: {
    backgroundColor: '#F0F0F0',
  },
  restoreButtonText: {
    color: '#007AFF',
  },
  connectionActions: {
    alignItems: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  disconnectButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
    flex: 1,
  },
});