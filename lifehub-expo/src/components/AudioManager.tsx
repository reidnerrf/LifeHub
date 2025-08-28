import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Slider
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useFocus, Playlist, AmbientSound } from '../store/focus';

interface AudioManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function AudioManager({ visible, onClose }: AudioManagerProps) {
  const t = useTheme();
  const { 
    playlists, 
    ambientSounds, 
    currentPlaylist, 
    currentAmbientSound,
    setPlaylist, 
    setAmbientSound,
    settings,
    updateSettings
  } = useFocus();
  
  const [activeTab, setActiveTab] = useState<'playlists' | 'ambient'>('playlists');
  const [volume, setVolume] = useState(settings.volume);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    updateSettings({ volume: value });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'focus': return 'bulb';
      case 'relax': return 'leaf';
      case 'energy': return 'flash';
      case 'nature': return 'tree';
      case 'ambient': return 'cloud';
      case 'white-noise': return 'radio';
      case 'instrumental': return 'musical-notes';
      case 'lo-fi': return 'headphones';
      case 'classical': return 'musical-note';
      default: return 'musical-notes';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'focus': return t.primary;
      case 'relax': return t.success;
      case 'energy': return t.warning;
      case 'nature': return t.success;
      case 'ambient': return t.primary;
      case 'white-noise': return t.textLight;
      case 'instrumental': return t.warning;
      case 'lo-fi': return t.primary;
      case 'classical': return t.error;
      default: return t.textLight;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min`;
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
            Áudio & Sons
          </Text>
          <View style={styles.headerIcon}>
            <Ionicons name="musical-notes" size={24} color={t.primary} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Controle de Volume */}
          <View style={[styles.volumeSection, { backgroundColor: t.card }]}>
            <View style={styles.volumeHeader}>
              <Ionicons name="volume-high" size={20} color={t.text} />
              <Text style={[styles.volumeTitle, { color: t.text }]}>
                Volume Geral
              </Text>
              <Text style={[styles.volumeValue, { color: t.primary }]}>
                {Math.round(volume * 100)}%
              </Text>
            </View>
            
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={t.primary}
              maximumTrackTintColor={t.border}
              thumbStyle={{ backgroundColor: t.primary }}
            />
            
            <View style={styles.volumeLabels}>
              <Text style={[styles.volumeLabel, { color: t.textLight }]}>0%</Text>
              <Text style={[styles.volumeLabel, { color: t.textLight }]}>100%</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabs, { backgroundColor: t.card }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('playlists')}
              style={[
                styles.tab,
                activeTab === 'playlists' && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={activeTab === 'playlists' ? t.primary : t.textLight} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'playlists' ? t.primary : t.textLight }
              ]}>
                Playlists
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('ambient')}
              style={[
                styles.tab,
                activeTab === 'ambient' && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons 
                name="leaf" 
                size={20} 
                color={activeTab === 'ambient' ? t.primary : t.textLight} 
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'ambient' ? t.primary : t.textLight }
              ]}>
                Sons Ambientes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Playlists */}
          {activeTab === 'playlists' && (
            <View style={styles.playlistsSection}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Playlists ({playlists.length})
              </Text>
              
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  onPress={() => setPlaylist(currentPlaylist?.id === playlist.id ? null : playlist)}
                  style={[
                    styles.playlistCard,
                    { backgroundColor: t.card },
                    currentPlaylist?.id === playlist.id && { 
                      backgroundColor: t.primary + '20',
                      borderColor: t.primary 
                    }
                  ]}
                >
                  <View style={styles.playlistHeader}>
                    <View style={styles.playlistInfo}>
                      <View style={styles.playlistIcon}>
                        <Ionicons 
                          name={getCategoryIcon(playlist.category)} 
                          size={24} 
                          color={getCategoryColor(playlist.category)} 
                        />
                      </View>
                      
                      <View style={styles.playlistDetails}>
                        <Text style={[
                          styles.playlistName,
                          { color: t.text },
                          currentPlaylist?.id === playlist.id && { color: t.primary, fontWeight: '600' }
                        ]}>
                          {playlist.name}
                        </Text>
                        <Text style={[styles.playlistDescription, { color: t.textLight }]}>
                          {playlist.description}
                        </Text>
                        <View style={styles.playlistMeta}>
                          <Text style={[styles.playlistMetaText, { color: t.textLight }]}>
                            {playlist.tracks.length} faixas
                          </Text>
                          <Text style={[styles.playlistMetaText, { color: t.textLight }]}>
                            {formatDuration(playlist.duration)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.playlistActions}>
                      {currentPlaylist?.id === playlist.id ? (
                        <Ionicons name="pause" size={24} color={t.primary} />
                      ) : (
                        <Ionicons name="play" size={24} color={t.textLight} />
                      )}
                    </View>
                  </View>
                  
                  {currentPlaylist?.id === playlist.id && (
                    <View style={styles.nowPlaying}>
                      <Text style={[styles.nowPlayingText, { color: t.primary }]}>
                        Tocando agora
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sons Ambientes */}
          {activeTab === 'ambient' && (
            <View style={styles.ambientSection}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Sons Ambientes ({ambientSounds.length})
              </Text>
              
              {ambientSounds.map((sound) => (
                <TouchableOpacity
                  key={sound.id}
                  onPress={() => setAmbientSound(currentAmbientSound?.id === sound.id ? null : sound)}
                  style={[
                    styles.ambientCard,
                    { backgroundColor: t.card },
                    currentAmbientSound?.id === sound.id && { 
                      backgroundColor: t.primary + '20',
                      borderColor: t.primary 
                    }
                  ]}
                >
                  <View style={styles.ambientHeader}>
                    <View style={styles.ambientInfo}>
                      <View style={styles.ambientIcon}>
                        <Ionicons 
                          name={getCategoryIcon(sound.category)} 
                          size={24} 
                          color={getCategoryColor(sound.category)} 
                        />
                      </View>
                      
                      <View style={styles.ambientDetails}>
                        <Text style={[
                          styles.ambientName,
                          { color: t.text },
                          currentAmbientSound?.id === sound.id && { color: t.primary, fontWeight: '600' }
                        ]}>
                          {sound.name}
                        </Text>
                        <Text style={[styles.ambientDescription, { color: t.textLight }]}>
                          {sound.description}
                        </Text>
                        <View style={styles.ambientMeta}>
                          <Text style={[styles.ambientMetaText, { color: t.textLight }]}>
                            {formatDuration(sound.duration)}
                          </Text>
                          <Text style={[styles.ambientMetaText, { color: t.textLight }]}>
                            {Math.round(sound.volume * 100)}% volume
                          </Text>
                          {sound.isLooping && (
                            <View style={styles.loopBadge}>
                              <Ionicons name="repeat" size={12} color={t.primary} />
                              <Text style={[styles.loopText, { color: t.primary }]}>
                                Loop
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.ambientActions}>
                      {currentAmbientSound?.id === sound.id ? (
                        <Ionicons name="pause" size={24} color={t.primary} />
                      ) : (
                        <Ionicons name="play" size={24} color={t.textLight} />
                      )}
                    </View>
                  </View>
                  
                  {currentAmbientSound?.id === sound.id && (
                    <View style={styles.nowPlaying}>
                      <Text style={[styles.nowPlayingText, { color: t.primary }]}>
                        Tocando agora
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Dicas */}
          <View style={[styles.tipsSection, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              💡 Dicas de Áudio
            </Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="bulb" size={16} color={t.warning} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Sons da natureza ajudam a reduzir o estresse e melhorar a concentração
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="musical-notes" size={16} color={t.primary} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Música instrumental sem letras é ideal para tarefas que requerem foco
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="radio" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Ruído branco pode ajudar a bloquear distrações sonoras
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="volume-low" size={16} color={t.error} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Mantenha o volume em 60-70% para não prejudicar a audição
              </Text>
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
  volumeSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  volumeTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
  volumeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  volumeLabel: {
    fontSize: 12,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playlistsSection: {
    marginBottom: 20,
  },
  ambientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  playlistCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playlistDetails: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  playlistMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  playlistMetaText: {
    fontSize: 12,
  },
  playlistActions: {
    padding: 8,
  },
  ambientCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ambientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ambientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  ambientIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ambientDetails: {
    flex: 1,
  },
  ambientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ambientDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  ambientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ambientMetaText: {
    fontSize: 12,
  },
  loopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  loopText: {
    fontSize: 10,
    fontWeight: '500',
  },
  ambientActions: {
    padding: 8,
  },
  nowPlaying: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  nowPlayingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsSection: {
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});