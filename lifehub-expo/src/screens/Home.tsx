import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { api } from '../services/api';
import ProgressChart from '../components/ProgressChart';
import VoiceRecognition from '../components/VoiceRecognition';

const { width } = Dimensions.get('window');

export default function Home() {
  const t = useTheme();
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; description?: string }[]>([]);
  const [score, setScore] = useState<{ score: number; insights: string[] } | null>(null);
  const [todayItems, setTodayItems] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [progressData, setProgressData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
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

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>LifeHub</Text>
          <VoiceRecognition onCommandExecuted={loadData} />
        </View>

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

        {/* Progress Charts */}
        {progressData.length > 0 && (
          <View style={styles.chartsContainer}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Evolução</Text>
            <ProgressChart 
              title="Progresso de Hoje" 
              data={progressData} 
              type="progress" 
            />
          </View>
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
});