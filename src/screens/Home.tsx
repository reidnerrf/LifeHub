import React, { useEffect, useState } from 'react';

import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../services/api';
import VoiceRecognition from '../components/VoiceRecognition';
import { offlineSyncService } from '../services/offlineSyncService';
import { useGamification } from '../store/gamification';
import SwipeableDashboard from '../components/SwipeableDashboard';
import MotivationalQuote from '../components/MotivationalQuote';
import InteractiveProgressWidget from '../components/InteractiveProgressWidget';
import RoutineSummaryWidget from '../components/RoutineSummaryWidget';
import UpcomingRemindersWidget from '../components/UpcomingRemindersWidget';
import ProductivityInsightsWidget from '../components/ProductivityInsightsWidget';

const { width } = Dimensions.get('window');

export default function Home() {
  const t = useTheme();
  const {
    userProfile,
    getGamificationStats,
    getActiveQuests,
    achievements,
    quests
  } = useGamification();
  
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; description?: string }[]>([]);
  const [score, setScore] = useState<{ score: number; insights: string[] } | null>(null);
  const [todayItems, setTodayItems] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState(offlineSyncService.getSyncStatus());
  const [pendingOperations, setPendingOperations] = useState(offlineSyncService.getPendingOperations().length);
  const [gamificationStats, setGamificationStats] = useState(() => getGamificationStats());
  const [activeQuests, setActiveQuests] = useState(() => getActiveQuests());

  useEffect(() => {
    loadData();
    
    // Monitor sync status
    const interval = setInterval(() => {
      setSyncStatus(offlineSyncService.getSyncStatus());
      setPendingOperations(offlineSyncService.getPendingOperations().length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [suggestionsData, scoreData, todayData] = await Promise.all([
        api.listSuggestions(),
        api.scorePlanning({ 
          totalTasks: 3, 
          conflictingEvents: 0, 
          overbookedMinutes: 0, 
          freeBlocks: [{ 
            start: new Date().toISOString(), 
            end: new Date(Date.now()+60*60*1000).toISOString() 
          }] 
        }),
        api.listTodayItems()
      ]);
      
      setSuggestions(suggestionsData);
      setScore(scoreData);
      setTodayItems(todayData || []);
      
      // Dados de progresso mockados para demonstração
      setProgressData([
        { label: 'Tarefas Completas', value: 5, maxValue: 8 },
        { label: 'Hábitos do Dia', value: 3, maxValue: 5 },
        { label: 'Foco (min)', value: 120, maxValue: 180 },
        { label: 'Produtividade', value: 75, maxValue: 100 },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const executeVoiceCommand = async (command: string) => {
    try {
      const response = await api.voiceCommand({ text: command, locale: 'pt-BR' });
      if (response.ok) {
        Alert.alert('Comando Executado', response.feedback);
        loadData(); // Recarregar dados após ação
      } else {
        Alert.alert('Erro', response.error || 'Erro ao executar comando');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível executar o comando de voz');
    }
  };



  const QuickAction = ({ icon, title, onPress, color = t.primary }) => (
    <TouchableOpacity style={[styles.quickAction, { backgroundColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const TimelineItem = ({ item }) => (
    <View style={[styles.timelineItem, { backgroundColor: t.card }]}>
      <View style={[styles.timelineDot, { backgroundColor: getItemColor(item.type) }]} />
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, { color: t.text }]}>{item.title}</Text>
        <Text style={[styles.timelineTime, { color: t.textLight }]}>{item.time}</Text>
        {item.description && (
          <Text style={[styles.timelineDescription, { color: t.textLight }]}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  const getItemColor = (type: string) => {
    switch (type) {
      case 'task': return t.primary;
      case 'event': return t.secondary;
      case 'habit': return t.success;
      case 'pomodoro': return t.warning;
      default: return t.primary;
    }
  };

  // Componente para estatísticas de gamificação
  const GamificationStats = () => {
    const stats = getGamificationStats();
    return (
      <View style={[styles.card, { backgroundColor: t.card }]}>
        <Text style={[styles.cardTitle, { color: t.text }]}>Progresso do Nível</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color={t.warning} />
            <Text style={[styles.statValue, { color: t.text }]}>Nível {stats.level}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Experiência</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color={t.primary} />
            <Text style={[styles.statValue, { color: t.text }]}>{stats.totalPoints}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Pontos</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={24} color={t.success} />
            <Text style={[styles.statValue, { color: t.text }]}>{stats.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Sequência</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="medal" size={24} color={t.secondary} />
            <Text style={[styles.statValue, { color: t.text }]}>
              {stats.achievementsUnlocked}/{stats.totalAchievements}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Conquistas</Text>
          </View>
        </View>
        
        {/* Barra de progresso de experiência */}
        <View style={styles.experienceContainer}>
          <View style={styles.experienceBar}>
            <View 
              style={[
                styles.experienceProgress, 
                { 
                  width: `${(stats.experience / stats.experienceToNextLevel) * 100}%`,
                  backgroundColor: t.primary
                }
              ]} 
            />
          </View>
          <Text style={[styles.experienceText, { color: t.textLight }]}>
            {stats.experience}/{stats.experienceToNextLevel} XP
          </Text>
        </View>
      </View>
    );
  };

  // Componente para mostrar quests ativas
  const ActiveQuests = () => {
    const activeQuests = getActiveQuests();
    if (activeQuests.length === 0) return null;

    return (
      <View style={styles.questsContainer}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Missões Ativas</Text>
        {activeQuests.slice(0, 2).map((quest) => (
          <View key={quest.id} style={[styles.questCard, { backgroundColor: t.card }]}>
            <View style={styles.questHeader}>
              <Ionicons 
                name={quest.difficulty === 'easy' ? 'flag' : quest.difficulty === 'medium' ? 'flag' : 'flag'} 
                size={20} 
                color={getDifficultyColor(quest.difficulty)} 
              />
              <Text style={[styles.questTitle, { color: t.text }]}>{quest.title}</Text>
            </View>
            <Text style={[styles.questDescription, { color: t.textLight }]}>
              {quest.description}
            </Text>
            <View style={styles.questProgress}>
              <Text style={[styles.progressText, { color: t.textLight }]}>
                {quest.objective.current}/{quest.objective.target} {quest.objective.unit}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(quest.objective.current / quest.objective.target) * 100}%`,
                      backgroundColor: getDifficultyColor(quest.difficulty)
                    }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.questReward}>
              <Text style={[styles.rewardText, { color: t.warning }]}>
                +{quest.rewards.points} pontos
              </Text>
              <Text style={[styles.rewardText, { color: t.primary }]}>
                +{quest.rewards.experience} XP
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t.success;
      case 'medium': return t.warning;
      case 'hard': return t.error;
      case 'epic': return t.secondary;
      default: return t.primary;
    }
  };

  // Dashboard Views
  const OverviewDashboard = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>LifeHub</Text>
        <VoiceRecognition onCommandExecuted={loadData} />
      </View>

      {/* Sync Status Indicator */}
      {pendingOperations > 0 && (
        <View style={[styles.syncStatusCard, { backgroundColor: syncStatus.isOnline ? t.success : t.warning }]}>
          <Ionicons 
            name={syncStatus.isOnline ? "cloud-done" : "cloud-offline"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.syncStatusText}>
            {syncStatus.isOnline 
              ? `Sincronizando ${pendingOperations} operação${pendingOperations !== 1 ? 'es' : ''}...`
              : `${pendingOperations} operação${pendingOperations !== 1 ? 'es' : ''} pendente${pendingOperations !== 1 ? 's' : ''} (offline)`
            }
          </Text>
        </View>
      )}

      {/* Score Card */}
      {score && (
        <View style={[styles.card, { backgroundColor: t.card }]}> 
          <Text style={[styles.cardTitle, { color: t.text }]}>Como estou hoje</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color: t.text }]}>{score.score}</Text>
            <Text style={[styles.scoreLabel, { color: t.textLight }]}>/ 100</Text>
          </View>
          {score.insights.map((insight, idx) => (
            <Text key={idx} style={[styles.insight, { color: t.textLight }]}>• {insight}</Text>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Atalhos Rápidos</Text>
        <View style={styles.quickActions}>
          <QuickAction 
            icon="add-circle" 
            title="Tarefa" 
            onPress={() => executeVoiceCommand('adicionar tarefa')}
          />
          <QuickAction 
            icon="calendar" 
            title="Evento" 
            onPress={() => executeVoiceCommand('adicionar evento')}
            color={t.secondary}
          />
          <QuickAction 
            icon="document-text" 
            title="Nota" 
            onPress={() => executeVoiceCommand('adicionar nota')}
            color={t.success}
          />
          <QuickAction 
            icon="repeat" 
            title="Hábito" 
            onPress={() => executeVoiceCommand('adicionar hábito')}
            color={t.warning}
          />
        </View>
      </View>

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* Routine Summary Widget */}
      <RoutineSummaryWidget />

      {/* Upcoming Reminders Widget */}
      <UpcomingRemindersWidget />

      {/* Productivity Insights Widget */}
      <ProductivityInsightsWidget
        config={{
          timePeriod: 7,
          showAnimations: true,
          refreshInterval: 30,
          insightTypes: ['productivity', 'health', 'learning', 'social'],
        }}
      />

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Timeline de Hoje</Text>
        {todayItems.length > 0 ? (
          todayItems.map((item, index) => (
            <TimelineItem key={index} item={item} />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: t.card }]}>
            <Ionicons name="calendar-outline" size={48} color={t.textLight} />
            <Text style={[styles.emptyStateText, { color: t.textLight }]}>
              Nenhum item para hoje
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const ProductivityDashboard = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: t.text, marginBottom: 16 }]}>Produtividade</Text>
      
      {/* Interactive Progress Widget */}
      {progressData.length > 0 && (
        <InteractiveProgressWidget
          title="Progresso de Hoje"
          data={progressData}
          showControls={true}
        />
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Sugestões de IA</Text>
          {suggestions.map(suggestion => (
            <View key={suggestion.id} style={[styles.card, { backgroundColor: t.card }]}>
              <Text style={[styles.suggestionTitle, { color: t.text }]}>{suggestion.title}</Text>
              {suggestion.description && (
                <Text style={[styles.suggestionDescription, { color: t.textLight }]}>
                  {suggestion.description}
                </Text>
              )}
              <TouchableOpacity style={[styles.button, { backgroundColor: t.primary }]}>
                <Text style={styles.buttonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const GamificationDashboard = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: t.text, marginBottom: 16 }]}>Gamificação</Text>
      
      {/* Gamification Stats */}
      <GamificationStats />

      {/* Active Quests */}
      <ActiveQuests />
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <SwipeableDashboard>
        <OverviewDashboard />
        <ProductivityDashboard />
        <GamificationDashboard />
      </SwipeableDashboard>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: t.primary }]}
        onPress={() => executeVoiceCommand('adicionar tarefa')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  syncStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  syncStatusText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    marginLeft: 4,
  },
  insight: {
    fontSize: 14,
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 64) / 4,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  timelineContainer: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 12,
    marginTop: 2,
  },
  timelineDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 8,
  },
  chartsContainer: {
    marginBottom: 24,
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Gamification Styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  experienceContainer: {
    marginTop: 8,
  },
  experienceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  experienceProgress: {
    height: '100%',
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    textAlign: 'center',
  },
  questsContainer: {
    marginBottom: 24,
  },
  questCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  questDescription: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  questProgress: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questReward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
