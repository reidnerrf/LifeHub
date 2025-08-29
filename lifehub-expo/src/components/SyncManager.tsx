import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useEvents } from '../store/events';

interface SyncManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function SyncManager({ visible, onClose }: SyncManagerProps) {
  const t = useTheme();
  const { syncStatus, syncWithGoogle, syncWithOutlook } = useEvents();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithGoogle();
      Alert.alert('Sucesso', 'Sincronização com Google Calendar concluída!');
    } catch (error) {
      Alert.alert('Erro', 'Falha na sincronização com Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOutlookSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithOutlook();
      Alert.alert('Sucesso', 'Sincronização com Outlook concluída!');
    } catch (error) {
      Alert.alert('Erro', 'Falha na sincronização com Outlook');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return t.success;
      case 'syncing': return t.warning;
      case 'error': return t.error;
      default: return t.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return 'checkmark-circle';
      case 'syncing': return 'sync';
      case 'error': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'syncing': return 'Sincronizando...';
      case 'error': return 'Erro';
      default: return 'Desconectado';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Sincronização de Calendário
          </Text>
          <View style={styles.headerIcon}>
            <Ionicons name="sync" size={24} color={t.primary} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Geral */}
          <View style={[styles.statusSection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Status das Conexões
            </Text>
            
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <View style={styles.statusHeader}>
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                  <Text style={[styles.serviceName, { color: t.text }]}>
                    Google Calendar
                  </Text>
                </View>
                
                <View style={styles.statusInfo}>
                  <Ionicons 
                    name={getStatusIcon(syncStatus.google)} 
                    size={20} 
                    color={getStatusColor(syncStatus.google)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(syncStatus.google) }]}>
                    {getStatusText(syncStatus.google)}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.syncButton,
                    { backgroundColor: syncStatus.google === 'connected' ? t.success : t.primary }
                  ]}
                  onPress={handleGoogleSync}
                  disabled={isSyncing}
                >
                  <Ionicons 
                    name={isSyncing ? 'sync' : 'sync-outline'} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={[styles.syncButtonText, { color: '#fff' }]}>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statusItem}>
                <View style={styles.statusHeader}>
                  <Ionicons name="mail" size={24} color="#0078D4" />
                  <Text style={[styles.serviceName, { color: t.text }]}>
                    Outlook Calendar
                  </Text>
                </View>
                
                <View style={styles.statusInfo}>
                  <Ionicons 
                    name={getStatusIcon(syncStatus.outlook)} 
                    size={20} 
                    color={getStatusColor(syncStatus.outlook)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(syncStatus.outlook) }]}>
                    {getStatusText(syncStatus.outlook)}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.syncButton,
                    { backgroundColor: syncStatus.outlook === 'connected' ? t.success : t.primary }
                  ]}
                  onPress={handleOutlookSync}
                  disabled={isSyncing}
                >
                  <Ionicons 
                    name={isSyncing ? 'sync' : 'sync-outline'} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={[styles.syncButtonText, { color: '#fff' }]}>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Configurações de Sincronização */}
          <View style={[styles.settingsSection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Configurações
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="time" size={20} color={t.primary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: t.text }]}>
                    Sincronização Automática
                  </Text>
                  <Text style={[styles.settingDescription, { color: t.textLight }]}>
                    Sincronizar a cada 15 minutos
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.toggleButton}>
                <View style={[styles.toggle, { backgroundColor: t.primary }]}>
                  <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color={t.warning} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: t.text }]}>
                    Notificações de Conflito
                  </Text>
                  <Text style={[styles.settingDescription, { color: t.textLight }]}>
                    Alertar sobre eventos conflitantes
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.toggleButton}>
                <View style={[styles.toggle, { backgroundColor: t.primary }]}>
                  <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="cloud-upload" size={20} color={t.success} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: t.text }]}>
                    Sincronização Bidirecional
                  </Text>
                  <Text style={[styles.settingDescription, { color: t.textLight }]}>
                    Eventos locais aparecem no Google/Outlook
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.toggleButton}>
                <View style={[styles.toggle, { backgroundColor: t.primary }]}>
                  <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Informações de Sincronização */}
          <View style={[styles.infoSection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Como Funciona
            </Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="arrow-down" size={16} color={t.primary} />
              <Text style={[styles.infoText, { color: t.textLight }]}>
                Eventos do Google/Outlook são importados automaticamente
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="arrow-up" size={16} color={t.success} />
              <Text style={[styles.infoText, { color: t.textLight }]}>
                Eventos criados no app são enviados para os calendários externos
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="sync" size={16} color={t.warning} />
              <Text style={[styles.infoText, { color: t.textLight }]}>
                Mudanças são sincronizadas em tempo real
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={16} color={t.success} />
              <Text style={[styles.infoText, { color: t.textLight }]}>
                Suas informações são protegidas e criptografadas
              </Text>
            </View>
          </View>

          {/* Última Sincronização */}
          <View style={[styles.lastSyncSection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Última Sincronização
            </Text>
            
            <View style={styles.lastSyncItem}>
              <Ionicons name="logo-google" size={16} color="#4285F4" />
              <Text style={[styles.lastSyncText, { color: t.textLight }]}>
                Google Calendar: {new Date().toLocaleString('pt-BR')}
              </Text>
            </View>
            
            <View style={styles.lastSyncItem}>
              <Ionicons name="mail" size={16} color="#0078D4" />
              <Text style={[styles.lastSyncText, { color: t.textLight }]}>
                Outlook: {new Date().toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: t.card }]}>
          <TouchableOpacity
            style={[styles.syncAllButton, { backgroundColor: t.primary }]}
            onPress={() => {
              handleGoogleSync();
              handleOutlookSync();
            }}
            disabled={isSyncing}
          >
            <Ionicons name="sync" size={20} color="#fff" />
            <Text style={[styles.syncAllButtonText, { color: '#fff' }]}>
              Sincronizar Todos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusGrid: {
    gap: 16,
  },
  statusItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  toggleButton: {
    padding: 4,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  lastSyncSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  lastSyncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  lastSyncText: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  syncAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  syncAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});