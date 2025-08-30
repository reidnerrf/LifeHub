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
import { useSettings, Integration } from '../store/settings';

interface IntegrationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function IntegrationsModal({
  visible,
  onClose,
}: IntegrationsModalProps) {
  const {
    integrations,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    updateIntegration,
  } = useSettings();

  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const getProviderIcon = (provider: Integration['provider']) => {
    switch (provider) {
      case 'google':
        return 'logo-google';
      case 'trello':
        return 'grid';
      case 'icloud':
        return 'cloud';
      case 'notion':
        return 'document-text';
      case 'slack':
        return 'chatbubbles';
      case 'github':
        return 'logo-github';
      default:
        return 'link';
    }
  };

  const getProviderColor = (provider: Integration['provider']) => {
    switch (provider) {
      case 'google':
        return '#4285F4';
      case 'trello':
        return '#0079BF';
      case 'icloud':
        return '#007AFF';
      case 'notion':
        return '#000000';
      case 'slack':
        return '#4A154B';
      case 'github':
        return '#333333';
      default:
        return '#666666';
    }
  };

  const getProviderDescription = (provider: Integration['provider']) => {
    switch (provider) {
      case 'google':
        return 'Sincronize com Google Calendar, Drive e Gmail';
      case 'trello':
        return 'Importe e sincronize quadros e cartões';
      case 'icloud':
        return 'Sincronize com iCloud Calendar e Notes';
      case 'notion':
        return 'Importe páginas e bancos de dados';
      case 'slack':
        return 'Receba notificações e atualizações';
      case 'github':
        return 'Sincronize issues e pull requests';
      default:
        return 'Integração personalizada';
    }
  };

  const handleConnect = async (provider: Integration['provider']) => {
    setConnecting(provider);
    try {
      const success = await connectIntegration(provider);
      if (success) {
        Alert.alert('Sucesso', `Conectado ao ${provider} com sucesso!`);
      } else {
        Alert.alert('Erro', `Falha ao conectar ao ${provider}. Tente novamente.`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante a conexão.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (integration: Integration) => {
    Alert.alert(
      'Desconectar',
      `Tem certeza que deseja desconectar do ${integration.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: () => {
            disconnectIntegration(integration.id);
            Alert.alert('Sucesso', 'Desconectado com sucesso!');
          },
        },
      ]
    );
  };

  const handleSync = async (integration: Integration) => {
    setSyncing(integration.id);
    try {
      const success = await syncIntegration(integration.id);
      if (success) {
        Alert.alert('Sucesso', 'Sincronização realizada com sucesso!');
      } else {
        Alert.alert('Erro', 'Falha na sincronização. Tente novamente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante a sincronização.');
    } finally {
      setSyncing(null);
    }
  };

  const handleToggleSync = (integration: Integration) => {
    updateIntegration(integration.id, { syncEnabled: !integration.syncEnabled });
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

  const renderIntegrationCard = (integration: Integration) => (
    <View key={integration.id} style={styles.integrationCard}>
      <View style={styles.integrationHeader}>
        <View style={styles.providerInfo}>
          <View
            style={[
              styles.providerIcon,
              { backgroundColor: getProviderColor(integration.provider) },
            ]}
          >
            <Ionicons
              name={getProviderIcon(integration.provider)}
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{integration.name}</Text>
            <Text style={styles.providerDescription}>
              {getProviderDescription(integration.provider)}
            </Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          {integration.isConnected ? (
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          ) : (
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
          )}
        </View>
      </View>

      {integration.isConnected && (
        <>
          <View style={styles.integrationInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Última sincronização:</Text>
              <Text style={styles.infoValue}>
                {formatDate(integration.lastSync)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Frequência:</Text>
              <Text style={styles.infoValue}>
                {integration.syncFrequency === 'realtime' && 'Tempo real'}
                {integration.syncFrequency === 'hourly' && 'A cada hora'}
                {integration.syncFrequency === 'daily' && 'Diário'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipos de dados:</Text>
              <Text style={styles.infoValue}>
                {integration.dataTypes.join(', ')}
              </Text>
            </View>
          </View>

          <View style={styles.integrationSettings}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sincronização automática</Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: integration.syncEnabled ? '#34C759' : '#E0E0E0' },
                ]}
                onPress={() => handleToggleSync(integration)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{ translateX: integration.syncEnabled ? 20 : 0 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Permissões:</Text>
              <Text style={styles.settingValue}>
                {integration.permissions.join(', ')}
              </Text>
            </View>
          </View>

          <View style={styles.integrationActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSync(integration)}
              disabled={syncing === integration.id}
            >
              {syncing === integration.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.actionButtonText}>
                {syncing === integration.id ? 'Sincronizando...' : 'Sincronizar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => Alert.alert('Configurações', 'Configurações da integração')}
            >
              <Ionicons name="settings" size={16} color="#007AFF" />
              <Text style={styles.settingsButtonText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.connectionActions}>
        {integration.isConnected ? (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => handleDisconnect(integration)}
          >
            <Ionicons name="close" size={16} color="#FF3B30" />
            <Text style={styles.disconnectButtonText}>Desconectar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.connectButton,
              { backgroundColor: getProviderColor(integration.provider) },
            ]}
            onPress={() => handleConnect(integration.provider)}
            disabled={connecting === integration.provider}
          >
            {connecting === integration.provider ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="link" size={16} color="#FFFFFF" />
            )}
            <Text style={styles.connectButtonText}>
              {connecting === integration.provider ? 'Conectando...' : 'Conectar'}
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
          <Text style={styles.title}>Integrações</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Serviços Conectados</Text>
            <Text style={styles.sectionDescription}>
              Conecte seus serviços favoritos para sincronizar dados e melhorar sua produtividade.
            </Text>
          </View>

          <View style={styles.integrationsContainer}>
            {integrations.map(renderIntegrationCard)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas de Integração</Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Ionicons name="sync-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Mantenha as integrações sincronizadas para dados sempre atualizados
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Revise as permissões de cada integração regularmente
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="wifi-outline" size={16} color="#007AFF" />
                <Text style={styles.tipText}>
                  Use Wi-Fi para sincronizações mais rápidas e estáveis
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
  integrationsContainer: {
    gap: 15,
  },
  integrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  providerDescription: {
    fontSize: 14,
    color: '#666666',
  },
  statusIndicator: {
    padding: 5,
  },
  integrationInfo: {
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
    textAlign: 'right',
    flex: 1,
  },
  integrationSettings: {
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
    textAlign: 'right',
    flex: 1,
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
  integrationActions: {
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
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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