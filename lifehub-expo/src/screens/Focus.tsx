import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useFocus, FocusMode } from '../store/focus';
import FocusReports from '../components/FocusReports';
import AudioManager from '../components/AudioManager';
import DistractionBlocker from '../components/DistractionBlocker';

const { width } = Dimensions.get('window');

export default function Focus() {
  const t = useTheme();
  const {
    currentSession,
    isRunning,
    remainingTime,
    mode,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    completeSession,
    interruptSession,
    getProductivityStats,
    getFocusStreak,
    getWeeklyGoal,
    isDistractionBlocking,
    currentPlaylist,
    currentAmbientSound,
    settings
  } = useFocus();

  const [showReports, setShowReports] = useState(false);
  const [showAudioManager, setShowAudioManager] = useState(false);
  const [showDistractionBlocker, setShowDistractionBlocker] = useState(false);
  const [selectedMode, setSelectedMode] = useState<FocusMode>('pomodoro');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        // O timer é gerenciado pelo store
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeLong = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStartSession = () => {
    if (currentSession) {
      if (isRunning) {
        pauseSession();
      } else {
        resumeSession();
      }
    } else {
      startSession(selectedMode);
    }
  };

  const handleStopSession = () => {
    Alert.alert(
      'Parar Sessão',
      'Tem certeza que deseja parar a sessão atual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Parar', 
          style: 'destructive',
          onPress: () => {
            stopSession();
            interruptSession();
          }
        }
      ]
    );
  };

  const handleCompleteSession = () => {
    Alert.alert(
      'Concluir Sessão',
      'Marcar esta sessão como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Concluir', 
          onPress: () => {
            completeSession();
          }
        }
      ]
    );
  };

  const getModeInfo = (mode: FocusMode) => {
    switch (mode) {
      case 'pomodoro':
        return {
          name: 'Pomodoro',
          description: '25min foco + 5min pausa',
          icon: 'timer',
          color: t.primary,
          duration: settings.pomodoroFocus
        };
      case 'flowtime':
        return {
          name: 'Flowtime',
          description: 'Sessão flexível de foco',
          icon: 'water',
          color: t.success,
          duration: settings.flowtimeMin
        };
      case 'deepwork':
        return {
          name: 'Deep Work',
          description: 'Sessão intensiva de 90min',
          icon: 'bulb',
          color: t.warning,
          duration: settings.deepworkMin
        };
    }
  };

  const getSessionStatus = () => {
    if (!currentSession) return 'idle';
    if (isRunning) return 'running';
    return 'paused';
  };

  const sessionStatus = getSessionStatus();
  const modeInfo = getModeInfo(selectedMode);
  const stats = getProductivityStats(7);
  const focusStreak = getFocusStreak();
  const weeklyGoal = getWeeklyGoal();

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Text style={[styles.title, { color: t.text }]}>Foco & Pomodoro</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowDistractionBlocker(true)}
            style={[
              styles.headerButton,
              { backgroundColor: isDistractionBlocking ? t.success : t.background }
            ]}
          >
            <Ionicons 
              name={isDistractionBlocking ? 'shield-checkmark' : 'shield-outline'} 
              size={20} 
              color={isDistractionBlocking ? '#fff' : t.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowAudioManager(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons 
              name={currentPlaylist || currentAmbientSound ? 'musical-notes' : 'musical-notes-outline'} 
              size={20} 
              color={currentPlaylist || currentAmbientSound ? t.primary : t.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowReports(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="analytics" size={20} color={t.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Seletor de Modo */}
      <View style={[styles.modeSelector, { backgroundColor: t.card }]}>
        {(['pomodoro', 'flowtime', 'deepwork'] as FocusMode[]).map((mode) => {
          const info = getModeInfo(mode);
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setSelectedMode(mode)}
              style={[
                styles.modeButton,
                { backgroundColor: t.background },
                selectedMode === mode && { backgroundColor: info.color + '20' }
              ]}
            >
              <Ionicons 
                name={info.icon as any} 
                size={24} 
                color={selectedMode === mode ? info.color : t.textLight} 
              />
              <Text style={[
                styles.modeName,
                { color: selectedMode === mode ? info.color : t.textLight }
              ]}>
                {info.name}
              </Text>
              <Text style={[
                styles.modeDescription,
                { color: selectedMode === mode ? info.color : t.textLight }
              ]}>
                {info.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timer Principal */}
      <View style={[styles.timerSection, { backgroundColor: t.card }]}>
        {currentSession ? (
          <>
            <View style={styles.sessionInfo}>
              <Text style={[styles.sessionType, { color: t.primary }]}>
                {getModeInfo(currentSession.type).name}
              </Text>
              <Text style={[styles.sessionStatus, { color: t.textLight }]}>
                {sessionStatus === 'running' ? 'Em andamento' : 'Pausado'}
              </Text>
            </View>
            
            <Text style={[styles.timer, { color: t.text }]}>
              {formatTime(remainingTime)}
            </Text>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${((currentSession.duration - remainingTime) / currentSession.duration) * 100}%`,
                    backgroundColor: getModeInfo(currentSession.type).color
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.sessionTime, { color: t.textLight }]}>
              {formatTimeLong(currentSession.actualDuration)} / {formatTimeLong(currentSession.duration)}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.timer, { color: t.text }]}>
              {formatTime(modeInfo.duration)}
            </Text>
            <Text style={[styles.readyText, { color: t.textLight }]}>
              Pronto para começar
            </Text>
          </>
        )}
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        {currentSession ? (
          <>
            <TouchableOpacity
              onPress={handleStartSession}
              style={[
                styles.controlButton,
                { backgroundColor: sessionStatus === 'running' ? t.warning : t.primary }
              ]}
            >
              <Ionicons 
                name={sessionStatus === 'running' ? 'pause' : 'play'} 
                size={24} 
                color="#fff" 
              />
              <Text style={[styles.controlButtonText, { color: '#fff' }]}>
                {sessionStatus === 'running' ? 'Pausar' : 'Continuar'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleCompleteSession}
              style={[styles.controlButton, { backgroundColor: t.success }]}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={[styles.controlButtonText, { color: '#fff' }]}>
                Concluir
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleStopSession}
              style={[styles.controlButton, { backgroundColor: t.error }]}
            >
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={[styles.controlButtonText, { color: '#fff' }]}>
                Parar
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleStartSession}
            style={[styles.controlButton, { backgroundColor: t.primary }]}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={[styles.controlButtonText, { color: '#fff' }]}>
              Iniciar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Estatísticas */}
      <View style={[styles.statsSection, { backgroundColor: t.card }]}>
        <Text style={[styles.statsTitle, { color: t.text }]}>Resumo da Semana</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color={t.primary} />
            <Text style={[styles.statValue, { color: t.text }]}>
              {formatTimeLong(stats.totalFocusTime)}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Tempo Total
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color={t.success} />
            <Text style={[styles.statValue, { color: t.text }]}>
              {Math.round(stats.completionRate)}%
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Conclusão
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flame" size={20} color={t.error} />
            <Text style={[styles.statValue, { color: t.text }]}>
              {focusStreak}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Sequência
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={t.warning} />
            <Text style={[styles.statValue, { color: t.text }]}>
              {Math.round(weeklyGoal.percentage)}%
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Meta Semanal
            </Text>
          </View>
        </View>
      </View>

      {/* Status de Áudio */}
      {(currentPlaylist || currentAmbientSound) && (
        <View style={[styles.audioStatus, { backgroundColor: t.card }]}>
          <Ionicons name="musical-notes" size={16} color={t.primary} />
          <Text style={[styles.audioStatusText, { color: t.text }]}>
            {currentPlaylist ? currentPlaylist.name : currentAmbientSound?.name}
          </Text>
          <TouchableOpacity onPress={() => setShowAudioManager(true)}>
            <Ionicons name="settings" size={16} color={t.textLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modais */}
      <FocusReports
        visible={showReports}
        onClose={() => setShowReports(false)}
      />

      <AudioManager
        visible={showAudioManager}
        onClose={() => setShowAudioManager(false)}
      />

      <DistractionBlocker
        visible={showDistractionBlocker}
        onClose={() => setShowDistractionBlocker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  timerSection: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    marginBottom: 20,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionStatus: {
    fontSize: 14,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  readyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sessionTime: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2 - 6,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  audioStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  audioStatusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

