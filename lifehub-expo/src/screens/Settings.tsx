import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../store/settings';
import ThemeCustomizationModal from '../components/ThemeCustomizationModal';
import IconCustomizationModal from '../components/IconCustomizationModal';
import FontCustomizationModal from '../components/FontCustomizationModal';
import CloudBackupModal from '../components/CloudBackupModal';
import IntegrationsModal from '../components/IntegrationsModal';
import SmartNotificationsModal from '../components/SmartNotificationsModal';

export default function Settings() {
  const {
    userProfile,
    updatePreferences,
    saveProfile,
    loadProfile,
    getActiveTheme,
    getActiveIconSet,
    getActiveFont,
    getCloudBackups,
    getIntegrations,
    getNotifications,
    getSmartNotifications,
  } = useSettings();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showSmartNotificationsModal, setShowSmartNotificationsModal] = useState(false);

  const activeTheme = getActiveTheme();
  const activeIconSet = getActiveIconSet();
  const activeFont = getActiveFont();
  const cloudBackups = getCloudBackups();
  const integrations = getIntegrations();
  const notifications = getNotifications();
  const smartNotifications = getSmartNotifications();

  const handleLanguageChange = () => {
    Alert.alert(
      'Idioma',
      'Selecione o idioma:',
      [
        { text: 'Português (BR)', onPress: () => updatePreferences({ language: 'pt-BR' }) },
        { text: 'English (US)', onPress: () => updatePreferences({ language: 'en-US' }) },
        { text: 'Español', onPress: () => updatePreferences({ language: 'es-ES' }) },
        { text: 'Français', onPress: () => updatePreferences({ language: 'fr-FR' }) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Tema',
      'Selecione o tema:',
      [
        { text: 'Automático', onPress: () => updatePreferences({ theme: 'auto' }) },
        { text: 'Claro', onPress: () => updatePreferences({ theme: 'light' }) },
        { text: 'Escuro', onPress: () => updatePreferences({ theme: 'dark' }) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleFontSizeChange = () => {
    Alert.alert(
      'Tamanho da Fonte',
      'Selecione o tamanho:',
      [
        { text: 'Pequeno', onPress: () => updatePreferences({ fontSize: 'small' }) },
        { text: 'Médio', onPress: () => updatePreferences({ fontSize: 'medium' }) },
        { text: 'Grande', onPress: () => updatePreferences({ fontSize: 'large' }) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      await saveProfile();
      Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar perfil.');
    }
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'pt-BR':
        return 'Português (BR)';
      case 'en-US':
        return 'English (US)';
      case 'es-ES':
        return 'Español';
      case 'fr-FR':
        return 'Français';
      default:
        return code;
    }
  };

  const getThemeName = (theme: string) => {
    switch (theme) {
      case 'auto':
        return 'Automático';
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      default:
        return theme;
    }
  };

  const getFontSizeName = (size: string) => {
    switch (size) {
      case 'small':
        return 'Pequeno';
      case 'medium':
        return 'Médio';
      case 'large':
        return 'Grande';
      default:
        return size;
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    value?: string,
    onPress?: () => void,
    showArrow: boolean = true,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color="#007AFF" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {value && <Text style={styles.settingValue}>{value}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
          <Ionicons name="save" size={20} color="#007AFF" />
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Perfil do Usuário */}
        {renderSection('Perfil', (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={30} color="#FFFFFF" />
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{userProfile.name}</Text>
                  <Text style={styles.profileEmail}>{userProfile.email}</Text>
                  <Text style={styles.profileJoinDate}>
                    Membro desde {userProfile.joinDate.toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ))}

        {/* Preferências */}
        {renderSection('Preferências', (
          <>
            {renderSettingItem(
              'language',
              'Idioma',
              getLanguageName(userProfile.preferences.language),
              handleLanguageChange
            )}
            {renderSettingItem(
              'color-palette',
              'Tema',
              getThemeName(userProfile.preferences.theme),
              handleThemeChange
            )}
            {renderSettingItem(
              'text',
              'Tamanho da Fonte',
              getFontSizeName(userProfile.preferences.fontSize),
              handleFontSizeChange
            )}
            {renderSettingItem(
              'volume-high',
              'Som',
              undefined,
              undefined,
              false,
              <Switch
                value={userProfile.preferences.soundEnabled}
                onValueChange={(value) => updatePreferences({ soundEnabled: value })}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            )}
            {renderSettingItem(
              'phone-portrait',
              'Vibração',
              undefined,
              undefined,
              false,
              <Switch
                value={userProfile.preferences.vibrationEnabled}
                onValueChange={(value) => updatePreferences({ vibrationEnabled: value })}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            )}
          </>
        ))}

        {/* Personalização */}
        {renderSection('Personalização', (
          <>
            {renderSettingItem(
              'color-palette',
              'Temas',
              `${activeTheme.name}`,
              () => setShowThemeModal(true)
            )}
            {renderSettingItem(
              'images',
              'Ícones',
              `${activeIconSet.name}`,
              () => setShowIconModal(true)
            )}
            {renderSettingItem(
              'text',
              'Fontes',
              `${activeFont.name}`,
              () => setShowFontModal(true)
            )}
          </>
        ))}

        {/* Backup e Sincronização */}
        {renderSection('Backup e Sincronização', (
          <>
            {renderSettingItem(
              'cloud',
              'Backup em Nuvem',
              `${cloudBackups.filter(b => b.isConnected).length} conectado(s)`,
              () => setShowBackupModal(true)
            )}
            {renderSettingItem(
              'link',
              'Integrações',
              `${integrations.filter(i => i.isConnected).length} conectada(s)`,
              () => setShowIntegrationsModal(true)
            )}
          </>
        ))}

        {/* Notificações */}
        {renderSection('Notificações', (
          <>
            {renderSettingItem(
              'notifications',
              'Notificações Inteligentes',
              `${smartNotifications.filter(n => n.enabled).length} ativa(s)`,
              () => setShowSmartNotificationsModal(true)
            )}
            {renderSettingItem(
              'settings',
              'Configurações de Notificações',
              `${notifications.filter(n => n.enabled).length} ativa(s)`,
              () => Alert.alert('Notificações', 'Configurações de notificações')
            )}
          </>
        ))}

        {/* Sobre */}
        {renderSection('Sobre', (
          <>
            {renderSettingItem(
              'information-circle',
              'Versão do App',
              '1.0.0',
              undefined,
              false
            )}
            {renderSettingItem(
              'help-circle',
              'Ajuda e Suporte',
              undefined,
              () => Alert.alert('Ajuda', 'Central de ajuda e suporte')
            )}
            {renderSettingItem(
              'document-text',
              'Termos de Uso',
              undefined,
              () => Alert.alert('Termos', 'Termos de uso e privacidade')
            )}
            {renderSettingItem(
              'shield-checkmark',
              'Privacidade',
              undefined,
              () => Alert.alert('Privacidade', 'Política de privacidade')
            )}
          </>
        ))}

        {/* Conta */}
        {renderSection('Conta', (
          <>
            {renderSettingItem(
              'log-out',
              'Sair da Conta',
              undefined,
              () => Alert.alert('Sair', 'Tem certeza que deseja sair?'),
              false
            )}
            {renderSettingItem(
              'trash',
              'Excluir Conta',
              undefined,
              () => Alert.alert('Excluir', 'Esta ação não pode ser desfeita.'),
              false
            )}
          </>
        ))}
      </ScrollView>

      {/* Modais */}
      <ThemeCustomizationModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
      <IconCustomizationModal
        visible={showIconModal}
        onClose={() => setShowIconModal(false)}
      />
      <FontCustomizationModal
        visible={showFontModal}
        onClose={() => setShowFontModal(false)}
      />
      <CloudBackupModal
        visible={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
      <IntegrationsModal
        visible={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
      />
      <SmartNotificationsModal
        visible={showSmartNotificationsModal}
        onClose={() => setShowSmartNotificationsModal(false)}
      />
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
    marginBottom: 15,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCard: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#999999',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});