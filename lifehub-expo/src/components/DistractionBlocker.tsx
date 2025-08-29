import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useFocus } from '../store/focus';

interface DistractionBlockerProps {
  visible: boolean;
  onClose: () => void;
}

interface UsefulLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'productivity' | 'learning' | 'tools' | 'inspiration';
  icon: string;
}

export default function DistractionBlocker({ visible, onClose }: DistractionBlockerProps) {
  const t = useTheme();
  const { isDistractionBlocking, toggleDistractionBlocking, settings, updateSettings } = useFocus();
  
  const [activeTab, setActiveTab] = useState<'blocking' | 'links' | 'settings'>('blocking');

  const usefulLinks: UsefulLink[] = [
    {
      id: '1',
      title: 'Pomodoro Timer',
      description: 'Técnica de gerenciamento de tempo',
      url: 'https://pomofocus.io',
      category: 'productivity',
      icon: 'timer',
    },
    {
      id: '2',
      title: 'Forest App',
      description: 'Plante árvores enquanto foca',
      url: 'https://www.forestapp.cc',
      category: 'productivity',
      icon: 'leaf',
    },
    {
      id: '3',
      title: 'Notion',
      description: 'Workspace para organização',
      url: 'https://notion.so',
      category: 'tools',
      icon: 'document-text',
    },
    {
      id: '4',
      title: 'Coursera',
      description: 'Cursos online gratuitos',
      url: 'https://coursera.org',
      category: 'learning',
      icon: 'school',
    },
    {
      id: '5',
      title: 'Medium',
      description: 'Artigos sobre produtividade',
      url: 'https://medium.com',
      category: 'inspiration',
      icon: 'book',
    },
    {
      id: '6',
      title: 'Trello',
      description: 'Organização de tarefas',
      url: 'https://trello.com',
      category: 'tools',
      icon: 'grid',
    },
    {
      id: '7',
      title: 'Khan Academy',
      description: 'Aprenda qualquer coisa',
      url: 'https://khanacademy.org',
      category: 'learning',
      icon: 'library',
    },
    {
      id: '8',
      title: 'Calm',
      description: 'Meditação e relaxamento',
      url: 'https://calm.com',
      category: 'inspiration',
      icon: 'heart',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return t.primary;
      case 'learning': return t.success;
      case 'tools': return t.warning;
      case 'inspiration': return t.error;
      default: return t.textLight;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return 'rocket';
      case 'learning': return 'school';
      case 'tools': return 'construct';
      case 'inspiration': return 'bulb';
      default: return 'link';
    }
  };

  const handleLinkPress = (link: UsefulLink) => {
    Alert.alert(
      'Abrir Link',
      `Deseja abrir "${link.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Abrir', 
          onPress: () => {
            // Aqui você pode implementar a abertura do link
            Alert.alert('Link', `Abrindo: ${link.url}`);
          }
        }
      ]
    );
  };

  const handleBlockingToggle = () => {
    toggleDistractionBlocking();
    Alert.alert(
      isDistractionBlocking ? 'Bloqueio Desativado' : 'Bloqueio Ativado',
      isDistractionBlocking 
        ? 'Você pode acessar sites normalmente agora.'
        : 'Sites de distração serão bloqueados durante sessões de foco.'
    );
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
            Bloqueio de Distrações
          </Text>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={24} color={t.primary} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tabs */}
          <View style={[styles.tabs, { backgroundColor: t.card }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('blocking')}
              style={[
                styles.tab,
                activeTab === 'blocking' && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons 
                name="shield" 
                size={20} 
                color={activeTab === 'blocking' ? t.primary : t.textLight} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'blocking' ? t.primary : t.textLight }
              ]}>
                Bloqueio
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('links')}
              style={[
                styles.tab,
                activeTab === 'links' && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons 
                name="link" 
                size={20} 
                color={activeTab === 'links' ? t.primary : t.textLight} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'links' ? t.primary : t.textLight }
              ]}>
                Links Úteis
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('settings')}
              style={[
                styles.tab,
                activeTab === 'settings' && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons 
                name="settings" 
                size={20} 
                color={activeTab === 'settings' ? t.primary : t.textLight} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'settings' ? t.primary : t.textLight }
              ]}>
                Configurações
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bloqueio */}
          {activeTab === 'blocking' && (
            <View style={styles.blockingSection}>
              <View style={[styles.blockingCard, { backgroundColor: t.card }]}>
                <View style={styles.blockingHeader}>
                  <Ionicons 
                    name={isDistractionBlocking ? 'shield-checkmark' : 'shield-outline'} 
                    size={32} 
                    color={isDistractionBlocking ? t.success : t.textLight} 
                  />
                  <Text style={[styles.blockingTitle, { color: t.text }]}>
                    Bloqueio de Distrações
                  </Text>
                </View>
                
                <Text style={[styles.blockingDescription, { color: t.textLight }]}>
                  {isDistractionBlocking 
                    ? 'Ativo - Sites de distração serão bloqueados durante sessões de foco'
                    : 'Inativo - Você pode acessar todos os sites normalmente'
                  }
                </Text>
                
                <TouchableOpacity
                  onPress={handleBlockingToggle}
                  style={[
                    styles.blockingButton,
                    { backgroundColor: isDistractionBlocking ? t.error : t.success }
                  ]}
                >
                  <Ionicons 
                    name={isDistractionBlocking ? 'close-circle' : 'checkmark-circle'} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={[styles.blockingButtonText, { color: '#fff' }]}>
                    {isDistractionBlocking ? 'Desativar Bloqueio' : 'Ativar Bloqueio'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.blockedSites, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Sites Bloqueados
                </Text>
                
                <View style={styles.siteList}>
                  {['facebook.com', 'instagram.com', 'twitter.com', 'youtube.com', 'reddit.com', 'tiktok.com'].map((site) => (
                    <View key={site} style={styles.siteItem}>
                      <Ionicons name="close-circle" size={16} color={t.error} />
                      <Text style={[styles.siteText, { color: t.text }]}>
                        {site}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.blockingInfo, { backgroundColor: t.card }]}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>
                  Como Funciona
                </Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="timer" size={16} color={t.primary} />
                  <Text style={[styles.infoText, { color: t.textLight }]}>
                    Bloqueio ativo apenas durante sessões de foco
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="shield" size={16} color={t.success} />
                  <Text style={[styles.infoText, { color: t.textLight }]}>
                    Bloqueio suave - você pode desativar se necessário
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="notifications" size={16} color={t.warning} />
                  <Text style={[styles.infoText, { color: t.textLight }]}>
                    Notificações quando tentar acessar sites bloqueados
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Links Úteis */}
          {activeTab === 'links' && (
            <View style={styles.linksSection}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Links Úteis para Produtividade
              </Text>
              
              {['productivity', 'learning', 'tools', 'inspiration'].map((category) => (
                <View key={category} style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Ionicons 
                      name={getCategoryIcon(category)} 
                      size={20} 
                      color={getCategoryColor(category)} 
                    />
                    <Text style={[styles.categoryTitle, { color: t.text }]}>
                      {category === 'productivity' ? 'Produtividade' :
                       category === 'learning' ? 'Aprendizado' :
                       category === 'tools' ? 'Ferramentas' : 'Inspiração'}
                    </Text>
                  </View>
                  
                  {usefulLinks
                    .filter(link => link.category === category)
                    .map((link) => (
                      <TouchableOpacity
                        key={link.id}
                        onPress={() => handleLinkPress(link)}
                        style={[styles.linkCard, { backgroundColor: t.card }]}
                      >
                        <View style={styles.linkInfo}>
                          <View style={styles.linkIcon}>
                            <Ionicons name={link.icon as any} size={20} color={getCategoryColor(category)} />
                          </View>
                          
                          <View style={styles.linkDetails}>
                            <Text style={[styles.linkTitle, { color: t.text }]}>
                              {link.title}
                            </Text>
                            <Text style={[styles.linkDescription, { color: t.textLight }]}>
                              {link.description}
                            </Text>
                            <Text style={[styles.linkUrl, { color: t.primary }]}>
                              {link.url}
                            </Text>
                          </View>
                        </View>
                        
                        <Ionicons name="open-outline" size={20} color={t.textLight} />
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </View>
          )}

          {/* Configurações */}
          {activeTab === 'settings' && (
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Configurações de Bloqueio
              </Text>
              
              <View style={[styles.settingItem, { backgroundColor: t.card }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={20} color={t.warning} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: t.text }]}>
                      Notificações de Bloqueio
                    </Text>
                    <Text style={[styles.settingDescription, { color: t.textLight }]}>
                      Alertar quando tentar acessar sites bloqueados
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.toggleButton}>
                  <View style={[styles.toggle, { backgroundColor: t.primary }]}>
                    <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={[styles.settingItem, { backgroundColor: t.card }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name="timer" size={20} color={t.primary} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: t.text }]}>
                      Bloqueio Automático
                    </Text>
                    <Text style={[styles.settingDescription, { color: t.textLight }]}>
                      Ativar bloqueio automaticamente em sessões de foco
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.toggleButton}>
                  <View style={[styles.toggle, { backgroundColor: t.primary }]}>
                    <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={[styles.settingItem, { backgroundColor: t.card }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name="stats-chart" size={20} color={t.success} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: t.text }]}>
                      Relatórios de Bloqueio
                    </Text>
                    <Text style={[styles.settingDescription, { color: t.textLight }]}>
                      Mostrar estatísticas de sites bloqueados
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.toggleButton}>
                  <View style={[styles.toggle, { backgroundColor: t.primary }]}>
                    <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={[styles.settingItem, { backgroundColor: t.card }]}>
                <View style={styles.settingInfo}>
                  <Ionicons name="shield" size={20} color={t.error} />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: t.text }]}>
                      Modo Estrito
                    </Text>
                    <Text style={[styles.settingDescription, { color: t.textLight }]}>
                      Bloqueio mais rigoroso (requer senha para desativar)
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.toggleButton}>
                  <View style={[styles.toggle, { backgroundColor: t.border }]}>
                    <View style={[styles.toggleThumb, { backgroundColor: '#fff' }]} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
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
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  blockingSection: {
    gap: 20,
  },
  blockingCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  blockingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  blockingTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  blockingDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  blockingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  blockingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  blockedSites: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  siteList: {
    gap: 8,
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  siteText: {
    fontSize: 14,
  },
  blockingInfo: {
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
  linksSection: {
    gap: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkDetails: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 12,
  },
  settingsSection: {
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
});