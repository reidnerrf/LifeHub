import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvents, ExternalIntegration } from '../store/events';

interface ExternalIntegrationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ExternalIntegrationsModal: React.FC<ExternalIntegrationsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    externalIntegrations,
    connectExternalService,
    disconnectExternalService,
    syncWithExternalService,
    sendToSlack,
    sendToTeams,
  } = useEvents();

  const [connectingService, setConnectingService] = useState<string | null>(null);
  const [syncingService, setSyncingService] = useState<string | null>(null);
  const [showSlackForm, setShowSlackForm] = useState(false);
  const [showTeamsForm, setShowTeamsForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Form states
  const [slackFormData, setSlackFormData] = useState({
    channel: '',
    message: '',
  });

  const [teamsFormData, setTeamsFormData] = useState({
    channel: '',
    message: '',
  });

  const getServiceIcon = (type: ExternalIntegration['type']) => {
    switch (type) {
      case 'google':
        return 'logo-google';
      case 'outlook':
        return 'mail-outline';
      case 'slack':
        return 'logo-slack';
      case 'teams':
        return 'people-outline';
      default:
        return 'link-outline';
    }
  };

  const getServiceColor = (type: ExternalIntegration['type']) => {
    switch (type) {
      case 'google':
        return '#4285f4';
      case 'outlook':
        return '#0078d4';
      case 'slack':
        return '#4a154b';
      case 'teams':
        return '#6264a7';
      default:
        return '#666';
    }
  };

  const getServiceName = (type: ExternalIntegration['type']) => {
    switch (type) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook Calendar';
      case 'slack':
        return 'Slack';
      case 'teams':
        return 'Microsoft Teams';
      default:
        return 'Serviço';
    }
  };

  const handleConnect = async (type: ExternalIntegration['type']) => {
    setConnectingService(type);
    
    try {
      // Simular credenciais
      const credentials = {
        apiKey: 'demo-api-key',
        clientId: 'demo-client-id',
        clientSecret: 'demo-client-secret',
      };

      const success = await connectExternalService(type, credentials);
      
      if (success) {
        Alert.alert('Sucesso', `${getServiceName(type)} conectado com sucesso!`);
      } else {
        Alert.alert('Erro', `Falha ao conectar com ${getServiceName(type)}`);
      }
    } catch (error) {
      Alert.alert('Erro', `Erro ao conectar com ${getServiceName(type)}`);
    } finally {
      setConnectingService(null);
    }
  };

  const handleDisconnect = (type: ExternalIntegration['type']) => {
    Alert.alert(
      'Confirmar Desconexão',
      `Tem certeza que deseja desconectar do ${getServiceName(type)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: () => {
            disconnectExternalService(type);
            Alert.alert('Sucesso', `${getServiceName(type)} desconectado`);
          },
        },
      ]
    );
  };

  const handleSync = async (type: ExternalIntegration['type']) => {
    setSyncingService(type);
    
    try {
      const success = await syncWithExternalService(type);
      
      if (success) {
        Alert.alert('Sucesso', `Sincronização com ${getServiceName(type)} concluída!`);
      } else {
        Alert.alert('Erro', `Falha na sincronização com ${getServiceName(type)}`);
      }
    } catch (error) {
      Alert.alert('Erro', `Erro na sincronização com ${getServiceName(type)}`);
    } finally {
      setSyncingService(null);
    }
  };

  const handleSendToSlack = async () => {
    if (!slackFormData.channel.trim()) {
      Alert.alert('Erro', 'Canal é obrigatório');
      return;
    }

    try {
      const success = await sendToSlack(selectedEventId, slackFormData.channel);
      
      if (success) {
        Alert.alert('Sucesso', 'Evento enviado para o Slack!');
        setShowSlackForm(false);
        setSlackFormData({ channel: '', message: '' });
      } else {
        Alert.alert('Erro', 'Falha ao enviar para o Slack');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar para o Slack');
    }
  };

  const handleSendToTeams = async () => {
    if (!teamsFormData.channel.trim()) {
      Alert.alert('Erro', 'Canal é obrigatório');
      return;
    }

    try {
      const success = await sendToTeams(selectedEventId, teamsFormData.channel);
      
      if (success) {
        Alert.alert('Sucesso', 'Evento enviado para o Teams!');
        setShowTeamsForm(false);
        setTeamsFormData({ channel: '', message: '' });
      } else {
        Alert.alert('Erro', 'Falha ao enviar para o Teams');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar para o Teams');
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (minutes > 0) {
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else {
      return 'Agora mesmo';
    }
  };

  const renderIntegration = (integration: ExternalIntegration) => (
    <View key={integration.id} style={styles.integrationCard}>
      <View style={styles.integrationHeader}>
        <View style={styles.integrationInfo}>
          <View style={styles.integrationIcon}>
            <Ionicons 
              name={getServiceIcon(integration.type)} 
              size={24} 
              color={getServiceColor(integration.type)} 
            />
          </View>
          
          <View style={styles.integrationDetails}>
            <Text style={styles.integrationName}>{integration.name}</Text>
            <Text style={styles.integrationStatus}>
              {integration.isConnected ? 'Conectado' : 'Desconectado'}
            </Text>
            {integration.isConnected && (
              <Text style={styles.lastSync}>
                Última sincronização: {formatLastSync(integration.lastSync)}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.integrationStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: integration.isConnected ? '#28a745' : '#dc3545' }
          ]} />
        </View>
      </View>

      <View style={styles.integrationActions}>
        {!integration.isConnected ? (
          <TouchableOpacity
            style={[
              styles.connectButton,
              { backgroundColor: getServiceColor(integration.type) }
            ]}
            onPress={() => handleConnect(integration.type)}
            disabled={connectingService === integration.type}
          >
            {connectingService === integration.type ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="link" size={16} color="#fff" />
                <Text style={styles.connectButtonText}>Conectar</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.connectedActions}>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={() => handleSync(integration.type)}
              disabled={syncingService === integration.type}
            >
              {syncingService === integration.type ? (
                <ActivityIndicator size="small" color="#007bff" />
              ) : (
                <>
                  <Ionicons name="sync" size={16} color="#007bff" />
                  <Text style={styles.syncButtonText}>Sincronizar</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => handleDisconnect(integration.type)}
            >
              <Ionicons name="unlink" size={16} color="#dc3545" />
              <Text style={styles.disconnectButtonText}>Desconectar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderSlackForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Enviar para Slack</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Canal *</Text>
        <TextInput
          style={styles.input}
          value={slackFormData.channel}
          onChangeText={(text) => setSlackFormData(prev => ({ ...prev, channel: text }))}
          placeholder="#geral"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mensagem (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={slackFormData.message}
          onChangeText={(text) => setSlackFormData(prev => ({ ...prev, message: text }))}
          placeholder="Mensagem personalizada..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowSlackForm(false);
            setSlackFormData({ channel: '', message: '' });
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendToSlack}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTeamsForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Enviar para Teams</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Canal *</Text>
        <TextInput
          style={styles.input}
          value={teamsFormData.channel}
          onChangeText={(text) => setTeamsFormData(prev => ({ ...prev, channel: text }))}
          placeholder="Nome do canal"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mensagem (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={teamsFormData.message}
          onChangeText={(text) => setTeamsFormData(prev => ({ ...prev, message: text }))}
          placeholder="Mensagem personalizada..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowTeamsForm(false);
            setTeamsFormData({ channel: '', message: '' });
          }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendToTeams}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (showSlackForm) {
      return renderSlackForm();
    }

    if (showTeamsForm) {
      return renderTeamsForm();
    }

    return (
      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#007bff" />
            <Text style={styles.infoTitle}>Integrações Externas</Text>
            <Text style={styles.infoText}>
              Conecte sua agenda com outros serviços para sincronização automática e compartilhamento de eventos.
            </Text>
          </View>
        </View>

        <View style={styles.integrationsSection}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          {externalIntegrations.map(renderIntegration)}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setShowSlackForm(true)}
            >
              <Ionicons name="logo-slack" size={24} color="#4a154b" />
              <Text style={styles.quickActionText}>Enviar para Slack</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setShowTeamsForm(true)}
            >
              <Ionicons name="people-outline" size={24} color="#6264a7" />
              <Text style={styles.quickActionText}>Enviar para Teams</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (showSlackForm || showTeamsForm) {
                setShowSlackForm(false);
                setShowTeamsForm(false);
                setSlackFormData({ channel: '', message: '' });
                setTeamsFormData({ channel: '', message: '' });
              } else {
                onClose();
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#007bff" />
            <Text style={styles.backButtonText}>
              {showSlackForm || showTeamsForm ? 'Voltar' : 'Fechar'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {showSlackForm ? 'Enviar para Slack' :
             showTeamsForm ? 'Enviar para Teams' : 'Integrações Externas'}
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    margin: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  integrationsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  integrationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  integrationInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  integrationStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 12,
    color: '#999',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  integrationActions: {
    alignItems: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  connectedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  syncButtonText: {
    color: '#007bff',
    fontSize: 12,
    fontWeight: '500',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  disconnectButtonText: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});